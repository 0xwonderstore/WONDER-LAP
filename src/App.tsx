import React, { useMemo, useState, useRef, Suspense, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, Sparkles, Heart, LayoutDashboard, EyeOff, Instagram, Trash2, CheckSquare } from 'lucide-react';
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
import { Product, InstagramPost } from './types';
import { useInstagramBlacklistStore } from './stores/instagramBlacklistStore';
import { loadInstagramPosts } from './utils/instagramLoader';

// --- Lazy Imports ---
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage'));
const DashboardPage = React.lazy(() => import('./components/DashboardPage'));
const BlacklistPage = React.lazy(() => import('./components/BlacklistPage'));
const InstagramPage = React.lazy(() => import('./components/InstagramPage'));
const TikTokPage = React.lazy(() => import('./components/TikTokPage'));
const ScrollButtons = React.lazy(() => import('./components/ScrollButtons'));
const LanguageSwitcher = React.lazy(() => import('./components/LanguageSwitcher'));
const HiddenItemsPage = React.lazy(() => import('./components/HiddenItemsPage'));

// --- Type Definitions ---
type Page = 'home' | 'favorites' | 'dashboard' | 'blacklist' | 'instagram' | 'tiktok' | 'hidden';
type InitialFilter = { name?: string; store?: string | string[]; language?: string | string[] };

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
  </div>
);

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const { language } = useLanguageStore();
  const { favoriteUrls } = useFavoritesStore();
  const { keywords: blacklistedKeywords, blockedStores, hiddenProducts, hideProducts } = useBlacklistStore();
  const { blacklistedPosts } = useInstagramBlacklistStore();
  const { message, type, duration, onUndo, hideToast, showToast } = useToastStore();
  const [currentPage, setCurrentPage] = useLocalStorage<Page>('currentPage', 'home');
  const [initialFilters, setInitialFilters] = useLocalStorage<InitialFilter | null>('initialFilters', null);
  const [pendingProductIds, setPendingProductIds] = useState<Set<string>>(new Set());
  const pendingProductIdsRef = useRef<Set<string>>(new Set());
  const productHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: productData, isLoading } = useQuery<LoadProductsResult>({
    queryKey: ['products'],
    queryFn: loadProducts,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: allInstagramPosts = [] } = useQuery<InstagramPost[]>({
    queryKey: ['instagramPosts'],
    queryFn: loadInstagramPosts,
    staleTime: Infinity,
    gcTime: Infinity
  });

  const uniqueProducts: Product[] = useMemo(() => productData?.uniqueProducts || [], [productData]);
  const allProductsRaw: Product[] = useMemo(() => productData?.allProducts || [], [productData]);
  const totalBeforeFilter = productData?.totalBeforeFilter || 0;
  const t = translations[language] as any;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [darkMode, language]);

  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>('viewMode', 'grid');
  const [productsPage, setProductsPage] = useLocalStorage('productsPage', 1);
  const [productsPerPage, setProductsPerPage] = useLocalStorage('productsPerPage', 24);
  const [filters, setFilters] = useState({ name: '', store: [], language: [] });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (initialFilters) {
      setFilters({
        name: initialFilters.name || '',
        store: (Array.isArray(initialFilters.store) ? initialFilters.store : (initialFilters.store ? [initialFilters.store] : [])) as any,
        language: (Array.isArray(initialFilters.language) ? initialFilters.language : (initialFilters.language ? [initialFilters.language] : [])) as any,
      });
      setProductsPage(1);
      setInitialFilters(null);
    }
  }, [initialFilters, setInitialFilters, setProductsPage]);

  const uniqueStores = useMemo(() => [...new Set(uniqueProducts.map(p => p.vendor).filter(Boolean))], [uniqueProducts]);
  const availableLanguages = useMemo(() => [...new Set(uniqueProducts.map(p => p.language).filter(Boolean))], [uniqueProducts]);
  const languageCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    uniqueProducts.forEach(p => { if (p.language) counts[p.language] = (counts[p.language] || 0) + 1; });
    return counts;
  }, [uniqueProducts]);

  const filteredProducts = useMemo(() => {
    let products = uniqueProducts;
    const hiddenSet = new Set(hiddenProducts);
    products = products.filter(p => !hiddenSet.has(p.url) && !pendingProductIds.has(p.url));
    products = filterProducts(products, blacklistedKeywords, blockedStores);
    if (filters.name) products = searchProducts(products, filters.name);
    // @ts-ignore
    if (filters.store.length > 0) products = products.filter(p => filters.store.includes(p.vendor));
    // @ts-ignore
    if (filters.language.length > 0) products = products.filter(p => filters.language.includes(p.language));
    if (dateRange?.from) products = products.filter(p => new Date(p.created_at) >= dateRange.from!);
    if (dateRange?.to) products = products.filter(p => new Date(p.created_at) <= dateRange.to!);
    return products.sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
  }, [uniqueProducts, blacklistedKeywords, blockedStores, hiddenProducts, pendingProductIds, filters, dateRange]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((productsPage - 1) * productsPerPage, productsPage * productsPerPage);

  const navigateTo = (page: Page) => setCurrentPage(prev => (prev === page ? 'home' : page));
  const navigateToHomeWithFilter = useCallback((filter: InitialFilter) => { setInitialFilters(filter); setCurrentPage('home'); }, [setInitialFilters, setCurrentPage]);
  const handleFilterChange = (key: string, value: any) => { setFilters(prev => ({ ...prev, [key]: value })); setProductsPage(1); };
  const handleResetFilters = () => { setFilters({ name: '', store: [], language: [] }); setDateRange(undefined); setProductsPage(1); };

  const processPendingHides = (ids: string[]) => {
    if (productHideTimeoutRef.current) clearTimeout(productHideTimeoutRef.current);
    ids.forEach(id => pendingProductIdsRef.current.add(id));
    setPendingProductIds(new Set(pendingProductIdsRef.current));
    showToast(`Hiding ${pendingProductIdsRef.current.size} items...`, 'undo', 5000, () => {
       pendingProductIdsRef.current.clear();
       setPendingProductIds(new Set());
       if (productHideTimeoutRef.current) clearTimeout(productHideTimeoutRef.current);
    });
    productHideTimeoutRef.current = setTimeout(() => {
       const finalIds = Array.from(pendingProductIdsRef.current);
       if (finalIds.length > 0) hideProducts(finalIds);
       pendingProductIdsRef.current.clear();
       setPendingProductIds(new Set());
       hideToast();
    }, 5000);
  };

  const NavbarButton: React.FC<{ onClick: () => void; isActive: boolean; icon: React.ReactNode; label: string; count?: number; className?: string }> = 
    ({ onClick, isActive, icon, label, count, className }) => (
    <button className={`uiverse-nav-button ${className} ${isActive ? 'active' : ''}`} onClick={onClick}>
       <div className="uiverse-nav-icon">{icon}</div>
       <span className="uiverse-nav-label">{label}</span>
       {count !== undefined && count > 0 && <span className="nav-badge-uiverse">{count}</span>}
    </button>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'favorites': return <FavoritesPage allProducts={filteredProducts} onNavigateWithFilter={navigateToHomeWithFilter} />;
      case 'dashboard': return <DashboardPage products={filteredProducts} allProductsRaw={allProductsRaw} totalBeforeFilter={totalBeforeFilter} onNavigateWithFilter={navigateToHomeWithFilter} isLoading={isLoading} />;
      case 'blacklist': return <BlacklistPage />;
      case 'instagram': return <InstagramPage />;
      case 'tiktok': return <TikTokPage />;
      case 'hidden': return <HiddenItemsPage products={uniqueProducts} instagramPosts={allInstagramPosts} />;
      default: 
        return (
            <div className="animate-fade-in-up relative z-10">
                 <div className="mb-8 flex justify-end">
                    <button onClick={() => processPendingHides(currentProducts.map(p => p.url))} disabled={currentProducts.length === 0} className="uiverse-hide-button">
                        <div className="uiverse-nav-icon"><CheckSquare size={20} /></div>
                        <span className="uiverse-nav-label">Hide All In Page ({currentProducts.length})</span>
                    </button>
                 </div>
                 <FilterComponent t={t} stores={uniqueStores} languages={availableLanguages} languageCounts={languageCounts} filters={filters} date={dateRange} setDate={setDateRange} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} viewMode={viewMode} onViewModeChange={setViewMode} productsPerPage={productsPerPage} onPostsPerPageChange={setProductsPerPage} />
                {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div> : currentProducts.length > 0 ? (
                    <>
                        {viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{currentProducts.map(p => <div key={p.url} className="animate-fade-in-up"><ProductCard product={p} t={t} onNavigateWithFilter={navigateToHomeWithFilter} onHideProduct={(url) => processPendingHides([url])} /></div>)}</div> : <ProductTable products={currentProducts} t={t} onNavigateWithFilter={navigateToHomeWithFilter} />}
                        <Pagination currentPage={productsPage} totalPages={totalPages} onPageChange={setProductsPage} totalItems={filteredProducts.length} itemsPerPage={productsPerPage} />
                    </>
                ) : <EmptyState title={t.noResults} hint={t.noResultsHint} />}
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {message && type && <Toast message={message} type={type} duration={duration} onUndo={onUndo} onClose={hideToast} />}
      <div className="container mx-auto py-8 px-4 relative z-10 flex-grow">
        <header className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex items-center gap-3 relative group cursor-pointer" onClick={() => setCurrentPage('home')}>
             <div className="absolute -left-4 -top-2 animate-pulse"><Sparkles className="w-6 h-6 text-yellow-400 opacity-80" /></div>
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-brand-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto]" dir="ltr">WONDER LAB</h1>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Suspense fallback={<div className="w-24 h-10 rounded-full bg-gray-200 animate-pulse" />}><LanguageSwitcher /></Suspense>
            
            <NavbarButton className="btn-dashboard" onClick={() => navigateTo('dashboard')} isActive={currentPage === 'dashboard'} icon={<LayoutDashboard size={20} />} label={t.dashboard} />
            <NavbarButton className="btn-instagram" onClick={() => navigateTo('instagram')} isActive={currentPage === 'instagram'} icon={<Instagram size={20} />} label={t.instagram_feature} />
            <NavbarButton className="btn-tiktok" onClick={() => navigateTo('tiktok')} isActive={currentPage === 'tiktok'} icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>} label={t.tiktok_feature} />
            <NavbarButton className="btn-blacklist" onClick={() => navigateTo('blacklist')} isActive={currentPage === 'blacklist'} icon={<EyeOff size={20} />} label={t.blacklist} />
            <NavbarButton className="btn-hidden" onClick={() => navigateTo('hidden')} isActive={currentPage === 'hidden'} icon={<Trash2 size={20} />} label={t.hidden_items} count={hiddenProducts.length + blacklistedPosts.size} />
            <NavbarButton className="btn-favorites" onClick={() => navigateTo('favorites')} isActive={currentPage === 'favorites'} icon={<Heart size={20} className={currentPage === 'favorites' ? 'fill-white' : ''} />} label={t.favorites} count={favoriteUrls.size} />
            
            <button onClick={() => setDarkMode(d => !d)} className="w-[50px] h-[50px] rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-gray-100 dark:border-gray-700">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-900" />}
            </button>
          </div>
        </header>
        <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>
      </div>
      <Suspense fallback={<></>}><ScrollButtons /></Suspense>
    </div>
  );
};

export default App;
