import { create } from 'zustand';

export interface LoyaltyPointEntry {
  id: string;
  points: number;
  reason: string;
  order_id?: string;
  created_at: string;
}

interface LoyaltyPointsStore {
  balance: number;
  history: LoyaltyPointEntry[];
  loading: boolean;
  fetchPoints: (token: string) => Promise<void>;
  addPoints: (points: number, reason: string, orderId?: string) => void;
  clearPoints: () => void;
}

export const useLoyaltyPoints = create<LoyaltyPointsStore>((set) => ({
  balance: 0,
  history: [],
  loading: false,

  fetchPoints: async (token) => {
    if (!token) {
      set({ balance: 0, history: [] });
      return;
    }
    set({ loading: true });
    try {
      // Fetch from user_profiles table
      const profileRes = await fetch('/api/user_profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileRes.ok) {
        const profile = await profileRes.json();
        set({ balance: profile.loyalty_points || 0, loading: false });
      } else {
        set({ loading: false });
      }

      // Fetch history
      const historyRes = await fetch('/api/loyalty_points', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (historyRes.ok) {
        const history = await historyRes.json();
        set({ history });
      }
    } catch {
      set({ loading: false });
    }
  },

  addPoints: (points, reason, orderId) => {
    set((state) => ({
      balance: state.balance + points,
      history: [
        {
          id: Date.now().toString(),
          points,
          reason,
          order_id: orderId,
          created_at: new Date().toISOString()
        },
        ...state.history
      ]
    }));
  },

  clearPoints: () => {
    set({ balance: 0, history: [] });
  }
}));

// Helper function to calculate points for an order
export const calculateOrderPoints = (orderTotal: number): number => {
  // 1 point per $1 spent
  return Math.floor(orderTotal);
};
