import React, { useState, useRef, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
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

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-light-background-hover dark:hover:bg-dark-background-hover"
        aria-label={t.dashboard_settings_label}
      >
        <Settings size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl z-10 border border-light-border dark:border-dark-border max-h-[80vh] overflow-y-auto">
          <div className="p-3">
            <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{t.dashboard_settings_title}</p>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{t.dashboard_settings_description}</p>
          </div>
          
          {/* Main Modules Section */}
          <div className="border-t border-light-border dark:border-dark-border py-2">
            <div className="px-3 pb-1">
                <p className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase">{t.dashboard_settings_modules}</p>
            </div>
            {tabs.map((tab) => (
              <label
                key={tab}
                htmlFor={`vis-${tab}`}
                className="flex items-center justify-between w-full px-3 py-2 text-sm cursor-pointer hover:bg-light-background-hover dark:hover:bg-dark-background-hover"
              >
                <span>{tabLabels[tab]}</span>
                <input
                    id={`vis-${tab}`}
                    type="checkbox"
                    className="sr-only"
                    checked={tabVisibility[tab]}
                    onChange={() => toggleTabVisibility(tab)}
                />
                <div className={`w-5 h-5 flex items-center justify-center rounded border ${tabVisibility[tab] ? 'bg-brand-primary border-brand-primary' : 'border-gray-400'}`}>
                  {tabVisibility[tab] && <Check size={16} className="text-white" />}
                </div>
              </label>
            ))}
          </div>

          {/* Store Table Columns Section - Only show if Stores tab is enabled */}
          {tabVisibility.stores && (
            <div className="border-t border-light-border dark:border-dark-border py-2">
                <div className="px-3 pb-1">
                    <p className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase">{t.dashboard_settings_columns}</p>
                </div>
                {columns.map((col) => (
                <label
                    key={col}
                    htmlFor={`col-${col}`}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm cursor-pointer hover:bg-light-background-hover dark:hover:bg-dark-background-hover"
                >
                    <span>{columnLabels[col]}</span>
                    <input
                        id={`col-${col}`}
                        type="checkbox"
                        className="sr-only"
                        checked={storeColumnsVisibility[col]}
                        onChange={() => toggleStoreColumnVisibility(col)}
                    />
                    <div className={`w-5 h-5 flex items-center justify-center rounded border ${storeColumnsVisibility[col] ? 'bg-brand-primary border-brand-primary' : 'border-gray-400'}`}>
                    {storeColumnsVisibility[col] && <Check size={16} className="text-white" />}
                    </div>
                </label>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardSettings;
