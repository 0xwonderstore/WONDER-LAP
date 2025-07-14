
import React, { useMemo } from 'react';
import ProductGrid from './ProductGrid';
import ProductTable from './ProductTable';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { Product, SortKey, SortOrder } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { applyFiltersAndSort } from '../utils/productUtils';

interface ProductViewProps {
  products: Product[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function ProductView({ 
  products, 
  isLoading,
  currentPage,
  setCurrentPage,
}: ProductViewProps) {
  const [sortKey, setSortKey] = useLocalStorage<SortKey>('sortKey', 'created_at');
  const [sortOrder, setSortOrder] = useLocalStorage<SortOrder>('sortOrder', 'desc');
  const [displayMode, setDisplayMode] = useLocalStorage<'grid' | 'table'>('displayMode', 'grid');
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('itemsPerPage', 25);
  
  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const processedProducts = useMemo(() => { 
    // Return a sorted copy of the products
    return [...products].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortKey, sortOrder]);
  
  const totalPages = useMemo(() => Math.ceil(processedProducts.length / itemsPerPage), [processedProducts, itemsPerPage]);
  const paginatedProducts = useMemo(() => { const startIndex = (currentPage - 1) * itemsPerPage; return processedProducts.slice(startIndex, startIndex + itemsPerPage); }, [processedProducts, currentPage, itemsPerPage]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div></div>
      ) : (
        <>
          {processedProducts.length > 0 ? ( 
            displayMode === 'grid' ? 
              <ProductGrid products={paginatedProducts} /> : 
              <ProductTable products={paginatedProducts} /> 
          ) : ( 
            <EmptyState />
          )}
          
          {processedProducts.length > 0 && ( 
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={processedProducts.length} itemsPerPage={itemsPerPage} /> 
          )}
        </>
      )}
    </>
  );
}
