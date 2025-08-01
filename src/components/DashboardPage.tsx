import React, { useMemo, useState } from 'react';
import { Product, Locale } from '../types';
import { TrendingUp, Package, Store, Clock, Search, ChevronsUpDown, ChevronDown, Tag } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import { subDays, format, parseISO } from 'date-fns';
import { translations } from '../translations';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import SegmentedControl from './SegmentedControl';

// --- Types ---
interface DashboardPageProps { products: Product[]; locale: Locale; }
interface KpiCardProps { title: string; value: string | number; icon: React.ReactNode; }
interface StoreRow { vendor: string; totalProducts: number; }
type ActiveView = 'stores' | 'keywords';

// --- Main Component ---
const DashboardPage: React.FC<DashboardPageProps> = ({ products, locale }) => {
  const t = translations[locale];
  const [activeView, setActiveView] = useState<ActiveView>('stores');

  const { kpiData, trendData, storeTableData, keywordData } = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const recentProducts = products.filter(p => parseISO(p.created_at) >= thirtyDaysAgo);
    const uniqueStores = new Set(products.map(p => p.vendor));
    const recentUniqueStores = new Set(recentProducts.map(p => p.vendor));

    const dailyProductCounts = recentProducts.reduce((acc, product) => {
        const day = format(parseISO(product.created_at), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const finalTrendData = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(now, i);
        const dayKey = format(date, 'yyyy-MM-dd');
        return { x: format(date, 'MM-dd'), y: dailyProductCounts[dayKey] || 0 };
    }).reverse();

    const storeProductCounts = products.reduce((acc, product) => {
        if(product.vendor) acc[product.vendor] = (acc[product.vendor] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});

    const keywordCounts = products.reduce((acc, product) => {
        product.name.toLowerCase().split(/[\s,،-]+/).forEach(word => {
            if (word && word.length > 3 && !new Set(['from', 'with', 'for']).has(word) && !/\d/.test(word)) {
                acc.set(word, (acc.get(word) || 0) + 1);
            }
        });
        return acc;
    }, new Map<string, number>());
    
    return {
        kpiData: { totalProducts: products.length, totalStores: uniqueStores.size, newProducts30d: recentProducts.length, newStores30d: recentUniqueStores.size },
        trendData: [{ id: 'New Products', data: finalTrendData }],
        storeTableData: Object.entries(storeProductCounts).map(([vendor, count]) => ({ vendor, totalProducts: count })),
        keywordData: Array.from(keywordCounts.entries()).map(([text, value]) => ({ text, value })).sort((a,b) => b.value - a.value).slice(0, 20)
    };
  }, [products]);

  const tabs = [
      { id: 'stores' as ActiveView, label: t.dashboard_topStores, icon: <Store size={16} /> },
      { id: 'keywords' as ActiveView, label: t.dashboard_topKeywords, icon: <Tag size={16} /> }
  ];

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t.dashboard_totalProducts} value={kpiData.totalProducts} icon={<Package className="text-blue-500" />} />
        <KpiCard title={t.dashboard_totalStores} value={kpiData.totalStores} icon={<Store className="text-purple-500" />} />
        <KpiCard title={t.dashboard_newProducts30d} value={kpiData.newProducts30d} icon={<TrendingUp className="text-green-500" />} />
        <KpiCard title={t.dashboard_newStores30d} value={kpiData.newStores30d} icon={<Clock className="text-yellow-500" />} />
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow p-6 h-[400px]">
         <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-brand-primary" />{t.dashboard_productTrends}</h3>
        <ResponsiveLine data={trendData} margin={{ top: 20, right: 40, bottom: 60, left: 60 }} xScale={{ type: 'point' }} yScale={{ type: 'linear', min: 'auto', max: 'auto' }} axisTop={null} axisRight={null} axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: -45 }} axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Count', legendOffset: -40, legendPosition: 'middle' }} pointSize={8} pointBorderWidth={2} useMesh={true} colors={['#6366f1']} theme={{ axis: { ticks: { text: { fill: 'var(--color-text-secondary)' } }, legend: { text: { fill: 'var(--color-text-secondary)' } } }, grid: { line: { stroke: 'var(--color-border)', strokeWidth: 0.5 } }, tooltip: { container: { background: 'var(--color-bg-surface-strong)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' } } }} />
      </div>
      
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow">
        <div className="p-4"><SegmentedControl tabs={tabs} activeTab={activeView} onTabChange={setActiveView} /></div>
        {activeView === 'stores' ? <StoreTable data={storeTableData} t={t} /> : <KeywordList data={keywordData} t={t} />}
      </div>
    </div>
  );
};

// ... KpiCard remains the same ...
const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => ( <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow flex items-center gap-6"> <div className="bg-light-background dark:bg-dark-background p-4 rounded-full">{React.cloneElement(icon as React.ReactElement, { size: 32 })}</div> <div> <h3 className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">{title}</h3> <p className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">{value}</p> </div> </div> );

const StoreTable: React.FC<{data: StoreRow[], t: any}> = ({ data, t }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const columns = useMemo(() => [
        { accessorKey: 'vendor', header: t.storeName }, { accessorKey: 'totalProducts', header: t.totalProducts },
        { id: 'actions', header: '', meta: { thClassName: 'text-right' }, cell: ({ row }: { row: { original: StoreRow } }) => (<div className="text-right"><MetaAdLibraryLink vendor={row.original.vendor} t={t} /></div>) }
    ], [t]);
    const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
    return (<div className="overflow-x-auto"><table className="w-full text-left"><thead>{table.getHeaderGroups().map(hg => (<tr key={hg.id} className="border-b border-light-border dark:border-dark-border">{hg.headers.map(h => (<th key={h.id} className={`p-4 font-semibold cursor-pointer select-none ${h.column.columnDef.meta?.thClassName || ''}`} onClick={h.column.getToggleSortingHandler()}><div className="flex items-center gap-2">{flexRender(h.column.columnDef.header, h.getContext())}{{ asc: <ChevronDown size={16} className="rotate-180"/>, desc: <ChevronDown size={16}/> }[h.column.getIsSorted() as string] ?? (h.column.getCanSort() ? <ChevronsUpDown size={16} className="text-gray-400"/> : null)}</div></th>))}</tr>))}</thead><tbody>{table.getRowModel().rows.map(row => (<tr key={row.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-background-hover dark:hover:bg-dark-background-hover">{row.getVisibleCells().map(cell => (<td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</tr>))}</tbody></table></div>);
};

const KeywordList: React.FC<{data: {text: string, value: number}[], t: any}> = ({data, t}) => (
    <div className="divide-y divide-light-border dark:divide-dark-border">
        {data.map(({text, value}) => (
            <div key={text} className="p-4 flex justify-between items-center hover:bg-light-background-hover dark:hover:bg-dark-background-hover">
                <span className="font-semibold">{text}</span>
                <span className="font-mono text-sm bg-light-background dark:bg-dark-background px-2 py-1 rounded-md">{value}</span>
            </div>
        ))}
    </div>
);

const MetaAdLibraryLink: React.FC<{ vendor: string; t: any}> = ({ vendor, t }) => { const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`; return <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-light-background dark:hover:bg-dark-background"><Search size={18} /></a> };

export default DashboardPage;
