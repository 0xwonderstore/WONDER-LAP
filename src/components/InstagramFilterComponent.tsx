import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, SortAsc, SortDesc, RotateCcw, X, Globe, Calendar, User, Hash, Heart, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import DateRangePicker from './DateRangePicker';
import { InstagramPageStore } from '../stores/instagramPageStore';
import { motion, AnimatePresence } from 'framer-motion';

interface InstagramFilterProps {
  usernames: string[];
  filters: InstagramPageStore['filters'];
  onFilterChange: (filters: Partial<InstagramPageStore['filters']>) => void;
  currentSort: 'asc' | 'desc';
  onSortChange: (sort: 'asc' | 'desc') => void;
  currentSortBy: 'date' | 'likes' | 'comments';
  onSortByChange: (sortBy: 'date' | 'likes' | 'comments') => void;
  onReset: () => void;
  date: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
  postsPerPage: number;
  onPostsPerPageChange: (num: number) => void;
}

const InstagramFilterComponent: React.FC<InstagramFilterProps> = ({
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

  // Updated Language List
  const availableLanguages = [
    'ar', 'en', 'fa', 'ko', 'pt', 'tr', 'es', 'ja', 'id', 'zh', 'ru', 'fr', 'de', 'it', 'hi'
  ];

  const handleLanguageToggle = (lang: string) => {
      const current = filters.languages || [];
      if (current.includes(lang)) {
          onFilterChange({ languages: current.filter(l => l !== lang) });
      } else {
          onFilterChange({ languages: [...current, lang] });
      }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-gray-700 mb-10 transition-all">
      
      {/* 1. Top Bar: Search & Main Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-2">
          
          {/* Title */}
          <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-pink-500/30">
                  <Filter size={24} />
              </div>
              <div>
                  <h2 className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{t('filters')}</h2>
                  <p className="text-xs text-gray-400 font-medium">Refine your feed</p>
              </div>
          </div>

          {/* User Search & Sort */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* User Dropdown */}
              <div className="relative group flex-grow lg:flex-grow-0 min-w-[200px]">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <select
                      value={filters.username || ''}
                      onChange={(e) => onFilterChange({ username: e.target.value || null })}
                      className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer outline-none transition-all"
                  >
                      <option value="">{t('all_users')}</option>
                      {usernames.map((user) => (
                          <option key={user} value={user}>{user}</option>
                      ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                  </div>
              </div>

              {/* Date Picker */}
              <div className="flex-grow lg:flex-grow-0">
                  <DateRangePicker date={date} setDate={onDateChange} />
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
                  </select>
                  <button
                      onClick={() => onSortChange(currentSort === 'asc' ? 'desc' : 'asc')}
                      className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-500 hover:text-indigo-500 shadow-sm transition-colors"
                  >
                      {currentSort === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  </button>
              </div>

              {/* Reset Button */}
              <button 
                  onClick={onReset}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                  title={t('resetFilters')}
              >
                  <RotateCcw size={20} />
              </button>
          </div>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center mt-4">
          <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50 dark:bg-indigo-900/10 px-4 py-2 rounded-full"
          >
              {showAdvanced ? (
                  <>
                      {t('hide_advanced')} <ChevronUp size={14} />
                  </>
              ) : (
                  <>
                      {t('show_advanced')} <ChevronDown size={14} />
                  </>
              )}
          </button>
      </div>

      {/* Advanced Filters (Collapsible) */}
      <AnimatePresence>
          {showAdvanced && (
              <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
              >
                  <div className="pt-8 border-t border-gray-100 dark:border-gray-700 mt-6">
                      
                      {/* Language Chips */}
                      <div className="mb-8">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Globe size={14} />
                              {t('select_language')}
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {availableLanguages.map((lang) => {
                                  const isActive = (filters.languages || []).includes(lang);
                                  return (
                                      <button
                                          key={lang}
                                          onClick={() => handleLanguageToggle(lang)}
                                          className={`
                                              px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border
                                              ${isActive 
                                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 transform scale-105' 
                                                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}
                                          `}
                                      >
                                          {t(lang)}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
                          {/* Min Likes Input */}
                          <div className="group bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500">
                              <div className="p-2 bg-pink-100 dark:bg-pink-900/20 text-pink-500 rounded-xl">
                                  <Heart size={18} />
                              </div>
                              <div className="flex-grow">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('min_likes')}</label>
                                  <input 
                                      type="number" 
                                      min="0"
                                      placeholder="0"
                                      value={filters.minLikes || ''}
                                      onChange={(e) => onFilterChange({ minLikes: e.target.value ? Number(e.target.value) : null })}
                                      className="w-full bg-transparent border-none p-0 text-sm font-black text-gray-800 dark:text-white focus:ring-0 placeholder-gray-300 outline-none"
                                  />
                              </div>
                          </div>

                          {/* Min Comments Input */}
                          <div className="group bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-xl">
                                  <MessageCircle size={18} />
                              </div>
                              <div className="flex-grow">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('min_comments')}</label>
                                  <input 
                                      type="number" 
                                      min="0"
                                      placeholder="0"
                                      value={filters.minComments || ''}
                                      onChange={(e) => onFilterChange({ minComments: e.target.value ? Number(e.target.value) : null })}
                                      className="w-full bg-transparent border-none p-0 text-sm font-black text-gray-800 dark:text-white focus:ring-0 placeholder-gray-300 outline-none"
                                  />
                              </div>
                          </div>

                          {/* Posts Per Page */}
                          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <Hash size={16} />
                                  {t('showing')}
                              </span>
                              <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                                  {[24, 48, 96].map(num => (
                                      <button
                                          key={num}
                                          onClick={() => onPostsPerPageChange(num)}
                                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${postsPerPage === num ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                      >
                                          {num}
                                      </button>
                                  ))}
                              </div>
                          </div>

                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
};

export default InstagramFilterComponent;
