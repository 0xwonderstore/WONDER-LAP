import React from 'react';
import { LayoutGrid, List, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import Select from './Select';

interface FilterComponentProps {
  t: any;
  stores: string[];
  filters: {
    name: string;
    store: string;
  };
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  onFilterChange: (filterName: string, value: string) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  productsPerPage: number;
  onProductsPerPageChange: (value: number) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  t, stores, filters, date, setDate, onFilterChange, onResetFilters, viewMode, onViewModeChange, productsPerPage, onProductsPerPageChange
}) => {
  const isFilterActive = filters.name !== '' || filters.store !== '' || date !== undefined;

  const storeOptions = [
    { value: '', label: t.allStores },
    ...stores.sort().map(s => ({ value: s, label: s }))
  ];

  const perPageOptions = [24, 48, 100, 160].map(v => ({ value: String(v), label: `${v} ${t.product}` }));

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 shadow-md flex flex-wrap gap-4 items-end">
      {/* Search Input */}
      <div className="flex-grow min-w-[200px]">
        <label htmlFor="name-search" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t.searchByName}</label>
        <input type="text" id="name-search" placeholder={t.searchPlaceholder} value={filters.name} onChange={(e) => onFilterChange('name', e.target.value)}
          className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary" />
      </div>

      {/* Store Select */}
      <div className="flex-grow min-w-[150px]">
        <label htmlFor="store-select" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t.selectStore}</label>
        <Select id="store-select" value={filters.store} onChange={(e) => onFilterChange('store', e.target.value)} options={storeOptions} />
      </div>

      {/* Date Range Picker */}
      <div className="flex-grow min-w-[240px]">
         <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t.dateAdded}</label>
        <DateRangePicker date={date} setDate={setDate} />
      </div>
      
      {/* Products Per Page Select */}
      <div className="flex-grow min-w-[140px]">
        <label htmlFor="per-page-select" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t.show}</label>
        <Select id="per-page-select" value={String(productsPerPage)} onChange={(e) => onProductsPerPageChange(Number(e.target.value))} options={perPageOptions} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-end gap-2">
        {isFilterActive && (
          <button onClick={onResetFilters} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors" aria-label={t.resetFilters}>
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="flex rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <button onClick={() => onViewModeChange('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`}><LayoutGrid className="h-5 w-5" /></button>
          <button onClick={() => onViewModeChange('table')} className={`p-2.5 ${viewMode === 'table' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`}><List className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
