import React from 'react';
import { InstagramPost } from '../types';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Calendar } from 'lucide-react';

interface InstagramPostCardProps {
  post: InstagramPost;
}

const InstagramPostCard: React.FC<InstagramPostCardProps> = ({ post }) => {
  const { t, i18n } = useTranslation();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://placehold.co/1080x1080/777/FFFFFF/png?text=Image+Failed`;
  };

  const proxiedImageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(post.displayUrl)}`;

  const formattedDate = post.postedAt
    ? new Date(post.postedAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'No Date';

  return (
    <a 
      href={post.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block bg-white dark:bg-dark-surface rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group border border-light-border dark:border-dark-border"
    >
      <div className="relative">
        <img 
          src={proxiedImageUrl} 
          alt="Instagram Post" 
          className="w-full aspect-square object-cover bg-gray-100"
          onError={handleImageError}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
              {t(post.language) || post.language}
            </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-light-text-primary dark:text-dark-text-primary">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-semibold">{post.likesCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-light-text-primary dark:text-dark-text-primary">
              <MessageCircle className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">{post.commentsCount.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
            <Calendar className="w-4 h-4" />
            <span className="font-mono">{formattedDate}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default InstagramPostCard;
