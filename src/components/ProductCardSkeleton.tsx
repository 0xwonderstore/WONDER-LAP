import React from 'react';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm h-full flex flex-col">
            {/* Image Placeholder */}
            <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
                 <div className="absolute top-3 left-3 w-24 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                 <div className="absolute top-3 right-3 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Content Placeholder */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-auto space-y-3">
                    {/* Title lines */}
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
                    
                    <div className="flex justify-between items-center pt-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                </div>
                
                {/* Footer Placeholder */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
