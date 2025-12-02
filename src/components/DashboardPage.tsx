import React, { useMemo, useState, useEffect } from 'react';
import { Product } from '../types';
import { TrendingUp, TrendingDown, Package, Store, Clock, ChevronsUpDown, ChevronDown, Tag, Download, Globe, Filter } from 'lucide-react';
import { subDays, format, parseISO, startOfDay, eachDayOfInterval } from 'date-fns';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import SegmentedControl from './SegmentedControl';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import ProductCardSkeleton from './ProductCardSkeleton';
import InstagramCardSkeleton from './InstagramCardSkeleton';
import { useDashboardStore } from '../stores/dashboardStore';
import DashboardSettings from './DashboardSettings';


// --- Type Definitions ---
interface DashboardPageProps {
  products: Product[]; // Unique, filtered products
  allProductsRaw: Product[]; // All products, unfiltered
  totalBeforeFilter: number;
  onNavigateWithFilter: (filter: { name?: string; store?: string; language?: string }) => void;
  isLoading: boolean;
}
interface KpiCardProps { title: string; value: number; icon: React.ReactNode; iconBg?: string; trend?: number }
interface StoreRow { vendor: string; totalProducts: number; newProducts30d: number; lastProductAdded: string; firstProductAdded: string; language?: string; }
interface LanguageItem { code: string; count: number; }
type ActiveView = 'stores' | 'keywords' | 'languages';

// --- Utility Functions ---
const exportToCsv = (data: any[], filename: string, headers: string[]) => {
  const csvRows = [];
  csvRows.push(headers.join(','));
  for (const row of data) {
    csvRows.push(headers.map(header => {
      const value = row[header];
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(','));
  }
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const CountUp = ({ end, duration = 1500 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      
      setCount(Math.floor(ease(percentage) * end));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
};

// --- Skeleton Components ---
const KpiCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow flex items-center gap-6 animate-pulse border border-gray-100 dark:border-gray-700">
        <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-2xl w-16 h-16"></div>
        <div className='flex-1'>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

const TableSkeleton: React.FC = () => (
    <div className="overflow-x-auto p-4 animate-pulse">
        <div className="w-full">
            {/* Header */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            {/* Body */}
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


// --- Main Component ---
const DashboardPage: React.FC<DashboardPageProps> = ({ products, allProductsRaw, totalBeforeFilter, onNavigateWithFilter, isLoading }) => {
  const { language } = useLanguageStore();
  const { tabVisibility, storeColumnsVisibility } = useDashboardStore();
  const t = translations[language];

  const availableTabs = useMemo(() => {
    const allTabs = [
      { id: 'stores' as ActiveView, label: t.dashboard_topStores, icon: <Store size={18} /> },
      { id: 'keywords' as ActiveView, label: t.dashboard_topKeywords, icon: <Tag size={18} /> },
      { id: 'languages' as ActiveView, label: t.dashboard_topLanguages, icon: <Globe size={18} /> },
    ];
    return allTabs.filter(tab => tabVisibility[tab.id as keyof typeof tabVisibility]);
  }, [t, tabVisibility]);

  const [activeView, setActiveView] = useState<ActiveView>(availableTabs.length > 0 ? availableTabs[0].id : 'stores');

  useEffect(() => {
    if (!availableTabs.some(tab => tab.id === activeView) && availableTabs.length > 0) {
      setActiveView(availableTabs[0].id);
    }
  }, [availableTabs, activeView]);

  const { kpiData, storeTableData, keywordData, languageData } = useMemo(() => {
    if (!products || !allProductsRaw) {
        return { kpiData: { totalProducts: 0, totalStores: 0, newProducts30d: 0, newStores30d: 0 }, storeTableData: [], keywordData: [], languageData: [] };
    }
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const recentProducts = products.filter(p => p.created_at && parseISO(p.created_at) >= thirtyDaysAgo);
    const uniqueStores = new Set(products.map(p => p.vendor).filter(Boolean));
    const recentUniqueStores = new Set(recentProducts.map(p => p.vendor).filter(Boolean));
    const storeProductCounts = allProductsRaw.reduce((acc, product) => {
        if(product.vendor) acc[product.vendor] = (acc[product.vendor] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});
    const storeNewProductCounts30d = recentProducts.reduce((acc, product) => {
        if(product.vendor) acc[product.vendor] = (acc[product.vendor] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});
    const lastProductAddedDates = products.reduce((acc, product) => {
        if (product.vendor && product.created_at) {
            const currentLastDate = acc[product.vendor] ? parseISO(acc[product.vendor]) : null;
            const productDate = parseISO(product.created_at);
            if (!currentLastDate || productDate > currentLastDate) {
                acc[product.vendor] = product.created_at;
            }
        }
        return acc;
    }, {} as {[key: string]: string});
    const firstProductAddedDates = products.reduce((acc, product) => {
        if (product.vendor && product.created_at) {
            const currentFirstDate = acc[product.vendor] ? parseISO(acc[product.vendor]) : null;
            const productDate = parseISO(product.created_at);
            if (!currentFirstDate || productDate < currentFirstDate) {
                acc[product.vendor] = product.created_at;
            }
        }
        return acc;
    }, {} as {[key: string]: string});
    const storeLanguages = allProductsRaw.reduce((acc, product) => {
        if (product.vendor && product.language) {
            if (!acc[product.vendor]) {
                acc[product.vendor] = {};
            }
            acc[product.vendor][product.language] = (acc[product.vendor][product.language] || 0) + 1;
        }
        return acc;
    }, {} as { [vendor: string]: { [language: string]: number } });
    const topStoreLanguage = Object.entries(storeLanguages).reduce((acc, [vendor, langCounts]) => {
        acc[vendor] = Object.keys(langCounts).reduce((a, b) => langCounts[a] > langCounts[b] ? a : b);
        return acc;
    }, {} as { [vendor: string]: string });
    const keywordCounts = products.reduce((acc, product) => {
        (product.name || '').toLowerCase().split(/[\\s,،-]+/).forEach(word => {
            if (word && word.length > 3 && !new Set(['from', 'with', 'for']).has(word) && !/\\d/.test(word)) {
                acc.set(word, (acc.get(word) || 0) + 1);
            }
        });
        return acc;
    }, new Map<string, number>());
    const languageCounts = products.reduce((acc, product) => {
        if (product.language) {
            acc[product.language] = (acc[product.language] || 0) + 1;
        }
        return acc;
    }, {} as {[key: string]: number});
    
    return {
        kpiData: { totalProducts: products.length, totalStores: uniqueStores.size, newProducts30d: recentProducts.length, newStores30d: recentUniqueStores.size },
        storeTableData: Object.entries(storeProductCounts).map(([vendor, count]) => ({
            vendor,
            totalProducts: count,
            newProducts30d: storeNewProductCounts30d[vendor] || 0,
            lastProductAdded: lastProductAddedDates[vendor] ? format(parseISO(lastProductAddedDates[vendor]), 'yyyy-MM-dd') : 'N/A',
            firstProductAdded: firstProductAddedDates[vendor] ? format(parseISO(firstProductAddedDates[vendor]), 'yyyy-MM-dd') : 'N/A',
            language: topStoreLanguage[vendor]
        })).sort((a, b) => b.totalProducts - a.totalProducts),
        keywordData: Array.from(keywordCounts.entries()).map(([text, value]) => ({ text, value })).sort((a,b) => b.value - a.value).slice(0, 20),
        languageData: Object.entries(languageCounts)
          .map(([code, count]) => ({ code, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20),
    };
  }, [products, allProductsRaw]);

  if (isLoading) {
      return (
          <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <KpiCardSkeleton key={i} />)}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow p-6">
                 <TableSkeleton />
              </div>
          </div>
      );
  }

  const handleExportStores = () => {
    const headers = ['vendor'];
    if (storeColumnsVisibility.totalProducts) headers.push('totalProducts');
    if (storeColumnsVisibility.language) headers.push('language');
    if (storeColumnsVisibility.newProducts30d) headers.push('newProducts30d');
    if (storeColumnsVisibility.lastProductAdded) headers.push('lastProductAdded');
    if (storeColumnsVisibility.firstProductAdded) headers.push('firstProductAdded');
    
    exportToCsv(storeTableData, 'stores_data.csv', headers);
  };

  const renderActiveView = () => {
      if (availableTabs.length === 0) {
          return <div className="p-12 text-center text-gray-500">{t.dashboard_settings_description}</div>;
      }
      switch (activeView) {
          case 'stores':
              return <StoreTable data={storeTableData} t={t} onNavigateWithFilter={onNavigateWithFilter} maxProducts={Math.max(...storeTableData.map(s => s.totalProducts), 1)} totalProductsSum={totalBeforeFilter} />;
          case 'keywords':
              return <KeywordList data={keywordData} t={t} onNavigateWithFilter={onNavigateWithFilter} />;
          case 'languages':
              return <LanguageList data={languageData} t={t} onNavigateWithFilter={onNavigateWithFilter} />;
          default:
              return null;
      }
  };

  return (
    <div className="animate-fade-in-up space-y-8 pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t.dashboard_totalProductsAll} value={totalBeforeFilter} icon={<Package className="text-blue-600 dark:text-blue-400" />} iconBg="bg-blue-100 dark:bg-blue-900/30" />
        <KpiCard title={t.dashboard_totalProductsUnique} value={kpiData.totalProducts} icon={<Filter className="text-cyan-600 dark:text-cyan-400" />} iconBg="bg-cyan-100 dark:bg-cyan-900/30" />
        <KpiCard title={t.dashboard_newProducts30d} value={kpiData.newProducts30d} icon={<TrendingUp className="text-green-600 dark:text-green-400" />} iconBg="bg-green-100 dark:bg-green-900/30" trend={12} />
        <KpiCard title={t.dashboard_totalStores} value={kpiData.totalStores} icon={<Store className="text-purple-600 dark:text-purple-400" />} iconBg="bg-purple-100 dark:bg-purple-900/30" />
      </div>

      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700 gap-4">
          <div className="flex-1 w-full sm:w-auto">
            {availableTabs.length > 0 && (
                <SegmentedControl tabs={availableTabs} activeTab={activeView} onTabChange={setActiveView} />
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeView === 'stores' && availableTabs.some(t => t.id === 'stores') && (
              <button
                onClick={handleExportStores}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                <Download size={18} />
                <span className="hidden sm:inline">{t.exportData}</span>
              </button>
            )}
            <DashboardSettings />
          </div>
        </div>
        <div className="p-2">
            {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, iconBg, trend }) => (
    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        {/* Background Sparkline (Decorative) */}
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg viewBox="0 0 100 20" className={`w-full h-full ${iconBg?.includes('blue') ? 'fill-blue-500' : iconBg?.includes('green') ? 'fill-green-500' : iconBg?.includes('purple') ? 'fill-purple-500' : 'fill-cyan-500'}`} preserveAspectRatio="none">
                 <path d="M0,20 L0,10 Q10,5 20,12 T40,15 T60,8 T80,14 T100,5 L100,20 Z" />
             </svg>
        </div>

        <div className="flex items-center gap-5 relative z-10">
            <div className={`p-4 rounded-2xl ${iconBg} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {React.cloneElement(icon as React.ReactElement, { size: 28 })}
            </div>
            <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
                        <CountUp end={value} />
                    </p>
                    {trend && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center ${trend > 0 ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:bg-red-900/30'}`}>
                            {trend > 0 ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />} 
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const StoreTable: React.FC<{data: StoreRow[], t: any, onNavigateWithFilter: (f: any) => void, maxProducts: number, totalProductsSum: number}> = ({ data, t, onNavigateWithFilter, maxProducts, totalProductsSum }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const { storeColumnsVisibility } = useDashboardStore();
    
    const columns = useMemo<ColumnDef<StoreRow>[]>(() => {
        const cols: ColumnDef<StoreRow>[] = [
            { 
                accessorKey: 'vendor', 
                header: t.storeName,
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold text-xs">
                            {row.original.vendor.substring(0, 2).toUpperCase()}
                        </div>
                        <span 
                            onClick={() => onNavigateWithFilter({ store: row.original.vendor })}
                            className="cursor-pointer font-bold text-gray-700 dark:text-gray-200 hover:text-brand-primary transition-colors truncate max-w-[150px]"
                            title={t.dashboard_filterByStore}
                        >
                            {row.original.vendor}
                        </span>
                    </div>
                )
            }
        ];

        if (storeColumnsVisibility.totalProducts) {
            cols.push({ 
                accessorKey: 'totalProducts', 
                header: t.totalProducts,
                cell: ({ row }) => (
                    <div className="w-full max-w-[140px]">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{row.original.totalProducts}</span>
                            <span className="text-[10px] text-gray-400">
                                {totalProductsSum > 0 
                                    ? `${((row.original.totalProducts / totalProductsSum) * 100).toFixed(2)}%`
                                    : '0%'
                                }
                            </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${totalProductsSum > 0 ? (row.original.totalProducts / totalProductsSum) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                )
            });
        }

        if (storeColumnsVisibility.language) {
            cols.push({
                accessorKey: 'language',
                header: t.language,
                cell: ({ row }) => row.original.language ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30">
                        {t[row.original.language] || row.original.language.toUpperCase()}
                    </span>
                ) : <span className="text-gray-300 dark:text-gray-600 text-xs">-</span>
            });
        }

        if (storeColumnsVisibility.newProducts30d) {
            cols.push({
                accessorKey: 'newProducts30d',
                header: t.dashboard_newProducts30d_store,
                cell: ({ row }) => (
                     <span className={`font-bold text-sm ${row.original.newProducts30d > 0 ? 'text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg' : 'text-gray-400'}`}>
                         {row.original.newProducts30d > 0 ? `+${row.original.newProducts30d}` : '0'}
                     </span>
                )
            });
        }

        if (storeColumnsVisibility.lastProductAdded) {
            cols.push({
                accessorKey: 'lastProductAdded',
                header: t.dashboard_lastProductAdded,
                cell: ({ row }) => <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">{row.original.lastProductAdded}</span>
            });
        }

        if (storeColumnsVisibility.firstProductAdded) {
            cols.push({
                accessorKey: 'firstProductAdded',
                header: t.dashboard_firstProductAdded,
                cell: ({ row }) => <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">{row.original.firstProductAdded}</span>
            });
        }

        if (storeColumnsVisibility.metaAdLibrary) {
            cols.push({ 
                id: 'metaAdLibrary',
                header: () => <div className="text-center">{t.searchInMeta}</div>,
                cell: ({ row }) => (<div className="flex justify-center items-center"><MetaAdLibraryLink vendor={row.original.vendor} t={t} /></div>) 
            });
        }

        return cols;
    }, [t, onNavigateWithFilter, storeColumnsVisibility, maxProducts, totalProductsSum]);

    const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
                <thead>{table.getHeaderGroups().map(hg => (<tr key={hg.id} className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">{hg.headers.map(h => (<th key={h.id} className={`p-5 text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold ${h.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300' : ''}`} onClick={h.column.getToggleSortingHandler()}><div className="flex items-center gap-2">{flexRender(h.column.columnDef.header, h.getContext())}{{ asc: <ChevronDown size={14} className="rotate-180"/>, desc: <ChevronDown size={14}/> }[h.column.getIsSorted() as string] ?? (h.column.getCanSort() ? <ChevronsUpDown size={14} className="text-gray-300 dark:text-gray-600"/> : null)}</div></th>))}</tr>))}</thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">{table.getRowModel().rows.map(row => (<tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-all duration-200 group">{row.getVisibleCells().map(cell => (<td key={cell.id} className="p-5 align-middle">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</tr>))}</tbody>
            </table>
        </div>
    );
};

const KeywordList: React.FC<{data: {text: string, value: number}[], t: any, onNavigateWithFilter: (f: any) => void}> = ({data, t, onNavigateWithFilter}) => (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {data.map(({text, value}, index) => (
            <div key={text} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-all duration-200 group">
                <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>#{index + 1}</span>
                    <span 
                        onClick={() => onNavigateWithFilter({ name: text })}
                        className="font-bold text-gray-700 dark:text-gray-200 cursor-pointer hover:text-brand-primary transition-colors text-lg"
                        title={t.dashboard_searchForKeyword}
                    >
                        {text}
                    </span>
                </div>
                <span className="font-mono text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">{value}</span>
            </div>
        ))}
    </div>
);

const LanguageList: React.FC<{data: LanguageItem[], t: any, onNavigateWithFilter: (f: { language?: string }) => void}> = ({data, t, onNavigateWithFilter}) => (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {data.map(({code, count}, index) => (
            <div key={code} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-all duration-200 group">
                <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>#{index + 1}</span>
                    <span 
                        onClick={() => onNavigateWithFilter({ language: code })}
                        className="font-bold text-gray-700 dark:text-gray-200 cursor-pointer hover:text-brand-primary transition-colors text-lg uppercase"
                        title={t.dashboard_filterByLanguage}
                    >
                        {t[code] || code}
                    </span>
                </div>
                 <span className="font-mono text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">{count}</span>
            </div>
        ))}
    </div>
);

const MetaAdLibraryLink: React.FC<{ vendor: string; t: any}> = ({ vendor, t }) => { const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`; return <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shadow-sm hover:shadow"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" alt="Meta AdLibrary" className="w-5 h-5" /></a> };

export default DashboardPage;
