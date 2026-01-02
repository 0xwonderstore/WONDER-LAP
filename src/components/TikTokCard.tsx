import React, { useState } from 'react';
import { TikTokPost } from '../types';
import { Play, Heart, MessageCircle, Share2, ExternalLink, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useToastStore } from '../stores/toastStore';

interface TikTokCardProps {
  post: TikTokPost;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const getVideoId = (url: string): string | null => {
    try {
        const parts = url.split('/video/');
        if (parts.length > 1) {
            return parts[1].split('?')[0]; // Handle query params if any
        }
        return null;
    } catch (e) {
        return null;
    }
};

const TikTokCard: React.FC<TikTokCardProps> = ({ post }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getVideoId(post.url);
  
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useToastStore();
  const favorite = isFavorite(post.url); // Use post.url as the unique identifier

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(post.url);
    if (!favorite) {
        showToast(t('added_to_favorites'), 'added');
    } else {
        showToast(t('removed_from_favorites'), 'removed');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      
      {/* Header: Author Info */}
      <div className="p-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                <img 
                    src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} 
                    alt={post.author}
                    className="w-full h-full object-cover" 
                />
            </div>
            <div className="flex flex-col truncate">
                <h3 className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">
                    @{post.author}
                </h3>
                <span className="text-[10px] text-gray-500">
                    {format(new Date(post.createTime), 'MMM d, yyyy')}
                </span>
            </div>
        </div>
      </div>

      {/* Video Container */}
      <div 
        className="relative aspect-[9/16] bg-black cursor-pointer group overflow-hidden" 
        onClick={!isPlaying ? handlePlay : undefined}
      >
        {isPlaying && videoId ? (
            <iframe
                src={`https://www.tiktok.com/embed/v2/${videoId}`}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                scrolling="no"
                allow="autoplay; encrypted-media;"
                title="TikTok Video"
            ></iframe>
        ) : (
            <>
                <img 
                    src={post.cover} 
                    alt={post.desc || "TikTok Video"} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        // Fallback if cover fails (e.g. 403)
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                     <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center pl-1 border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                         <Play className="w-6 h-6 text-white fill-white" />
                     </div>
                </div>

                {/* Description Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
                    <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-md">
                        {post.desc}
                    </p>
                </div>
            </>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3 mt-auto">
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 px-1">
            <div className="flex items-center gap-1" title={t('tiktok_plays')}>
                 <Play size={14} />
                 <span className="text-[10px] font-bold">{formatNumber(post.playCount)}</span>
            </div>
            <div className="flex items-center gap-1" title={t('tiktok_likes')}>
                 <Heart size={14} />
                 <span className="text-[10px] font-bold">{formatNumber(post.diggCount)}</span>
            </div>
            <div className="flex items-center gap-1" title={t('tiktok_comments')}>
                 <MessageCircle size={14} />
                 <span className="text-[10px] font-bold">{formatNumber(post.commentCount)}</span>
            </div>
            <div className="flex items-center gap-1" title={t('tiktok_shares')}>
                 <Share2 size={14} />
                 <span className="text-[10px] font-bold">{formatNumber(post.shareCount)}</span>
            </div>
             
             {/* Functional Save Button */}
             <button 
                onClick={handleFavoriteClick}
                className={`flex items-center gap-1 group/save transition-all duration-300 ${favorite ? 'text-brand-primary' : 'text-gray-600 dark:text-gray-300 hover:text-brand-primary'}`}
                title={t('tiktok_saves') || "Saves"}
             >
                 <Bookmark 
                    size={14} 
                    className={`transition-all ${favorite ? 'fill-brand-primary text-brand-primary' : 'group-hover/save:scale-110'}`} 
                 />
                 <span className="text-[10px] font-bold">{formatNumber(post.collectCount)}</span>
             </button>
        </div>

        <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
            {t('view_on_tiktok') || "View on TikTok"}
            <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default TikTokCard;
