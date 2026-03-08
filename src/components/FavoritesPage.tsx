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
import { Heart, Trash2, ArrowUpDown, Download, Facebook, Instagram, Package, Share2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeUrl } from '../utils/urlUtils';
import SegmentedControl from './SegmentedControl';

type FavoriteTab = 'all' | 'products' | 'instagram' | 'facebook';

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
  const { favoriteUrls, removeAllFavorites } = useFavoritesStore();
  
  const [activeTab, setActiveTab] = useState<FavoriteTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const perPageOptions = [24, 52, 100, 200];

  const productMap = useMemo(() => 
    new Map(allProducts.map(p => [normalizeUrl(p.url), p])),
  [allProducts]);
  
  const instagramMap = useMemo(() => 
    new Map(instagramPosts.map(p => [normalizeUrl(p.permalink), p])),
  [instagramPosts]);

  const facebookMap = useMemo(() =>
    new Map(facebookPosts.map(p => [normalizeUrl(p.permalink), p])),
  [facebookPosts]);

  const categorizedFavorites = useMemo(() => {
    const products = Array.from(favoriteUrls)
        .map(url => productMap.get(url))
        .filter((p): p is Product => p !== undefined)
        .map(p => ({ type: 'product' as const, data: p, date: new Date(p.created_at).getTime() }));
        
    const instagram = Array.from(favoriteUrls)
        .map(url => instagramMap.get(url))
        .filter((p): p is InstagramPost => p !== undefined)
        .map(p => ({ type: 'instagram' as const, data: p, date: new Date(p.timestamp).getTime() }));
        
    const facebook = Array.from(favoriteUrls)
        .map(url => facebookMap.get(url))
        .filter((p): p is FacebookPost => p !== undefined)
        .map(p => ({ type: 'facebook' as const, data: p, date: new Date(p.timestamp).getTime() }));

    return { products, instagram, facebook };
  }, [favoriteUrls, productMap, instagramMap, facebookMap]);

  // Filter based on active tab
  const displayItems = useMemo(() => {
    let items: any[] = [];
    if (activeTab === 'all' || activeTab === 'products') items = [...items, ...categorizedFavorites.products];
    if (activeTab === 'all' || activeTab === 'instagram') items = [...items, ...categorizedFavorites.instagram];
    if (activeTab === 'all' || activeTab === 'facebook') items = [...items, ...categorizedFavorites.facebook];
    
    return items.sort((a, b) => sortOrder === 'newest' ? b.date - a.date : a.date - b.date);
  }, [categorizedFavorites, activeTab, sortOrder]);

  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const currentItems = displayItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleRemoveAll = () => {
    if (window.confirm(t.confirm_remove_favorites)) {
      removeAllFavorites();
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const exportToCSV = (type: FavoriteTab) => {
    let dataToExport: any[] = [];
    let filename = `favorites_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    let headers = '';

    if (type === 'products' || (type === 'all' && categorizedFavorites.products.length > 0)) {
        headers = 'Type,Name,URL,Store,Price,Currency\n';
        const rows = categorizedFavorites.products.map(item => 
            `Product,"${item.data.name.replace(/"/g, '""')}",${item.data.url},"${item.data.vendor}",${item.data.price},${item.data.currency}`
        );
        dataToExport = [...dataToExport, ...rows];
    }

    if (type === 'instagram' || (type === 'all' && categorizedFavorites.instagram.length > 0)) {
        if (!headers) headers = 'Type,Username,URL,Likes,Comments,Timestamp\n';
        const rows = categorizedFavorites.instagram.map(item => 
            `Instagram,${item.data.username},${item.data.permalink},${item.data.likes},${item.data.comments},${item.data.timestamp}`
        );
        dataToExport = [...dataToExport, ...rows];
    }

    if (type === 'facebook' || (type === 'all' && categorizedFavorites.facebook.length > 0)) {
        if (!headers) headers = 'Type,Username,URL,Likes,Comments,Shares,Timestamp\n';
        const rows = categorizedFavorites.facebook.map(item => 
            `Facebook,${item.data.username},${item.data.permalink},${item.data.likes},${item.data.comments},${item.data.shares},${item.data.timestamp}`
        );
        dataToExport = [...dataToExport, ...rows];
    }

    if (dataToExport.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + dataToExport.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dummyHandler = () => {};

  if (categorizedFavorites.products.length === 0 && categorizedFavorites.instagram.length === 0 && categorizedFavorites.facebook.length === 0) {
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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200 dark:shadow-none">
                <Heart size={28} fill="currentColor" />
            </div>
            {t.favorites_title.replace('{{count}}', (categorizedFavorites.products.length + categorizedFavorites.instagram.length + categorizedFavorites.facebook.length).toString())}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg ml-1">
             Manage and export your saved items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
                onClick={() => exportToCSV(activeTab)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
            >
                <Download size={18} />
                Export {activeTab === 'all' ? 'All' : activeTab}
            </button>
            
            <button
                onClick={handleRemoveAll}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30"
            >
                <Trash2 size={18} />
                {t.removeAllFavorites}
            </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="w-full md:w-auto">
              <SegmentedControl
                options={[
                    { label: 'All Items', value: 'all', icon: <Share2 size={14} /> },
                    { label: 'Products', value: 'products', icon: <Package size={14} /> },
                    { label: 'Instagram', value: 'instagram', icon: <Instagram size={14} /> },
                    { label: 'Facebook', value: 'facebook', icon: <Facebook size={14} /> }
                ]}
                value={activeTab}
                onChange={(val) => { setActiveTab(val as FavoriteTab); setCurrentPage(1); }}
              />
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4" /> {t.show}:
                </span>
                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                    {perPageOptions.map(size => (
                        <button
                            key={size}
                            onClick={() => handleItemsPerPageChange(size)}
                            className={`relative min-w-[3.5rem] h-9 rounded-lg text-xs font-bold transition-all duration-300 ${
                                itemsPerPage === size 
                                ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm scale-100 ring-1 ring-black/5 font-extrabold' 
                                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:shadow-md transition-all h-full"
            >
                <ArrowUpDown size={16} className="text-brand-primary" />
                {sortOrder === 'newest' ? t.sort_by_newest : t.sort_by_oldest}
            </button>
          </div>
      </div>

      {/* Content Grid */}
      <AnimatePresence mode='wait'>
        <motion.div 
            key={activeTab + itemsPerPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
            {currentItems.map((item) => (
                <div key={item.type === 'product' ? item.data.url : item.data.permalink} className="h-full">
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
                </div>
            ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={displayItems.length}
            t={t}
          />
        </div>
      )}
      
      {displayItems.length === 0 && (
          <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-900 mb-4 text-gray-300 dark:text-gray-700">
                  {activeTab === 'facebook' && <Facebook size={40} />}
                  {activeTab === 'instagram' && <Instagram size={40} />}
                  {activeTab === 'products' && <Package size={40} />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {activeTab} favorites</h3>
              <p className="text-gray-500">You haven't saved any items in this category yet.</p>
          </div>
      )}
    </div>
  );
};

export default FavoritesPage;
