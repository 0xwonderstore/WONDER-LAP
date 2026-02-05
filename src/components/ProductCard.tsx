import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, EyeOff } from 'lucide-react';
import { Product } from '../types';
import { formatDate } from '../utils/productUtils';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useBlacklistStore } from '../stores/blacklistStore';
import { useToastStore } from '../stores/toastStore';
import MetaIcon from './MetaIcon';
import { WhatsappShareButton, WhatsappIcon } from 'react-share';

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

  const handleFavoriteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleFavorite(product.url);
    if (!e.target.checked) {
        showToast(t.removed_from_favorites, 'removed');
    } else {
        showToast(t.added_to_favorites, 'added');
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.url);
    // showToast(t.link_copied, 'success');
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
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
      className="animated-border-card h-full group"
    >
      <div className="card-content flex flex-col h-full bg-white dark:bg-[#111111]">
        
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
            <a href={product.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <motion.img 
                src={product.images?.[0]?.src || 'https://via.placeholder.com/400'} 
                alt={product.name} 
                className="w-full h-full object-cover" 
                loading="lazy"
                decoding="async" 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
                width={400} 
                height={400} 
            />
            </a>
            
            {/* Overlay Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300 z-10">
                {/* Bookmark Button */}
                <div onClick={(e) => e.stopPropagation()} className="glass-btn-wrapper">
                    <label className="ui-bookmark relative z-20 flex items-center justify-center w-full h-full">
                        <input type="checkbox" checked={favorite} onChange={handleFavoriteChange} />
                        <div className="bookmark">
                            <svg viewBox="0 0 32 32" className="w-full h-full p-1">
                            <path d="M6 4C4.89543 4 4 4.89543 4 6V28L16 18L28 28V6C28 4.89543 27.1046 4 26 4H6Z" />
                            </svg>
                        </div>
                    </label>
                </div>

                {/* Whatsapp Share Button */}
                <div onClick={(e) => e.stopPropagation()} className="glass-btn-wrapper overflow-hidden flex items-center justify-center">
                    <WhatsappShareButton 
                        url={product.url} 
                        title={`Check out this product: ${product.name}`}
                        separator=" - "
                        className="flex items-center justify-center w-full h-full"
                    >
                        <WhatsappIcon size={24} round={true} bgStyle={{ fill: 'transparent' }} iconFillColor="#25D366" />
                    </WhatsappShareButton>
                </div>

                {/* Copy Link Button */}
                 <button type="button" className="copy" onClick={handleCopyLink}>
                    <span className="tooltip" data-text-initial="Copy link" data-text-end="Copied!"></span>
                    <span className="clipboard">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                           <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </span>
                    <span className="checkmark">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                </button>
                
                {product.images?.[0]?.src && (
                    <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={imageSearchUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="glass-btn-wrapper"
                        title={t.searchWithImage}
                    >
                        <Search className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </motion.a>
                )}
                
                {storeUrl && (
                    <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={adLibraryUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="glass-btn-wrapper"
                        title={t.searchInAdLibrary}
                    >
                        <MetaIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </motion.a>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow relative z-10">
            <div className="mb-auto">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-snug line-clamp-2 mb-3 hover:text-brand-primary transition-colors">
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
                
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(product.created_at)}</span>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(ProductCard);
