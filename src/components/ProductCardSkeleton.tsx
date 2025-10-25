import React from 'react';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface overflow-hidden shadow-lg h-full flex flex-col">
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
