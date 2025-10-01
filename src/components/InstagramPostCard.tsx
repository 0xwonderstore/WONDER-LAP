import React from 'react';
import { InstagramPost } from '../types';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { Heart, MessageCircle } from 'lucide-react';

interface InstagramPostCardProps {
  post: InstagramPost;
}

const InstagramPostCard: React.FC<InstagramPostCardProps> = ({ post }) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <a 
      href={post.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
    >
      <div className="relative">
        <img src={post.displayUrl} alt="Instagram Post" className="w-full h-auto object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
              {t[post.language] || post.language}
            </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-around text-gray-700">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="font-semibold">{post.likesCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="font-semibold">{post.commentsCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default InstagramPostCard;
