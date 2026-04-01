import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onChange, min = 1, max = 99 }) => {
  return (
    <div className="flex items-center border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="px-3 py-2 hover:bg-gray-900 transition-colors text-gray-400 hover:text-white"
        disabled={quantity <= min}
      >
        <Minus size={16} />
      </button>
      <span className="px-4 py-2 font-mono text-white text-sm min-w-[40px] text-center">{quantity}</span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className="px-3 py-2 hover:bg-gray-900 transition-colors text-gray-400 hover:text-white"
        disabled={quantity >= max}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
