import React from 'react';
import { motion } from 'framer-motion';
import CountUp from './CountUp'; // Assuming CountUp is in the same directory or adjust path

// --- Animation Variants ---
const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  },
};

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { type: 'spring', stiffness: 300, damping: 10 },
  },
};

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string; // e.g., 'rose', 'amber', 'teal', 'indigo'
}

const colorClasses = {
  rose: {
    bg: 'bg-rose-500',
    gradient: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-500/40',
  },
  amber: {
    bg: 'bg-amber-500',
    gradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/40',
  },
  teal: {
    bg: 'bg-teal-500',
    gradient: 'from-teal-500 to-teal-600',
    shadow: 'shadow-teal-500/40',
  },
  indigo: {
    bg: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600',
    shadow: 'shadow-indigo-500/40',
  },
};


const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color }) => {
  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;

  return (
    <motion.div
      variants={cardVariants}
      className="relative bg-white dark:bg-gray-800 p-6 rounded-xl overflow-hidden group shadow-lg"
      whileHover="hover"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedColor.gradient}`}></div>
      <div className="flex items-center gap-5">
        <motion.div
          variants={iconVariants}
          className={`p-4 rounded-lg text-white shadow-lg ${selectedColor.bg} ${selectedColor.shadow}`}
        >
          {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        </motion.div>
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
          <p className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
            <CountUp end={value} />
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default KpiCard;
