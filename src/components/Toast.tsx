import React, { useEffect } from 'react';
import { Heart, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'added' | 'removed';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Disappear after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const isAdded = type === 'added';

  return (
    <div className="fixed bottom-5 right-5 bg-light-surface dark:bg-dark-surface shadow-lg rounded-xl p-4 flex items-center gap-3 animate-fade-in-up z-50 border border-light-border dark:border-dark-border">
      {isAdded ? (
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
      ) : (
        <XCircle className="w-6 h-6 text-gray-500" />
      )}
      <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">{message}</p>
    </div>
  );
};

export default Toast;
