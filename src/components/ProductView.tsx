import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import ProductTable from './ProductTable';
import { EmptyState } from './EmptyState';
import Pagination from './Pagination';
import FilterComponent from './FilterComponent';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ProductCard from './ProductCard';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';

interface ProductViewProps {
  products: Product[];
  isLoading: boolean;
  stores: string[];
  blacklist: string[];
  onClearInitialFilters: () => void;
  initialFilters: { store?: string; name?: string } | null;
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}

const ProductView: React.FC<ProductViewProps> = ({
  products,
  isLoading,
  stores,
  blacklist,
  initialFilters,
  onClearInitialFilters,
  onNavigateWithFilter
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];
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
  }, [initialFilters, onClearInitialFilters, setCurrentPage]);

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
    const blacklistRegex = blacklist.length > 0 ? new RegExp(`\\b(${blacklist.join('|')})\\b`, 'i') : null;
    const searchTerms = filters.name.toLowerCase().split(' ').filter(term => term.length > 0);

    const filtered = products.filter(product => {
      if (blacklistRegex && product.name && blacklistRegex.test(product.name)) {
        return false;
      }
      
      const productNameLower = product.name.toLowerCase();
      const nameMatch = searchTerms.every(term => productNameLower.includes(term));
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
        t={t}
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
                <ProductCard key={p.url} product={p} t={t} onNavigateWithFilter={onNavigateWithFilter} />
              ))}
            </div>
          ) : (
            <ProductTable products={currentProducts} t={t} onNavigateWithFilter={onNavigateWithFilter} />
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={processedProducts.length}
            itemsPerPage={productsPerPage}
            t={t}
          />
        </>
      ) : (
        <EmptyState t={t} />
      )}
    </div>
  );
};

export default ProductView;
