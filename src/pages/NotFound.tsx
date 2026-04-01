import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-16 text-center">
        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full max-w-md mx-auto"
            aria-label="404 Page not found illustration"
            role="img"
          >
            {/* Background */}
            <rect width="400" height="300" rx="20" fill="#141414" />
            
            {/* Ghost character */}
            <motion.g
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ellipse cx="200" cy="150" rx="60" ry="70" fill="#2E2E2E" />
              <ellipse cx="200" cy="150" rx="50" ry="60" fill="#3D3D3D" />
              {/* Eyes */}
              <circle cx="180" cy="140" r="8" fill="#7C3AED" />
              <circle cx="220" cy="140" r="8" fill="#7C3AED" />
              {/* Mouth */}
              <ellipse cx="200" cy="170" rx="15" ry="8" fill="#3D3D3D" />
              {/* Tail */}
              <path d="M170 220 Q160 240 150 220 L160 200 Z" fill="#2E2E2E" />
              <path d="M190 220 Q180 240 170 220 L180 200 Z" fill="#2E2E2E" />
              <path d="M210 220 Q200 240 190 220 L200 200 Z" fill="#2E2E2E" />
              <path d="M230 220 Q220 240 210 220 L220 200 Z" fill="#2E2E2E" />
            </motion.g>
            
            {/* 404 text */}
            <text x="200" y="80" textAnchor="middle" fill="#7C3AED" fontSize="48" fontWeight="bold">
              404
            </text>
            
            {/* Decorative elements */}
            <circle cx="80" cy="80" r="4" fill="#3D3D3D" />
            <circle cx="320" cy="100" r="3" fill="#3D3D3D" />
            <circle cx="350" cy="200" r="5" fill="#3D3D3D" />
            <circle cx="50" cy="220" r="3" fill="#3D3D3D" />
          </svg>
        </motion.div>

        {/* Content */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-medium mb-4"
        >
          Page Not Found
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-8 max-w-md mx-auto"
        >
          The page you're looking for seems to have wandered off into the digital void. 
          Let's get you back on track.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-medium hover:bg-[#7C3AED] hover:text-white transition-all"
          >
            <HomeIcon size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-800 rounded-2xl font-medium hover:bg-gray-900 transition-all"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <div className="text-sm text-gray-500 mb-4">Popular categories</div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Electronics', 'Fashion', 'Home & Living', 'Accessories'].map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat}`}
                className="px-4 py-2 bg-[#141414] border border-gray-800 rounded-xl text-sm hover:border-[#7C3AED] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};
