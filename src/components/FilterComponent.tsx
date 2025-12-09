import React, { useState, useEffect, Fragment } from 'react';
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
import Select from './Select';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import { format } from 'date-fns';

interface FilterComponentProps {
  t: any;
  stores: string[];
  languages: string[];
  languageCounts: { [key: string]: number };
  filters: {
    name: string;
    store: string;
    language: string;
  };
  date?: DateRange | undefined;
  setDate?: (date: DateRange | undefined) => void;
  onFilterChange: (filterName: string, value: string) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  productsPerPage: number;
  onProductsPerPageChange: (value: number) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  t, stores, languages, languageCounts, filters, date, setDate, onFilterChange, onResetFilters, viewMode, onViewModeChange, productsPerPage, onProductsPerPageChange
}) => {
  // Typewriter Effect State
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  const placeholders = [
    t.searchPlaceholder || "Search products...",
    "iPhone 15 Pro",
    "Nike Air Max",
    "PlayStation 5",
    "Samsung Galaxy",
    "MacBook Air",
    "Gaming Laptop",
    "Wireless Headphones"
  ];

  // Blinking cursor effect
  useEffect(() => {
    const timeout2 = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout2);
  }, [blink]);

  // Typewriter logic
  useEffect(() => {
    if (index === placeholders.length) {
        setIndex(0);
        return;
    }

    if (subIndex === placeholders[index].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000); 
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % placeholders.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 75 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, placeholders]);

  useEffect(() => {
      setDisplayText(placeholders[index].substring(0, subIndex));
  }, [subIndex, index, placeholders]);

  
  const isFilterActive = filters.name !== '' || filters.store !== '' || filters.language !== '' || (date?.from !== undefined);

  const perPageOptions = [24, 50, 100, 200];
  const storeOptions = [{ value: '', label: t.allStores }, ...stores.map(s => ({ value: s, label: s }))];
  const languageOptions = [{ value: '', label: t.allLanguages }, ...languages.map(l => ({ value: l, label: `${l.toUpperCase()} (${languageCounts[l] || 0})` }))];

  // Helper to render active filter badges
  const renderActiveFilterBadges = () => {
    const badges = [];
    if (filters.name) {
      badges.push(
        <span key="search" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          "{filters.name}"
          <button onClick={(e) => { e.stopPropagation(); onFilterChange('name', ''); }} className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"><X className="w-3 h-3" /></button>
        </span>
      );
    }
    if (filters.store) {
      badges.push(
        <span key="store" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
          {filters.store}
          <button onClick={(e) => { e.stopPropagation(); onFilterChange('store', ''); }} className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"><X className="w-3 h-3" /></button>
        </span>
      );
    }
    if (filters.language) {
       badges.push(
        <span key="lang" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          {filters.language.toUpperCase()}
          <button onClick={(e) => { e.stopPropagation(); onFilterChange('language', ''); }} className="ml-1 text-orange-600 hover:text-orange-800 dark:text-orange-400"><X className="w-3 h-3" /></button>
        </span>
      );
    }
    if (date?.from) {
       badges.push(
        <span key="date" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {format(date.from, 'MMM d')} {date.to ? `- ${format(date.to, 'MMM d')}` : ''}
           <button onClick={(e) => { e.stopPropagation(); setDate?.(undefined); }} className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400"><X className="w-3 h-3" /></button>
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
                 <div className={`p-2.5 rounded-xl transition-colors ${open ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                   <Filter className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col items-start gap-0.5">
                    <span className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">{t.filters}</span>
                    {/* Active Filter Summary (visible when collapsed or expanded) */}
                    <div className="flex flex-wrap gap-2 min-h-[1.25rem]">
                        {!open && isFilterActive ? (
                            <div className="flex flex-wrap gap-1.5 animate-fade-in">
                                {renderActiveFilterBadges()}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {t.refineSearchResults || "Refine your search results"}
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
                    
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                            <Search className="w-3.5 h-3.5" /> {t.search}
                        </label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={filters.name}
                                onChange={(e) => onFilterChange('name', e.target.value)}
                                placeholder={`${displayText}${blink && !filters.name ? '|' : ''}`}
                                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm font-medium shadow-sm"
                            />
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                            {filters.name && (
                                <button
                                    onClick={() => onFilterChange('name', '')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Store */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                            <Store className="w-3.5 h-3.5" /> {t.store}
                        </label>
                        <Select 
                            options={storeOptions} 
                            value={filters.store} 
                            onChange={(e) => onFilterChange('store', e.target.value)} 
                            className="h-[46px]" // match input height
                        />
                    </div>

                    {/* Date */}
                    {setDate && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <CalendarIcon className="w-3.5 h-3.5" /> {t.date}
                            </label>
                            <DateRangePicker date={date} setDate={setDate} />
                        </div>
                    )}

                    {/* Language */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                            <Globe className="w-3.5 h-3.5" /> {t.language}
                        </label>
                        <Select 
                            options={languageOptions} 
                            value={filters.language} 
                            onChange={(e) => onFilterChange('language', e.target.value)} 
                            className="h-[46px]"
                        />
                    </div>
                </div>

                {/* Active Filters Row (Expanded) */}
                {isFilterActive && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active Filters:
                        </span>
                        {renderActiveFilterBadges()}
                        <div className="flex-1" />
                        <button 
                            onClick={onResetFilters} 
                            className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 px-2 py-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            {t.resetFilters}
                        </button>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-5 border-t border-gray-100 dark:border-gray-700 gap-4">
                    
                    {/* View Density */}
                    <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" /> {t.show}:
                        </span>
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            {perPageOptions.map(size => (
                                <button
                                    key={size}
                                    onClick={() => onProductsPerPageChange(size)}
                                    className={`relative px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                                        productsPerPage === size 
                                        ? 'bg-white dark:bg-gray-600 text-brand-primary shadow-sm ring-1 ring-black/5' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* View Layout */}
                    <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
                            View:
                        </span>
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <button 
                                onClick={() => onViewModeChange('grid')} 
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 ${
                                    viewMode === 'grid' 
                                    ? 'bg-white dark:bg-gray-600 text-brand-primary shadow-sm ring-1 ring-black/5' 
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="text-xs font-semibold hidden sm:inline">Grid</span>
                            </button>
                            <button 
                                onClick={() => onViewModeChange('table')} 
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 ${
                                    viewMode === 'table' 
                                    ? 'bg-white dark:bg-gray-600 text-brand-primary shadow-sm ring-1 ring-black/5' 
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                            >
                                <List className="w-4 h-4" />
                                <span className="text-xs font-semibold hidden sm:inline">Table</span>
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
