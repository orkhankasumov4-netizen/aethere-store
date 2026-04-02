import { createClient } from '@supabase/supabase-js';

// For Vite projects, environment variables are injected at build time
// Use globalThis.process for Vercel/server compatibility
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return globalThis[key] || '';
};

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || '',
  getEnv('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export default supabase;
