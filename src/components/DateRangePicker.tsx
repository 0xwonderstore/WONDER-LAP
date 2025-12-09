import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
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
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

export type ColorVariant = 'brand' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'indigo';

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
  icon?: React.ReactNode;
  variant?: ColorVariant;
  label?: string; // Add label prop for consistency
}

const colorStyles: Record<ColorVariant, { 
    activeRing: string; 
    activeBorder: string; 
    text: string; 
    bg: string; 
    bgHover: string;
    badge: string;
    icon: string;
  }> = {
    brand: { activeRing: 'ring-brand-primary/20', activeBorder: 'border-brand-primary', text: 'text-brand-primary', bg: 'bg-brand-primary/5', bgHover: 'hover:bg-brand-primary/5', badge: 'bg-brand-primary', icon: 'text-brand-primary' },
    blue: { activeRing: 'ring-blue-500/20', activeBorder: 'border-blue-500', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20', badge: 'bg-blue-500', icon: 'text-blue-500' },
    purple: { activeRing: 'ring-purple-500/20', activeBorder: 'border-purple-500', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', bgHover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20', badge: 'bg-purple-500', icon: 'text-purple-500' },
    green: { activeRing: 'ring-emerald-500/20', activeBorder: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20', badge: 'bg-emerald-500', icon: 'text-emerald-500' },
    orange: { activeRing: 'ring-orange-500/20', activeBorder: 'border-orange-500', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', bgHover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20', badge: 'bg-orange-500', icon: 'text-orange-500' },
    pink: { activeRing: 'ring-pink-500/20', activeBorder: 'border-pink-500', text: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20', bgHover: 'hover:bg-pink-50 dark:hover:bg-pink-900/20', badge: 'bg-pink-500', icon: 'text-pink-500' },
    teal: { activeRing: 'ring-teal-500/20', activeBorder: 'border-teal-500', text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', bgHover: 'hover:bg-teal-50 dark:hover:bg-teal-900/20', badge: 'bg-teal-500', icon: 'text-teal-500' },
    indigo: { activeRing: 'ring-indigo-500/20', activeBorder: 'border-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', bgHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20', badge: 'bg-indigo-500', icon: 'text-indigo-500' }
  };

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ date, setDate, className, icon, variant = 'brand', label }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(date);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const styles = colorStyles[variant];

  // Sync internal state with prop when prop changes
  useEffect(() => {
    setSelectedRange(date);
  }, [date]);

  // Handle clicks outside to close the picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedRange(date);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, date]);

  const handleApply = useCallback(() => {
    setDate(selectedRange);
    setIsOpen(false);
  }, [setDate, selectedRange]);

  const handleReset = useCallback(() => {
    setSelectedRange(undefined);
    setDate(undefined);
    setIsOpen(false);
  }, [setDate]);

  const suggestionRanges = [
    { label: t.last7days, getRange: () => {
        const to = new Date();
        const from = subDays(to, 6);
        return { from: startOfDay(from), to: endOfDay(to) };
    }},
    { label: t.last30days, getRange: () => {
        const to = new Date();
        const from = subDays(to, 29);
        return { from: startOfDay(from), to: endOfDay(to) };
    }},
    { label: t.last90days, getRange: () => {
        const to = new Date();
        const from = subDays(to, 89);
        return { from: startOfDay(from), to: endOfDay(to) };
    }},
    { label: t.last180days, getRange: () => {
        const to = new Date();
        const from = subDays(to, 179);
        return { from: startOfDay(from), to: endOfDay(to) };
    }},
    { label: t.thisMonth, getRange: () => {
        const today = new Date();
        return { from: startOfMonth(today), to: endOfMonth(today) };
    }},
    { label: t.lastMonth, getRange: () => {
        const today = new Date();
        const lastMonth = subMonths(today, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }},
    { label: t.thisYear, getRange: () => {
        const today = new Date();
        return { from: startOfYear(today), to: endOfYear(today) };
    }},
    { label: t.lastYear, getRange: () => {
        const today = new Date();
        const lastYear = subYears(today, 1);
        return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
    }},
    { label: t.lastSeason, getRange: () => {
        const today = new Date();
        const lastYearSameMonth = subYears(today, 1);
        const from = startOfMonth(lastYearSameMonth);
        const to = endOfMonth(addMonths(lastYearSameMonth, 3)); // Current month of last year + 3 months
        return { from: startOfDay(from), to: endOfDay(to) };
    }},
  ];

  const handleSuggestionClick = useCallback((getRange: () => DateRange) => {
    setSelectedRange(getRange());
  }, []);

  const footer = (
    <div className="p-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
      <button
        type="button"
        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 group"
        onClick={handleReset}
      >
        <span className="w-2 h-2 rounded-full bg-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        {t.resetFilters}
      </button>
      <button
        type="button"
        className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 ${styles.badge}`}
        onClick={handleApply}
      >
        {t.apply}
      </button>
    </div>
  );

  const formattedDateRange = () => {
    if (!date?.from) {
      return <span className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate">{label || t.all_time || 'All Time'}</span>;
    }
    const from = format(date.from, 'LLL dd, y');
    if (!date.to || isSameDay(date.from, date.to)) {
      return <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{from}</span>;
    }
    const to = format(date.to, 'LLL dd, y');
    return (
      <span className="font-bold text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
        {from} <span className="text-gray-400 mx-1 font-normal">-</span> {to}
      </span>
    );
  };

  return (
    <div className={`relative w-full h-full ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full pl-4 pr-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between transition-all duration-300 group relative z-0
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
                {date?.from && (
                     <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${styles.text}`}>
                        {label}
                     </span>
                )}
                
                <div className="truncate w-full text-left">
                    {formattedDateRange()}
                </div>
            </div>
        </div>
        
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? styles.bg : 'bg-transparent'}`}>
             <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? `rotate-180 ${styles.icon}` : 'text-gray-400'}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 z-[60] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row overflow-hidden animate-fade-in-up min-w-[320px] sm:min-w-[600px] ring-1 ring-black/5">
          {/* Suggestions Sidebar */}
          <div className="w-full sm:w-48 bg-gray-50/80 dark:bg-gray-800/80 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 p-3 sm:overflow-y-auto max-h-[200px] sm:max-h-none custom-scrollbar">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {t.suggestions}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
              {suggestionRanges.map((range) => {
                const suggestionRange = range.getRange();
                const isSelected = selectedRange?.from && selectedRange?.to &&
                                 isSameDay(selectedRange.from, suggestionRange.from) &&
                                 isSameDay(selectedRange.to, suggestionRange.to);
                return (
                  <button
                    key={range.label}
                    onClick={() => handleSuggestionClick(range.getRange)}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden group
                                ${isSelected 
                                    ? `${styles.badge} text-white font-medium shadow-md` 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }`}
                    type="button"
                  >
                    <span className="relative z-10">{range.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Area */}
          <div className="flex-1 p-2 sm:p-4 bg-white dark:bg-gray-800">
            <DayPicker
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              footer={footer}
              showOutsideDays
              numberOfMonths={1}
              pagedNavigation
              components={{
                IconLeft: ({ ...props }) => <ChevronLeft className={`w-5 h-5 text-gray-400 hover:${styles.icon} transition-colors`} />,
                IconRight: ({ ...props }) => <ChevronRight className={`w-5 h-5 text-gray-400 hover:${styles.icon} transition-colors`} />,
              }}
              classNames={{
                root: 'w-full font-sans',
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center mb-4',
                caption_label: 'text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-8 w-8 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex mb-2',
                head_cell: 'text-gray-400 w-9 font-semibold text-[0.8rem] uppercase tracking-wide',
                row: 'flex w-full mt-1',
                cell: `text-center text-sm p-0 relative [&:has([aria-selected])]:${styles.bg} first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20`,
                day: 'h-9 w-9 p-0 font-medium aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300',
                day_selected: `!${styles.badge} !text-white hover:opacity-90 shadow-md font-bold`,
                day_today: `bg-gray-100 dark:bg-gray-700 ${styles.text} font-bold border border-dashed border-current opacity-80`,
                day_outside: 'text-gray-300 dark:text-gray-600 opacity-50',
                day_disabled: 'text-gray-300 dark:text-gray-600 opacity-50',
                day_range_middle: `!${styles.bg} !${styles.text} !rounded-none`,
                day_range_start: `!${styles.badge} !text-white !rounded-l-lg !rounded-r-none`,
                day_range_end: `!${styles.badge} !text-white !rounded-r-lg !rounded-l-none`,
                day_hidden: 'invisible',
              }}
            />
          </div>
        </div>
      )}

      {/* Selected Tags (Below) - Clean Pill Design */}
        {date?.from && (
            <div className="absolute top-full left-0 mt-3 w-full z-10 pointer-events-none"> 
                <div className="flex flex-wrap gap-2 pointer-events-auto">
                    <div className={`flex items-center gap-1.5 ${styles.badge} text-white shadow-lg shadow-gray-200 dark:shadow-black/20 rounded-lg pl-2.5 pr-1 py-1 text-[10px] font-bold uppercase tracking-wider animate-pop-in border border-white/20`}>
                        <span className="max-w-[150px] truncate">{formattedDateRange()}</span>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDate(undefined); }}
                            className="hover:bg-white/20 text-white rounded-md p-0.5 transition-colors"
                        >
                            <X size={10} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
