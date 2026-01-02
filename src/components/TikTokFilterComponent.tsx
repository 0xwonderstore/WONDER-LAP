import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { Filter, X, ChevronDown, Heart, MessageCircle, Share2, Bookmark, Play, Search, Calendar, SlidersHorizontal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DateRangePicker from './DateRangePicker'; // Correct Default Import
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
  posts: TikTokPost[]; 
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

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== '') || date?.from;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 mb-8 transition-all duration-300">
      
      {/* Top Bar: Search, Date, Filters Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Search Bar (Span 5 cols) */}
        <div className="lg:col-span-5 relative group h-[72px] z-30">
             <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5 focus-within:ring-4 focus-within:ring-brand-primary/20 focus-within:border-brand-primary">
                 <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 group-focus-within:bg-brand-primary/10 transition-colors duration-300">
                        <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                    </div>
                    <div className="flex flex-col flex-1">
                         {filters.username && (
                             <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary mb-0.5 animate-fade-in">
                                {t('search')}
                             </span>
                         )}
                         <input 
                            type="text" 
                            placeholder={filters.username ? "" : (t('search_user') || "Search username...")}
                            value={filters.username}
                            onChange={(e) => onFilterChange({ username: e.target.value })}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400"
                        />
                    </div>
                 </div>
                 {filters.username && (
                    <button
                        onClick={() => onFilterChange({ username: '' })}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                 )}
             </div>
        </div>

        {/* Date Picker (Span 4 cols) - Green Variant like Main Filter */}
        <div className="lg:col-span-4 h-[72px] z-30">
             <DateRangePicker 
                date={date} 
                setDate={setDate} 
                icon={<Calendar className="w-4 h-4" />}
                variant="green"
                label={t('date') || "Date"}
            />
        </div>

        {/* Actions (Span 3 cols) */}
        <div className="lg:col-span-3 flex gap-3 h-[72px]">
             <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`flex-1 h-full flex items-center justify-center gap-3 px-6 rounded-2xl text-sm font-bold transition-all border shadow-sm group
                    ${isAdvancedOpen 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-brand-primary/20 scale-[1.02]' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'}`}
             >
                 <div className={`p-2 rounded-xl transition-colors ${isAdvancedOpen ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200'}`}>
                    <SlidersHorizontal size={18} />
                 </div>
                 <span>{t('filters') || "Filters"}</span>
                 <ChevronDown size={16} className={`transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
             </button>

             {hasActiveFilters && (
                 <button 
                    onClick={onReset}
                    className="h-full w-[72px] flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors border border-red-100 dark:border-red-900/30 hover:shadow-md hover:-translate-y-0.5"
                    title={t('resetFilters')}
                 >
                     <Trash2 size={24} />
                 </button>
             )}
        </div>
      </div>

      {/* Advanced Filters Section */}
      <AnimatePresence>
        {isAdvancedOpen && (
            <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 32 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="overflow-hidden"
            >
                <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
                            <Filter size={16} />
                        </div>
                        {t('min_interactions') || "Minimum Interactions"}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
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
