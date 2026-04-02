import { create } from 'zustand';
import supabase from '../lib/supabase';
import { signInWithGoogle as googleSignIn } from '../lib/googleAuth';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<{ error: any | null }>;
  refreshSession: () => Promise<void>;
  init: () => void;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false, // Prevents calling init multiple times

  init: () => {
    if (get().initialized) return;

    set({ loading: true, initialized: true });

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ 
        session, 
        user: session?.user || null, 
        loading: false 
      });
    });

    // Subscribing to session changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ 
        session, 
        user: session?.user || null, 
        loading: false 
      });
    });
  },

  signIn: async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error: any) {
      return { error };
    }
  },

  signUp: async (email, password, fullName) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          data: { full_name: fullName || email.split('@')[0] } 
        }
      });
      return { error };
    } catch (error: any) {
      return { error };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  getToken: async () => {
    // A fresh getSession to ensure the token hasn't expired on the client side
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  },
  
  signInWithGoogle: async () => {
    try {
      await googleSignIn();
      return { error: null };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { error };
    }
  },

  refreshSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user || null });
  }
}));
