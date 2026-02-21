import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Filter, Instagram, Facebook, Activity, Layers, Tag, Globe, Languages, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Product, InstagramPost, FacebookPost } from '../types';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiCard from './dashboard/KpiCard';
import Chart from './dashboard/Chart';
import SmartInstagramTable from './dashboard/SmartInstagramTable';
import SmartFacebookTable from './dashboard/SmartFacebookTable';
import { StoreTable, KeywordList, LanguageList } from './dashboard/TabbedLists';
import { useQuery } from '@tanstack/react-query';
import { loadInstagramPosts } from '../utils/instagramLoader';
import { loadFacebookPosts } from '../utils/facebookLoader';
import DashboardSettings from './DashboardSettings';

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Reverted exportToCsv to include all columns by default
const exportToCsv = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header as keyof any];
      const escaped = ('' + (val !== null && val !== undefined ? val : '')).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
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

const EnhancedKpiCard = ({ title, value, icon, color, growth }: any) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all duration-300`}>
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-bl-full transition-transform group-hover:scale-110`}></div>
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value.toLocaleString()}</h3>
                
                {growth !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{Math.abs(growth).toFixed(1)}% vs last 30d</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 shadow-sm`}>
                {icon}
            </div>
        </div>
    </div>
);

interface DashboardPageProps {
  products: Product[];
  allProductsRaw: Product[];
  totalBeforeFilter: number;
  onNavigateWithFilter: any;
  isLoading: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ products, onNavigateWithFilter }) => {
  const { language } = useLanguageStore();
  const t = translations[language] as any;
  const [activeTab, setActiveTab] = useState<'instagram' | 'facebook' | 'stores' | 'keywords' | 'languages'>('instagram');

  const { data: instagramPosts = [] } = useQuery<InstagramPost[]>({
    queryKey: ['instagramPosts'],
    queryFn: loadInstagramPosts,
    staleTime: Infinity,
    gcTime: Infinity
  });

  const { data: facebookPosts = [] } = useQuery<FacebookPost[]>({
    queryKey: ['facebookPosts'],
    queryFn: loadFacebookPosts,
    staleTime: Infinity,
    gcTime: Infinity
  });

  const { 
      kpi, 
      chartData, 
      visibleInstagramAccounts, 
      allInstagramAccounts,
      allFacebookPages,
      topStores, 
      topLanguages,
      topKeywords 
  } = useDashboardData(products, instagramPosts, facebookPosts);

  const handleExport = () => {
      if (activeTab === 'stores') {
          exportToCsv(topStores, 'stores_data.csv');
      } else if (activeTab === 'instagram') {
          const exportData = allInstagramAccounts.map(acc => ({
              ...acc,
              firstPost: acc.firstPost ? acc.firstPost.toISOString().split('T')[0] : '',
              lastPost: acc.lastPost ? acc.lastPost.toISOString().split('T')[0] : '',
              timestamps: '' // Exclude timestamps array from export
          }));
          exportToCsv(exportData, 'instagram_accounts_full.csv');
      } else if (activeTab === 'facebook') {
          const exportData = allFacebookPages.map(acc => ({
              ...acc,
              firstPost: acc.firstPost ? acc.firstPost.toISOString().split('T')[0] : '',
              lastPost: acc.lastPost ? acc.lastPost.toISOString().split('T')[0] : '',
              timestamps: '' // Exclude timestamps array from export
          }));
          exportToCsv(exportData, 'facebook_pages_full.csv');
      } else if (activeTab === 'keywords') {
          exportToCsv(topKeywords, 'top_keywords.csv');
      }
  };

  return (
    <motion.div 
       initial="hidden" 
       animate="visible" 
       variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
       className="space-y-8 pb-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
         <motion.div variants={fadeIn}>
            <EnhancedKpiCard title={t.dashboard_totalProductsAll} value={kpi.totalProducts} icon={<Package />} color="indigo" />
         </motion.div>
         <motion.div variants={fadeIn}>
            <EnhancedKpiCard title={t.instagram_feature} value={kpi.totalPosts} icon={<Instagram />} color="pink" />
         </motion.div>
         <motion.div variants={fadeIn}>
            <EnhancedKpiCard title={t.dashboard_newProducts30d} value={kpi.newProducts30d} icon={<TrendingUp />} color="teal" growth={kpi.productsGrowth} />
         </motion.div>
         <motion.div variants={fadeIn}>
            <EnhancedKpiCard title="Total Languages" value={kpi.totalLanguages} icon={<Languages />} color="orange" />
         </motion.div>
      </div>

      <motion.div variants={fadeIn}>
         <Chart data={chartData} title={t.productsTrend} t={t} />
      </motion.div>

      <motion.div variants={fadeIn} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap justify-center sm:justify-start gap-1 w-full sm:w-auto">
                {[
                    { id: 'instagram', label: t.instagram_feature, icon: <Instagram size={16} /> },
                    { id: 'facebook', label: 'Facebook', icon: <Facebook size={16} /> },
                    { id: 'stores', label: t.store, icon: <Layers size={16} /> },
                    { id: 'keywords', label: 'Keywords', icon: <Filter size={16} /> },
                    { id: 'languages', label: t.language_filter, icon: <Globe size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                            activeTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-400'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end px-2">
                {(activeTab === 'stores' || activeTab === 'instagram' || activeTab === 'facebook' || activeTab === 'keywords') && (
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium text-xs border border-gray-200 dark:border-gray-600"
                    >
                        <Download size={14} /> 
                        <span>{t.exportData || 'Export CSV'}</span>
                    </button>
                )}
                {activeTab === 'stores' && <DashboardSettings />}
            </div>
        </div>

        <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            {activeTab === 'instagram' && <SmartInstagramTable accounts={visibleInstagramAccounts} t={t} />}
            
            {activeTab === 'facebook' && <SmartFacebookTable pages={allFacebookPages} t={t} />}
            
            {activeTab === 'stores' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <StoreTable data={topStores as any} t={t} onNavigateWithFilter={onNavigateWithFilter} totalProductsSum={kpi.totalProducts} />
                </div>
            )}
            {activeTab === 'keywords' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                   <KeywordList data={topKeywords} t={t} onNavigateWithFilter={onNavigateWithFilter} />
                </div>
            )}
            {activeTab === 'languages' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <LanguageList data={topLanguages} t={t} onNavigateWithFilter={onNavigateWithFilter} />
                </div>
            )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
