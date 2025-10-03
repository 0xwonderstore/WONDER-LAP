import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ children, ...props }) => (
  <div className="relative">
    <select
      {...props}
      className="w-full appearance-none cursor-pointer p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary text-right ltr:text-left ltr:pr-10 rtl:pl-10"
    >
      {children}
    </select>
    <ChevronDown className="w-5 h-5 absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-gray-400 pointer-events-none" />
  </div>
);

export default Select;