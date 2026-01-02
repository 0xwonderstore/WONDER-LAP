import React, { useMemo, Suspense, useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, Sparkles, Heart, LayoutDashboard, EyeOff, Instagram, Video } from 'lucide-react';
import { loadProducts, LoadProductsResult } from './utils/productLoader';
import { filterProducts, searchProducts } from './utils/productUtils';
import { useFavoritesStore } from './stores/favoritesStore';
import { useLanguageStore } from './stores/languageStore';
import { useBlacklistStore } from './stores/blacklistStore';
import { useToastStore } from './stores/toastStore';
import { translations } from './translations';
import { useLocalStorage } from './hooks/useLocalStorage';
import ProductCard from './components/ProductCard';
import ProductTable from './components/ProductTable';
import Pagination from './components/Pagination';
import { EmptyState }from './components/EmptyState';
import FilterComponent from './components/FilterComponent';
import Toast from './components/Toast';
import { DateRange } from 'react-day-picker';
import ProductCardSkeleton from './components/ProductCardSkeleton';
import { Product } from './types';

// --- Lazy Imports ---
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage'));
const DashboardPage = React.lazy(() => import('./components/DashboardPage'));
const BlacklistPage = React.lazy(() => import('./components/BlacklistPage'));
const InstagramPage = React.lazy(() => import('./components/InstagramPage'));
const TikTokPage = React.lazy(() => import('./components/TikTokPage'));
const ScrollButtons = React.lazy(() => import('./components/ScrollButtons'));
const LanguageSwitcher = React.lazy(() => import('./components/LanguageSwitcher'));

// --- Type Definitions ---
type Page = 'home' | 'favorites' | 'dashboard' | 'blacklist' | 'instagram' | 'tiktok';
type InitialFilter = { name?: string; store?: string | string[]; language?: string | string[] };

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
  </div>
);

const App: React.FC = () => {
  // --- State Hooks ---
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const { language } = useLanguageStore();
  const { favoriteUrls } = useFavoritesStore();
  const { keywords: blacklistedKeywords, blockedStores } = useBlacklistStore();
  const { message, type, hideToast } = useToastStore(); // Toast state
  const [currentPage, setCurrentPage] = useLocalStorage<Page>('currentPage', 'home');
  const [initialFilters, setInitialFilters] = useLocalStorage<InitialFilter | null>('initialFilters', null);
  
  // Data loading
  const { data: productData, isLoading } = useQuery<LoadProductsResult>({
    queryKey: ['products'],
    queryFn: loadProducts,
    staleTime: Infinity, // Never stale to prevent reloading
    gcTime: Infinity, // Keep in cache as long as possible
  });

  const uniqueProducts: Product[] = useMemo(() => productData?.uniqueProducts || [], [productData]);
  const allProductsRaw: Product[] = useMemo(() => productData?.allProducts || [], [productData]);
  const totalBeforeFilter = productData?.totalBeforeFilter || 0;

  const t = translations[language];

  // --- Effects ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [darkMode, language]);


  // --- Filter State ---
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>('viewMode', 'grid');
  const [productsPage, setProductsPage] = useLocalStorage('productsPage', 1);
  const [productsPerPage, setProductsPerPage] = useLocalStorage('productsPerPage', 24);
  const [filters, setFilters] = useState<{
    name: string;
    store: string[];
    language: string[];
  }>({
    name: '',
    store: [],
    language: [],
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Apply initial filters
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        name: initialFilters.name || '',
        store: Array.isArray(initialFilters.store) ? initialFilters.store : (initialFilters.store ? [initialFilters.store] : []),
        language: Array.isArray(initialFilters.language) ? initialFilters.language : (initialFilters.language ? [initialFilters.language] : []),
      });
      setProductsPage(1);
      setInitialFilters(null); // Clear after applying
    }
  }, [initialFilters, setInitialFilters, setProductsPage]);

  // --- Memoized Data for Filters ---
  const uniqueStores = useMemo(() => {
    return [...new Set(uniqueProducts.map(p => p.vendor).filter(Boolean))];
  }, [uniqueProducts]);

  const availableLanguages = useMemo(() => {
    return [...new Set(uniqueProducts.map(p => p.language).filter(Boolean))];
  }, [uniqueProducts]);

  const languageCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    uniqueProducts.forEach(p => {
      if (p.language) {
        counts[p.language] = (counts[p.language] || 0) + 1;
      }
    });
    return counts;
  }, [uniqueProducts]);


  // --- Filtering Logic ---
  const filteredProducts = useMemo(() => {
    let products = uniqueProducts;

    // 1. Blacklist
    products = filterProducts(products, blacklistedKeywords, blockedStores);

    // 2. User Filters
    if (filters.name) {
        products = searchProducts(products, filters.name);
    }
    if (filters.store.length > 0) {
        products = products.filter(p => filters.store.includes(p.vendor));
    }
    if (filters.language.length > 0) {
        products = products.filter(p => filters.language.includes(p.language));
    }
    if (dateRange?.from) {
        products = products.filter(p => new Date(p.created_at) >= dateRange.from!);
    }
    if (dateRange?.to) {
        products = products.filter(p => new Date(p.created_at) <= dateRange.to!);
    }
    
    // Default sorting: Newest first
    return products.sort((a, b) => {
         if (!a.created_at || !b.created_at) return 0;
         return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [uniqueProducts, blacklistedKeywords, blockedStores, filters, dateRange]);


  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((productsPage - 1) * productsPerPage, productsPage * productsPerPage);


  // --- Handlers ---
  const navigateTo = (page: Page) => setCurrentPage(prev => (prev === page ? 'home' : page));
  
  const navigateToHomeWithFilter = useCallback((filter: InitialFilter) => {
    setInitialFilters(filter);
    setCurrentPage('home');
  }, [setInitialFilters, setCurrentPage]);

  const handleFilterChange = (key: string, value: string | string[]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setProductsPage(1);
  };
  
  const handleResetFilters = () => {
      setFilters({ name: '', store: [], language: [] });
      setDateRange(undefined);
      setProductsPage(1);
  };


  const HeaderButton: React.FC<{ onClick: () => void; className?: string; tooltip: string; 'aria-label': string; children?: React.ReactNode; count?: number }> = 
    ({ onClick, className, tooltip, children, count, ...props }) => (
    <div className="relative group">
      <button onClick={onClick} className={`relative glow-effect rounded-full transition-all duration-300 flex items-center gap-2 ${className}`} {...props}>{children}</button>
      {count !== undefined && count > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center min-w-[1rem] h-4 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold pointer-events-none z-10 shadow-sm" style={{transform: 'translate(30%, -30%)'}}>
          {count}
        </span>
      )}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover/tooltip:scale-100">{tooltip}</div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'favorites': return <FavoritesPage allProducts={filteredProducts} onNavigateWithFilter={navigateToHomeWithFilter} />;
      case 'dashboard': return <DashboardPage products={filteredProducts} allProductsRaw={allProductsRaw} totalBeforeFilter={totalBeforeFilter} onNavigateWithFilter={navigateToHomeWithFilter} isLoading={isLoading} />;
      case 'blacklist': return <BlacklistPage />;
      case 'instagram': return <InstagramPage />;
      case 'tiktok': return <TikTokPage />;
      default: 
        return (
            <div className="animate-fade-in-up relative z-10">
                 {/* Re-integrated Filter Component */}
                 <FilterComponent 
                    t={t}
                    stores={uniqueStores}
                    languages={availableLanguages}
                    languageCounts={languageCounts}
                    filters={filters}
                    date={dateRange}
                    setDate={setDateRange}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    productsPerPage={productsPerPage}
                    onProductsPerPageChange={setProductsPerPage}
                 />

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : currentProducts.length > 0 ? (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {currentProducts.map(p => (
                                    <div key={p.url} className="animate-fade-in-up" style={{ animationDelay: `${Math.random() * 0.3}s`, animationFillMode: 'both' }}>
                                        <ProductCard product={p} t={t} onNavigateWithFilter={navigateToHomeWithFilter} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <ProductTable products={currentProducts} t={t} onNavigateWithFilter={navigateToHomeWithFilter} />
                        )}
                        <Pagination 
                            currentPage={productsPage} 
                            totalPages={totalPages} 
                            onPageChange={setProductsPage}
                            totalItems={filteredProducts.length}
                            itemsPerPage={productsPerPage}
                        />
                    </>
                ) : (
                    <EmptyState title={t.noResults} hint={t.noResultsHint} />
                )}
            </div>
        );
    }
  };

  const isFavoritesActive = currentPage === 'favorites';
  const isDashboardActive = currentPage === 'dashboard';
  const isBlacklistActive = currentPage === 'blacklist';
  const isInstagramActive = currentPage === 'instagram';
  const isTikTokActive = currentPage === 'tiktok';

  const favoritesCount = favoriteUrls.size;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Toast Notification */}
      {message && type && <Toast message={message} type={type} onClose={hideToast} />}

      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-300/30 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-300/30 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
         {/* Grid Pattern Overlay */}
         <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>

      <div className="container mx-auto py-8 px-4 relative z-10 flex-grow">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 relative group cursor-pointer" onClick={() => setCurrentPage('home')}>
             {/* Animated Sparkles */}
             <div className="absolute -left-4 -top-2 animate-pulse">
                <Sparkles className="w-6 h-6 text-yellow-400 opacity-80" />
             </div>
             <div className="absolute left-10 bottom-0 animate-ping">
                <Sparkles className="w-3 h-3 text-pink-400 opacity-50" />
             </div>
             
             {/* Logo Text with Gradient Animation */}
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-brand-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto]" dir="ltr">
                WONDER LAB
             </h1>
             
             {/* Underline effect */}
             <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-brand-primary to-pink-500 transition-all duration-300 group-hover:w-full rounded-full"></div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Suspense fallback={<div className="w-24 h-10 rounded-full bg-gray-200 animate-pulse" />}>
              <LanguageSwitcher />
            </Suspense>
            <HeaderButton onClick={() => navigateTo('dashboard')} className={isDashboardActive ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.dashboard} aria-label="Dashboard"><LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${isDashboardActive ? 'rotate-6' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isDashboardActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.dashboard}</span></HeaderButton>
            <HeaderButton onClick={() => navigateTo('instagram')} className={isInstagramActive ? 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.instagram_feature} aria-label="Instagram"><Instagram className={`w-5 h-5 transition-transform duration-200 ${isInstagramActive ? 'rotate-6' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isInstagramActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.instagram_feature}</span></HeaderButton>
            
            {/* TikTok Button with Logo */}
            <HeaderButton onClick={() => navigateTo('tiktok')} className={isTikTokActive ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.tiktok_feature} aria-label="TikTok">
               <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-transform duration-200 ${isTikTokActive ? 'rotate-6' : ''}`}>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
               </svg>
               <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isTikTokActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.tiktok_feature}</span>
            </HeaderButton>

            <HeaderButton onClick={() => navigateTo('blacklist')} className={isBlacklistActive ? 'bg-gray-200 dark:bg-gray-700 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.blacklist} aria-label="Blacklist"><EyeOff className={`w-5 h-5 transition-transform duration-200 ${isBlacklistActive ? 'text-gray-800 dark:text-gray-200' : ''}`} /><span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isBlacklistActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.blacklist}</span></HeaderButton>
            
            {/* Favorites Button with count prop */}
            <HeaderButton onClick={() => navigateTo('favorites')} className={isFavoritesActive ? 'bg-red-100 dark:bg-red-900/50 text-red-500 py-2 px-3 scale-110' : 'p-2 bg-light-surface dark:bg-dark-surface'} tooltip={t.favorites} aria-label="Favorites" count={favoritesCount}>
              <Heart className={`w-5 h-5 transition-all duration-200 ${isFavoritesActive ? 'fill-red-500 text-red-500 rotate-0' : 'text-current -rotate-12'}`} />
              <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${isFavoritesActive ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{t.favorites}</span>
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
