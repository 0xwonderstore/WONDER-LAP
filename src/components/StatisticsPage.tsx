import React, { useMemo, useState } from 'react';
import { Product, Locale } from '../types';
import { formatDate } from '../utils/productUtils';
import { ArrowUpDown, Library } from 'lucide-react';

const translations = {
  ar: {
    statistics: 'الإحصائيات',
    storeStatistics: 'إحصائيات المتاجر',
    languageStatistics: 'إحصائيات اللغات',
    store: 'المتجر',
    productCount: 'عدد المنتجات',
    firstProductDate: 'أول منتج',
    lastProductDate: 'آخر منتج',
    language: 'اللغة',
    adLibrary: 'مكتبة الإعلانات',
  },
  en: {
    statistics: 'Statistics',
    storeStatistics: 'Store Statistics',
    languageStatistics: 'Language Statistics',
    store: 'Store',
    productCount: 'Product Count',
    firstProductDate: 'First Product',
    lastProductDate: 'Last Product',
    language: 'Language',
    adLibrary: 'Ad Library',
  }
};

const languageNames: { [key: string]: string } = {
  ar: 'العربية', en: 'English', es: 'Español', fr: 'Français', 
  de: 'Deutsch', ja: '日本語', ru: 'Русский',
};
const getLanguageName = (code: string) => languageNames[code] || code;

type SortKey = 'name' | 'productCount' | 'firstProductDate' | 'lastProductDate';
type SortDirection = 'asc' | 'desc';
type ActiveTab = 'stores' | 'languages';

interface StatisticsPageProps {
  allProducts: Product[];
  locale: Locale;
  onNavigateWithFilter: (filter: { store?: string; language?: string }) => void;
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({ allProducts, locale, onNavigateWithFilter }) => {
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<ActiveTab>('stores');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'productCount', direction: 'desc' });

  const { languages, stores } = useMemo(() => {
    const storeData: { [key: string]: { products: Product[] } } = {};
    const languageCounts: { [key: string]: number } = {};

    for (const product of allProducts) {
      languageCounts[product.language || 'unknown'] = (languageCounts[product.language || 'unknown'] || 0) + 1;
      if (product.store?.name) {
        if (!storeData[product.store.name]) storeData[product.store.name] = { products: [] };
        storeData[product.store.name].products.push(product);
      }
    }

    const processedStores = Object.entries(storeData).map(([name, data]) => {
      const dates = data.products.map(p => new Date(p.created_at).getTime()).filter(d => !isNaN(d));
      return {
        name,
        productCount: data.products.length,
        firstProductDate: dates.length ? new Date(Math.min(...dates)) : null,
        lastProductDate: dates.length ? new Date(Math.max(...dates)) : null,
      };
    });

    const processedLanguages = Object.entries(languageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
        
    return { languages: processedLanguages, stores: processedStores };
  }, [allProducts]);

  const sortedStores = useMemo(() => {
    let sortableItems = [...stores];
    sortableItems.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA === null || valB === null) return 0;
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [stores, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey, children }) => (
    <th className="p-4 text-start rtl:text-right font-semibold cursor-pointer whitespace-nowrap" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className={`w-4 h-4 text-gray-400 transition-colors ${sortConfig.key === sortKey ? 'text-brand-primary' : ''}`} />
      </div>
    </th>
  );
  
  const TabButton: React.FC<{ tabName: ActiveTab, children: React.ReactNode }> = ({ tabName, children }) => (
    <button onClick={() => setActiveTab(tabName)} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${activeTab === tabName ? 'border-brand-primary text-brand-primary' : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:border-brand-primary/50 hover:text-brand-primary/80'}`}>
      {children}
    </button>
  );
  
  const getAdLibraryUrl = (storeName: string) => {
    const query = encodeURIComponent(storeName);
    return `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${query}&search_type=keyword_unordered&media_type=all`;
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold mb-4">{t.statistics}</h2>
      
      <div className="border-b border-light-border dark:border-dark-border mb-6">
        <TabButton tabName="stores">{t.storeStatistics}</TabButton>
        <TabButton tabName="languages">{t.languageStatistics}</TabButton>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md overflow-x-auto">
        {activeTab === 'stores' ? (
          <table className="w-full text-sm">
            <thead className="bg-light-background dark:bg-dark-background/50">
              <tr>
                <SortableHeader sortKey="name">{t.store}</SortableHeader>
                <SortableHeader sortKey="productCount">{t.productCount}</SortableHeader>
                <SortableHeader sortKey="firstProductDate">{t.firstProductDate}</SortableHeader>
                <SortableHeader sortKey="lastProductDate">{t.lastProductDate}</SortableHeader>
                <th className="p-4 text-center font-semibold">{t.adLibrary}</th>
              </tr>
            </thead>
            <tbody>
              {sortedStores.map((store) => (
                <tr key={store.name} className="border-t border-light-border dark:border-dark-border">
                  <td className="p-4 font-medium">
                    <span 
                      className="font-bold text-brand-primary cursor-pointer hover:underline" 
                      onClick={() => onNavigateWithFilter({ store: store.name })}
                    >
                      {store.name}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-center">{store.productCount}</td>
                  <td className="p-4 whitespace-nowrap">{store.firstProductDate ? formatDate(store.firstProductDate) : 'N/A'}</td>
                  <td className="p-4 whitespace-nowrap">{store.lastProductDate ? formatDate(store.lastProductDate) : 'N/A'}</td>
                  <td className="p-4 text-center">
                    <a href={getAdLibraryUrl(store.name)} target="_blank" rel="noopener noreferrer" className="inline-block p-2 rounded-xl hover:bg-light-background dark:hover:bg-dark-background transition-colors">
                      <Library className="w-5 h-5 text-brand-primary" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-light-background dark:bg-dark-background/50">
              <tr>
                <th className="p-4 text-start rtl:text-right font-semibold">{t.language}</th>
                <th className="p-4 text-end rtl:text-left font-semibold">{t.productCount}</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <tr key={lang.name} className="border-t border-light-border dark:border-dark-border">
                  <td className="p-4 font-medium"><span className="cursor-pointer hover:text-brand-primary" onClick={() => onNavigateWithFilter({ language: lang.name })}>{getLanguageName(lang.name)}</span></td>
                  <td className="p-4 text-end rtl:text-left font-mono">{lang.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
