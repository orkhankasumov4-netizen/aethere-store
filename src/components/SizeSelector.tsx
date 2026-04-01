import React from 'react';

interface SizeSelectorProps {
  sizes: string[];
  selected: string;
  onSelect: (size: string) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({ sizes, selected, onSelect }) => {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onSelect(size)}
          className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${selected === size ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-white' : 'border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'}`}
        >
          {size}
        </button>
      ))}
    </div>
  );
};
