import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Mail, Sparkles, Smartphone } from 'lucide-react';

interface ARTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export const ARTryOnModal: React.FC<ARTryOnModalProps> = ({ isOpen, onClose, productName }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101]"
          >
            <div className="bg-[#141414] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative h-48 bg-gradient-to-br from-[#7C3AED]/30 to-purple-900/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Phone Mockup */}
                  <div className="relative">
                    <div className="w-32 h-56 bg-black rounded-3xl border-4 border-gray-700 shadow-2xl overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-b-xl z-10" />
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <Camera size={40} className="text-white/50" />
                      </div>
                    </div>
                    {/* Floating elements */}
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-4 -right-4 w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center shadow-lg"
                    >
                      <Sparkles size={20} className="text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                      className="absolute -bottom-2 -left-2 w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <Smartphone size={18} className="text-white" />
                    </motion.div>
                  </div>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
              </div>

              {/* Content */}
              <div className="p-8 -mt-8 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors"
                >
                  <X size={18} />
                </button>

                {!submitted ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-2xl font-medium text-white mb-2">Try in AR</div>
                      <div className="text-sm text-gray-400">
                        Experience {productName} in your space
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#7C3AED]/20 to-purple-500/20 rounded-2xl p-4 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Sparkles size={18} className="text-[#7C3AED]" />
                        <span>Coming Soon — Get notified when AR is ready!</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-black border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:border-[#7C3AED] focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-purple-500 text-white rounded-2xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Camera size={18} />
                            Notify Me
                          </>
                        )}
                      </button>
                    </form>

                    <div className="text-center mt-4 text-xs text-gray-500">
                      Be the first to experience AR shopping
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Mail size={36} className="text-emerald-400" />
                    </motion.div>
                    <div className="text-xl font-medium text-white mb-2">You're on the list!</div>
                    <div className="text-sm text-gray-400">
                      We'll notify you at <span className="text-white">{email}</span> when AR is ready.
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-6 px-8 py-3 bg-white text-black rounded-2xl font-medium"
                    >
                      Got it
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
