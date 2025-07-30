import React, { useState, useMemo } from 'react';
import { Product, Locale } from '../types';
import { ExternalLink, Calendar, Package, Search, Store, Languages as LanguagesIcon, ChevronDown } from 'lucide-react';
import { getLanguageName } from '../utils/languageUtils';

// --- Translations ---
const translations = {
  ar: {
    reports: 'التقارير',
    stores: 'المتاجر',
    languages: 'اللغات',
    totalActiveStores: 'إجمالي المتاجر النشطة',
    storeActivity: 'نشاط المتاجر',
    languageActivity: 'نشاط اللغات',
    timePeriod: 'الفترة الزمنية',
    storeName: 'اسم المتجر',
    productsInPeriod: 'المنتجات بالفترة',
    totalProducts: 'إجمالي المنتجات',
    adLibrary: 'مكتبة الإعلانات',
    storesWithLanguage: 'المتاجر الداعمة للغة',
    last7days: 'آخر 7 أيام',
    last30days: 'آخر 30 يومًا',
    last3months: 'آخر 3 أشهر',
    last6months: 'آخر 6 أشهر',
    lastYear: 'آخر سنة',
    noStoresFound: 'لم يتم العثور على متاجر.',
    noLanguagesFound: 'لم يتم العثور على لغات نشطة في هذه الفترة.',
    searchInMeta: 'البحث في مكتبة ميتا',
    supportingStores: 'المتاجر الداعمة:',
  },
  en: {
    reports: 'Reports',
    stores: 'Stores',
    languages: 'Languages',
    totalActiveStores: 'Total Active Stores',
    storeActivity: 'Store Activity',
    languageActivity: 'Language Activity',
    timePeriod: 'Time Period',
    storeName: 'Store Name',
    productsInPeriod: 'Products in Period',
    totalProducts: 'Total Products',
    adLibrary: 'Ad Library',
    storesWithLanguage: 'Stores with Language',
    last7days: 'Last 7 Days',
    last30days: 'Last 30 Days',
    last3months: 'Last 3 Months',
    last6months: 'Last 6 Months',
    lastYear: 'Last Year',
    noStoresFound: 'No stores found.',
    noLanguagesFound: 'No active languages found for this period.',
    searchInMeta: 'Search in Meta Library',
    supportingStores: 'Supporting Stores:',
  },
};

// --- Helper Functions & Constants ---
const getDateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const timeFilterOptions = [
  { value: 7, labelKey: 'last7days' },
  { value: 30, labelKey: 'last30days' },
  { value: 90, labelKey: 'last3months' },
  { value: 180, labelKey: 'last6months' },
  { value: 365, labelKey: 'lastYear' },
];

interface Stats { totalCount: number; countInPeriod: number; }
interface StoreStats extends Stats { facebook_page_id?: string; }
interface LanguageReportStats { storeCount: number; vendors: Set<string>; }
interface ReportsPageProps { products: Product[]; locale: Locale; }
type ActiveTab = 'stores' | 'languages';

const ReportsPage: React.FC<ReportsPageProps> = ({ products, locale }) => {
  const [timeFilter, setTimeFilter] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stores');
  const t = translations[locale];

  const { storeStats, languageStats, totalActiveStores } = useMemo(() => {
    const filterDate = getDateDaysAgo(timeFilter);
    const storeMap = new Map<string, StoreStats>();
    const langMap = new Map<string, Set<string>>();
    const vendors = new Set<string>();

    for (const product of products) {
      const vendor = product.vendor;
      if (!vendor) continue;
      
      vendors.add(vendor);
      const language = product.language;
      
      if (!storeMap.has(vendor)) storeMap.set(vendor, { totalCount: 0, countInPeriod: 0 });
      const storeData = storeMap.get(vendor)!;
      storeData.totalCount++;
      if (product.store?.facebook_page_id) storeData.facebook_page_id = product.store.facebook_page_id;
      if (new Date(product.created_at) >= filterDate) storeData.countInPeriod++;
      
      if (language) {
        if (!langMap.has(language)) langMap.set(language, new Set<string>());
        langMap.get(language)!.add(vendor);
      }
    }

    const finalStoreStats = Array.from(storeMap.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.countInPeriod - a.countInPeriod);
    const finalLangStats = Array.from(langMap.entries()).map(([name, vendors]) => ({ name, storeCount: vendors.size, vendors })).sort((a, b) => b.storeCount - a.storeCount);
    
    return { storeStats: finalStoreStats, languageStats: finalLangStats, totalActiveStores: vendors.size };
  }, [products, timeFilter]);

  return (
    <div className="animate-fade-in-up space-y-8">
      <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">{t.reports}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">{t.totalActiveStores}</h3>
          <p className="text-4xl font-bold text-brand-primary mt-2">{totalActiveStores}</p>
        </div>
      </div>
      
      <div className="bg-light-surface dark:bg-dark-surface p-2 rounded-xl shadow-inner flex gap-2">
        <TabButton tabId="stores" icon={<Store size={18}/>} label={t.stores} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton tabId="languages" icon={<LanguagesIcon size={18}/>} label={t.languages} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow overflow-hidden">
        <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold">{activeTab === 'stores' ? t.storeActivity : t.languageActivity}</h2>
          {activeTab === 'stores' && <TimeFilterSelector timeFilter={timeFilter} setTimeFilter={setTimeFilter} t={t} />}
        </div>
        {activeTab === 'stores' && <StoresReportTable stats={storeStats} t={t} />}
        {activeTab === 'languages' && <LanguagesReportTable stats={languageStats} t={t} locale={locale} />}
      </div>
    </div>
  );
};

// --- Sub-components ---

const TabButton: React.FC<{tabId: ActiveTab; icon: React.ReactNode; label: string; activeTab: ActiveTab; setActiveTab: (tab:ActiveTab)=>void}> = ({ tabId, icon, label, activeTab, setActiveTab }) => (
  <button onClick={() => setActiveTab(tabId)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === tabId ? 'bg-brand-primary text-white shadow' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-background-hover dark:hover:bg-dark-background-hover'}`}>
    {icon} {label}
  </button>
);

const TimeFilterSelector: React.FC<{timeFilter: number; setTimeFilter: (value: number) => void; t: any}> = ({ timeFilter, setTimeFilter, t }) => (
  <div className="relative">
    <select value={timeFilter} onChange={(e) => setTimeFilter(Number(e.target.value))} className="appearance-none cursor-pointer p-2.5 pl-4 pr-10 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary" aria-label={t.timePeriod}>
      {timeFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{t[opt.labelKey]}</option>)}
    </select>
    <Calendar className="w-5 h-5 absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-gray-400 pointer-events-none" />
  </div>
);

const StoresReportTable: React.FC<{stats: (StoreStats & {name:string})[]; t: any}> = ({stats, t}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead><tr className="bg-light-background dark:bg-dark-background"><th className="p-4 font-semibold">{t.storeName}</th><th className="p-4 font-semibold text-center">{t.totalProducts}</th><th className="p-4 font-semibold text-center">{t.productsInPeriod}</th><th className="p-4 font-semibold text-center">{t.adLibrary}</th></tr></thead>
        <tbody>
          {stats.map((store, index) => (
            <tr key={store.name} className="border-t border-light-border dark:border-dark-border hover:bg-light-background-hover dark:hover:bg-dark-background-hover">
              <td className="p-4 font-medium flex items-center gap-3"><span className="text-sm text-gray-400">{index + 1}.</span> {store.name}</td>
              <td className="p-4 text-center font-mono">{store.totalCount}</td>
              <td className="p-4 text-center font-mono text-brand-primary font-bold">{store.countInPeriod > 0 ? store.countInPeriod : '-'}</td>
              <td className="p-4 text-center"><MetaAdLibraryLink vendor={store.name} pageId={store.facebook_page_id} t={t} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {stats.length === 0 && <EmptyState message={t.noStoresFound} />}
    </div>
  );
};

const LanguagesReportTable: React.FC<{stats: (LanguageReportStats & {name:string})[]; t: any; locale: Locale}> = ({stats, t, locale}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead><tr className="bg-light-background dark:bg-dark-background"><th className="p-4 font-semibold">{t.languageName}</th><th className="p-4 font-semibold text-center">{t.storesWithLanguage}</th></tr></thead>
        <tbody>
          {stats.map((lang, index) => (
            <React.Fragment key={lang.name}>
              <tr onClick={() => setExpandedRow(expandedRow === lang.name ? null : lang.name)} className="border-t border-light-border dark:border-dark-border hover:bg-light-background-hover dark:hover:bg-dark-background-hover cursor-pointer">
                <td className="p-4 font-medium flex items-center gap-3">
                  <ChevronDown size={16} className={`transition-transform duration-200 ${expandedRow === lang.name ? 'rotate-180' : ''}`} />
                  {getLanguageName(lang.name, locale)} <span className="text-xs text-gray-500">({lang.name.toUpperCase()})</span>
                </td>
                <td className="p-4 text-center font-mono text-lg text-brand-primary font-bold">{lang.storeCount}</td>
              </tr>
              {expandedRow === lang.name && (
                <tr className="bg-light-background-hover dark:hover:bg-dark-background-hover">
                  <td colSpan={2} className="p-4">
                    <h4 className="font-semibold mb-2">{t.supportingStores}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(lang.vendors).sort().map(vendor => (
                        <span key={vendor} className="bg-gray-200 dark:bg-gray-700 text-sm font-mono px-2 py-1 rounded-md">{vendor}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {stats.length === 0 && <EmptyState message={t.noLanguagesFound} />}
    </div>
  );
};

const MetaAdLibraryLink: React.FC<{ vendor: string; pageId?: string; t: any}> = ({ vendor, pageId, t }) => {
    const url = (pageId && pageId !== '0')
        ? `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&view_all_page_id=${pageId}&search_type=page`
        : `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`;
    return <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800/50 dark:text-blue-300 dark:hover:bg-blue-800/80"><Search size={16} /></a>
};

const EmptyState: React.FC<{message: string}> = ({message}) => (
    <div className="text-center p-16 text-light-text-secondary dark:text-dark-text-secondary">
        <Package size={48} className="mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold">{message}</h3>
    </div>
);

export default ReportsPage;
