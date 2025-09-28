import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { TrendingUp, Package, Store, Clock, ChevronsUpDown, ChevronDown, Tag, Download, Globe, Filter } from 'lucide-react';
import { subDays, format, parseISO } from 'date-fns';
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

// --- Type Definitions ---
interface DashboardPageProps {
  products: Product[];
  totalBeforeFilter: number;
  onNavigateWithFilter: (filter: { name?: string; store?: string; language?: string }) => void;
}
interface KpiCardProps { title: string; value: string | number; icon: React.ReactNode; }
interface StoreRow { vendor: string; totalProducts: number; newProducts30d: number; lastProductAdded: string; firstProductAdded: string; }
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

// --- Main Component ---
const DashboardPage: React.FC<DashboardPageProps> = ({ products, totalBeforeFilter, onNavigateWithFilter }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [activeView, setActiveView] = useState<ActiveView>('stores');

  const { kpiData, storeTableData, keywordData, languageData } = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const recentProducts = products.filter(p => p.created_at && parseISO(p.created_at) >= thirtyDaysAgo);
    const uniqueStores = new Set(products.map(p => p.vendor).filter(Boolean));
    const recentUniqueStores = new Set(recentProducts.map(p => p.vendor).filter(Boolean));

    const storeProductCounts = products.reduce((acc, product) => {
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
            firstProductAdded: firstProductAddedDates[vendor] ? format(parseISO(firstProductAddedDates[vendor]), 'yyyy-MM-dd') : 'N/A'
        })),
        keywordData: Array.from(keywordCounts.entries()).map(([text, value]) => ({ text, value })).sort((a,b) => b.value - a.value).slice(0, 20),
        languageData: Object.entries(languageCounts)
          .map(([code, count]) => ({ code, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20),
    };
  }, [products]);

  const tabs = [
      { id: 'stores' as ActiveView, label: t.dashboard_topStores, icon: <Store size={16} /> },
      { id: 'keywords' as ActiveView, label: t.dashboard_topKeywords, icon: <Tag size={16} /> },
      { id: 'languages' as ActiveView, label: t.dashboard_topLanguages, icon: <Globe size={16} /> },
  ];

  const handleExportStores = () => {
    const headers = ['vendor', 'totalProducts', 'newProducts30d', 'lastProductAdded', 'firstProductAdded'];
    exportToCsv(storeTableData, 'stores_data.csv', headers);
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t.dashboard_totalProductsAll} value={totalBeforeFilter} icon={<Package className="text-blue-500" />} />
        <KpiCard title={t.dashboard_totalProductsUnique} value={kpiData.totalProducts} icon={<Filter className="text-cyan-500" />} />
        <KpiCard title={t.dashboard_newProducts30d} value={kpiData.newProducts30d} icon={<TrendingUp className="text-green-500" />} />
        <KpiCard title={t.dashboard_totalStores} value={kpiData.totalStores} icon={<Store className="text-purple-500" />} />
      </div>

      
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow">
        <div className="p-4 flex justify-between items-center">
          <SegmentedControl tabs={tabs} activeTab={activeView} onTabChange={setActiveView} />
          {activeView === 'stores' && (
            <button
              onClick={handleExportStores}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-secondary transition-colors duration-200"
            >
              <Download size={18} />
              {t.exportData}
            </button>
          )}
        </div>
        {activeView === 'stores' ? 
            <StoreTable data={storeTableData} t={t} onNavigateWithFilter={onNavigateWithFilter} /> : 
            activeView === 'keywords' ? 
                <KeywordList data={keywordData} t={t} onNavigateWithFilter={onNavigateWithFilter} /> : 
                <LanguageList data={languageData} t={t} onNavigateWithFilter={onNavigateWithFilter} />
        }
      </div>
    </div>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => ( <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow flex items-center gap-6"> <div className="bg-light-background dark:bg-dark-background p-4 rounded-full">{React.cloneElement(icon as React.ReactElement, { size: 32 })}</div> <div> <h3 className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">{title}</h3> <p className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">{value}</p> </div> </div> );

const StoreTable: React.FC<{data: StoreRow[], t: any, onNavigateWithFilter: (f: any) => void}> = ({ data, t, onNavigateWithFilter }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    
    const columns = useMemo<ColumnDef<StoreRow>[]>(() => [
        { 
            accessorKey: 'vendor', 
            header: t.storeName,
            cell: ({ row }) => (
                <span 
                    onClick={() => onNavigateWithFilter({ store: row.original.vendor })}
                    className="cursor-pointer hover:underline text-brand-primary"
                    title={t.dashboard_filterByStore}
                >
                    {row.original.vendor}
                </span>
            )
        }, 
        { 
            accessorKey: 'totalProducts', 
            header: t.totalProducts 
        },
        {
            accessorKey: 'newProducts30d',
            header: t.dashboard_newProducts30d_store,
            cell: ({ row }) => row.original.newProducts30d
        },
        {
            accessorKey: 'lastProductAdded',
            header: t.dashboard_lastProductAdded,
            cell: ({ row }) => row.original.lastProductAdded
        },
        {
            accessorKey: 'firstProductAdded',
            header: t.dashboard_firstProductAdded,
            cell: ({ row }) => row.original.firstProductAdded
        },
        { 
            id: 'metaAdLibrary',
            header: () => <div className="text-center">{t.searchInMeta}</div>,
            cell: ({ row }) => (<div className="flex justify-center items-center"><MetaAdLibraryLink vendor={row.original.vendor} t={t} /></div>) 
        }
    ], [t, onNavigateWithFilter]);

    const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
                <thead>{table.getHeaderGroups().map(hg => (<tr key={hg.id} className="border-b border-light-border dark:border-dark-border">{hg.headers.map(h => (<th key={h.id} className={`p-4 font-semibold ${h.column.getCanSort() ? 'cursor-pointer select-none' : ''}`} onClick={h.column.getToggleSortingHandler()}><div className="flex items-center gap-2">{flexRender(h.column.columnDef.header, h.getContext())}{{ asc: <ChevronDown size={16} className="rotate-180"/>, desc: <ChevronDown size={16}/> }[h.column.getIsSorted() as string] ?? (h.column.getCanSort() ? <ChevronsUpDown size={16} className="text-gray-400"/> : null)}</div></th>))}</tr>))}</thead>
                <tbody>{table.getRowModel().rows.map(row => (<tr key={row.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-background-hover dark:hover:bg-dark-background-hover">{row.getVisibleCells().map(cell => (<td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</tr>))}</tbody>
            </table>
        </div>
    );
};

const KeywordList: React.FC<{data: {text: string, value: number}[], t: any, onNavigateWithFilter: (f: any) => void}> = ({data, t, onNavigateWithFilter}) => (
    <div className="divide-y divide-light-border dark:divide-dark-border">
        {data.map(({text, value}) => (
            <div key={text} className="p-4 flex justify-between items-center hover:bg-light-background-hover dark:hover:bg-dark-background-hover">
                <span 
                    onClick={() => onNavigateWithFilter({ name: text })}
                    className="font-semibold cursor-pointer hover:underline"
                    title={t.dashboard_searchForKeyword}
                >
                    {text}
                </span>
                <span className="font-mono text-sm bg-light-background dark:bg-dark-background px-2 py-1 rounded-md">{value}</span>
            </div>
        ))}
    </div>
);

const LanguageList: React.FC<{data: LanguageItem[], t: any, onNavigateWithFilter: (f: { language?: string }) => void}> = ({data, t, onNavigateWithFilter}) => (
    <div className="divide-y divide-light-border dark:divide-dark-border">
        {data.map(({code, count}) => (
            <div key={code} className="p-4 flex justify-between items-center hover:bg-light-background-hover dark:hover:bg-dark-background-hover">
                <span 
                    onClick={() => onNavigateWithFilter({ language: code })}
                    className="font-semibold cursor-pointer hover:underline"
                    title={t.dashboard_filterByLanguage}
                >
                    {t[code] || code.toUpperCase()}
                </span>
                <span className="font-mono text-sm bg-light-background dark:bg-dark-background px-2 py-1 rounded-md">{count}</span>
            </div>
        ))}
    </div>
);

const MetaAdLibraryLink: React.FC<{ vendor: string; t: any}> = ({ vendor, t }) => { const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`; return <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-light-background dark:hover:bg-dark-background"><img src="https://www.citypng.com/public/uploads/preview/facebook-meta-logo-icon-hd-png-701751694777703xqxtpvbu9q.png" alt="Meta Ad Library" className="w-5 h-5" /></a> };

export default DashboardPage;
