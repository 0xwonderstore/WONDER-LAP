
import React, { FC, ReactNode } from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    hint: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, hint }) => {
    return (
        <div className="text-center py-24 px-6 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg animate-fade-in border border-dashed border-light-border dark:border-dark-border">
            <div className="mx-auto w-fit p-4 bg-light-background dark:bg-dark-background rounded-full">
                {icon || <SearchX className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary" />}
            </div>
            <h2 className="mt-6 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {title}
            </h2>
            <p className="mt-2 text-base text-light-text-secondary dark:text-dark-text-secondary">
                {hint}
            </p>
        </div>
    );
};
