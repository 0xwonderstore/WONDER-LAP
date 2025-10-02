import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from './Select';
import { DateRangePicker } from './DateRangePicker';
import { X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface InstagramFilterComponentProps {
  sortOrder: string;
  setSortOrder: (order: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  minLikes: number;
  setMinLikes: (likes: number) => void;
  availableUsernames: string[];
  selectedUsername: string;
  setSelectedUsername: (username: string) => void;
}

export function InstagramFilterComponent({
  sortOrder,
  setSortOrder,
  dateRange,
  setDateRange,
  selectedLanguage,
  setSelectedLanguage,
  minLikes,
  setMinLikes,
  availableUsernames,
  selectedUsername,
  setSelectedUsername,
}: InstagramFilterComponentProps) {
  const { t } = useTranslation();

  const languages = ['en', 'ar'];

  const isFilterActive = sortOrder !== 'default' || dateRange !== undefined || selectedLanguage !== 'all' || minLikes > 0 || selectedUsername !== 'all';

  const onResetFilters = () => {
    setSortOrder('default');
    setDateRange(undefined);
    setSelectedLanguage('all');
    setMinLikes(0);
    setSelectedUsername('all');
  };

  const usernameOptions = [
    { value: 'all', label: t('all_users') },
    ...availableUsernames.map(username => ({ value: username, label: `@${username}` }))
  ];

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
          {t('sort_by_likes')}
        </label>
        <Select
          id="sort-by-likes"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          options={[
            { value: 'default', label: t('default_order') },
            { value: 'asc', label: t('ascending') },
            { value: 'desc', label: t('descending') },
          ]}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
          {t('date_added')}
        </label>
        <DateRangePicker
          date={dateRange}
          setDate={setDateRange}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
          {t('language_filter')}
        </label>
        <Select
          id="language-filter"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          options={[
            { value: 'all', label: t('all_languages') },
            ...languages.map((lang) => ({ value: lang, label: t(lang) || lang })),
          ]}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
          {t('min_likes')}
        </label>
        <input
          type="number"
          id="min-likes"
          value={minLikes}
          onChange={(e) => setMinLikes(Number(e.target.value))}
          className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">
          {t('filter_by_user')}
        </label>
        <Select
          id="username-filter"
          value={selectedUsername}
          onChange={(e) => setSelectedUsername(e.target.value)}
          options={usernameOptions}
        />
      </div>
      {isFilterActive && (
        <button onClick={onResetFilters} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors" aria-label={t('reset_filters')}>
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
