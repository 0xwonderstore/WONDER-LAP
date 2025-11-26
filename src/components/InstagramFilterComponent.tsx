import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import Select from './Select';
import MultiSelect from './MultiSelect';
import { ArrowUp, ArrowDown, X, Filter, ChevronDown, ChevronUp, User, Globe, Calendar as CalendarIcon, Heart, ArrowUpDown } from 'lucide-react';

interface InstagramFilterComponentProps {
  usernames: string[];
  filters: {
    username: string;
    minLikes: number | null;
    maxLikes: number | null;
    languages: string[];
  };
  onFilterChange: (filters: Partial<InstagramFilterComponentProps['filters']>) => void;
  onSortChange: (sort: 'asc' | 'desc' | null) => void;
  onReset: () => void;
  currentSort: 'asc' | 'desc' | null;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  setDate?: (date: DateRange | undefined) => void; // Support both naming conventions if needed, usually passed as onDateChange
}

const InstagramFilterComponent: React.FC<InstagramFilterComponentProps> = ({
  usernames,
  filters,
  onFilterChange,
  onSortChange,
  onReset,
  currentSort,
  date,
  onDateChange,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleLikesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value === '' ? null : Number(value) });
  };

  const handleLanguagesChange = (selectedLanguages: string[]) => {
    onFilterChange({ languages: selectedLanguages });
  };
  
  const usernameOptions = [
    { value: '', label: `${t('all_users')} (${usernames.length})` },
    ...usernames.sort().map(user => ({ value: user, label: user }))
  ];

  const languageOptions = [
    { value: 'es', label: t('spanish') },
    { value: 'en', label: t('english') },
    { value: 'it', label: t('italian') },
    { value: 'ru', label: t('russian') },
    { value: 'zh', label: t('chinese') },
    { value: 'ar', label: t('arabic') },
    { value: 'fa', label: t('persian') },
    { value: 'fr', label: t('french') },
    { value: 'hi', label: t('hindi') },
  ];
  
  const isFilterActive = filters.username !== '' || filters.minLikes !== null || filters.maxLikes !== null || filters.languages.length > 0 || date !== undefined || currentSort !== null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-lg mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300 ${isExpanded ? 'overflow-visible' : 'overflow-hidden'}`}>
      {/* Header / Toggle Bar */}
      <div 
        className="px-6 py-4 flex justify-between items-center cursor-pointer bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold">
           <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
             <Filter className="w-5 h-5" />
           </div>
           <span>Instagram {t('filters')}</span>
           {isFilterActive && <span className="w-2 h-2 rounded-full bg-pink-500 ml-2"></span>}
        </div>
        <div className="text-gray-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`px-6 transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] py-6 opacity-100 overflow-visible' : 'max-h-0 py-0 opacity-0 overflow-hidden'}`}>
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Username Filter */}
                <div className="col-span-1">
                    <label htmlFor="username" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3 h-3" /> {t('select_user')}
                    </label>
                    <Select 
                        id="username" 
                        name="username" 
                        value={filters.username} 
                        onChange={handleInputChange} 
                        options={usernameOptions} 
                        className="w-full py-2.5 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm focus:ring-pink-500/50 focus:border-pink-500 shadow-sm"
                    />
                </div>

                {/* Date Picker */}
                <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {t('date_posted')}
                    </label>
                    <DateRangePicker date={date} setDate={onDateChange} />
                </div>

                {/* Language Filter */}
                <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {t('select_language')}
                    </label>
                    <MultiSelect 
                        options={languageOptions} 
                        selected={filters.languages}
                        onChange={handleLanguagesChange}
                        label={t('select_language')}
                    />
                </div>

                {/* Likes Range Filter */}
                <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {t('likes_range')}
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                        type="number"
                        name="minLikes"
                        placeholder={t('min_likes')}
                        value={filters.minLikes ?? ''}
                        onChange={handleLikesChange}
                        className="w-full pl-3 pr-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all duration-200 placeholder-gray-400 text-sm shadow-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                        type="number"
                        name="maxLikes"
                        placeholder={t('max_likes')}
                        value={filters.maxLikes ?? ''}
                        onChange={handleLikesChange}
                        className="w-full pl-3 pr-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all duration-200 placeholder-gray-400 text-sm shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 gap-4">
                {/* Sort Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-sm font-medium text-gray-500 whitespace-nowrap flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> {t('sort_by_likes')}:</span>
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                          onClick={() => onSortChange('desc')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all ${currentSort === 'desc' ? 'bg-white dark:bg-gray-600 text-pink-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                          <ArrowDown size={14} /> {t('descending')}
                        </button>
                        <button
                          onClick={() => onSortChange('asc')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all ${currentSort === 'asc' ? 'bg-white dark:bg-gray-600 text-pink-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                          <ArrowUp size={14} /> {t('ascending')}
                        </button>
                    </div>
                </div>

                {/* Reset Button */}
                 {isFilterActive && (
                    <button 
                        onClick={onReset} 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
                    >
                        <X className="w-4 h-4" />
                        {t('resetFilters')}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramFilterComponent;
