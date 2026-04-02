import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useUI } from '../stores/useUI';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useUI();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/engagement?action=newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (data.already_subscribed) {
        addToast('You are already subscribed!', 'info');
      } else {
        setSubscribed(true);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#7C3AED', '#A855F7', '#ffffff'] });
        addToast('Welcome to the AETHER family!', 'success');
        setTimeout(() => {
          setEmail('');
          setSubscribed(false);
        }, 3000);
      }
    } catch {
      addToast('Failed to subscribe. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 border-t border-gray-800 bg-black">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="text-[#7C3AED] text-sm tracking-[3px] mb-3">STAY IN THE KNOW</div>
        <div className="text-5xl font-medium text-white tracking-tighter mb-6">Join the Inner Circle</div>
        <p className="text-xl text-gray-400 max-w-md mx-auto mb-10">Get first access to new releases, exclusive drops, and private events.</p>

        <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-[#141414] border border-gray-800 focus:border-[#7C3AED] rounded-2xl px-6 py-4 text-white placeholder:text-gray-500"
              required
            />
            <motion.button
              type="submit"
              disabled={loading || subscribed}
              whileHover={{ scale: 1.02 }}
              className="px-8 py-4 bg-white text-black rounded-2xl font-medium hover:bg-[#7C3AED] hover:text-white transition-all disabled:opacity-70"
            >
              {subscribed ? '✓ Joined' : loading ? '...' : 'Join'}
            </motion.button>
          </div>
          <div className="text-xs text-gray-500 mt-4">Join 50,000+ members. Unsubscribe anytime.</div>
        </form>
      </div>
    </div>
  );
};
