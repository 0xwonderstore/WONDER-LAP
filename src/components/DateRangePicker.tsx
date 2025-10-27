import React, { useState, useRef, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { format, subDays, subYears, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ date, setDate }) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  // Internal state to hold the selection before applying
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(date);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync internal state if the parent prop changes
    setSelectedRange(date);
  }, [date]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset selection to the applied one when closing
        setSelectedRange(date); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, date]);

  const handleApply = () => {
    setDate(selectedRange);
    setIsOpen(false);
  }

  const handleReset = () => {
    setSelectedRange(undefined);
    setDate(undefined);
    setIsOpen(false);
  }

  const handleLastYearPeriodClick = () => {
    const today = new Date();
    const lastYearToday = subYears(today, 1);
    
    const from = startOfMonth(lastYearToday);
    const to = endOfMonth(addMonths(lastYearToday, 3));

    setSelectedRange({ from, to });
  };

  const suggestionRanges = [
    { label: t.last7days, days: 7 },
    { label: t.last14days, days: 14 },
    { label: t.last30days, days: 30 },
    { label: t.last90days, days: 90 },
    { label: t.last180days, days: 180 },
    { label: t.last1year, years: 1 },
  ]

  const handleSuggestionClick = (suggestion: { days?: number; years?: number }) => {
    const to = new Date();
    let from;

    if (suggestion.days) {
      from = subDays(to, suggestion.days - 1);
    } else if (suggestion.years) {
      from = subYears(to, suggestion.years);
    }
    
    setSelectedRange({ from, to });
  }

  const footer = (
    <div className="p-2 flex justify-end gap-2 border-t border-light-border dark:border-dark-border mt-2">
      <button
        className="px-4 py-2 text-sm bg-light-surface dark:bg-dark-surface rounded-md hover:bg-light-border dark:hover:bg-dark-border transition-colors"
        onClick={handleReset}
      >
        {t.resetFilters}
      </button>
      <button
        className="px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
        onClick={handleApply}
      >
        {t.apply}
      </button>
    </div>
  );

  return (
    <div className="relative" ref={wrapperRef}>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:ring-2 focus:ring-brand-primary text-light-text-primary dark:text-dark-text-primary flex items-center justify-between"
        >
            <span className='flex items-center gap-2'>
                <CalendarIcon className="h-4 w-4 text-light-text-secondary dark:text-dark-text-secondary" />
                {date?.from ? (
                    date.to ? (
                        <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                        </>
                    ) : (
                        format(date.from, 'LLL dd, y')
                    )
                ) : (
                    <span>{t.all_time || 'All Time'}</span>
                )}
            </span>
        </button>

      {isOpen && (
        <div className="absolute top-full mt-2 z-10 bg-light-surface dark:bg-dark-surface p-4 rounded-lg shadow-lg border border-light-border dark:border-dark-border flex">
          <div className='border-r border-light-border dark:border-dark-border pr-4'>
            <h3 className='text-sm font-semibold mb-2 px-2'>{t.suggestions}</h3>
            <div className='flex flex-col gap-1'>
            {suggestionRanges.map(range => (
              <button key={range.label} onClick={() => handleSuggestionClick(range)} className='text-left text-sm whitespace-nowrap px-2 py-1.5 rounded-md hover:bg-light-border dark:hover:bg-dark-border transition-colors'>
                {range.label}
              </button>
            ))}
             <button onClick={handleLastYearPeriodClick} className='text-left text-sm whitespace-nowrap px-2 py-1.5 rounded-md hover:bg-light-border dark:hover:bg-dark-border transition-colors'>
                {t.last_year_period}
              </button>
            </div>
          </div>
          <div className='pl-4'>
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
