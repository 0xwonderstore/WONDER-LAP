import React from 'react';

const InstagramCardSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface overflow-hidden shadow-lg h-full flex flex-col">
            <div className="w-full h-64 bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-4 flex-grow">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
            </div>
            <div className="p-4 border-t border-light-border dark:border-dark-border">
                <div className="flex justify-between items-center">
                    <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default InstagramCardSkeleton;
