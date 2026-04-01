import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ComparisonBar } from '../components/ComparisonBar';
import { useComparison } from '../stores/useComparison';
import { useCurrency } from '../stores/useCurrency';

export const ComparePage: React.FC = () => {
  const { products, removeProduct, clearComparison } = useComparison();
  const { format } = useCurrency();
  const navigate = useNavigate();

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-16 text-center">
          <div className="text-4xl mb-4">No products to compare</div>
          <div className="text-gray-500 mb-8">Add products to compare their features side by side</div>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-black rounded-2xl font-medium"
          >
            Browse Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = [
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'brand', label: 'Brand' },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Availability' },
    { key: 'discount', label: 'Discount' },
    { key: 'colors', label: 'Colors' },
    { key: 'sizes', label: 'Sizes' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-32">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs text-[#7C3AED] tracking-widest">COMPARE</div>
            <div className="text-3xl font-medium mt-1">Product Comparison</div>
          </div>
          <button
            onClick={clearComparison}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
          >
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-sm text-gray-500 py-4">Product</div>
              {products.map((product) => (
                <div key={product.id} className="relative bg-[#141414] rounded-3xl border border-gray-800 overflow-hidden">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/70 backdrop-blur rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors z-10"
                  >
                    <X size={16} />
                  </button>
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="text-sm text-gray-500">{product.brand}</div>
                    <div className="font-medium text-lg line-clamp-2">{product.name}</div>
                    <div className="text-[#7C3AED] font-medium mt-2">{format(product.price)}</div>
                  </div>
                </div>
              ))}
              {Array.from({ length: 3 - products.length }).map((_, i) => (
                <div key={i} className="bg-[#141414]/50 rounded-3xl border-2 border-dashed border-gray-800 flex items-center justify-center text-gray-600">
                  Empty
                </div>
              ))}
            </div>

            {/* Specs Rows */}
            {specs.map((spec, idx) => (
              <div key={spec.key} className={`grid grid-cols-4 gap-4 py-4 ${idx !== specs.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <div className="text-sm text-gray-500">{spec.label}</div>
                {products.map((product) => (
                  <div key={product.id} className="text-sm">
                    {spec.key === 'price' && (
                      <span className="font-medium text-white">{format(product.price)}</span>
                    )}
                    {spec.key === 'rating' && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-500 text-yellow-500" />
                        <span>{product.rating}</span>
                        <span className="text-gray-500">({product.review_count})</span>
                      </div>
                    )}
                    {spec.key === 'brand' && <span className="text-white">{product.brand}</span>}
                    {spec.key === 'category' && <span className="text-white">{product.category}</span>}
                    {spec.key === 'stock' && (
                      <span className={product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    )}
                    {spec.key === 'discount' && (
                      <span className={product.discount > 0 ? 'text-rose-400' : 'text-gray-500'}>
                        {product.discount > 0 ? `-${product.discount}%` : 'No discount'}
                      </span>
                    )}
                    {spec.key === 'colors' && (
                      <div className="flex gap-1">
                        {product.colors?.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-gray-700"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    )}
                    {spec.key === 'sizes' && (
                      <div className="flex flex-wrap gap-1">
                        {product.sizes?.slice(0, 4).map((size, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                            {size}
                          </span>
                        ))}
                        {product.sizes && product.sizes.length > 4 && (
                          <span className="text-gray-500 text-xs">+{product.sizes.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {Array.from({ length: 3 - products.length }).map((_, i) => (
                  <div key={i} className="text-gray-700">—</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <ComparisonBar />
    </div>
  );
};
