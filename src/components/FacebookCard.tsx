import React, { useState, memo, useEffect } from 'react';
import { Facebook, Heart, MessageCircle, Share2, Calendar, ExternalLink, PlayCircle, Layers, Film, Megaphone, Loader2, ImageOff, RefreshCw } from 'lucide-react';
import { FacebookPost } from '../types';
import { formatDate } from '../utils/productUtils';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useToastStore } from '../stores/toastStore';
import { WhatsappShareButton, WhatsappIcon } from 'react-share';

interface FacebookCardProps {
  post: FacebookPost;
}

const FacebookCard: React.FC<FacebookCardProps> = ({ post }) => {
  const { t } = useTranslation();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useToastStore();
  
  const favorite = isFavorite(post.permalink);
  const isReel = post.permalink?.includes('/reel/') || post.media_type === 'video';

  // State for Smart Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const fetchPreview = async (forceRefresh = false) => {
    if ((status === 'success' && !forceRefresh) || !post.permalink) return;

    setStatus('loading');

    try {
        // Use our new Cloud Function endpoint
        // Assuming the function is hosted at /createShareCard or the full URL
        const endpoint = '/createShareCard'; 
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: post.permalink })
        });

        if (!response.ok) throw new Error('Preview generation failed');

        const data = await response.json();
        
        if (data.thumbnail_url) {
            setPreviewImage(data.thumbnail_url);
            setShareUrl(data.share_url);
            setStatus('success');
        } else {
            // Fallback to client-side or error state
             setStatus('failed');
        }

    } catch (e) {
        console.error("Preview fetch error", e);
        setStatus('failed');
    }
  };

  // Initial Fetch on Mount if needed
  useEffect(() => {
    if (!previewImage) {
        // Small delay to prevent layout thrashing
        const timer = setTimeout(() => fetchPreview(), 500);
        return () => clearTimeout(timer);
    }
  }, [post.permalink]);


  const handleOpenDirectly = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(post.permalink, '_blank');
  };

  const handleFavoriteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      toggleFavorite(post.permalink);
      if (!e.target.checked) {
          showToast(t('removed_from_favorites'), 'removed');
      } else {
          showToast(t('added_to_favorites'), 'added');
      }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prefer the generated share URL if available (better for WhatsApp)
    let linkToCopy = shareUrl || post.permalink;
    
    // If we don't have a share URL yet, try to generate it quickly or just copy permalink
    if (!shareUrl) {
        try {
            // Optimistic copy of permalink first, or wait?
            // Let's trigger generation if missing, but copy permalink now to be responsive
             // In background, generate it for next time
             fetchPreview();
        } catch (e) {}
    }

    navigator.clipboard.writeText(linkToCopy);
    showToast('Link copied to clipboard!', 'success');
  };

  const handleAdLibrary = (e: React.MouseEvent) => {
      e.stopPropagation();
      const adUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(post.username)}&search_type=keyword_unordered&media_type=all`;
      window.open(adUrl, '_blank');
  };
  
  const handleRefreshPreview = (e: React.MouseEvent) => {
      e.stopPropagation();
      fetchPreview(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="animated-border-card h-full group bg-white dark:bg-[#1a1a1a] shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
    >
      <div className="card-content flex flex-col h-full">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between relative z-10 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#1877F2] p-[2px] shadow-md group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center text-[#1877F2]">
                        <Facebook size={22} fill="currentColor" />
                    </div>
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate leading-tight mb-0.5">
                        {post.username}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Facebook</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${isReel ? 'text-pink-500' : 'text-blue-500'}`}>
                            {isReel ? 'Reel' : 'Post'}
                        </span>
                    </div>
                </div>
            </div>
            <button 
                onClick={handleAdLibrary}
                className="p-2.5 text-gray-400 hover:text-blue-500 transition-colors bg-blue-50 dark:bg-blue-900/10 rounded-xl"
                title={t('view_ad_library')}
            >
                <Megaphone size={18} />
            </button>
        </div>

        {/* Media Container */}
        <div 
            className="relative w-full aspect-square bg-gray-100 dark:bg-[#111] overflow-hidden cursor-pointer group/media border-b border-gray-100 dark:border-gray-800"
            onClick={handleOpenDirectly}
        >
            {/* 1. Loading State */}
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-[#151515]">
                    <Loader2 size={32} className="text-blue-500 animate-spin" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
                        Resolving Preview...
                    </span>
                </div>
            )}

            {/* 2. Success State */}
            {status === 'success' && previewImage && (
                <>
                    <img 
                        src={previewImage} 
                        alt="Content" 
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/media:scale-105" 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover/media:opacity-20 transition-opacity" />
                    
                    {isReel && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl group-hover/media:scale-110 transition-transform">
                                <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                            </div>
                        </div>
                    )}

                    {/* Type Indicator */}
                    <div className="absolute top-3 right-3 z-20">
                         {isReel ? (
                             <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/20 text-white shadow-lg">
                                 <Film size={14} />
                             </div>
                         ) : (
                             <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/20 text-white shadow-lg">
                                 <Layers size={14} />
                             </div>
                         )}
                    </div>
                </>
            )}

            {/* 3. Failed State (Fallback Graphic) */}
            {status === 'failed' && (
                <div className="flex flex-col items-center justify-center h-full gap-3 bg-gray-50 dark:bg-[#151515] p-6 text-center group/failed">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-2">
                         {isReel ? <PlayCircle size={32} className="text-blue-400" /> : <ImageOff size={32} className="text-gray-400" />}
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Preview Not Available
                    </span>
                    <button 
                         onClick={handleRefreshPreview}
                         className="flex items-center gap-1.5 px-3 py-1.5 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw size={12} className="text-gray-500" />
                        <span className="text-[10px] text-gray-500 font-bold">Try Refreshing</span>
                    </button>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-5 flex flex-col flex-grow relative z-10">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 group/stat cursor-pointer">
                        <Heart size={20} className="text-gray-400 group-hover/stat:text-red-500 transition-colors" />
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 group/stat cursor-pointer">
                        <MessageCircle size={20} className="text-gray-400 group-hover/stat:text-blue-500 transition-colors" />
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{post.comments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 group/stat cursor-pointer">
                        <Share2 size={20} className="text-gray-400 group-hover/stat:text-green-500 transition-colors" />
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{post.shares.toLocaleString()}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2.5">
                     <button className="copy w-9 h-9 !border-gray-200 dark:!border-gray-700" onClick={handleCopyLink} title="Copy Share Link">
                        <span className="tooltip" data-text-initial="Copy" data-text-end="Done!"></span>
                        <div className="clipboard flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </div>
                    </button>

                    <div className="glass-btn-wrapper !w-9 !h-9 !border-gray-200 dark:!border-gray-700 cursor-pointer overflow-hidden flex items-center justify-center">
                        <WhatsappShareButton 
                            url={shareUrl || post.permalink} 
                            title={`Check out this post from ${post.username}`}
                            separator=" - "
                            className="flex items-center justify-center w-full h-full"
                        >
                            <WhatsappIcon size={20} round={true} bgStyle={{ fill: 'transparent' }} iconFillColor="#25D366" />
                        </WhatsappShareButton>
                    </div>

                    <label className="glass-btn-wrapper !w-9 !h-9 cursor-pointer !border-gray-200 dark:!border-gray-700">
                        <input type="checkbox" checked={favorite} onChange={handleFavoriteChange} className="hidden" />
                        <Heart size={18} className={`${favorite ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-400'}`} />
                    </label>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between text-gray-400">
                <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(post.timestamp)}</span>
                </div>
                <button 
                    onClick={handleOpenDirectly}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 rounded-lg group/btn hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group-hover/btn:text-blue-700">{t('open_post')}</span>
                    <ExternalLink size={10} className="text-blue-500" />
                </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(FacebookCard);
