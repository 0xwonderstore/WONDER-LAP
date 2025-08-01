
import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="text-center py-24 px-6 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg animate-fade-in border border-dashed border-light-border dark:border-dark-border">
      <div className="mx-auto w-fit p-4 bg-light-background dark:bg-dark-background rounded-full">
        <SearchX className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
        لم يتم العثور على منتجات
      </h2>
      <p className="mt-2 text-base text-light-text-secondary dark:text-dark-text-secondary">
        يبدو أنه لا توجد بيانات لعرضها في الوقت الحالي.
      </p>
    </div>
  );
}
