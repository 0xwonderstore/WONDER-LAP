
import React, { useMemo } from 'react';
import { Product, FilterConfig, SortKey, SortOrder } from '../types';
import VendorFilter from './VendorFilter';
import { List, LayoutGrid, ArrowDown, ArrowUp } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterConfig;
  onFilterChange: (newFilters: Partial<FilterConfig>) => void;
  onClearFilters: () => void;
  products: Product[];
  sortKey: SortKey;
  onSortKeyChange: (key: SortKey) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  displayMode: 'grid' | 'table';
  onDisplayModeChange: (mode: 'grid' | 'table') => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  products,
  sortKey,
  onSortKeyChange,
  sortOrder,
  onSortOrderChange,
  displayMode,
  onDisplayModeChange,
  itemsPerPage,
  onItemsPerPageChange,
}: FilterPanelProps) {
  const allVendors = useMemo(() => {
    const vendors = new Set(products.map(p => p.vendor));
    return Array.from(vendors).sort();
  }, [products]);

  const allLanguages = useMemo(() => {
    const languages = new Set(products.map(p => p.language).filter(Boolean));
    return Array.from(languages).sort();
  }, [products]);

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl shadow-lg mb-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="بحث بالاسم..."
          value={filters.title}
          onChange={(e) => onFilterChange({ title: e.target.value })}
          className="p-2 w-full rounded-lg border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
        />
        <VendorFilter
          allVendors={allVendors}
          selectedVendors={filters.vendors}
          onSelectionChange={(selected) => onFilterChange({ vendors: selected })}
        />
        <select
          value={filters.language}
          onChange={(e) => onFilterChange({ language: e.target.value })}
          className="p-2 w-full rounded-lg border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">كل اللغات</option>
          {allLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <select value={sortKey} onChange={e => onSortKeyChange(e.target.value as SortKey)} className="p-2 rounded-lg border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background">
                <option value="created_at">تاريخ الإضافة</option>
                <option value="title">الاسم</option>
                <option value="vendor">المورّد</option>
            </select>
            <button onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg bg-light-background dark:bg-dark-background">
                {sortOrder === 'asc' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
            </button>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onDisplayModeChange('grid')} className={`p-2 rounded-lg ${displayMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`}>
                <LayoutGrid size={20} />
            </button>
            <button onClick={() => onDisplayModeChange('table')} className={`p-2 rounded-lg ${displayMode === 'table' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`}>
                <List size={20} />
            </button>
        </div>
        <button onClick={onClearFilters} className="px-4 py-2 bg-brand-danger/10 text-brand-danger font-semibold rounded-lg hover:bg-brand-danger/20">
          مسح الفلاتر
        </button>
      </div>
    </div>
  );
}
