import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { FlashDeals } from '../components/FlashDeals';
import { CategoryGrid } from '../components/CategoryGrid';
import { BrandMarquee } from '../components/BrandMarquee';
import { Newsletter } from '../components/Newsletter';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { InstagramFeed } from '../components/InstagramFeed';
import { ComparisonBar } from '../components/ComparisonBar';
import { SEO } from '../components/SEO';
import { useNavigate } from 'react-router-dom';

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
  colors: any[];
  sizes: string[];
}

export const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'bestsellers' | 'rated'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/products?limit=12')
      .then(res => res.json())
      .then(data => setFeatured(data));
  }, []);

  const filteredProducts = featured.filter(p => {
    if (activeFilter === 'new') return p.is_new;
    if (activeFilter === 'bestsellers') return p.review_count > 200;
    if (activeFilter === 'rated') return p.rating >= 4.7;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      <SEO
        title="AETHER - Curated Luxury Products"
        description="Discover premium electronics, fashion, home & living, and accessories. Free shipping worldwide, 30-day returns, and secure checkout."
        ogImage="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[100dvh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(#222_0.8px,transparent_1px)] bg-[length:5px_5px]" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <div className="inline-block px-4 py-1 rounded-full border border-[#7C3AED]/50 text-xs tracking-[3px] text-[#7C3AED] mb-6">ESTABLISHED 2018</div>
          
          <h1 className="text-[92px] md:text-[120px] font-medium leading-none tracking-[-6px] mb-4">
            THE FUTURE<br />IS HERE
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 tracking-tight">Curated luxury. Delivered with intent.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' })}
              className="px-10 py-4 bg-white text-black rounded-2xl font-medium flex items-center justify-center gap-3 text-lg hover:bg-[#7C3AED] hover:text-white transition-all"
            >
              Shop Now <span>→</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="px-10 py-4 border border-white/30 text-white rounded-2xl font-medium flex items-center justify-center gap-3 text-lg hover:border-white transition-all"
            >
              Watch the Story
            </motion.button>
          </div>
        </motion.div>

        {/* Floating Products */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-16 right-8 md:right-20 hidden lg:block"
        >
          <img src="https://images.unsplash.com/photo-1592899677977-7c8a76a9c4f4" alt="iPhone" className="w-52 rounded-3xl shadow-2xl" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-20 left-8 md:left-20 hidden lg:block"
        >
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e" alt="Headphones" className="w-40 rounded-3xl shadow-2xl" />
        </motion.div>
      </div>

      {/* Trust Bar */}
      <div className="py-5 border-b border-gray-800 bg-black/50">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-10 gap-y-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">✓ Free Shipping Worldwide</div>
          <div className="flex items-center gap-2">✓ 30-Day Returns</div>
          <div className="flex items-center gap-2">✓ Secure Checkout</div>
          <div className="flex items-center gap-2">✓ Lifetime Support</div>
        </div>
      </div>

      <FlashDeals />
      <CategoryGrid />

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-[#7C3AED] text-xs tracking-[3px]">DISCOVER</div>
            <div className="text-4xl font-medium tracking-tight">Featured Collection</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800 pb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'new', label: 'New Arrivals' },
            { key: 'bestsellers', label: 'Best Sellers' },
            { key: 'rated', label: 'Top Rated' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-6 py-2 rounded-xl text-sm transition-all ${activeFilter === tab.key ? 'bg-[#7C3AED] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[420px] bg-[#141414] rounded-3xl animate-pulse" />
            ))
          )}
        </div>
      </div>

      <BrandMarquee />

      {/* Promo Banners */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-12 gap-6">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="md:col-span-7 relative h-[500px] rounded-3xl overflow-hidden group"
        >
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56b26" alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-12 max-w-md">
            <div className="text-sm text-[#7C3AED] mb-4 tracking-[2px]">LIMITED COLLECTION</div>
            <div className="text-5xl font-medium leading-none tracking-tight mb-6">The Autumn<br />Essentials</div>
            <button onClick={() => navigate('/category/Fashion')} className="px-8 py-3 border border-white text-white rounded-2xl hover:bg-white hover:text-black transition-all">Shop the Look</button>
          </div>
        </motion.div>

        <div className="md:col-span-5 space-y-6">
          <motion.div whileHover={{ scale: 1.01 }} className="relative h-[240px] rounded-3xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef" alt="MacBook" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute bottom-8 left-8">
              <div className="text-sm text-[#7C3AED]">NEW</div>
              <div className="text-4xl font-medium text-white mt-2">MacBook Pro</div>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.01 }} className="relative h-[240px] rounded-3xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1618221195710-dda453f83d44" alt="Home" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute bottom-8 left-8">
              <div className="text-sm text-[#7C3AED]">UP TO 30% OFF</div>
              <div className="text-4xl font-medium text-white mt-2">Home &amp; Living</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-[#141414] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[#7C3AED] text-xs tracking-[3px]">WHAT OUR MEMBERS SAY</div>
            <div className="text-4xl font-medium mt-3">Stories from the Circle</div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Elena K.", text: "The most seamless shopping experience. Every detail is considered.", product: "iPhone 16 Pro", rating: 5 },
              { name: "Marcus Chen", text: "Quality is unmatched. The packaging alone is a work of art.", product: "Dyson V15", rating: 5 },
              { name: "Sofia Patel", text: "I've never had a better customer experience. They truly care.", product: "Leather Jacket", rating: 5 }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-black p-8 rounded-3xl border border-gray-800"
              >
                <div className="flex gap-1 mb-4">{'★'.repeat(t.rating)}</div>
                <div className="text-xl text-white leading-snug">"{t.text}"</div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-purple-500" />
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">Verified Purchase • {t.product}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <InstagramFeed />

      <Newsletter />
      <Footer />
      <ComparisonBar />
    </div>
  );
};
