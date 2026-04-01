import React from 'react';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, originalPrice, size = 'md' }) => {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' };
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-medium text-white tracking-tight font-mono ${sizes[size]}`}>
        ${price.toFixed(0)}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className="text-sm text-gray-500 line-through font-mono">
            ${originalPrice.toFixed(0)}
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
};
