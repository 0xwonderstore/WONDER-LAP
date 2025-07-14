
import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-24 px-6 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg animate-fade-in border border-dashed border-light-border dark:border-dark-border">
      <div className="mx-auto w-fit p-4 bg-light-background dark:bg-dark-background rounded-full">
        <SearchX className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
        لم يتم العثور على منتجات
      </h2>
      <p className="mt-2 text-base text-light-text-secondary dark:text-dark-text-secondary">
        جرّب تعديل معايير البحث أو الفلترة الخاصة بك.
      </p>
      <button
        onClick={onClearFilters}
        className="mt-8 px-5 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-dark-surface transition-all"
      >
        مسح جميع الفلاتر
      </button>
    </div>
  );
}
