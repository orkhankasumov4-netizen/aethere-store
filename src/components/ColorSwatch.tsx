import React from 'react';

interface ColorSwatchProps {
  colors: Array<{ name: string; hex: string }>;
  selected: string;
  onSelect: (color: string) => void;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ colors, selected, onSelect }) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(color.name)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${selected === color.name ? 'border-white scale-110' : 'border-gray-700 hover:border-gray-500'}`}
          style={{ backgroundColor: color.hex }}
          title={color.name}
        />
      ))}
    </div>
  );
};
