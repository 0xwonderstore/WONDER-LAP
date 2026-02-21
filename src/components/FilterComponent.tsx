import React, { useState, useEffect } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { 
  LayoutGrid, 
  List, 
  X, 
  Search, 
  Store, 
  Globe, 
  Calendar as CalendarIcon, 
  Filter, 
  ChevronDown, 
  Layers, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import MultiSelect from './MultiSelect';
import { DateRange } from 'react-day-picker';
import DateRangePicker from './DateRangePicker';
import { format } from 'date-fns';

interface FilterComponentProps {
  t: any;
  stores: string[];
  languages: string[];
  languageCounts: { [key: string]: number };
  filters: {
    name: string;
    store: string[];
    language: string[];
  };
  date?: DateRange | undefined;
  setDate?: (date: DateRange | undefined) => void;
  onFilterChange: (filterName: string, value: any) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  productsPerPage: number;
  onProductsPerPageChange: (value: number) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  t, stores, languages, languageCounts, filters, date, setDate, onFilterChange, onResetFilters, viewMode, onViewModeChange, productsPerPage, onProductsPerPageChange
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Keywords are derived directly from the filter string
  const keywords = filters.name.split(/[\s,]+/).map(kw => kw.trim()).filter(Boolean);

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter(kw => kw !== keywordToRemove);
    onFilterChange('name', newKeywords.join(' '));
  };

  const isFilterActive = keywords.length > 0 || filters.store.length > 0 || filters.language.length > 0 || (date?.from !== undefined);

  const perPageOptions = [24, 52, 100, 200];
  const storeOptions = stores.map(s => ({ value: s, label: s }));
  const languageOptions = languages.map(l => ({ value: l, label: `${l.toUpperCase()} (${languageCounts[l] || 0})` }));

  const renderActiveFilterBadges = () => {
    const badges = [];
    if (keywords.length > 0) {
        keywords.forEach(keyword => {
        badges.push(
          <span key={`search-${keyword}`} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500 text-white animate-scale-in shadow-md cursor-default">
            "{keyword}"
            <button onClick={(e) => { e.stopPropagation(); handleRemoveKeyword(keyword); }} className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"><X className="w-3.5 h-3.5" /></button>
          </span>
        );
      });
    }
    if (filters.store.length > 0) {
      badges.push(
        <span key="store" className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500 text-white animate-scale-in shadow-md cursor-default">
          {filters.store.length > 1 ? `${filters.store.length} Stores` : filters.store[0]}
          <button onClick={(e) => { e.stopPropagation(); onFilterChange('store', []); }} className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </span>
      );
    }
    if (filters.language.length > 0) {
       badges.push(
        <span key="lang" className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500 text-white animate-scale-in shadow-md cursor-default">
          {filters.language.length > 1 ? `${filters.language.length} Languages` : filters.language[0].toUpperCase()}
          <button onClick={(e) => { e.stopPropagation(); onFilterChange('language', []); }} className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </span>
      );
    }
    if (date?.from) {
       badges.push(
        <span key="date" className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-white animate-scale-in shadow-md cursor-default">
          {format(date.from, 'MMM d')} {date.to ? `- ${format(date.to, 'MMM d')}` : ''}
           <button onClick={(e) => { e.stopPropagation(); setDate?.(undefined); }} className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </span>
      );
    }
    return badges;
  };

  return (
    <div className="w-full mb-8">
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <div className={`bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out ${open ? 'ring-1 ring-brand-primary/10' : ''} ${!open ? 'overflow-hidden' : ''}`}>
            
            <Disclosure.Button className="w-full px-8 py-6 flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-300 outline-none group z-10 relative">
              <div className="flex items-center gap-5">
                 <div className={`p-3.5 rounded-2xl transition-all duration-500 ${open ? 'bg-gradient-to-tr from-brand-primary to-purple-600 text-white shadow-lg shadow-brand-primary/30 rotate-3 scale-110' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                   <Filter className="w-6 h-6" />
                 </div>
                 <div className="flex flex-col items-start gap-1">
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight group-hover:text-brand-primary transition-colors">{t.filters}</span>
                    <div className="h-5 flex items-center">
                        {!open && isFilterActive ? (
                             <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5 animate-fade-in bg-brand-primary/10 px-2.5 py-1 rounded-full border border-brand-primary/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"/>
                                Active Filters
                             </span>
                        ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
                                {t.refineSearchResults || "Refine your search results"}
                            </span>
                        )}
                    </div>
                 </div>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center rounded-full border border-gray-100 dark:border-gray-700 text-gray-400 transition-all duration-500 ${open ? 'rotate-180 bg-gray-50 dark:bg-gray-700 text-brand-primary shadow-inner border-transparent' : 'bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 group-hover:shadow-md'}`}>
                  <ChevronDown className="w-6 h-6" />
              </div>
            </Disclosure.Button>

            <Transition
              enter="transition duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              enterFrom="transform scale-95 opacity-0 max-h-0"
              enterTo="transform scale-100 opacity-100 max-h-[1000px]"
              leave="transition duration-300 ease-in"
              leaveFrom="transform scale-100 opacity-100 max-h-[1000px]"
              leaveTo="transform scale-95 opacity-0 max-h-0"
            >
              <Disclosure.Panel className="px-8 pb-10 pt-2 relative overflow-visible">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent opacity-50" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 mt-6 relative z-20">
                    
                    <div className="lg:col-span-2 h-[72px] relative group z-40">
                         <div className={`relative w-full h-full bg-white dark:bg-gray-800 border rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300
                             ${isSearchFocused 
                                ? 'ring-4 ring-blue-500/20 border-blue-500 shadow-lg scale-[1.02]' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5'
                             }`}
                         >
                             <div className="flex items-center gap-3 overflow-hidden flex-1">
                                <div className={`p-2 rounded-xl transition-colors duration-300 ${isSearchFocused ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                                    <Search className={`w-4 h-4 transition-colors duration-300 ${isSearchFocused ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
                                </div>
                                <div className="flex flex-col flex-1">
                                     {keywords.length > 0 && (
                                         <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5 animate-fade-in">
                                            {t.search}
                                         </span>
                                     )}
                                     <input 
                                        type="text" 
                                        value={filters.name}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setIsSearchFocused(false)}
                                        onChange={(e) => onFilterChange('name', e.target.value)}
                                        placeholder={t.searchPlaceholder || 'Paste keywords here...'}
                                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                     />
                                </div>
                             </div>
                             {filters.name && (
                                <button
                                    onClick={() => onFilterChange('name', '')}
                                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                             )}
                         </div>
                         {keywords.length > 0 && (
                            <div className="absolute top-full left-0 mt-3 w-full z-10 pointer-events-none">
                                <div className="flex flex-wrap gap-2 pointer-events-auto">
                                    {keywords.map(keyword => (
                                        <div key={keyword} className="flex items-center gap-1.5 bg-blue-500 text-white shadow-lg shadow-gray-200 dark:shadow-black/20 rounded-lg pl-2.5 pr-1 py-1 text-[10px] font-bold uppercase tracking-wider animate-pop-in border border-white/20">
                                            <span className="max-w-[150px] truncate">{keyword}</span>
                                            <button onClick={() => handleRemoveKeyword(keyword)} className="hover:bg-white/20 text-white rounded-md p-0.5 transition-colors"><X size={10} strokeWidth={3} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>

                    <div className="h-[72px] relative z-30">
                        <MultiSelect 
                            options={storeOptions} 
                            selected={filters.store} 
                            onChange={(selected) => onFilterChange('store', selected)} 
                            label={t.allStores}
                            icon={<Store className="w-4 h-4" />}
                            variant="purple"
                        />
                    </div>

                    {setDate && (
                        <div className="h-[72px] relative z-30">
                            <DateRangePicker 
                                date={date} 
                                setDate={setDate} 
                                icon={<CalendarIcon className="w-4 h-4" />}
                                variant="green"
                                label={t.date}
                            />
                        </div>
                    )}

                    <div className="h-[72px] relative z-20">
                        <MultiSelect 
                            options={languageOptions} 
                            selected={filters.language} 
                            onChange={(selected) => onFilterChange('language', selected)} 
                            label={t.allLanguages}
                            icon={<Globe className="w-4 h-4" />}
                            variant="orange"
                        />
                    </div>
                </div>

                {isFilterActive && (
                    <div className="flex flex-wrap items-center gap-3 mb-10 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-inner relative z-10 animate-fade-in-up">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-2 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Active Filters:
                        </span>
                        <div className="flex flex-wrap gap-2">
                             {renderActiveFilterBadges()}
                        </div>
                        <div className="flex-1" />
                        <button 
                            onClick={onResetFilters} 
                            className="group flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg shadow-red-500/20 active:scale-95"
                        >
                            <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
                            {t.resetFilters}
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-700 gap-8 relative z-10">
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-4 h-4" /> {t.show}:
                        </span>
                        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                            {perPageOptions.map(size => (
                                <button
                                    key={size}
                                    onClick={() => onProductsPerPageChange(size)}
                                    className={`relative min-w-[3.5rem] h-9 rounded-lg text-xs font-bold transition-all duration-300 ${
                                        productsPerPage === size 
                                        ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm scale-100 ring-1 ring-black/5 font-extrabold' 
                                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:flex items-center gap-2">
                            View:
                        </span>
                        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                            <button 
                                onClick={() => onViewModeChange('grid')} 
                                className={`flex items-center justify-center gap-2 px-5 h-9 rounded-lg transition-all duration-300 ${
                                    viewMode === 'grid' 
                                    ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm scale-100 ring-1 ring-black/5 font-extrabold' 
                                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="text-xs font-bold hidden sm:inline">Grid</span>
                            </button>
                            <button 
                                onClick={() => onViewModeChange('table')} 
                                className={`flex items-center justify-center gap-2 px-5 h-9 rounded-lg transition-all duration-300 ${
                                    viewMode === 'table' 
                                    ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm scale-100 ring-1 ring-black/5 font-extrabold' 
                                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <List className="w-4 h-4" />
                                <span className="text-xs font-bold hidden sm:inline">Table</span>
                            </button>
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

export default FilterComponent;
