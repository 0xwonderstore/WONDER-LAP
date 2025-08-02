import React, { useState, memo } from 'react';
import { Calendar, Heart } from 'lucide-react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';
import { useFavoritesStore } from '../stores/favoritesStore';
import { normalizeUrl } from '../utils/urlUtils';

interface ProductCardProps {
  product: Product;
  onNavigateWithFilter: (filter: { store?: string }) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigateWithFilter }) => {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const isFavorite = favorites.my_main_favorites?.products.includes(normalizeUrl(product.url));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.url);
  };

  return (
    <div className="group relative bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-light-background dark:bg-dark-background">
        <a href={product.url} target="_blank" rel="noopener noreferrer">
          <img src={product.images?.[0]?.src || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        </a>
        <div className="absolute top-3 right-3">
            <button onClick={handleFavoriteClick} className="p-1.5 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full" aria-label="Toggle Favorite">
                <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
            </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2 h-14 line-clamp-2 flex-grow">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
            {product.store?.name && (<div className="text-sm font-medium text-brand-primary cursor-pointer hover:underline" onClick={() => onNavigateWithFilter({ store: product.store.name })}>{product.store.name}</div>)}
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(product.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(ProductCard);
