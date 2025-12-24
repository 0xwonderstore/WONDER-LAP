import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import DateRangePicker from './DateRangePicker'; // Default import
import Select from './Select';
import MultiSelect from './MultiSelect';
import { Disclosure, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { 
  ArrowUp, ArrowDown, X, Filter, ChevronDown, User, 
  Globe, Calendar as CalendarIcon, Heart, ArrowUpDown, 
  MessageCircle, Sparkles, CheckCircle2, Trash2
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
  const inputContainerClass = "space-y-2";
  const labelClass = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 ml-1";
  const inputWrapperClass = "relative h-[46px]"; // Fixed height wrapper

    // Helper to render active filter badges
    const renderActiveFilterBadges = () => {
        const badges = [];
        if (filters.username) {
          badges.push(
            <span key="user" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <User className="w-3 h-3 mr-1" />
              {filters.username}
              <button onClick={(e) => { e.stopPropagation(); onFilterChange({ username: '' }); }} className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"><X className="w-3 h-3" /></button>
            </span>
          );
        }
        if (filters.languages.length > 0) {
           badges.push(
            <span key="lang" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
               <Globe className="w-3 h-3 mr-1" />
              {filters.languages.join(', ').toUpperCase()}
              <button onClick={(e) => { e.stopPropagation(); onFilterChange({ languages: [] }); }} className="ml-1 text-orange-600 hover:text-orange-800 dark:text-orange-400"><X className="w-3 h-3" /></button>
            </span>
          );
        }
        if (date?.from) {
           badges.push(
            <span key="date" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
               <CalendarIcon className="w-3 h-3 mr-1" />
              {format(date.from, 'MMM d')} {date.to ? `- ${format(date.to, 'MMM d')}` : ''}
               <button onClick={(e) => { e.stopPropagation(); onDateChange(undefined); }} className="ml-1 text-pink-600 hover:text-pink-800 dark:text-pink-400"><X className="w-3 h-3" /></button>
            </span>
          );
        }
        if (filters.minLikes !== null) {
             badges.push(
            <span key="likes" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
               <Heart className="w-3 h-3 mr-1" />
              Likes &ge; {filters.minLikes}
               <button onClick={(e) => { e.stopPropagation(); onFilterChange({ minLikes: null }); }} className="ml-1 text-red-600 hover:text-red-800 dark:text-red-400"><X className="w-3 h-3" /></button>
            </span>
          );
        }
        if (filters.minComments !== null) {
            badges.push(
           <span key="comments" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              <MessageCircle className="w-3 h-3 mr-1" />
             Comments &ge; {filters.minComments}
              <button onClick={(e) => { e.stopPropagation(); onFilterChange({ minComments: null }); }} className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"><X className="w-3 h-3" /></button>
           </span>
         );
       }

        return badges;
      };

  return (
    <div className="w-full mb-8">
       <Disclosure defaultOpen={true}>
        {({ open }) => (
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ${open ? 'ring-2 ring-brand-primary/5 border-transparent' : ''}`}>
             
             {/* Header */}
            <Disclosure.Button className="w-full px-6 py-4 flex justify-between items-center bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary/20">
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className={`p-2.5 rounded-xl transition-colors ${open ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                   {activeCount > 0 ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Filter className="w-5 h-5" />}
                 </div>
                 <div className="flex flex-col items-start gap-0.5">
                    <span className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">Instagram {t('filters')}</span>
                    {/* Active Filter Summary */}
                    <div className="flex flex-wrap gap-2 min-h-[1.25rem]">
                        {!open && activeCount > 0 ? (
                            <div className="flex flex-wrap gap-1.5 animate-fade-in">
                                {renderActiveFilterBadges()}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {activeCount > 0 ? `${activeCount} active filters` : t('refineSearchResults') || "Refine search results"}
                            </span>
                        )}
                    </div>
                 </div>
              </div>
              <div className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5" />
              </div>
            </Disclosure.Button>

            {/* Panel Content */}
            <Transition
              enter="transition duration-200 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-150 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="px-6 pb-6 pt-2">
                 {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                     {/* Username Filter */}
                    <div className={inputContainerClass}>
                        <label className={labelClass}>
                            <User className="w-3.5 h-3.5" /> {t('select_user')}
                        </label>
                        <div className={inputWrapperClass}>
                            <Select 
                                id="username" 
                                name="username" 
                                value={filters.username} 
                                onChange={handleInputChange} 
                                options={usernameOptions} 
                                className="h-full"
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
                           <DateRangePicker 
                                date={date} 
                                setDate={onDateChange} 
                                icon={<CalendarIcon className="w-4 h-4" />}
                                variant="pink" 
                                t={t}
                           />
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
                                className="h-full"
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
                            <div className="relative">
                                <input
                                    type="number"
                                    name="minLikes"
                                    placeholder="0"
                                    value={filters.minLikes ?? ''}
                                    onChange={handleLikesChange}
                                    className="w-full h-[46px] pl-4 pr-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all shadow-sm"
                                    min="0"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <Heart size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Comments Filter */}
                        <div className={inputContainerClass}>
                            <label className={labelClass}>
                                <MessageCircle className="w-3.5 h-3.5" /> {t('min_comments')}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="minComments"
                                    placeholder="0"
                                    value={filters.minComments ?? ''}
                                    onChange={handleCommentsChange}
                                    className="w-full h-[46px] pl-4 pr-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all shadow-sm"
                                    min="0"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <MessageCircle size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Filters Row (Expanded) */}
                {activeCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active Filters:
                        </span>
                        {renderActiveFilterBadges()}
                        <div className="flex-1" />
                        <button 
                            onClick={onReset} 
                            className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 px-2 py-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            {t('resetFilters')}
                        </button>
                    </div>
                )}

                 {/* Footer / Controls */}
                 <div className="flex flex-col sm:flex-row justify-between items-center pt-5 border-t border-gray-100 dark:border-gray-700 gap-4">
                     {/* Sort Options */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                            <ArrowUpDown className="w-3.5 h-3.5" /> {t('sort_by')}:
                        </span>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Sort Criteria */}
                             <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                {[
                                    { id: 'likes', icon: Heart, label: t('likes') },
                                    { id: 'comments', icon: MessageCircle, label: t('comments') }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onSortByChange(item.id as 'likes' | 'comments')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${currentSortBy === item.id 
                                            ? 'bg-white dark:bg-gray-600 text-brand-primary shadow-sm ring-1 ring-black/5' 
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                    >
                                        <item.icon size={13} className={currentSortBy === item.id ? 'fill-current' : ''} />
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Sort Direction */}
                            <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                 {[
                                    { id: 'desc', icon: ArrowDown, label: t('descending') },
                                    { id: 'asc', icon: ArrowUp, label: t('ascending') }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onSortChange(item.id as 'asc' | 'desc')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${currentSort === item.id 
                                            ? 'bg-white dark:bg-gray-600 text-brand-primary shadow-sm ring-1 ring-black/5' 
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                        title={item.label}
                                    >
                                        <item.icon size={13} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

              </Disclosure.Panel>
            </Transition>
          </div>
        )}
       </Disclosure>
    </div>
  );
};

export default InstagramFilterComponent;
