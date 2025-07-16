import React from 'react';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import { Locale } from '../types';
import { getLanguageName } from '../utils/languageUtils'; // Import the new function

interface FilterComponentProps {
  locale: Locale;
  stores: string[];
  languages: string[];
  filters: { name: string; store: string; language: string; dateRange: string; startDate: string; endDate: string; };
  onFilterChange: (filterName: string, value: string) => void;
  onDateChange: (field: 'startDate' | 'endDate', value: string) => void;
  onDateRangeOptionChange: (range: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  productsPerPage: number;
  onProductsPerPageChange: (value: number) => void;
  onOpenBlacklist: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  locale,
  stores,
  languages,
  filters,
  onFilterChange,
  onDateChange,
  onDateRangeOptionChange,
  viewMode,
  onViewModeChange,
  productsPerPage,
  onProductsPerPageChange,
}) => {
  const t = locale === 'ar' ? {
    searchByName: 'ابحث بالاسم', searchPlaceholder: 'مثال: T-shirt', selectStore: 'اختر المتجر', allStores: 'كل المتاجر',
    selectLanguage: 'اختر اللغة', allLanguages: 'كل اللغات', creationDate: 'تاريخ الإنشاء', allTime: 'كل الأوقات',
    lastWeek: 'آخر أسبوع', lastMonth: 'آخر شهر', last3Months: 'آخر 3 أشهر', last6Months: 'آخر 6 أشهر',
    lastYear: 'آخر سنة', customDate: 'تاريخ مخصص', from: 'من', to: 'إلى', show: 'عرض', product: 'منتج'
  } : {
    searchByName: 'Search by Name', searchPlaceholder: 'e.g., T-shirt', selectStore: 'Select Store', allStores: 'All Stores',
    selectLanguage: 'Select Language', allLanguages: 'All Languages', creationDate: 'Creation Date', allTime: 'All Time',
    lastWeek: 'Last Week', lastMonth: 'Last Month', last3Months: 'Last 3 Months', last6Months: 'Last 6 Months',
    lastYear: 'Last Year', customDate: 'Custom Date', from: 'From', to: 'To', show: 'Show', product: 'Product'
  };

  const commonSelectClasses = "w-full appearance-none cursor-pointer p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary";
  const selectWrapperClasses = "relative flex-grow min-w-[140px]";
  const labelClasses = "block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2";

  const DateInputs = () => {
    const dateFields = [
      { id: 'start-date', label: t.from, value: filters.startDate, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onDateChange('startDate', e.target.value) },
      { id: 'end-date', label: t.to, value: filters.endDate, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onDateChange('endDate', e.target.value) }
    ];
    if (locale === 'ar') dateFields.reverse();
    return (
      <div className="lg:col-start-4 xl:col-start-5 grid grid-cols-2 gap-4 col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2">
        {dateFields.map(field => (
          <div key={field.id} className="flex-grow min-w-[120px]">
            <label htmlFor={field.id} className={labelClasses}>{field.label}</label>
            <input 
              type="date" 
              id={field.id} 
              value={field.value} 
              onChange={field.onChange}
              className="custom-date-input w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
              placeholder={t.customDate}
            />
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4 items-end">
        <div className="flex-grow min-w-[150px] md:col-span-1 lg:col-span-2">
          <label htmlFor="name-search" className={labelClasses}>{t.searchByName}</label>
          <input type="text" id="name-search" placeholder={t.searchPlaceholder} value={filters.name} onChange={(e) => onFilterChange('name', e.target.value)} className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"/>
        </div>
        {[
          { id: 'store', label: t.selectStore, options: [{ value: '', label: t.allStores }, ...stores.map(s => ({ value: s, label: s }))] },
          { id: 'language', label: t.selectLanguage, options: [{ value: '', label: t.allLanguages }, ...languages.map(l => ({ value: l, label: getLanguageName(l) }))] } // Use getLanguageName here
        ].map(s => (
          <div key={s.id} className={selectWrapperClasses}>
            <label htmlFor={s.id} className={labelClasses}>{s.label}</label>
            <div className="relative">
                <select id={s.id} value={(filters as any)[s.id]} onChange={e => onFilterChange(s.id, e.target.value)} className={`${commonSelectClasses} text-right ltr:text-left pr-10 rtl:pl-10`}>
                    {s.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <ChevronDown className="w-5 h-5 absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        ))}
        <div className={selectWrapperClasses}>
            <label htmlFor='date-range-select' className={labelClasses}>{t.creationDate}</label>
            <div className="relative">
                <select id='date-range-select' value={filters.dateRange} onChange={e => onDateRangeOptionChange(e.target.value)} className={`${commonSelectClasses} text-right ltr:text-left pr-10 rtl:pl-10`}>
                    <option value="">{t.allTime}</option>
                    <option value="last_week">{t.lastWeek}</option>
                    <option value="last_month">{t.lastMonth}</option>
                    <option value="last_3_months">{t.last3Months}</option>
                    <option value="last_6_months">{t.last6Months}</option>
                    <option value="last_year">{t.lastYear}</option>
                    <option value="custom">{t.customDate}</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-gray-400 pointer-events-none" />
            </div>
        </div>
        <div className="flex-grow min-w-[140px]">
          <label htmlFor='per-page-select' className={labelClasses}>{t.show}</label>
          <div className="relative">
            <select id='per-page-select' value={productsPerPage} onChange={e => onProductsPerPageChange(Number(e.target.value))} className={`${commonSelectClasses} text-right ltr:text-left pr-10 rtl:pl-10`}>
              {[24, 48, 100, 160].map(v => <option key={v} value={v}>{`${v} ${t.product}`}</option>)}
            </select>
            <ChevronDown className="w-5 h-5 absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="flex rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
            <button onClick={() => onViewModeChange('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`} aria-label="Grid View"><LayoutGrid className="h-5 w-5" /></button>
            <button onClick={() => onViewModeChange('table')} className={`p-2.5 ${viewMode === 'table' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background'}`} aria-label="Table View"><List className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
      {filters.dateRange === 'custom' && <div className="mt-4"><DateInputs /></div>}
    </div>
  );
};

export default FilterComponent;
