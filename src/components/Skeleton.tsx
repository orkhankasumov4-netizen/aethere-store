import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width = '100%', height = '1rem' }) => {
  return (
    <div className={`bg-gray-800 overflow-hidden rounded ${className}`} style={{ width, height }}>
      <motion.div
        className="h-full w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};
