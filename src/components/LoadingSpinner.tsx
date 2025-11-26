import React from 'react';
import { Instagram } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <div className="relative">
        {/* Pulsing Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full opacity-20 animate-ping"></div>
        
        {/* Spinner Ring */}
        <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-pink-500 animate-spin"></div>
        
        {/* Icon in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
            <Instagram className="w-8 h-8 text-pink-500 animate-pulse" />
        </div>
      </div>
      
      <p className="mt-8 text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">
        {message}
      </p>
      
      {/* Loading Dots */}
      <div className="flex space-x-1.5 mt-2">
        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1.5 h-1.5 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
