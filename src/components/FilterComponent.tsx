import React from 'react';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import { Locale } from '../types';

const translations = {
  ar: { searchByName: 'ابحث بالاسم', searchPlaceholder: 'مثال: T-shirt', selectStore: 'اختر المتجر', allStores: 'كل المتاجر', selectLanguage: 'اختر اللغة', allLanguages: 'كل اللغات', creationDate: 'تاريخ الإنشاء', allTime: 'كل الأوقات', lastWeek: 'آخر أسبوع', lastMonth: 'آخر شهر', last3Months: 'آخر 3 أشهر', last6Months: 'آخر 6 أشهر', lastYear: 'آخر سنة', customDate: 'تاريخ مخصص', from: 'من', to: 'إلى', show: 'عرض', product: 'منتج' },
  en: { searchByName: 'Search by Name', searchPlaceholder: 'e.g., T-shirt', selectStore: 'Select Store', allStores: 'All Stores', selectLanguage: 'Select Language', allLanguages: 'All Languages', creationDate: 'Creation Date', allTime: 'All Time', lastWeek: 'Last Week', lastMonth: 'Last Month', last3Months: 'Last 3 Months', last6Months: 'Last 6 Months', lastYear: 'Last Year', customDate: 'Custom Date', from: 'From', to: 'To', show: 'Show', product: 'Product' }
};

const languageNames: { [key: string]: string } = {
  ar: 'العربية', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', ja: '日本語', ru: 'Русский',
};
const getLanguageName = (code: string) => languageNames[code] || code;

interface FilterComponentProps {
  locale: Locale;
  stores: string[];
  languages: string[];
  filters: {
    name: string;
    store: string;
    language: string;
    dateRange: string;
    startDate: string; // Changed back to string
    endDate: string;   // Changed back to string
  };
  onFilterChange: (filterName: string, value: string) => void;
  onDateRangeChange: (range: string, startDate?: string, endDate?: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  productsPerPage: number;
  onProductsPerPageChange: (value: number) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  locale, stores, languages, filters, onFilterChange, onDateRangeChange, viewMode, onViewModeChange, productsPerPage, onProductsPerPageChange
}) => {
  const t = translations[locale];

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 shadow-md flex flex-wrap gap-4 items-end">
      {/* ... other inputs ... */}
      <div className="flex-grow min-w-[150px]">
        <label htmlFor="name-search" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
          {t.searchByName}
        </label>
        <input type="text" id="name-search" placeholder={t.searchPlaceholder} value={filters.name} onChange={(e) => onFilterChange('name', e.target.value)}
          className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary" />
      </div>

      {[
        { id: 'store-select', label: t.selectStore, value: filters.store, onChange: (e:any) => onFilterChange('store', e.target.value), options: [ { value: '', label: t.allStores }, ...stores.map(s => ({ value: s, label: s })) ] },
        { id: 'language-select', label: t.selectLanguage, value: filters.language, onChange: (e:any) => onFilterChange('language', e.target.value), options: [ { value: '', label: t.allLanguages }, ...languages.map(l => ({ value: l, label: getLanguageName(l) })) ] },
        { id: 'date-range-select', label: t.creationDate, value: filters.dateRange, onChange: (e:any) => onDateRangeChange(e.target.value, '', ''), options: [ { value: '', label: t.allTime }, { value: 'last_week', label: t.lastWeek }, { value: 'last_month', label: t.lastMonth }, { value: 'last_3_months', label: t.last3Months }, { value: 'last_6_months', label: t.last6Months }, { value: 'last_year', label: t.lastYear }, { value: 'custom', label: t.customDate } ] },
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
      
      {filters.dateRange === 'custom' && (
        <>
          <div className="flex-grow min-w-[150px]">
            <label htmlFor="start-date" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t.from}</label>
            <input
              type="date"
              id="start-date"
              value={filters.startDate}
              onChange={(e) => onDateRangeChange('custom', e.target.value, filters.endDate)}
              className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="flex-grow min-w-[150px]">
            <label htmlFor="end-date" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t.to}</label>
            <input
              type="date"
              id="end-date"
              value={filters.endDate}
              onChange={(e) => onDateRangeChange('custom', filters.startDate, e.target.value)}
              className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </>
      )}

      <div className="flex items-end">
        <div className="flex rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <button onClick={() => onViewModeChange('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`} aria-label="Grid View"><LayoutGrid className="h-5 w-5" /></button>
          <button onClick={() => onViewModeChange('table')} className={`p-2.5 ${viewMode === 'table' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`} aria-label="Table View"><List className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
