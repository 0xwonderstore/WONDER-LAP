
import React, { useMemo, useCallback } from 'react';
import ProductGrid from './ProductGrid';
import ProductTable from './ProductTable';
import FilterPanel from './FilterPanel';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { Product, FilterConfig, SortKey, SortOrder } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { applyFiltersAndSort } from '../utils/productUtils';

interface ProductViewProps {
  products: Product[];
  isLoading: boolean;
  filters: FilterConfig;
  setFilters: (filters: FilterConfig) => void;
  onClearFilters: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function ProductView({ 
  products, 
  isLoading,
  filters,
  setFilters,
  onClearFilters,
  currentPage,
  setCurrentPage,
}: ProductViewProps) {
  const [sortKey, setSortKey] = useLocalStorage<SortKey>('sortKey', 'created_at');
  const [sortOrder, setSortOrder] = useLocalStorage<SortOrder>('sortOrder', 'desc');
  const [displayMode, setDisplayMode] = useLocalStorage<'grid' | 'table'>('displayMode', 'grid');
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('itemsPerPage', 25);
  
  const handleFilterChange = useCallback((newFilters: Partial<FilterConfig>) => { setFilters({ ...filters, ...newFilters }); setCurrentPage(1); }, [filters, setFilters, setCurrentPage]);
  const handleSortKeyChange = useCallback((key: SortKey) => { setSortKey(key); setCurrentPage(1); }, [setSortKey, setCurrentPage]);
  const handleSortOrderChange = useCallback((order: SortOrder) => { setSortOrder(order); setCurrentPage(1); }, [setSortOrder, setCurrentPage]);
  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const processedProducts = useMemo(() => { 
    return applyFiltersAndSort(products, filters, sortKey, sortOrder); 
  }, [products, filters, sortKey, sortOrder]);
  
  const totalPages = useMemo(() => Math.ceil(processedProducts.length / itemsPerPage), [processedProducts, itemsPerPage]);
  const paginatedProducts = useMemo(() => { const startIndex = (currentPage - 1) * itemsPerPage; return processedProducts.slice(startIndex, startIndex + itemsPerPage); }, [processedProducts, currentPage, itemsPerPage]);

  return (
    <>
      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onClearFilters={onClearFilters} 
        products={products} 
        sortKey={sortKey} 
        onSortKeyChange={handleSortKeyChange} 
        sortOrder={sortOrder} 
        onSortOrderChange={handleSortOrderChange} 
        displayMode={displayMode} 
        onDisplayModeChange={setDisplayMode} 
        itemsPerPage={itemsPerPage} 
        onItemsPerPageChange={setItemsPerPage} 
      />
      
      {isLoading ? (
        <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div></div>
      ) : (
        <>
          {processedProducts.length > 0 ? ( 
            displayMode === 'grid' ? 
              <ProductGrid products={paginatedProducts} onClearFilters={onClearFilters} /> : 
              <ProductTable products={paginatedProducts} /> 
          ) : ( 
            <EmptyState onClearFilters={onClearFilters} /> 
          )}
          
          {processedProducts.length > 0 && ( 
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={processedProducts.length} itemsPerPage={itemsPerPage} /> 
          )}
        </>
      )}
    </>
  );
}
