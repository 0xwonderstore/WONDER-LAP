import React, { useEffect, useState, useRef } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Archive, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'undo' | 'added' | 'removed';
  duration?: number;
  onUndo?: () => void;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 4000, onUndo, onClose }) => {
  const { t } = useTranslation();
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);
  const frameIdRef = useRef<number>();
  
  // Circular Progress Logic
  const [progress, setProgress] = useState(100);
  const radius = 10;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    const initialDuration = duration;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const currentRemaining = remainingTimeRef.current - elapsed;
      
      const newProgress = Math.max(0, (currentRemaining / initialDuration) * 100);
      setProgress(newProgress);

      if (currentRemaining <= 0) {
        onClose();
      } else {
        frameIdRef.current = requestAnimationFrame(animate);
      }
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      remainingTimeRef.current -= (Date.now() - startTimeRef.current);
    };
  }, [duration, onClose, isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const getIcon = () => {
    switch (type) {
      case 'success':
      case 'added':
        return <CheckCircle2 size={20} />;
      case 'error':
      case 'removed':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'undo':
        return <Archive size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const offset = ((100 - progress) / 100) * circumference;

  const typeStyles = {
      undo: 'text-indigo-500',
      success: 'text-emerald-500',
      added: 'text-emerald-500',
      error: 'text-red-500',
      removed: 'text-red-500',
      warning: 'text-amber-500',
      info: 'text-blue-500',
  };

  const iconColor = typeStyles[type] || typeStyles.info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-10 right-6 z-[100] flex justify-end w-auto max-w-[90vw]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="
          relative flex items-center gap-4 px-5 py-3.5
          bg-white dark:bg-[#1a1a1a]
          text-gray-900 dark:text-white
          rounded-2xl
          shadow-2xl shadow-gray-200/50 dark:shadow-black/60
          border border-gray-100 dark:border-gray-800
          min-w-[320px]
        ">
          
          {/* Status Icon */}
          <div className={`flex items-center justify-center ${iconColor}`}>
             {getIcon()}
          </div>

          {/* Message Content */}
          <div className="flex flex-col justify-center flex-grow min-w-0">
            <span className="text-sm font-bold leading-tight truncate pr-2">
                {message}
            </span>
          </div>

          {/* Action Button (Undo) */}
          {onUndo && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onUndo}
              className="
                px-3 py-1.5 
                bg-gray-900 hover:bg-black 
                dark:bg-white dark:hover:bg-gray-200
                text-white dark:text-black
                text-xs font-bold 
                rounded-lg
                transition-colors
                shrink-0
              "
            >
              {t('undo_action')}
            </motion.button>
          )}

          {/* Close Button with Timer */}
          <div className="relative w-6 h-6 flex items-center justify-center cursor-pointer group shrink-0" onClick={onClose}>
             <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  fill="none"
                  strokeWidth="2"
                  className="stroke-gray-100 dark:stroke-gray-700"
                />
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className={`transition-all duration-100 ease-linear ${iconColor}`}
                />
             </svg>
             <X size={10} className="absolute text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
