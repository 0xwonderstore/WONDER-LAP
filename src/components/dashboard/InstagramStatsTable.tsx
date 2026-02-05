import React from 'react';
import { motion } from 'framer-motion';
import { InstagramPost, LanguageItem } from '../../types';
import { format, parseISO } from 'date-fns';
import { Instagram, Calendar, FileText, Globe } from 'lucide-react';

interface InstagramStatsTableProps {
  posts: InstagramPost[];
  t: any;
}

const InstagramStatsTable: React.FC<InstagramStatsTableProps> = ({ posts, t }) => {
  const stats = React.useMemo(() => {
    const userStats: { [key: string]: { 
      username: string; 
      count: number; 
      firstPost: Date; 
      lastPost: Date; 
      totalLikes: number;
      totalComments: number;
    }} = {};

    posts.forEach(post => {
      const date = parseISO(post.timestamp);
      if (!userStats[post.username]) {
        userStats[post.username] = {
          username: post.username,
          count: 1,
          firstPost: date,
          lastPost: date,
          totalLikes: post.likes,
          totalComments: post.comments
        };
      } else {
        const current = userStats[post.username];
        current.count++;
        current.totalLikes += post.likes;
        current.totalComments += post.comments;
        if (date < current.firstPost) current.firstPost = date;
        if (date > current.lastPost) current.lastPost = date;
      }
    });

    return Object.values(userStats).sort((a, b) => b.count - a.count);
  }, [posts]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold border-b border-gray-100 dark:border-gray-800">
            <th className="px-6 py-4">{t.username || 'Username'}</th>
            <th className="px-6 py-4">{t.instagram_posts || 'Posts'}</th>
            <th className="px-6 py-4">{t.likes || 'Likes'}</th>
            <th className="px-6 py-4">{t.comments || 'Comments'}</th>
            <th className="px-6 py-4">{t.dashboard_firstProductAdded || 'First Seen'}</th>
            <th className="px-6 py-4">{t.dashboard_lastProductAdded || 'Last Seen'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {stats.map((user) => (
            <motion.tr 
              key={user.username}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center text-pink-600">
                    <Instagram size={16} />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-primary transition-colors cursor-pointer">
                    {user.username}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FileText size={14} className="text-gray-400" />
                  <span className="font-medium">{user.count}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {user.totalLikes.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {user.totalComments.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                  <Calendar size={12} />
                  {format(user.firstPost, 'yyyy-MM-dd')}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                  <Calendar size={12} />
                  {format(user.lastPost, 'yyyy-MM-dd')}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstagramStatsTable;
