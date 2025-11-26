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
import { ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from './Pagination';

interface FavoritesPageProps {
  allProducts: Product[];
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}

const CollapsibleSection = ({ title, count, children, defaultExpanded = false }: { title: string, count: number, children: React.ReactNode, defaultExpanded?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
             <div className="flex items-center gap-3">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                 <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-sm font-medium">
                     {count}
                 </span>
             </div>
             <div className="text-gray-400">
                 {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
             </div>
        </button>
        
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
  const { favoriteUrls } = useFavoritesStore();
  const { blacklistedUsers, addUser, removeUser } = useInstagramBlacklistStore();

  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [instagramPage, setInstagramPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadInstagramPosts().then(setInstagramPosts);
  }, []);

  const handleBlacklistToggle = (username: string) => {
    if (blacklistedUsers.has(username)) {
      removeUser(username);
    } else {
      addUser(username);
    }
  };

  const favoriteProducts = useMemo(() => {
    return allProducts
      .filter(p => favoriteUrls.has(normalizeUrl(p.url)))
      .sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [allProducts, favoriteUrls]);

  const favoriteInstagramPosts = useMemo(() => {
      return instagramPosts.filter(p => favoriteUrls.has(normalizeUrl(p.permalink)));
  }, [instagramPosts, favoriteUrls]);

  // Pagination Logic
  const productTotalPages = Math.ceil(favoriteProducts.length / itemsPerPage);
  const paginatedProducts = favoriteProducts.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);

  const instagramTotalPages = Math.ceil(favoriteInstagramPosts.length / itemsPerPage);
  const paginatedInstagramPosts = favoriteInstagramPosts.slice((instagramPage - 1) * itemsPerPage, instagramPage * itemsPerPage);


  const hasFavorites = favoriteProducts.length > 0 || favoriteInstagramPosts.length > 0;
  const totalItems = favoriteProducts.length + favoriteInstagramPosts.length;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        {t.favorites_title.replace('{count}', totalItems.toString())}
      </h1>
      
      {hasFavorites ? (
        <div className="flex flex-col gap-6">
            {/* Products Section */}
            {favoriteProducts.length > 0 && (
                <CollapsibleSection title={t.products} count={favoriteProducts.length} defaultExpanded={false}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedProducts.map(p => (
                            <ProductCard 
                                key={p.url} 
                                product={p}
                                t={t}
                                onNavigateWithFilter={onNavigateWithFilter}
                            />
                        ))}
                    </div>
                    {favoriteProducts.length > itemsPerPage && (
                        <div className="mt-8">
                            <Pagination 
                                currentPage={productPage}
                                totalPages={productTotalPages}
                                onPageChange={setProductPage}
                                totalItems={favoriteProducts.length}
                                itemsPerPage={itemsPerPage}
                                t={t}
                            />
                        </div>
                    )}
                </CollapsibleSection>
            )}

            {/* Instagram Section */}
            {favoriteInstagramPosts.length > 0 && (
                <CollapsibleSection title={t.instagram_feature} count={favoriteInstagramPosts.length} defaultExpanded={false}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedInstagramPosts.map(p => (
                            <InstagramCard
                                key={p.permalink}
                                post={p}
                                onBlacklistToggle={handleBlacklistToggle}
                                isBlacklisted={blacklistedUsers.has(p.username)}
                            />
                        ))}
                     </div>
                     {favoriteInstagramPosts.length > itemsPerPage && (
                        <div className="mt-8">
                            <Pagination 
                                currentPage={instagramPage}
                                totalPages={instagramTotalPages}
                                onPageChange={setInstagramPage}
                                totalItems={favoriteInstagramPosts.length}
                                itemsPerPage={itemsPerPage}
                                t={t}
                            />
                        </div>
                    )}
                </CollapsibleSection>
            )}
        </div>
      ) : (
        <EmptyState 
            title={t.no_favorites_title}
            hint={t.no_favorites_hint}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
