import React, { useState, useMemo, useEffect } from 'react';
import { Product, Locale } from '../types';
import ProductGrid from './ProductGrid';
import ProductTable from './ProductTable';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import FilterComponent from './FilterComponent';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ProductViewProps {
  products: Product[];
  isLoading: boolean;
  stores: string[];
  languages: string[];
  locale: Locale;
  favorites: string[];
  blacklist: string[];
  onToggleFavorite: (productId: string) => void;
  onOpenBlacklist: () => void;
  initialFilters: { store?: string; language?: string } | null;
  onClearInitialFilters: () => void;
}

const ProductView: React.FC<ProductViewProps> = ({ products, isLoading, stores, languages, locale, favorites, blacklist, onToggleFavorite, onOpenBlacklist, initialFilters, onClearInitialFilters }) => {
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>('viewMode','grid');
  const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 1);
  const [productsPerPage, setProductsPerPage] = useLocalStorage('productsPerPage', 24);
  const [filters, setFilters] = useState({ name: '', store: '', language: '', dateRange: '', startDate: '', endDate: '' });

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, store: initialFilters.store || '', language: initialFilters.language || '' }));
      setCurrentPage(1);
      onClearInitialFilters();
    }
  }, [initialFilters, onClearInitialFilters]);

  const handleFilterChange = (filterName: string, value: string) => { setFilters(prev => ({ ...prev, [filterName]: value })); setCurrentPage(1); };
  
  const handleDateRangeChange = (range: string, startDate: string = filters.startDate, endDate: string = filters.endDate) => {
    if (range !== 'custom') {
        setFilters(prev => ({ ...prev, dateRange: range, startDate: '', endDate: '' }));
    } else {
        setFilters(prev => ({ ...prev, dateRange: range, startDate, endDate }));
    }
    setCurrentPage(1);
  };
  
  const handleProductsPerPageChange = (value: number) => { setProductsPerPage(value); setCurrentPage(1); };

  const processedProducts = useMemo(() => {
    const blacklistRegex = new RegExp(blacklist.join('|'), 'i');
    const normalizeText = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const normalizedFilterName = normalizeText(filters.name);

    const filtered = products.filter(product => {
      if (blacklist.length > 0 && blacklistRegex.test(product.name)) return false;
      
      const normalizedProductName = normalizeText(product.name);
      const nameMatch = filters.name ? normalizedProductName.includes(normalizedFilterName) : true;
      const storeMatch = filters.store ? product.store?.name === filters.store : true;
      const languageMatch = filters.language ? product.language === filters.language : true;
      
      let dateMatch = true;
      const productDate = new Date(product.created_at);
      if (isNaN(productDate.getTime())) return false; 

      if (filters.dateRange) {
        const now = new Date();
        let fromDate: Date | null = null;
        
        switch (filters.dateRange) {
          case 'last_week': fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7)); break;
          case 'last_month': fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, now.getUTCDate())); break;
          case 'last_3_months': fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, now.getUTCDate())); break;
          case 'last_6_months': fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate())); break;
          case 'last_year': fromDate = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate())); break;
          case 'custom':
            let isAfterStart = true;
            let isBeforeEnd = true;
            if (filters.startDate) {
                const startDate = new Date(filters.startDate + 'T00:00:00.000Z');
                isAfterStart = productDate >= startDate;
            }
            if (filters.endDate) {
                const endDate = new Date(filters.endDate + 'T23:59:59.999Z');
                isBeforeEnd = productDate <= endDate;
            }
            dateMatch = isAfterStart && isBeforeEnd;
            break;
        }

        if (fromDate) {
            dateMatch = productDate >= fromDate;
        }
      }
      
      return nameMatch && storeMatch && languageMatch && dateMatch;
    });

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [products, filters, blacklist]);

  const totalPages = Math.ceil(processedProducts.length / productsPerPage);
  const currentProducts = processedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  return (
    <div className="animate-fade-in-up">
       <FilterComponent
        locale={locale}
        stores={stores}
        languages={languages}
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        productsPerPage={productsPerPage}
        onProductsPerPageChange={handleProductsPerPageChange}
        onOpenBlacklist={onOpenBlacklist}
      />

      {isLoading ? ( <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div></div> ) : 
      currentProducts.length > 0 ? (
        <>
          {viewMode === 'grid' ? <ProductGrid products={currentProducts} favorites={favorites} onToggleFavorite={onToggleFavorite} /> : <ProductTable products={currentProducts} favorites={favorites} onToggleFavorite={onToggleFavorite} />}
          <Pagination locale={locale} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={processedProducts.length} itemsPerPage={productsPerPage} />
        </>
      ) : ( <EmptyState onOpenBlacklist={onOpenBlacklist}/> )}
    </div>
  );
};

export default ProductView;
