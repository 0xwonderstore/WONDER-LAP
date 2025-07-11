import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { ArrowLeft, ArrowDown, ArrowUp } from 'lucide-react';
import { formatDate, getFacebookAdLibraryUrl } from '../utils';

interface VendorAnalyticsProps {
  products: Product[];
  onBack: () => void;
  onVendorSelect: (vendor: string) => void;
}

type VendorStat = {
  name: string;
  productCount: number;
  oldestProductDate: Date;
  newestProductDate: Date;
};

type SortConfig = {
    key: keyof VendorStat;
    direction: 'asc' | 'desc';
};

const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({ products, onBack, onVendorSelect }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'productCount', direction: 'desc' });
  const [minProducts, setMinProducts] = useState(0);
  const [activityDateFilter, setActivityDateFilter] = useState('all');

  const vendorStats = useMemo(() => {
    const vendorStatsMap: Map<string, { dates: Date[] }> = new Map();
    products.forEach(p => {
      if (!vendorStatsMap.has(p.vendor)) {
        vendorStatsMap.set(p.vendor, { dates: [] });
      }
      vendorStatsMap.get(p.vendor)!.dates.push(new Date(p.created_at));
    });
    
    return Array.from(vendorStatsMap.entries()).map(([name, data]) => {
      const sortedDates = data.dates.sort((a,b) => a.getTime() - b.getTime());
      return {
        name,
        productCount: data.dates.length,
        oldestProductDate: sortedDates[0],
        newestProductDate: sortedDates[sortedDates.length - 1],
      };
    });
  }, [products]);

  const filteredAndSortedStats = useMemo(() => {
    let stats = [...vendorStats];
    if (minProducts > 0) { stats = stats.filter(v => v.productCount >= minProducts); }
    if (activityDateFilter !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        if (activityDateFilter === 'week') filterDate.setDate(now.getDate() - 7);
        else if (activityDateFilter === 'month') filterDate.setMonth(now.getMonth() - 1);
        stats = stats.filter(v => v.newestProductDate >= filterDate);
    }
    stats.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if(aVal instanceof Date && bVal instanceof Date){ return (aVal.getTime() - bVal.getTime()) * (sortConfig.direction === 'asc' ? 1 : -1); }
        if (typeof aVal === 'string' && typeof bVal === 'string') { return aVal.localeCompare(bVal) * (sortConfig.direction === 'asc' ? 1 : -1); }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
    return stats;
  }, [vendorStats, sortConfig, minProducts, activityDateFilter]);

  const requestSort = (key: keyof VendorStat) => { setSortConfig(prevConfig => ({ key, direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc' })); };
  const SortArrow = ({ for_key }: {for_key: keyof VendorStat}) => { if (sortConfig.key !== for_key) return null; return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4"/>; }

  return (
    <div className="p-4 sm:p-8 bg-light-background dark:bg-dark-background min-h-screen animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 mb-8 text-brand-primary font-semibold hover:underline"><ArrowLeft size={20} /> العودة إلى المنتجات</button>
      <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">تحليل المتاجر</h1>
        <div className="flex flex-wrap gap-4 mb-6">
            <div><label htmlFor="minProducts" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">عدد المنتجات (على الأقل)</label><input id="minProducts" type="number" value={minProducts} onChange={(e) => setMinProducts(Number(e.target.value) || 0)} className="mt-1 block p-2 rounded-lg border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background" /></div>
             <div><label htmlFor="activityDate" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">آخر نشاط للمتجر</label><select id="activityDate" value={activityDateFilter} onChange={e => setActivityDateFilter(e.target.value)} className="mt-1 block p-2 rounded-lg border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background"><option value="all">كل الأوقات</option><option value="week">في الأسبوع الأخير</option><option value="month">في الشهر الأخير</option></select></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase bg-light-background dark:bg-dark-background">
              <tr>
                  {([ {key: 'name', label: 'المتجر'}, {key: 'productCount', label: 'عدد المنتجات'}, {key: 'oldestProductDate', label: 'أول منتج'}, {key: 'newestProductDate', label: 'آخر منتج'} ] as {key: keyof VendorStat, label: string}[]).map(({key, label}) => ( <th key={key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(key)}><div className="flex items-center gap-1">{label} <SortArrow for_key={key}/></div></th> ))}
                  <th scope="col" className="px-6 py-3">مكتبة الإعلانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {filteredAndSortedStats.map(v => (
                <tr key={v.name} className="hover:bg-light-background dark:hover:bg-dark-background">
                  <td className="px-6 py-4 font-medium text-brand-primary dark:text-brand-primary-hover hover:underline cursor-pointer whitespace-nowrap" onClick={() => onVendorSelect(v.name)}>{v.name}</td>
                  <td className="px-6 py-4">{v.productCount}</td>
                  <td className="px-6 py-4">{formatDate(v.oldestProductDate.toISOString())}</td>
                  <td className="px-6 py-4">{formatDate(v.newestProductDate.toISOString())}</td>
                  <td className="px-6 py-4">
                    <a href={getFacebookAdLibraryUrl(v.name)} target="_blank" rel="noopener noreferrer" title={`مكتبة إعلانات ${v.name}`}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Meta_Platforms_Inc._logo_%28cropped%29.svg" alt="Meta Logo" className="w-5 h-5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
