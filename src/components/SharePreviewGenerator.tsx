import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';

// Example UI Component
export const SharePreviewGenerator = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    id: string;
    share_url: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
  } | null>(null);
  const [error, setError] = useState('');

  const generatePreview = async (inputUrl: string) => {
    if (!inputUrl) return;
    
    setLoading(true);
    setError('');
    setPreview(null);

    try {
      // In development, this URL might point to your emulator or deployed function
      // In production, use relative path if on same domain or full URL
      // For now assume relative path proxy or full URL
      const endpoint = '/createShareCard'; // Adjust this based on your setup (e.g. cloud function URL)
      
      // Note: You might need to use the full URL of your Cloud Function if not proxied
      // const endpoint = 'https://us-central1-YOUR-PROJECT.cloudfunctions.net/createShareCard';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl })
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Error creating preview');
    } finally {
      setLoading(false);
    }
  };

  // Debounce the API call
  const debouncedGenerate = useCallback(
    debounce((nextUrl: string) => generatePreview(nextUrl), 600),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    if (val.includes('facebook.com') || val.includes('fb.watch')) {
        debouncedGenerate(val);
    }
  };

  const copyToClipboard = () => {
    if (preview?.share_url) {
      navigator.clipboard.writeText(preview.share_url);
      alert('Link copied!');
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-3">Facebook Share Link Generator</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Facebook Post URL
        </label>
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="https://www.facebook.com/..."
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {loading && (
        <div className="text-blue-600 text-sm animate-pulse">
          Generating preview...
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}

      {preview && !loading && (
        <div className="mt-4 border-t pt-4">
          <div className="bg-gray-50 rounded-lg overflow-hidden border">
            {preview.thumbnail_url && (
              <img 
                src={preview.thumbnail_url} 
                alt="Preview" 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-3">
              <h4 className="font-bold text-sm truncate">{preview.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                {preview.description}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex gap-2">
            <input 
              readOnly 
              value={preview.share_url} 
              className="flex-1 bg-gray-100 p-2 text-sm rounded border"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Share this link on WhatsApp to see the preview.
          </p>
        </div>
      )}
    </div>
  );
};
