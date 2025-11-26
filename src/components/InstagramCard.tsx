import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { InstagramPost } from '../types';
import { Heart, MessageCircle, Eye, EyeOff, PlayCircle, ExternalLink, Calendar, Bookmark } from 'lucide-react';
import { formatDate } from '../utils/productUtils';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useToastStore } from '../stores/toastStore';

interface InstagramCardProps {
  post: InstagramPost;
  onBlacklistToggle: (username: string) => void;
  isBlacklisted: boolean;
}

const InstagramCard = ({ post, onBlacklistToggle, isBlacklisted }: InstagramCardProps) => {
  const { t } = useTranslation();
  const [showVideo, setShowVideo] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useToastStore();
  
  const favorite = isFavorite(post.permalink);

  // Using weserv.nl for resizing and caching, requesting WebP and specific width for performance
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

  const isVideoVisible = post.media_type === 'video' && showVideo;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-800 relative z-10">
        <a href={`https://instagram.com/${post.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group/user">
          <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px] rounded-full">
             <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full p-[2px] overflow-hidden">
                <img 
                    src={`https://ui-avatars.com/api/?name=${post.username}&background=random&color=fff`} 
                    alt={post.username} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                />
             </div>
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover/user:text-pink-600 transition-colors">{post.username}</span>
        </a>
        <button 
            onClick={() => onBlacklistToggle(post.username)} 
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isBlacklisted ? t('unblock_user') : t('block_user')}
        >
          {isBlacklisted ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Media */}
      <div 
        className={`relative w-full cursor-pointer bg-gray-100 dark:bg-gray-900 overflow-hidden ${isVideoVisible ? 'aspect-[9/16]' : 'aspect-square'}`}
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
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                loading="lazy"
                decoding="async"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            {post.media_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                     <PlayCircle className="w-10 h-10 text-white fill-white/50" />
                </div>
              </div>
            )}
            
            {/* Hover Action */}
            <div className="absolute bottom-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-gray-800 dark:text-white shadow-lg flex items-center gap-2">
                    {t('view_on_instagram')} <ExternalLink className="w-3 h-3" />
                </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 flex flex-col flex-grow bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                    <Heart className="w-6 h-6 hover:text-gray-500 transition-colors cursor-pointer" />
                    <span className="text-sm font-bold">{post.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                    <MessageCircle className="w-6 h-6 hover:text-gray-500 transition-colors cursor-pointer" />
                    <span className="text-sm font-bold">{post.comments.toLocaleString()}</span>
                </div>
           </div>
           
           {/* Save/Bookmark Button */}
           <button 
                onClick={handleFavoriteClick}
                className={`p-1 rounded-md transition-all active:scale-90`}
                title={t('favorites')}
           >
               <Bookmark 
                  className={`w-6 h-6 transition-all duration-300 ${favorite ? 'fill-black text-black dark:fill-white dark:text-white' : 'text-gray-800 dark:text-gray-200 hover:text-gray-500'}`} 
                  strokeWidth={favorite ? 0 : 2}
               />
           </button>
        </div>
        
        {post.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                <span className="font-bold text-gray-900 dark:text-gray-100 mr-2">{post.username}</span>
                {post.caption}
            </p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
             <span className="uppercase">{formatDate(post.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(InstagramCard);
