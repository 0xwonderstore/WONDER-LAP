import React, { useMemo, useState, useEffect } from 'react';
import { Product } from '../types';
import { TrendingUp, Package, Store, Clock, ChevronsUpDown, ChevronDown, Tag, Download, Globe, Filter } from 'lucide-react';
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
interface KpiCardProps { title: string; value: string | number; icon: React.ReactNode; trend?: number }
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

// --- Skeleton Components ---
const KpiCardSkeleton: React.FC = () => (
    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow flex items-center gap-6 animate-pulse">
        <div className="bg-gray-300 dark:bg-gray-700 p-4 rounded-full w-16 h-16"></div>
        <div className='flex-1'>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

const TableSkeleton: React.FC = () => (
    <div className="overflow-x-auto p-4 animate-pulse">
        <div className="w-full">
            {/* Header */}
            <div className="flex bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mr-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mr-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mr-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
            {/* Body */}
            <div className="space-y-2 pt-2">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex bg-light-surface dark:bg-dark-surface p-4">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
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
      { id: 'stores' as ActiveView, label: t.dashboard_topStores, icon: <Store size={16} /> },
      { id: 'keywords' as ActiveView, label: t.dashboard_topKeywords, icon: <Tag size={16} /> },
      { id: 'languages' as ActiveView, label: t.dashboard_topLanguages, icon: <Globe size={16} /> },
    ];
    return allTabs.filter(tab => tabVisibility[tab.id as keyof typeof tabVisibility]);
  }, [t, tabVisibility]);

  const [activeView, setActiveView] = useState<ActiveView>(availableTabs.length > 0 ? availableTabs[0].id : 'stores');

  useEffect(() => {
    // If the currently active view is hidden, switch to the first available one.
    if (!availableTabs.some(tab => tab.id === activeView) && availableTabs.length > 0) {
      setActiveView(availableTabs[0].id);
    }
  }, [availableTabs, activeView]);

  const { kpiData, storeTableData, keywordData, languageData } = useMemo(() => {
    // Return empty/default data if products are not there yet to avoid crashing
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
          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
              </div>
              <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow">
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
          return <div className="p-8 text-center text-light-text-secondary dark:text-dark-text-secondary">{t.dashboard_settings_description}</div>;
      }
      switch (activeView) {
          case 'stores':
              return <StoreTable data={storeTableData} t={t} onNavigateWithFilter={onNavigateWithFilter} maxProducts={Math.max(...storeTableData.map(s => s.totalProducts), 1)} />;
          case 'keywords':
              return <KeywordList data={keywordData} t={t} onNavigateWithFilter={onNavigateWithFilter} />;
          case 'languages':
              return <LanguageList data={languageData} t={t} onNavigateWithFilter={onNavigateWithFilter} />;
          default:
              return null;
      }
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t.dashboard_totalProductsAll} value={totalBeforeFilter} icon={<Package className="text-white" />} iconBg="bg-blue-500" />
        <KpiCard title={t.dashboard_totalProductsUnique} value={kpiData.totalProducts} icon={<Filter className="text-white" />} iconBg="bg-cyan-500" />
        <KpiCard title={t.dashboard_newProducts30d} value={kpiData.newProducts30d} icon={<TrendingUp className="text-white" />} iconBg="bg-green-500" trend={12} />
        <KpiCard title={t.dashboard_totalStores} value={kpiData.totalStores} icon={<Store className="text-white" />} iconBg="bg-purple-500" />
      </div>

      
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow">
        <div className="p-4 flex justify-between items-center border-b border-light-border dark:border-dark-border">
          <div className="flex-1">
            {availableTabs.length > 0 && (
                <SegmentedControl tabs={availableTabs} activeTab={activeView} onTabChange={setActiveView} />
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeView === 'stores' && availableTabs.some(t => t.id === 'stores') && (
              <button
                onClick={handleExportStores}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-secondary transition-colors duration-200"
              >
                <Download size={16} />
                <span className="hidden sm:inline">{t.exportData}</span>
              </button>
            )}
            <DashboardSettings />
          </div>
        </div>
        {renderActiveView()}
      </div>
    </div>
  );
};

const KpiCard: React.FC<KpiCardProps & { iconBg?: string }> = ({ title, value, icon, iconBg = 'bg-blue-500', trend }) => (
    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow flex items-center gap-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${iconBg} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500`}></div>
        <div className={`${iconBg} p-4 rounded-xl shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
            {React.cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
        <div>
            <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
                 <p className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">{value}</p>
                 {trend && (
                     <span className="text-xs font-medium text-green-500 flex items-center">
                         <TrendingUp size={12} className="mr-1" /> +{trend}%
                     </span>
                 )}
            </div>
        </div>
    </div>
);

const StoreTable: React.FC<{data: StoreRow[], t: any, onNavigateWithFilter: (f: any) => void, maxProducts: number}> = ({ data, t, onNavigateWithFilter, maxProducts }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const { storeColumnsVisibility } = useDashboardStore();
    
    const columns = useMemo<ColumnDef<StoreRow>[]>(() => {
        const cols: ColumnDef<StoreRow>[] = [
            { 
                accessorKey: 'vendor', 
                header: t.storeName,
                cell: ({ row }) => (
                    <span 
                        onClick={() => onNavigateWithFilter({ store: row.original.vendor })}
                        className="cursor-pointer font-medium hover:text-brand-primary transition-colors"
                        title={t.dashboard_filterByStore}
                    >
                        {row.original.vendor}
                    </span>
                )
            }
        ];

        if (storeColumnsVisibility.totalProducts) {
            cols.push({ 
                accessorKey: 'totalProducts', 
                header: t.totalProducts,
                cell: ({ row }) => (
                    <div className="flex flex-col w-full max-w-[140px]">
                        <span className="text-sm font-semibold mb-1">{row.original.totalProducts}</span>
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-brand-primary rounded-full" 
                                style={{ width: `${(row.original.totalProducts / maxProducts) * 100}%` }}
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
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {t[row.original.language] || row.original.language.toUpperCase()}
                    </span>
                ) : <span className="text-gray-400 text-xs">N/A</span>
            });
        }

        if (storeColumnsVisibility.newProducts30d) {
            cols.push({
                accessorKey: 'newProducts30d',
                header: t.dashboard_newProducts30d_store,
                cell: ({ row }) => (
                     <span className={`font-mono ${row.original.newProducts30d > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                         {row.original.newProducts30d > 0 ? `+${row.original.newProducts30d}` : '0'}
                     </span>
                )
            });
        }

        if (storeColumnsVisibility.lastProductAdded) {
            cols.push({
                accessorKey: 'lastProductAdded',
                header: t.dashboard_lastProductAdded,
                cell: ({ row }) => <span className="text-sm text-gray-500 dark:text-gray-400">{row.original.lastProductAdded}</span>
            });
        }

        if (storeColumnsVisibility.firstProductAdded) {
            cols.push({
                accessorKey: 'firstProductAdded',
                header: t.dashboard_firstProductAdded,
                cell: ({ row }) => <span className="text-sm text-gray-500 dark:text-gray-400">{row.original.firstProductAdded}</span>
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
    }, [t, onNavigateWithFilter, storeColumnsVisibility, maxProducts]);

    const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
                <thead>{table.getHeaderGroups().map(hg => (<tr key={hg.id} className="border-b border-light-border dark:border-dark-border bg-gray-50 dark:bg-gray-800/50">{hg.headers.map(h => (<th key={h.id} className={`p-4 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium ${h.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''}`} onClick={h.column.getToggleSortingHandler()}><div className="flex items-center gap-2">{flexRender(h.column.columnDef.header, h.getContext())}{{ asc: <ChevronDown size={14} className="rotate-180"/>, desc: <ChevronDown size={14}/> }[h.column.getIsSorted() as string] ?? (h.column.getCanSort() ? <ChevronsUpDown size={14} className="text-gray-300 dark:text-gray-600"/> : null)}</div></th>))}</tr>))}</thead>
                <tbody>{table.getRowModel().rows.map(row => (<tr key={row.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-background-hover dark:hover:bg-dark-background-hover transition-colors">{row.getVisibleCells().map(cell => (<td key={cell.id} className="p-4 align-middle">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</tr>))}</tbody>
            </table>
        </div>
    );
};

const KeywordList: React.FC<{data: {text: string, value: number}[], t: any, onNavigateWithFilter: (f: any) => void}> = ({data, t, onNavigateWithFilter}) => (
    <div className="divide-y divide-light-border dark:divide-dark-border">
        {data.map(({text, value}, index) => (
            <div key={text} className="p-4 flex justify-between items-center hover:bg-light-background-hover dark:hover:bg-dark-background-hover transition-colors group">
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm font-mono w-6">#{index + 1}</span>
                    <span 
                        onClick={() => onNavigateWithFilter({ name: text })}
                        className="font-medium cursor-pointer text-light-text-primary dark:text-dark-text-primary group-hover:text-brand-primary transition-colors"
                        title={t.dashboard_searchForKeyword}
                    >
                        {text}
                    </span>
                </div>
                <span className="font-mono text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">{value}</span>
            </div>
        ))}
    </div>
);

const LanguageList: React.FC<{data: LanguageItem[], t: any, onNavigateWithFilter: (f: { language?: string }) => void}> = ({data, t, onNavigateWithFilter}) => (
    <div className="divide-y divide-light-border dark:divide-dark-border">
        {data.map(({code, count}, index) => (
            <div key={code} className="p-4 flex justify-between items-center hover:bg-light-background-hover dark:hover:bg-dark-background-hover transition-colors group">
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm font-mono w-6">#{index + 1}</span>
                    <span 
                        onClick={() => onNavigateWithFilter({ language: code })}
                        className="font-medium cursor-pointer text-light-text-primary dark:text-dark-text-primary group-hover:text-brand-primary transition-colors"
                        title={t.dashboard_filterByLanguage}
                    >
                        {t[code] || code.toUpperCase()}
                    </span>
                </div>
                 <span className="font-mono text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">{count}</span>
            </div>
        ))}
    </div>
);

const MetaAdLibraryLink: React.FC<{ vendor: string; t: any}> = ({ vendor, t }) => { const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`; return <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" alt="Meta AdLibrary" className="w-5 h-5" /></a> };

export default DashboardPage;
