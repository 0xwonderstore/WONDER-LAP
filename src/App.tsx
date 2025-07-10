import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Sparkles, BarChart2, Heart, Shirt } from 'lucide-react';
import ProductView from './components/ProductView';
import VendorAnalytics from './components/VendorAnalytics';
import ScrollButtons from './components/ScrollButtons';
import Tooltip from './components/Tooltip';
import { Product, FilterConfig } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { loadProducts } from './utils/productLoader';

type View = 'products' | 'analytics';

const INITIAL_FILTERS: FilterConfig = {
  title: '',
  vendor: '',
  dateRange: 'all',
  customStartDate: '',
  customEndDate: ''
};

function App() {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);
  const [view, setView] = useLocalStorage<View>('view', 'products');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showOnlyFavorites, setShowOnlyFavorites] = useLocalStorage<boolean>('showOnlyFavorites', false);
  const [hideClothing, setHideClothing] = useLocalStorage<boolean>('hideClothing', false);
  const [currentPage, setCurrentPage] = useLocalStorage<number>('currentPage', 1);
  const [pageBeforeFavorites, setPageBeforeFavorites] = useLocalStorage<number>('pageBeforeFavorites', 1);
  const [filters, setFilters] = useLocalStorage<FilterConfig>('filters', INITIAL_FILTERS);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await loadProducts();
      setProducts(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleShowOnlyFavorites = () => {
    setShowOnlyFavorites(isCurrentlyShowing => {
      if (!isCurrentlyShowing) {
        setPageBeforeFavorites(currentPage);
        setCurrentPage(1);
      } else {
        setCurrentPage(pageBeforeFavorites || 1);
      }
      return !isCurrentlyShowing;
    });
  };

  const handleHideClothing = () => {
    setHideClothing(prev => !prev);
    setCurrentPage(1);
  };

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    if(showOnlyFavorites) setShowOnlyFavorites(false);
    if(hideClothing) setHideClothing(false);
    setCurrentPage(1);
  }, [setFilters, setShowOnlyFavorites, setHideClothing, setCurrentPage]);

  const renderContent = () => {
    if (isLoading && view === 'products') {
        return <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div></div>;
    }
    
    switch (view) {
      case 'analytics':
        return <VendorAnalytics products={products} onBack={() => setView('products')} />;
      case 'products':
      default:
        return <ProductView 
                  products={products} 
                  isLoading={isLoading} 
                  showOnlyFavorites={showOnlyFavorites}
                  hideClothing={hideClothing}
                  onClearFilters={handleClearFilters}
               />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <header className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
             <Sparkles className="w-8 h-8 text-yellow-500" />
             <h1 dir="ltr" className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
               WONDER LAB
             </h1>
           </div>
           <div className="flex items-center gap-4">
              <Tooltip text={view === 'products' ? 'عرض الإحصائيات' : 'عرض المنتجات'}>
                <button onClick={() => setView(v => v === 'products' ? 'analytics' : 'products')} className={`p-2 rounded-lg transition-colors ${view === 'analytics' ? 'bg-brand-danger text-white' : 'bg-light-surface dark:bg-dark-surface'}`}><BarChart2 className="w-5 h-5" /></button>
              </Tooltip>
              <Tooltip text="إخفاء الملابس">
                <button onClick={handleHideClothing} className={`p-2 rounded-lg transition-colors ${hideClothing ? 'bg-brand-danger text-white' : 'bg-light-surface dark:bg-dark-surface'}`}><Shirt className="w-5 h-5" /></button>
              </Tooltip>
              <Tooltip text="المفضلة">
                <button onClick={handleShowOnlyFavorites} className={`p-2 rounded-lg transition-colors ${showOnlyFavorites ? 'bg-brand-danger text-white' : 'bg-light-surface dark:bg-dark-surface'}`}><Heart className="w-5 h-5" /></button>
              </Tooltip>
              <Tooltip text="تبديل الوضع">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-light-surface dark:bg-dark-surface">{darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}</button>
              </Tooltip>
           </div>
        </header>
        
        {renderContent()}

      </div>
      <ScrollButtons />
    </div>
  );
}

export default App;
