import React, { useState, memo } from 'react';
import { ShoppingCart, Calendar, Heart } from 'lucide-react';
import { Product } from '../types';
import { formatDate } from '../utils';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (productUrl: string) => void;
}

function ProductCard({ product, isFavorite, onToggleFavorite }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (imageError || !product.images?.length) return 'https://via.placeholder.com/400';
    return product.images[0].src;
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleFavorite(product.url);
  }

  return (
    <div className="group relative bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <button
        onClick={handleFavoriteClick}
        aria-label="Toggle Favorite"
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
      >
        <Heart className={`w-6 h-6 transition-all ${isFavorite ? 'text-brand-danger fill-current' : 'text-white'}`} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-light-background dark:bg-dark-background">
        <a href={product.url} target="_blank" rel="noopener noreferrer">
            <img
            src={getImageUrl()}
            alt={product.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            />
        </a>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2 h-14 line-clamp-2 text-right">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            {product.vendor}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(product.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
