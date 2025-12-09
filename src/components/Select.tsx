import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
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

  // Filter options based on search (only if options > 5 for better UX)
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (optionValue: string) => {
    // Mimic standard event object for compatibility
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
        className={`w-full h-full text-left flex items-center justify-between px-3 py-2 rounded-xl border bg-gray-50 dark:bg-gray-700/50 transition-all duration-200
            ${isOpen 
                ? 'border-pink-500 ring-2 ring-pink-500/20 bg-white dark:bg-gray-800' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
      >
        <span className={`block truncate text-sm ${!selectedOption?.value && selectedOption?.value !== '' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up overflow-hidden">
          {/* Search Bar (Only if many options) */}
          {options.length > 8 && (
             <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg border-none focus:ring-1 focus:ring-pink-500 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
             </div>
          )}
          
          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`cursor-pointer select-none relative py-2.5 px-4 text-sm flex items-center justify-between transition-colors
                    ${value === option.value 
                        ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && <Check className="w-4 h-4 text-pink-500" />}
                </li>
                ))
            ) : (
                <li className="py-3 px-4 text-center text-sm text-gray-400 italic">
                    No options found
                </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
