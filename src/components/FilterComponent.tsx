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
        <span key="search" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-800 animate-scale-in shadow-sm">
          "{filters.name}"
          <button onClick={(e) => { e.stopPropagation(); onFilterChange('name', ''); }} className="ml-2 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 transition-colors"><X className="w-3 h-3" /></button>
        </span>
      );
    }
    if (filters.store) {
      badges.push(
        <span key="store" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border border-purple-200 dark:border-purple-800 animate-scale-in shadow-sm">
          {filters.store}
          <button onClick={(e) => { e.stopPropagation(); onFilterChange('store', ''); }} className="ml-2 p-0.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-600 dark:text-purple-300 transition-colors"><X className="w-3 h-3" /></button>
        </span>
      );
    }
    if (filters.language) {
       badges.push(
        <span key="lang" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border border-orange-200 dark:border-orange-800 animate-scale-in shadow-sm">
          {filters.language.toUpperCase()}
          <button onClick={(e) => { e.stopPropagation(); onFilterChange('language', ''); }} className="ml-2 p-0.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 text-orange-600 dark:text-orange-300 transition-colors"><X className="w-3 h-3" /></button>
        </span>
      );
    }
    if (date?.from) {
       badges.push(
        <span key="date" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border border-green-200 dark:border-green-800 animate-scale-in shadow-sm">
          {format(date.from, 'MMM d')} {date.to ? `- ${format(date.to, 'MMM d')}` : ''}
           <button onClick={(e) => { e.stopPropagation(); setDate?.(undefined); }} className="ml-2 p-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-300 transition-colors"><X className="w-3 h-3" /></button>
        </span>
      );
    }
    return badges;
  };

  return (
    <div className="w-full mb-8">
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out ${open ? 'ring-1 ring-brand-primary/10' : ''} ${!open ? 'overflow-hidden' : ''}`}>
            
            {/* Header */}
            <Disclosure.Button className="w-full px-6 py-5 flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-300 outline-none group rounded-3xl z-10 relative">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl transition-all duration-500 ${open ? 'bg-gradient-to-tr from-brand-primary to-purple-500 text-white shadow-lg shadow-brand-primary/30 rotate-3' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                   <Filter className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col items-start gap-1">
                    <span className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight group-hover:text-brand-primary transition-colors">{t.filters}</span>
                    {/* Active Filter Summary */}
                    <div className="h-5 flex items-center">
                        {!open && isFilterActive ? (
                             <span className="text-xs font-medium text-brand-primary flex items-center gap-1 animate-fade-in">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"/>
                                Filters active
                             </span>
                        ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                {t.refineSearchResults || "Refine your search results"}
                            </span>
                        )}
                    </div>
                 </div>
              </div>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 dark:border-gray-700 text-gray-400 transition-all duration-500 ${open ? 'rotate-180 bg-gray-50 dark:bg-gray-700 text-brand-primary shadow-inner' : 'bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110'}`}>
                  <ChevronDown className="w-5 h-5" />
              </div>
            </Disclosure.Button>

            {/* Panel Content */}
            <Transition
              enter="transition duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              enterFrom="transform scale-95 opacity-0 max-h-0"
              enterTo="transform scale-100 opacity-100 max-h-[1000px]"
              leave="transition duration-300 ease-in"
              leaveFrom="transform scale-100 opacity-100 max-h-[1000px]"
              leaveTo="transform scale-95 opacity-0 max-h-0"
            >
              <Disclosure.Panel className="px-6 pb-8 pt-2 relative overflow-visible">
                {/* Decorative Line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent opacity-50" />
                
                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4 relative z-20">
                    
                    {/* Search */}
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                            <Search className="w-3.5 h-3.5" /> {t.search}
                        </label>
                        <div className="relative group dynamic-border-focus rounded-xl">
                            <input 
                                type="text" 
                                value={filters.name}
                                onChange={(e) => onFilterChange('name', e.target.value)}
                                placeholder={`${displayText}${blink && !filters.name ? '|' : ''}`}
                                className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 focus:ring-0 focus:border-transparent outline-none transition-all text-sm font-medium shadow-sm h-[52px]"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                            {filters.name && (
                                <button
                                    onClick={() => onFilterChange('name', '')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all animate-scale-in"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Store */}
                    <div className="space-y-2.5 relative z-30">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                            <Store className="w-3.5 h-3.5" /> {t.store}
                        </label>
                        <Select 
                            options={storeOptions} 
                            value={filters.store} 
                            onChange={(e) => onFilterChange('store', e.target.value)} 
                            className="h-[52px]" 
                        />
                    </div>

                    {/* Date */}
                    {setDate && (
                        <div className="space-y-2.5 relative z-30">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <CalendarIcon className="w-3.5 h-3.5" /> {t.date}
                            </label>
                            <div className="h-[52px]">
                                <DateRangePicker date={date} setDate={setDate} />
                            </div>
                        </div>
                    )}

                    {/* Language */}
                    <div className="space-y-2.5 relative z-20">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                            <Globe className="w-3.5 h-3.5" /> {t.language}
                        </label>
                        <Select 
                            options={languageOptions} 
                            value={filters.language} 
                            onChange={(e) => onFilterChange('language', e.target.value)} 
                            className="h-[52px]"
                        />
                    </div>
                </div>

                {/* Active Filters Row (Expanded) */}
                {isFilterActive && (
                    <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-inner relative z-10">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1.5 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Active:
                        </span>
                        {renderActiveFilterBadges()}
                        <div className="flex-1" />
                        <button 
                            onClick={onResetFilters} 
                            className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 transition-all shadow-sm hover:shadow"
                        >
                            <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                            {t.resetFilters}
                        </button>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-700 gap-6 relative z-10">
                    
                    {/* View Density */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Layers className="w-4 h-4" /> {t.show}:
                        </span>
                        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner">
                            {perPageOptions.map(size => (
                                <button
                                    key={size}
                                    onClick={() => onProductsPerPageChange(size)}
                                    className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                        productsPerPage === size 
                                        ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm scale-105' 
                                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* View Layout */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:flex items-center gap-1.5">
                            View:
                        </span>
                        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner">
                            <button 
                                onClick={() => onViewModeChange('grid')} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                                    viewMode === 'grid' 
                                    ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm scale-105' 
                                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="text-xs font-bold hidden sm:inline">Grid</span>
                            </button>
                            <button 
                                onClick={() => onViewModeChange('table')} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                                    viewMode === 'table' 
                                    ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm scale-105' 
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
