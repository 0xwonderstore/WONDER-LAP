import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  RotateCcw, 
  Box, 
  Instagram, 
  AlertCircle, 
  Search, 
  LayoutGrid, 
  List,
  ArrowRight
} from 'lucide-react';
import { useBlacklistStore } from '../stores/blacklistStore';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';
import { Product, InstagramPost } from '../types';

interface HiddenItemsPageProps {
  products: Product[];
  instagramPosts: InstagramPost[];
}

const HiddenItemsPage: React.FC<HiddenItemsPageProps> = ({ products, instagramPosts }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'products' | 'instagram'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { hiddenProducts, unhideProduct, clearHiddenProducts } = useBlacklistStore();
  const { blacklistedPosts, removePost, clearBlacklistedPosts } = useInstagramBlacklistStore();

  const hiddenProductsList = useMemo(() => {
    const hiddenSet = new Set(hiddenProducts);
    const list = products.filter(p => hiddenSet.has(p.url));
    if (!searchQuery) return list;
    return list.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.vendor.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, hiddenProducts, searchQuery]);

  const hiddenInstagramList = useMemo(() => {
    const list = instagramPosts.filter(p => blacklistedPosts.has(p.permalink));
    if (!searchQuery) return list;
    return list.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [instagramPosts, blacklistedPosts, searchQuery]);

  const totalHidden = hiddenProducts.length + blacklistedPosts.size;

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-7xl animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold mb-3">
            <Trash2 size={12} />
            <span>{totalHidden} {t('hidden_items')}</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('hidden_items_title')?.split('{')[0] || 'Archive'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            {t('hidden_items_subtitle') || 'Manage your hidden products and social posts here.'}
          </p>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder={t('search') || "Search in archive..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-brand-primary outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 mb-8 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white dark:bg-gray-700 shadow-md text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Box size={18} />
          {t('products') || "Products"}
          <span className="ml-1 opacity-50">{hiddenProducts.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('instagram')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'instagram' ? 'bg-white dark:bg-gray-700 shadow-md text-pink-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Instagram size={18} />
          Instagram
          <span className="ml-1 opacity-50">{blacklistedPosts.size}</span>
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'products' ? (
          <motion.div 
            key="products-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {hiddenProductsList.length > 0 ? (
              <div>
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={clearHiddenProducts}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-bold text-sm"
                  >
                    <RotateCcw size={16} /> {t('unhide_all')}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {hiddenProductsList.map(product => (
                    <div key={product.url} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="aspect-square relative overflow-hidden">
                        <img src={product.images?.[0]?.src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button 
                          onClick={() => unhideProduct(product.url)}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black shadow-2xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all hover:bg-brand-primary hover:text-white"
                        >
                          {t('unhide') || "Restore"}
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{product.vendor}</p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate mt-1">{product.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyArchive tab="products" />
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="instagram-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {hiddenInstagramList.length > 0 ? (
              <div>
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={clearBlacklistedPosts}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-bold text-sm"
                  >
                    <RotateCcw size={16} /> {t('unhide_all')}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {hiddenInstagramList.map(post => (
                    <div key={post.permalink} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                        {/* Try to use a better image if available, otherwise instagram media link */}
                        <img src={`${post.permalink}media/?size=m`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt="" onError={(e) => {
                          (e.target as any).src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=300&auto=format&fit=crop";
                        }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button 
                          onClick={() => removePost(post.permalink)}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black shadow-2xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all hover:bg-pink-500 hover:text-white"
                        >
                          {t('unhide') || "Restore"}
                        </button>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 text-pink-500 mb-1">
                          <Instagram size={10} />
                          <p className="text-[10px] font-black uppercase tracking-widest truncate">@{post.username}</p>
                        </div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-1">{post.caption || "Instagram Post"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyArchive tab="instagram" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyArchive = ({ tab }: { tab: string }) => (
  <div className="flex flex-col items-center justify-center py-32 bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
     <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} className="text-gray-300" />
     </div>
     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Archive is Empty</h3>
     <p className="text-gray-500 dark:text-gray-400 max-w-xs text-center">
        Items you hide from the {tab} list will appear here for restoration.
     </p>
  </div>
);

export default HiddenItemsPage;
