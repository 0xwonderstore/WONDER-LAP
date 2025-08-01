import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Locale } from '../types';
import { translations } from '../translations';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  locale: Locale;
}

export default function Pagination({
  currentPage: initialCurrentPage,
  totalPages: initialTotalPages,
  onPageChange,
  totalItems: initialTotalItems,
  itemsPerPage: initialItemsPerPage,
  locale,
}: PaginationProps) {
  const t = translations[locale];

  const currentPage = initialCurrentPage || 1;
  const totalPages = initialTotalPages || 0;
  const totalItems = initialTotalItems || 0;
  const itemsPerPage = initialItemsPerPage || 10;

  const [inputPage, setInputPage] = useState<string>(String(currentPage));

  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  if (totalItems === 0) {
    return null;
  }
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const displayStart = isNaN(startItem) ? 0 : startItem;
  const displayEnd = isNaN(endItem) ? 0 : endItem;

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


  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
      
      <div className="font-semibold">
        {t.pagination_resultsInfo
          .replace('{start}', String(displayStart))
          .replace('{end}', String(displayEnd))
          .replace('{total}', String(totalItems))}
      </div>

      {totalPages > 1 && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-3 py-2 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-background disabled:opacity-50"
              aria-label="Previous Page"
            >
              <ChevronRight className="w-4 h-4" />
              <span>{t.previous}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(Number(page))}
                    className={`px-4 py-2 rounded-xl ${
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
              className="flex items-center justify-center px-3 py-2 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-background disabled:opacity-50"
              aria-label="Next Page"
            >
              <span>{t.next}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {t.pagination_pageInfo
                .replace('{currentPage}', String(currentPage))
                .replace('{totalPages}', String(totalPages))}
            </span>
          </div>
        </>
      )}
    </div>
  );
}