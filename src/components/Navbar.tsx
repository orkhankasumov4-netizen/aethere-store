import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, User, Bell, Menu, X, Command, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCurrency, CURRENCIES, type Currency } from '../stores/useCurrency';
import { SearchBar } from './SearchBar';
import { MegaMenu } from './MegaMenu';
import { CartDrawer } from './CartDrawer';
import { CommandPalette } from './CommandPalette';

export const Navbar: React.FC = () => {
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchProducts, setSearchProducts] = useState<any[]>([]);

  const { user, signOut } = useAuth();
  const { count } = useCart();
  const { wishlist } = useWishlist();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();

  // Keyboard shortcut for command palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch products for command palette search
  React.useEffect(() => {
    fetch('/api/products?limit=20')
      .then(res => res.json())
      .then(data => setSearchProducts(data));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <svg width="36" height="36" viewBox="0 0 100 100" className="text-[#7C3AED]">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="url(#logoGrad)"
                  strokeWidth="6"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <path d="M35 42 Q50 32 65 42 Q50 68 35 42" fill="none" stroke="url(#logoGrad)" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-2xl tracking-[-1px] text-white">AETHER</div>
              <div className="text-[9px] text-gray-500 -mt-1 tracking-[2px]">EST 2018</div>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Right Nav */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-900/50 rounded-xl border border-gray-800 transition-colors"
            >
              <Command size={16} />
              <span>Search...</span>
              <kbd className="px-2 py-0.5 text-xs bg-gray-800 rounded">⌘K</kbd>
            </button>

            {/* Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <Globe size={19} />
              </button>

              {showCurrencyMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-3 w-48 bg-[#141414] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden z-50"
                >
                  <div className="py-2">
                    {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCurrency(c);
                          setShowCurrencyMenu(false);
                        }}
                        className={`w-full px-5 py-3 text-left text-sm flex items-center justify-between transition-colors ${
                          currency === c ? 'bg-[#7C3AED]/20 text-white' : 'text-gray-300 hover:bg-gray-900'
                        }`}
                      >
                        <span>{CURRENCIES[c].symbol} {c}</span>
                        {currency === c && <div className="w-2 h-2 bg-[#7C3AED] rounded-full" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Categories Mega Menu Trigger */}
            <button
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
              className="hidden lg:flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              SHOP
            </button>

            {/* Notifications */}
            <button 
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white relative transition-colors"
              aria-label="Notifications"
            >
              <Bell size={19} aria-hidden="true" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse" />
            </button>

            {/* Wishlist */}
            <Link 
              to="/dashboard" 
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white relative transition-colors"
              aria-label={`Wishlist, ${wishlist.length} items`}
            >
              <Heart size={19} aria-hidden="true" />
              {wishlist.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-medium">
                  {wishlist.length}
                </div>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setShowCart(true)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white relative transition-colors group"
              aria-label={`Shopping cart, ${count} items`}
            >
              <ShoppingCart size={19} aria-hidden="true" />
              {count > 0 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[#7C3AED] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-medium"
                >
                  {count}
                </motion.div>
              )}
            </button>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-white overflow-hidden border border-gray-700"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                {user ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-purple-500 flex items-center justify-center text-sm font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                ) : (
                  <User size={18} />
                )}
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-3 w-72 bg-[#141414] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
                >
                  {user ? (
                    <>
                      <div className="px-5 py-4 border-b border-gray-800">
                        <div className="font-medium text-white">{user.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-emerald-400">Online</div>
                          <div className="text-xs text-gray-600">•</div>
                          <div className="text-xs text-[#7C3AED]">0 pts</div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link to="/dashboard" className="px-5 py-3 hover:bg-gray-900 flex items-center text-sm text-gray-300">My Orders</Link>
                        <Link to="/dashboard" className="px-5 py-3 hover:bg-gray-900 flex items-center text-sm text-gray-300">Wishlist</Link>
                        <Link to="/dashboard" className="px-5 py-3 hover:bg-gray-900 flex items-center text-sm text-gray-300">Settings</Link>
                      </div>
                      <div className="border-t border-gray-800 py-2">
                        <button onClick={handleSignOut} className="px-5 py-3 w-full text-left text-sm text-rose-400 hover:bg-gray-900">Sign Out</button>
                      </div>
                    </>
                  ) : (
                    <div className="p-5">
                      <div className="text-sm text-gray-400 mb-4">Sign in to access your account</div>
                      <Link to="/dashboard" className="block w-full text-center py-3 bg-white text-black rounded-xl font-medium">Sign In</Link>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-4">
          <SearchBar />
        </div>
      </nav>

      {/* Mega Menu */}
      <MegaMenu isOpen={showMegaMenu} onClose={() => setShowMegaMenu(false)} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/95 z-50 lg:hidden pt-20">
          <div className="p-6 space-y-4">
            <Link to="/" className="block py-3 text-xl text-white" onClick={() => setShowMobileMenu(false)}>Home</Link>
            <Link to="/dashboard" className="block py-3 text-xl text-white" onClick={() => setShowMobileMenu(false)}>Account</Link>
            <Link to="/cart" className="block py-3 text-xl text-white" onClick={() => setShowMobileMenu(false)}>Cart ({count})</Link>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        products={searchProducts}
      />
    </>
  );
};
