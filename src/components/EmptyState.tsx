import React from 'react';
import { useTranslation } from 'react-i18next';
import { PackageX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, hint, icon }) => {
  const { t } = useTranslation();

  const handleClearCache = () => {
    if (window.confirm("Are you sure? This will clear all saved settings (favorites, blacklist, etc) and reload.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6 shadow-inner">
        {icon || <PackageX className="w-16 h-16 text-gray-400 dark:text-gray-500" />}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {title || t('noResults')}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        {hint || t('noResultsHint')}
      </p>
      
      <button 
        onClick={handleClearCache}
        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
      >
        <RotateCcw size={14} /> Clear Cache & Reload App
      </button>
    </div>
  );
};
