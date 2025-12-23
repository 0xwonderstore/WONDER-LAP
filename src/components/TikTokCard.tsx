import React, { memo } from 'react';
import { TikTokPost } from '../types';
import { Heart, MessageCircle, Share2, Bookmark, Play, Calendar, ExternalLink, Music, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/productUtils';
import { useTranslation } from 'react-i18next';

interface TikTokCardProps {
  post: TikTokPost;
}

const TikTokCard: React.FC<TikTokCardProps> = ({ post }) => {
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full group"
    >
      {/* Header: Author Info */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
        <div className="flex items-center gap-3">
          <img 
            src={post.authorAvatar} 
            alt={post.author} 
            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-sm object-cover"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate max-w-[120px]">
                {post.author}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">@{post.author}</span>
          </div>
        </div>
        {post.isAd && (
             <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                 Ad
             </span>
        )}
      </div>

      {/* Video Preview Area */}
      <div className="relative aspect-[9/16] bg-black group-hover:shadow-inner transition-all overflow-hidden">
        <img 
            src={post.cover} 
            alt="Video Cover" 
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
        />
        
        {/* Overlay Stats on Video */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Diversification Tag */}
        {post.diversification && (
            <div className="absolute top-3 left-3">
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg border border-white/10">
                    <Tag size={10} />
                    {post.diversification}
                </span>
            </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 text-white">
             <p className="text-sm line-clamp-2 mb-3 font-medium text-shadow-sm">{post.desc}</p>
             
             {post.music && (
                <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
                    <Music size={12} className="animate-spin-slow" />
                    <span className="truncate max-w-[200px]">{post.music}</span>
                </div>
             )}
        </div>

        {/* Play Button Overlay */}
        <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[1px]"
        >
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:scale-110 transition-transform">
                <Play size={32} fill="currentColor" />
            </div>
        </a>
      </div>

      {/* Footer: Detailed Stats */}
      <div className="p-4 grid grid-cols-3 gap-y-4 gap-x-2 text-center bg-white dark:bg-gray-800 relative z-10">
           {/* Play Count */}
           <div className="flex flex-col items-center gap-1 group/stat" title="Views">
               <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover/stat:text-brand-primary group-hover/stat:bg-brand-primary/10 transition-colors">
                   <Play size={16} />
               </div>
               <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatNumber(post.playCount)}</span>
           </div>
           
           {/* Likes */}
           <div className="flex flex-col items-center gap-1 group/stat" title="Likes">
               <div className="p-2 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-500 group-hover/stat:bg-pink-100 dark:group-hover/stat:bg-pink-900/40 transition-colors">
                   <Heart size={16} />
               </div>
               <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatNumber(post.diggCount)}</span>
           </div>

           {/* Comments */}
           <div className="flex flex-col items-center gap-1 group/stat" title="Comments">
               <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover/stat:bg-blue-100 dark:group-hover/stat:bg-blue-900/40 transition-colors">
                   <MessageCircle size={16} />
               </div>
               <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatNumber(post.commentCount)}</span>
           </div>

           {/* Shares */}
           <div className="flex flex-col items-center gap-1 group/stat" title="Shares">
               <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 group-hover/stat:bg-green-100 dark:group-hover/stat:bg-green-900/40 transition-colors">
                   <Share2 size={16} />
               </div>
               <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatNumber(post.shareCount)}</span>
           </div>

           {/* Saves */}
           <div className="flex flex-col items-center gap-1 group/stat" title="Saves">
               <div className="p-2 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 group-hover/stat:bg-yellow-100 dark:group-hover/stat:bg-yellow-900/40 transition-colors">
                   <Bookmark size={16} />
               </div>
               <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatNumber(post.collectCount)}</span>
           </div>

            {/* Date */}
            <div className="flex flex-col items-center gap-1 group/stat" title="Date">
               <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover/stat:text-gray-800 dark:group-hover/stat:text-gray-200 transition-colors">
                   <Calendar size={16} />
               </div>
               <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1">
                   {formatDate(post.createTime)}
               </span>
           </div>
      </div>
    </motion.div>
  );
};

export default memo(TikTokCard);
