import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { TrendingUp, TrendingDown, Package, Store, Clock, ChevronsUpDown, ChevronDown, Tag, Download, Globe, Filter, BarChart3 } from 'lucide-react';
import { subDays, format, parseISO, startOfDay, eachDayOfInterval } from 'date-fns';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SegmentedControl from './SegmentedControl';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { useDashboardStore } from '../stores/dashboardStore';
import DashboardSettings from './DashboardSettings';

// --- Animation Variants (Subtle) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 20 } },
};

// --- Type Definitions ---
interface DashboardPageProps {
  products: Product[];
  allProductsRaw: Product[];
  totalBeforeFilter: number;
  onNavigateWithFilter: (filter: { name?: string; store?: string; language?: string }) from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { TrendingUp, TrendingDown, Package, Store, Clock, ChevronsUpDown, ChevronDown, Tag, Download, Globe, Filter, BarChart3 } from 'lucide-react';
import { subDays, format, parseISO, startOfDay, eachDayOfInterval } from 'date-fns';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SegmentedControl from './SegmentedControl';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { useDashboardStore } from '../stores/dashboardStore';
import DashboardSettings from './DashboardSettings';

// --- Animation Variants (Subtle) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 20 } },
};

// --- Type Definitions ---
interface DashboardPageProps {
  products: Product[];
  allProductsRaw: Product[];
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
  const csvRows = [headers.join(',')];
  for (const row of data) {
    csvRows.push(headers.map(header => `"${String(row[header]).replace(/"/g, '""')}"`).join(','));
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
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.floor(easeOutExpo(percentage) * end));
      if (progress < duration) requestAnimationFrame(animate);
      else setCount(end);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <>{count.toLocaleString()}</>;
};

// --- Skeleton Components ---
const KpiCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center gap-6 animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg w-16 h-16"></div>
        <div className='flex-1'>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

const ChartSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg h-80 animate-pulse flex flex-col justify-end">
        <div className="flex items-end gap-4 h-full px-4">
             {[...Array(12)].map((_, i) => (
                 <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-t-lg flex-1" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
             ))}
        </div>
    </div>
);

const TableSkeleton: React.FC = () => (
    <div className="overflow-x-auto p-4 animate-pulse">
        <div className="w-full">
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg h-12">
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
  const { tabVisibility } = useDashboardStore();
  const t = translations[language];

  const availableTabs = useMemo(() => [
      { id: 'stores' as ActiveView, label: t.dashboard_topStores, icon: <Store size={18} /> },
      { id: 'keywords' as ActiveView, label: t.dashboard_topKeywords, icon: <Tag size={18} /> },
      { id: 'languages' as ActiveView, label: t.dashboard_topLanguages, icon: <Globe size={18} /> },
    ].filter(tab => tabVisibility[tab.id as keyof typeof tabVisibility]), [t, tabVisibility]);

  const [activeView, setActiveView] = useState<ActiveView>(availableTabs.length > 0 ? availableTabs[0].id : 'stores');

  useEffect(() => {
    if (!availableTabs.some(tab => tab.id === activeView) && availableTabs.length > 0) {
      setActiveView(availableTabs[0].id);
    }
  }, [availableTabs, activeView]);

  const { kpiData, storeTableData, keywordData, languageData, chartData } = useMemo(() => {
    if (!products || !allProductsRaw) return { kpiData: {}, storeTableData: [], keywordData: [], languageData: [], chartData: [] };
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const recentProducts = products.filter(p => p.created_at && parseISO(p.created_at) >= thirtyDaysAgo);
    const uniqueStores = new Set(products.map(p => p.vendor).filter(Boolean));
    const storeProductCounts = allProductsRaw.reduce((acc, p) => { if(p.vendor) acc[p.vendor] = (acc[p.vendor] || 0) + 1; return acc; }, {} as {[k: string]: number});
    const storeNewProductCounts30d = recentProducts.reduce((acc, p) => { if(p.vendor) acc[p.vendor] = (acc[p.vendor] || 0) + 1; return acc; }, {} as {[k: string]: number});
    const productDatesByStore = products.reduce((acc, p) => {
      if (p.vendor && p.created_at) {
          if (!acc[p.vendor]) acc[p.vendor] = [];
          acc[p.vendor].push(parseISO(p.created_at));
      }
      return acc;
    }, {} as {[key: string]: Date[]});

    const storeDateInfo = Object.entries(productDatesByStore).reduce((acc, [vendor, dates]) => {
      dates.sort((a, b) => a.getTime() - b.getTime());
      acc[vendor] = { first: dates[0], last: dates[dates.length - 1] };
      return acc;
    }, {} as {[key: string]: {first: Date, last: Date}});

    const keywordCounts = products.reduce((acc, p) => {
      (p.name || '').toLowerCase().split(/[\s,،-]+/).forEach(word => {
        if (word && word.length > 3 && !/\d/.test(word)) acc.set(word, (acc.get(word) || 0) + 1);
      });
      return acc;
    }, new Map<string, number>());

    // Chart Data Preparation
    const productsByDate = products.reduce((acc, product) => {
        if (product.created_at) {
            const date = format(parseISO(product.created_at), 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
    }, {} as {[key: string]: number});

    const chartData = eachDayOfInterval({ start: thirtyDaysAgo, end: now }).map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
            date: format(date, 'MMM dd'),
            count: productsByDate[dateStr] || 0
        };
    });

    return {
        kpiData: { totalProducts: products.length, totalStores: uniqueStores.size, newProducts30d: recentProducts.length },
        storeTableData: Object.entries(storeProductCounts).map(([vendor, count]) => ({
            vendor,
            totalProducts: count,
            newProducts30d: storeNewProductCounts30d[vendor] || 0,
            lastProductAdded: storeDateInfo[vendor] ? format(storeDateInfo[vendor].last, 'yyyy-MM-dd') : 'N/A',
            firstProductAdded: storeDateInfo[vendor] ? format(storeDateInfo[vendor].first, 'yyyy-MM-dd') : 'N/A',
        })).sort((a, b) => b.totalProducts - a.totalProducts),
        keywordData: Array.from(keywordCounts.entries()).map(([text, value]) => ({ text, value })).sort((a,b) => b.value - a.value).slice(0, 20),
        languageData: Object.entries(products.reduce((acc, p) => { if(p.language) acc[p.language] = (acc[p.language] || 0) + 1; return acc; }, {} as {[k: string]: number}))
          .map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count).slice(0, 20),
        chartData
    };
  }, [products, allProductsRaw]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <motion.div variants={itemVariants} key={i}><KpiCardSkeleton /></motion.div>)}
        </motion.div>
        <motion.div variants={itemVariants}><ChartSkeleton /></motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <TableSkeleton />
        </motion.div>
      </div>
    );
  }
  
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* KPI Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}><KpiCard title={t.dashboard_totalProductsAll} value={totalBeforeFilter} icon={<Package />} iconBg="bg-rose-500" /></motion.div>
        <motion.div variants={itemVariants}><KpiCard title={t.dashboard_totalProductsUnique} value={kpiData.totalProducts} icon={<Filter />} iconBg="bg-amber-500" /></motion.div>
        <motion.div variants={itemVariants}><KpiCard title={t.dashboard_newProducts30d} value={kpiData.newProducts30d} icon={<TrendingUp />} iconBg="bg-teal-500" /></motion.div>
        <motion.div variants={itemVariants}><KpiCard title={t.dashboard_totalStores} value={kpiData.totalStores} icon={<Store />} iconBg="bg-indigo-500" /></motion.div>
      </motion.div>

      {/* Chart Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-indigo-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.productsTrend || "Products Trend (30 Days)"}</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700 gap-4">
          {availableTabs.length > 0 && <SegmentedControl tabs={availableTabs} activeTab={activeView} onTabChange={setActiveView} />}
          <div className="flex items-center gap-3">
            {activeView === 'stores' && <button onClick={() => exportToCsv(storeTableData, 'stores_data.csv', Object.keys(storeTableData[0] || {}))} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"><Download size={18} /> <span className="hidden sm:inline">{t.exportData}</span></button>}
            <DashboardSettings />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeView === 'stores' && <StoreTable data={storeTableData} t={t} onNavigateWithFilter={onNavigateWithFilter} totalProductsSum={totalBeforeFilter} />}
            {activeView === 'keywords' && <KeywordList data={keywordData} t={t} onNavigateWithFilter={onNavigateWithFilter} />}
            {activeView === 'languages' && <LanguageList data={languageData} t={t} onNavigateWithFilter={onNavigateWithFilter} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, iconBg }) => (
    <motion.div 
        className="relative bg-white dark:bg-gray-800 p-6 rounded-lg overflow-hidden group"
        whileHover={{ y: -3, boxShadow: '0px 8px 15px rgba(0,0,0,0.15)' }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="flex items-center gap-5 relative z-10">
        <motion.div className={`p-4 rounded-lg ${iconBg} text-white shadow-lg`} whileHover={{ scale: 1.05, rotate: 3}}>
            {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        </motion.div>
        <div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <p className="text-4xl font-black text-gray-800 dark:text-white tracking-tight"><CountUp end={value} /></p>
        </div>
      </div>
    </motion.div>
);

const StoreTable: React.FC<{data: StoreRow[], t: any, onNavigateWithFilter: (f: any) => void, totalProductsSum: number}> = ({ data, t, onNavigateWithFilter, totalProductsSum }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const { storeColumnsVisibility } = useDashboardStore();
    
    const columns = useMemo<ColumnDef<StoreRow>[]>(() => [
        { accessorKey: 'vendor', header: t.storeName, cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-sm">{row.original.vendor.substring(0, 2).toUpperCase()}</div>
                <span onClick={() => onNavigateWithFilter({ store: row.original.vendor })} className="cursor-pointer font-bold text-gray-800 dark:text-gray-100 hover:text-indigo-500 transition-colors truncate max-w-[150px]">{row.original.vendor}</span>
            </div>
        ) },
        ...storeColumnsVisibility.totalProducts ? [{ accessorKey: 'totalProducts', header: t.totalProducts, cell: ({ row }) => (
            <div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{row.original.totalProducts}</span>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full mt-1"><div className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full" style={{ width: `${(row.original.totalProducts / totalProductsSum) * 100}%` }}></div></div>
            </div>
        ) }] : [],
        ...storeColumnsVisibility.newProducts30d ? [{ accessorKey: 'newProducts30d', header: t.dashboard_newProducts30d_store, cell: ({ row }) => <span className={`font-bold text-sm ${row.original.newProducts30d > 0 ? 'text-teal-500' : 'text-gray-400 dark:text-gray-500'}`}>{row.original.newProducts30d > 0 ? `+${row.original.newProducts30d}` : '-'}</span> }] : [],
        ...storeColumnsVisibility.lastProductAdded ? [{ accessorKey: 'lastProductAdded', header: t.dashboard_lastProductAdded, cell: ({ row }) => <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">{row.original.lastProductAdded}</span> }] : [],
        ...storeColumnsVisibility.firstProductAdded ? [{ accessorKey: 'firstProductAdded', header: t.dashboard_firstProductAdded, cell: ({ row }) => <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">{row.original.firstProductAdded}</span> }] : [],
        ...storeColumnsVisibility.metaAdLibrary ? [{ id: 'metaAdLibrary', header: () => <div className="text-center">{t.searchInMeta}</div>, cell: ({ row }) => (<div className="flex justify-center items-center"><MetaAdLibraryLink vendor={row.original.vendor} t={t} /></div>) }] : [],
    ], [t, onNavigateWithFilter, storeColumnsVisibility, totalProductsSum]);

    const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
    
    return (
        <div className="overflow-x-auto"><table className="w-full text-left rtl:text-right border-collapse">
            <thead>{table.getHeaderGroups().map(hg => (<tr key={hg.id} className="border-b border-gray-100 dark:border-gray-700">{hg.headers.map(h => (<th key={h.id} className={`p-5 text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold ${h.column.getCanSort() ? 'cursor-pointer select-none' : ''}`} onClick={h.column.getToggleSortingHandler()}><div className="flex items-center gap-2">{flexRender(h.column.columnDef.header, h.getContext())}{{ asc: <ChevronDown size={14} className="rotate-180"/>, desc: <ChevronDown size={14}/> }[h.column.getIsSorted() as string]}</div></th>))}</tr>))}</thead>
            <tbody><AnimatePresence>{table.getRowModel().rows.map((row, i) => (<motion.tr custom={i} initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: i * 0.03 }} key={row.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">{row.getVisibleCells().map(cell => (<td key={cell.id} className="p-5 align-middle">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</motion.tr>))}</AnimatePresence></tbody>
        </table></div>
    );
};

const ListItem: React.FC<{ children: React.ReactNode; index: number }> = ({ children, index }) => (
  <motion.div
    custom={index}
    initial="hidden"
    animate="visible"
    variants={itemVariants}
    transition={{ delay: index * 0.03 }}
    className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
  >
    {children}
  </motion.div>
);

const KeywordList: React.FC<{data: {text: string, value: number}[], t: any, onNavigateWithFilter: (f: any) => void}> = ({data, t, onNavigateWithFilter}) => (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {data.map(({text, value}, index) => (
            <ListItem key={text} index={index}>
                <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${index < 3 ? 'bg-amber-400/20 text-amber-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>#{index + 1}</span>
                    <span onClick={() => onNavigateWithFilter({ name: text })} className="font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-indigo-500 transition-colors text-lg">{text}</span>
                </div>
                <span className="font-mono text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">{value}</span>
            </ListItem>
        ))}
    </div>
);

const LanguageList: React.FC<{data: LanguageItem[], t: any, onNavigateWithFilter: (f: { language?: string }) => void}> = ({data, t, onNavigateWithFilter}) => (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {data.map(({code, count}, index) => (
            <ListItem key={code} index={index}>
                <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${index < 3 ? 'bg-rose-400/20 text-rose-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>#{index + 1}</span>
                    <span onClick={() => onNavigateWithFilter({ language: code })} className="font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-indigo-500 transition-colors text-lg uppercase">{t[code] || code}</span>
                </div>
                 <span className="font-mono text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">{count}</span>
            </ListItem>
        ))}
    </div>
);

const MetaAdLibraryLink: React.FC<{ vendor: string; t: any}> = ({ vendor, t }) => { 
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`; 
    return <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" alt="Meta AdLibrary" className="w-5 h-5" /></a> 
};

export default DashboardPage;
