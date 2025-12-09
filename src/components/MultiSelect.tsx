import React, { useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

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
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation(); // Prevent opening the dropdown when clicking remove
    onChange(selected.filter(item => item !== value));
  };

  return (
    <div className="relative w-full h-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full text-left bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 flex items-center justify-between transition-all duration-200
            ${isOpen 
                ? 'ring-2 ring-pink-500/50 border-pink-500 bg-white dark:bg-gray-800' 
                : 'hover:border-gray-300 dark:hover:border-gray-500'
            }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
            {selected.length === 0 ? (
                <span className="text-gray-500 dark:text-gray-400 text-sm truncate">{label}</span>
            ) : (
                <div className="flex flex-wrap gap-1 max-h-[30px] overflow-hidden">
                    {/* Only show first 1 or 2 items if selected, or a count badge */}
                     {selected.length > 2 ? (
                         <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                             {selected.length} Selected
                         </span>
                     ) : (
                        selected.map(value => {
                            const option = options.find(opt => opt.value === value);
                            return (
                                <span key={value} className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
                                    {option?.label}{selected.indexOf(value) !== selected.length - 1 ? ',' : ''}
                                </span>
                            );
                        })
                     )}
                </div>
            )}
        </div>
        
        <span className="flex items-center pl-2 pointer-events-none text-gray-400">
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
            {options.map(option => {
              const isSelected = selected.includes(option.value);
              return (
                <li
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className={`cursor-pointer select-none relative py-2.5 px-4 text-sm flex items-center justify-between transition-colors
                        ${isSelected 
                            ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 font-medium' 
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-pink-500" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Selected tags display outside or hidden if handled inside button above. 
          Given the height constraint, usually it's better to show them as tags below 
          or concise text inside. Let's keep the tags below for clarity but style them better,
          OR make them absolutely positioned popover? 
          Actually, let's keep them below but smaller, or integrated better.
          
          For this specific UI request "improve sizes", I'll put them nicely inside the input if space permits,
          or keep the tags below but smaller.
          Since the input has fixed height 42px now, tags below is safer for layout.
      */}
      {selected.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full">
            <div className="flex flex-wrap gap-1.5 p-1">
                {selected.map(value => {
                const option = options.find(opt => opt.value === value);
                return (
                    <div
                    key={value}
                    className="flex items-center gap-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50 rounded-lg px-2 py-0.5 text-xs font-medium animate-fade-in"
                    >
                    <span>{option?.label}</span>
                    <button
                        type="button"
                        onClick={(e) => handleRemove(e, value)}
                        className="text-pink-500 hover:text-pink-800 dark:hover:text-pink-100 p-0.5 rounded-full hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
                    >
                        <X size={12} />
                    </button>
                    </div>
                );
                })}
            </div>
          </div>
      )}
    </div>
  );
};

export default MultiSelect;