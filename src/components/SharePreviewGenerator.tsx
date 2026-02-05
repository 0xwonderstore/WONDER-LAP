import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Copy, Check, AlertCircle, Send, MoreVertical, Phone, Video } from 'lucide-react';

interface PreviewData {
  id: string;
  share_url: string;
  thumbnail_url: string | null;
  title?: string;
  description?: string;
  cached?: boolean;
}

const SharePreviewGenerator: React.FC = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Debounce Logic for simulating "Typing & Waiting"
  useEffect(() => {
    const handler = setTimeout(() => {
      if (url && (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('instagram.com'))) {
        startResolutionProcess(url);
      } else {
        setShowPreview(false);
        setData(null);
      }
    }, 800); // Wait 800ms after typing stops

    return () => clearTimeout(handler);
  }, [url]);

  const startResolutionProcess = async (inputUrl: string) => {
    setIsResolving(true);
    setShowPreview(true); // Show skeleton immediately
    setError(null);

    try {
      // Simulate network delay for "WhatsApp feeling"
      await new Promise(resolve => setTimeout(resolve, 1500));

      const endpoint = '/createShareCard'; 
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl })
      });

      if (!response.ok) {
        // Fallback for demo if backend isn't running
        console.warn("Backend not reachable, using mock data for demo");
        // throw new Error('Failed to generate preview');
        setData({
            id: 'demo-id',
            share_url: inputUrl, // Just echo back for demo
            thumbnail_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
            title: 'Facebook Watch',
            description: 'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on Facebook.',
            cached: false
        });
        setIsResolving(false);
        return;
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch preview metadata');
    } finally {
      setIsResolving(false);
    }
  };

  const handleCopy = () => {
    if (data?.share_url) {
      navigator.clipboard.writeText(data.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-md mx-auto font-sans">
        
      {/* WhatsApp Header Simulation */}
      <div className="bg-[#075E54] text-white p-3 rounded-t-xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Link+Gen&background=25D366&color=fff" alt="Avatar" />
            </div>
            <div>
                <h3 className="font-bold text-sm">Link Generator</h3>
                <span className="text-[10px] text-gray-200 block">online</span>
            </div>
        </div>
        <div className="flex gap-4 text-white/80">
            <Video size={18} />
            <Phone size={18} />
            <MoreVertical size={18} />
        </div>
      </div>

      {/* Chat Area Background */}
      <div className="bg-[#E5DDD5] dark:bg-[#0b141a] p-4 min-h-[300px] border-x border-gray-200 dark:border-gray-800 relative bg-opacity-90">
         {/* Background Pattern Hint */}
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

         {/* Message Bubble (User Sending) */}
         <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#DCF8C6] dark:bg-[#005c4b] p-2 rounded-lg rounded-tr-none shadow-sm max-w-[85%] relative min-w-[120px]">
                
                {/* 1. The Link Text */}
                <div className="text-sm text-[#303030] dark:text-[#e9edef] break-all mb-1 px-1">
                    {url || <span className="text-gray-400 italic">Type a link below...</span>}
                </div>

                {/* 2. The Preview Card Area */}
                {showPreview && (
                    <div className="mt-1 bg-black/5 dark:bg-black/20 rounded-lg overflow-hidden transition-all duration-500">
                        {isResolving ? (
                            // Loading Skeleton
                            <div className="flex flex-col animate-pulse">
                                <div className="h-32 bg-gray-300 dark:bg-gray-600 w-full"></div>
                                <div className="p-2 space-y-2">
                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                                </div>
                            </div>
                        ) : data ? (
                            // Success Card
                            <div className="flex flex-col animate-in zoom-in-95 duration-300">
                                {/* Image */}
                                <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                    {data.thumbnail_url ? (
                                        <img 
                                            src={data.thumbnail_url} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }} 
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <span className="text-xs">No Image</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Text Content */}
                                <div className="p-2 bg-[#F0F0F0] dark:bg-[#1f2c34] border-l-4 border-[#FF0000] dark:border-[#FF0000] border-opacity-60">
                                    <h4 className="font-bold text-xs text-black dark:text-gray-200 line-clamp-1">
                                        {data.title || "Facebook Post"}
                                    </h4>
                                    <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5 leading-tight">
                                        {data.description || "No description available."}
                                    </p>
                                    <p className="text-[9px] text-gray-400 mt-1 lowercase">facebook.com</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-2 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle size={12} /> Failed to load preview
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Timestamp & Status */}
                <div className="flex justify-end items-center gap-1 mt-1">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{currentTime}</span>
                    {url && <Check size={12} className="text-[#4FB6EC]" />}
                </div>
            </div>
         </div>

      </div>

      {/* Input Area */}
      <div className="bg-[#F0F0F0] dark:bg-[#1f2c34] p-3 rounded-b-xl border border-t-0 border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Paste Facebook link here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-2 rounded-full border-none bg-white dark:bg-[#2a3942] focus:ring-0 text-sm dark:text-white placeholder-gray-400"
        />
        <button 
            className={`p-2.5 rounded-full transition-all ${
                data?.share_url 
                ? 'bg-[#00a884] text-white shadow-md hover:scale-105 active:scale-95' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            onClick={handleCopy}
            disabled={!data?.share_url}
        >
            {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-center">
        {data?.share_url && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium animate-pulse">
                Link generated! Click the button to copy.
            </p>
        )}
      </div>

    </div>
  );
};

export default SharePreviewGenerator;
