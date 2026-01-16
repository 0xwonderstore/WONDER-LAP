import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { InstagramPost } from '../types';
import { Heart, MessageCircle, Eye, EyeOff, PlayCircle, ExternalLink, Bookmark, Share2, Trash2 } from 'lucide-react';
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
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      toggleFavorite(post.permalink);
      if (!favorite) {
          showToast(t('added_to_favorites'), 'added');
      } else {
          showToast(t('removed_from_favorites'), 'removed');
      }
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
    <div className="group bg-white dark:bg-[#1a1a1a] rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-800/50 h-full flex flex-col relative">
      
      {/* Hide Post Button (Quick Access) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onHidePost(post.permalink); }}
        className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm border border-white/20"
        title="Hide this post"
      >
        <Trash2 className="w-4 h-4" />
      </button>

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
      <div className="p-4 flex flex-col flex-grow">
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
           
           <div className="flex items-center gap-2">
             <button 
                  onClick={handleOpenDirectly}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 hover:text-pink-500 transition-all hover:scale-110"
                  title="Open Post"
             >
                 <Share2 className="w-5 h-5" />
             </button>
             <button 
                  onClick={handleFavoriteClick}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 transition-all active:scale-90 hover:scale-110"
                  title={t('favorites')}
             >
                 <Bookmark 
                    className={`w-5 h-5 transition-all duration-300 ${favorite ? 'fill-gray-900 text-gray-900 dark:fill-white dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`} 
                    strokeWidth={favorite ? 0 : 2}
                 />
             </button>
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
  );
};

export default memo(InstagramCard);
