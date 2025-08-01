import React, { useState } from 'react';
import { LayoutGrid, List, ChevronDown, X, Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { Locale } from '../types';
import { translations } from '../translations';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Calendar } from './Calendar';
import { cn } from '../utils/cn';

type Preset = 'lastWeek' | 'lastMonth' | 'last6Months' | 'lastYear' | 'custom';

interface FilterComponentProps {
  locale: Locale;
  stores: string[];
  filters: {
    name:string;
    store: string;
    dateRange: DateRange | undefined;
  };
  onFilterChange: (filterName: string, value: any) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  productsPerPage: number;
  onProductsPerPageChange: (value: number) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  locale, stores, filters, onFilterChange, onResetFilters, viewMode, onViewModeChange, productsPerPage, onProductsPerPageChange
}) => {
  const t = translations[locale];
  const [activePreset, setActivePreset] = useState<Preset | null>(null);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFilterChange('dateRange', range);
  };
  
  const handlePresetClick = (preset: Preset) => {
    setActivePreset(preset);
    let range: DateRange | undefined;
    const today = new Date();
    switch (preset) {
        case 'lastWeek':
            range = { from: subDays(today, 7), to: today };
            break;
        case 'lastMonth':
            range = { from: subMonths(today, 1), to: today };
            break;
        case 'last6Months':
            range = { from: subMonths(today, 6), to: today };
            break;
        case 'lastYear':
            range = { from: subYears(today, 1), to: today };
            break;
        default:
            range = undefined;
    }
    handleDateRangeChange(range);
};


  const isFilterActive = filters.name !== '' || filters.store !== '' || filters.dateRange !== undefined;

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 shadow-md flex flex-wrap gap-4 items-end">
      {/* Search Input */}
      <div className="flex-grow min-w-[150px]">
        <label htmlFor="name-search" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
          {t.searchByName}
        </label>
        <input type="text" id="name-search" placeholder={t.searchPlaceholder} value={filters.name} onChange={(e) => onFilterChange('name', e.target.value)}
          className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary" />
      </div>

      {/* Store and Per Page Selects */}
      {[
        { id: 'store-select', label: t.selectStore, value: filters.store, onChange: (e:any) => onFilterChange('store', e.target.value), options: [ { value: '', label: t.allStores }, ...stores.sort().map(s => ({ value: s, label: s })) ] },
        { id: 'per-page-select', label: t.show, value: productsPerPage, onChange: (e:any) => onProductsPerPageChange(Number(e.target.value)), options: [24, 48, 100, 160].map(v => ({ value: v, label: `${v} ${t.product}` })) }
      ].map(select => (
        <div key={select.id} className="flex-grow min-w-[140px]">
          <label htmlFor={select.id} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{select.label}</label>
          <div className="relative">
            <select id={select.id} value={select.value} onChange={select.onChange} className="w-full appearance-none cursor-pointer p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary text-right ltr:text-left ltr:pr-10 rtl:pl-10">
              {select.options.map((opt: any) => ( <option key={opt.value} value={opt.value}>{opt.label}</option> ))}
            </select>
            <ChevronDown className="w-5 h-5 absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      ))}
      
      {/* Date Range Picker */}
      <div className="flex-grow min-w-[240px]">
          <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
              {t.dateRange}
          </label>
          <Popover>
              <PopoverTrigger asChild>
                  <button
                      id="date"
                      className={cn(
                          "w-full justify-start text-left font-normal p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary flex items-center",
                          !filters.dateRange && "text-light-text-secondary dark:text-dark-text-secondary"
                      )}
                  >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                          filters.dateRange.to ? (
                              <>
                                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                  {format(filters.dateRange.to, "LLL dd, y")}
                              </>
                          ) : (
                              format(filters.dateRange.from, "LLL dd, y")
                          )
                      ) : (
                          <span>{t.customRange}</span>
                      )}
                  </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                  <div className="p-4 border-r border-light-border dark:border-dark-border">
                      <div className="flex flex-col space-y-2">
                        {(['lastWeek', 'lastMonth', 'last6Months', 'lastYear'] as Preset[]).map((preset) => (
                           <button key={preset} onClick={() => handlePresetClick(preset)}
                                  className={cn("p-2 text-left rounded-md text-sm hover:bg-light-hover dark:hover:bg-dark-hover", activePreset === preset && "bg-light-hover dark:bg-dark-hover")}>
                               {t[preset]}
                           </button>
                        ))}
                      </div>
                  </div>
                  <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from}
                      selected={filters.dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                  />
                </div>
              </PopoverContent>
          </Popover>
      </div>


      {/* Action Buttons */}
      <div className="flex items-end gap-2">
        {isFilterActive && (
          <div className="relative group">
            <button onClick={onResetFilters} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors" aria-label={t.resetFilters}>
              <X className="h-5 w-5" />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover:scale-100">
              {t.resetFilters}
            </div>
          </div>
        )}
        <div className="flex rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <button onClick={() => onViewModeChange('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`} aria-label="Grid View"><LayoutGrid className="h-5 w-5" /></button>
          <button onClick={() => onViewModeChange('table')} className={`p-2.5 ${viewMode === 'table' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`} aria-label="Table View"><List className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;