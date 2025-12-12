import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, Search, EyeOff, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useBlacklistStore } from '../stores/blacklistStore';
import { useToastStore } from '../stores/toastStore';
import MetaIcon from './MetaIcon';

interface ProductCardProps {
  product: Product;
  t: any;
  onNavigateWithFilter: (filter: { store?: string }) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, t, onNavigateWithFilter }) => {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { addStore } = useBlacklistStore();
  const { showToast } = useToastStore();
  const favorite = isFavorite(product.url);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.url);
    
    if (!favorite) {
        showToast(t.added_to_favorites, 'added');
    } else {
        showToast(t.removed_from_favorites, 'removed');
    }
  };

  const handleBlockStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.store?.url) {
      addStore(product.store.url);
    } else if (product.vendor) {
      addStore(product.vendor);
    }
  };
  
  const storeUrl = product.store?.url ? new URL(product.store.url).origin : new URL(product.url).origin;
  const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(storeUrl)}&search_type=keyword_unordered&media_type=all`;
  const imageSearchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(product.images?.[0]?.src || '')}`;

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: '0px 5px 15px rgba(0,0,0,0.2)' }}
      className="group relative bg-white dark:bg-[#111111] rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-[#222] flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
        <a href={product.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          <motion.img 
            src={product.images?.[0]?.src || 'https://via.placeholder.com/400'} 
            alt={product.name} 
            className="w-full h-full object-cover" 
            loading="lazy"
            decoding="async" 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5 }}
          />
        </a>
        
        {/* Overlay Buttons (Visible on Hover or when fav) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
            <motion.button 
                onClick={handleFavoriteClick} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 
                  ${favorite ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-black/60 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-black/80'}`}
                aria-label="Toggle Favorite"
            >
                <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
            </motion.button>
            
            {product.images?.[0]?.src && (
                <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={imageSearchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-200 shadow-lg hover:bg-white dark:hover:bg-black/80 transition-all duration-300 delay-75"
                    title={t.searchWithImage}
                >
                    <Search className="w-5 h-5" />
                </motion.a>
            )}
            
            {storeUrl && (
                 <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={adLibraryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-200 shadow-lg hover:bg-white dark:hover:bg-black/80 transition-all duration-300 delay-100"
                    title={t.searchInAdLibrary}
                >
                    <MetaIcon className="w-5 h-5" />
                </motion.a>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow relative z-10 bg-white dark:bg-[#111111]">
        <div className="mb-auto">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-snug line-clamp-2 mb-3 group-hover:text-brand-primary transition-colors">
                <a href={product.url} target="_blank" rel="noopener noreferrer">{product.name}</a>
            </h3>
            
            <div className="flex items-center justify-between">
                 {product.store?.name && (
                    <div className="flex items-center gap-2 max-w-[70%]">
                        <div 
                            className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-primary cursor-pointer truncate transition-colors"
                            onClick={() => onNavigateWithFilter({ store: product.store.name })}
                        >
                            {product.store.name}
                        </div>
                    </div>
                )}
                 <div className="flex items-center gap-1">
                    <button
                        onClick={handleBlockStore}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title={`${t.block_store} ${product.store?.name}`}
                    >
                        <EyeOff size={16} />
                    </button>
                 </div>
            </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#222] flex justify-between items-center">
             <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{product.language?.toUpperCase()}</span>
             
             {/* Date replaced Show button */}
             <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(product.created_at)}</span>
             </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(ProductCard);
