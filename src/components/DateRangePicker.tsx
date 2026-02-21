import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  addMonths,
} from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown, X, Check } from 'lucide-react';

// Use standard react-day-picker styles
import 'react-day-picker/dist/style.css';

export type ColorVariant = 'brand' | 'pink' | 'blue' | 'purple' | 'green';

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
  icon?: React.ReactNode;
  variant?: ColorVariant;
  label?: string;
}

const variantStyles: Record<ColorVariant, { 
    accent: string; 
    bg: string;
    text: string;
    border: string;
    ring: string;
}> = {
    brand: { accent: '#ec4899', bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', ring: 'ring-pink-500/20' },
    pink: { accent: '#ec4899', bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', ring: 'ring-pink-500/20' },
    blue: { accent: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', ring: 'ring-blue-500/20' },
    purple: { accent: '#a855f7', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', ring: 'ring-purple-500/20' },
    green: { accent: '#22c55e', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', ring: 'ring-green-500/20' },
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
    date, 
    setDate, 
    className = "", 
    icon, 
    variant = 'brand',
    label 
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(date);
  const containerRef = useRef<HTMLDivElement>(null);
  const styles = variantStyles[variant] || variantStyles.brand;
  
  const locale = language === 'ar' ? arSA : enUS;

  // Sync internal state with prop
  useEffect(() => {
    setTempRange(date);
  }, [date]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    setDate(tempRange);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    setTempRange(undefined);
    setIsOpen(false);
  };

  const suggestions = [
    { label: t.today, range: { from: startOfDay(new Date()), to: endOfDay(new Date()) } },
    { label: t.yesterday, range: { from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) } },
    { label: t.last7days, range: { from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) } },
    { label: t.last30days, range: { from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) } },
    { label: t.last90days, range: { from: startOfDay(subDays(new Date(), 89)), to: endOfDay(new Date()) } },
    { label: t.last180days, range: { from: startOfDay(subDays(new Date(), 179)), to: endOfDay(new Date()) } },
    { label: t.thisMonth, range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
    { label: t.lastMonth, range: { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) } },
    { 
        label: t.lastSeason, 
        range: { 
            from: startOfMonth(subYears(new Date(), 1)), 
            to: endOfMonth(addMonths(startOfMonth(subYears(new Date(), 1)), 4)) 
        } 
    },
    { label: t.thisYear, range: { from: startOfYear(new Date()), to: endOfYear(new Date()) } },
    { label: t.lastYear, range: { from: startOfYear(subYears(new Date(), 1)), to: endOfYear(subYears(new Date(), 1)) } },
  ];

  const applySuggestion = (range: DateRange) => {
    setTempRange(range);
    setDate(range); // Suggestions apply immediately
    setIsOpen(false);
  };

  const isRangeSelected = (range: DateRange) => {
    if (!tempRange?.from || !tempRange?.to) return false;
    return isSameDay(tempRange.from, range.from!) && isSameDay(tempRange.to, range.to!);
  };

  const formatDisplayDate = () => {
    if (!date?.from) return label || t.date;
    const fromStr = format(date.from, 'dd MMM', { locale });
    if (!date.to || isSameDay(date.from, date.to)) return fromStr;
    const toStr = format(date.to, 'dd MMM', { locale });
    return `${fromStr} - ${toStr}`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[72px] text-left bg-white dark:bg-gray-800 border rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300 group
            ${isOpen 
                ? `ring-4 ${styles.ring} ${styles.activeBorder} shadow-lg scale-[1.02]` 
                : `hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5`
            }`}
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className={`p-2 rounded-xl transition-colors duration-300 ${isOpen || date?.from ? styles.bg : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                <span className={`transition-colors duration-300 ${isOpen || date?.from ? styles.text : 'text-gray-500 dark:text-gray-400'}`}>
                    {icon}
                </span>
            </div>
            
            <div className="flex flex-col items-start overflow-hidden">
                {(isOpen || date?.from) && (
                     <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${styles.text}`}>
                        {label}
                     </span>
                )}
                <span className={`text-sm font-medium truncate ${date?.from ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formatDisplayDate()}
                </span>
            </div>
        </div>
        
         <div className="flex items-center gap-2">
            {date && (
                <div 
                    onClick={handleClear}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X size={14} />
                </div>
            )}
            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full mt-2 z-[100] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-50 duration-200 origin-top
            ${language === 'ar' ? 'right-0' : 'left-0'}`}>
          {/* Suggestions List */}
          <div className="w-full md:w-56 bg-gray-50 dark:bg-gray-800/50 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-3 space-y-1 overflow-y-auto max-h-[400px]">
             <div className="px-2 pb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.suggestions}</span>
             </div>
             {suggestions.map((item, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={() => applySuggestion(item.range)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between group
                        ${isRangeSelected(item.range)
                            ? `bg-${variant}-500 text-white shadow-md`
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                        }`}
                >
                    <span className={isRangeSelected(item.range) ? 'opacity-100' : 'opacity-0'}>
                        <Check size={14} />
                    </span>
                    <span>{item.label}</span>
                </button>
             ))}
          </div>

          {/* Calendar Section */}
          <div className="p-4 flex flex-col bg-white dark:bg-gray-900">
            <DayPicker
              mode="range"
              selected={tempRange}
              onSelect={setTempRange}
              locale={locale}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              className="m-0 border-none"
              modifiersClassNames={{
                selected: `${styles.bg} ${styles.text} font-bold`,
                today: `text-${variant}-500 font-extrabold`,
                range_start: 'rounded-l-full',
                range_end: 'rounded-r-full',
                range_middle: `!${styles.text} !bg-opacity-80`
              }}
              styles={{
                day: { 
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid transparent',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '100%'
                },
                head: { color: styles.accent }
              }}
            />
            
            {/* Footer Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2 transition-colors"
                >
                    {t.cancel}
                </button>
                <button
                    type="button"
                    onClick={handleApply}
                    className={`bg-${variant}-500 hover:bg-${variant}-600 text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg shadow-${variant}-500/20 transition-all active:scale-95`}
                >
                    {t.apply}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
