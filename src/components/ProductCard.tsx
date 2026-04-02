import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Scale } from 'lucide-react';
import { useCart } from '../stores/useCart';
import { useWishlist } from '../stores/useWishlist';
import { useComparison } from '../stores/useComparison';
import { useUI } from '../stores/useUI';
import { RatingStars } from './RatingStars';
import { PriceDisplay } from './PriceDisplay';
import { Badge } from './Badge';
import { QuickViewModal } from './QuickViewModal';

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
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  description?: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedSize] = useState(product.sizes?.[0] || '');
  const [adding, setAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addProduct, removeProduct, isInComparison, canAdd } = useComparison();
  const { addToast } = useUI();

  const inWishlist = isInWishlist(product.id);
  const inComparison = isInComparison(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    await addToCart(product.id, 1, selectedColor, selectedSize);
    setTimeout(() => setAdding(false), 600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inComparison) {
      removeProduct(product.id);
      addToast('Removed from comparison', 'info');
    } else if (canAdd()) {
      addProduct({ ...product, description: product.description || '' } as any);
      addToast('Added to comparison', 'success');
    } else {
      addToast('Can compare up to 3 products', 'warning');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickView(true);
    if (onQuickView) onQuickView(product);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative bg-[#141414] rounded-3xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-black">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_new && <Badge variant="new">NEW</Badge>}
            {product.is_hot && <Badge variant="hot">HOT</Badge>}
            {product.discount > 0 && (
              <div className="bg-rose-500 text-white text-xs font-medium px-3 py-1 rounded-full animate-pulse">
                -{product.discount}%
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className={`w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center border ${inWishlist ? 'bg-rose-500 border-rose-500' : 'bg-black/70 border-gray-700 hover:border-white'}`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white text-white' : 'text-white'}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompare}
              className={`w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center border ${inComparison ? 'bg-[#7C3AED] border-[#7C3AED]' : 'bg-black/70 border-gray-700 hover:border-white'}`}
            >
              <Scale className={`w-4 h-4 ${inComparison ? 'text-white' : 'text-white'}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickView}
              className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-xl border border-gray-700 hover:border-white flex items-center justify-center"
            >
              <Eye className="w-4 h-4 text-white" />
            </motion.button>
          </div>

          {/* Quick Add */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            onClick={handleAddToCart}
            disabled={adding}
            className="absolute bottom-4 right-4 bg-white hover:bg-[#7C3AED] text-black hover:text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 text-sm transition-all disabled:opacity-70"
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add
              </>
            )}
          </motion.button>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="text-xs text-gray-500 font-medium tracking-wider uppercase">{product.brand}</div>
              <h3 className="text-white font-medium text-[15px] line-clamp-2 mt-0.5">{product.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <RatingStars rating={product.rating} size={14} showCount count={product.review_count} />
          </div>

          <div className="flex items-center justify-between">
            <PriceDisplay price={product.price} originalPrice={product.original_price} size="sm" />
            
            {/* Color dots */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex gap-1.5">
                {product.colors.slice(0, 3).map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border border-gray-700"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <QuickViewModal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={{
          ...product,
          description: product.description || '',
          stock: product.stock || 100
        }}
      />
    </>
  );
};

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
