import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Instagram } from 'lucide-react';

const INSTAGRAM_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop'
];

const LIKE_COUNTS = ['2.4k', '1.8k', '3.1k', '2.7k', '4.2k', '1.9k'];

export const InstagramFeed: React.FC = () => {
  return (
    <div className="bg-[#0A0A0A] py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Instagram size={24} className="text-[#7C3AED]" />
            <div className="text-xs text-[#7C3AED] tracking-[3px]">@AETHER</div>
          </div>
          <div className="text-3xl font-medium">Follow Our Journey</div>
          <div className="text-gray-500 mt-2">Join our community of style enthusiasts</div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {INSTAGRAM_IMAGES.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative aspect-square group overflow-hidden rounded-2xl cursor-pointer"
            >
              <img
                src={src}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                <div className="flex items-center gap-2 text-white">
                  <Heart size={18} className="fill-rose-500 text-rose-500" />
                  <span className="text-sm font-medium">{LIKE_COUNTS[index]} likes</span>
                </div>
              </div>

              {/* Instagram icon watermark */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
                  <Instagram size={16} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <motion.a
            href="https://instagram.com/aether"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-purple-500 text-white rounded-2xl font-medium hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all"
          >
            <Instagram size={20} />
            Follow @AETHER
          </motion.a>
        </div>
      </div>
    </div>
  );
};
