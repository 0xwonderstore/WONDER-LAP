import React, { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import InstagramCard from './InstagramCard';
import FacebookCard from './FacebookCard';
import Pagination from './Pagination';
import { EmptyState } from './EmptyState';
import { Product, InstagramPost, FacebookPost } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { Heart, Trash2, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Union type for all favorite items
type FavoriteItem = 
  | { type: 'product'; data: Product; date: number }
  | { type: 'instagram'; data: InstagramPost; date: number }
  | { type: 'facebook'; data: FacebookPost; date: number };

interface FavoritesPageProps {
  allProducts: Product[];
  instagramPosts?: InstagramPost[];
  facebookPosts?: FacebookPost[];
  onNavigateWithFilter: (filter: { store?: string }) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ 
  allProducts, 
  instagramPosts = [], 
  facebookPosts = [],
  onNavigateWithFilter 
}) => {
  const { language } = useLanguageStore();
  const t = translations[language] as any;
  const { favoriteUrls, removeAllFavorites, toggleFavorite, isFavorite } = useFavoritesStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const itemsPerPage = 12;

  // Optimized filtering and combining
  const favoriteItems = useMemo(() => {
    const favSet = new Set(favoriteUrls);
    const items: FavoriteItem[] = [];

    // 1. Products
    allProducts.forEach(p => {
        if (favSet.has(p.url)) {
            items.push({ type: 'product', data: p, date: new Date(p.created_at).getTime() });
        }
    });

    // 2. Instagram
    instagramPosts.forEach(p => {
        if (favSet.has(p.permalink)) {
            items.push({ type: 'instagram', data: p, date: new Date(p.timestamp).getTime() });
        }
    });

    // 3. Facebook
    facebookPosts.forEach(p => {
        if (favSet.has(p.permalink)) {
            items.push({ type: 'facebook', data: p, date: new Date(p.timestamp).getTime() });
        }
    });
    
    return items.sort((a, b) => {
        return sortOrder === 'newest' ? b.date - a.date : a.date - b.date;
    });
  }, [allProducts, instagramPosts, facebookPosts, favoriteUrls, sortOrder]);

  const totalPages = Math.ceil(favoriteItems.length / itemsPerPage);
  const currentItems = favoriteItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRemoveAll = () => {
    if (window.confirm(t.confirm_remove_favorites)) {
      removeAllFavorites();
    }
  };

  // Mock functions for cards (as they expect them)
  const dummyHandler = () => {};

  if (favoriteItems.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <EmptyState 
            title={t.no_favorites_title} 
            hint={t.no_favorites_hint} 
            icon={<Heart className="w-12 h-12 text-gray-300" />} 
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up container mx-auto px-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Heart className="text-red-500 fill-red-500" size={32} />
            {t.favorites_title.replace('{{count}}', favoriteItems.length.toString())}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
             {t.favorites_subtitle.replace('{{count}}', favoriteItems.length.toString())}
          </p>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
                <ArrowUpDown size={16} />
                {sortOrder === 'newest' ? t.sort_by_newest : t.sort_by_oldest}
            </button>
            
            <button
                onClick={handleRemoveAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shadow-sm border border-transparent hover:border-red-200"
            >
                <Trash2 size={16} />
                {t.removeAllFavorites}
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode='popLayout'>
            {currentItems.map((item) => (
            <motion.div
                key={item.type === 'product' ? item.data.url : item.data.permalink}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
            >
                {item.type === 'product' && (
                    <ProductCard 
                        product={item.data} 
                        t={t} 
                        onNavigateWithFilter={onNavigateWithFilter} 
                    />
                )}
                {item.type === 'instagram' && (
                    <InstagramCard 
                        post={item.data} 
                        onBlacklistToggle={dummyHandler}
                        isBlacklisted={false}
                        onHidePost={dummyHandler}
                    />
                )}
                {item.type === 'facebook' && (
                    <FacebookCard 
                        post={item.data}
                    />
                )}
            </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={favoriteItems.length}
            t={t}
          />
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
