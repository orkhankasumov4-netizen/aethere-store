import React from 'react';
import { motion } from 'framer-motion';

const brands = ['Apple', 'Sony', 'Nike', 'Adidas', 'Dyson', 'Samsung', 'Dior', 'Razer', 'Logitech', 'Peloton', 'Wilson', 'Le Creuset'];

export const BrandMarquee: React.FC = () => {
  return (
    <div className="py-12 bg-black border-y border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 text-xs text-gray-500 px-6 mb-4">TRUSTED BY THE WORLD'S MOST DISCERNING BRANDS</div>
      <div className="flex">
        <motion.div
          animate={{ x: [0, -50 * brands.length] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...brands, ...brands].map((brand, idx) => (
            <div key={idx} className="text-3xl font-light text-gray-600 hover:text-white transition-colors cursor-pointer px-8">{brand}</div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
