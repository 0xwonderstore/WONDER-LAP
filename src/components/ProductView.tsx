import React, { useState, useMemo, useEffect } from 'react';
import { Product, Locale } from '../types';
import ProductTable from './ProductTable';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import FilterComponent from './FilterComponent';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ProductCard from './ProductCard';

interface ProductViewProps {
  products: Product[];
  isLoading: boolean;
  stores: string[];
  languages: string[];
  locale: Locale;
  favorites: string[];
  blacklist: string[];
  onToggleFavorite: (productId: string) => void;
  onClearInitialFilters: () => void;
  initialFilters: { store?: string; language?: string } | null;
}

const ProductView: React.FC<ProductViewProps> = ({
  products,
  isLoading,
  stores,
  languages,
  locale,
  favorites,
  blacklist,
  onToggleFavorite,
  initialFilters,
  onClearInitialFilters,
}) => {
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>('viewMode', 'grid');
  const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 1);
  const [productsPerPage, setProductsPerPage] = useLocalStorage('productsPerPage', 24);
  const [filters, setFilters] = useState<{
    name: string;
    store: string;
    language: string;
    dateRange: string;
    startDate: Date | null;
    endDate: Date | null;
  }>({ name: '', store: '', language: '', dateRange: '', startDate: null, endDate: null });

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, store: initialFilters.store || '', language: initialFilters.language || '' }));
      onClearInitialFilters();
    }
  }, [initialFilters, onClearInitialFilters]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };
  
  const handleDateRangeChange = (range: string, startDate?: Date | null, endDate?: Date | null) => {
    setFilters(prev => ({ ...prev, dateRange: range, startDate: startDate || null, endDate: endDate || null }));
    setCurrentPage(1);
  };
  
  const handleProductsPerPageChange = (value: number) => {
    setProductsPerPage(value);
    setCurrentPage(1);
  };

  const processedProducts = useMemo(() => {
    const blacklistRegex = new RegExp(blacklist.join('|'), 'i');
    const normalizeText = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const normalizedFilterName = normalizeText(filters.name);

    const filtered = products.filter(product => {
      if (blacklist.length > 0 && product.name && blacklistRegex.test(product.name)) {
        return false;
      }
      
      const normalizedProductName = product.name ? normalizeText(product.name) : '';
      const nameMatch = filters.name ? normalizedProductName.includes(normalizedFilterName) : true;
      const storeMatch = filters.store ? product.store?.name === filters.store : true;
      const languageMatch = filters.language ? product.language === filters.language : true;
      
      let dateMatch = true;
      if (product.created_at) {
        const productDate = new Date(product.created_at);

        if (filters.dateRange && filters.dateRange !== 'custom') {
          const now = new Date();
          let fromDate = new Date();
          switch (filters.dateRange) {
            case 'last_week': fromDate.setDate(now.getDate() - 7); break;
            case 'last_month': fromDate.setMonth(now.getMonth() - 1); break;
            case 'last_3_months': fromDate.setMonth(now.getMonth() - 3); break;
            case 'last_6_months': fromDate.setMonth(now.getMonth() - 6); break;
            case 'last_year': fromDate.setFullYear(now.getFullYear() - 1); break;
          }
          dateMatch = productDate >= fromDate && productDate <= now;
        } else if (filters.dateRange === 'custom') {
          const startDate = filters.startDate;
          const endDate = filters.endDate;
          if (startDate && endDate) {
            dateMatch = productDate >= startDate && productDate <= endDate;
          } else if (startDate) {
            dateMatch = productDate >= startDate;
          } else if (endDate) {
            dateMatch = productDate <= endDate;
          }
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
      />

      {isLoading ? (
        <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div></div>
      ) : currentProducts.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map(p => (
                <ProductCard key={p.url} product={p} isFavorite={favorites.includes(p.url)} onToggleFavorite={onToggleFavorite} />
              ))}
            </div>
          ) : (
            <ProductTable products={currentProducts} favorites={favorites} onToggleFavorite={onToggleFavorite} />
          )}
          <Pagination
            locale={locale}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={processedProducts.length}
            itemsPerPage={productsPerPage}
          />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default ProductView;
