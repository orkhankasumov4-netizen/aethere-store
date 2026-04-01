import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  image: string;
  icon: string;
  product_count: number;
}

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  return (
    <div className="py-16 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="text-[#7C3AED] text-xs tracking-[3px] mb-2">CURATED COLLECTIONS</div>
            <div className="text-4xl font-medium text-white tracking-tight">Shop by Category</div>
          </div>
          <Link to="/" className="text-sm text-gray-500 hover:text-white flex items-center gap-1">View All →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.length > 0 ? (
            categories.map((cat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                className="relative rounded-3xl overflow-hidden h-[340px] group cursor-pointer"
              >
                <Link to={`/category/${cat.name}`}>
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="text-5xl mb-4 opacity-80">{cat.icon}</div>
                    <div className="text-white text-3xl font-medium tracking-tight">{cat.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{cat.product_count} products</div>
                  </div>
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-6 py-2 bg-white/90 text-black rounded-full text-sm font-medium">Explore</div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[340px] bg-gray-900 rounded-3xl animate-pulse" />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
