import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ScrollButtons() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className={`fixed bottom-8 right-8 z-50 flex flex-col gap-3 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-white shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-300 active:scale-90 group"
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </button>
        <button
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-white shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-300 active:scale-90 group"
        >
          <ArrowDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
        </button>
    </div>
  );
}
