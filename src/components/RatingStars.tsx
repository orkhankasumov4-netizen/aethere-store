import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showCount?: boolean;
  count?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 16, showCount = false, count = 0 }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.floor(rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : star - 0.5 <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-700'}
        />
      ))}
      {showCount && <span className="text-xs text-gray-500 ml-1">({count})</span>}
    </div>
  );
};
