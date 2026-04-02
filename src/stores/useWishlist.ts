import { create } from 'zustand';

interface WishlistItem {
  id: string;
  product_id: string;
  products?: {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    rating: number;
  };
}

interface WishlistStore {
  items: WishlistItem[];
  loading: boolean;
  toggleItem: (productId: string, token?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: (token?: string) => Promise<void>;
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async (token) => {
    if (!token) {
      set({ items: [] });
      return;
    }
    set({ loading: true });
    try {
      const res = await fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data || []);
      set({ items: Array.isArray(items) ? items : [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  toggleItem: async (productId, token) => {
    if (!token) return;
    const existing = get().items.find(i => i.product_id === productId);
    set({ loading: true });
    
    try {
      if (existing) {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId })
        });
        set({ items: get().items.filter(i => i.product_id !== productId) });
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId })
        });
        if (res.ok) {
          const newItem = await res.json();
          set({ items: [...get().items, newItem] });
        }
      }
    } catch {}
    set({ loading: false });
  },

  isInWishlist: (productId) => get().items.some(i => i.product_id === productId)
}));
