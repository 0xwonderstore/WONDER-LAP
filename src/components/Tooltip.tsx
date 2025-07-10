import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: ReactNode;
  text: string;
}

export default function Tooltip({ children, text }: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative inline-block" // Using inline-block to ensure the container wraps the child
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            // This combination of absolute positioning and transform is the most robust way to center a tooltip.
            // It ensures the tooltip centers itself regardless of its own width.
            className="absolute bottom-full left-1/2 mb-2 z-50"
            style={{
              // We use transform here to ensure the centering is always perfect
              translateX: '-50%',
            }}
          >
            <div className="bg-gray-900 dark:bg-black text-white text-sm whitespace-nowrap px-3 py-1.5 rounded-md shadow-lg relative">
              {text}
              {/* This is the little triangle pointing down */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 dark:bg-black transform -translate-y-1/2 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
