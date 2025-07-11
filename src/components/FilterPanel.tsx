import React, { useState, memo, useMemo, useEffect } from 'react';
import { Search, Store, Calendar, LayoutGrid, List, X, ListFilter, Languages } from 'lucide-react';
import { FilterConfig, Product, DateRangePreset } from '../types';
import { getAvailableLanguages } from '../utils';

interface FilterPanelProps {
  filters: FilterConfig;
  onFilterChange: (filters: Partial<FilterConfig>) => void;
  onClearFilters: () => void;
  products: Product[];
  displayMode: 'grid' | 'table';
  onDisplayModeChange: (mode: 'grid' | 'table') => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
}

function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  products,
  itemsPerPage,
  onItemsPerPageChange,
  displayMode,
  onDisplayModeChange,
}: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState(filters.title || '');

  useEffect(() => {
    setSearchTerm(filters.title || '');
  }, [filters.title]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ title: searchTerm });
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onClearFilters();
  };

  const vendors = useMemo(() => Array.from(new Set(products.map(p => p.vendor).filter(Boolean))), [products]);
  const availableLanguages = useMemo(() => getAvailableLanguages(products), [products]);
  const isAnyFilterActive = filters.title || filters.vendor || filters.language || (filters.dateRange && filters.dateRange !== 'all');
  const showCustomDatePickers = filters.dateRange === 'custom';
  
  const commonInputClasses = "w-full appearance-none pl-10 pr-4 py-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface focus:ring-2 focus:ring-brand-primary";

  return (
    <div dir="rtl" className="p-4 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md mb-6 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex-grow min-w-[250px] relative">
          <form onSubmit={handleSearchSubmit}>
            <input type="text" placeholder="البحث عن المنتجات..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={commonInputClasses} />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary"><Search className="w-5 h-5" /></button>
          </form>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <select value={filters.vendor || ''} onChange={(e) => onFilterChange({ vendor: e.target.value || undefined })} className={commonInputClasses}>
              <option value="">كل المتاجر</option>
              {vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary w-5 h-5" />
          </div>
          <div className="relative">
            <select value={filters.language || ''} onChange={(e) => onFilterChange({ language: e.target.value || undefined })} className={commonInputClasses}>
              <option value="">كل اللغات</option>
              {availableLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary w-5 h-5" />
          </div>
          <div className="relative">
            <select value={filters.dateRange || 'all'} onChange={(e) => onFilterChange({ dateRange: e.target.value as DateRangePreset })} className={commonInputClasses}>
              <option value="all">كل الأوقات</option>
              <option value="past_week">آخر أسبوع</option>
              <option value="past_month">آخر شهر</option>
              <option value="custom">تاريخ مخصص</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary w-5 h-5" />
          </div>
          {showCustomDatePickers && (
              <>
                <div className="relative"><input type="date" value={filters.customStartDate || ''} onChange={(e) => onFilterChange({customStartDate: e.target.value})} className={commonInputClasses.replace('pl-10', 'px-3')} /></div>
                <div className="relative"><input type="date" value={filters.customEndDate || ''} onChange={(e) => onFilterChange({customEndDate: e.target.value})} className={commonInputClasses.replace('pl-10', 'px-3')} /></div>
              </>
          )}
           <div className="relative">
                <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))} className={commonInputClasses}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={160}>160</option>
                </select>
                <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary w-5 h-5" />
             </div>
          {isAnyFilterActive && (
            <button onClick={handleClear} className="flex items-center gap-2 text-sm text-brand-danger hover:text-brand-dangerHover transition-colors"><X className="w-4 h-4" /> مسح</button>
          )}
        </div>

        <div className="flex items-center bg-light-background dark:bg-dark-background rounded-xl p-1">
          <button onClick={() => onDisplayModeChange('grid')} className={`px-3 py-1 rounded-lg ${displayMode === 'grid' ? 'bg-light-surface dark:bg-dark-surface shadow' : 'text-light-text-secondary'}`}><LayoutGrid className="w-5 h-5" /></button>
          <button onClick={() => onDisplayModeChange('table')} className={`px-3 py-1 rounded-lg ${displayMode === 'table' ? 'bg-light-surface dark:bg-dark-surface shadow' : 'text-light-text-secondary'}`}><List className="w-5 h-5" /></button>
        </div>

      </div>
    </div>
  );
}

export default memo(FilterPanel);
