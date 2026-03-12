import React, { useMemo, useState, useRef, Suspense, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Heart, LayoutDashboard, EyeOff, Instagram, Trash2, CheckSquare, Facebook } from 'lucide-react';
import { loadProducts, LoadProductsResult } from './utils/productLoader';
import { searchProducts } from './utils/productUtils';
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
import { Product, InstagramPost, FacebookPost } from './types';
import { useInstagramBlacklistStore } from './stores/instagramBlacklistStore';
import { loadInstagramPosts } from './utils/instagramLoader';
import { loadFacebookPosts } from './utils/facebookLoader';
import ThemeToggle from './components/ThemeToggle';
import { useTranslation } from 'react-i18next';

// Lazy load heavy pages
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage'));
const DashboardPage = React.lazy(() => import('./components/DashboardPage'));
const BlacklistPage = React.lazy(() => import('./components/BlacklistPage'));
const InstagramPage = React.lazy(() => import('./components/InstagramPage'));
const FacebookPage = React.lazy(() => import('./components/FacebookPage'));
const ScrollButtons = React.lazy(() => import('./components/ScrollButtons'));
const LanguageSwitcher = React.lazy(() => import('./components/LanguageSwitcher'));
const HiddenItemsPage = React.lazy(() => import('./components/HiddenItemsPage'));

type Page = 'home' | 'favorites' | 'dashboard' | 'blacklist' | 'instagram' | 'facebook' | 'hidden';
type InitialFilter = { name?: string; store?: string | string[]; language?: string | string[] };

const LoadingFallback = () => (
  <div className="content-spinner-container">
    <div className="loader">
      <div className="loaderMiniContainer">
        <div className="barContainer">
          <span className="bar"></span>
          <span className="bar bar2"></span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 101 105" className="svgIcon">
          <circle r="40" cy="40" cx="40"></circle>
          <line y2="100" x2="100" y1="60" x1="60"></line>
        </svg>
      </div>
    </div>
  </div>
);

const EMPTY_ARRAY: any[] = [];

const App: React.FC = () => {
  const { t: translate } = useTranslation();
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const { data: allInstagramPosts } = useQuery<InstagramPost[]>({
    queryKey: ['instagramPosts'],
    queryFn: loadInstagramPosts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const { data: allFacebookPosts } = useQuery<FacebookPost[]>({
    queryKey: ['facebookPosts'],
    queryFn: loadFacebookPosts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const uniqueProducts: Product[] = useMemo(() => productData?.uniqueProducts || EMPTY_ARRAY, [productData]);
  const allProductsRaw: Product[] = useMemo(() => productData?.allProducts || EMPTY_ARRAY, [productData]);
  const totalBeforeFilter = productData?.totalBeforeFilter || 0;
  const t = translations[language] as any;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [darkMode, language]);

  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>('viewMode', 'grid');
  const [productsPage, setProductsPage] = useLocalStorage('productsPage', 1);
  const [productsPerPage, setProductsPerPage] = useLocalStorage('productsPerPage', 52);
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

  const uniqueStores = useMemo(() => {
      if (!uniqueProducts) return [];
      return [...new Set(uniqueProducts.map(p => p.vendor).filter(Boolean))];
  }, [uniqueProducts]);

  const availableLanguages = useMemo(() => {
      if (!uniqueProducts) return [];
      return [...new Set(uniqueProducts.map(p => p.language).filter(Boolean))];
  }, [uniqueProducts]);

  const languageCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    uniqueProducts.forEach(p => { if (p.language) counts[p.language] = (counts[p.language] || 0) + 1; });
    return counts;
  }, [uniqueProducts]);

  const filteredProducts = useMemo(() => {
    const lowercasedKeywords = blacklistedKeywords.map(k => k.toLowerCase());
    const hiddenSet = new Set(hiddenProducts);
    const pendingSet = pendingProductIds;
    const blockedStoresSet = new Set(blockedStores);

    let productsToDisplay = uniqueProducts.filter(p => {
        if (!p.url) return false;

        // --- Primary Block Filters --- //
        const nameLower = p.name ? p.name.toLowerCase() : '';
        if (lowercasedKeywords.some(keyword => nameLower.includes(keyword))) return false;
        if (p.vendor && blockedStoresSet.has(p.vendor)) return false;
        if (hiddenSet.has(p.url)) return false;
        if (pendingSet.has(p.url)) return false;

        // --- User-defined Search and Filters --- //
        if (filters.name && !searchProducts([p], filters.name).length) return false;
        if (Array.isArray(filters.store) && filters.store.length > 0 && (!p.vendor || !filters.store.includes(p.vendor))) return false;
        if (Array.isArray(filters.language) && filters.language.length > 0 && (!p.language || !filters.language.includes(p.language))) return false;
        if (dateRange?.from && new Date(p.created_at).getTime() < dateRange.from.getTime()) return false;
        if (dateRange?.to && new Date(p.created_at).getTime() > dateRange.to.getTime()) return false;

        return true;
    });

    return [...productsToDisplay].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
    });
}, [uniqueProducts, blacklistedKeywords, blockedStores, hiddenProducts, pendingProductIds, filters, dateRange]);


  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((productsPage - 1) * productsPerPage, productsPage * productsPerPage);

  const navigateTo = useCallback((page: Page) => setCurrentPage(prev => (prev === page ? 'home' : page)), [setCurrentPage]);
  const navigateToHomeWithFilter = useCallback((filter: InitialFilter) => { setInitialFilters(filter); setCurrentPage('home'); }, [setInitialFilters, setCurrentPage]);

  const handleFilterChange = useCallback((key: string, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setProductsPage(1);
  }, [setProductsPage]);

  const handleResetFilters = useCallback(() => {
      setFilters({ name: '', store: [], language: [] });
      setDateRange(undefined);
      setProductsPage(1);
  }, [setProductsPage]);

  const processPendingHides = (ids: string[]) => {
    if (productHideTimeoutRef.current) clearTimeout(productHideTimeoutRef.current);
    ids.forEach(id => pendingProductIdsRef.current.add(id));
    setPendingProductIds(new Set(pendingProductIdsRef.current));

    showToast(translate('archiving_in_progress', { count: pendingProductIdsRef.current.size }), 'undo', 5000, () => {
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
       {count !== undefined && count > 0 && (
         <span className="nav-badge-simple">{count}</span>
       )}
    </button>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'favorites': return <FavoritesPage allProducts={uniqueProducts} instagramPosts={allInstagramPosts || EMPTY_ARRAY} facebookPosts={allFacebookPosts || EMPTY_ARRAY} onNavigateWithFilter={navigateToHomeWithFilter} />;
      case 'dashboard': return <DashboardPage products={filteredProducts} allProductsRaw={allProductsRaw} totalBeforeFilter={totalBeforeFilter} onNavigateWithFilter={navigateToHomeWithFilter} isLoading={isLoading} />;
      case 'blacklist': return <BlacklistPage />;
      case 'instagram': return <InstagramPage />;
      case 'facebook': return <FacebookPage />;
      case 'hidden': return <HiddenItemsPage products={uniqueProducts} instagramPosts={allInstagramPosts || EMPTY_ARRAY} />;
      default: 
        return (
            <div className="animate-fade-in-up relative z-10">
                 <div className="mb-8 flex justify-end">
                    <button 
                        onClick={() => processPendingHides(currentProducts.map(p => p.url))}
                        disabled={currentProducts.length === 0} 
                        className="uiverse-hide-button bg-red-600 hover:bg-red-700 !w-auto !px-6 !rounded-full group"
                    >
                        <div className="uiverse-nav-icon transition-transform group-hover:scale-110"><CheckSquare size={22} /></div>
                        <span className="ml-3 text-white font-bold text-sm tracking-wide whitespace-nowrap">
                           {translate('hide_all_page', { count: currentProducts.length })}
                        </span>
                    </button>
                 </div>
                 <FilterComponent t={t} stores={uniqueStores} languages={availableLanguages} languageCounts={languageCounts} filters={filters} date={dateRange} setDate={setDateRange} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} viewMode={viewMode} onViewModeChange={setViewMode} productsPerPage={productsPerPage} onProductsPerPageChange={setProductsPerPage} />
                {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{Array.from({ length: productsPerPage }).map((_, i) => <ProductCardSkeleton key={i} />)}</div> : currentProducts.length > 0 ? (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{
                                currentProducts.map(p => <div key={p.url} className="animate-fade-in-up"><ProductCard product={p} t={t} onNavigateWithFilter={navigateToHomeWithFilter} /></div>)
                            }</div>
                        ) : <ProductTable products={currentProducts} t={t} onNavigateWithFilter={navigateToHomeWithFilter} />}
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
            <Suspense fallback={<div className="w-24 h-10 rounded-full bg-gray-100 animate-pulse" />}><LanguageSwitcher /></Suspense>
            
            <NavbarButton className="btn-dashboard" onClick={() => navigateTo('dashboard')} isActive={currentPage === 'dashboard'} icon={<LayoutDashboard size={20} />} label={t.dashboard} />
            <NavbarButton className="btn-facebook" onClick={() => navigateTo('facebook')} isActive={currentPage === 'facebook'} icon={<Facebook size={20} />} label={t.facebook_feature} />
            <NavbarButton className="btn-instagram" onClick={() => navigateTo('instagram')} isActive={currentPage === 'instagram'} icon={<Instagram size={20} />} label={t.instagram_feature} />
            <NavbarButton className="btn-blacklist" onClick={() => navigateTo('blacklist')} isActive={currentPage === 'blacklist'} icon={<EyeOff size={20} />} label={t.blacklist} />
            <NavbarButton className="btn-hidden" onClick={() => navigateTo('hidden')} isActive={currentPage === 'hidden'} icon={<Trash2 size={20} />} label={t.hidden_items} count={hiddenProducts.length + blacklistedPosts.size} />
            <NavbarButton className="btn-favorites" onClick={() => navigateTo('favorites')} isActive={currentPage === 'favorites'} icon={<Heart size={20} className={currentPage === 'favorites' ? 'fill-white' : ''} />} label={t.favorites} count={favoriteUrls.size} />
            
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </header>
        <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>
      </div>
      <Suspense fallback={<></>}><ScrollButtons /></Suspense>
    </div>
  );
};

export default App;
