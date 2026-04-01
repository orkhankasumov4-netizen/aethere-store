import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  brand: string;
  rating: number;
  review_count: number;
  stock: number;
  discount: number;
  is_new: boolean;
  is_hot: boolean;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
}

interface ComparisonStore {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  clearComparison: () => void;
  isInComparison: (productId: number) => boolean;
  canAdd: () => boolean;
}

export const useComparison = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const { products, canAdd } = get();
        if (!canAdd()) return;
        if (products.some((p) => p.id === product.id)) return;
        set({ products: [...products, product] });
      },

      removeProduct: (productId) => {
        set({ products: get().products.filter((p) => p.id !== productId) });
      },

      clearComparison: () => {
        set({ products: [] });
      },

      isInComparison: (productId) => {
        return get().products.some((p) => p.id === productId);
      },

      canAdd: () => {
        return get().products.length < 3;
      }
    }),
    {
      name: 'aether-comparison'
    }
  )
);
