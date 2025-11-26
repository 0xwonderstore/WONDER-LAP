import React, { useState } from 'react';
import { LayoutGrid, List, X, Search, Store, Globe, Calendar as CalendarIcon, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import Select from './Select';
import { DateRange } from 'react-day-picker';
import MultiSelect from './MultiSelect';
import { DateRangePicker } from './DateRangePicker';

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
  const [isExpanded, setIsExpanded] = useState(true);
  
  const isFilterActive = filters.name !== '' || filters.store !== '' || filters.language !== '' || (date?.from !== undefined);

  const perPageOptions = [24, 48, 100, 160].map(v => ({ value: String(v), label: `${v} ${t.product}` }));
  const storeOptions = [{ value: '', label: t.allStores }, ...stores.map(s => ({ value: s, label: s }))];
  const languageOptions = [{ value: '', label: t.allLanguages }, ...languages.map(l => ({ value: l, label: `${l.toUpperCase()} (${languageCounts[l] || 0})` }))];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg mb-8 border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
      {/* Header / Toggle Bar */}
      <div 
        className="px-6 py-4 flex justify-between items-center cursor-pointer bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold">
           <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
             <Filter className="w-5 h-5" />
           </div>
           <span>{t.filters}</span>
           {isFilterActive && <span className="w-2 h-2 rounded-full bg-brand-primary ml-2"></span>}
        </div>
        <div className="text-gray-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`px-6 transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] py-6 opacity-100' : 'max-h-0 py-0 opacity-0 overflow-hidden'}`}>
        <div className="flex flex-col gap-6">
            
            {/* Top Row: Search and Key Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="col-span-1 md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t.search}</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={filters.name}
                            onChange={(e) => onFilterChange('name', e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all duration-200 placeholder-gray-400 text-sm shadow-sm"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-brand-primary transition-colors" />
                    </div>
                </div>

                {/* Store Filter */}
                <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Store className="w-3 h-3" /> {t.store}</label>
                    <Select 
                        options={storeOptions} 
                        value={filters.store} 
                        onChange={(e) => onFilterChange('store', e.target.value)} 
                        className="w-full py-2.5 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm focus:ring-brand-primary/50 shadow-sm"
                    />
                </div>

                {/* Language Filter */}
                <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Globe className="w-3 h-3" /> {t.language}</label>
                    <Select 
                        options={languageOptions} 
                        value={filters.language} 
                        onChange={(e) => onFilterChange('language', e.target.value)} 
                        className="w-full py-2.5 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm focus:ring-brand-primary/50 shadow-sm"
                    />
                </div>

                {/* Date Picker */}
                {setDate && (
                    <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {t.date}</label>
                    <DateRangePicker date={date} setDate={setDate} />
                    </div>
                )}
            </div>


            {/* Bottom Row: Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 gap-4">
                {/* Left: Per Page */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{t.show}:</span>
                    <div className="w-32">
                        <Select 
                            value={String(productsPerPage)} 
                            onChange={(e) => onProductsPerPageChange(Number(e.target.value))} 
                            options={perPageOptions}
                            className="py-1.5 text-sm rounded-lg"
                        />
                    </div>
                </div>

                {/* Right: Reset & View Mode */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {isFilterActive && (
                        <button 
                            onClick={onResetFilters} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
                        >
                            <X className="w-4 h-4" />
                            {t.resetFilters}
                        </button>
                    )}
                    
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button 
                            onClick={() => onViewModeChange('grid')} 
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onViewModeChange('table')} 
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            title="Table View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
