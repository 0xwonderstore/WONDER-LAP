import React from 'react';
import { InstagramPost } from '../types';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InstagramPostModalProps {
  post: InstagramPost | null;
  onClose: () => void;
}

const InstagramPostModal: React.FC<InstagramPostModalProps> = ({ post, onClose }) => {
  const { t } = useTranslation();

  if (!post) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const renderMedia = () => {
    if (post.media_type === 'video') {
      return (
        <video controls className="w-full h-full object-contain" autoPlay>
          <source src={post.permalink + '?__a=1&__d=dis'} type="video/mp4" />
          {t('video_not_supported')}
        </video>
      );
    }
    return (
      <img
        src={post.permalink + 'media/?size=l'}
        alt={`Instagram post by ${post.username}`}
        className="w-full h-full object-contain"
      />
    );
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col md:flex-row relative">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-white bg-gray-800 bg-opacity-50 rounded-full p-1 z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-2/3 bg-black flex items-center justify-center">
           {renderMedia()}
        </div>
        
        <div className="w-full md:w-1/3 p-4 flex flex-col">
            <div className="flex items-center mb-4">
                <p className="font-bold text-lg dark:text-white">{post.username}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm dark:text-gray-300">
                <p><strong>{post.likes.toLocaleString()}</strong> {t('likes')}</p>
                <p><strong>{post.comments.toLocaleString()}</strong> {t('comments')}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(post.timestamp).toLocaleString()}</p>
            </div>
             <div className="mt-auto pt-4">
                 <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                    {t('view_on_instagram')}
                </a>
             </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramPostModal;
