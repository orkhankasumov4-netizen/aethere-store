import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import supabase from '../lib/supabase';
import { useUI } from '../stores/useUI';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useUI();
  const navigate = useNavigate();

  // Redirect if they somehow land here without a session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        addToast('Invalid or expired reset link. Please try again.', 'error');
        navigate('/dashboard');
      }
    });
  }, [navigate, addToast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      addToast('Password updated successfully!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#141414] rounded-3xl p-8 border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium mb-2">Set New Password</h1>
            <p className="text-gray-400">Enter your new password below to regain access to your account.</p>
          </div>
          
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 focus:border-[#7C3AED] focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 focus:border-[#7C3AED] focus:outline-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-2xl font-medium disabled:opacity-50 hover:bg-[#7C3AED] hover:text-white transition-colors"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};
