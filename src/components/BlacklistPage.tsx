import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { useBlacklistStore } from '../stores/blacklistStore';

const BlacklistPage: React.FC = () => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newStoreUrl, setNewStoreUrl] = useState('');
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
    if (newStoreUrl.trim()) {
      addStore(newStoreUrl.trim());
      setNewStoreUrl('');
    }
  };

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-light-text-primary dark:text-dark-text-primary text-center">{t.blacklist}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Keywords Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">{t.blacklist_addKeyword}</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder={t.blacklist_placeholder}
              className="flex-grow p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
            />
            <button
              onClick={handleAddKeyword}
              className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusCircle size={20} />
              <span className="hidden sm:inline">{t.blacklist_addKeyword}</span>
            </button>
          </div>
          <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl shadow min-h-[100px]">
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <div key={keyword} className="flex items-center gap-2 bg-light-background dark:bg-dark-background py-1.5 px-3 rounded-full text-sm">
                    <span>{keyword}</span>
                    <button onClick={() => removeKeyword(keyword)} className="text-red-500 hover:text-red-700">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-light-text-secondary dark:text-dark-text-secondary pt-8">{t.blacklist_noKeywords}</p>
            )}
          </div>
        </div>

        {/* Blocked Stores Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">{t.blacklist_blockedStores}</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newStoreUrl}
              onChange={(e) => setNewStoreUrl(e.target.value)}
              placeholder={t.blacklist_store_placeholder}
              className="flex-grow p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
            />
            <button
              onClick={handleAddStore}
              className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusCircle size={20} />
              <span className="hidden sm:inline">{t.blacklist_addStore}</span>
            </button>
          </div>
          <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl shadow min-h-[100px]">
            {blockedStores.length > 0 ? (
              <div className="flex flex-col gap-2">
                {blockedStores.map(url => (
                  <div key={url} className="flex items-center justify-between gap-2 bg-light-background dark:bg-dark-background py-1.5 px-3 rounded-full text-sm">
                    <span className="truncate">{url}</span>
                    <button onClick={() => removeStore(url)} className="text-red-500 hover:text-red-700 flex-shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-light-text-secondary dark:text-dark-text-secondary pt-8">{t.blacklist_noStores}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlacklistPage;
