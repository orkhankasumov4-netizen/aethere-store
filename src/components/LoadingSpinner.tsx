import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 16, md: 32, lg: 48 };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="border-2 border-gray-700 border-t-[#7C3AED] rounded-full"
        style={{ width: sizes[size], height: sizes[size] }}
      />
    </div>
  );
};
