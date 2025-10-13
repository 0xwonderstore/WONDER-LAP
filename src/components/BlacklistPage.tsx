import React, { useState } from 'react';
import { X, PlusCircle, Type, Store } from 'lucide-react';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { useBlacklistStore } from '../stores/blacklistStore';

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
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-light-text-primary dark:text-dark-text-primary">{t.blacklist_title}</h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Keywords Section */}
        <section className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <Type size={28} className="text-brand-primary" />
            <div>
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{t.keywords_section_title}</h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{t.keywords_section_description}</p>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeywordKeyPress}
              placeholder={t.keyword_placeholder}
              className="flex-grow p-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary transition"
            />
            <button
              onClick={handleAddKeyword}
              className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center aspect-square"
              aria-label={t.add_keyword}
            >
              <PlusCircle size={20} />
            </button>
          </div>
          <div className="min-h-[150px] p-2 rounded-lg bg-light-background dark:bg-dark-background">
            <h3 className="text-md font-semibold mb-3 px-2">{t.added_keywords}</h3>
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <div key={keyword} className="flex items-center gap-2 bg-light-surface dark:bg-dark-surface py-1 pl-3 pr-2 rounded-full text-sm font-medium">
                    <span>{keyword}</span>
                    <button onClick={() => removeKeyword(keyword)} className="text-red-500 hover:text-red-700 rounded-full hover:bg-red-500/10 p-0.5 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary py-10">{t.no_keywords_yet}</p>
            )}
          </div>
        </section>

        {/* Blocked Stores Section */}
        <section className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <Store size={28} className="text-brand-primary" />
            <div>
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{t.stores_section_title}</h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{t.stores_section_description}</p>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
              onKeyPress={handleStoreKeyPress}
              placeholder={t.store_placeholder}
              className="flex-grow p-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary transition"
            />
            <button
              onClick={handleAddStore}
              className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center aspect-square"
              aria-label={t.add_store}
            >
              <PlusCircle size={20} />
            </button>
          </div>
          <div className="min-h-[150px] p-2 rounded-lg bg-light-background dark:bg-dark-background">
            <h3 className="text-md font-semibold mb-3 px-2">{t.added_stores}</h3>
            {blockedStores.length > 0 ? (
              <div className="flex flex-col gap-2">
                {blockedStores.map(url => (
                  <div key={url} className="flex items-center justify-between gap-2 bg-light-surface dark:bg-dark-surface py-1 pl-3 pr-2 rounded-full text-sm font-medium">
                    <span className="truncate">{url}</span>
                    <button onClick={() => removeStore(url)} className="text-red-500 hover:text-red-700 rounded-full hover:bg-red-500/10 p-0.5 transition-colors flex-shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary py-10">{t.no_stores_yet}</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default BlacklistPage;
