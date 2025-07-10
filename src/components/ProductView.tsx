import React, { useMemo, useCallback } from 'react';
import ProductGrid from './ProductGrid';
import ProductTable from './ProductTable';
import FilterPanel from './FilterPanel';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { Product, FilterConfig, SortKey, SortOrder } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { applyFiltersAndSort } from '../utils';
import { isClothingProduct } from '../utils/clothingFilter';

const INITIAL_FILTERS: FilterConfig = {
  title: '',
  vendor: '',
  dateRange: 'all',
  customStartDate: '',
  customEndDate: ''
};
const INITIAL_SORT_KEY: SortKey = 'created_at';
const INITIAL_SORT_ORDER: SortOrder = 'desc';

interface ProductViewProps {
  products: Product[];
  isLoading: boolean;
  showOnlyFavorites: boolean;
  hideClothing: boolean;
  onClearFilters: () => void;
}

export default function ProductView({ products, isLoading, showOnlyFavorites, hideClothing, onClearFilters }: ProductViewProps) {
  const [filters, setFilters] = useLocalStorage<FilterConfig>('filters', INITIAL_FILTERS);
  const [sortKey, setSortKey] = useLocalStorage<SortKey>('sortKey', INITIAL_SORT_KEY);
  const [sortOrder, setSortOrder] = useLocalStorage<SortOrder>('sortOrder', INITIAL_SORT_ORDER);
  const [displayMode, setDisplayMode] = useLocalStorage<'grid' | 'table'>('displayMode', 'grid');
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('itemsPerPage', 25);
  const [currentPage, setCurrentPage] = useLocalStorage<number>('currentPage', 1);

  const [favorites, toggleFavorite] = useFavorites();

  const handleFilterChange = useCallback((newFilters: Partial<FilterConfig>) => { setFilters(prev => ({ ...prev, ...newFilters })); setCurrentPage(1); }, [setFilters, setCurrentPage]);
  const handleSortKeyChange = useCallback((key: SortKey) => { setSortKey(key); setCurrentPage(1); }, [setSortKey, setCurrentPage]);
  const handleSortOrderChange = useCallback((order: SortOrder) => { setSortOrder(order); setCurrentPage(1); }, [setSortOrder, setCurrentPage]);
  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const processedProducts = useMemo(() => { 
    let baseProducts = products;
    if (hideClothing) { baseProducts = baseProducts.filter(p => !isClothingProduct(p.title)); }
    if (showOnlyFavorites) { baseProducts = baseProducts.filter(p => favorites.has(p.url)); }
    return applyFiltersAndSort(baseProducts, filters, sortKey, sortOrder); 
  }, [products, filters, sortKey, sortOrder, showOnlyFavorites, favorites, hideClothing]);
  
  const totalPages = useMemo(() => Math.ceil(processedProducts.length / itemsPerPage), [processedProducts, itemsPerPage]);
  const paginatedProducts = useMemo(() => { const startIndex = (currentPage - 1) * itemsPerPage; return processedProducts.slice(startIndex, startIndex + itemsPerPage); }, [processedProducts, currentPage, itemsPerPage]);

  return (
    <>
      <FilterPanel filters={filters} onFilterChange={handleFilterChange} onClearFilters={onClearFilters} products={products} sortKey={sortKey} onSortKeyChange={handleSortKeyChange} sortOrder={sortOrder} onSortOrderChange={handleSortOrderChange} displayMode={displayMode} onDisplayModeChange={setDisplayMode} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} />
      {isLoading ? (<div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div></div>) : (
        <>
          {processedProducts.length > 0 ? ( displayMode === 'grid' ? <ProductGrid products={paginatedProducts} favorites={favorites} onToggleFavorite={toggleFavorite} onClearFilters={onClearFilters} /> : <ProductTable products={paginatedProducts} favorites={favorites} onToggleFavorite={toggleFavorite} onClearFilters={onClearFilters} /> ) : ( <EmptyState onClearFilters={onClearFilters} /> )}
          {processedProducts.length > 0 && ( <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={processedProducts.length} itemsPerPage={itemsPerPage} /> )}
        </>
      )}
    </>
  );
}
