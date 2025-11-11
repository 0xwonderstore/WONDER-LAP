import React from 'react';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import Select from './Select';
import MultiSelect from './MultiSelect';
import { ArrowUp, ArrowDown, X } from 'lucide-react';

interface InstagramFilterComponentProps {
  usernames: string[];
  filters: {
    username: string;
    minLikes: number | null;
    maxLikes: number | null;
    languages: string[];
  };
  onFilterChange: (filters: Partial<InstagramFilterComponentProps['filters']>) => void;
  onSortChange: (sort: 'asc' | 'desc' | null) => void;
  onReset: () => void;
  currentSort: 'asc' | 'desc' | null;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

const InstagramFilterComponent: React.FC<InstagramFilterComponentProps> = ({
  usernames,
  filters,
  onFilterChange,
  onSortChange,
  onReset,
  currentSort,
  date,
  onDateChange,
}) => {
  const { t } = useTranslation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleLikesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value === '' ? null : Number(value) });
  };

  const handleLanguagesChange = (selectedLanguages: string[]) => {
    onFilterChange({ languages: selectedLanguages });
  };
  
  const usernameOptions = [
    { value: '', label: `${t('all_users')} (${usernames.length})` },
    ...usernames.sort().map(user => ({ value: user, label: user }))
  ];

  const languageOptions = [
    { value: 'es', label: t('spanish') },
    { value: 'en', label: t('english') },
    { value: 'it', label: t('italian') },
    { value: 'ru', label: t('russian') },
    { value: 'zh', label: t('chinese') },
    { value: 'ar', label: t('arabic') },
    { value: 'fa', label: t('persian') },
    { value: 'fr', label: t('french') },
    { value: 'hi', label: t('hindi') },
  ];
  
  const isFilterActive = filters.username !== '' || filters.minLikes !== null || filters.maxLikes !== null || filters.languages.length > 0 || date !== undefined || currentSort !== null;

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Username Filter */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t('select_user')}</label>
              <Select id="username" name="username" value={filters.username} onChange={handleInputChange} options={usernameOptions} />
            </div>

            {/* Language Filter */}
            <div>
              <label htmlFor="languages" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t('select_language')}</label>
              <MultiSelect 
                options={languageOptions} 
                selected={filters.languages}
                onChange={handleLanguagesChange}
                label={t('select_language')}
              />
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t('date_posted')}</label>
              <DateRangePicker date={date} setDate={onDateChange} />
            </div>

            {/* Likes Range Filter */}
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t('likes_range')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minLikes"
                  placeholder={t('min_likes')}
                  value={filters.minLikes ?? ''}
                  onChange={handleLikesChange}
                  className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
                />
                <span className="text-light-text-secondary dark:text-dark-text-secondary">-</span>
                <input
                  type="number"
                  name="maxLikes"
                  placeholder={t('max_likes')}
                  value={filters.maxLikes ?? ''}
                  onChange={handleLikesChange}
                  className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
                <div className='flex-grow'>
                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 px-2">{t('sort_by_likes')}</label>
                    <div className="flex rounded-xl border border-light-border dark:border-dark-border overflow-hidden h-[46px]">
                        <button
                          onClick={() => onSortChange('desc')}
                          className={`w-full flex items-center justify-center gap-1 transition-colors ${currentSort === 'desc' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background hover:bg-light-border dark:hover:bg-dark-border'}`}
                        >
                          <ArrowDown size={16} /> {t('descending')}
                        </button>
                        <button
                          onClick={() => onSortChange('asc')}
                          className={`w-full flex items-center justify-center gap-1 transition-colors ${currentSort === 'asc' ? 'bg-brand-primary text-white' : 'bg-light-background dark:bg-dark-background hover:bg-light-border dark:hover:bg-dark-border'}`}
                        >
                          <ArrowUp size={16} /> {t('ascending')}
                        </button>
                    </div>
                </div>
                 {isFilterActive && (
                    <button onClick={onReset} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors h-[46px]" aria-label={t.resetFilters}>
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default InstagramFilterComponent;
