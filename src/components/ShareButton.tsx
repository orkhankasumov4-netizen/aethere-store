import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Link as LinkIcon, Twitter, Facebook, Check } from 'lucide-react';
import { useUI } from '../stores/useUI';

interface ShareButtonProps {
  url?: string;
  title?: string;
  image?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ url, title, image: _image }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useUI();

  const shareUrl = url || window.location.href;
  const shareTitle = title || 'Check this out!';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex-1 py-3 border border-gray-800 rounded-2xl text-sm hover:bg-gray-900 flex items-center justify-center gap-2 transition-colors"
      >
        <Share2 size={16} /> Share
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-3 w-64 bg-[#141414] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden z-50"
          >
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-3 px-2">Share this product</div>
              <div className="space-y-1">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-3 flex items-center justify-between rounded-xl hover:bg-gray-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-[#7C3AED] transition-colors">
                      {copied ? <Check size={16} className="text-emerald-400" /> : <LinkIcon size={16} />}
                    </div>
                    <span className="text-sm">Copy Link</span>
                  </div>
                  {copied && <span className="text-xs text-emerald-400">Copied!</span>}
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-3 flex items-center gap-3 rounded-xl hover:bg-gray-900 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-[#1DA1F2] transition-colors">
                    <Twitter size={16} />
                  </div>
                  <span className="text-sm">Twitter</span>
                </button>

                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full px-4 py-3 flex items-center gap-3 rounded-xl hover:bg-gray-900 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-[#1877F2] transition-colors">
                    <Facebook size={16} />
                  </div>
                  <span className="text-sm">Facebook</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
