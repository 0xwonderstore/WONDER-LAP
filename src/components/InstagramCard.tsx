import { InstagramPost } from '../types';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, PlayCircle, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '../utils/productUtils';

interface InstagramCardProps {
  post: InstagramPost;
  onBlacklistToggle: (username: string) => void;
  isBlacklisted: boolean;
}

const InstagramCard = ({ post, onBlacklistToggle, isBlacklisted }: InstagramCardProps) => {
  const { t } = useTranslation();
  
  const generatedThumbnailUrl = `${post.permalink}media/?size=l`;
  const thumbnailUrl = `https://images.weserv.nl/?url=${encodeURIComponent(generatedThumbnailUrl)}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-sm mx-auto font-sans transition-all duration-300">
      {/* Card Header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <a href={`https://instagram.com/${post.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:underline">{post.username}</span>
        </a>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBlacklistToggle(post.username); }} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={isBlacklisted ? t('unblock_user') : t('block_user')}>
          {isBlacklisted ? <EyeOff className="w-5 h-5 text-red-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
        </button>
      </div>

      {/* Media Content */}
      <div className="relative w-full aspect-square cursor-pointer">
        <img src={thumbnailUrl} alt={t('view_on_instagram')} className="w-full h-full object-cover" />
        {post.media_type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <PlayCircle className="w-16 h-16 text-white opacity-80" />
          </div>
        )}
      </div>

      {/* Card Body & Footer */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
           <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
           <MessageCircle className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </div>
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {post.likes.toLocaleString()} {t('likes')}
        </div>
         <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:underline my-2 block">
            {t('view_on_instagram')}
          </a>
        <div className="text-xs text-gray-400 dark:text-gray-500 uppercase">
          {formatDate(post.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default InstagramCard;
