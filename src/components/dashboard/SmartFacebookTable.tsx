import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Facebook, ThumbsUp, MessageCircle, Share2, Calendar, Activity, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { format } from 'date-fns';

interface SmartFacebookTableProps {
  pages: any[];
  t: any;
}

type SortField = 'postsCount' | 'avgLikes' | 'avgComments' | 'avgShares' | 'totalEngagement' | 'firstPost' | 'lastPost';
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

const SmartFacebookTable: React.FC<SmartFacebookTableProps> = ({ pages, t }) => {
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

  const sortedPages = useMemo(() => {
    return [...pages].sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case 'postsCount': valA = a.postsCount; valB = b.postsCount; break;
        case 'avgLikes': valA = a.avgLikes; valB = b.avgLikes; break;
        case 'avgComments': valA = a.avgComments; valB = b.avgComments; break;
        case 'avgShares': valA = a.avgShares; valB = b.avgShares; break;
        case 'totalEngagement': 
             valA = a.totalLikes + a.totalComments + a.totalShares;
             valB = b.totalLikes + b.totalComments + b.totalShares;
             break;
        case 'firstPost': 
             valA = a.firstPost ? new Date(a.firstPost).getTime() : 0;
             valB = b.firstPost ? new Date(b.firstPost).getTime() : 0;
             break;
        case 'lastPost': 
             valA = a.lastPost ? new Date(a.lastPost).getTime() : 0;
             valB = b.lastPost ? new Date(b.lastPost).getTime() : 0;
             break;
        default: return 0;
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [pages, sortField, sortDirection]);

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
             <Facebook className="text-blue-600" size={20} />
             Facebook Pages Analysis
           </h3>
           <p className="text-sm text-gray-500 mt-1">Performance by Page</p>
        </div>
        <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            {pages.length} Pages
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/30 text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
              <th className="px-6 py-4">{t.username || 'Page Name'}</th>
              <HeaderCell field="postsCount" label="Posts" align="center" tooltip="Total posts tracked" />
              <HeaderCell field="avgLikes" label="Avg. Likes" align="center" tooltip="Average likes per post" />
              <HeaderCell field="avgComments" label="Avg. Comments" align="center" tooltip="Average comments per post" />
              <HeaderCell field="avgShares" label="Avg. Shares" align="center" tooltip="Average shares per post" />
              <HeaderCell field="totalEngagement" label="Engagement" align="center" tooltip="Total interactions" />
              <HeaderCell field="lastPost" label="Last Activity" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedPages.map((page, index) => (
              <motion.tr 
                key={page.username}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                         {page.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <a 
                           href={`https://facebook.com/${page.username}`} 
                           target="_blank" 
                           rel="noreferrer"
                           className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors block"
                        >
                            {page.username}
                        </a>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Facebook</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-lg shadow-sm">
                        {page.postsCount}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <ThumbsUp size={14} className="text-blue-500" /> 
                        {page.avgLikes.toLocaleString()}
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <MessageCircle size={14} className="text-gray-500" />
                        {page.avgComments.toLocaleString()}
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Share2 size={14} className="text-green-500" />
                        {page.avgShares.toLocaleString()}
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                        <Activity size={12} />
                        {(page.totalLikes + page.totalComments + page.totalShares).toLocaleString()}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-mono">
                        <Calendar size={12} className="text-blue-500" />
                        {page.lastPost ? format(page.lastPost, 'yyyy-MM-dd') : '-'}
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

export default SmartFacebookTable;
