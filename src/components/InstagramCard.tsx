import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstagramPost } from '../types';
import { Heart, MessageCircle, Eye, EyeOff, PlayCircle } from 'lucide-react';
import { formatDate } from '../utils/productUtils';

interface InstagramCardProps {
  post: InstagramPost;
  onBlacklistToggle: (username: string) => void;
  isBlacklisted: boolean;
}

const InstagramCard = ({ post, onBlacklistToggle, isBlacklisted }: InstagramCardProps) => {
  const { t } = useTranslation();
  const [showVideo, setShowVideo] = useState(false);

  // Automatically generate the thumbnail URL from the permalink
  const generatedThumbnailUrl = `${post.permalink}media/?size=l`; // 'l' for large, 'm' for medium, 't' for thumb
  
  // Use the generated URL, proxied to prevent hotlinking issues
  const thumbnailUrl = `https://images.weserv.nl/?url=${encodeURIComponent(generatedThumbnailUrl)}`;
  
  const embedUrl = `${post.permalink}embed`;

  const handleMediaClick = () => {
    if (post.media_type === 'video') {
      setShowVideo(true);
    } else {
      window.open(post.permalink, '_blank');
    }
  };

  const isVideoVisible = post.media_type === 'video' && showVideo;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-sm mx-auto font-sans transition-all duration-300">
      {/* Card Header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <a href={`https://instagram.com/${post.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:underline">{post.username}</span>
        </a>
        <button onClick={() => onBlacklistToggle(post.username)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={isBlacklisted ? t('unblock_user') : t('block_user')}>
          {isBlacklisted ? <EyeOff className="w-5 h-5 text-red-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
        </button>
      </div>

      {/* Media Content */}
      <div className={`bg-black w-full transition-all duration-300 ${isVideoVisible ? 'aspect-[9/16]' : 'aspect-square'}`}>
        {isVideoVisible ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            title={t('view_on_instagram')}
          ></iframe>
        ) : (
          <div className="relative w-full h-full cursor-pointer" onClick={handleMediaClick}>
            <img src={thumbnailUrl} alt={t('view_on_instagram')} className="w-full h-full object-cover" />
            {post.media_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <PlayCircle className="w-16 h-16 text-white opacity-80" />
              </div>
            )}
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
