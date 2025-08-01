import React, { useState, memo } from 'react';
import { Calendar, Camera, Heart } from 'lucide-react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';
import MetaIcon from './MetaIcon';
import { useFavoritesStore } from '../stores/favoritesStore';
import { normalizeUrl } from '../utils/urlUtils';

interface ProductCardProps {
  product: Product;
  onNavigateWithFilter: (filter: { store?: string }) => void;
}

function ProductCard({ product, onNavigateWithFilter }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { favorites, toggleFavorite } = useFavoritesStore();

  const normalizedProductUrl = normalizeUrl(product.url);
  const isFavorite = favorites.my_main_favorites?.products.includes(normalizedProductUrl) ?? false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.url);
  };

  const getImageUrl = () => {
    if (imageError || !product.images?.length) {
      return 'https://via.placeholder.com/400';
    }
    return product.images[0].src;
  };

  const handleStoreClick = () => {
    if (product.store && product.store.name) {
      onNavigateWithFilter({ store: product.store.name });
    }
  };
  
  const getReverseImageSearchUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('https://via.placeholder.com')) return '#';
    const encodedUrl = encodeURIComponent(imageUrl);
    return `https://lens.google.com/uploadbyurl?url=${encodedUrl}`;
  };

  const getAdLibraryUrl = (storeName: string | undefined) => {
    if (!storeName) return '#';
    const query = encodeURIComponent(storeName);
    return `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${query}&search_type=keyword_unordered&media_type=all`;
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

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="group/tooltip relative">
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
              <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover/tooltip:scale-100 whitespace-nowrap">
                  Search with Google Lens
              </div>
          </div>
          {product.store?.name && (
            <div className="group/tooltip relative">
              <a
                href={getAdLibraryUrl(product.store.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 inline-block"
                aria-label="Go to Ad Library"
              >
                <MetaIcon className="w-5 h-5" />
              </a>
              <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover/tooltip:scale-100 whitespace-nowrap">
                {product.store.name} Ad Library
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2 h-14 line-clamp-2 text-right flex-grow">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          {product.store?.name && (
            <div 
              className="text-sm font-medium text-brand-primary cursor-pointer hover:underline" 
              onClick={handleStoreClick}
            >
              {product.store.name}
            </div>
          )}
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
