import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, ExternalLink } from 'lucide-react';

interface InstagramCardProps {
  post: {
    id: string;
    url: string;
    displayUrl: string;
    likesCount: number;
    commentsCount: number;
    language: string;
    postedAt: string;
    username: string;
  };
}

const InstagramCard = ({ post }: InstagramCardProps) => {
  const { t } = useTranslation();
  
  const formattedLikes = new Intl.NumberFormat('en-US', { notation: 'compact' }).format(post.likesCount);
  const formattedComments = new Intl.NumberFormat('en-US', { notation: 'compact' }).format(post.commentsCount);

  const proxiedImageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(post.displayUrl)}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full p-0.5">
          <div className="bg-white dark:bg-gray-800 rounded-full w-full h-full">
            {/* Placeholder for profile picture */}
          </div>
        </div>
        <div className="font-semibold text-gray-800 dark:text-gray-200">{post.username}</div>
      </div>
      
      <div className="aspect-[9/16]">
        <img src={proxiedImageUrl} alt={`Instagram post by ${post.username}`} className="w-full h-full object-cover" />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Heart className="w-6 h-6 text-red-500" />
              <span className="font-bold text-gray-800 dark:text-gray-200">{formattedLikes}</span>
              <span className="text-sm">{t('likes')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-gray-800 dark:text-gray-200">{formattedComments}</span>
               <span className="text-sm">{t('comments')}</span>
            </div>
          </div>
        </div>

        <a 
          href={post.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        >
          <ExternalLink className="w-5 h-5" />
          {t('view_on_instagram')}
        </a>
      </div>
    </div>
  );
};

export default InstagramCard;