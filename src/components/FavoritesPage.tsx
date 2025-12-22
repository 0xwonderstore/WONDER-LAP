import React, { useMemo, useState } from 'react';
import { Product, InstagramPost } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import InstagramCard from './InstagramCard';
import { EmptyState } from './EmptyState';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { normalizeUrl } from '../utils/urlUtils';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';
import { ChevronDown, Search, XCircle, Heart, Star } from 'lucide-react';
import Pagination from './Pagination';
import Select from './Select';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { loadInstagramPosts } from '../utils/instagramLoader';

interface FavoritesPageProps {
  allProducts: Product[];
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}

const CollapsibleSection = ({ title, count, children, controls, defaultExpanded = true }: { title: string, count: number, children: React.ReactNode, controls?: React.ReactNode, defaultExpanded?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl"
    >
        <div className="px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-800">
             <div className="flex items-center gap-4 w-full md:w-auto cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
                 <div className={`p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm text-gray-400 group-hover:text-brand-primary transition-all duration-300 group-hover:scale-110 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={22} />
                 </div>
                 <div className="flex items-center gap-3">
                     <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-brand-primary transition-colors">{title}</h2>
                     <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                         {count}
                     </span>
                 </div>
             </div>
             
             {controls && (
                <div className="w-full md:w-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    {controls}
                </div>
             )}
        </div>
        
        <AnimatePresence initial={false}>
            {isExpanded && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                >
                    <div className="p-8 border-t border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
};

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, onNavigateWithFilter }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { favoriteUrls } = useFavoritesStore();
  const { blacklistedUsers, addUser, removeUser } = useInstagramBlacklistStore();

  const { data: instagramPosts = [] } = useQuery({
    queryKey: ['instagramPosts'],
    queryFn: loadInstagramPosts,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const [productPage, setProductPage] = useState(1);
  const [instagramPage, setInstagramPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const itemsPerPage = 20;

  const handleBlacklistToggle = (username: string) => {
    if (blacklistedUsers.has(username)) removeUser(username);
    else addUser(username);
  };

  const favoriteProducts = useMemo(() => {
    // Optimization: Create a Set of normalized favorite URLs once
    const normalizedFavs = new Set<string>();
    favoriteUrls.forEach(url => normalizedFavs.add(normalizeUrl(url)));
    
    return allProducts.filter(p => normalizedFavs.has(normalizeUrl(p.url)));
  }, [allProducts, favoriteUrls]);

  const favoriteInstagramPosts = useMemo(() => {
      const normalizedFavs = new Set<string>();
      favoriteUrls.forEach(url => normalizedFavs.add(normalizeUrl(url)));

      return instagramPosts.filter(p => normalizedFavs.has(normalizeUrl(p.permalink)));
  }, [instagramPosts, favoriteUrls]);
  
  const uniqueStores = useMemo(() => {
    const storeSet = new Set(favoriteProducts.map(p => p.vendor).filter(Boolean));
    return [{ value: 'all', label: t.allStores }, ...Array.from(storeSet).sort().map(s => ({ value: s, label: s }))];
  }, [favoriteProducts, t.allStores]);

  const filteredAndSortedProducts = useMemo(() => {
    let products = favoriteProducts;
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      products = products.filter(p => (p.name || '').toLowerCase().includes(lowerSearch));
    }
    
    if (storeFilter !== 'all') {
      products = products.filter(p => p.vendor === storeFilter);
    }
    
    // Create a copy before sorting to avoid mutating the original array (though useMemo helps)
    return [...products].sort((a, b) => {
      if (!a.created_at || !b.created_at) return 0;
      switch(sortOption) {
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Newest
      }
    });
  }, [favoriteProducts, searchTerm, storeFilter, sortOption]);

  // Reset pagination when filters change
  React.useEffect(() => {
      setProductPage(1);
  }, [searchTerm, storeFilter, sortOption]);


  // Pagination Logic
  const productTotalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);

  const instagramTotalPages = Math.ceil(favoriteInstagramPosts.length / itemsPerPage);
  const paginatedInstagramPosts = favoriteInstagramPosts.slice((instagramPage - 1) * itemsPerPage, instagramPage * itemsPerPage);

  const hasFavorites = favoriteProducts.length > 0 || favoriteInstagramPosts.length > 0;
  const totalItems = favoriteProducts.length + favoriteInstagramPosts.length;
  
  const productControls = (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="relative w-full sm:w-64 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors duration-300" />
            <input 
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100 shadow-sm"
            />
             {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                    <XCircle size={16} />
                </button>
            )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Select 
                options={uniqueStores}
                value={storeFilter}
                onChange={setStoreFilter}
                className="w-full sm:w-48 text-sm !rounded-xl !py-2.5 shadow-sm"
            />
            <Select 
                options={[{ value: 'newest', label: t.sort_by_newest }, { value: 'oldest', label: t.sort_by_oldest }]}
                value={sortOption}
                onChange={setSortOption}
                className="w-full sm:w-48 text-sm !rounded-xl !py-2.5 shadow-sm"
            />
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up pb-24 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary/5 via-purple-500/5 to-pink-500/5 dark:from-brand-primary/10 dark:via-purple-500/10 dark:to-pink-500/10 p-8 sm:p-12 border border-white/50 dark:border-white/10 shadow-lg">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-2"
                >
                   <div className="bg-gradient-to-r from-brand-primary to-pink-500 p-2 rounded-lg text-white shadow-lg shadow-brand-primary/20">
                      <Heart size={24} className="fill-current" />
                   </div>
                   <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white tracking-tight">
                    {t.favorites}
                   </h1>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed"
                >
                    {t.favorites_subtitle?.replace('{count}', totalItems.toString()) || `You have saved ${totalItems} items to your personal collection.`}
                </motion.p>
            </div>
            
            {hasFavorites && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.2 }}
                 className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
               >
                  <Star className="text-yellow-400 fill-current w-5 h-5" />
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {t.saved_items_badge?.replace('{count}', totalItems.toString()) || `${totalItems} Saved Items`}
                  </span>
               </motion.div>
            )}
         </div>
      </div>
      
      {hasFavorites ? (
        <div className="flex flex-col gap-8">
            {favoriteProducts.length > 0 && (
                <CollapsibleSection 
                    title={t.products} 
                    count={filteredAndSortedProducts.length} 
                    controls={productControls}
                >
                    {filteredAndSortedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedProducts.map((p, index) => (
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      key={p.url}
                                    >
                                       <ProductCard product={p} t={t} onNavigateWithFilter={onNavigateWithFilter} />
                                    </motion.div>
                                ))}
                            </div>
                            {productTotalPages > 1 && (
                                <div className="mt-12 flex justify-center">
                                    <Pagination currentPage={productPage} totalPages={productTotalPages} onPageChange={setProductPage} totalItems={filteredAndSortedProducts.length} itemsPerPage={itemsPerPage} t={t} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                <Search size={32} className="text-gray-400" />
                             </div>
                             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.search_no_results_title || t.noResults}</h3>
                             <p className="text-gray-500 max-w-xs mb-6">{t.search_no_results_desc || "We couldn't find any products matching your current filters."}</p>
                             <button 
                               onClick={() => { setSearchTerm(''); setStoreFilter('all'); }} 
                               className="px-6 py-2 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all hover:scale-105 active:scale-95 font-medium"
                             >
                                 {t.clearFilters || "Clear all filters"}
                             </button>
                        </div>
                    )}
                </CollapsibleSection>
            )}

            {favoriteInstagramPosts.length > 0 && (
                <CollapsibleSection 
                    title={t.instagram_feature} 
                    count={favoriteInstagramPosts.length}
                >
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedInstagramPosts.map((p, index) => (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              key={p.permalink}
                            >
                                <InstagramCard post={p} onBlacklistToggle={handleBlacklistToggle} isBlacklisted={blacklistedUsers.has(p.username)} />
                            </motion.div>
                        ))}
                     </div>
                     {instagramTotalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <Pagination currentPage={instagramPage} totalPages={instagramTotalPages} onPageChange={setInstagramPage} totalItems={favoriteInstagramPosts.length} itemsPerPage={itemsPerPage} t={t} />
                        </div>
                    )}
                </CollapsibleSection>
            )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
            <EmptyState title={t.no_favorites_title} hint={t.no_favorites_hint} />
        </motion.div>
      )}
    </div>
  );
};

export default FavoritesPage;
