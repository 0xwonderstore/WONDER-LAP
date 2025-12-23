import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { Filter, X, ChevronDown, Heart, MessageCircle, Share2, Bookmark, Play, Search, Calendar, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DateRangePicker from './DateRangePicker';
import { TikTokPost } from '../types';

interface TikTokFilterProps {
  filters: {
    username: string;
    minPlayCount: number | null;
    minDiggCount: number | null;
    minCommentCount: number | null;
    minShareCount: number | null;
    minCollectCount: number | null;
    isAd: boolean | null;
  };
  onFilterChange: (filters: any) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  onReset: () => void;
  posts: TikTokPost[]; // For calculating max values if needed (optional)
}

const TikTokFilterComponent: React.FC<TikTokFilterProps> = ({ 
  filters, 
  onFilterChange, 
  date, 
  setDate,
  onReset 
}) => {
  const { t } = useTranslation();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    onFilterChange({ [key]: numValue });
  };

  const FilterInput = ({ icon: Icon, label, value, onChangeKey, placeholder }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <Icon size={12} />
        {label}
      </label>
      <input
        type="number"
        min="0"
        placeholder={placeholder || "Min"}
        value={value ?? ''}
        onChange={(e) => handleInputChange(onChangeKey, e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100"
      />
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8 transition-all duration-300">
      
      {/* Top Bar: Search, Date, Ad Toggle, Reset */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Left: Search & Ad Toggle */}
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 flex-1">
            <div className="relative flex-grow max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder={t('search_user') || "Search username..."}
                    value={filters.username}
                    onChange={(e) => onFilterChange({ username: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all shadow-sm"
                />
            </div>

            <button 
                onClick={() => {
                    if (filters.isAd === null) onFilterChange({ isAd: true });
                    else if (filters.isAd === true) onFilterChange({ isAd: false });
                    else onFilterChange({ isAd: null });
                }}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border shadow-sm flex-shrink-0
                    ${filters.isAd === true ? 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-2 ring-yellow-500/20' : 
                      filters.isAd === false ? 'bg-green-50 text-green-700 border-green-200 ring-2 ring-green-500/20' : 
                      'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            >
                <span>{filters.isAd === true ? "Ads Only" : filters.isAd === false ? "Organic Only" : "All Posts"}</span>
            </button>
        </div>

        {/* Right: Date, Advanced Toggle */}
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
             <div className="w-full sm:w-auto">
                <DateRangePicker date={date} setDate={setDate} t={t} />
             </div>
             
             <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-sm
                    ${isAdvancedOpen 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-brand-primary/20' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
             >
                 <SlidersHorizontal size={18} />
                 <span className="hidden sm:inline">{t('filters') || "Filters"}</span>
                 <ChevronDown size={16} className={`transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
             </button>

             {(Object.values(filters).some(v => v !== null && v !== '') || date) && (
                 <button 
                    onClick={onReset}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                    title={t('resetFilters')}
                 >
                     <X size={20} />
                 </button>
             )}
        </div>
      </div>

      {/* Advanced Filters Section */}
      <AnimatePresence>
        {isAdvancedOpen && (
            <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Filter size={16} className="text-brand-primary" />
                        {t('min_interactions') || "Minimum Interactions"}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <FilterInput 
                            icon={Play} 
                            label={t('views') || "Views"} 
                            onChangeKey="minPlayCount" 
                            value={filters.minPlayCount} 
                            placeholder="1000"
                        />
                        <FilterInput 
                            icon={Heart} 
                            label={t('likes') || "Likes"} 
                            onChangeKey="minDiggCount" 
                            value={filters.minDiggCount} 
                            placeholder="100"
                        />
                        <FilterInput 
                            icon={MessageCircle} 
                            label={t('comments') || "Comments"} 
                            onChangeKey="minCommentCount" 
                            value={filters.minCommentCount} 
                            placeholder="10"
                        />
                        <FilterInput 
                            icon={Share2} 
                            label={t('shares') || "Shares"} 
                            onChangeKey="minShareCount" 
                            value={filters.minShareCount} 
                            placeholder="5"
                        />
                        <FilterInput 
                            icon={Bookmark} 
                            label={t('saves') || "Saves"} 
                            onChangeKey="minCollectCount" 
                            value={filters.minCollectCount} 
                            placeholder="5"
                        />
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TikTokFilterComponent;
