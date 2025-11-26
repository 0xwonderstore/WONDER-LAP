
import React, { memo } from 'react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';
import { ExternalLink, Search, ImageIcon } from 'lucide-react';
import MetaIcon from './MetaIcon';

interface ProductTableProps {
  products: Product[];
  t: any;
  onNavigateWithFilter: (filter: { store?: string }) => void;
}

function ProductTable({ products, t, onNavigateWithFilter }: ProductTableProps) {
  
  const handleStoreClick = (storeName: string | undefined) => {
    if (storeName) {
      onNavigateWithFilter({ store: storeName });
    }
  };

  return (
    <div className="overflow-x-auto rounded-3xl shadow-md animate-fade-in bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <table className="w-full text-right">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.product}</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.store}</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.date}</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">{t.show}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {products.map((product) => {
             const storeUrl = product.store?.url ? new URL(product.store.url).origin : new URL(product.url).origin;
             const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(storeUrl)}&search_type=keyword_unordered&media_type=all`;
             const imageSearchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(product.images?.[0]?.src || '')}`;

            return (
              <tr key={product.url} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img
                        src={product.images?.[0]?.src || 'https://via.placeholder.com/100'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-600"
                        loading="lazy"
                      />
                    </a>
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 dark:text-gray-100 hover:text-brand-primary transition-colors line-clamp-2 max-w-xs block">
                        {product.name}
                    </a>
                  </div>
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm"
                >
                  {product.store?.name ? (
                    <span 
                      className="font-medium text-brand-primary cursor-pointer hover:underline"
                      onClick={() => handleStoreClick(product.store?.name)}
                    >
                      {product.store.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">Unknown</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(product.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    <a 
                        href={product.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={t.show}
                    >
                        <ExternalLink className="w-5 h-5" />
                    </a>
                    {product.images?.[0]?.src && (
                        <a 
                            href={imageSearchUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={t.searchWithImage}
                        >
                            <Search className="w-5 h-5" />
                        </a>
                    )}
                    <a 
                        href={adLibraryUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={t.searchInAdLibrary}
                    >
                        <MetaIcon className="w-5 h-5" />
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
