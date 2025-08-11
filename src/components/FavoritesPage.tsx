import React, { useMemo } from 'react';
import { Product } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import { EmptyState } from './EmptyState';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { normalizeUrl } from '../utils/urlUtils';

interface FavoritesPageProps {
  allProducts: Product[];
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, onNavigateWithFilter }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { favorites } = useFavoritesStore();

  const favoriteProducts = useMemo(() => {
    const favoriteUrls = new Set(favorites.my_main_favorites.products.map(normalizeUrl));
    return allProducts
      .filter(p => favoriteUrls.has(normalizeUrl(p.url)))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allProducts, favorites]);

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 text-light-text-primary dark:text-dark-text-primary">
        {t.favorites}
      </h1>
      
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map(p => (
            <ProductCard 
              key={p.url} 
              product={p}
              t={t}
              onNavigateWithFilter={onNavigateWithFilter}
            />
          ))}
        </div>
      ) : (
        <EmptyState t={t} />
      )}
    </div>
  );
};

export default FavoritesPage;
