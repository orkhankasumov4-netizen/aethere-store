import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'new' | 'hot';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300',
    success: 'bg-emerald-500/20 text-emerald-400',
    error: 'bg-rose-500/20 text-rose-400',
    warning: 'bg-amber-500/20 text-amber-400',
    new: 'bg-[#7C3AED]/20 text-[#7C3AED]',
    hot: 'bg-rose-500/20 text-rose-400 animate-pulse'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
