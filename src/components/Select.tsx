import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, AlertCircle } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode; 
}

interface SelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: any) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ 
  id, 
  name, 
  value, 
  onChange, 
  options = [], 
  className,
  placeholder = "Select..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter(option => 
    (option.label || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Clear search on close
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Focus search input when opening
  useEffect(() => {
      if (isOpen && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    const event = {
      target: {
        name: name,
        value: optionValue
      }
    };
    onChange(event);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative w-full h-full ${className}`} ref={wrapperRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full text-left flex items-center justify-between px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 transition-all duration-300 group
            ${isOpen 
                ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-white dark:bg-gray-800 shadow-md' 
                : 'border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 dark:hover:border-brand-primary/50 hover:shadow-sm'
            }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
            {selectedOption?.icon && (
                <span className="text-brand-primary">{selectedOption.icon}</span>
            )}
            <span className={`block truncate text-sm font-medium ${!selectedOption?.value && selectedOption?.value !== '' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                {selectedOption ? selectedOption.label : placeholder}
            </span>
        </div>
        <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-brand-primary ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-fade-in-up overflow-hidden ring-1 ring-black/5">
          {/* Search Bar (Only if many options) */}
          {options.length > 5 && (
             <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="relative group">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-brand-primary transition-colors" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
             </div>
          )}
          
          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar scroll-smooth">
            {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`cursor-pointer select-none relative py-2.5 px-4 text-sm flex items-center justify-between transition-all duration-200 group
                    ${value === option.value 
                        ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/80 hover:pl-5'
                    }`}
                >
                    <div className="flex items-center gap-2 truncate">
                        {option.icon && (
                            <span className={`opacity-70 group-hover:opacity-100 transition-opacity ${value === option.value ? 'opacity-100' : ''}`}>
                                {option.icon}
                            </span>
                        )}
                        <span className="truncate">{option.label}</span>
                    </div>
                    
                    {value === option.value && (
                        <Check className="w-4 h-4 text-brand-primary animate-scale-in" />
                    )}
                </li>
                ))
            ) : (
                <li className="py-8 px-4 text-center flex flex-col items-center gap-2 text-gray-400">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <span className="text-xs font-medium italic">No options found</span>
                </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
