
import React, { memo } from 'react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';

interface ProductTableProps {
  products: Product[];
  onNavigateWithFilter: (filter: { store?: string }) => void;
}

function ProductTable({ products, onNavigateWithFilter }: ProductTableProps) {
  
  const handleStoreClick = (storeName: string | undefined) => {
    if (storeName) {
      onNavigateWithFilter({ store: storeName });
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md animate-fade-in bg-light-surface dark:bg-dark-surface">
      <table className="w-full text-right">
        <thead className="bg-light-background dark:bg-dark-background">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">المنتج</th>
            <th className="px-6 py-3 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">المتجر</th>
            <th className="px-6 py-3 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">تاريخ الإضافة</th>
            <th className="px-6 py-3 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border dark:divide-dark-border">
          {products.map((product) => {
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
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">غير معروف</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{formatDate(product.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-primary-dark">
                    عرض المنتج
                  </a>
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
