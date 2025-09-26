import React, { memo } from 'react';
import { Calendar, Heart, Search, EyeOff } from 'lucide-react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useBlacklistStore } from '../stores/blacklistStore';
import { normalizeUrl } from '../utils/urlUtils';
import MetaIcon from './MetaIcon';

interface ProductCardProps {
  product: Product;
  t: any;
  onNavigateWithFilter: (filter: { store?: string }) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, t, onNavigateWithFilter }) => {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { addStore } = useBlacklistStore();
  const isFavorite = favorites.my_main_favorites?.products.includes(normalizeUrl(product.url));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product.url);
  };

  const handleBlockStore = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (product.store?.url) {
      addStore(product.store.url);
    } else if (product.vendor) {
      addStore(product.vendor);
    }
  };

  const storeUrl = product.store?.url ? new URL(product.store.url).origin : new URL(product.url).origin;
  const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(storeUrl)}&search_type=keyword_unordered&media_type=all`;
  const imageSearchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(product.images?.[0]?.src || '')}`;

  const buttonClasses = "p-1.5 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full transition-colors duration-200 hover:bg-white dark:hover:bg-black/70";

  return (
    <div className="group relative bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-light-background dark:bg-dark-background">
        <a href={product.url} target="_blank" rel="noopener noreferrer">
          <img src={product.images?.[0]?.src || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        </a>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button onClick={handleFavoriteClick} className={buttonClasses} aria-label="Toggle Favorite">
                <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
            </button>
            {product.images?.[0]?.src && (
                <a href={imageSearchUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses} title={t.searchWithImage}>
                    <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
            )}
            {storeUrl && (
                 <a href={adLibraryUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses} title={t.searchInAdLibrary}>
                    <MetaIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
            )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2 h-14 line-clamp-2 flex-grow">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
            {product.store?.name && (
              <div className="flex items-center gap-2 truncate">
                <div 
                  className="text-sm font-medium text-brand-primary cursor-pointer hover:underline truncate" 
                  onClick={() => onNavigateWithFilter({ store: product.store.name })}
                  title={product.store.name}
                >
                  {product.store.name}
                </div>
                <button
                  onClick={handleBlockStore}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  title={`${t.block_store} ${product.store.name}`}
                >
                  <EyeOff size={16} />
                </button>
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
};

export default memo(ProductCard);
