import React from 'react';
import { LayoutGrid, List, ChevronDown, X } from 'lucide-react';
import { Locale } from '../types';
import { translations } from '../translations';

interface FilterComponentProps {
  locale: Locale;
  stores: string[];
  filters: {
    name: string;
    store: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
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
  const isFilterActive = filters.name !== '' || filters.store !== '';

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 shadow-md flex flex-wrap gap-4 items-end">
      <div className="flex-grow min-w-[150px]">
        <label htmlFor="name-search" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
          {t.searchByName}
        </label>
        <input type="text" id="name-search" placeholder={t.searchPlaceholder} value={filters.name} onChange={(e) => onFilterChange('name', e.target.value)}
          className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary" />
      </div>

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

      <div className="flex items-end gap-2">
        {isFilterActive && (
          <div className="relative group">
            <button 
              onClick={onResetFilters} 
              className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
              aria-label={t.resetFilters}
            >
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
