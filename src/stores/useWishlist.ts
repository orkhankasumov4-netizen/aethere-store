import { create } from 'zustand';
import { useAuth } from './useAuth';

export interface WishlistItem {
  id: number | string;
  product_id: number | string;
  products: {
    id: number | string;
    name: string;
    price: number;
    image: string;
    brand: string;
    rating: number;
  };
}

interface WishlistStore {
  wishlist: WishlistItem[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number | string) => Promise<void>;
  isInWishlist: (productId: number | string) => boolean;
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  wishlist: [],
  loading: false,

  fetchWishlist: async () => {
    const token = await useAuth.getState().getToken();
    if (!token) {
      set({ wishlist: [] });
      return;
    }
    set({ loading: true });
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data || []);
      set({ wishlist: Array.isArray(items) ? items : [], loading: false });
    } catch (err) {
      console.error('Wishlist fetch error:', err);
      set({ wishlist: [], loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const token = await useAuth.getState().getToken();
    if (!token) {
      // Typically alerted in UI, silent fallback in store
      return;
    }
    set({ loading: true });
    
    try {
      const existing = get().wishlist.find(w => String(w.product_id) === String(productId));
      if (existing) {
        // Optimistic UI update
        const updatedWishlist = get().wishlist.filter(w => String(w.product_id) !== String(productId));
        set({ wishlist: updatedWishlist });

        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: productId })
        });
        
        // Rollback on failure
        if (!res.ok) {
           await get().fetchWishlist();
        }
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
          const json = await res.json();
          // Assuming json might be { data: item } or item itself
          const newItem = Array.isArray(json) ? json[0] : (json.data || json);
          set({ wishlist: [...get().wishlist, newItem] });
        } else {
          // Sync with server if post failed
          await get().fetchWishlist();
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      await get().fetchWishlist();
    } finally {
      set({ loading: false });
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some(w => String(w.product_id) === String(productId));
  }
}));
