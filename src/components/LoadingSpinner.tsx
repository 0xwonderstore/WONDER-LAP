import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg">
      <div className="flex space-x-2 animate-bounce">
        <div className="w-4 h-4 bg-brand-primary rounded-full"></div>
        <div className="w-4 h-4 bg-brand-primary rounded-full delay-75"></div>
        <div className="w-4 h-4 bg-brand-primary rounded-full delay-150"></div>
      </div>
      <p className="mt-4 text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
