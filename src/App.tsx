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
import { useAuth } from './stores/useAuth';
import { useCart } from './stores/useCart';
import { useWishlist } from './stores/useWishlist';
import { useUI } from './stores/useUI';
import { ToastContainer } from './components/Toast';
import { SkipLink } from './components/SkipLink';
import { OfflineBanner } from './hooks/useNetworkStatus';

const AppContent: React.FC = () => {
  const { init, getToken } = useAuth();
  const { fetchCart } = useCart();
  const { fetchWishlist } = useWishlist();
  const { theme, setAccentColor } = useUI();

  useEffect(() => {
    init();
    
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    
    // Apply saved accent
    const savedAccent = (localStorage.getItem('accentColor') as any) || 'obsidian';
    setAccentColor(savedAccent);
    
    // Fetch cart/wishlist on auth
    const loadData = async () => {
      const token = await getToken();
      if (token) {
        await Promise.all([fetchCart(token), fetchWishlist(token)]);
      }
    };
    loadData();
  }, []);

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

