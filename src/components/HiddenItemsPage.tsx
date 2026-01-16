import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, Box, Instagram, AlertCircle } from 'lucide-react';
import { useBlacklistStore } from '../stores/blacklistStore';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';
import { Product, InstagramPost } from '../types';

interface HiddenItemsPageProps {
  products: Product[];
  instagramPosts: InstagramPost[];
}

const HiddenItemsPage: React.FC<HiddenItemsPageProps> = ({ products, instagramPosts }) => {
  const { t } = useTranslation();
  const { hiddenProducts, unhideProduct, clearHiddenProducts } = useBlacklistStore();
  const { blacklistedPosts, removePost, clearBlacklistedPosts } = useInstagramBlacklistStore();

  const hiddenProductsList = useMemo(() => {
    const hiddenSet = new Set(hiddenProducts);
    return products.filter(p => hiddenSet.has(p.url));
  }, [products, hiddenProducts]);

  const hiddenInstagramList = useMemo(() => {
    return instagramPosts.filter(p => blacklistedPosts.has(p.permalink));
  }, [instagramPosts, blacklistedPosts]);

  const isEmpty = hiddenProductsList.length === 0 && hiddenInstagramList.length === 0;

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Trash2 className="text-red-500" /> {t('hidden_items_title')?.replace('{count}', (hiddenProductsList.length + hiddenInstagramList.length).toString())}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">{t('hidden_items_subtitle')}</p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
           <AlertCircle size={48} className="text-gray-300 mb-4" />
           <p className="text-xl font-bold text-gray-400">{t('no_hidden_items')}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Products Section */}
          {hiddenProductsList.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Box className="text-blue-500" /> {t('product')}s ({hiddenProductsList.length})
                </h3>
                <button 
                    onClick={clearHiddenProducts}
                    className="text-sm font-bold text-red-500 hover:underline flex items-center gap-1"
                >
                    <RotateCcw size={14} /> {t('unhide_all')}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {hiddenProductsList.map(product => (
                  <div key={product.url} className="relative group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 aspect-square shadow-sm">
                    <img src={product.images?.[0]?.src} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button 
                            onClick={() => unhideProduct(product.url)}
                            className="bg-white text-gray-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl hover:scale-105 transition-transform"
                        >
                            {t('unhide')}
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Instagram Section */}
          {hiddenInstagramList.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Instagram className="text-pink-500" /> {t('instagram_feature')} ({hiddenInstagramList.length})
                </h3>
                <button 
                    onClick={clearBlacklistedPosts}
                    className="text-sm font-bold text-red-500 hover:underline flex items-center gap-1"
                >
                    <RotateCcw size={14} /> {t('unhide_all')}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {hiddenInstagramList.map(post => (
                  <div key={post.permalink} className="relative group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 aspect-square shadow-sm">
                    <img src={`${post.permalink}media/?size=m`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button 
                            onClick={() => removePost(post.permalink)}
                            className="bg-white text-gray-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl hover:scale-105 transition-transform"
                        >
                            {t('unhide')}
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default HiddenItemsPage;
