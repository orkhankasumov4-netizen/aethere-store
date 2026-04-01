import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const handleGoogleSignIn = async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        signInWithGoogle('AETHER');
        // Listen for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            resolve();
            subscription.unsubscribe();
          }
        });
        // Timeout after 2 minutes
        setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error('Google sign-in timed out'));
        }, 120000);
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getToken, signInWithGoogle: handleGoogleSignIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
