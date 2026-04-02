import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../stores/useCart';
import { useWishlist } from '../stores/useWishlist';
import { RatingStars } from './RatingStars';
import { PriceDisplay } from './PriceDisplay';
import { QuantitySelector } from './QuantitySelector';
import { ColorSwatch } from './ColorSwatch';
import { SizeSelector } from './SizeSelector';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  brand: string;
  rating: number;
  review_count: number;
  stock: number;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
}

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ isOpen, onClose, product }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.id, quantity, selectedColor || product.colors?.[0]?.name || '', selectedSize || product.sizes?.[0] || '');
    setTimeout(() => {
      setAdding(false);
      onClose();
    }, 400);
  };

  const handleViewFull = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#0A0A0A] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-gray-800"
          >
            {/* Image Gallery */}
            <div className="relative md:w-3/5 bg-black overflow-hidden">
              <img
                src={images[imageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === imageIndex ? 'bg-white w-6' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-2/5 p-8 flex flex-col overflow-y-auto">
              <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                <X size={24} />
              </button>

              <div className="mb-2 flex items-center gap-2">
                <div className="text-xs text-[#7C3AED] font-medium tracking-[2px]">{product.brand.toUpperCase()}</div>
                <div className="text-xs text-gray-500">•</div>
                <div className="text-xs text-gray-500">{product.category}</div>
              </div>

              <h2 className="text-3xl font-medium text-white leading-tight">{product.name}</h2>

              <div className="flex items-center gap-3 mt-3 mb-6">
                <RatingStars rating={product.rating} size={18} showCount count={product.review_count} />
                <span className="text-xs text-gray-500">({product.review_count} reviews)</span>
              </div>

              <PriceDisplay price={product.price} originalPrice={product.original_price} size="lg" />

              <div className="mt-6">
                <p className="text-gray-400 text-[15px] leading-relaxed line-clamp-4">{product.description}</p>
              </div>

              {product.colors && product.colors.length > 0 && (
                <div className="mt-6">
                  <div className="text-xs text-gray-500 mb-2 tracking-widest">COLOR</div>
                  <ColorSwatch
                    colors={product.colors}
                    selected={selectedColor || product.colors[0]?.name}
                    onSelect={setSelectedColor}
                  />
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs text-gray-500 mb-2 tracking-widest">SIZE</div>
                  <SizeSelector
                    sizes={product.sizes}
                    selected={selectedSize || product.sizes[0]}
                    onSelect={setSelectedSize}
                  />
                </div>
              )}

              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-2 tracking-widest">QUANTITY</div>
                  <QuantitySelector quantity={quantity} onChange={setQuantity} />
                </div>
                <div className="text-xs text-gray-500 mt-8">
                  {product.stock} in stock
                </div>
              </div>

              <div className="mt-auto pt-8 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 bg-white hover:bg-[#7C3AED] text-black hover:text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                  {adding ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      ADD TO CART
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${inWishlist ? 'border-rose-500 bg-rose-500/10' : 'border-gray-800 hover:border-gray-600'}`}
                >
                  <Heart className={inWishlist ? 'fill-rose-500 text-rose-500' : 'text-white'} size={20} />
                </motion.button>
              </div>

              <button
                onClick={handleViewFull}
                className="mt-4 text-sm text-gray-500 hover:text-white underline underline-offset-4"
              >
                View full details →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
