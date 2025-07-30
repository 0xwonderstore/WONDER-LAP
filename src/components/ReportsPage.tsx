import React, { useState, useMemo } from 'react';
import { Product, Locale } from '../types';
import { ExternalLink, Calendar, Package, Search, Store, Languages as LanguagesIcon, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { getLanguageName } from '../utils/languageUtils';

// --- Types ---
type SortDirection = 'asc' | 'desc';
type StoreSortKey = 'name' | 'totalCount' | 'countInPeriod';
type LanguageSortKey = 'name' | 'storeCount';

interface StoreStats { name: string; totalCount: number; countInPeriod: number; facebook_page_id?: string; }
interface LanguageStats { name: string; storeCount: number; vendors: Set<string>; }
interface ReportsPageProps { products: Product[]; locale: Locale; }
type ActiveTab = 'stores' | 'languages';

// --- Translations ---
const translations = {
    ar: { reports: 'التقارير', stores: 'المتاجر', languages: 'اللغات', totalActiveStores: 'إجمالي المتاجر النشطة', storeActivity: 'نشاط المتاجر', languageActivity: 'نشاط اللغات', timePeriod: 'الفترة الزمنية', storeName: 'اسم المتجر', productsInPeriod: 'المنتجات بالفترة', totalProducts: 'إجمالي المنتجات', adLibrary: 'مكتبة الإعلانات', storesWithLanguage: 'المتاجر الداعمة للغة', last7days: 'آخر 7 أيام', last30days: 'آخر 30 يومًا', last3months: 'آخر 3 أشهر', last6months: 'آخر 6 أشهر', lastYear: 'آخر سنة', noData: 'لا توجد بيانات للعرض.', searchInMeta: 'البحث في مكتبة ميتا', supportingStores: 'المتاجر الداعمة:' },
    en: { reports: 'Reports', stores: 'Stores', languages: 'Languages', totalActiveStores: 'Total Active Stores', storeActivity: 'Store Activity', languageActivity: 'Language Activity', timePeriod: 'Time Period', storeName: 'Store Name', productsInPeriod: 'Products in Period', totalProducts: 'Total Products', adLibrary: 'Ad Library', storesWithLanguage: 'Stores with Language', last7days: 'Last 7 Days', last30days: 'Last 30 Days', last3months: 'Last 3 Months', last6months: 'Last 6 Months', lastYear: 'Last Year', noData: 'No data to display.', searchInMeta: 'Search in Meta Library', supportingStores: 'Supporting Stores:' },
};

// --- Helper: Date Calculation ---
const getDateDaysAgo = (days: number) => { const d = new Date(); d.setDate(d.getDate() - days); return d; };

// --- Main Component ---
const ReportsPage: React.FC<ReportsPageProps> = ({ products, locale }) => {
  const [timeFilter, setTimeFilter] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stores');
  const t = translations[locale];

  const { storeStats, languageStats, totalActiveStores } = useMemo(() => {
    const storeMap = new Map<string, Omit<StoreStats, 'name'>>();
    const langMap = new Map<string, Omit<LanguageStats, 'name'>>();
    const vendors = new Set<string>();

    for (const product of products) {
        if (product.vendor) vendors.add(product.vendor);
    }
    vendors.forEach(vendor => storeMap.set(vendor, { totalCount: 0, countInPeriod: 0 }));

    const filterDate = getDateDaysAgo(timeFilter);

    for (const product of products) {
        const { vendor, language, created_at, store } = product;
        if (!vendor) continue;

        storeMap.get(vendor)!.totalCount++;
        if (new Date(created_at) >= filterDate) storeMap.get(vendor)!.countInPeriod++;
        if (store?.facebook_page_id) storeMap.get(vendor)!.facebook_page_id = store.facebook_page_id;

        if (language) {
            if (!langMap.has(language)) langMap.set(language, { storeCount: 0, vendors: new Set() });
            langMap.get(language)!.vendors.add(vendor);
        }
    }
    langMap.forEach(lang => lang.storeCount = lang.vendors.size);

    return {
        storeStats: Array.from(storeMap.entries()).map(([name, data]) => ({ name, ...data })),
        languageStats: Array.from(langMap.entries()).map(([name, data]) => ({ name, ...data })),
        totalActiveStores: vendors.size,
    };
  }, [products, timeFilter]);

  return (
    <div className="animate-fade-in-up space-y-8">
      <h1 className="text-3xl font-bold">{t.reports}</h1>
      <StatCard title={t.totalActiveStores} value={totalActiveStores} />
      <div className="bg-light-surface dark:bg-dark-surface p-2 rounded-xl shadow-inner flex gap-2">
        <TabButton id="stores" icon={<Store size={18}/>} label={t.stores} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="languages" icon={<LanguagesIcon size={18}/>} label={t.languages} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow overflow-hidden">
        <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold">{activeTab === 'stores' ? t.storeActivity : t.languageActivity}</h2>
          {activeTab === 'stores' && <TimeFilterSelector value={timeFilter} onChange={setTimeFilter} t={t} />}
        </div>
        {activeTab === 'stores' ? <StoresReportTable stats={storeStats} t={t} /> : <LanguagesReportTable stats={languageStats} t={t} locale={locale} />}
      </div>
    </div>
  );
};


// --- Report Table Components ---

const StoresReportTable: React.FC<{stats: StoreStats[]; t: any}> = ({stats, t}) => {
  const [sortKey, setSortKey] = useState<StoreSortKey>('countInPeriod');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        const order = sortDir === 'asc' ? 1 : -1;
        if (typeof valA === 'string' && typeof valB === 'string') return valA.localeCompare(valB) * order;
        if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * order;
        return 0;
    });
  }, [stats, sortKey, sortDir]);

  const handleSort = (key: StoreSortKey) => {
    if (key === sortKey) {
        setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDir('desc');
    }
  };

  const headers: { key: StoreSortKey; label: string; isNumeric?: boolean }[] = [
      { key: 'name', label: t.storeName },
      { key: 'totalCount', label: t.totalProducts, isNumeric: true },
      { key: 'countInPeriod', label: t.productsInPeriod, isNumeric: true }
  ];

  return (
    <TableWrapper>
      <thead><tr className="bg-light-background dark:bg-dark-background">
        {headers.map(h => <SortableHeader key={h.key} id={h.key} label={h.label} isNumeric={h.isNumeric} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />)}
        <th className="p-4 font-semibold text-center">{t.adLibrary}</th>
      </tr></thead>
      <tbody>
        {sortedStats.map((store, index) => (
          <tr key={store.name} className="border-t hover:bg-light-background-hover dark:hover:bg-dark-background-hover">
            <td className="p-4 font-medium flex items-center gap-3"><span className="text-sm text-gray-400">{index + 1}.</span> {store.name}</td>
            <td className="p-4 text-center font-mono">{store.totalCount}</td>
            <td className="p-4 text-center font-mono text-brand-primary font-bold">{store.countInPeriod > 0 ? store.countInPeriod : '-'}</td>
            <td className="p-4 text-center"><MetaAdLibraryLink vendor={store.name} pageId={store.facebook_page_id} t={t} /></td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
};

const LanguagesReportTable: React.FC<{stats: LanguageStats[]; t: any; locale: Locale}> = ({stats, t, locale}) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<LanguageSortKey>('storeCount');
    const [sortDir, setSortDir] = useState<SortDirection>('desc');

    const sortedStats = useMemo(() => {
        return [...stats].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            const order = sortDir === 'asc' ? 1 : -1;
            if (typeof valA === 'string' && typeof valB === 'string') return valA.localeCompare(valB) * order;
            if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * order;
            return 0;
        });
    }, [stats, sortKey, sortDir]);

    const handleSort = (key: LanguageSortKey) => {
        if (key === sortKey) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const headers: { key: LanguageSortKey; label: string; isNumeric?: boolean }[] = [
      { key: 'name', label: t.languageName }, { key: 'storeCount', label: t.storesWithLanguage, isNumeric: true }
    ];

    return (
        <TableWrapper>
          <thead><tr className="bg-light-background dark:bg-dark-background">
            {headers.map(h => <SortableHeader key={h.key} id={h.key} label={h.label} isNumeric={h.isNumeric} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />)}
          </tr></thead>
          <tbody>
            {sortedStats.map((lang) => (
              <React.Fragment key={lang.name}>
                <tr onClick={() => setExpandedRow(expandedRow === lang.name ? null : lang.name)} className="border-t hover:bg-light-background-hover dark:hover:bg-dark-background-hover cursor-pointer">
                  <td className="p-4 font-medium flex items-center gap-3"><ChevronDown size={16} className={`transition-transform duration-200 ${expandedRow === lang.name ? 'rotate-180' : ''}`} />{getLanguageName(lang.name, locale)}<span className="text-xs text-gray-500 ml-1.5">({lang.name.toUpperCase()})</span></td>
                  <td className="p-4 text-center font-mono text-lg text-brand-primary font-bold">{lang.storeCount}</td>
                </tr>
                {expandedRow === lang.name && <tr><td colSpan={2} className="p-4 bg-light-background-hover dark:bg-dark-background-hover"><h4 className="font-semibold mb-2">{t.supportingStores}</h4><div className="flex flex-wrap gap-2">{Array.from(lang.vendors).sort().map(v => <span key={v} className="bg-gray-200 dark:bg-gray-700 text-sm font-mono px-2 py-1 rounded-md">{v}</span>)}</div></td></tr>}
              </React.Fragment>
            ))}
          </tbody>
        </TableWrapper>
    );
};


// --- UI Sub-components ---

const TableWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="overflow-x-auto"><table className="w-full text-left">{children}</table></div>
);

const SortableHeader = <T extends string>({ id, label, isNumeric, sortKey, sortDir, onSort }: { id: T; label: string; isNumeric?: boolean; sortKey: T; sortDir: SortDirection; onSort: (key: T) => void; }) => (
    <th className={`p-4 font-semibold cursor-pointer select-none group ${isNumeric ? 'text-center' : ''}`} onClick={() => onSort(id)}>
        <div className={`flex items-center gap-2 ${isNumeric ? 'justify-center' : ''}`}>
            {label}
            {sortKey === id ? (sortDir === 'desc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="rotate-180" />) : <ChevronsUpDown size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />}
        </div>
    </th>
);

const StatCard: React.FC<{title:string; value: number | string}> = ({title, value}) => (
    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow">
      <h3 className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">{title}</h3>
      <p className="text-4xl font-bold text-brand-primary mt-2">{value}</p>
    </div>
);

const TabButton: React.FC<{id: ActiveTab; icon: React.ReactNode; label: string; activeTab: ActiveTab; setActiveTab: (tab:ActiveTab)=>void}> = ({ id, icon, label, activeTab, setActiveTab }) => (
  <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === id ? 'bg-brand-primary text-white shadow' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-background-hover dark:hover:bg-dark-background-hover'}`}>
    {icon} {label}
  </button>
);

const TimeFilterSelector: React.FC<{value: number; onChange: (value: number) => void; t: any}> = ({ value, onChange, t }) => (
  <div className="relative"><select value={value} onChange={(e) => onChange(Number(e.target.value))} className="appearance-none cursor-pointer p-2.5 pl-4 pr-10 border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"><option value={7}>{t.last7days}</option><option value={30}>{t.last30days}</option><option value={90}>{t.last3months}</option><option value={180}>{t.last6months}</option><option value={365}>{t.lastYear}</option></select><Calendar className="w-5 h-5 absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 pointer-events-none" /></div>
);

const MetaAdLibraryLink: React.FC<{ vendor: string; pageId?: string; t: any}> = ({ vendor, pageId, t }) => {
    const url = (pageId && pageId !== '0')
        ? `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&view_all_page_id=${pageId}&search_type=page`
        : `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`;
    return <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800/50 dark:text-blue-300 dark:hover:bg-blue-800/80"><Search size={16} /></a>
};

export default ReportsPage;
