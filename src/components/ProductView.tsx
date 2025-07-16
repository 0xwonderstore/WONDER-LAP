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

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };
  
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({ ...prev, dateRange: 'custom', [field]: value }));
    setCurrentPage(1);
  };
  
  const handleDateRangeOptionChange = (range: string) => {
    const newFilters = { ...filters, dateRange: range };
    if (range !== 'custom') {
      newFilters.startDate = '';
      newFilters.endDate = '';
    }
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleProductsPerPageChange = (value: number) => {
    setProductsPerPage(value);
    setCurrentPage(1);
  };

  const processedProducts = useMemo(() => {
    return products
      .filter(product => {
        const { name, store, language, dateRange, startDate, endDate } = filters;
        if (blacklist.length > 0 && new RegExp(blacklist.join('|'), 'i').test(product.name)) return false;

        const nameMatch = name ? product.name.toLowerCase().includes(name.toLowerCase()) : true;
        const storeMatch = store ? product.store?.name === store : true;
        const languageMatch = language ? product.language === language : true;

        let dateMatch = true;
        if (dateRange) {
          const productDate = new Date(product.created_at);
          if (isNaN(productDate.getTime())) return false;
          
          if (dateRange === 'custom') {
            if (startDate) {
              const start = new Date(startDate + 'T00:00:00.000Z');
              if (productDate < start) dateMatch = false;
            }
            if (dateMatch && endDate) {
              const end = new Date(endDate + 'T23:59:59.999Z');
              if (productDate > end) dateMatch = false;
            }
          } else {
            const now = new Date();
            let fromDate: Date | null = null;
            switch (dateRange) {
              case 'last_week': fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7)); break;
              case 'last_month': fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, now.getUTCDate())); break;
              case 'last_3_months': fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, now.getUTCDate())); break;
              case 'last_6_months': fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate())); break;
              case 'last_year': fromDate = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate())); break;
            }
            if (fromDate && productDate < fromDate) dateMatch = false;
          }
        }
        return nameMatch && storeMatch && languageMatch && dateMatch;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [products, filters, blacklist]);

  const totalPages = Math.ceil(processedProducts.length / productsPerPage);
  const currentProducts = processedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="animate-fade-in-up">
      <FilterComponent
        locale={locale}
        stores={stores}
        languages={languages}
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateChange={handleDateChange}
        onDateRangeOptionChange={handleDateRangeOptionChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        productsPerPage={productsPerPage}
        onProductsPerPageChange={handleProductsPerPageChange}
        onOpenBlacklist={onOpenBlacklist}
      />
      {isLoading ? (
        <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div></div>
      ) : currentProducts.length > 0 ? (
        <>
          {viewMode === 'grid' ? <ProductGrid products={currentProducts} favorites={favorites} onToggleFavorite={onToggleFavorite} /> : <ProductTable products={currentProducts} favorites={favorites} onToggleFavorite={onToggleFavorite} />}
          <Pagination locale={locale} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={processedProducts.length} itemsPerPage={productsPerPage} />
        </>
      ) : (
        <EmptyState onOpenBlacklist={onOpenBlacklist} />
      )}
    </div>
  );
};

export default ProductView;
