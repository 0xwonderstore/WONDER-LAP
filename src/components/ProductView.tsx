import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product } from '../types';
import ProductTable from './ProductTable';
import { EmptyState } from './EmptyState';
import Pagination from './Pagination';
import FilterComponent from './FilterComponent';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ProductCard from './ProductCard';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { searchProducts } from '../utils/productUtils';

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
  const [date, setDate] = useState<DateRange | undefined>(undefined);
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
      // Reset date when applying new filters from another page
      setDate(undefined); 
      setCurrentPage(1);
      onClearInitialFilters();
    }
  }, [initialFilters, onClearInitialFilters, setCurrentPage]);

  const handleFilterChange = useCallback((filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  }, [setCurrentPage]);
  
  const handleProductsPerPageChange = useCallback((value: number) => {
    setProductsPerPage(value);
    setCurrentPage(1);
  }, [setProductsPerPage, setCurrentPage]);

  const handleResetFilters = useCallback(() => {
    setFilters({ name: '', store: '', language: '' });
    setDate(undefined);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    products.forEach(p => {
      if (p.language) {
        langs.add(p.language);
      }
    });
    return Array.from(langs);
  }, [products]);
  
  const languageCounts = useMemo(() => {
      const counts: { [key: string]: number } = {};
      products.forEach(p => {
        if (p.language) {
          counts[p.language] = (counts[p.language] || 0) + 1;
        }
      });
      return counts;
  }, [products]);

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
    
    if (date?.from) {
      const from = startOfDay(date.from);
      const to = date.to ? endOfDay(date.to) : endOfDay(date.from);
      filtered = filtered.filter(p => {
        if (!p.created_at) return false;
        try {
          const productDate = parseISO(p.created_at);
          return productDate >= from && productDate <= to;
        } catch (error) {
          // In case of invalid date string
          return false;
        }
      });
    }

    return filtered.sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    });
  }, [products, filters, date]);

  const totalPages = Math.ceil(processedProducts.length / productsPerPage);
  const currentProducts = processedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const handlePageChange = (page: number) => { setCurrentPage(page); };
  
  return (
    <div className="animate-fade-in-up">
       <FilterComponent
        t={t}
        stores={stores}
        languages={availableLanguages}
        languageCounts={languageCounts}
        filters={filters}
        date={date}
        setDate={setDate}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        productsPerPage={productsPerPage}
        onProductsPerPageChange={handleProductsPerPageChange}
      />

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
          />
        </>
      ) : (
        <EmptyState title={t.noResults} hint={t.noResultsHint} />
      )}
    </div>
  );
};

export default ProductView;
