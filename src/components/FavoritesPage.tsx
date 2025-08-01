import React from 'react';
import { Product, Locale } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import { translations } from '../translations';
import { Heart, ShoppingBag } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface FavoritesPageProps {
  allProducts: Product[];
  locale: Locale;
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
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
      <h1 className="text-3xl font-bold mb-8 text-light-text-primary dark:text-dark-text-primary">{t.myFavorites}</h1>
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map(p => (
            <ProductCard key={p.url} product={p} onNavigateWithFilter={onNavigateWithFilter} />
          ))}
        </div>
      ) : (
        <EmptyState
            icon={<Heart className="w-20 h-20 text-red-300" />}
            title={t.noFavoritesYet}
            description={t.noFavoritesHint}
            buttonText={t.findSomeProducts}
            onButtonClick={() => onNavigateWithFilter({})}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
