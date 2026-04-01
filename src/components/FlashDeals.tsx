import React, { useState, useEffect } from 'react';

import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  review_count: number;
  discount: number;
  is_new: boolean;
  is_hot: boolean;
  colors: any[];
  sizes: string[];
}

export const FlashDeals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    fetch('/api/products?limit=8')
      .then(res => res.json())
      .then(data => {
        const deals = data.filter((p: Product) => p.discount > 0 || p.is_hot);
        setProducts(deals.slice(0, 6));
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="py-16 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🔥</div>
            <div>
              <div className="text-3xl font-medium text-white tracking-tighter">Flash Deals</div>
              <div className="text-gray-500">Limited time offers • Ends in</div>
            </div>
          </div>
          <div className="flex gap-2 font-mono text-2xl text-white">
            <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">{formatTime(timeLeft.hours)}</div>
            <div className="text-[#7C3AED]">:</div>
            <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">{formatTime(timeLeft.minutes)}</div>
            <div className="text-[#7C3AED]">:</div>
            <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">{formatTime(timeLeft.seconds)}</div>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide">
          {products.length > 0 ? (
            products.map((product, idx) => (
              <div key={idx} className="snap-start flex-shrink-0 w-full sm:w-[300px]">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="snap-start flex-shrink-0 w-full sm:w-[300px]">
                <div className="bg-[#141414] rounded-3xl h-[420px] animate-pulse" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
