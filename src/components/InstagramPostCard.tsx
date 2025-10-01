import React from 'react';
import { InstagramPost } from '../types';

interface InstagramPostCardProps {
  post: InstagramPost;
}

const InstagramPostCard: React.FC<InstagramPostCardProps> = ({ post }) => {
  return (
    <a 
      href={post.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <img src={post.displayUrl} alt={post.caption} className="w-full h-auto object-cover" />
      <div className="p-4">
        <div className="flex items-center justify-between text-gray-600 text-sm">
          <span>{new Date(post.timestamp).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>{post.likesCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.892 8.892 0 01-2.936-.534l-1.933.966a1 1 0 01-1.232-1.232l.966-1.933A8.892 8.892 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.417 14.583a7.001 7.001 0 0011.166 0 7.001 7.001 0 00-11.166 0z" clipRule="evenodd" />
            </svg>
            <span>{post.commentsCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default InstagramPostCard;
