import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useLoyaltyPoints } from '../stores/useLoyaltyPoints';
import { useCurrency } from '../stores/useCurrency';
import { Link } from 'react-router-dom';
import { RatingStars } from '../components/RatingStars';
import { motion } from 'framer-motion';
import { Gift, Mail, Key, Award, TrendingUp, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, signIn, signUp, signOut, signInWithGoogle } = useAuth();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const { balance, history, fetchPoints } = useLoyaltyPoints();
  const { format } = useCurrency();
  
  const [email, setEmail] = useState('demo@aether.com');
  const [password, setPassword] = useState('password123');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch orders
      fetch('/api/orders', { headers: { Authorization: `Bearer ${localStorage.getItem('sb-access-token') || ''}` } })
        .then(res => res.json())
        .then(data => setOrders(data || []));
      
      // Fetch loyalty points
      fetch('/api/user?action=profile', { headers: { Authorization: `Bearer ${localStorage.getItem('sb-access-token') || ''}` } })
        .then(res => res.json())
        .then(data => {
          if (data.loyalty_points !== undefined) {
            fetchPoints(localStorage.getItem('sb-access-token') || '');
          }
        });
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    // Simulate password reset email
    await new Promise(resolve => setTimeout(resolve, 1000));
    setForgotSubmitted(true);
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-10">
            <div className="text-4xl font-medium mb-2">Welcome to AETHER</div>
            <div className="text-gray-500">Sign in to access your account</div>
          </div>

          {!showForgotPassword ? (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-[#141414] border border-gray-800 rounded-2xl px-5 py-4" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-[#141414] border border-gray-800 rounded-2xl px-5 py-4" />
                <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-medium">
                  {loading ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                className="mt-4 w-full py-4 bg-white text-black rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="text-center mt-4">
                <button onClick={() => setShowForgotPassword(true)} className="text-sm text-[#7C3AED] hover:underline flex items-center justify-center gap-2 mx-auto">
                  <Key size={14} /> Forgot Password?
                </button>
              </div>

              <div className="text-center mt-4">
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-[#7C3AED]">
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>

              <div className="text-center mt-8 text-xs text-gray-500">Demo: demo@aether.com / password123</div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {!forgotSubmitted ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-xl font-medium mb-2">Reset Password</div>
                    <div className="text-sm text-gray-500">Enter your email and we'll send you a reset link</div>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-[#141414] border border-gray-800 rounded-2xl px-5 py-4" />
                    <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-medium">
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                  <button onClick={() => setShowForgotPassword(false)} className="mt-4 w-full text-sm text-gray-500">← Back to Sign In</button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} className="text-emerald-400" />
                  </div>
                  <div className="text-xl font-medium mb-2">Check Your Email</div>
                  <div className="text-sm text-gray-400 mb-6">We've sent a password reset link to {forgotEmail}</div>
                  <button onClick={() => setShowForgotPassword(false)} className="px-8 py-3 bg-white text-black rounded-2xl font-medium">
                    Back to Sign In
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="text-sm text-[#7C3AED]">WELCOME BACK</div>
            <div className="text-4xl font-medium tracking-tight">{user.email?.split('@')[0]}</div>
          </div>
          <button onClick={signOut} className="px-6 py-2 text-sm border border-gray-800 rounded-xl hover:bg-gray-900">Sign Out</button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-[#141414] rounded-3xl border border-gray-800 p-6 sticky top-24">
              <div className="text-xs text-gray-500 mb-4">ACCOUNT</div>
              <nav className="space-y-1 text-sm">
                <div className="px-4 py-3 rounded-xl bg-white/5 text-white">Overview</div>
                <div className="px-4 py-3 text-gray-400 hover:text-white">My Orders</div>
                <div className="px-4 py-3 text-gray-400 hover:text-white">Wishlist ({wishlist.length})</div>
                <div className="px-4 py-3 text-gray-400 hover:text-white">Addresses</div>
                <div className="px-4 py-3 text-gray-400 hover:text-white">Payment Methods</div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Orders', value: orders.length, icon: <TrendingUp size={20} /> },
                { label: 'Wishlist Items', value: wishlist.length, icon: <Gift size={20} /> },
                { label: 'Cart Items', value: cart.length, icon: <Clock size={20} /> },
                { label: 'Loyalty Points', value: balance, icon: <Award size={20} />, highlight: true },
              ].map((stat, i) => (
                <div key={i} className={`bg-[#141414] border border-gray-800 rounded-3xl p-6 ${stat.highlight ? 'border-[#7C3AED]/50 bg-[#7C3AED]/10' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl font-mono">{stat.value}</div>
                    <div className={stat.highlight ? 'text-[#7C3AED]' : 'text-gray-500'}>{stat.icon}</div>
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Loyalty Points History */}
            {history.length > 0 && (
              <div className="bg-[#141414] rounded-3xl border border-gray-800 p-8 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Award size={20} className="text-[#7C3AED]" />
                  <div className="text-xl font-medium">Loyalty Points History</div>
                </div>
                <div className="space-y-3">
                  {history.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-none">
                      <div>
                        <div className="text-sm">{entry.reason}</div>
                        <div className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className={`font-mono ${entry.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {entry.points > 0 ? '+' : ''}{entry.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-[#141414] rounded-3xl border border-gray-800 p-8 mb-8">
              <div className="flex justify-between mb-6">
                <div className="text-xl font-medium">Recent Orders</div>
                <Link to="/cart" className="text-sm text-[#7C3AED]">View all →</Link>
              </div>
              {orders.length > 0 ? (
                orders.slice(0, 3).map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-800 last:border-none">
                    <div>
                      <div className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{format(order.total)}</div>
                      <div className="text-xs text-emerald-400">{order.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">No orders yet. Start shopping!</div>
              )}
            </div>

            {/* Wishlist Preview */}
            <div className="bg-[#141414] rounded-3xl border border-gray-800 p-8">
              <div className="flex justify-between mb-6">
                <div className="text-xl font-medium">Wishlist</div>
                <Link to="/cart" className="text-sm text-[#7C3AED]">View all →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {wishlist.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="bg-black rounded-2xl p-4 flex gap-4">
                    <img src={item.products.image} className="w-20 h-20 object-cover rounded-xl" />
                    <div>
                      <div className="text-sm text-white line-clamp-2">{item.products.name}</div>
                      <div className="text-xs text-gray-500">{item.products.brand}</div>
                      <RatingStars rating={item.products.rating} size={12} />
                    </div>
                  </div>
                ))}
                {wishlist.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-500">Your wishlist is empty</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
