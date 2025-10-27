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
  isWithinInterval,
} from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

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
    { label: t.today, getRange: () => {
        const today = new Date();
        return { from: startOfDay(today), to: endOfDay(today) };
    }},
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
  ];

  const handleSuggestionClick = useCallback((getRange: () => DateRange) => {
    setSelectedRange(getRange());
  }, []);

  const footer = (
    <div className="p-2 flex justify-end gap-2 border-t border-light-border dark:border-dark-border mt-2">
      <button
        type="button"
        className="px-4 py-2 text-sm bg-light-surface dark:bg-dark-surface rounded-md hover:bg-light-border dark:hover:bg-dark-border transition-colors"
        onClick={handleReset}
      >
        {t.resetFilters}
      </button>
      <button
        type="button"
        className="px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
        onClick={handleApply}
      >
        {t.apply}
      </button>
    </div>
  );

  const formattedDateRange = () => {
    if (!date?.from) {
      return <span>{t.all_time || 'All Time'}</span>;
    }
    const from = format(date.from, 'LLL dd, y');
    if (!date.to || isSameDay(date.from, date.to)) {
      return <span>{from}</span>;
    }
    const to = format(date.to, 'LLL dd, y');
    return (
      <>
        {from} - {to}
      </>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary text-light-text-primary dark:text-dark-text-primary flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-light-text-secondary dark:text-dark-text-secondary" />
          {formattedDateRange()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 z-10 bg-light-surface dark:bg-dark-surface p-4 rounded-lg shadow-lg border border-light-border dark:border-dark-border flex">
          <div className="border-r border-light-border dark:border-dark-border pr-4">
            <h3 className="text-sm font-semibold mb-2 px-2">{t.suggestions}</h3>
            <div className="flex flex-col gap-1">
              {suggestionRanges.map((range) => {
                const suggestionRange = range.getRange();
                const isSelected = selectedRange?.from && selectedRange?.to &&
                                 isSameDay(selectedRange.from, suggestionRange.from) &&
                                 isSameDay(selectedRange.to, suggestionRange.to);
                return (
                  <button
                    key={range.label}
                    onClick={() => handleSuggestionClick(range.getRange)}
                    className={`text-left text-sm whitespace-nowrap px-2 py-1.5 rounded-md transition-colors
                                ${isSelected ? 'bg-brand-primary text-white hover:bg-brand-primary/90' : 'hover:bg-light-border dark:hover:bg-dark-border'}`}
                    type="button"
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pl-4">
            <DayPicker
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              footer={footer}
              classNames={{
                caption: 'flex justify-center items-center h-10',
                head_cell: 'w-10 h-10 font-medium text-light-text-secondary dark:text-dark-text-secondary',
                cell: 'w-10 h-10',
                day: 'w-10 h-10 rounded-full text-light-text-primary dark:text-dark-text-primary hover:bg-light-border dark:hover:bg-dark-border',
                day_selected: 'bg-brand-primary text-white hover:bg-brand-primary/90',
                day_today: 'font-bold text-brand-primary',
                day_outside: 'text-light-text-secondary dark:text-dark-text-secondary opacity-50',
                day_disabled: 'text-light-text-secondary dark:text-dark-text-secondary opacity-50',
                day_range_start: 'bg-brand-primary text-white rounded-l-full',
                day_range_end: 'bg-brand-primary text-white rounded-r-full',
                day_range_middle: 'bg-brand-primary/20 rounded-none text-brand-primary/80',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};