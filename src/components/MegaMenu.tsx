import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { name: 'Electronics', icon: '💻', sub: ['Smartphones', 'Laptops', 'Audio', 'Cameras'], color: '#7C3AED' },
  { name: 'Fashion', icon: '👕', sub: ['Menswear', 'Womenswear', 'Footwear', 'Accessories'], color: '#10B981' },
  { name: 'Home & Garden', icon: '🏠', sub: ['Furniture', 'Kitchen', 'Lighting', 'Decor'], color: '#F59E0B' },
  { name: 'Sports', icon: '🏃', sub: ['Running', 'Fitness', 'Outdoor', 'Tennis'], color: '#F43F5E' },
  { name: 'Beauty', icon: '✨', sub: ['Skincare', 'Fragrance', 'Haircare', 'Makeup'], color: '#EC4899' },
  { name: 'Gaming', icon: '🎮', sub: ['Consoles', 'Accessories', 'PC', 'Merch'], color: '#3B82F6' },
  { name: 'Automotive', icon: '🚗', sub: ['Car Accessories', 'Electronics'], color: '#8B5CF6' },
  { name: 'Books', icon: '📚', sub: ['Fiction', 'Non-Fiction', 'Art'], color: '#14B8A6' },
];

const featured = [
  { name: 'iPhone 16 Pro', price: 999, image: 'https://images.unsplash.com/photo-1592899677977-7c8a76a9c4f4' },
  { name: 'Sony WH-1000XM5', price: 298, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
];

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-x-0 top-20 z-40" onMouseLeave={onClose}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-6 bg-[#141414] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="grid grid-cols-12 gap-6 p-10">
              {/* Categories */}
              <div className="col-span-12 lg:col-span-8">
                <div className="text-xs text-gray-500 tracking-[2px] mb-4">DISCOVER</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      to={`/category/${cat.name}`}
                      onClick={onClose}
                      className="group p-6 rounded-2xl border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all"
                    >
                      <div className="text-4xl mb-4 transition-transform group-hover:scale-110">{cat.icon}</div>
                      <div className="font-semibold text-white mb-2">{cat.name}</div>
                      <div className="text-xs text-gray-500 mb-4">{cat.sub.slice(0, 2).join(' • ')}</div>
                      <div className="text-[#7C3AED] text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore <ArrowRight size={12} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <div className="col-span-12 lg:col-span-4 bg-black rounded-2xl p-8 flex flex-col">
                <div className="text-xs text-gray-500 tracking-[2px] mb-6">TRENDING NOW</div>
                {featured.map((item, idx) => (
                  <div key={idx} className="flex gap-4 mb-6 last:mb-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                    <div>
                      <div className="text-sm text-white font-medium mb-1">{item.name}</div>
                      <div className="font-mono text-lg text-white">${item.price}</div>
                      <Link to="/product/1" onClick={onClose} className="text-xs text-[#7C3AED] hover:underline">View →</Link>
                    </div>
                  </div>
                ))}
                <div className="mt-auto pt-4 border-t border-gray-800 text-xs text-gray-500">
                  Live from our stores • Updated now
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
