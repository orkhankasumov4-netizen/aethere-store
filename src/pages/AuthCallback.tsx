import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthCallback } from '../lib/googleAuth';
import { useUI } from '../stores/useUI';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useUI();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for error params from Supabase (can be in search or hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
        if (errorDescription) {
          throw new Error(errorDescription);
        }

        // Get the session
        const { session, user } = await handleOAuthCallback();

        if (user) {
          addToast(`Welcome back, ${user.email?.split('@')[0] || 'user'}!`, 'success');
          
          // Create or update profile
          try {
            const token = session?.access_token;
            if (token) {
              await fetch('/api/user?action=profile', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
                })
              });
            }
          } catch (err) {
            console.error('Profile creation error:', err);
          }

          // Redirect to dashboard, home or reset password
          const isRecovery = hashParams.get('type') === 'recovery';
          if (isRecovery) {
            navigate('/reset-password');
          } else {
            navigate('/dashboard');
          }
        } else {
          throw new Error('No session received');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        addToast('Sign-in failed. Please try again.', 'error');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    processCallback();
  }, [searchParams, navigate, addToast]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-4xl mb-4">❌</div>
            <div className="text-2xl text-white mb-2">Authentication Failed</div>
            <div className="text-gray-400">{error}</div>
            <div className="text-sm text-gray-500 mt-4">Redirecting...</div>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">🔄</div>
            <div className="text-2xl text-white mb-2">Completing Sign In...</div>
            <div className="text-gray-400">Please wait while we secure your session</div>
          </>
        )}
      </div>
    </div>
  );
};
