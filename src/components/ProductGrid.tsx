import React, { memo } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

interface ProductGridProps {
  products: Product[];
  favorites: Set<string>;
  onToggleFavorite: (productUrl: string) => void;
  onClearFilters: () => void;
}

function ProductGrid({ products, favorites, onToggleFavorite, onClearFilters }: ProductGridProps) {
  if (!products.length) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
      {products.map((product) => (
        <ProductCard
          key={product.url}
          product={product}
          isFavorite={favorites.has(product.url)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
