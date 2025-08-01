
import React, { memo } from 'react';
import { Product, Locale } from '../types';
import { formatDate } from '../utils/productUtils';
import { translations } from '../translations';
import { useFavoritesStore } from '../stores/favoritesStore';
import { Heart, ExternalLink, Search } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onNavigateWithFilter: (filter: { store?: string, name?: string }) => void;
  locale: Locale;
}

function ProductTable({ products, onNavigateWithFilter, locale }: ProductTableProps) {
  const t = translations[locale];
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const favoriteProductUrls = new Set(favorites.my_main_favorites?.products.map(p => p.url));

  const handleStoreClick = (storeName: string | undefined) => {
    if (storeName) {
      onNavigateWithFilter({ store: storeName });
    }
  };
  
  const handleFindSimilar = (productName: string) => {
    // Basic similarity: extract first 2-3 words.
    const similarName = productName.split(' ').slice(0, 2).join(' ');
    onNavigateWithFilter({ name: similarName });
  }

  const ActionButton = ({ onClick, children, tooltip }: { onClick: () => void; children: React.ReactNode; tooltip: string }) => (
    <div className="relative group inline-block">
      <button onClick={onClick} className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
        {children}
      </button>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover:scale-100">
        {tooltip}
      </div>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-lg shadow-md animate-fade-in bg-light-surface dark:bg-dark-surface">
      <table className="w-full text-right">
        <thead className="bg-light-background dark:bg-dark-background">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">{t.product_header}</th>
            <th className="px-6 py-3 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">{t.store_header}</th>
            <th className="px-6 py-3 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">{t.dateAdded_header}</th>
            <th className="px-6 py-3 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider text-center">{t.actions_header}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border dark:divide-dark-border">
          {products.map((product) => {
            const isFavorite = favoriteProductUrls.has(product.url);
            return (
              <tr key={product.url} className="hover:bg-light-background dark:hover:bg-dark-background transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={product.images?.[0]?.src || 'https://via.placeholder.com/100'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        loading="lazy"
                      />
                    </a>
                    <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {product.store?.name ? (
                    <span 
                      className="font-medium text-brand-primary cursor-pointer hover:underline"
                      onClick={() => handleStoreClick(product.store?.name)}
                    >
                      {product.store.name}
                    </span>
                  ) : (
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">{product.vendor}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{formatDate(product.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                     <ActionButton
                        onClick={() => isFavorite ? removeFavorite(product.url) : addFavorite(product)}
                        tooltip={isFavorite ? t.removeFromFavorites : t.addToFavorites}
                    >
                        <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                    </ActionButton>
                    <ActionButton onClick={() => handleFindSimilar(product.name)} tooltip={t.findSimilar}>
                        <Search className="w-5 h-5 text-gray-500" />
                    </ActionButton>
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover transition-colors inline-block relative group">
                        <ExternalLink className="w-5 h-5 text-brand-primary" />
                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover:scale-100">
                           {t.viewOnStore}
                        </div>
                    </a>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}

export default memo(ProductTable);
