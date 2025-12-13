import React from 'react';

export const KpiCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6 animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg w-16 h-16"></div>
        <div className='flex-1'>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

export const ChartSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-80 animate-pulse flex flex-col justify-end">
        <div className="flex items-end gap-4 h-full px-4">
             {[...Array(12)].map((_, i) => (
                 <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-t-lg flex-1" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
             ))}
        </div>
    </div>
);

export const TableSkeleton: React.FC = () => (
    <div className="overflow-x-auto p-4 animate-pulse">
        <div className="w-full">
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg h-12">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
