import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../stores/useCurrency';
import { useUI } from '../stores/useUI';
import { PriceDisplay } from '../components/PriceDisplay';
import { Plus, Minus, Trash2, Tag, CheckCircle } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, total, updateQuantity, removeFromCart } = useCart();
  const { format } = useCurrency();
  const { addToast } = useUI();
  const navigate = useNavigate();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<any>(null);

  const handleValidatePromo = async () => {
    if (!promoCode) {
      addToast('Enter a promo code', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/promo_codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderTotal: total })
      });
      const data = await res.json();
      if (data.valid) {
        setPromoResult(data);
        addToast(`Promo applied: ${data.description}`, 'success');
      } else {
        setPromoResult(null);
        addToast(data.error || 'Invalid promo code', 'error');
      }
    } catch {
      addToast('Failed to validate promo code', 'error');
    }
  };

  const subtotal = total;
  const discount = promoResult?.discount_amount || 0;
  const tax = (subtotal - discount) * 0.08;
  const finalTotal = subtotal - discount + tax;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="text-4xl font-medium tracking-tight">Shopping Cart</div>
            <div className="text-gray-500 mt-1">{cart.length} items</div>
          </div>
          <Link to="/" className="text-sm text-[#7C3AED]">← Continue Shopping</Link>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-8">🛍️</div>
            <div className="text-3xl text-white mb-4">Your cart is empty</div>
            <p className="text-gray-500 mb-8">Discover our exclusive collection</p>
            <Link to="/" className="inline-block px-8 py-4 bg-white text-black rounded-2xl font-medium">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-6 bg-[#141414] p-6 rounded-3xl border border-gray-800">
                  <img src={item.products.image} alt={item.products.name} className="w-32 h-32 object-cover rounded-2xl" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xl text-white">{item.products.name}</div>
                        <div className="text-gray-500 text-sm">{item.products.brand}</div>
                      </div>
                      <PriceDisplay price={item.products.price} size="md" />
                    </div>

                    {(item.color || item.size) && (
                      <div className="text-sm text-gray-500 mt-2">{item.color} {item.size && `• ${item.size}`}</div>
                    )}

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center border border-gray-800 rounded-xl">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-2 text-gray-400"><Minus size={14} /></button>
                        <span className="px-4 font-mono">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 text-gray-400"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-rose-400 text-sm flex items-center gap-1 hover:text-rose-500"><Trash2 size={14} /> Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 bg-[#141414] border border-gray-800 rounded-3xl p-8">
                <div className="text-lg font-medium mb-6">Order Summary</div>
                
                {/* Promo Code */}
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-2">PROMO CODE</div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        disabled={promoResult?.valid}
                        className="w-full bg-black border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:border-[#7C3AED] focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={handleValidatePromo}
                      disabled={promoResult?.valid}
                      className="px-4 py-2.5 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {promoResult?.valid ? <CheckCircle size={18} className="text-emerald-400" /> : 'Apply'}
                    </button>
                  </div>
                  {promoResult?.valid && (
                    <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={12} />
                      {promoResult.description} applied
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="font-mono">{format(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span className="font-mono">-{format(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax</span>
                    <span className="font-mono">{format(tax)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-800 my-6" />
                <div className="flex justify-between text-xl font-medium mb-8">
                  <span>Total</span>
                  <span className="font-mono">{format(finalTotal)}</span>
                </div>

                <button onClick={() => navigate('/checkout')} className="w-full py-4 bg-white text-black rounded-2xl font-medium hover:bg-[#7C3AED] hover:text-white transition-all">
                  PROCEED TO CHECKOUT
                </button>

                <div className="flex justify-center gap-4 mt-6 text-xs text-gray-500">
                  <div>Visa</div><div>Mastercard</div><div>Apple Pay</div><div>PayPal</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
