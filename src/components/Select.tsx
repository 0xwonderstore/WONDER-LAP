import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  id: string;
  value: any;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: any; label: string }[];
  className?: string;
}

const Select: React.FC<SelectProps> = ({ id, value, onChange, options, className }) => (
  <div className={`relative ${className}`}>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full appearance-none cursor-pointer p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary text-right ltr:text-left ltr:pr-10 rtl:pl-10"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="w-5 h-5 absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-gray-400 pointer-events-none" />
  </div>
);

export default Select;
