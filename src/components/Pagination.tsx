import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
    const t = translations[language] || translations.en;
    const [pageInput, setPageInput] = useState<string>(currentPage.toString());

    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);

    const handleFirst = () => onPageChange(1);
    const handlePrevious = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const handleLast = () => onPageChange(totalPages);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    };

    const handleInputBlur = () => {
        let page = parseInt(pageInput, 10);
        if (isNaN(page) || page < 1) {
            page = 1;
        } else if (page > totalPages) {
            page = totalPages;
        }
        setPageInput(page.toString());
        onPageChange(page);
    };

    const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
            (e.target as HTMLInputElement).blur();
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const halfPagesToShow = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - halfPagesToShow);
            let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

            if (currentPage <= halfPagesToShow) {
                endPage = maxPagesToShow;
            }

            if (currentPage + halfPagesToShow >= totalPages) {
                startPage = totalPages - maxPagesToShow + 1;
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        return pages;
    };


    const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col items-center justify-center mt-8 space-y-4">
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleFirst}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover disabled:opacity-50"
                    aria-label={t.first}
                >
                    <ChevronsLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover disabled:opacity-50"
                    aria-label={t.previous}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                {getPageNumbers().map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                            currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'bg-light-surface dark:bg-dark-surface hover:bg-light-hover dark:hover:bg-dark-hover'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover disabled:opacity-50"
                    aria-label={t.next}
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
                <button
                    onClick={handleLast}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover disabled:opacity-50"
                    aria-label={t.last}
                >
                    <ChevronsRight className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-2 text-sm">
                    <input
                        type="text"
                        value={pageInput}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyPress={handleInputKeyPress}
                        className="w-16 text-center bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">{`${t.of} ${totalItems} ${t.products}`}</span>
                </div>
            </div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {`${indexOfFirstItem}-${indexOfLastItem} ${t.of} ${totalItems} ${t.products}`}
            </p>
        </div>
    );
};

export default Pagination;
