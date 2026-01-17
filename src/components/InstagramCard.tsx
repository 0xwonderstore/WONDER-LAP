import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { InstagramPost } from '../types';
import { Heart, MessageCircle, Eye, EyeOff, PlayCircle, ExternalLink } from 'lucide-react';
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
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useToastStore();
  const { setFilters, setCurrentPage } = useInstagramPageStore();
  
  const favorite = isFavorite(post.permalink);

  const generatedThumbnailUrl = `${post.permalink}media/?size=l`;
  const thumbnailUrl = `https://images.weserv.nl/?url=${encodeURIComponent(generatedThumbnailUrl)}&w=400&output=webp&q=80`;
  
  const embedUrl = `${post.permalink}embed/?omitsuper=1`;

  const handleMediaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (post.media_type === 'video') {
      setShowVideo(true);
    } else {
      window.open(post.permalink, '_blank');
    }
  };
  
  const handleFavoriteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      // e.preventDefault(); // Don't prevent default on checkbox change
      toggleFavorite(post.permalink);
      if (!e.target.checked) {
          showToast(t('removed_from_favorites'), 'removed');
      } else {
          showToast(t('added_to_favorites'), 'added');
      }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    // e.preventDefault();
    navigator.clipboard.writeText(post.permalink);
    // showToast(t('link_copied'), 'success');
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFilters({ username: post.username });
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDirectly = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(post.permalink, '_blank');
  };

  const isVideoVisible = post.media_type === 'video' && showVideo;

  return (
    <div className="animated-border-card h-full">
      <div className="card-content flex flex-col h-full bg-white dark:bg-[#1a1a1a]">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between relative z-10">
            <button 
            onClick={handleUsernameClick} 
            className="flex items-center gap-3 group/user text-left"
            >
            <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px] rounded-full shadow-sm group-hover/user:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white dark:bg-[#1a1a1a] rounded-full p-[2px] overflow-hidden">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${post.username}&background=random&color=fff`} 
                        alt={post.username} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                    />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover/user:text-pink-500 transition-colors leading-tight">{post.username}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Instagram</span>
            </div>
            </button>
            <div className="flex items-center gap-1">
            <button 
                onClick={(e) => { e.stopPropagation(); onBlacklistToggle(post.username); }} 
                className="text-gray-400 hover:text-red-500 transition-all duration-300 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                title={isBlacklisted ? t('unblock_user') : t('block_user')}
            >
                {isBlacklisted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            </div>
        </div>

        {/* Media Container */}
        <div 
            className={`relative w-[calc(100%-1rem)] mx-auto rounded-2xl cursor-pointer bg-gray-100 dark:bg-gray-900 overflow-hidden transition-all duration-500 group-hover:shadow-lg ${isVideoVisible ? 'aspect-[9/16]' : 'aspect-square'}`}
            onClick={handleMediaClick}
        >
            {isVideoVisible ? (
            <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                scrolling="no"
                title={t('view_on_instagram')}
            />
            ) : (
            <>
                <img 
                    src={thumbnailUrl} 
                    alt={post.caption || t('view_on_instagram')} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" 
                    loading="lazy"
                    decoding="async"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {post.media_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center pl-1 border border-white/30 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <PlayCircle className="w-8 h-8 text-white fill-white/50" />
                    </div>
                </div>
                )}
                
                {/* Quick Actions Over Media */}
                <div className="absolute bottom-3 right-3 left-3 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                    onClick={handleOpenDirectly}
                    className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md px-4 py-2 rounded-xl text-[11px] font-bold text-gray-900 dark:text-white shadow-xl flex items-center gap-2 border border-white/20 hover:bg-white transition-colors"
                    >
                        {t('view_on_instagram')} <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>
            </>
            )}
        </div>

        {/* Footer / Interaction */}
        <div className="p-4 flex flex-col flex-grow relative z-10">
            <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-5">
                    <div className="flex flex-col items-center">
                        <Heart className="w-6 h-6 text-gray-800 dark:text-gray-200 hover:text-red-500 transition-colors cursor-pointer" />
                        <span className="text-[11px] font-bold mt-0.5 text-gray-600 dark:text-gray-400">{post.likes >= 1000 ? (post.likes/1000).toFixed(1) + 'k' : post.likes}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <MessageCircle className="w-6 h-6 text-gray-800 dark:text-gray-200 hover:text-blue-500 transition-colors cursor-pointer" />
                        <span className="text-[11px] font-bold mt-0.5 text-gray-600 dark:text-gray-400">{post.comments}</span>
                    </div>
            </div>
            
            <div className="flex items-center gap-3">
                 <button className="copy" onClick={handleCopyLink}>
                    <span className="tooltip" data-text-initial="Copy link" data-text-end="Copied!"></span>
                    <span className="clipboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                           <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </span>
                    <span className="checkmark">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                </button>
                <div onClick={(e) => e.stopPropagation()} className="glass-btn-wrapper">
                    <label className="ui-bookmark relative z-20 flex items-center justify-center w-full h-full">
                        <input type="checkbox" checked={favorite} onChange={handleFavoriteChange} />
                        <div className="bookmark">
                            <svg viewBox="0 0 32 32" className="w-full h-full p-0.5">
                            <path d="M6 4C4.89543 4 4 4.89543 4 6V28L16 18L28 28V6C28 4.89543 27.1046 4 26 4H6Z" />
                            </svg>
                        </div>
                    </label>
                </div>
            </div>
            </div>
            
            {post.caption && (
                <div className="mb-4">
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        <button onClick={handleUsernameClick} className="font-bold text-gray-900 dark:text-gray-100 mr-2 hover:text-pink-600 transition-colors inline-block">{post.username}</button>
                        {post.caption}
                    </p>
                </div>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100/50 dark:border-gray-800/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{formatDate(post.timestamp)}</span>
                <button 
                    onClick={handleOpenDirectly}
                    className="text-[11px] font-bold text-pink-600 dark:text-pink-500 hover:underline"
                >
                    {t('view_original') || 'View original'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default memo(InstagramCard);
