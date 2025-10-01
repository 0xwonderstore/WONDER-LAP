import React from 'react';
import Select from './Select';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';

type SortOrder = 'default' | 'asc' | 'desc';

interface InstagramFilterComponentProps {
  usernames: string[];
  selectedUsername: string | null;
  onUsernameChange: (username: string | null) => void;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  minLikes: number | null;
  maxLikes: number | null;
  onLikesChange: (min: number | null, max: number | null) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  languages: string[];
  selectedLanguage: string | null;
  onLanguageChange: (language: string | null) => void;
}

const InstagramFilterComponent: React.FC<InstagramFilterComponentProps> = ({
  usernames,
  selectedUsername,
  onUsernameChange,
  date,
  onDateChange,
  minLikes,
  maxLikes,
  onLikesChange,
  sortOrder,
  onSortOrderChange,
  languages,
  selectedLanguage,
  onLanguageChange,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const handleMinLikesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : Number(e.target.value);
    onLikesChange(value, maxLikes);
  };

  const handleMaxLikesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : Number(e.target.value);
    onLikesChange(minLikes, value);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <Select
            options={[{ value: '', label: 'All Users' }, ...usernames.map(u => ({ value: u, label: u }))]}
            value={selectedUsername || ''}
            onChange={value => onUsernameChange(value === '' ? null : value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <DateRangePicker
            date={date}
            setDate={onDateChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Likes Count</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={minLikes === null ? '' : minLikes}
              onChange={handleMinLikesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxLikes === null ? '' : maxLikes}
              onChange={handleMaxLikesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
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
