
import { Product } from '../types';

export const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
};

export const getMonthYear = (date: Date, locale: string): string => {
  return date.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });
};
