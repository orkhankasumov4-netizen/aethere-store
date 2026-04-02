import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: number;
  product_id: number;
  products: {
    id: number;
    name: string;
    price: number;
    image: string;
    brand: string;
    rating: number;
  };
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, getToken } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data || []);
      setWishlist(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Wishlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      alert('Please sign in to add to wishlist');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const existing = wishlist.find(w => w.product_id === productId);
      if (existing) {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: productId })
        });
        const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
        if (res.ok) setWishlist(safeWishlist.filter(w => w.product_id !== productId));
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: productId })
        });
        if (res.ok) {
          const newItem = await res.json();
          const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
          setWishlist([...safeWishlist, newItem]);
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: number) => wishlist.some(w => w.product_id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
