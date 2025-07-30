import React, { useState, useMemo } from 'react';
import { Product, Locale } from '../types';
import { ExternalLink, Calendar, Package, Search, Store, Languages as LanguagesIcon, ChevronDown, ChevronsUpDown, BarChart, Zap, PowerOff, TrendingUp, AlertTriangle, Tag } from 'lucide-react';
import { getLanguageName } from '../utils/languageUtils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip } from 'recharts';
import { translations } from '../translations';

// --- Types ---
type SortDirection = 'asc' | 'desc';
type StoreSortKey = 'name' | 'totalCount' | 'countInPeriod';
type LanguageSortKey = 'name' | 'storeCount';

interface StoreStats { name: string; totalCount: number; countInPeriod: number; lastActivity: Date; facebook_page_id?: string; }
interface LanguageStats { name: string; storeCount: number; vendors: Set<string>; }
interface ReportsPageProps { products: Product[]; locale: Locale; onNavigateWithFilter: (filter: { name: string }) => void; }
type ActiveTab = 'stores' | 'languages' | 'insights';

// --- Helper Functions ---
const getDateDaysAgo = (days: number) => { const d = new Date(); d.setDate(d.getDate() - days); return d; };
const commonStopWords = new Set(['و', 'في', 'من', 'إلى', 'على', 'عن', 'هو', 'هي', 'مع', 'أو', 'the', 'a', 'an', 'in', 'on', 'for', 'with', 'and', 'or', 'is', 'are', 'to']);

// --- Main Component ---
const ReportsPage: React.FC<ReportsPageProps> = ({ products, locale, onNavigateWithFilter }) => {
  const [timeFilter, setTimeFilter] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<ActiveTab>('insights');
  const t = translations[locale];

  const { storeStats, languageStats, totalActiveStores, keywordAnalysis, storeHealthAnalysis } = useMemo(() => {
    const storeMap = new Map<string, Omit<StoreStats, 'name'>>();
    const langMap = new Map<string, Omit<LanguageStats, 'name'>>();
    const vendors = new Set<string>();
    const keywordCounts = new Map<string, number>();

    for (const product of products) { if (product.vendor) vendors.add(product.vendor); }
    vendors.forEach(vendor => storeMap.set(vendor, { totalCount: 0, countInPeriod: 0, lastActivity: new Date(0) }));

    const filterDate = getDateDaysAgo(timeFilter);

    for (const product of products) {
        const { vendor, language, created_at, store, name } = product;
        if (!vendor) continue;

        const storeData = storeMap.get(vendor)!;
        storeData.totalCount++;
        const createdAtDate = new Date(created_at);
        if (createdAtDate > storeData.lastActivity) storeData.lastActivity = createdAtDate;
        if (createdAtDate >= filterDate) storeData.countInPeriod++;
        if (store?.facebook_page_id) storeData.facebook_page_id = store.facebook_page_id;

        if (language) {
            if (!langMap.has(language)) langMap.set(language, { storeCount: 0, vendors: new Set() });
            langMap.get(language)!.vendors.add(vendor);
        }

        name.toLowerCase().split(/[\s,،-]+/).forEach(word => {
            if (word && word.length > 3 && !commonStopWords.has(word) && !/\d/.test(word)) {
                keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
            }
        });
    }
    langMap.forEach(lang => lang.storeCount = lang.vendors.size);

    const finalStoreStats = Array.from(storeMap.entries()).map(([name, data]) => ({ name, ...data }));
    
    const now = new Date();
    const healthReport = { active: [], slowing: [], stale: [] };
    finalStoreStats.forEach(store => {
        const daysSinceLastActivity = (now.getTime() - store.lastActivity.getTime()) / (1000 * 3600 * 24);
        if (daysSinceLastActivity <= 30) healthReport.active.push(store);
        else if (daysSinceLastActivity <= 90) healthReport.slowing.push(store);
        else healthReport.stale.push(store);
    });

    return {
        storeStats: finalStoreStats,
        languageStats: Array.from(langMap.entries()).map(([name, data]) => ({ name, ...data })),
        totalActiveStores: vendors.size,
        keywordAnalysis: Array.from(keywordCounts.entries()).map(([text, value]) => ({ text, value })).sort((a, b) => b.value - a.value).slice(0, 50),
        storeHealthAnalysis: healthReport,
    };
  }, [products, timeFilter]);

  return (
    <div className="animate-fade-in-up space-y-8">
      <h1 className="text-3xl font-bold">{t.reports}</h1>
      <StatCard title={t.totalActiveStores} value={totalActiveStores} />
      <div className="bg-light-surface dark:bg-dark-surface p-2 rounded-xl shadow-inner flex flex-wrap gap-2">
        <TabButton id="stores" icon={<Store size={18}/>} label={t.stores} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="languages" icon={<LanguagesIcon size={18}/>} label={t.languages} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="insights" icon={<BarChart size={18}/>} label={t.insights} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab !== 'insights' ? (
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow overflow-hidden">
            <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-light-border dark:border-dark-border">
              <h2 className="text-xl font-bold">{activeTab === 'stores' ? t.storeActivity : t.languageActivity}</h2>
              {activeTab === 'stores' && <TimeFilterSelector value={timeFilter} onChange={setTimeFilter} t={t} />}
            </div>
            {activeTab === 'stores' ? <StoresReportTable stats={storeStats} t={t} /> : <LanguagesReportTable stats={languageStats} t={t} locale={locale} />}
        </div>
      ) : (
        <InsightsReport keywords={keywordAnalysis} health={storeHealthAnalysis} t={t} locale={locale} onNavigateWithFilter={onNavigateWithFilter} />
      )}
    </div>
  );
};


// --- Insights Tab Components ---
const KeywordTags: React.FC<{data: {text: string, value: number}[]; t: any; onNavigate: (filter: {name: string}) => void}> = ({ data, t, onNavigate }) => {
    return (
        <div className="flex flex-wrap gap-3">
            {data.map(({ text, value }) => (
                <button 
                    key={text} 
                    onClick={() => onNavigate({ name: text })}
                    className="group flex items-center gap-2 bg-light-background-hover dark:bg-dark-background-hover px-3 py-1.5 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                    title={`${t.searchFor} "${text}"`}
                >
                    <Tag size={14} className="text-gray-500 group-hover:text-white" />
                    <span className="font-semibold">{text}</span>
                    <span className="text-sm bg-gray-300 dark:bg-gray-600 group-hover:bg-white/20 text-gray-700 dark:text-gray-200 group-hover:text-white px-2 rounded-full">{value}</span>
                </button>
            ))}
        </div>
    );
};

const InsightsReport: React.FC<{keywords: {text: string, value: number}[], health: {active: StoreStats[], slowing: StoreStats[], stale: StoreStats[]}, t: any, locale: Locale, onNavigateWithFilter: (filter: { name: string }) => void;}> = ({keywords, health, t, locale, onNavigateWithFilter}) => {
    const healthData = [
        { name: t.healthActive, value: health.active.length, color: '#22c55e' },
        { name: t.healthSlowing, value: health.slowing.length, color: '#f59e0b' },
        { name: t.healthStale, value: health.stale.length, color: '#ef4444' },
    ];
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-light-surface dark:bg-dark-surface rounded-2xl shadow p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-brand-primary"/>{t.topKeywords}</h3>
                <KeywordTags data={keywords} t={t} onNavigate={onNavigateWithFilter} />
            </div>
            <div className="lg:col-span-2 bg-light-surface dark:bg-dark-surface rounded-2xl shadow p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap size={20} className="text-brand-primary"/>{t.storeHealth}</h3>
                <div style={{ width: '100%', height: 150 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={healthData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                                {healthData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <ChartTooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface-strong)', border: '1px solid var(--color-border)' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                    <HealthCategory title={t.healthActive} stores={health.active} icon={<Zap size={16} className="text-green-500" />} locale={locale} />
                    <HealthCategory title={t.healthSlowing} stores={health.slowing} icon={<AlertTriangle size={16} className="text-yellow-500" />} locale={locale} />
                    <HealthCategory title={t.healthStale} stores={health.stale} icon={<PowerOff size={16} className="text-red-500" />} locale={locale} />
                </div>
            </div>
        </div>
    );
}

const HealthCategory: React.FC<{title:string, stores:StoreStats[], icon:React.ReactNode, locale: Locale}> = ({title, stores, icon, locale}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center text-lg font-semibold p-2 rounded-md hover:bg-light-background-hover dark:hover:bg-dark-background-hover">
                <div className="flex items-center gap-2">{icon} {title}</div>
                <div className="flex items-center gap-2"><span className="text-base font-bold" style={{color: stores.length > 0 ? 'var(--color-brand-primary)' : 'inherit'}}>{stores.length}</span><ChevronDown size={20} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} /></div>
            </button>
            {isExpanded && (
                <div className="mt-2 space-y-1 pl-4 max-h-40 overflow-auto pr-2">
                    {stores.sort((a,b) => b.lastActivity.getTime() - a.lastActivity.getTime()).map(store => (
                        <div key={store.name} className="text-sm flex justify-between">
                            <span>{store.name}</span>
                            <span className="text-gray-500">{store.lastActivity.toLocaleDateString(locale, {day: '2-digit', month:'short'})}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- The rest of the components remain the same ---
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
const StatCard: React.FC<{title:string; value: number | string}> = ({title, value}) => ( <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow"> <h3 className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">{title}</h3> <p className="text-4xl font-bold text-brand-primary mt-2">{value}</p> </div> );
const TabButton: React.FC<{id: ActiveTab; icon: React.ReactNode; label: string; activeTab: ActiveTab; setActiveTab: (tab:ActiveTab)=>void}> = ({ id, icon, label, activeTab, setActiveTab }) => ( <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === id ? 'bg-brand-primary text-white shadow' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-background-hover dark:hover:bg-dark-background-hover'}`}> {icon} {label} </button> );
const TimeFilterSelector: React.FC<{value: number; onChange: (value: number) => void; t: any}> = ({ value, onChange, t }) => ( <div className="relative"><select value={value} onChange={(e) => onChange(Number(e.target.value))} className="appearance-none cursor-pointer p-2.5 pl-4 pr-10 border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"><option value={7}>{t.last7days}</option><option value={30}>{t.last30days}</option><option value={90}>{t.last3months}</option><option value={180}>{t.last6months}</option><option value={365}>{t.lastYear}</option></select><Calendar className="w-5 h-5 absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 pointer-events-none" /></div> );
const MetaAdLibraryLink: React.FC<{ vendor: string; pageId?: string; t: any}> = ({ vendor, pageId, t }) => { const url = (pageId && pageId !== '0') ? `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&view_all_page_id=${pageId}&search_type=page` : `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`; return <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800/50 dark:text-blue-300 dark:hover:bg-blue-800/80"><Search size={16} /></a> };

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
export default ReportsPage;
