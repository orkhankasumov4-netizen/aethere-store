import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useComparison } from '../stores/useComparison';
import { useCurrency } from '../stores/useCurrency';

export const ComparisonBar: React.FC = () => {
  const { products, removeProduct, clearComparison } = useComparison();
  const { format } = useCurrency();

  if (products.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 bg-[#141414]/95 backdrop-blur-xl border-t border-gray-800 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400">Compare</div>
              <div className="px-2 py-0.5 bg-[#7C3AED] text-white text-xs rounded-full">
                {products.length}/3
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/compare"
                className="px-4 py-2 bg-white text-black rounded-xl text-sm font-medium hover:bg-[#7C3AED] hover:text-white transition-colors"
              >
                Compare Now
              </Link>
              <button
                onClick={clearComparison}
                className="text-sm text-gray-500 hover:text-white"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-32 bg-black rounded-2xl overflow-hidden border border-gray-800 relative group"
              >
                <button
                  onClick={() => removeProduct(product.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                >
                  <X size={14} />
                </button>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-24 object-cover"
                />
                <div className="p-3">
                  <div className="text-xs text-white truncate">{product.name}</div>
                  <div className="text-xs text-[#7C3AED] font-medium mt-1">
                    {format(product.price)}
                  </div>
                </div>
              </div>
            ))}
            {products.length < 3 && (
              <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-800 rounded-2xl flex items-center justify-center text-gray-600 text-sm">
                Add {3 - products.length} more
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
