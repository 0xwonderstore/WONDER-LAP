import React, { useState } from 'react';
import { Locale } from '../types';
import { X, PlusCircle } from 'lucide-react';
import { translations } from '../translations';

interface BlacklistPageProps {
  locale: Locale;
  blacklist: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (word: string) => void;
}

const BlacklistPage: React.FC<BlacklistPageProps> = ({ locale, blacklist, onAddWord, onRemoveWord }) => {
  const [newWord, setNewWord] = useState('');
  const t = translations[locale];

  const handleAdd = () => {
    if (newWord.trim()) {
      onAddWord(newWord.trim());
      setNewWord('');
    }
  };

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">{t.blacklist}</h1>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder={"Add a word to the blacklist"}
          className="flex-grow p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
        />
        <button
          onClick={handleAdd}
          className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
        >
          <PlusCircle size={20} />
          <span>{"Add"}</span>
        </button>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl shadow">
        <div className="flex flex-wrap gap-2">
          {blacklist.map(word => (
            <div key={word} className="flex items-center gap-2 bg-light-background dark:bg-dark-background py-1 px-3 rounded-full">
              <span>{word}</span>
              <button onClick={() => onRemoveWord(word)} className="text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        {blacklist.length === 0 && (
          <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-4">{"The blacklist is empty."}</p>
        )}
      </div>
    </div>
  );
};

export default BlacklistPage;
