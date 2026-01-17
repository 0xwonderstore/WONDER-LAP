import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, X, RotateCcw } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'added' | 'removed' | 'success' | 'undo';
  onClose: () => void;
  onUndo?: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, onUndo, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    added: <CheckCircle className="text-green-500" size={20} />,
    removed: <Info className="text-blue-500" size={20} />,
    success: <CheckCircle className="text-green-500" size={20} />,
    undo: <RotateCcw className="text-brand-primary animate-spin-slow" size={20} />,
  };

  const bgColors = {
    added: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
    removed: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
    undo: 'bg-gray-900 dark:bg-white border-gray-800 dark:border-gray-100',
  };

  const textColors = {
    added: 'text-green-800 dark:text-green-200',
    removed: 'text-blue-800 dark:text-blue-200',
    success: 'text-green-800 dark:text-green-200',
    undo: 'text-white dark:text-gray-900',
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.9 }}
        className={`flex items-center gap-3 p-4 rounded-2xl border shadow-2xl ${bgColors[type]} ${textColors[type]}`}
      >
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        
        <div className="flex-grow font-bold text-sm">
          {message}
        </div>

        {onUndo && (
          <button 
            onClick={() => {
              onUndo();
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-white rounded-xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            UNDO
          </button>
        )}

        <button 
          onClick={onClose}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </motion.div>
    </div>
  );
};

export default Toast;
