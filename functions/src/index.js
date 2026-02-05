const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");
const crypto = require("crypto");
const cors = require("cors")({ origin: true });
const { getStorage } = require("firebase-admin/storage");

admin.initializeApp();
const db = admin.firestore();
const bucket = getStorage().bucket();

// Constants
const ALLOWED_DOMAINS = ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.watch"];
const CACHE_COLLECTION = "shareCards";
const STORAGE_FOLDER = "share_thumbs";

// Helper: Validate URL
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return ALLOWED_DOMAINS.some((domain) => url.hostname.endsWith(domain));
  } catch (_) {
    return false;
  }
};

// Helper: Generate ID from Permalink
const generateId = (url) => {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);
};

// Helper: Download Image to Buffer
const downloadImage = async (url) => {
  try {
    const response = await axios({
      url,
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FacebookBot/1.0)",
      },
    });
    return Buffer.from(response.data, "binary");
  } catch (error) {
    console.error("Image download failed:", error.message);
    return null;
  }
};

/**
 * 1. resolveOgFromFacebook (GET)
 * Fetches OG data directly from Facebook without saving.
 */
exports.resolveOgFromFacebook = onRequest({ cors: true }, async (req, res) => {
  const url = req.query.url;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    const ogImage = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content");
    const ogTitle = $('meta[property="og:title"]').attr("content") || $("title").text();
    const ogDescription = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content");
    
    // Improved Video Detection
    let mediaType = "image";
    const ogType = $('meta[property="og:type"]').attr("content");
    if (
        url.includes("/reel/") || 
        url.includes("/videos/") || 
        url.includes("fb.watch") || 
        (ogType && ogType.includes("video"))
    ) {
        mediaType = "video";
    }

    // Check for Login Wall / Blocked
    const isLoginRequired = html.includes("Log In") || html.includes("login_page") || !ogTitle;

    res.json({
      title: ogTitle || "Facebook Post",
      description: ogDescription || "",
      thumbnail_url: ogImage || null,
      media_type: mediaType,
      blocked_or_login_required: isLoginRequired,
    });
  } catch (error) {
    console.error("Resolve Error:", error);
    res.status(500).json({ error: "Failed to resolve URL", details: error.message });
  }
});

/**
 * 2. createShareCard (POST)
 * Creates a persistent share card with a stored image.
 */
exports.createShareCard = onRequest({ cors: true, timeoutSeconds: 60, memory: "1GiB" }, async (req, res) => {
  // Handle CORS manually if needed or rely on 'cors: true' option
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }
  
  const { url } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid or missing Facebook URL" });
  }

  const id = generateId(url);
  const docRef = db.collection(CACHE_COLLECTION).doc(id);

  try {
    // 1. Check Cache
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      // Ensure we have a valid share_url format
      // Note: req.get('host') might be localhost in emulator, using process.env.GCLOUD_PROJECT for prod
      const host = req.get("x-forwarded-host") || req.get("host") || `${process.env.GCLOUD_PROJECT}.web.app`;
      const protocol = req.protocol === 'http' ? 'http' : 'https';
      
      return res.json({
        id,
        share_url: `${protocol}://${host}/s/${id}`,
        thumbnail_url: data.thumbnail_url, // Stored URL
        cached: true,
      });
    }

    // 2. Fetch Metadata
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    const rawOgImage = $('meta[property="og:image"]').attr("content");
    const title = $('meta[property="og:title"]').attr("content") || "Facebook Content";
    const description = $('meta[property="og:description"]').attr("content") || "Check out this post on Facebook";
    
    let mediaType = "image";
    if (url.includes("/reel/") || url.includes("/videos/") || url.includes("fb.watch")) {
        mediaType = "video";
    }

    let finalImageUrl = rawOgImage || null;

    // 3. Upload Image to Storage (If exists)
    if (rawOgImage) {
      const imageBuffer = await downloadImage(rawOgImage);
      if (imageBuffer) {
        const file = bucket.file(`${STORAGE_FOLDER}/${id}.jpg`);
        await file.save(imageBuffer, {
          metadata: { contentType: "image/jpeg" },
          public: true, // Make public
        });
        // Use the public URL or signed URL (Public is better for WhatsApp caching)
        finalImageUrl = file.publicUrl(); 
      }
    }

    // 4. Save to Firestore
    await docRef.set({
      permalink: url,
      title: title.substring(0, 200), // Limit length
      description: description.substring(0, 300),
      thumbnail_url: finalImageUrl,
      media_type: mediaType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const host = req.get("x-forwarded-host") || req.get("host") || `${process.env.GCLOUD_PROJECT}.web.app`;
    const protocol = req.protocol === 'http' ? 'http' : 'https';

    res.json({
      id,
      share_url: `${protocol}://${host}/s/${id}`,
      thumbnail_url: finalImageUrl,
      cached: false,
    });

  } catch (error) {
    console.error("Create Share Card Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

/**
 * 3. renderShareCard (GET HTML)
 * Serves static HTML with OG tags for WhatsApp/Crawlers.
 */
exports.renderShareCard = onRequest(async (req, res) => {
  // Extract ID from path: /s/<id>
  // Since this is rewritten from hosting, req.path might be /s/<id> or just /<id> depending on config
  // We assume the hosting rewrite sends the full path /s/<id>
  const parts = req.path.split("/");
  const id = parts[parts.length - 1]; 

  if (!id) {
    return res.status(404).send("Not Found");
  }

  try {
    const doc = await db.collection(CACHE_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).send(`
        <html>
            <head><title>Link Expired</title></head>
            <body><h1>Link Expired or Not Found</h1></body>
        </html>
      `);
    }

    const data = doc.data();
    
    // Safety: Escape HTML (basic)
    const escapeHtml = (text) => (text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    const safeTitle = escapeHtml(data.title);
    const safeDesc = escapeHtml(data.description);
    const safeImage = data.thumbnail_url || ""; // Fallback image if needed
    const safeUrl = data.permalink;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${safeTitle}</title>
        
        <!-- Open Graph Data -->
        <meta property="og:title" content="${safeTitle}" />
        <meta property="og:type" content="${data.media_type === 'video' ? 'video.other' : 'website'}" />
        <meta property="og:url" content="${safeUrl}" /> <!-- Point to actual FB link or this page? Usually this page for tracking, but user wants redirect? -->
        <!-- Actually, if we want WhatsApp to open FB directly when clicked, we can't fully control that. 
             WhatsApp opens the link shared. If they share /s/id, it opens /s/id.
             So we need a JS redirect in body. -->
        <meta property="og:image" content="${safeImage}" />
        <meta property="og:description" content="${safeDesc}" />
        <meta property="og:site_name" content="Facebook Share Preview" />
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${safeTitle}">
        <meta name="twitter:description" content="${safeDesc}">
        <meta name="twitter:image" content="${safeImage}">
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 400px; text-align: center; }
            img { max-width: 100%; border-radius: 8px; margin-bottom: 15px; }
            h1 { font-size: 18px; margin: 0 0 10px; color: #1c1e21; }
            p { font-size: 14px; color: #65676b; margin: 0 0 20px; }
            .btn { background: #1877f2; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block; }
            .btn:hover { background: #166fe5; }
        </style>
      </head>
      <body>
        <div class="card">
            ${safeImage ? `<img src="${safeImage}" alt="Preview" />` : ''}
            <h1>${safeTitle}</h1>
            <p>${safeDesc}</p>
            <a href="${safeUrl}" class="btn">Open on Facebook</a>
        </div>
        <script>
            // Optional: Auto-redirect after a delay
            // window.location.href = "${safeUrl}";
        </script>
      </body>
      </html>
    `;

    // Important: Cache Control for Social Bots
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.send(html);

  } catch (error) {
    console.error("Render Error:", error);
    res.status(500).send("Internal Error");
  }
});
