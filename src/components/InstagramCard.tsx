import { useState, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InstagramPost } from '../types';
import { Heart, MessageCircle, Eye, EyeOff, PlayCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/productUtils';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useToastStore } from '../stores/toastStore';
import { useInstagramPageStore } from '../stores/instagramPageStore';

interface InstagramCardProps {
  post: InstagramPost;
  onBlacklistToggle: (username: string) => void;
  isBlacklisted: boolean;
  onHidePost: (permalink: string) => void;
}

const InstagramCard = ({ post, onBlacklistToggle, isBlacklisted, onHidePost }: InstagramCardProps) => {
  const { t } = useTranslation();
  const [showVideo, setShowVideo] = useState(false);
  const [retryStep, setRetryStep] = useState(0); 
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useToastStore();
  const { setFilters, setCurrentPage } = useInstagramPageStore();
  
  const favorite = isFavorite(post.permalink);

  // --- Robust Image Resolver ---
  const imageUrls = useMemo(() => {
    // Extract shortcode from permalink (e.g., DITvv57uLqK)
    const match = post.permalink?.match(/\/p\/([^/]+)/);
    const shortcode = match ? match[1] : null;
    
    if (!shortcode) return [];

    const base = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    
    return [
      // 1. Direct link with no-referrer
      base,
      // 2. DuckDuckGo Proxy (Very strong bypass)
      `https://proxy.duckduckgo.com/iu/?u=${encodeURIComponent(base)}`,
      // 3. Weserv Proxy
      `https://images.weserv.nl/?url=${encodeURIComponent(base.replace('https://', ''))}&w=600&output=webp`,
      // 4. Cloudinary Fallback
      `https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto,w_600/${base}`
    ];
  }, [post.permalink]);

  const handleImageError = () => {
    if (retryStep < imageUrls.length - 1) {
      setRetryStep(prev => prev + 1);
    }
  };

  const handleMediaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (post.media_type?.toLowerCase() === 'video') {
      setShowVideo(true);
    } else {
      window.open(post.permalink, '_blank');
    }
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

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.permalink);
  };

  const handleOpenDirectly = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(post.permalink, '_blank');
  };

  const isVideoVisible = post.media_type?.toLowerCase() === 'video' && showVideo;
  const embedUrl = `${post.permalink?.split('?')[0]}embed/?omitsuper=1`;

  return (
    <div className="animated-border-card h-full">
      <div className="card-content flex flex-col h-full bg-white dark:bg-[#1a1a1a]">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                    <div className="w-full h-full bg-white dark:bg-[#1a1a1a] rounded-full p-[1px] overflow-hidden">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${post.username}&background=random&color=fff`} 
                            alt={post.username} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 dark:text-gray-100 leading-tight">@{post.username}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Instagram</span>
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onBlacklistToggle(post.username); }} 
                className="text-gray-300 hover:text-red-500 transition-colors p-2"
            >
                {isBlacklisted ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>

        {/* Media Area */}
        <div 
            className={`relative w-[calc(100%-1rem)] mx-auto rounded-2xl cursor-pointer bg-gray-50 dark:bg-[#111] overflow-hidden group/media ${isVideoVisible ? 'aspect-[9/16]' : 'aspect-square'}`}
            onClick={handleMediaClick}
        >
            {isVideoVisible ? (
                <iframe src={embedUrl} className="w-full h-full" frameBorder="0" scrolling="no" />
            ) : retryStep < imageUrls.length ? (
                <>
                    <img 
                        key={retryStep} 
                        src={imageUrls[retryStep]} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105" 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                    />
                    {post.media_type?.toLowerCase() === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-2xl">
                                <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <AlertCircle size={40} className="text-gray-300" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-tight">
                        Image Restricted by Instagram
                    </p>
                    <button 
                        onClick={handleOpenDirectly}
                        className="mt-2 bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                        {t('open_post') || 'Open Post'}
                    </button>
                </div>
            )}
            
            {/* Action Bar Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover/media:translate-y-0 transition-transform duration-300">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-1.5">
                        <RefreshCw size={12} className={retryStep > 0 ? "animate-spin" : ""} />
                        {retryStep > 0 ? "Proxy Active" : "Direct Link"}
                    </span>
                    <button 
                        onClick={handleOpenDirectly}
                        className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] text-white font-bold border border-white/10 hover:bg-white/20 transition-colors"
                    >
                        {t('view_on_instagram')} <ExternalLink size={10} />
                    </button>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex flex-col flex-grow relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Heart size={20} className="text-gray-800 dark:text-gray-200" />
                        <span className="text-xs font-black text-gray-700 dark:text-gray-300">{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MessageCircle size={20} className="text-gray-800 dark:text-gray-200" />
                        <span className="text-xs font-black text-gray-700 dark:text-gray-300">{post.comments.toLocaleString()}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="copy" onClick={handleCopyLink} title="Copy Link">
                        <span className="tooltip" data-text-initial="Copy" data-text-end="Done!"></span>
                        <div className="clipboard flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </div>
                    </button>
                    <label className="glass-btn-wrapper !w-9 !h-9 cursor-pointer">
                        <input type="checkbox" checked={favorite} onChange={handleFavoriteChange} className="hidden" />
                        <Heart size={18} className={`${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </label>
                </div>
            </div>
            
            {post.caption && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                    {post.caption}
                </p>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{formatDate(post.timestamp)}</span>
                <button 
                    onClick={handleOpenDirectly}
                    className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                >
                    {t('open_post') || 'Open Post'} <ExternalLink size={10} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default memo(InstagramCard);
