import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, Sparkles, Heart, LayoutDashboard, EyeOff, Camera } from 'lucide-react'; // Import Camera icon
import { Product } from './types';
import { loadProducts, LoadProductsResult } from './utils/productLoader';
import { filterProducts } from './utils/productUtils';
import { useFavoritesStore } from './stores/favoritesStore';
import { useLanguageStore } from './stores/languageStore';
import { useBlacklistStore } from './stores/blacklistStore';
import { translations } from './translations';

// --- Lazy Imports ---
const ProductView = React.lazy(() => import('./components/ProductView'));
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage'));
const DashboardPage = React.lazy(() => import('./components/DashboardPage'));
const BlacklistPage = React.lazy(() => import('./components/BlacklistPage'));
const InstagramFeedPage = React.lazy(() => import('./components/InstagramFeedPage')); // Lazy load Instagram page
const ScrollButtons = React.lazy(() => import('./components/ScrollButtons'));
const LanguageSwitcher = React.lazy(() => import('./components/LanguageSwitcher'));

// --- Type Definitions ---
type Page = 'home' | 'favorites' | 'dashboard' | 'blacklist' | 'instagram'; // Add 'instagram' page
type InitialFilter = { name?: string; store?: string; language?: string };

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
  </div>
);

const App: React.FC = () => {
  // --- State Hooks ---
  const [darkMode, setDarkMode] = useState(false);
  const { language } = useLanguageStore();
  const { favoriteUrls } = useFavoritesStore();
  const { keywords: blacklistedKeywords, blockedStores } = useBlacklistStore();
  
  const { data: productData, isLoading } = useQuery<LoadProductsResult>({
    queryKey: ['products'],
    queryFn: loadProducts,
    staleTime: 1000 * 60 * 5,
  });

  const uniqueProducts = productData?.uniqueProducts || [];
  const allProductsRaw = productData?.allProducts || [];
  const totalBeforeFilter = productData?.totalBeforeFilter || 0;
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [initialFilters, setInitialFilters] = useState<InitialFilter | null>(null);

  const t = translations[language];

  // --- Effects ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [darkMode, language]);

  // --- Memoized Data ---
  const filteredProducts = useMemo(() => {
    return filterProducts(uniqueProducts, blacklistedKeywords, blockedStores);
  }, [uniqueProducts, blacklistedKeywords, blockedStores]);

  const uniqueStores = useMemo(() => {
    return [...new Set(filteredProducts.map(p => p.vendor).filter(Boolean))];
  }, [filteredProducts]);

  const favoritesCount = favoriteUrls.size;

  // --- Handlers ---
  const navigateTo = (page: Page) => setCurrentPage(prev => (prev === page ? 'home' : page));
  
  const navigateToHomeWithFilter = useCallback((filter: InitialFilter) => {
    setInitialFilters(filter);
    setCurrentPage('home');
  }, []);

  const clearInitialFilters = useCallback(() => {
    setInitialFilters(null);
  }, []);
  
  const HeaderButton: React.FC<{ onClick: () => void; className?: string; tooltip: string; 'aria-label': string; children?: React.ReactNode; }> = 
    ({ onClick, className, tooltip, children, ...props }) => (
    <div className="relative group">
      <button onClick={onClick} className={`relative rounded-full transition-all duration-300 flex items-center gap-2 ${className}`} {...props}>{children}</button>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover/tooltip:scale-100">{tooltip}</div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'favorites': return <FavoritesPage allProducts={filteredProducts} onNavigateWithFilter={navigateToHomeWithFilter} />;
      case 'dashboard': return <DashboardPage products={filteredProducts} allProductsRaw={allProductsRaw} totalBeforeFilter={totalBeforeFilter} onNavigateWithFilter={navigateToHomeWithFilter} />;
      case 'blacklist': return <BlacklistPage />;
      case 'instagram': return <InstagramFeedPage />; // Render Instagram page
      default: return <ProductView products={filteredProducts} isLoading={isLoading} stores={uniqueStores} onClearInitialFilters={clearInitialFilters} initialFilters={initialFilters} onNavigateWithFilter={navigateToHomeWithFilter} />;
    }
  };

  const isFavoritesActive = currentPage === 'favorites';
  const isDashboardActive = currentPage === 'dashboard';
  const isBlacklistActive = currentPage === 'blacklist';
  const isInstagramActive = currentPage === 'instagram'; // Check for active instagram page

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3"><Sparkles className="w-8 h-8 text-yellow-500" /><h1 dir="ltr" className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent" onClick={() => setCurrentPage('home')} style={{cursor: 'pointer'}}>WONDER LAB</h1></div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Suspense fallback={<div className="w-24 h-10 rounded-full bg-gray-200 animate-pulse" />}>
              <LanguageSwitcher />
            </Suspense>
            <HeaderButton onClick={() => navigateTo('dashboard')} className={isDashboardActive ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.dashboard} aria-label="Dashboard"><LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${isDashboardActive ? 'rotate-6' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isDashboardActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.dashboard}</span></HeaderButton>
            <HeaderButton onClick={() => navigateTo('instagram')} className={isInstagramActive ? 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip="Instagram Feed" aria-label="Instagram Feed"><Camera className={`w-5 h-5 transition-transform duration-200 ${isInstagramActive ? 'rotate-6' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isInstagramActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Instagram</span></HeaderButton>
            <HeaderButton onClick={() => navigateTo('blacklist')} className={isBlacklistActive ? 'bg-gray-200 dark:bg-gray-700 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.blacklist} aria-label="Blacklist"><EyeOff className={`w-5 h-5 transition-transform duration-200 ${isBlacklistActive ? 'text-gray-800 dark:text-gray-200' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isBlacklistActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.blacklist}</span></HeaderButton>
            <HeaderButton onClick={() => navigateTo('favorites')} className={isFavoritesActive ? 'bg-red-100 dark:bg-red-900/50 text-red-500 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.favorites} aria-label="Favorites">
              <Heart className={`w-5 h-5 transition-all duration-200 ${isFavoritesActive ? 'fill-red-500 text-red-500 rotate-0' : 'text-current -rotate-12'}`} />
              <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isFavoritesActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.favorites}</span>
              {favoritesCount > 0 && 
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-[1rem] h-4 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold" style={{transform: 'translate(40%, -40%)'}}>
                  {favoritesCount}
                </span>
              }
            </HeaderButton>
            <HeaderButton onClick={() => setDarkMode(d => !d)} className="p-2 bg-light-surface dark:bg-dark-surface" tooltip={t.theme} aria-label="Toggle Dark Mode">{darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}</HeaderButton>
          </div>
        </header>
        <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>
      </div>
      <Suspense fallback={<></>}>
        <ScrollButtons />
      </Suspense>
    </div>
  );
};

export default App;
