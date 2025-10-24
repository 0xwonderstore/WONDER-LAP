import React from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected = [], onChange, label }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <span className="block truncate">{label}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => handleToggle(option.value)}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${selected.includes(option.value) ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-200'}`}
              >
                <span className="font-normal block truncate">{option.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {selected.map(value => {
          const option = options.find(opt => opt.value === value);
          return (
            <div
              key={value}
              className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full px-2 py-1 text-sm"
            >
              <span>{option?.label}</span>
              <button
                type="button"
                onClick={() => handleRemove(value)}
                className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiSelect;