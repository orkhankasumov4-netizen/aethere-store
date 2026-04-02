import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { CategoryPage } from './pages/CategoryPage';
import { ComparePage } from './pages/ComparePage';
import { NotFound } from './pages/NotFound';
import { AuthCallback } from './pages/AuthCallback';
import { useCart } from './stores/useCart';
import { useWishlist } from './stores/useWishlist';
import { useUI } from './stores/useUI';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from './components/Toast';
import { SkipLink } from './components/SkipLink';
import { OfflineBanner } from './hooks/useNetworkStatus';

const AppContent: React.FC = () => {
  const { user, getToken, loading: authLoading } = useAuth();
  const { fetchCart } = useCart();
  const { fetchWishlist } = useWishlist();
  const { theme, setAccentColor } = useUI();

  // Apply saved theme and accent on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');

    const savedAccent = (localStorage.getItem('accentColor') as any) || 'obsidian';
    setAccentColor(savedAccent);
  }, [setAccentColor]);

  // Fetch cart/wishlist when user auth changes
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      
      const token = await getToken();
      if (token && user) {
        await Promise.all([fetchCart(token), fetchWishlist(token)]);
      } else if (!user) {
        // Clear cart/wishlist when logged out
        fetchCart(undefined);
        fetchWishlist(undefined);
      }
    };
    loadData();
  }, [user, authLoading, getToken, fetchCart, fetchWishlist]);

  // Show loading during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-400">Loading AETHER...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <SkipLink />
      <OfflineBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

