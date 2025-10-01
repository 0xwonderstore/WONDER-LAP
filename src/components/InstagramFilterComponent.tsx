import React from 'react';
import Select from './Select';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';

type SortOrder = 'default' | 'asc' | 'desc';

interface InstagramFilterComponentProps {
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  languages: string[];
  selectedLanguage: string | null;
  onLanguageChange: (language: string | null) => void;
}

const InstagramFilterComponent: React.FC<InstagramFilterComponentProps> = ({
  sortOrder,
  onSortOrderChange,
  languages,
  selectedLanguage,
  onLanguageChange,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const sortOptions = [
    { value: 'default', label: t.defaultOrder },
    { value: 'asc', label: t.ascending },
    { value: 'desc', label: t.descending },
  ];
  
  const languageOptions = [
    { value: '', label: t.all_languages },
    ...languages.map(lang => ({ value: lang, label: t[lang] || lang })),
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.sortByLikes}</label>
          <Select
            options={sortOptions}
            value={sortOrder}
            onChange={value => onSortOrderChange(value as SortOrder)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.language_filter}</label>
          <Select
            options={languageOptions}
            value={selectedLanguage || ''}
            onChange={value => onLanguageChange(value === '' ? null : value)}
          />
        </div>
      </div>
    </div>
  );
};

export default InstagramFilterComponent;
