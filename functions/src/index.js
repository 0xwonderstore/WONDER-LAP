const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");
const crypto = require("crypto");
const { getStorage } = require("firebase-admin/storage");

admin.initializeApp();
const db = admin.firestore();

// Helper to validate URLs
const isValidFacebookUrl = (url) => {
  try {
    const parsed = new URL(url);
    const allowed = [
      "facebook.com",
      "www.facebook.com",
      "m.facebook.com",
      "fb.watch",
      "web.facebook.com"
    ];
    // Check if hostname ends with any allowed domain
    return allowed.some(domain => parsed.hostname === domain || parsed.hostname.endsWith("." + domain));
  } catch (e) {
    return false;
  }
};

// 1. resolveOgFromFacebook (GET)
// Endpoint: GET /resolveOgFromFacebook?url=...
exports.resolveOgFromFacebook = onRequest({ cors: true }, async (req, res) => {
  const url = req.query.url;
  
  if (!url || !isValidFacebookUrl(url)) {
    res.status(400).json({ error: "Invalid or missing URL" });
    return;
  }

  try {
    // Fake user agent to avoid basic blocking
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000 // 10s timeout
    });

    const $ = cheerio.load(response.data);
    
    const ogImage = $('meta[property="og:image"]').attr('content') || 
                    $('meta[name="twitter:image"]').attr('content');
    const ogTitle = $('meta[property="og:title"]').attr('content') || 
                    $('title').text();
    const ogDescription = $('meta[property="og:description"]').attr('content') || 
                          $('meta[name="description"]').attr('content');
    const ogType = $('meta[property="og:type"]').attr('content');

    let mediaType = 'image';
    if (url.includes('/reel/') || url.includes('/videos/') || url.includes('fb.watch') || (ogType && ogType.includes('video'))) {
      mediaType = 'video';
    }

    // Heuristic for login wall
    const isBlocked = !ogImage && (ogTitle === 'Facebook' || ogTitle.includes('Log In'));

    res.json({
      thumbnail_url: ogImage || null,
      title: ogTitle || "",
      description: ogDescription || "",
      media_type: mediaType,
      status: "success",
      blocked_or_login_required: isBlocked
    });

  } catch (error) {
    logger.error("Error resolving Facebook URL", error);
    res.status(500).json({
      error: error.message,
      thumbnail_url: null,
      title: "Error loading preview",
      description: "",
      media_type: "unknown",
      status: "error"
    });
  }
});

// 2. createShareCard (POST)
// Endpoint: POST /createShareCard body: { "url": "..." }
exports.createShareCard = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { url } = req.body;

  if (!url || !isValidFacebookUrl(url)) {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  // Generate deterministic ID
  const id = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);
  const docRef = db.collection('shareCards').doc(id);

  try {
    // Check cache
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      // Ensure we return the full share URL
      res.json({
        id,
        share_url: `https://${req.get('host')}/s/${id}`,
        cached: true,
        ...data
      });
      return;
    }

    // Fetch Metadata (Server-side)
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const ogImage = $('meta[property="og:image"]').attr('content');
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text();
    const ogDescription = $('meta[property="og:description"]').attr('content');
    
    let storageImageUrl = null;

    // Download and Upload Image if exists
    if (ogImage) {
      try {
        const imageRes = await axios.get(ogImage, { responseType: 'arraybuffer', timeout: 5000 });
        const buffer = Buffer.from(imageRes.data, 'binary');
        
        if (buffer.length < 2 * 1024 * 1024) { // Limit 2MB
            const bucket = getStorage().bucket();
            const file = bucket.file(`share_thumbs/${id}.jpg`);
            
            await file.save(buffer, {
                metadata: { contentType: imageRes.headers['content-type'] || 'image/jpeg' }
            });

            await file.makePublic();
            storageImageUrl = file.publicUrl();
        }
      } catch (imgErr) {
        logger.warn("Failed to process image", imgErr);
        // Fallback to original URL if download fails
        storageImageUrl = ogImage; 
      }
    }

    const newData = {
      permalink: url,
      title: ogTitle || "Facebook Post",
      description: ogDescription || "",
      thumbnail_url: storageImageUrl || ogImage || null, // Prefer storage, fallback to original
      original_thumbnail_url: ogImage || null,
      media_type: (url.includes('/reel/') || url.includes('/videos/')) ? 'video' : 'image',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.set(newData);

    res.json({
      id,
      share_url: `https://${req.get('host')}/s/${id}`,
      cached: false,
      ...newData
    });

  } catch (error) {
    logger.error("Error creating share card", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. renderShareCard (GET HTML)
// Endpoint: /s/<id> (Rewrite handles this)
exports.renderShareCard = onRequest(async (req, res) => {
  // Extract ID from path: /s/<id>
  const pathParts = req.path.split('/');
  // pathParts[0] is empty, pathParts[1] is 's', pathParts[2] is ID
  // Sometimes depending on rewrite, req.path might be just /s/ID or /ID
  // Let's be robust
  let id = null;
  if (pathParts.includes('s')) {
      const index = pathParts.indexOf('s');
      if (index + 1 < pathParts.length) {
          id = pathParts[index + 1];
      }
  }

  if (!id) {
    res.status(404).send('Not Found - ID Missing');
    return;
  }

  try {
    const docSnap = await db.collection('shareCards').doc(id).get();
    
    if (!docSnap.exists) {
       // Fallback HTML
       res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Shared Content</title>
            <meta property="og:title" content="Content Not Found" />
        </head>
        <body>
            <h1>Content not found or expired.</h1>
        </body>
        </html>
       `);
       return;
    }

    const data = docSnap.data();
    const title = (data.title || "").replace(/"/g, '&quot;');
    const description = (data.description || "").replace(/"/g, '&quot;');
    const image = data.thumbnail_url || "";
    const url = data.permalink || "";

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          
          <title>${title}</title>
          <meta name="description" content="${description}">

          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://${req.get('host')}/s/${id}">
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${image}">

          <!-- Twitter -->
          <meta property="twitter:card" content="summary_large_image">
          <meta property="twitter:url" content="https://${req.get('host')}/s/${id}">
          <meta property="twitter:title" content="${title}">
          <meta property="twitter:description" content="${description}">
          <meta property="twitter:image" content="${image}">

          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f0f2f5; }
            .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; max-width: 500px; width: 90%; text-align: center; }
            .img-container { width: 100%; height: 300px; background: #eee; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            img { width: 100%; height: 100%; object-fit: cover; }
            .content { padding: 20px; }
            h1 { font-size: 18px; margin: 0 0 10px; color: #1c1e21; }
            p { color: #65676b; font-size: 14px; margin-bottom: 20px; }
            .btn { display: inline-block; background: #1877f2; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; }
            .btn:hover { background: #166fe5; }
          </style>
      </head>
      <body>
          <div class="card">
              <div class="img-container">
                  ${image ? `<img src="${image}" alt="Preview">` : '<span>No Image</span>'}
              </div>
              <div class="content">
                  <h1>${title}</h1>
                  <p>${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
                  <a href="${url}" class="btn">Open on Facebook</a>
              </div>
          </div>
      </body>
      </html>
    `;

    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.send(html);

  } catch (error) {
    logger.error("Render error", error);
    res.status(500).send("Internal Server Error");
  }
});
