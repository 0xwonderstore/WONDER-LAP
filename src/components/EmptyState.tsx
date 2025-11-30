import React, { FC, ReactNode } from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    hint: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, hint }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in-up">
            <div className="relative group mb-6">
                {/* Animated Glow Behind */}
                <div className="absolute inset-0 bg-brand-primary/20 dark:bg-brand-primary/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                
                {/* Icon Circle */}
                <div className="relative w-24 h-24 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform duration-300">
                    {icon || <SearchX className="w-10 h-10 text-gray-400 dark:text-gray-500 group-hover:text-brand-primary transition-colors duration-300" />}
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                {hint}
            </p>
        </div>
    );
};
