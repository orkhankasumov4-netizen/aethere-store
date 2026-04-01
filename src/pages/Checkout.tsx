import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../stores/useUI';
import { useCurrency } from '../stores/useCurrency';
import { useLoyaltyPoints, calculateOrderPoints } from '../stores/useLoyaltyPoints';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, Tag, CheckCircle } from 'lucide-react';

export const Checkout: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<any>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  
  const { cart, total, clearCart } = useCart();
  const { user, getToken } = useAuth();
  const { addToast } = useUI();
  const { format } = useCurrency();
  const { addPoints } = useLoyaltyPoints();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    address: '123 Luxury Lane',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '123',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handlePlaceOrder = async () => {
    if (!user) {
      addToast('Please sign in to complete checkout', 'warning');
      navigate('/dashboard');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const subtotal = total;
      const discount = promoResult?.discount_amount || 0;
      const giftWrapFee = giftWrap ? 5.99 : 0;
      const tax = (subtotal - discount) * 0.08;
      const finalTotal = subtotal - discount + giftWrapFee + tax;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          total: finalTotal,
          shipping_address: { fullName: formData.fullName, address: formData.address, city: formData.city, state: formData.state, zip: formData.zip },
          payment_method: 'Card',
          gift_wrap: giftWrap,
          gift_message: giftMessage,
          promo_code: promoResult?.code,
          discount_amount: discount
        })
      });
      if (res.ok) {
        // Add loyalty points
        const pointsEarned = calculateOrderPoints(finalTotal);
        addPoints(pointsEarned, `Order placed`, res.json ? (await res.json()).id : undefined);
        
        setCompleted(true);
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 } });
        setTimeout(() => {
          clearCart();
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      addToast('Checkout failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = total;
  const discount = promoResult?.discount_amount || 0;
  const giftWrapFee = giftWrap ? 5.99 : 0;
  const tax = (subtotal - discount) * 0.08;
  const finalTotal = subtotal - discount + giftWrapFee + tax;
  const pointsEarned = calculateOrderPoints(finalTotal);

  if (completed) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🎉</div>
          <div className="text-4xl font-medium text-white mb-4">Order Confirmed</div>
          <div className="text-xl text-gray-400 mb-8">Thank you for shopping with AETHER</div>
          <div className="text-sm text-gray-500">Redirecting to home...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[3px] text-[#7C3AED]">CHECKOUT</div>
          <div className="text-4xl font-medium mt-2">Complete Your Purchase</div>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 text-sm">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-white' : 'text-gray-600'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= s ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-gray-700'}`}>{s}</div>
                <div>{s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Review'}</div>
                {s < 3 && <div className="w-10 h-px bg-gray-800" />}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="max-w-xl mx-auto bg-[#141414] p-10 rounded-3xl border border-gray-800">
            <div className="text-xl font-medium mb-6">Shipping Information</div>
            <div className="space-y-5">
              <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4" />
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4" />
              <input name="address" value={formData.address} onChange={handleChange} placeholder="Street Address" className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4" />
              <div className="grid grid-cols-3 gap-4">
                <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="bg-black border border-gray-800 rounded-2xl px-5 py-4" />
                <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="bg-black border border-gray-800 rounded-2xl px-5 py-4" />
                <input name="zip" value={formData.zip} onChange={handleChange} placeholder="ZIP" className="bg-black border border-gray-800 rounded-2xl px-5 py-4" />
              </div>
            </div>
            <button onClick={() => setStep(2)} className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-medium">Continue to Payment</button>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-xl mx-auto bg-[#141414] p-10 rounded-3xl border border-gray-800">
            <div className="text-xl font-medium mb-6">Payment Details</div>
            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-2">CARD NUMBER</div>
              <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 font-mono tracking-widest" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-2">EXPIRY</div>
                <input name="expiry" value={formData.expiry} onChange={handleChange} className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 font-mono" />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">CVV</div>
                <input name="cvv" value={formData.cvv} onChange={handleChange} className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 font-mono" />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-800 rounded-2xl">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-white text-black rounded-2xl font-medium">Review Order</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-xl mx-auto">
            <div className="bg-[#141414] p-10 rounded-3xl border border-gray-800 mb-6">
              <div className="text-xl font-medium mb-6">Order Summary</div>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>{item.products.name} × {item.quantity}</div>
                    <div className="font-mono">{format(item.products.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="text-xs text-gray-500 mb-2">PROMO CODE</div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      disabled={promoResult?.valid}
                      className="w-full bg-black border border-gray-800 rounded-xl pl-10 pr-4 py-3 focus:border-[#7C3AED] focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleValidatePromo}
                    disabled={promoResult?.valid}
                    className="px-4 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {promoResult?.valid ? <CheckCircle size={20} className="text-emerald-400" /> : 'Apply'}
                  </button>
                </div>
                {promoResult?.valid && (
                  <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle size={14} />
                    {promoResult.description} applied
                  </div>
                )}
              </div>

              {/* Gift Wrapping */}
              <div className="mb-6 p-4 bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/30 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gift size={18} className="text-rose-400" />
                    <span className="font-medium">Add gift wrapping</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C3AED]"></div>
                  </label>
                </div>
                {giftWrap && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className="text-xs text-gray-500 mb-2">Gift Message (max 200 characters)</div>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value.slice(0, 200))}
                      placeholder="Write your gift message..."
                      rows={3}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 focus:outline-none resize-none"
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">{giftMessage.length}/200</div>
                    <div className="text-sm text-rose-400 mt-2">+$5.99</div>
                  </motion.div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-800 pt-4 space-y-2 text-sm">
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
                {giftWrapFee > 0 && (
                  <div className="flex justify-between">
                    <span>Gift Wrapping</span>
                    <span className="font-mono">{format(giftWrapFee)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax</span>
                  <span className="font-mono">{format(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-800">
                  <span>Total</span>
                  <span className="font-mono">{format(finalTotal)}</span>
                </div>
              </div>

              {/* Loyalty Points */}
              <div className="mt-4 p-3 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-xl">
                <div className="text-sm text-[#7C3AED] flex items-center gap-2">
                  <CheckCircle size={14} />
                  You'll earn {pointsEarned} loyalty points with this order
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-2xl font-medium flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? 'PROCESSING...' : 'PLACE ORDER'}
            </motion.button>
            <button onClick={() => setStep(2)} className="mt-3 w-full text-sm text-gray-500">← Back to Payment</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
