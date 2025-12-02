import React, { useState, useRef, useEffect } from 'react';
import { Settings, Layout, Columns } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';

const DashboardSettings = () => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { 
    tabVisibility, 
    toggleTabVisibility,
    storeColumnsVisibility,
    toggleStoreColumnVisibility
  } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const tabs: ('stores' | 'keywords' | 'languages')[] = ['stores', 'keywords', 'languages'];

  const tabLabels = {
    stores: t.dashboard_topStores,
    keywords: t.dashboard_topKeywords,
    languages: t.dashboard_topLanguages,
  };

  const columnLabels = {
    totalProducts: t.totalProducts,
    language: t.language,
    newProducts30d: t.dashboard_newProducts30d_store,
    lastProductAdded: t.dashboard_lastProductAdded,
    firstProductAdded: t.dashboard_firstProductAdded,
    metaAdLibrary: t.searchInMeta,
  };

  const columns = Object.keys(storeColumnsVisibility) as (keyof typeof storeColumnsVisibility)[];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div 
        onClick={(e) => { e.preventDefault(); onChange(); }}
        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl transition-all duration-200 ${isOpen ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
        aria-label={t.dashboard_settings_label}
      >
        <Settings size={20} className={isOpen ? 'animate-spin-slow' : ''} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden ring-1 ring-black/5 animate-fade-in-up">
          <div className="p-5 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">{t.dashboard_settings_title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.dashboard_settings_description}</p>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {/* Main Modules Section */}
            <div className="mb-4">
                <div className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <Layout size={14} />
                    {t.dashboard_settings_modules}
                </div>
                <div className="space-y-1">
                    {tabs.map((tab) => (
                    <div
                        key={tab}
                        className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{tabLabels[tab]}</span>
                        <ToggleSwitch checked={tabVisibility[tab]} onChange={() => toggleTabVisibility(tab)} />
                    </div>
                    ))}
                </div>
            </div>

            {/* Store Table Columns Section */}
            {tabVisibility.stores && (
                <div>
                    <div className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                        <Columns size={14} />
                        {t.dashboard_settings_columns}
                    </div>
                    <div className="space-y-1">
                        {columns.map((col) => (
                        <div
                            key={col}
                            className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{columnLabels[col]}</span>
                            <ToggleSwitch checked={storeColumnsVisibility[col]} onChange={() => toggleStoreColumnVisibility(col)} />
                        </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSettings;
