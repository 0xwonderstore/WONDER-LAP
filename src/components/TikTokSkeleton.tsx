import React from 'react';

const TikTokSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full animate-pulse">
      {/* Header Skeleton */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-50 dark:border-gray-700/50">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>

      {/* Video Placeholder */}
      <div className="aspect-[9/16] bg-gray-200 dark:bg-gray-700 relative">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
      </div>

      {/* Stats Skeleton */}
      <div className="p-4 mt-auto border-t border-gray-50 dark:border-gray-700/50">
        <div className="grid grid-cols-4 gap-2">
             {[1, 2, 3, 4].map(i => (
                 <div key={i} className="flex flex-col items-center gap-1">
                     <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                     <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                 </div>
             ))}
        </div>
        <div className="mt-4 h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );
};

export default TikTokSkeleton;
