import React, { useMemo, useState, useEffect } from 'react';
import { Product, InstagramPost } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import InstagramCard from './InstagramCard';
import { EmptyState } from './EmptyState';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { normalizeUrl } from '../utils/urlUtils';
import { loadInstagramPosts } from '../utils/instagramLoader';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';
import { ChevronDown, ChevronUp, Search, XCircle } from 'lucide-react';
import Pagination from './Pagination';
import Select from './Select';

interface FavoritesPageProps {
  allProducts: Product[];
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}

const CollapsibleSection = ({ title, count, children, controls, defaultExpanded = true }: { title: string, count: number, children: React.ReactNode, controls?: React.ReactNode, defaultExpanded?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <button 
                 onClick={() => setIsExpanded(!isExpanded)}
                 className="flex items-center gap-3 w-full sm:w-auto"
             >
                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                 <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-sm font-medium">
                     {count}
                 </span>
                 <div className="text-gray-400">
                     {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </div>
             </button>
             {controls && <div className="w-full sm:w-auto">{controls}</div>}
        </div>
        
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                {children}
            </div>
        </div>
    </div>
  );
};

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, onNavigateWithFilter }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { favoriteUrls, removeAllFavorites } = useFavoritesStore();
  const { blacklistedUsers, addUser, removeUser } = useInstagramBlacklistStore();

  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [instagramPage, setInstagramPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const itemsPerPage = 20;

  useEffect(() => {
    loadInstagramPosts().then(setInstagramPosts);
  }, []);

  const handleBlacklistToggle = (username: string) => {
    if (blacklistedUsers.has(username)) removeUser(username);
    else addUser(username);
  };

  const favoriteProducts = useMemo(() => {
    return allProducts.filter(p => favoriteUrls.has(normalizeUrl(p.url)));
  }, [allProducts, favoriteUrls]);

  const favoriteInstagramPosts = useMemo(() => {
      return instagramPosts.filter(p => favoriteUrls.has(normalizeUrl(p.permalink)));
  }, [instagramPosts, favoriteUrls]);
  
  const uniqueStores = useMemo(() => {
    const storeSet = new Set(favoriteProducts.map(p => p.vendor));
    return [{ value: 'all', label: t.allStores }, ...Array.from(storeSet).map(s => ({ value: s, label: s }))];
  }, [favoriteProducts, t.allStores]);

  const filteredAndSortedProducts = useMemo(() => {
    let products = favoriteProducts;
    if (searchTerm) {
      products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (storeFilter !== 'all') {
      products = products.filter(p => p.vendor === storeFilter);
    }
    products.sort((a, b) => {
      if (!a.created_at || !b.created_at) return 0;
      switch(sortOption) {
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return products;
  }, [favoriteProducts, searchTerm, storeFilter, sortOption]);

  // Pagination Logic
  const productTotalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);

  const instagramTotalPages = Math.ceil(favoriteInstagramPosts.length / itemsPerPage);
  const paginatedInstagramPosts = favoriteInstagramPosts.slice((instagramPage - 1) * itemsPerPage, instagramPage * itemsPerPage);

  const hasFavorites = favoriteProducts.length > 0 || favoriteInstagramPosts.length > 0;
  const totalItems = favoriteProducts.length + favoriteInstagramPosts.length;
  
  const productControls = (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative w-full sm:w-52">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>
        <Select 
            options={uniqueStores}
            value={storeFilter}
            onChange={setStoreFilter}
            className="w-full sm:w-48"
        />
        <Select 
            options={[{ value: 'newest', label: t.sort_by_newest }, { value: 'oldest', label: t.sort_by_oldest }]}
            value={sortOption}
            onChange={setSortOption}
            className="w-full sm:w-48"
        />
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t.favorites_title.replace('{count}', totalItems.toString())}
        </h1>
        {hasFavorites && 
            <button onClick={removeAllFavorites} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium text-sm">
                <XCircle size={18} />
                <span>{t.removeAllFavorites}</span>
            </button>
        }
      </div>
      
      {hasFavorites ? (
        <div className="flex flex-col gap-6">
            {favoriteProducts.length > 0 && (
                <CollapsibleSection title={t.products} count={filteredAndSortedProducts.length} controls={productControls}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedProducts.map(p => (
                            <ProductCard key={p.url} product={p} t={t} onNavigateWithFilter={onNavigateWithFilter} />
                        ))}
                    </div>
                    {filteredAndSortedProducts.length > itemsPerPage && (
                        <div className="mt-8">
                            <Pagination currentPage={productPage} totalPages={productTotalPages} onPageChange={setProductPage} totalItems={filteredAndSortedProducts.length} itemsPerPage={itemsPerPage} t={t} />
                        </div>
                    )}
                </CollapsibleSection>
            )}

            {favoriteInstagramPosts.length > 0 && (
                <CollapsibleSection title={t.instagram_feature} count={favoriteInstagramPosts.length}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedInstagramPosts.map(p => (
                            <InstagramCard key={p.permalink} post={p} onBlacklistToggle={handleBlacklistToggle} isBlacklisted={blacklistedUsers.has(p.username)} />
                        ))}
                     </div>
                     {favoriteInstagramPosts.length > itemsPerPage && (
                        <div className="mt-8">
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
