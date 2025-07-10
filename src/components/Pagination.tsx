import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const [inputPage, setInputPage] = useState<string>(String(currentPage));

  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputPage, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setInputPage(String(currentPage)); 
    }
  };
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    if (currentPage > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
     return null; // EmptyState is now handled by the parent component
  }

  return (
    <div dir="rtl" className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
      
      <div className="font-semibold">
        عرض <span className="font-bold text-light-text-primary dark:text-dark-text-primary">{startItem}-{endItem}</span> من إجمالي <span className="font-bold text-light-text-primary dark:text-dark-text-primary">{totalItems}</span> منتج
      </div>

      {totalPages > 1 && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-3 py-2 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-background disabled:opacity-50"
              aria-label="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(Number(page))}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-brand-primary text-white shadow'
                        : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-background'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center px-3 py-2 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-background disabled:opacity-50"
              aria-label="الصفحة التالية"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <span>الذهاب إلى</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={inputPage}
                onChange={handleInputChange}
                className="w-16 text-center p-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface focus:ring-2 focus:ring-brand-primary"
              />
            </form>
          </div>
        </>
      )}
    </div>
  );
}
