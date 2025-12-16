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
import { ChevronDown, ChevronUp, Search, XCircle, Trash2 } from 'lucide-react';
import Pagination from './Pagination';
import Select from './Select';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { loadInstagramPosts } from '../utils/instagramLoader';

interface FavoritesPageProps {
  allProducts: Product[];
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}

const CollapsibleSection = ({ title, count, children, controls, defaultExpanded = true, onClear }: { title: string, count: number, children: React.ReactNode, controls?: React.ReactNode, defaultExpanded?: boolean, onClear?: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                 <button 
                     onClick={() => setIsExpanded(!isExpanded)}
                     className="flex items-center gap-3 group"
                 >
                     <div className={`p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-brand-primary transition-colors duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} />
                     </div>
                     <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-brand-primary transition-colors">{title}</h2>
                     <span className="bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full text-sm font-bold">
                         {count}
                     </span>
                 </button>
                 {onClear && (
                   <button onClick={onClear} className="sm:hidden text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors" title="Clear Section">
                     <Trash2 size={18} />
                   </button>
                 )}
             </div>
             <div className="flex items-center gap-3 w-full sm:w-auto">
                 {controls}
                 {onClear && (
                   <button onClick={onClear} className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">
                     <Trash2 size={16} />
                     Clear
                   </button>
                 )}
             </div>
        </div>
        
        <AnimatePresence initial={false}>
            {isExpanded && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, onNavigateWithFilter }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { favoriteUrls, toggleFavorite } = useFavoritesStore();
  const { blacklistedUsers, addUser, removeUser } = useInstagramBlacklistStore();

  const { data: instagramPosts = [] } = useQuery({
    queryKey: ['instagramPosts'],
    queryFn: loadInstagramPosts,
    staleTime: Infinity,
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
  
  const removeSectionFavorites = (type: 'products' | 'instagram') => {
      if (confirm(t.confirm_remove_favorites || "Are you sure you want to remove these favorites?")) {
        const itemsToRemove = type === 'products' ? favoriteProducts : favoriteInstagramPosts;
        itemsToRemove.forEach(item => {
            const url = 'url' in item ? item.url : item.permalink;
            toggleFavorite(url); // Toggling a favorite removes it if it exists
        });
      }
  };

  const productControls = (
    <div className="flex flex-col sm:flex-row gap-3 w-full animate-fade-in">
        <div className="relative w-full sm:w-52 group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all"
            />
             {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <XCircle size={14} />
                </button>
            )}
        </div>
        <Select 
            options={uniqueStores}
            value={storeFilter}
            onChange={setStoreFilter}
            className="w-full sm:w-48 text-sm"
        />
        <Select 
            options={[{ value: 'newest', label: t.sort_by_newest }, { value: 'oldest', label: t.sort_by_oldest }]}
            value={sortOption}
            onChange={setSortOption}
            className="w-full sm:w-48 text-sm"
        />
    </div>
  );

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-gradient-to-r from-white/50 to-transparent dark:from-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
        <div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
            {t.favorites}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {t.favorites_subtitle?.replace('{count}', totalItems.toString()) || `${totalItems} items saved`}
            </p>
        </div>
      </div>
      
      {hasFavorites ? (
        <div className="flex flex-col gap-8">
            {favoriteProducts.length > 0 && (
                <CollapsibleSection 
                    title={t.products} 
                    count={filteredAndSortedProducts.length} 
                    controls={productControls}
                    onClear={() => removeSectionFavorites('products')}
                >
                    {filteredAndSortedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedProducts.map(p => (
                                    <ProductCard key={p.url} product={p} t={t} onNavigateWithFilter={onNavigateWithFilter} />
                                ))}
                            </div>
                            {filteredAndSortedProducts.length > itemsPerPage && (
                                <div className="mt-8 flex justify-center">
                                    <Pagination currentPage={productPage} totalPages={productTotalPages} onPageChange={setProductPage} totalItems={filteredAndSortedProducts.length} itemsPerPage={itemsPerPage} t={t} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                             <p>{t.noResults}</p>
                             <button onClick={() => { setSearchTerm(''); setStoreFilter('all'); }} className="text-brand-primary hover:underline mt-2 text-sm">
                                 {t.clearFilters || "Clear filters"}
                             </button>
                        </div>
                    )}
                </CollapsibleSection>
            )}

            {favoriteInstagramPosts.length > 0 && (
                <CollapsibleSection 
                    title={t.instagram_feature} 
                    count={favoriteInstagramPosts.length}
                    onClear={() => removeSectionFavorites('instagram')}
                >
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedInstagramPosts.map(p => (
                            <InstagramCard key={p.permalink} post={p} onBlacklistToggle={handleBlacklistToggle} isBlacklisted={blacklistedUsers.has(p.username)} />
                        ))}
                     </div>
                     {favoriteInstagramPosts.length > itemsPerPage && (
                        <div className="mt-8 flex justify-center">
                            <Pagination currentPage={instagramPage} totalPages={instagramTotalPages} onPageChange={setInstagramPage} totalItems={favoriteInstagramPosts.length} itemsPerPage={itemsPerPage} t={t} />
                        </div>
                    )}
                </CollapsibleSection>
            )}
        </div>
      ) : (
        <EmptyState title={t.no_favorites_title} hint={t.no_favorites_hint} />
      )}
    </div>
  );
};

export default FavoritesPage;
