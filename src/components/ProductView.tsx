import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import ProductTable from './ProductTable';
import { EmptyState } from './EmptyState';
import Pagination from './Pagination';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ProductCard from './ProductCard';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { searchProducts, countDuplicates } from '../utils/productUtils';

interface ProductViewProps {
  products: Product[];
  isLoading: boolean;
  stores: string[];
  onClearInitialFilters: () => void;
  initialFilters: { store?: string; name?: string; language?: string } | null;
  onNavigateWithFilter: (filter: { store?: string; name?: string; language?: string }) => void;
}

const ProductView: React.FC<ProductViewProps> = ({
  products,
  isLoading,
  stores,
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
    language: string;
  }>(() => ({
    name: initialFilters?.name || '',
    store: initialFilters?.store || '',
    language: initialFilters?.language || '',
  }));

  useEffect(() => {
    if (initialFilters) {
      setFilters({
        name: initialFilters.name || '',
        store: initialFilters.store || '',
        language: initialFilters.language || '',
      });
      setCurrentPage(1);
      onClearInitialFilters();
    }
  }, [initialFilters, onClearInitialFilters, setCurrentPage]);

  const processedProducts = useMemo(() => {
    let filtered = products;

    if (filters.name) {
        filtered = searchProducts(filtered, filters.name);
    }
    
    if (filters.store) {
      filtered = filtered.filter(p => p.vendor === filters.store);
    }

    if (filters.language) {
      filtered = filtered.filter(p => p.language === filters.language);
    }
    
    return filtered.sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    });
  }, [products, filters]);

  // Calculate duplicates for the currently visible products or all processed products?
  // Usually better to calculate for all processed products so the count is accurate across pages if needed,
  // but if we want to show global duplicates, we should calculate on 'products' prop.
  // Let's calculate on 'processedProducts' to show duplicates within the current filter context,
  // OR calculate on 'products' to show duplicates across the whole dataset. 
  // Global duplicates seems more useful.
  const duplicateCounts = useMemo(() => countDuplicates(products), [products]);

  const totalPages = Math.ceil(processedProducts.length / productsPerPage);
  const currentProducts = processedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const handlePageChange = (page: number) => { setCurrentPage(page); };
  
  return (
    <div className="animate-fade-in-up">
      {/* FilterComponent Removed as requested */}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface overflow-hidden shadow-lg h-full flex flex-col">
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                      <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      ) : currentProducts.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map(p => (
                <ProductCard 
                    key={p.url} 
                    product={p} 
                    t={t} 
                    onNavigateWithFilter={onNavigateWithFilter} 
                    duplicateCount={duplicateCounts.get(p.url) || 0}
                />
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
          />
        </>
      ) : (
        <EmptyState title={t.noResults} hint={t.noResultsHint} />
      )}
    </div>
  );
};

export default ProductView;
