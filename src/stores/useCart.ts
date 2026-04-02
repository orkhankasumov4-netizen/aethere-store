import { create } from 'zustand';
import { useAuth } from './useAuth';

export interface CartItem {
  id: string; // some places use number, assuming string for parity with unified approach
  product_id: string;
  quantity: number;
  color?: string;
  size?: string;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    stock: number;
  };
}

interface CartStore {
  cart: CartItem[];
  loading: boolean;
  total: number;
  count: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string | number, quantity: number, color?: string, size?: string) => Promise<void>;
  updateQuantity: (id: string | number, quantity: number) => Promise<void>;
  removeFromCart: (id: string | number) => Promise<void>;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set, get) => ({
  cart: [],
  loading: false,
  total: 0,
  count: 0,

  fetchCart: async () => {
    const token = await useAuth.getState().getToken();
    if (!token) {
      set({ cart: [], total: 0, count: 0 });
      return;
    }
    set({ loading: true });
    try {
      const res = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data || []);
      const safeItems = Array.isArray(items) ? items : [];
      
      const total = safeItems.reduce((sum: number, item: CartItem) =>
        sum + (item.products?.price || 0) * item.quantity, 0);
      const count = safeItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      
      set({ cart: safeItems, total, count, loading: false });
    } catch {
      set({ cart: [], total: 0, count: 0, loading: false });
    }
  },

  addToCart: async (productId, quantity, color = '', size = '') => {
    const token = await useAuth.getState().getToken();
    if (!token) {
      // Could throw or alert contextually, returning early for now.
      return;
    }
    set({ loading: true });
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity, color, size })
      });
      if (res.ok) {
        await get().fetchCart();
      }
    } catch (e) {
      console.error('addToCart error:', e);
    }
    set({ loading: false });
  },

  updateQuantity: async (id, quantity) => {
    const token = await useAuth.getState().getToken();
    if (!token) return;

    // Optimistic update
    const items = get().cart.map(item => 
      String(item.id) === String(id) ? { ...item, quantity } : item
    );
    const total = items.reduce((sum, item) => 
      sum + (item.products?.price || 0) * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ cart: items, total, count });
    
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, quantity })
      });
    } catch (e) {
      console.error('updateQuantity error', e);
      // Optional: rollback on error by fetching cart again
      await get().fetchCart();
    }
  },

  removeFromCart: async (id) => {
    const token = await useAuth.getState().getToken();
    if (!token) return;

    // Optimistic update
    const items = get().cart.filter(item => String(item.id) !== String(id));
    const total = items.reduce((sum, item) => 
      sum + (item.products?.price || 0) * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ cart: items, total, count });
    
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.error('removeFromCart error', e);
      await get().fetchCart();
    }
  },

  clearCart: () => set({ cart: [], total: 0, count: 0 })
}));
