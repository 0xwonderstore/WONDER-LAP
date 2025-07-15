import React, { memo } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

interface ProductGridProps {
  products: Product[];
  favorites: string[];
  onToggleFavorite: (productUrl: string) => void;
}

function ProductGrid({ products, favorites, onToggleFavorite }: ProductGridProps) {
  if (!products.length) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
      {products.map((product) => (
        <ProductCard
          key={product.url} // Use url as the key since it's unique
          product={product}
          // --- FIX: Check for favorite using product.url ---
          isFavorite={favorites.includes(product.url)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
