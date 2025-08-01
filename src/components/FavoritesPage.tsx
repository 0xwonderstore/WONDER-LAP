import React from 'react';
import { Product, Locale } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';
import { translations } from '../translations';


interface FavoritesPageProps {
  allProducts: Product[];
  locale: Locale;
  onNavigateWithFilter: (filter: { store?: string; language?: string }) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, locale, onNavigateWithFilter }) => {
  const { favorites } = useFavoritesStore();
  const t = translations[locale];

  const favoriteProducts = React.useMemo(() => {
    const favoriteUrls = new Set(favorites.my_main_favorites?.products?.map(p => p.url));
    return allProducts.filter(p => favoriteUrls.has(p.url));
  }, [allProducts, favorites]);

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 text-light-text-primary dark:text-dark-text-primary">{t.favorites}</h1>
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map(p => (
            <ProductCard key={p.url} product={p} onNavigateWithFilter={onNavigateWithFilter} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default FavoritesPage;
