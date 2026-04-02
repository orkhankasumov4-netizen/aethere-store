import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { debounce } from '../lib/fetchWithRetry';

interface SearchResult {
  id: number;
  name: string;
  price: number;
  image: string;
  brand: string;
  rating: number;
}

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['iPhone', 'Nike Air', 'Dyson', 'MacBook']);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounced fetch
  const debouncedFetch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
        const json = await res.json();
        const products = Array.isArray(json) ? json : (json.data || []);
        setResults(Array.isArray(products) ? products : []);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  const handleSelect = (product: SearchResult) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    navigate(`/product/${product.id}`);
    // Save to recent
    const newRecent = [product.name.split(' ')[0], ...recentSearches.slice(0, 3)];
    setRecentSearches([...new Set(newRecent)]);
  };

  const handleVoiceSearch = () => {
    if (!('SpeechRecognition' in (window as any)) && !('webkitSpeechRecognition' in (window as any))) {
      alert('Voice search not supported in this browser');
      return;
    }
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsOpen(true);
    };
    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <Search size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products, brands..."
          className="w-full bg-[#141414] border border-gray-800 focus:border-[#7C3AED] text-white pl-12 pr-20 py-3 rounded-2xl text-sm placeholder:text-gray-500 focus:outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button onClick={clearSearch} className="text-gray-500 hover:text-gray-300">
              <X size={16} />
            </button>
          )}
          <button
            onClick={handleVoiceSearch}
            className={`text-gray-500 hover:text-white transition-colors ${isListening ? 'text-[#7C3AED] animate-pulse' : ''}`}
          >
            <Mic size={18} />
          </button>
          <div className="text-[10px] text-gray-600 font-mono hidden md:block">⌘K</div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || query.length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {results.length > 0 ? (
              <div className="py-2 max-h-[420px] overflow-y-auto">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-900 transition-colors text-left"
                  >
                    <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.brand}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-white">${product.price}</div>
                      <div className="text-xs text-gray-500">★{product.rating}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length > 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No results for "{query}"</div>
            ) : (
              <div className="p-4">
                <div className="text-xs text-gray-500 px-2 mb-2">RECENT SEARCHES</div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(term); setIsOpen(true); }}
                      className="px-4 py-1.5 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full text-sm transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
