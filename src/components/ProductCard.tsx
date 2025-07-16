import React, { useState, memo } from 'react';
import { Calendar, Heart, Camera } from 'lucide-react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (productUrl: string) => void;
}

function ProductCard({ product, isFavorite, onToggleFavorite }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (imageError || !product.images?.length) {
      return 'https://via.placeholder.com/400';
    }
    return product.images[0].src;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleFavorite(product.url);
  };
  
  // --- FIX: Use Google Lens for a more reliable and comprehensive search ---
  const getReverseImageSearchUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('https://via.placeholder.com')) return '#';
    const encodedUrl = encodeURIComponent(imageUrl);
    return `https://lens.google.com/uploadbyurl?url=${encodedUrl}`;
  };

  return (
    <div className="group relative bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-light-background dark:bg-dark-background">
        <a href={product.url} target="_blank" rel="noopener noreferrer">
          <img
            src={getImageUrl()}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </a>
        
        {/* Favorite Button */}
        <div className="absolute top-3 right-3">
            <button
            onClick={handleFavoriteClick}
            className="p-1.5 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Toggle Favorite"
            >
            <Heart 
                className={`w-5 h-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} 
                strokeWidth={isFavorite ? 2 : 2.5}
            />
            </button>
        </div>

        {/* Reverse Image Search Button */}
        <div className="absolute top-3 left-3 group/tooltip">
            <a
                href={getReverseImageSearchUrl(getImageUrl())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { if (getImageUrl().startsWith('https://via.placeholder.com')) e.preventDefault(); }}
                className="p-1.5 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 inline-block"
                aria-label="Search image with Google Lens"
            >
                <Camera className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </a>
            <div className="absolute top-full mt-2 -left-1/2 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover/tooltip:scale-100">
                Search with Google Lens
            </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2 h-14 line-clamp-2 text-right flex-grow">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            {product.store?.name}
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
