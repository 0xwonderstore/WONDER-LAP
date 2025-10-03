import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
import Select from './Select';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface InstagramFilterComponentProps {
  usernames: string[];
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
  onFilterChange,
  onSortChange,
  onDateChange,
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

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Picker */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date_posted')}</label>
          <DateRangePicker date={date} setDate={setDate} />
        </div>

        {/* Username Filter */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('select_user')}</label>
          <Select id="username" name="username" onChange={handleInputChange}>
            <option value="">{t('all_users')}</option>
            {usernames.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </Select>
        </div>
        
        {/* Likes Range Filter */}
        <div className="lg:col-span-1">
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('likes_range')}</label>
           <div className="flex items-center gap-2">
            <input
              type="number"
              name="minLikes"
              placeholder={t('min_likes')}
              onChange={handleLikesChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <span className="text-gray-500 dark:text-gray-400">-</span>
            <input
              type="number"
              name="maxLikes"
              placeholder={t('max_likes')}
              onChange={handleLikesChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

      </div>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sort_by_likes')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => onSortChange('desc')}
              className={`px-4 py-2 rounded-md flex items-center gap-1 ${currentSort === 'desc' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <ArrowDown size={16} /> {t('descending')}
            </button>
            <button
              onClick={() => onSortChange('asc')}
              className={`px-4 py-2 rounded-md flex items-center gap-1 ${currentSort === 'asc' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <ArrowUp size={16} /> {t('ascending')}
            </button>
          </div>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          {t('resetFilters')}
        </button>
      </div>
    </div>
  );
};

export default InstagramFilterComponent;