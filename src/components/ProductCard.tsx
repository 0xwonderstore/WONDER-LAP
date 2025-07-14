
import React, { useState, memo } from 'react';
import { Calendar } from 'lucide-react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (imageError || !product.images?.length) return 'https://via.placeholder.com/400';
    return product.images[0].src;
  };
  
  return (
    <div className="group relative bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
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
