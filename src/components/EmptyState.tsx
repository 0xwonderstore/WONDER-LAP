import React, { FC, ReactNode } from 'react';
import { SearchX } from 'lucide-react';
import { translations } from '../translations';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Locale } from '../types';

interface EmptyStateProps {
    icon?: ReactNode;
    title?: string;
    description?: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, description, buttonText, onButtonClick }) => {
    const [locale] = useLocalStorage<Locale>('locale', 'ar');
    const t = translations[locale];

    return (
        <div className="text-center py-24 px-6 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg animate-fade-in border border-dashed border-light-border dark:border-dark-border">
            <div className="mx-auto w-fit p-4 bg-light-background dark:bg-dark-background rounded-full">
                {icon || <SearchX className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary" />}
            </div>
            <h2 className="mt-6 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {title || t.noResults}
            </h2>
            <p className="mt-2 text-base text-light-text-secondary dark:text-dark-text-secondary">
                {description || t.noResultsHint}
            </p>
            {buttonText && onButtonClick && (
                <button 
                    onClick={onButtonClick} 
                    className="mt-6 px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primary-dark transition-colors duration-300"
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;