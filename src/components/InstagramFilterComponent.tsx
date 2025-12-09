import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import Select from './Select';
import MultiSelect from './MultiSelect';
import { 
  ArrowUp, ArrowDown, X, Filter, ChevronDown, User, 
  Globe, Calendar as CalendarIcon, Heart, ArrowUpDown, 
  MessageCircle, Sparkles 
} from 'lucide-react';

interface InstagramFilterComponentProps {
  usernames: string[];
  filters: {
    username: string;
    minLikes: number | null;
    maxLikes: number | null;
    minComments: number | null;
    maxComments: number | null;
    languages: string[];
  };
  onFilterChange: (filters: Partial<InstagramFilterComponentProps['filters']>) => void;
  onSortChange: (sort: 'asc' | 'desc' | null) => void;
  onSortByChange: (sortBy: 'likes' | 'comments') => void;
  onReset: () => void;
  currentSort: 'asc' | 'desc' | null;
  currentSortBy: 'likes' | 'comments';
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  setDate?: (date: DateRange | undefined) => void; 
}

const InstagramFilterComponent: React.FC<InstagramFilterComponentProps> = ({
  usernames,
  filters,
  onFilterChange,
  onSortChange,
  onSortByChange,
  onReset,
  currentSort,
  currentSortBy,
  date,
  onDateChange,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCount, setActiveCount] = useState(0);

  // Calculate active filters for badge
  useEffect(() => {
    let count = 0;
    if (filters.username) count++;
    if (filters.minLikes !== null) count++;
    if (filters.minComments !== null) count++;
    if (filters.languages.length > 0) count++;
    if (date) count++;
    setActiveCount(count);
  }, [filters, date]);

  const handleInputChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    onFilterChange({ [name]: value });
  };

  const handleLikesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value === '' ? null : Number(value) });
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Helper for input container styles
  const inputContainerClass = "relative group transition-all duration-300";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1.5 transition-colors group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500";
  const inputWrapperClass = "h-[48px] relative rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 group-hover:border-purple-300 dark:group-hover:border-purple-700 shadow-sm";

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/40 mb-8 border border-gray-100 dark:border-gray-800 transition-all duration-500 ${isExpanded ? 'ring-4 ring-gray-50 dark:ring-gray-800/50' : ''} overflow-hidden`}>
      {/* Header */}
      <div 
        className="relative px-6 py-5 flex justify-between items-center cursor-pointer bg-white dark:bg-gray-900 z-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Background gradient hint on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        <div className="flex items-center gap-4 relative z-10">
           <div className={`p-3 rounded-2xl transition-all duration-500 ${activeCount > 0 ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 rotate-3' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
             {activeCount > 0 ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Filter className="w-5 h-5" />}
           </div>
           <div>
               <h3 className="font-black text-lg tracking-tight text-gray-800 dark:text-gray-100 flex items-center gap-2">
                 Instagram {t('filters')}
                 {activeCount > 0 && (
                   <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 text-xs font-bold">
                     {activeCount}
                   </span>
                 )}
               </h3>
               <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                   {activeCount > 0 ? t('showing') + ' ' + t('products') : t('searchPlaceholder')}
               </p>
           </div>
        </div>
        
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-400 transition-all duration-500 relative z-10 shadow-sm ${isExpanded ? 'rotate-180 bg-gray-50 dark:bg-gray-700 text-purple-500 border-purple-100 dark:border-purple-900' : 'hover:scale-110'}`}>
            <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-2 flex flex-col gap-8 relative">
            {/* Decoration line */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                {/* Username Filter */}
                <div className={inputContainerClass}>
                    <label htmlFor="username" className={labelClass}>
                        <User className="w-3.5 h-3.5" /> {t('select_user')}
                    </label>
                    <div className={inputWrapperClass}>
                        <Select 
                            id="username" 
                            name="username" 
                            value={filters.username} 
                            onChange={handleInputChange} 
                            options={usernameOptions} 
                            className="w-full h-full bg-transparent"
                            placeholder={t('all_users')}
                        />
                    </div>
                </div>

                {/* Date Picker */}
                <div className={inputContainerClass}>
                    <label className={labelClass}>
                        <CalendarIcon className="w-3.5 h-3.5" /> {t('date_posted')}
                    </label>
                    <div className={inputWrapperClass}>
                       <DateRangePicker date={date} setDate={onDateChange} />
                    </div>
                </div>

                {/* Language Filter */}
                <div className={inputContainerClass}>
                    <label className={labelClass}>
                        <Globe className="w-3.5 h-3.5" /> {t('select_language')}
                    </label>
                    <div className={inputWrapperClass}>
                        <MultiSelect 
                            options={languageOptions} 
                            selected={filters.languages}
                            onChange={handleLanguagesChange}
                            label={t('select_language')}
                        />
                    </div>
                </div>
            
                 {/* Likes & Comments Group */}
                 <div className="col-span-1 grid grid-cols-2 gap-4">
                     {/* Likes Filter */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>
                            <Heart className="w-3.5 h-3.5" /> {t('min_likes')}
                        </label>
                        <div className={inputWrapperClass}>
                            <input
                                type="number"
                                name="minLikes"
                                placeholder="0"
                                value={filters.minLikes ?? ''}
                                onChange={handleLikesChange}
                                className="w-full h-full pl-4 pr-3 rounded-xl bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-gray-700 dark:text-gray-200 placeholder-gray-400"
                                min="0"
                            />
                            {/* Decorative unit */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-300 dark:text-gray-600 pointer-events-none">
                                <Heart size={12} className="inline mr-1" />
                            </div>
                        </div>
                    </div>

                    {/* Comments Filter */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>
                            <MessageCircle className="w-3.5 h-3.5" /> {t('min_comments')}
                        </label>
                        <div className={inputWrapperClass}>
                            <input
                                type="number"
                                name="minComments"
                                placeholder="0"
                                value={filters.minComments ?? ''}
                                onChange={handleCommentsChange}
                                className="w-full h-full pl-4 pr-3 rounded-xl bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-gray-700 dark:text-gray-200 placeholder-gray-400"
                                min="0"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-300 dark:text-gray-600 pointer-events-none">
                                <MessageCircle size={12} className="inline mr-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center pt-2 gap-6">
                {/* Sort Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5 px-2">
                        <ArrowUpDown className="w-3.5 h-3.5" /> {t('sort_by')}
                    </span>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                         {/* Sort Criteria Selector */}
                         <div className="flex p-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            {[
                                { id: 'likes', icon: Heart, label: t('likes') },
                                { id: 'comments', icon: MessageCircle, label: t('comments') }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSortByChange(item.id as 'likes' | 'comments')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${currentSortBy === item.id 
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-pink-500/20' 
                                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <item.icon size={13} className={currentSortBy === item.id ? 'fill-current' : ''} /> {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                        {/* Sort Order Buttons */}
                        <div className="flex p-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                             {[
                                { id: 'desc', icon: ArrowDown, label: t('descending') },
                                { id: 'asc', icon: ArrowUp, label: t('ascending') }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSortChange(item.id as 'asc' | 'desc')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${currentSort === item.id 
                                        ? 'bg-gray-800 dark:bg-gray-700 text-white shadow-md' 
                                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <item.icon size={13} /> {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                 {activeCount > 0 && (
                    <button 
                        onClick={onReset} 
                        className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 text-red-500 bg-white border border-red-100 hover:border-red-200 dark:bg-gray-800 dark:border-red-900/30 dark:hover:border-red-800/50 rounded-xl text-xs font-bold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 active:scale-95 w-full lg:w-auto justify-center"
                    >
                        <span className="absolute inset-0 bg-red-50 dark:bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 z-10">
                             <X className="w-3 h-3" />
                        </div>
                        <span className="z-10">{t('resetFilters')}</span>
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramFilterComponent;
