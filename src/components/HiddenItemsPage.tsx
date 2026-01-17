import React, { useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  RotateCcw, 
  Box, 
  Instagram, 
  AlertCircle, 
  Search, 
  Download, 
  Upload,
  Check,
  X
} from 'lucide-react';
import { useBlacklistStore } from '../stores/blacklistStore';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';
import { Product, InstagramPost } from '../types';
import { useToastStore } from '../stores/toastStore';

interface HiddenItemsPageProps {
  products: Product[];
  instagramPosts: InstagramPost[];
}

const HiddenItemsPage: React.FC<HiddenItemsPageProps> = ({ products, instagramPosts }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'products' | 'instagram'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { hiddenProducts, unhideProduct, clearHiddenProducts, exportBlacklist, importBlacklist } = useBlacklistStore();
  const { blacklistedPosts, removePost, clearBlacklistedPosts, exportInstagramBlacklist, importInstagramBlacklist } = useInstagramBlacklistStore();
  const { showToast } = useToastStore();

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

  const handleExport = () => {
    const dataStr = activeTab === 'products' ? exportBlacklist() : exportInstagramBlacklist();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${activeTab}_archive_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast(t('export_success'), 'success');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            const count = activeTab === 'products' ? importBlacklist(json) : importInstagramBlacklist(json);
            if (count > 0) {
                showToast(t('import_success').replace('{count}', count.toString()), 'success');
            } else {
                showToast(t('import_error') + " (No valid data found)", 'removed');
            }
        } catch (error) {
            showToast(t('import_error'), 'removed');
        }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-7xl animate-fade-in">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        style={{ display: 'none' }} 
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold mb-3 border border-amber-200 dark:border-amber-800">
            <Trash2 size={12} />
            <span>{totalHidden} {t('hidden_items')}</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('hidden_items_title')?.split('{')[0] || 'Archive'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md text-sm font-medium">
            {t('hidden_items_subtitle') || 'Manage your hidden products and social posts here.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative group min-w-[250px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                    type="text"
                    placeholder={t('search') || "Search in archive..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-brand-primary outline-none transition-all shadow-sm font-medium text-sm"
                />
            </div>
            <div className="flex gap-2">
                <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm" title={t('export_data')}>
                    <Download size={18} />
                </button>
                <button onClick={handleImportClick} className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm" title={t('import_data')}>
                    <Upload size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 mb-8 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit border border-gray-200 dark:border-gray-700/50">
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Box size={16} />
          {t('products') || "Products"}
          <span className="ml-1 opacity-60 bg-gray-100 dark:bg-gray-800 px-1.5 rounded-md text-[10px]">{hiddenProducts.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('instagram')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'instagram' ? 'bg-white dark:bg-gray-700 shadow-sm text-pink-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Instagram size={16} />
          Instagram
          <span className="ml-1 opacity-60 bg-gray-100 dark:bg-gray-800 px-1.5 rounded-md text-[10px]">{blacklistedPosts.size}</span>
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
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all font-bold text-xs"
                  >
                    <RotateCcw size={14} /> {t('unhide_all')}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {hiddenProductsList.map(product => (
                    <div key={product.url} className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="aspect-square relative overflow-hidden">
                        <img src={product.images?.[0]?.src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <button 
                              onClick={() => unhideProduct(product.url)}
                              className="w-full py-2 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                            >
                              <RotateCcw size={12} /> {t('unhide')}
                            </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate mb-1">{product.vendor}</p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{product.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyArchive tab="products" t={t} />
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
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all font-bold text-xs"
                  >
                    <RotateCcw size={14} /> {t('unhide_all')}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {hiddenInstagramList.map(post => (
                    <div key={post.permalink} className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                        {/* Try to use a better image if available, otherwise instagram media link */}
                        <img src={`${post.permalink}media/?size=m`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" alt="" onError={(e) => {
                          (e.target as any).src = "https://via.placeholder.com/300?text=Instagram+Post";
                        }} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <button 
                              onClick={() => removePost(post.permalink)}
                              className="w-full py-2 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                            >
                              <RotateCcw size={12} /> {t('unhide')}
                            </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 text-pink-500 mb-1">
                          <Instagram size={10} />
                          <p className="text-[9px] font-black uppercase tracking-widest truncate">@{post.username}</p>
                        </div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-1">{post.caption || "No caption"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyArchive tab="instagram" t={t} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyArchive = ({ tab, t }: { tab: string, t: any }) => (
  <div className="flex flex-col items-center justify-center py-32 bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700/50">
     <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <AlertCircle size={32} className="text-gray-300" />
     </div>
     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('no_hidden_items')}</h3>
     <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs text-center">
        Items you hide from {tab} will appear here.
     </p>
  </div>
);

export default HiddenItemsPage;
