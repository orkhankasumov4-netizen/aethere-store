import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO, createProductJsonLd } from '../components/SEO';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useUI } from '../stores/useUI';
import { RatingStars } from '../components/RatingStars';
import { PriceDisplay } from '../components/PriceDisplay';
import { QuantitySelector } from '../components/QuantitySelector';
import { ColorSwatch } from '../components/ColorSwatch';
import { SizeSelector } from '../components/SizeSelector';
import { Badge } from '../components/Badge';
import { ARTryOnModal } from '../components/ARTryOnModal';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { ShareButton } from '../components/ShareButton';
import { Heart, ShoppingCart, Truck, Mail, MessageSquare, Send } from 'lucide-react';

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
  discount: number;
  is_new: boolean;
  is_hot: boolean;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
}

interface Question {
  id: string;
  question: string;
  answer?: string;
  user_email?: string;
  created_at: string;
  answered_at?: string;
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showARTryOn, setShowARTryOn] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'qa'>('description');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<{ min: Date; max: Date } | null>(null);
  const [stockNotificationEmail, setStockNotificationEmail] = useState('');
  const [stockNotificationSubmitted, setStockNotificationSubmitted] = useState(false);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useUI();

  useEffect(() => {
    if (id) {
      fetch(`/api/products?id=${id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data);
          if (data.colors?.length) setSelectedColor(data.colors[0].name);
          if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        });
    }
  }, [id]);

  // Fetch Q&A
  useEffect(() => {
    if (id) {
      fetch(`/api/product_questions?product_id=${id}`)
        .then(res => res.json())
        .then(data => setQuestions(data || []));
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.id, quantity, selectedColor, selectedSize);
    setTimeout(() => setAdding(false), 600);
  };

  const handleCalculateDelivery = () => {
    if (!zipCode) {
      addToast('Please enter a ZIP code', 'warning');
      return;
    }
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + Math.floor(Math.random() * 4) + 3); // 3-7 days
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + Math.floor(Math.random() * 4) + 7);
    setDeliveryEstimate({ min: minDate, max: maxDate });
    addToast('Delivery estimate calculated', 'success');
  };

  const handleStockNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockNotificationEmail) {
      addToast('Please enter your email', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/stock_notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, email: stockNotificationEmail })
      });
      const data = await res.json();
      if (data.already_subscribed) {
        addToast('You are already subscribed!', 'info');
      } else {
        setStockNotificationSubmitted(true);
        addToast('You will be notified when back in stock!', 'success');
      }
    } catch {
      addToast('Failed to submit. Please try again.', 'error');
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion) return;
    
    const token = localStorage.getItem('sb-access-token');
    if (!token) {
      addToast('Please sign in to ask a question', 'warning');
      navigate('/dashboard');
      return;
    }

    try {
      const res = await fetch('/api/product_questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id, question: newQuestion })
      });
      if (res.ok) {
        setNewQuestion('');
        addToast('Question submitted!', 'success');
        // Refresh questions
        const qRes = await fetch(`/api/product_questions?product_id=${id}`);
        const qData = await qRes.json();
        setQuestions(qData || []);
      }
    } catch {
      addToast('Failed to submit question', 'error');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <SEO
        title={product.name}
        description={product.description}
        ogImage={product.image}
        ogType="product"
        jsonLd={createProductJsonLd({
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          originalPrice: product.original_price,
          brand: product.brand,
          rating: product.rating,
          reviewCount: product.review_count,
          inStock: product.stock > 0,
          url: window.location.href
        })}
      />
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <span onClick={() => navigate('/')} className="hover:text-white cursor-pointer">Home</span>
          <span>›</span>
          <span onClick={() => navigate(`/category/${product.category}`)} className="hover:text-white cursor-pointer">{product.category}</span>
          <span>›</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div>
            <div className="relative bg-black rounded-3xl overflow-hidden aspect-square mb-4">
              <motion.img
                key={selectedImage}
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.is_new && <Badge variant="new">NEW</Badge>}
                {product.is_hot && <Badge variant="hot">HOT</Badge>}
                {product.discount > 0 && (
                  <div className="bg-rose-500 text-white text-xs font-medium px-3 py-1 rounded-full animate-pulse">
                    -{product.discount}%
                  </div>
                )}
              </div>
              
              {/* AR Try-On Button */}
              <button
                onClick={() => setShowARTryOn(true)}
                className="absolute bottom-6 left-6 px-4 py-2 bg-black/70 backdrop-blur-xl rounded-xl text-sm flex items-center gap-2 hover:bg-[#7C3AED] transition-colors"
              >
                📱 Try in AR
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${idx === selectedImage ? 'border-[#7C3AED]' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-sm text-[#7C3AED] tracking-[3px]">{product.brand.toUpperCase()}</div>
              <div className="text-gray-500">•</div>
              <div className="text-sm text-gray-500">{product.category}</div>
            </div>
            <h1 className="text-5xl font-medium tracking-tight leading-none mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <RatingStars rating={product.rating} size={22} showCount count={product.review_count} />
              <button onClick={() => setActiveTab('reviews')} className="text-sm text-[#7C3AED] hover:underline">
                {product.review_count} reviews
              </button>
            </div>

            <div className="mb-6">
              <PriceDisplay price={product.price} originalPrice={product.original_price} size="lg" />
            </div>

            <div className="text-gray-400 text-lg leading-relaxed mb-6">{product.description}</div>

            {/* Stock Status */}
            {isOutOfStock ? (
              <div className="mb-6 flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-rose-400 rounded-full" />
                <span className="text-rose-400">Out of stock</span>
              </div>
            ) : (
              <div className="mb-6 flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-emerald-400">In stock • Ships today</span>
              </div>
            )}

            {/* Variants */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <div className="text-xs text-gray-500 mb-3 tracking-widest">COLOR</div>
                <ColorSwatch colors={product.colors} selected={selectedColor} onSelect={setSelectedColor} />
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-500 tracking-widest">SIZE</div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-[#7C3AED] hover:underline"
                  >
                    Size Guide
                  </button>
                </div>
                <SizeSelector sizes={product.sizes} selected={selectedSize} onSelect={setSelectedSize} />
              </div>
            )}

            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-2 tracking-widest">QUANTITY</div>
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className="flex-1 py-4 bg-white text-black rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-[#7C3AED] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} /> {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => toggleWishlist(product.id)}
                className={`w-14 h-14 border rounded-2xl flex items-center justify-center ${inWishlist ? 'border-rose-500 bg-rose-500/10' : 'border-gray-800 hover:border-white'}`}
              >
                <Heart className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} size={20} />
              </motion.button>
            </div>

            <ShareButton url={window.location.href} title={product.name} image={product.image} />

            {/* Delivery Calculator */}
            <div className="mt-8 border-t border-gray-800 pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <Truck size={16} />
                <span>Enter ZIP code for delivery estimate</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP Code"
                  className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-[#7C3AED] focus:outline-none"
                />
                <button
                  onClick={handleCalculateDelivery}
                  className="px-4 py-3 bg-gray-800 rounded-xl text-sm hover:bg-gray-700 transition-colors"
                >
                  Calculate
                </button>
              </div>
              {deliveryEstimate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-emerald-400"
                >
                  Estimated delivery: {formatDate(deliveryEstimate.min)} - {formatDate(deliveryEstimate.max)}
                </motion.div>
              )}
            </div>

            {/* Back in Stock Notification */}
            {isOutOfStock && !stockNotificationSubmitted && (
              <form onSubmit={handleStockNotification} className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                <div className="flex items-center gap-2 text-sm text-rose-400 mb-3">
                  <Mail size={16} />
                  <span>Notify me when back in stock</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={stockNotificationEmail}
                    onChange={(e) => setStockNotificationEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-rose-500 text-white rounded-xl text-sm hover:bg-rose-600 transition-colors"
                  >
                    Notify Me
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20 border-t border-gray-800 pt-12">
          <div className="flex gap-8 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 text-sm transition-colors relative ${activeTab === 'description' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Description
              {activeTab === 'description' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Reviews
              {activeTab === 'reviews' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`pb-4 text-sm transition-colors relative ${activeTab === 'qa' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Q&A
              {activeTab === 'qa' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
              )}
            </button>
          </div>

          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <div className="prose prose-invert text-gray-400">
                <p>{product.description}</p>
                <p className="mt-6">Crafted from premium materials with exceptional attention to detail. Every AETHER product is designed for lasting performance and timeless style.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">⭐</div>
                <div>Reviews coming soon</div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div>
                {/* Ask a Question */}
                <form onSubmit={handleAskQuestion} className="mb-8 p-6 bg-[#141414] rounded-2xl border border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <MessageSquare size={16} />
                    <span>Ask a Question</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="What would you like to know?"
                      className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-[#7C3AED] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#7C3AED] text-white rounded-xl text-sm hover:bg-[#8B5CF6] transition-colors flex items-center gap-2"
                    >
                      <Send size={16} /> Ask
                    </button>
                  </div>
                </form>

                {/* Questions List */}
                <div className="space-y-4">
                  {questions.length > 0 ? (
                    questions.map((q) => (
                      <div key={q.id} className="p-6 bg-[#141414] rounded-2xl border border-gray-800">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <MessageSquare size={16} className="text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white">{q.question}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {q.user_email || 'Anonymous'} • {new Date(q.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {q.answer && (
                          <div className="ml-11 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                            <div className="text-xs text-emerald-400 mb-1">AETHER Response</div>
                            <div className="text-gray-300 text-sm">{q.answer}</div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <div>No questions yet. Be the first to ask!</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ARTryOnModal isOpen={showARTryOn} onClose={() => setShowARTryOn(false)} productName={product.name} />
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} category="clothing" />
      <Footer />
    </div>
  );
};
