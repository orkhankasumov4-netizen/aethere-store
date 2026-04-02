import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../stores/useCart';
import { useNavigate } from 'react-router-dom';
import { PriceDisplay } from './PriceDisplay';

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cart, total, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-gray-800 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800">
              <div>
                <div className="text-xl font-medium text-white">Your Cart</div>
                <div className="text-xs text-gray-500">{cart.length} items</div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={22} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-6 opacity-40">🛍️</div>
                <div className="text-xl text-white mb-2">Your cart is empty</div>
                <p className="text-gray-500 mb-8">Discover our premium selection</p>
                <button onClick={() => { onClose(); navigate('/'); }} className="px-8 py-3 bg-white text-black rounded-2xl font-medium">Start Shopping</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-[#141414] rounded-2xl p-4 border border-gray-800">
                      <img src={item.products.image} alt={item.products.name} className="w-20 h-20 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium line-clamp-2">{item.products.name}</div>
                        <div className="text-xs text-gray-500">{item.products.brand}</div>
                        {(item.color || item.size) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.color} {item.size && `• ${item.size}`}
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <PriceDisplay price={item.products.price} size="sm" />
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white"><Minus size={12} /></button>
                            <span className="font-mono text-sm w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white"><Plus size={12} /></button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-rose-400 self-start"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-800 bg-[#141414]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="font-mono text-white">${total}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium mb-6">
                    <span>Total</span>
                    <span className="font-mono">${total}</span>
                  </div>

                  <button onClick={handleCheckout} className="w-full py-4 bg-white text-black rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-[#7C3AED] hover:text-white transition-all">
                    PROCEED TO CHECKOUT
                  </button>
                  <div className="text-center mt-3">
                    <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-400">Continue Shopping</button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
