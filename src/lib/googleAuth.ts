import supabase from './supabase';

/**
 * Sign in with Google using Supabase's built-in OAuth
 * This is the production-ready approach
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }

  // Supabase redirects the browser automatically
  return { url: data.url };
}

/**
 * Handle OAuth callback - call this on the callback page
 */
export async function handleOAuthCallback() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }

  return { session, user: session?.user };
}
