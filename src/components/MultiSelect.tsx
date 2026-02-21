import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, X, Check, Search, AlertCircle } from 'lucide-react';

export type ColorVariant = 'brand' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'indigo';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  className?: string;
  icon?: React.ReactNode;
  variant?: ColorVariant;
}

const colorStyles: Record<ColorVariant, { 
  activeRing: string; 
  activeBorder: string; 
  text: string; 
  bg: string; 
  bgHover: string;
  badge: string;
  checkbox: string;
  icon: string;
}> = {
  brand: { 
    activeRing: 'ring-brand-primary/20', activeBorder: 'border-brand-primary', text: 'text-brand-primary', 
    bg: 'bg-brand-primary/5', bgHover: 'hover:bg-brand-primary/5', badge: 'bg-brand-primary', 
    checkbox: 'text-brand-primary', icon: 'text-brand-primary'
  },
  blue: { 
    activeRing: 'ring-blue-500/20', activeBorder: 'border-blue-500', text: 'text-blue-600 dark:text-blue-400', 
    bg: 'bg-blue-50 dark:bg-blue-900/20', bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20', badge: 'bg-blue-500', 
    checkbox: 'text-blue-500', icon: 'text-blue-500'
  },
  purple: { 
    activeRing: 'ring-purple-500/20', activeBorder: 'border-purple-500', text: 'text-purple-600 dark:text-purple-400', 
    bg: 'bg-purple-50 dark:bg-purple-900/20', bgHover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20', badge: 'bg-purple-500', 
    checkbox: 'text-purple-500', icon: 'text-purple-500'
  },
  green: { 
    activeRing: 'ring-emerald-500/20', activeBorder: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20', badge: 'bg-emerald-500', 
    checkbox: 'text-emerald-500', icon: 'text-emerald-500'
  },
  orange: { 
    activeRing: 'ring-orange-500/20', activeBorder: 'border-orange-500', text: 'text-orange-600 dark:text-orange-400', 
    bg: 'bg-orange-50 dark:bg-orange-900/20', bgHover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20', badge: 'bg-orange-500', 
    checkbox: 'text-orange-500', icon: 'text-orange-500'
  },
  pink: {
    activeRing: 'ring-pink-500/20', activeBorder: 'border-pink-500', text: 'text-pink-600 dark:text-pink-400', 
    bg: 'bg-pink-50 dark:bg-pink-900/20', bgHover: 'hover:bg-pink-50 dark:hover:bg-pink-900/20', badge: 'bg-pink-500', 
    checkbox: 'text-pink-500', icon: 'text-pink-500'
  },
  teal: {
    activeRing: 'ring-teal-500/20', activeBorder: 'border-teal-500', text: 'text-teal-600 dark:text-teal-400', 
    bg: 'bg-teal-50 dark:bg-teal-900/20', bgHover: 'hover:bg-teal-50 dark:hover:bg-teal-900/20', badge: 'bg-teal-500', 
    checkbox: 'text-teal-500', icon: 'text-teal-500'
  },
  indigo: {
    activeRing: 'ring-indigo-500/20', activeBorder: 'border-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', 
    bg: 'bg-indigo-50 dark:bg-indigo-900/20', bgHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20', badge: 'bg-indigo-500', 
    checkbox: 'text-indigo-500', icon: 'text-indigo-500'
  }
};

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected = [], onChange, label, className, icon, variant = 'brand' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const styles = colorStyles[variant] || colorStyles.brand;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
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

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== value));
  };

  const filteredOptions = options.filter(option => 
    (option.label || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative w-full h-full ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300 group relative z-0
            ${isOpen 
                ? `ring-4 ${styles.activeRing} ${styles.activeBorder} shadow-lg scale-[1.02]` 
                : `hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5`
            }`}
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className={`p-2 rounded-xl transition-colors duration-300 ${isOpen ? styles.bg : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                <span className={`transition-colors duration-300 ${isOpen ? styles.icon : 'text-gray-500 dark:text-gray-400'}`}>
                    {icon}
                </span>
            </div>
            
            <div className="flex flex-col items-start overflow-hidden">
                {(isOpen || selected.length > 0) && (
                     <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${styles.text}`}>
                        {label}
                     </span>
                )}
                
                {selected.length === 0 ? (
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate">{isOpen ? '' : label}</span>
                ) : (
                    <div className="flex flex-wrap gap-1.5 items-center">
                         <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                            {selected.length === 1 
                                ? options.find(o => o.value === selected[0])?.label 
                                : `${selected.length} Selected`
                            }
                         </span>
                    </div>
                )}
            </div>
        </div>
        
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? styles.bg : 'bg-transparent'}`}>
             <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? `rotate-180 ${styles.icon}` : 'text-gray-400'}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-full z-50 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 animate-fade-in-up overflow-hidden ring-1 ring-black/5">
           {/* Search Bar */}
           {options.length > 5 && (
             <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="relative group">
                    <Search className={`w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:${styles.icon}`} />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className={`w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all focus:ring-2 ${styles.activeRing} ${styles.activeBorder}`}
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
             </div>
          )}

          <ul className="max-h-60 overflow-y-auto py-2 custom-scrollbar scroll-smooth p-2 space-y-1">
            {filteredOptions.length > 0 ? (
                filteredOptions.map(option => {
                const isSelected = selected.includes(option.value);
                return (
                    <li
                        key={option.value}
                        onClick={() => handleToggle(option.value)}
                        className={`cursor-pointer select-none relative py-2.5 px-3 rounded-xl text-sm flex items-center justify-between transition-all duration-200 group
                            ${isSelected 
                                ? `${styles.bg} ${styles.text} font-bold` 
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/80'
                            }`}
                    >
                        <div className="flex items-center gap-3 truncate">
                             <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? `${styles.badge} border-transparent` : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                 {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                             </div>
                             <span className="truncate">{option.label}</span>
                        </div>
                    </li>
                );
                })
            ) : (
                <li className="py-8 px-4 text-center flex flex-col items-center gap-2 text-gray-400">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <span className="text-xs font-medium italic">No options found</span>
                </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Selected Tags (Below) - Clean Pill Design */}
      {selected.length > 0 && (
          <div className="absolute top-full left-0 mt-3 w-full z-10 pointer-events-none"> 
            <div className="flex flex-wrap gap-2 pointer-events-auto">
                {selected.slice(0, 3).map(value => {
                const option = options.find(opt => opt.value === value);
                return (
                    <div
                    key={value}
                    className={`flex items-center gap-1.5 ${styles.badge} text-white shadow-lg shadow-gray-200 dark:shadow-black/20 rounded-lg pl-2.5 pr-1 py-1 text-[10px] font-bold uppercase tracking-wider animate-pop-in border border-white/20`}
                    >
                    <span className="max-w-[80px] truncate">{option?.label}</span>
                    <button
                        type="button"
                        onClick={(e) => handleRemove(e, value)}
                        className="hover:bg-white/20 text-white rounded-md p-0.5 transition-colors"
                    >
                        <X size={10} strokeWidth={3} />
                    </button>
                    </div>
                );
                })}
                {selected.length > 3 && (
                    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg px-2 py-1 text-[10px] font-bold shadow-sm border border-gray-200 dark:border-gray-600">
                        +{selected.length - 3} More
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  );
};

export default MultiSelect;
