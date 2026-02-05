import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, SortAsc, SortDesc, RotateCcw, User, Heart, MessageCircle, Share2, ChevronUp, ChevronDown, Hash } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import DateRangePicker from './DateRangePicker';
import { FacebookPageStore } from '../stores/facebookPageStore';
import { motion, AnimatePresence } from 'framer-motion';

interface FacebookFilterProps {
  usernames: string[];
  filters: FacebookPageStore['filters'];
  onFilterChange: (filters: Partial<FacebookPageStore['filters']>) => void;
  currentSort: 'asc' | 'desc';
  onSortChange: (sort: 'asc' | 'desc') => void;
  currentSortBy: 'date' | 'likes' | 'comments' | 'shares';
  onSortByChange: (sortBy: 'date' | 'likes' | 'comments' | 'shares') => void;
  onReset: () => void;
  date: { from: Date | undefined; to: Date | undefined };
  onDateChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  postsPerPage: number;
  onPostsPerPageChange: (num: number) => void;
}

const FacebookFilterComponent: React.FC<FacebookFilterProps> = ({
  usernames,
  filters,
  onFilterChange,
  currentSort,
  onSortChange,
  currentSortBy,
  onSortByChange,
  onReset,
  date,
  onDateChange,
  postsPerPage,
  onPostsPerPageChange,
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl shadow-blue-500/5 border border-gray-100 dark:border-gray-700 mb-10 transition-all">
      
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-2">
          
          {/* Title */}
          <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                  <Filter size={24} />
              </div>
              <div>
                  <h2 className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{t('filters')}</h2>
                  <p className="text-xs text-gray-400 font-medium">Refine Facebook feed</p>
              </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* User Dropdown */}
              <div className="relative group flex-grow lg:flex-grow-0 min-w-[200px]">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <select
                      value={filters.username || ''}
                      onChange={(e) => onFilterChange({ username: e.target.value || null })}
                      className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer outline-none transition-all"
                  >
                      <option value="">{t('all_users')}</option>
                      {usernames.map((user) => (
                          <option key={user} value={user}>{user}</option>
                      ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={14} />
                  </div>
              </div>

              {/* Date Picker */}
              <div className="flex-grow lg:flex-grow-0">
                  <DateRangePicker 
                    date={date as any} 
                    setDate={(range: any) => onDateChange(range)} 
                  />
              </div>

              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 hidden lg:block mx-2"></div>

              {/* Sort Controls */}
              <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                  <select
                      value={currentSortBy}
                      onChange={(e) => onSortByChange(e.target.value as any)}
                      className="bg-transparent border-none text-xs font-bold text-gray-600 dark:text-gray-300 py-2 pl-3 pr-8 focus:ring-0 cursor-pointer outline-none"
                  >
                      <option value="date">{t('date')}</option>
                      <option value="likes">{t('likes')}</option>
                      <option value="comments">{t('comments')}</option>
                      <option value="shares">{t('shares')}</option>
                  </select>
                  <button
                      onClick={() => onSortChange(currentSort === 'asc' ? 'desc' : 'asc')}
                      className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-500 hover:text-blue-500 shadow-sm transition-colors"
                  >
                      {currentSort === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  </button>
              </div>

              {/* Reset */}
              <button 
                  onClick={onReset}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                  title={t('resetFilters')}
              >
                  <RotateCcw size={20} />
              </button>
          </div>
      </div>

      <div className="flex justify-center mt-4">
          <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/10 px-4 py-2 rounded-full transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/20"
          >
              {showAdvanced ? t('hide_advanced') : t('show_advanced')} 
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
          {showAdvanced && (
              <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
              >
                  <div className="pt-8 border-t border-gray-100 dark:border-gray-700 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Min Likes */}
                      <div className="group bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500">
                          <div className="p-2 bg-pink-100 text-pink-500 rounded-xl"><Heart size={18} /></div>
                          <div className="flex-grow">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('min_likes')}</label>
                              <input type="number" value={filters.minLikes || ''} onChange={e => onFilterChange({ minLikes: e.target.value ? Number(e.target.value) : null })} className="w-full bg-transparent border-none p-0 text-sm font-black text-gray-800 dark:text-white focus:ring-0 placeholder-gray-300 outline-none" placeholder="0" />
                          </div>
                      </div>
                      
                      {/* Min Comments */}
                      <div className="group bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                          <div className="p-2 bg-blue-100 text-blue-500 rounded-xl"><MessageCircle size={18} /></div>
                          <div className="flex-grow">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('min_comments')}</label>
                              <input type="number" value={filters.minComments || ''} onChange={e => onFilterChange({ minComments: e.target.value ? Number(e.target.value) : null })} className="w-full bg-transparent border-none p-0 text-sm font-black text-gray-800 dark:text-white focus:ring-0 placeholder-gray-300 outline-none" placeholder="0" />
                          </div>
                      </div>

                      {/* Min Shares */}
                      <div className="group bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500">
                          <div className="p-2 bg-green-100 text-green-500 rounded-xl"><Share2 size={18} /></div>
                          <div className="flex-grow">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('min_shares')}</label>
                              <input type="number" value={filters.minShares || ''} onChange={e => onFilterChange({ minShares: e.target.value ? Number(e.target.value) : null })} className="w-full bg-transparent border-none p-0 text-sm font-black text-gray-800 dark:text-white focus:ring-0 placeholder-gray-300 outline-none" placeholder="0" />
                          </div>
                      </div>

                      {/* Items Per Page */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2"><Hash size={16} /> {t('showing')}</span>
                          <select value={postsPerPage} onChange={e => onPostsPerPageChange(Number(e.target.value))} className="bg-transparent border-none p-0 text-sm font-bold text-gray-800 dark:text-white focus:ring-0 cursor-pointer text-right outline-none">
                              {[24, 48, 96].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default FacebookFilterComponent;
