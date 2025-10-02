import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}) => {
    const { language } = useLanguageStore();
    // Fallback to English if the current language is not found
    const t = translations[language] || translations.en;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage > totalPages - 3) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = currentPage * itemsPerPage;


    return (
        <div className="flex items-center justify-between mt-8 px-4 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-light-border dark:border-dark-border text-sm font-medium rounded-md text-light-text-secondary dark:text-dark-text-secondary bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border disabled:opacity-50"
                >
                    {t.previous}
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-light-border dark:border-dark-border text-sm font-medium rounded-md text-light-text-secondary dark:text-dark-text-secondary bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border disabled:opacity-50"
                >
                    {t.next}
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {t.showing}{' '}
                        <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{indexOfFirstItem + 1}</span> -{' '}
                        <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{indexOfLastItem > totalItems ? totalItems : indexOfLastItem}</span>{' '}
                        {t.of}{' '}
                        <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{totalItems}</span>{' '}
                        {t.products}
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border disabled:opacity-50"
                        >
                            <span className="sr-only">{t.previous}</span>
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        {getPageNumbers().map((page, index) =>
                            typeof page === 'number' ? (
                                <button
                                    key={index}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                            ? 'z-10 bg-brand-primary/10 border-brand-primary text-brand-primary dark:bg-brand-primary/20 dark:border-brand-primary'
                                            : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'
                                        }`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={index} className="relative inline-flex items-center px-4 py-2 border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                    {page}
                                </span>
                            )
                        )}
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border disabled:opacity-50"
                        >
                            <span className="sr-only">{t.next}</span>
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
