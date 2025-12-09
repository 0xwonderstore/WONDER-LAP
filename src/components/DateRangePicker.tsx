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
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ date, setDate }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(date);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal state with prop when prop changes
  useEffect(() => {
    setSelectedRange(date);
  }, [date]);

  // Handle clicks outside to close the picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset internal selection to the last applied date when closing
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
    /* Removed Today and Yesterday as requested */
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
        className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
        onClick={handleReset}
      >
        <span className="w-2 h-2 rounded-full bg-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        {t.resetFilters}
      </button>
      <button
        type="button"
        className="px-5 py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg shadow-md shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:bg-brand-primary/90 transition-all active:scale-95"
        onClick={handleApply}
      >
        {t.apply}
      </button>
    </div>
  );

  const formattedDateRange = () => {
    if (!date?.from) {
      return <span className="text-gray-400 dark:text-gray-500 italic">{t.all_time || 'All Time'}</span>;
    }
    const from = format(date.from, 'LLL dd, y');
    if (!date.to || isSameDay(date.from, date.to)) {
      return <span className="font-medium text-gray-700 dark:text-gray-200">{from}</span>;
    }
    const to = format(date.to, 'LLL dd, y');
    return (
      <span className="font-medium text-gray-700 dark:text-gray-200">
        {from} <span className="text-gray-400 mx-1">-</span> {to}
      </span>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-3 pr-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between transition-all duration-200 group
            ${isOpen 
                ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-white dark:bg-gray-800' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-white'}`}>
                <CalendarIcon className="h-4 w-4" />
            </div>
            <div className="truncate text-sm">
                {formattedDateRange()}
            </div>
        </div>
        {date?.from && (
            <div className="flex shrink-0 w-2 h-2 rounded-full bg-brand-primary"></div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row overflow-hidden animate-fade-in-up min-w-[320px] sm:min-w-[600px]">
          {/* Suggestions Sidebar */}
          <div className="w-full sm:w-48 bg-gray-50/80 dark:bg-gray-800/80 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 p-3 sm:overflow-y-auto max-h-[200px] sm:max-h-none">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">{t.suggestions}</h3>
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
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden
                                ${isSelected 
                                    ? 'bg-brand-primary text-white font-medium shadow-md shadow-brand-primary/20' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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
          <div className="flex-1 p-2 sm:p-4">
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
                IconLeft: ({ ...props }) => <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />,
                IconRight: ({ ...props }) => <ChevronRight className="w-5 h-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />,
              }}
              classNames={{
                root: 'w-full',
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center mb-4',
                caption_label: 'text-base font-bold text-gray-800 dark:text-gray-100',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-8 w-8 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-gray-400 rounded-md w-9 font-normal text-[0.8rem] uppercase tracking-wide',
                row: 'flex w-full mt-2',
                cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-700 dark:text-gray-300',
                day_selected: '!bg-brand-primary !text-white hover:!bg-brand-primary/90 hover:!text-white shadow-md shadow-brand-primary/30',
                day_today: 'bg-gray-100 dark:bg-gray-800 text-brand-primary font-bold border border-gray-200 dark:border-gray-600',
                day_outside: 'text-gray-300 dark:text-gray-600 opacity-50',
                day_disabled: 'text-gray-300 dark:text-gray-600 opacity-50',
                day_range_middle: '!bg-brand-primary/10 !text-brand-primary !rounded-none',
                day_range_start: '!bg-brand-primary !text-white !rounded-l-md !rounded-r-none',
                day_range_end: '!bg-brand-primary !text-white !rounded-r-md !rounded-l-none',
                day_hidden: 'invisible',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
