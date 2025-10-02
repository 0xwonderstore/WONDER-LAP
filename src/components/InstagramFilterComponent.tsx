
import { useTranslation } from 'react-i18next';
import { Select } from './Select';
import { DateRangePicker } from './DateRangePicker';

interface InstagramFilterComponentProps {
  sortOrder: string;
  setSortOrder: (order: string) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  minLikes: number;
  setMinLikes: (likes: number) => void;
}

export function InstagramFilterComponent({
  sortOrder,
  setSortOrder,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedLanguage,
  setSelectedLanguage,
  minLikes,
  setMinLikes,
}: InstagramFilterComponentProps) {
  const { t } = useTranslation();

  const languages = ['en', 'ar'];

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('sortByLikes')}
        </label>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          options={[
            { value: 'default', label: t('defaultOrder') },
            { value: 'asc', label: t('ascending') },
            { value: 'desc', label: t('descending') },
          ]}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('dateAdded')}
        </label>
        <DateRangePicker
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('language_filter')}
        </label>
        <Select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          options={[
            { value: 'all', label: t('all_languages') },
            ...languages.map((lang) => ({ value: lang, label: lang })),
          ]}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('minLikes')}
        </label>
        <input
          type="number"
          value={minLikes}
          onChange={(e) => setMinLikes(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );
}
