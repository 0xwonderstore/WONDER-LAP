import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Heart, MessageCircle, Calendar, Globe, ExternalLink, Activity, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { format } from 'date-fns';

interface SmartInstagramTableProps {
  accounts: any[];
  t: any;
}

type SortField = 'postsCount' | 'avgLikes' | 'avgComments' | 'totalEngagement' | 'firstPost' | 'lastPost';
type SortDirection = 'asc' | 'desc';

// Tooltip Component
const HeaderTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1">
        <Info size={12} className="text-gray-400 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
    </div>
);

const SmartInstagramTable: React.FC<SmartInstagramTableProps> = ({ accounts, t }) => {
  const [sortField, setSortField] = useState<SortField>('postsCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case 'postsCount':
          valA = a.postsCount;
          valB = b.postsCount;
          break;
        case 'avgLikes':
          valA = a.avgLikes;
          valB = b.avgLikes;
          break;
        case 'avgComments':
          valA = a.avgComments;
          valB = b.avgComments;
          break;
        case 'totalEngagement':
          valA = a.totalLikes + a.totalComments;
          valB = b.totalLikes + b.totalComments;
          break;
        case 'firstPost':
          valA = a.firstPost ? new Date(a.firstPost).getTime() : 0;
          valB = b.firstPost ? new Date(b.firstPost).getTime() : 0;
          break;
        case 'lastPost':
          valA = a.lastPost ? new Date(a.lastPost).getTime() : 0;
          valB = b.lastPost ? new Date(b.lastPost).getTime() : 0;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [accounts, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={14} className="text-gray-300 opacity-0 group-hover:opacity-50" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-indigo-500" />;
  };

  const HeaderCell = ({ field, label, align = 'left', tooltip }: { field: SortField, label: string, align?: string, tooltip?: string }) => (
    <th 
      className={`px-6 py-4 cursor-pointer select-none group/th hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${align === 'center' ? 'text-center' : 'text-left'}`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-2 ${align === 'center' ? 'justify-center' : ''}`}>
        {label}
        {tooltip && <HeaderTooltip text={tooltip} />}
        <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/50 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <Instagram className="text-pink-500" size={20} />
             {t.instagram_feature} Accounts
           </h3>
           <p className="text-sm text-gray-500 mt-1">Performance & Engagement Metrics</p>
        </div>
        <span className="text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
            {accounts.length} Accounts
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/30 text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
              <th className="px-6 py-4">{t.username || 'Account'}</th>
              <th className="px-6 py-4 text-center">{t.language_filter || 'Lang'}</th>
              
              <HeaderCell 
                field="postsCount" 
                label={t.instagram_posts || 'Posts'} 
                align="center" 
                tooltip="Total unique posts tracked"
              />
              <HeaderCell 
                field="avgLikes" 
                label="Avg. Likes" 
                align="center" 
                tooltip="Average likes per post"
              />
              <HeaderCell 
                field="avgComments" 
                label="Avg. Comments" 
                align="center" 
                tooltip="Average comments per post"
              />
              <HeaderCell 
                field="totalEngagement" 
                label="Total Engagement" 
                align="center" 
                tooltip="Sum of all likes and comments"
              />
              <HeaderCell 
                field="firstPost" 
                label={t.dashboard_firstProductAdded || 'First Seen'} 
                tooltip="Date of the oldest post tracked"
              />
              <HeaderCell 
                field="lastPost" 
                label={t.dashboard_lastProductAdded || 'Last Seen'} 
                tooltip="Date of the most recent post tracked"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedAccounts.map((account, index) => (
              <motion.tr 
                key={account.username}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }} // Faster stagger
                className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                         <img 
                            src={`https://ui-avatars.com/api/?name=${account.username}&background=fff&color=000`} 
                            alt={account.username}
                            className="w-full h-full rounded-full border-2 border-white dark:border-gray-800"
                         />
                    </div>
                    <div>
                        <a 
                           href={`https://instagram.com/${account.username}`} 
                           target="_blank" 
                           rel="noreferrer"
                           className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-pink-600 transition-colors flex items-center gap-1"
                        >
                            {account.username}
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium uppercase">
                        <Globe size={12} /> {account.language !== 'Unknown' ? account.language : '-'}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-lg shadow-sm">
                        {account.postsCount}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Heart size={14} className="text-red-500 fill-red-500" /> 
                        {account.avgLikes.toLocaleString()}
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <MessageCircle size={14} className="text-blue-500 fill-blue-500" />
                        {account.avgComments.toLocaleString()}
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                        <Activity size={12} />
                        {(account.totalLikes + account.totalComments).toLocaleString()}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-mono">
                        {account.firstPost ? format(account.firstPost, 'yyyy-MM-dd') : '-'}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-mono">
                        {account.lastPost ? format(account.lastPost, 'yyyy-MM-dd') : '-'}
                    </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmartInstagramTable;
