import React, { useState } from 'react';
import { X, PlusCircle, Type, Store, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { useBlacklistStore } from '../stores/blacklistStore';
import { EmptyState } from './EmptyState';

const BlacklistPage: React.FC = () => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newStore, setNewStore] = useState('');
  const { language } = useLanguageStore();
  const t = translations[language];
  const { keywords, addKeyword, removeKeyword, blockedStores, addStore, removeStore } = useBlacklistStore();

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

  const handleAddStore = () => {
    if (newStore.trim()) {
      addStore(newStore.trim());
      setNewStore('');
    }
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddKeyword();
  };
  
  const handleStoreKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddStore();
  };

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto pb-10">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">{t.blacklist_title}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t.dashboard_settings_description || 'Manage your blocked keywords and stores.'}</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Keywords Section */}
        <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-500">
               <Type size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.keywords_section_title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">{t.keywords_section_description}</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-6">
            <div className="relative flex-grow">
                <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder={t.keyword_placeholder}
                className="w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                />
            </div>
            <button
              onClick={handleAddKeyword}
              className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-md shadow-blue-500/20"
              aria-label={t.add_keyword}
            >
              <PlusCircle size={24} />
            </button>
          </div>
          
          <div className="flex-grow bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 min-h-[200px] border border-gray-100 dark:border-gray-700/50">
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2 content-start">
                {keywords.map(keyword => (
                  <div key={keyword} className="group flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1.5 pl-3 pr-1.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all">
                    <span className="text-gray-700 dark:text-gray-200">{keyword}</span>
                    <button onClick={() => removeKeyword(keyword)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <EmptyState title="" hint={t.no_keywords_yet} icon={<Type className="w-10 h-10 text-gray-300 dark:text-gray-600" />} />
              </div>
            )}
          </div>
        </section>

        {/* Blocked Stores Section */}
        <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-500">
                <Store size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.stores_section_title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">{t.stores_section_description}</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
              onKeyPress={handleStoreKeyPress}
              placeholder={t.store_placeholder}
              className="flex-grow pl-4 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition outline-none"
            />
            <button
              onClick={handleAddStore}
              className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all active:scale-95 shadow-md shadow-purple-500/20"
              aria-label={t.add_store}
            >
              <PlusCircle size={24} />
            </button>
          </div>
          
          <div className="flex-grow bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 min-h-[200px] border border-gray-100 dark:border-gray-700/50">
            {blockedStores.length > 0 ? (
              <div className="flex flex-col gap-2">
                {blockedStores.map(url => (
                  <div key={url} className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-2 px-4 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 truncate">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="truncate text-gray-700 dark:text-gray-200">{url}</span>
                    </div>
                    <button onClick={() => removeStore(url)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <EmptyState title="" hint={t.no_stores_yet} icon={<Store className="w-10 h-10 text-gray-300 dark:text-gray-600" />} />
                </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default BlacklistPage;
