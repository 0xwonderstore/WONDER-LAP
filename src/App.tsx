import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, Sparkles, Heart, EyeOff, LayoutDashboard } from 'lucide-react';
import { Product } from './types';
import { loadProducts } from './utils/productLoader';
import { useFavoritesStore } from './stores/favoritesStore';
import { useLanguageStore } from './stores/languageStore';
import { translations } from './translations';

// --- Lazy Imports ---
const ProductView = React.lazy(() => import('./components/ProductView'));
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage'));
const BlacklistPage = React.lazy(() => import('./components/BlacklistPage'));
const DashboardPage = React.lazy(() => import('./components/DashboardPage'));
const ScrollButtons = React.lazy(() => import('./components/ScrollButtons'));
const LanguageSwitcher = React.lazy(() => import('./components/LanguageSwitcher'));

// --- Type Definitions ---
type Page = 'home' | 'favorites' | 'blacklist' | 'dashboard';
type InitialFilter = { name?: string; store?: string; };

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
  </div>
);

const App: React.FC = () => {
  // --- State Hooks ---
  const [darkMode, setDarkMode] = useState(false);
  const { language } = useLanguageStore();
  const { favorites } = useFavoritesStore();
  
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: loadProducts,
    staleTime: 1000 * 60 * 5,
  });
  
  const [blacklist, setBlacklist] = useState<string[]>(['t-shirt', 'shorts', 'tshirt', 'rakhi']);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [initialFilters, setInitialFilters] = useState<InitialFilter | null>(null);

  const t = translations[language];

  // --- Effects ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [darkMode, language]);

  // --- Handlers ---
  const navigateTo = (page: Page) => setCurrentPage(prev => (prev === page ? 'home' : page));
  
  const navigateToHomeWithFilter = useCallback((filter: InitialFilter) => {
    setInitialFilters(filter);
    setCurrentPage('home');
  }, []);

  const clearInitialFilters = useCallback(() => {
    setInitialFilters(null);
  }, []);
  
  const addWordToBlacklist = useCallback((word: string) => {
    if (word && !blacklist.includes(word.toLowerCase())) {
      setBlacklist(prev => [...prev, word.toLowerCase()]);
    }
  }, [blacklist]);

  const removeWordFromBlacklist = useCallback((word: string) => {
    setBlacklist(prev => prev.filter(item => item !== word));
  }, []);
  
  const uniqueStores = useMemo(() => [...new Set(allProducts.map(p => p.vendor).filter(Boolean))], [allProducts]);

  const HeaderButton: React.FC<{ onClick: () => void; className?: string; tooltip: string; 'aria-label': string; children?: React.ReactNode; }> = 
    ({ onClick, className, tooltip, children, ...props }) => (
    <div className="relative group">
      <button onClick={onClick} className={`relative rounded-full transition-all duration-300 flex items-center gap-2 ${className}`} {...props}>{children}</button>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover/tooltip:scale-100">{tooltip}</div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'favorites': return <FavoritesPage allProducts={allProducts} onNavigateWithFilter={navigateToHomeWithFilter} />;
      case 'blacklist': return <BlacklistPage blacklist={blacklist} onAddWord={addWordToBlacklist} onRemoveWord={removeWordFromBlacklist} />;
      case 'dashboard': return <DashboardPage products={allProducts} onNavigateWithFilter={navigateToHomeWithFilter} />;
      default: return <ProductView products={allProducts} isLoading={isLoading} stores={uniqueStores} blacklist={blacklist} onClearInitialFilters={clearInitialFilters} initialFilters={initialFilters} onNavigateWithFilter={navigateToHomeWithFilter} />;
    }
  };

  const isFavoritesActive = currentPage === 'favorites';
  const isBlacklistActive = currentPage === 'blacklist';
  const isDashboardActive = currentPage === 'dashboard';
  const favoritesCount = favorites.my_main_favorites?.products?.length || 0;

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
            <HeaderButton onClick={() => navigateTo('blacklist')} className={isBlacklistActive ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.blacklist} aria-label="Blacklist"><EyeOff className={`w-5 h-5 transition-transform duration-200 ${isBlacklistActive ? 'rotate-6' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isBlacklistActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.blacklist}</span></HeaderButton>
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
