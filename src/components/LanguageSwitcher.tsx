import React from 'react';
import { useLanguageStore } from '../stores/languageStore';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center bg-light-surface dark:bg-dark-surface rounded-full p-1">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
          language === 'en' ? 'bg-brand-primary text-white' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
          language === 'ar' ? 'bg-brand-primary text-white' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
