import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import { EmptyState } from './EmptyState';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { normalizeUrl } from '../utils/urlUtils';
import Pagination from './Pagination';

interface FavoritesPageProps {
  allProducts: Product[];
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, onNavigateWithFilter }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { favoriteUrls } = useFavoritesStore();

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 48;

  const { favoriteProducts, paginatedProducts, totalPages, totalItems } = useMemo(() => {
    const filtered = allProducts
      .filter(p => favoriteUrls.has(normalizeUrl(p.url)))
      .sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    
    const total = filtered.length;
    const pages = Math.ceil(total / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      favoriteProducts: filtered,
      paginatedProducts: paginated,
      totalPages: pages,
      totalItems: total,
    };
  }, [allProducts, favoriteUrls, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 text-light-text-primary dark:text-dark-text-primary">
        {t.favorites_title.replace('{count}', totalItems.toString())}
      </h1>
      
      {favoriteProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map(p => (
              <ProductCard 
                key={p.url} 
                product={p}
                t={t}
                onNavigateWithFilter={onNavigateWithFilter}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={productsPerPage}
            t={t}
          />
        </>
      ) : (
        <EmptyState 
            title={t.no_favorites_title}
            hint={t.no_favorites_hint}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
