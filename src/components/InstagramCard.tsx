import { useTranslation } from 'react-i18next';
import { InstagramPost } from '../types';
import { Heart, MessageCircle } from 'lucide-react';
import { formatDate } from '../utils/productUtils';

interface InstagramCardProps {
  post: InstagramPost;
}

const InstagramCard = ({ post }: InstagramCardProps) => {
  const { t } = useTranslation();

  // Using a proxy for Instagram images to avoid potential blocking issues.
  const imageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(post.media_url)}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-sm mx-auto font-sans">
      {/* Card Header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <a
          href={`https://instagram.com/${post.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          {/* Placeholder for avatar */}
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:underline">
            {post.username}
          </span>
        </a>
      </div>

      {/* Media Content */}
      <div className="bg-black">
        {post.media_type === 'video' ? (
          <video
            controls
            className="w-full aspect-[9/16] object-contain"
            src={post.media_url}
            playsInline
            preload="metadata"
          >
            <source src={post.media_url} type="video/mp4" />
            {t('video_not_supported')}
          </video>
        ) : (
          <div className="w-full aspect-square flex items-center justify-center">
            <img
              src={imageUrl}
              alt={t('view_on_instagram')}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Card Body & Footer */}
      <div className="p-3">
        {/* Action Icons */}
        <div className="flex items-center gap-4 mb-2">
           <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
           <MessageCircle className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </div>

        {/* Likes and Comments Count */}
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {post.likes.toLocaleString()} {t('likes')}
        </div>
        
         <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline my-2 block"
          >
            {t('view_on_instagram')}
          </a>

        {/* Timestamp */}
        <div className="text-xs text-gray-400 dark:text-gray-500 uppercase">
          {formatDate(post.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default InstagramCard;
