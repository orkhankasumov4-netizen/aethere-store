import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { usePullToRefresh, PullToRefreshIndicator } from '../hooks/usePullToRefresh';
import { useUI } from '../stores/useUI';

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

export const CategoryPage: React.FC = () => {
  const { name } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useUI();

  const fetchProducts = async () => {
    if (name) {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(name)}`);
        const json = await res.json();
        const products = Array.isArray(json) ? json : (json.data || []);
        setProducts(Array.isArray(products) ? products : []);
        addToast('Products refreshed', 'success');
      } catch {
        addToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [name]);

  const { refreshing, pullDistance } = usePullToRefresh({ onRefresh: fetchProducts });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <PullToRefreshIndicator distance={pullDistance} refreshing={refreshing} />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>›</span>
          <span>{name}</span>
        </div>
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="text-[#7C3AED] text-xs tracking-[3px]">COLLECTION</div>
            <div className="text-5xl font-medium tracking-tight">{name}</div>
          </div>
          <div className="text-gray-500 text-sm">{products.length} products</div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[420px] bg-[#141414] rounded-3xl animate-pulse" />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">😶</div>
            <div className="text-xl">No products in this category yet</div>
            <Link to="/" className="text-[#7C3AED] mt-4 inline-block">Browse all products</Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
