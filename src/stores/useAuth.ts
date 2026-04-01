import { create } from 'zustand';
import supabase from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  init: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,

  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ user: data.session?.user || null, session: data.session, loading: false });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, session, loading: false });
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ loading: false });
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    set({ loading: false });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  getToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }
}));
