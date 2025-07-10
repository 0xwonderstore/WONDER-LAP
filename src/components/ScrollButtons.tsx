import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ScrollButtons() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
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
    <div className={`fixed bottom-6 right-6 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-80 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="flex flex-col gap-3">
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="p-3 rounded-full bg-dark-surface text-dark-text-primary shadow-lg hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transition-all transform hover:scale-110"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <button
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          className="p-3 rounded-full bg-dark-surface text-dark-text-primary shadow-lg hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transition-all transform hover:scale-110"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
