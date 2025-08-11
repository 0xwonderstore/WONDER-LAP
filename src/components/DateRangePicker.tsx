import React, { useState, useEffect, Fragment } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Zap } from 'lucide-react';
import { DateRange, DayPicker, CaptionProps } from 'react-day-picker';
import { format, subDays, addMonths, startOfMonth } from 'date-fns';
import { Popover, Transition } from '@headlessui/react';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { enUS, arSA } from 'date-fns/locale';
import './DateRangePicker.css';

// --- Main DateRangePicker Component ---
interface Preset {
  id: keyof typeof translations['en'];
  getRange: () => DateRange;
}

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ date: externalDate, setDate: setExternalDate }: DateRangePickerProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const dateFnsLocale = language === 'ar' ? arSA : enUS;

  const [internalDate, setInternalDate] = useState<DateRange | undefined>(externalDate);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    setInternalDate(externalDate);
  }, [externalDate]);
  
  const presets: Preset[] = [
    { id: 'last24hours', getRange: () => ({ from: subDays(new Date(), 1), to: new Date() }) },
    { id: 'last7days', getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
    { id: 'last15days', getRange: () => ({ from: subDays(new Date(), 14), to: new Date() }) },
    { id: 'last30days', getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
    { id: 'last2months', getRange: () => ({ from: subDays(new Date(), 59), to: new Date() }) },
    { id: 'last3months', getRange: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
    { id: 'last1year', getRange: () => ({ from: subDays(new Date(), 364), to: new Date() }) },
  ];

  const handlePresetClick = (preset: Preset) => {
    const newRange = preset.getRange();
    setInternalDate(newRange);
    setActivePreset(preset.id);
  };

  const handleDaySelect = (range: DateRange | undefined) => {
    setInternalDate(range);
    setActivePreset(null);
  };
  
  const handleApply = (close: () => void) => {
    setExternalDate(internalDate);
    close();
  };

  const handleReset = () => {
    setInternalDate(undefined);
    setActivePreset(null);
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background flex items-center justify-between text-light-text-primary dark:text-dark-text-primary">
             <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-light-text-secondary dark:text-dark-text-secondary" />
              {externalDate?.from ? (
                externalDate.to ? `${format(externalDate.from, "d LLL, y")} - ${format(externalDate.to, "d LLL, y")}` : format(externalDate.from, "d LLL, y")
              ) : (
                <span className="text-light-text-secondary dark:text-dark-text-secondary">{t.pickADate}</span>
              )}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </Popover.Button>
          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-20 top-full mt-2 w-[48rem] bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-2xl flex rtl:flex-row-reverse">
              <div className="p-4 ltr:border-r rtl:border-l border-light-border dark:border-dark-border w-1/3 flex flex-col">
                <h3 className="font-semibold mb-4 text-md flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary">
                  <Zap className="w-5 h-5 text-yellow-500" />{t.suggestions}
                </h3>
                <div className="flex flex-col gap-1">
                  {presets.map((preset) => (
                    <button key={preset.id} onClick={() => handlePresetClick(preset)} 
                    className={`ltr:text-left rtl:text-right text-sm py-2 px-3 rounded-lg transition-colors ${activePreset === preset.id ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'hover:bg-light-background dark:hover:bg-dark-background text-light-text-secondary dark:text-dark-text-secondary'}`}>
                      {t[preset.id]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col flex-grow">
                <DayPicker
                  mode="range"
                  selected={internalDate}
                  onSelect={handleDaySelect}
                  numberOfMonths={2}
                  showOutsideDays
                  locale={dateFnsLocale}
                  dir={language}
                  className="p-3"
                  classNames={{
                      months: 'flex flex-col sm:flex-row space-y-4 sm:space-y-0',
                      month: 'space-y-4',
                      caption: 'relative flex items-center justify-between px-2 pt-1 mb-2',
                      caption_label: 'text-lg font-bold',
                      nav: 'space-x-1 flex items-center',
                      nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                      head_row: 'flex',
                      head_cell: 'text-muted-foreground rounded-md w-12 font-normal text-[0.8rem]',
                      row: 'flex w-full mt-2',
                      cell: 'h-10 w-12 text-center text-sm p-0 relative',
                      day: 'h-10 w-10 p-0 font-normal rounded-full',
                  }}
                />
                 <div className="flex justify-end items-center gap-3 mt-auto p-4 border-t border-light-border dark:border-dark-border rtl:flex-row-reverse">
                  <button onClick={handleReset} className="p-2 rounded-full hover:bg-light-background dark:hover:bg-dark-background transition-colors" title="Reset"><RotateCcw className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" /></button>
                  <button onClick={() => handleApply(close)} className="px-8 py-2 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-dark-surface transition-all">{t.apply}</button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
