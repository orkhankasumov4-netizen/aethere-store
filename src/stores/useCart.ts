import { create } from 'zustand';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selected_color?: string;
  selected_size?: string;
  products?: {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    stock: number;
  };
}

interface CartStore {
  items: CartItem[];
  loading: boolean;
  total: number;
  count: number;
  fetchCart: (token?: string) => Promise<void>;
  addItem: (productId: string, quantity: number, color?: string, size?: string, token?: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number, token?: string) => Promise<void>;
  removeItem: (id: string, token?: string) => Promise<void>;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  total: 0,
  count: 0,

  fetchCart: async (token) => {
    if (!token) {
      set({ items: [], total: 0, count: 0 });
      return;
    }
    set({ loading: true });
    try {
      const res = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const items = data || [];
      const total = items.reduce((sum: number, item: CartItem) => 
        sum + (item.products?.price || 0) * item.quantity, 0);
      const count = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      set({ items, total, count, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity, color, size, token) => {
    if (!token) return;
    set({ loading: true });
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity, color, size })
      });
      if (res.ok) await get().fetchCart(token);
    } catch {}
    set({ loading: false });
  },

  updateQuantity: async (id, quantity, token) => {
    if (!token) return;
    const items = get().items.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    const total = items.reduce((sum, item) => 
      sum + (item.products?.price || 0) * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ items, total, count });
    
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, quantity })
      });
    } catch {}
  },

  removeItem: async (id, token) => {
    if (!token) return;
    const items = get().items.filter(item => item.id !== id);
    const total = items.reduce((sum, item) => 
      sum + (item.products?.price || 0) * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ items, total, count });
    
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
    } catch {}
  },

  clearCart: () => set({ items: [], total: 0, count: 0 })
}));
