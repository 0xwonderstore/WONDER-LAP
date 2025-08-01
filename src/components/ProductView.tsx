import React, { useState, useMemo, useEffect } from 'react';
import { Product, Locale } from '../types';
import ProductTable from './ProductTable';
import { EmptyState } from './EmptyState';
import Pagination from './Pagination';
import FilterComponent from './FilterComponent';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ProductCard from './ProductCard';

interface ProductViewProps {
  products: Product[];
  isLoading: boolean;
  stores: string[];
  locale: Locale;
  blacklist: string[];
  onClearInitialFilters: () => void;
  initialFilters: { store?: string; name?: string } | null;
  onNavigateWithFilter: (filter: { store?: string; language?: string }) => void;
}

const ProductView: React.FC<ProductViewProps> = ({
  products,
  isLoading,
  stores,
  locale,
  blacklist,
  initialFilters,
  onClearInitialFilters,
  onNavigateWithFilter
}) => {
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>('viewMode', 'grid');
  const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 1);
  const [productsPerPage, setProductsPerPage] = useLocalStorage('productsPerPage', 24);
  const [filters, setFilters] = useState<{
    name: string;
    store: string;
  }>(() => ({
    name: initialFilters?.name || '',
    store: initialFilters?.store || '',
  }));

  useEffect(() => {
    if (initialFilters) {
      setFilters({
        name: initialFilters.name || '',
        store: initialFilters.store || '',
      });
      setCurrentPage(1);
      onClearInitialFilters();
    }
  }, [initialFilters, onClearInitialFilters]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };
  
  const handleProductsPerPageChange = (value: number) => {
    setProductsPerPage(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ name: '', store: '' });
    setCurrentPage(1);
  };

  const processedProducts = useMemo(() => {
    const blacklistRegex = blacklist.length > 0 ? new RegExp(blacklist.join('|'), 'i') : null;
    const normalizeText = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const normalizedFilterName = normalizeText(filters.name);

    const filtered = products.filter(product => {
      // Blacklist filter
      if (blacklistRegex && product.name && blacklistRegex.test(product.name)) {
        return false;
      }
      
      // Name filter
      const nameMatch = filters.name ? normalizeText(product.name).includes(normalizedFilterName) : true;
      
      // Store filter
      const storeMatch = filters.store ? product.vendor === filters.store : true;
      
      return nameMatch && storeMatch;
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
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
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
                <ProductCard key={p.url} product={p} onNavigateWithFilter={onNavigateWithFilter} />
              ))}
            </div>
          ) : (
            <ProductTable products={currentProducts} onNavigateWithFilter={onNavigateWithFilter} />
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
