import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Moon, Sun, Sparkles, Languages, Heart, BarChart2, EyeOff } from 'lucide-react';
import { Product, Locale, FavoritesData } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { loadProducts } from './utils/productLoader';

// --- Lazy Imports ---
const ProductView = React.lazy(() => import('./components/ProductView'));
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage'));
const StatisticsPage = React.lazy(() => import('./components/StatisticsPage'));
const BlacklistPage = React.lazy(() => import('./components/BlacklistPage'));
const ScrollButtons = React.lazy(() => import('./components/ScrollButtons'));
const Toast = React.lazy(() => import('./components/Toast'));

// --- Type Definitions ---
type ToastState = { message: string; type: 'added' | 'removed'; } | null;
type Page = 'home' | 'favorites' | 'statistics' | 'blacklist';
type InitialFilter = { store?: string; language?: string };

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
  </div>
);

// --- Migration function for old favorites format ---
const migrateFavorites = (data: any): FavoritesData => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      my_main_favorites: {
        name: 'My Favorites',
        products: Array.isArray(data) ? data : [],
      },
    };
  }
  return data as FavoritesData;
};

const App: React.FC = () => {
  // --- State Hooks ---
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [locale, setLocale] = useLocalStorage<Locale>('locale', 'ar');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [favoritesData, setFavoritesData] = useLocalStorage<FavoritesData>('favoritesData', {}, migrateFavorites);
  
  const [blacklist, setBlacklist] = useLocalStorage<string[]>('blacklist', ['t-shirt', 'shorts', 'tshirt']);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [toast, setToast] = useState<ToastState>(null);
  const [initialFilters, setInitialFilters] = useState<InitialFilter | null>(null);

  const t = {
    ar: { stats: 'الإحصائيات', favorites: 'المفضلة', language: 'تغيير اللغة', theme: 'تغيير المظهر', blacklist: 'القائمة السوداء' },
    en: { stats: 'Statistics', favorites: 'Favorites', language: 'Change Language', theme: 'Change Theme', blacklist: 'Blacklist' }
  }[locale];

  // --- Effects ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [darkMode, locale]);

  useEffect(() => {
    const loadData = async () => { setIsLoading(true); const data = await loadProducts(); setAllProducts(data); setIsLoading(false); };
    loadData();
  }, []);

  // --- Handlers ---
  const showToast = (message: string, type: 'added' | 'removed') => { setToast({ message, type }); };
  
  const toggleFavorite = (productUrl: string) => {
    setFavoritesData(prev => {
      const mainList = prev.my_main_favorites || { name: 'My Favorites', products: [] };
      const isFavorite = mainList.products.includes(productUrl);
      
      const newProducts = isFavorite
        ? mainList.products.filter(url => url !== productUrl)
        : [...mainList.products, productUrl];

      showToast(isFavorite ? (locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites') : (locale === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to favorites'), isFavorite ? 'removed' : 'added');
      
      return { ...prev, my_main_favorites: { ...mainList, products: newProducts }};
    });
  };

  const favoritesManagement = {
    addList: (id: string, name: string, products: string[] = []) => {
      setFavoritesData(prev => ({ ...prev, [id]: { name, products } }));
    },
    removeList: (listId: string) => {
      if (listId === 'my_main_favorites') return; // Cannot delete main list
      setFavoritesData(prev => {
        const newData = { ...prev };
        delete newData[listId];
        return newData;
      });
    },
    renameList: (listId: string, newName: string) => {
      setFavoritesData(prev => ({ ...prev, [listId]: { ...prev[listId], name: newName } }));
    },
  };

  const toggleLocale = () => setLocale(prev => (prev === 'ar' ? 'en' : 'ar'));
  const navigateTo = (page: Page) => setCurrentPage(prev => (prev === page ? 'home' : page));
  const navigateToHomeWithFilter = (filter: InitialFilter) => { setInitialFilters(filter); setCurrentPage('home'); };
  const clearInitialFilters = () => setInitialFilters(null);

  const addWordToBlacklist = (word: string) => { if (word && !blacklist.includes(word.toLowerCase())) { setBlacklist(prev => [...prev, word.toLowerCase()]); } };
  const removeWordFromBlacklist = (word: string) => { setBlacklist(prev => prev.filter(item => item !== word)); };
  
  const uniqueStores = useMemo(() => [...new Set(allProducts.map(p => p.store?.name).filter(Boolean))], [allProducts]);
  const uniqueLanguages = useMemo(() => [...new Set(allProducts.map(p => p.language).filter(Boolean))], [allProducts]);

  const HeaderButton: React.FC<{ onClick: () => void; className?: string; tooltip: string; 'aria-label': string; children?: React.ReactNode; }> = 
    ({ onClick, className, tooltip, children, ...props }) => (
    <div className="relative group">
      <button onClick={onClick} className={`relative rounded-full transition-all duration-300 flex items-center gap-2 ${className}`} {...props}>{children}</button>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover:scale-100">{tooltip}</div>
    </div>
  );

  const renderContent = () => {
    const pageKey = `${currentPage}-${initialFilters ? JSON.stringify(initialFilters) : ''}`;
    switch (currentPage) {
      case 'favorites': return <FavoritesPage key={pageKey} allProducts={allProducts} favoritesData={favoritesData} onToggleFavorite={toggleFavorite} onManageLists={favoritesManagement} locale={locale} />;
      case 'statistics': return <StatisticsPage key={pageKey} allProducts={allProducts} locale={locale} onNavigateWithFilter={navigateToHomeWithFilter} />;
      case 'blacklist': return <BlacklistPage key={pageKey} locale={locale} blacklist={blacklist} onAddWord={addWordToBlacklist} onRemoveWord={removeWordFromBlacklist} />;
      default: return <ProductView key={pageKey} products={allProducts} isLoading={isLoading} stores={uniqueStores} languages={uniqueLanguages} locale={locale} favorites={favoritesData.my_main_favorites?.products || []} blacklist={blacklist} onToggleFavorite={toggleFavorite} onClearInitialFilters={clearInitialFilters} />;
    }
  };

  const isStatsActive = currentPage === 'statistics';
  const isFavoritesActive = currentPage === 'favorites';
  const isBlacklistActive = currentPage === 'blacklist';
  const favoritesCount = favoritesData.my_main_favorites?.products?.length || 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3"><Sparkles className="w-8 h-8 text-yellow-500" /><h1 dir="ltr" className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent" onClick={() => setCurrentPage('home')} style={{cursor: 'pointer'}}>WONDER LAB</h1></div>
          <div className="flex items-center gap-2 sm:gap-4">
            <HeaderButton onClick={() => navigateTo('blacklist')} className={isBlacklistActive ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.blacklist} aria-label="Blacklist"><EyeOff className={`w-5 h-5 transition-transform duration-200 ${isBlacklistActive ? 'rotate-6' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isBlacklistActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.blacklist}</span></HeaderButton>
            <HeaderButton onClick={() => navigateTo('statistics')} className={isStatsActive ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-500 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.stats} aria-label="Statistics"><BarChart2 className={`w-5 h-5 transition-transform duration-200 ${isStatsActive ? 'rotate-6' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isStatsActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.stats}</span></HeaderButton>
            <HeaderButton onClick={() => navigateTo('favorites')} className={isFavoritesActive ? 'bg-red-100 dark:bg-red-900/50 text-red-500 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.favorites} aria-label="Favorites">
              <Heart className={`w-5 h-5 transition-all duration-200 ${isFavoritesActive ? 'fill-red-500 text-red-500 rotate-0' : 'text-current -rotate-12'}`} />
              <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isFavoritesActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.favorites}</span>
              {favoritesCount > 0 && !isFavoritesActive && 
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-[1rem] h-4 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold" style={{transform: 'translate(40%, -40%)'}}>
                  {favoritesCount}
                </span>
              }
            </HeaderButton>
            <HeaderButton onClick={toggleLocale} className="p-2 bg-light-surface dark:bg-dark-surface" tooltip={t.language} aria-label="Toggle Language"><Languages className="w-5 h-5" /></HeaderButton>
            <HeaderButton onClick={() => setDarkMode(d => !d)} className="p-2 bg-light-surface dark:bg-dark-surface" tooltip={t.theme} aria-label="Toggle Dark Mode">{darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}</HeaderButton>
          </div>
        </header>
        <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>
      </div>
      <Suspense fallback={<></>}>
        <ScrollButtons />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </Suspense>
    </div>
  );
};

export default App;
