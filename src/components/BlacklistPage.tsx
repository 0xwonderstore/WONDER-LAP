import React, { useState } from 'react';
import { Product, Locale } from '../types';
import { X } from 'lucide-react';

const translations = {
  ar: {
    blacklistManager: 'إدارة القائمة السوداء',
    description: 'المنتجات التي تحتوي على هذه الكلمات في اسمها سيتم إخفاؤها تلقائيًا. الكلمات لا تتأثر بحالة الأحرف.',
    addWord: 'أضف كلمة جديدة...',
    add: 'إضافة',
    empty: 'القائمة السوداء فارغة حاليًا.',
  },
  en: {
    blacklistManager: 'Blacklist Manager',
    description: 'Products containing these words in their name will be automatically hidden. Words are case-insensitive.',
    addWord: 'Add a new word...',
    add: 'Add',
    empty: 'The blacklist is currently empty.',
  }
};

interface BlacklistPageProps {
  locale: Locale;
  blacklist: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (word: string) => void;
}

const BlacklistPage: React.FC<BlacklistPageProps> = ({ locale, blacklist, onAddWord, onRemoveWord }) => {
  const t = translations[locale];
  const [newWord, setNewWord] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim()) {
      onAddWord(newWord.trim());
      setNewWord('');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">{t.blacklistManager}</h2>
      </div>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-2xl">{t.description}</p>
      
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md p-6">
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder={t.addWord}
            className="flex-grow p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
          />
          <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-dark transition-colors">
            {t.add}
          </button>
        </form>

        <div className="space-y-2">
          {blacklist.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {blacklist.map(word => (
                <li key={word} className="flex items-center gap-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 text-sm font-medium px-3 py-1.5 rounded-full">
                  <span>{word}</span>
                  <button onClick={() => onRemoveWord(word)} className="p-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-8">{t.empty}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlacklistPage;
