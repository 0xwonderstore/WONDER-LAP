import React, { useMemo, useState, useCallback } from 'react';
import { Product, Locale } from '../types';
import { formatDate } from '../utils/productUtils';
import { ArrowUpDown, Library, Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format, sub } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';

const translations = {
  ar: {
    statistics: 'الإحصائيات',
    store: 'المتجر',
    totalProducts: 'إجمالي المنتجات',
    newProducts: 'المنتجات الجديدة',
    adLibrary: 'مكتبة الإعلانات',
    dateRange: 'الفترة الزمنية',
    last7Days: 'آخر 7 أيام',
    last30Days: 'آخر 30 يومًا',
    last3Months: 'آخر 3 أشهر',
    last6Months: 'آخر 6 أشهر',
    lastYear: 'آخر سنة',
    custom: 'تاريخ مخصص',
    selectDate: 'اختر تاريخًا',
    from: 'من',
    to: 'إلى',
    apply: 'تطبيق',
    trendingStores: 'تحليل المتاجر',
  },
  en: {
    statistics: 'Statistics',
    store: 'Store',
    totalProducts: 'Total Products',
    newProducts: 'New Products',
    adLibrary: 'Ad Library',
    dateRange: 'Date Range',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    last3Months: 'Last 3 Months',
    last6Months: 'Last 6 Months',
    lastYear: 'Last Year',
    custom: 'Custom',
    selectDate: 'Select a date',
    from: 'from',
    to: 'to',
    apply: 'Apply',
    trendingStores: 'Store Analysis',
  }
};

type Preset = '7d' | '30d' | '3m' | '6m' | '1y' | 'custom';
type SortKey = 'name' | 'productCount' | 'trendingScore';

const StatisticsPage: React.FC<{ allProducts: Product[]; locale: Locale; onNavigateWithFilter: (filter: { store?: string; }) => void; }> = ({ allProducts, locale, onNavigateWithFilter }) => {
  const t = translations[locale];
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'trendingScore', direction: 'desc' });
  const [date, setDate] = useState<DateRange | undefined>({ from: sub(new Date(), { days: 29 }), to: new Date() });
  const [activePreset, setActivePreset] = useState<Preset>('30d');

  const handlePresetChange = (preset: Preset) => {
    setActivePreset(preset);
    const now = new Date();
    switch (preset) {
      case '7d': setDate({ from: sub(now, { days: 6 }), to: now }); break;
      case '30d': setDate({ from: sub(now, { days: 29 }), to: now }); break;
      case '3m': setDate({ from: sub(now, { months: 3 }), to: now }); break;
      case '6m': setDate({ from: sub(now, { months: 6 }), to: now }); break;
      case '1y': setDate({ from: sub(now, { years: 1 }), to: now }); break;
      default: break;
    }
  };

  const { stores } = useMemo(() => {
    const storeData: { [key: string]: { products: Product[], recent: number } } = {};
    const fromDate = date?.from;
    const toDate = date?.to;

    allProducts.forEach(product => {
      if (!storeData[product.store.name]) storeData[product.store.name] = { products: [], recent: 0 };
      storeData[product.store.name].products.push(product);

      if(fromDate && toDate) {
        const productDate = new Date(product.created_at);
        if (productDate >= fromDate && productDate <= toDate) {
          storeData[product.store.name].recent++;
        }
      }
    });

    return {
      stores: Object.entries(storeData).map(([name, data]) => ({
        name,
        productCount: data.products.length,
        trendingScore: data.recent,
      }))
    };
  }, [allProducts, date]);

  const sortedStores = useMemo(() => {
    return [...stores].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [stores, sortConfig]);
  
  const requestSort = (key: SortKey) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode, className?: string }> = ({ sortKey, children, className }) => (
    <th className={`p-4 text-start rtl:text-right font-semibold cursor-pointer whitespace-nowrap ${className}`} onClick={() => requestSort(sortKey)}>
      <div className="flex items-center gap-2">{children}<ArrowUpDown className={`w-4 h-4 text-gray-400 ${sortConfig.key === sortKey ? 'text-brand-primary' : ''}`} /></div>
    </th>
  );

  const presets: { key: Preset, label: string }[] = [
    { key: '7d', label: t.last7Days }, { key: '30d', label: t.last30Days },
    { key: '3m', label: t.last3Months }, { key: '6m', label: t.last6Months },
    { key: '1y', label: t.lastYear }
  ];
  
  return (
    <div className="animate-fade-in-up">
      <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 shadow-md">
        <h3 className="text-lg font-bold mb-4">{t.trendingStores}</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            {presets.map(p => (
              <Button key={p.key} variant={activePreset === p.key ? 'soft' : 'ghost'} onClick={() => handlePresetChange(p.key)} className="h-9">
                {p.label}
              </Button>
            ))}
          </div>
          <GripVertical className="h-6 w-6 text-gray-300 dark:text-gray-600 hidden md:block" />
           <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={`w-[260px] justify-start text-left font-normal h-11 ${!date && "text-muted-foreground"}`}
                onClick={() => setActivePreset('custom')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>{t.selectDate}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md overflow-x-auto">
         <table className="w-full text-sm">
            <thead className="bg-light-background dark:bg-dark-background/50">
              <tr>
                <SortableHeader sortKey="name">{t.store}</SortableHeader>
                <SortableHeader sortKey="trendingScore" className="text-center">{t.newProducts}</SortableHeader>
                <SortableHeader sortKey="productCount" className="text-center">{t.totalProducts}</SortableHeader>
                <th className="p-4 text-center font-semibold">{t.adLibrary}</th>
              </tr>
            </thead>
            <tbody>
              {sortedStores.map(store => (
                <tr key={store.name} className="border-t border-light-border dark:border-dark-border">
                  <td className="p-4">
                    <span className="font-bold text-brand-primary cursor-pointer hover:underline" onClick={() => onNavigateWithFilter({ store: store.name })}>{store.name}</span>
                  </td>
                  <td className="p-4 font-mono text-center text-lg font-bold text-orange-500">{store.trendingScore}</td>
                  <td className="p-4 font-mono text-center text-gray-500">{store.productCount}</td>
                  <td className="p-4 text-center">
                    <a href={`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(store.name)}&search_type=keyword_unordered&media_type=all`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-light-background dark:hover:bg-dark-background">
                      <Library className="w-5 h-5 text-brand-primary" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default StatisticsPage;
