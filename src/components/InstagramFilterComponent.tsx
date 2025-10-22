import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import Select from './Select';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { instagramLanguageMapping } from '../data/instagramLanguageMapping';

interface InstagramFilterComponentProps {
  usernames: string[];
  filters: {
    username: string;
    minLikes: number | null;
    maxLikes: number | null;
    language: string;
  };
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: 'asc' | 'desc' | null) => void;
  onDateChange: (dateRange: DateRange | undefined) => void;
  onReset: () => void;
  currentSort: 'asc' | 'desc' | null;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

const InstagramFilterComponent: React.FC<InstagramFilterComponentProps> = ({
  usernames,
  filters,
  onFilterChange,
  onSortChange,
  onReset,
  currentSort,
  date,
  setDate,
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
  
  const usernameOptions = [
    { value: '', label: `${t('all_users')} (${usernames.length})` },
    ...usernames.sort().map(user => ({ value: user, label: user }))
  ];

  const languageOptions = [
    { value: '', label: t('all_languages') },
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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Username Filter */}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('select_user')}</label>
          <Select id="username" name="username" value={filters.username} onChange={handleInputChange} options={usernameOptions} />
        </div>

        {/* Language Filter */}
        <div>
          <label htmlFor="language" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('select_language')}</label>
          <Select id="language" name="language" value={filters.language} onChange={handleInputChange} options={languageOptions} />
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('date_posted')}</label>
          <DateRangePicker date={date} setDate={setDate} />
        </div>

        {/* Likes Range Filter */}
        <div>
           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('likes_range')}</label>
           <div className="flex items-center gap-2">
            <input
              type="number"
              name="minLikes"
              placeholder={t('min_likes')}
              value={filters.minLikes ?? ''}
              onChange={handleLikesChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <span className="text-gray-500 dark:text-gray-400">-</span>
            <input
              type="number"
              name="maxLikes"
              placeholder={t('max_likes')}
              value={filters.maxLikes ?? ''}
              onChange={handleLikesChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-between items-center">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('sort_by_likes')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => onSortChange('desc')}
              className={`px-4 py-2 rounded-md flex items-center gap-1 transition-colors ${currentSort === 'desc' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              <ArrowDown size={16} /> {t('descending')}
            </button>
            <button
              onClick={() => onSortChange('asc')}
              className={`px-4 py-2 rounded-md flex items-center gap-1 transition-colors ${currentSort === 'asc' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              <ArrowUp size={16} /> {t('ascending')}
            </button>
          </div>
        </div>
        <div className="self-end">
            <button
            onClick={onReset}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md"
            >
            {t('resetFilters')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramFilterComponent;