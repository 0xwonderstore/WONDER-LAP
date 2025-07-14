
import React, { memo } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

interface ProductGridProps {
  products: Product[];
  onClearFilters: () => void;
}

function ProductGrid({ products, onClearFilters }: ProductGridProps) {
  if (!products.length) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
      {products.map((product) => (
        <ProductCard
          key={product.url}
          product={product}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
