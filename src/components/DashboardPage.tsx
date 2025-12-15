import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, StoreRow, KeywordItem, LanguageItem, ActiveView } from '../types';
import { TrendingUp, Package, Store, Globe, Tag, Download, Filter } from 'lucide-react';
import { subDays, format, parseISO, eachDayOfInterval } from 'date-fns';
import SegmentedControl from './SegmentedControl';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { useDashboardStore } from '../stores/dashboardStore';
import DashboardSettings from './DashboardSettings';
import KpiCard from './dashboard/KpiCard';
import Chart from './dashboard/Chart';
import { StoreTable, KeywordList, LanguageList } from './dashboard/TabbedLists';
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from './dashboard/DashboardSkeletons';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};


// --- Type Definitions ---
interface DashboardPageProps {
  products: Product[];
  allProductsRaw: Product[];
  totalBeforeFilter: number;
  onNavigateWithFilter: (filter: { name?: string; store?: string; language?: string }) => void;
  isLoading: boolean;
}

// --- Utility Function ---
const exportToCsv = (data: StoreRow[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header as keyof StoreRow]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  const csvString = csvRows.join('\\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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

  const [activeView, setActiveView] = useState<ActiveView>('stores');

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeView)) {
      setActiveView(availableTabs[0].id);
    } else if (availableTabs.length === 0) {
      // Handle case where no tabs are visible, maybe set a default or show a message
    }
  }, [availableTabs, activeView]);


  const { kpiData, storeTableData, keywordData, languageData, chartData } = useMemo(() => {
    if (!products || !allProductsRaw) {
        return { kpiData: { totalProducts: 0, totalStores: 0, newProducts30d: 0 }, storeTableData: [], keywordData: [], languageData: [], chartData: [] };
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);
    const ninetyDaysAgo = subDays(now, 90);
    const oneEightyDaysAgo = subDays(now, 180);

    const getRecentProductReducer = (period: Date) => {
        return products.reduce((acc, p) => {
            if (p.vendor && p.created_at && parseISO(p.created_at) >= period) {
                acc[p.vendor] = (acc[p.vendor] || 0) + 1;
            }
            return acc;
        }, {} as {[k: string]: number});
    };

    const storeNewProductCounts30d = getRecentProductReducer(thirtyDaysAgo);
    const storeNewProductCounts60d = getRecentProductReducer(sixtyDaysAgo);
    const storeNewProductCounts90d = getRecentProductReducer(ninetyDaysAgo);
    const storeNewProductCounts180d = getRecentProductReducer(oneEightyDaysAgo);

    const uniqueStores = new Set(products.map(p => p.vendor).filter(Boolean));
    const storeProductCounts = allProductsRaw.reduce((acc, p) => { if(p.vendor) acc[p.vendor] = (acc[p.vendor] || 0) + 1; return acc; }, {} as {[k: string]: number});
    
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
        (p.name || '').toLowerCase().split(/[\\s,،-]+/).forEach(word => {
            if (word && word.length > 3 && !/\\d/.test(word)) {
                acc.set(word, (acc.get(word) || 0) + 1);
            }
        });
        return acc;
    }, new Map<string, number>());

    const productsByDate = products.reduce((acc, product) => {
        if (product.created_at) {
            const date = format(parseISO(product.created_at), 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
    }, {} as {[key: string]: number});

    const calculatedChartData = eachDayOfInterval({ start: thirtyDaysAgo, end: now }).map(date => ({
        date: format(date, 'MMM dd'),
        count: productsByDate[format(date, 'yyyy-MM-dd')] || 0,
    }));

    return {
        kpiData: { totalProducts: products.length, totalStores: uniqueStores.size, newProducts30d: Object.values(storeNewProductCounts30d).reduce((a, b) => a + b, 0) },
        storeTableData: Object.entries(storeProductCounts)
            .map(([vendor, count]): StoreRow => {
                const newProducts30d = storeNewProductCounts30d[vendor] || 0;
                const newProducts60d = storeNewProductCounts60d[vendor] || 0;
                const newProducts90d = storeNewProductCounts90d[vendor] || 0;
                const newProducts180d = storeNewProductCounts180d[vendor] || 0;

                return {
                    vendor,
                    totalProducts: count,
                    newProducts30d,
                    newProducts60d,
                    newProducts90d,
                    newProducts180d,
                    newProducts30dPercentage: count > 0 ? (newProducts30d / count) * 100 : 0,
                    newProducts60dPercentage: count > 0 ? (newProducts60d / count) * 100 : 0,
                    newProducts90dPercentage: count > 0 ? (newProducts90d / count) * 100 : 0,
                    newProducts180dPercentage: count > 0 ? (newProducts180d / count) * 100 : 0,
                    activityRate30d: count > 0 ? (newProducts30d / count) * 100 : 0,
                    activityRate60d: count > 0 ? (newProducts60d / count) * 100 : 0,
                    activityRate90d: count > 0 ? (newProducts90d / count) * 100 : 0,
                    activityRate180d: count > 0 ? (newProducts180d / count) * 100 : 0,
                    lastProductAdded: storeDateInfo[vendor] ? format(storeDateInfo[vendor].last, 'yyyy-MM-dd') : 'N/A',
                    firstProductAdded: storeDateInfo[vendor] ? format(storeDateInfo[vendor].first, 'yyyy-MM-dd') : 'N/A',
                }
            })
            .sort((a, b) => b.totalProducts - a.totalProducts),
        keywordData: Array.from(keywordCounts.entries()).map(([text, value]): KeywordItem => ({ text, value })).sort((a,b) => b.value - a.value).slice(0, 20),
        languageData: Object.entries(products.reduce((acc, p) => { if(p.language) acc[p.language] = (acc[p.language] || 0) + 1; return acc; }, {} as {[k: string]: number}))
          .map(([code, count]): LanguageItem => ({ code, count })).sort((a, b) => b.count - a.count).slice(0, 20),
        chartData: calculatedChartData
    };
  }, [products, allProductsRaw]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <motion.div variants={itemVariants} key={i}><KpiCardSkeleton /></motion.div>)}
        </motion.div>
        <motion.div variants={itemVariants}><ChartSkeleton /></motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <TableSkeleton />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t.dashboard_totalProductsAll} value={totalBeforeFilter} icon={<Package />} color="rose" />
        <KpiCard title={t.dashboard_totalProductsUnique} value={kpiData.totalProducts} icon={<Filter />} color="amber" />
        <KpiCard title={t.dashboard_newProducts30d} value={kpiData.newProducts30d} icon={<TrendingUp />} color="teal" />
        <KpiCard title={t.dashboard_totalStores} value={kpiData.totalStores} icon={<Store />} color="indigo" />
      </div>

      {/* Chart Section */}
      <motion.div variants={itemVariants}>
        <Chart data={chartData} title={t.productsTrend} />
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700 gap-4">
          {availableTabs.length > 0 && <SegmentedControl tabs={availableTabs} activeTab={activeView} onTabChange={setActiveView} />}
          <div className="flex items-center gap-3">
            {activeView === 'stores' && 
              <button 
                onClick={() => exportToCsv(storeTableData, 'stores_data.csv')} 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                <Download size={18} /> 
                <span className="hidden sm:inline">{t.exportData}</span>
              </button>
            }
            <DashboardSettings />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeView} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
          >
            {activeView === 'stores' && <StoreTable data={storeTableData} t={t} onNavigateWithFilter={onNavigateWithFilter} totalProductsSum={totalBeforeFilter} />}
            {activeView === 'keywords' && <KeywordList data={keywordData} t={t} onNavigateWithFilter={onNavigateWithFilter} />}
            {activeView === 'languages' && <LanguageList data={languageData} t={t} onNavigateWithFilter={onNavigateWithFilter} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
