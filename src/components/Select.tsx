import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ options, value, onChange, className }) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-3 pr-10 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </div>
  );
};

export default Select;
