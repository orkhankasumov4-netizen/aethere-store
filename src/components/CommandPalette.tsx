import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronRight, Moon, Sun, Palette, Home, ShoppingCart, Heart, Package, Settings, Zap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../stores/useUI';
import { useCurrency } from '../stores/useCurrency';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: 'navigation' | 'action' | 'product' | 'settings';
  shortcut?: string;
  action?: () => void;
  href?: string;
  data?: any;
  visible?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  products?: any[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, products = [] }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme, accentColor, setAccentColor } = useUI();
  const { currency, setCurrency } = useCurrency();

  // Load recent commands from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aether-recent-commands');
    if (saved) {
      setRecentCommands(JSON.parse(saved));
    }
  }, []);

  // Save recent commands
  const addToRecent = useCallback((id: string) => {
    setRecentCommands((prev) => {
      const updated = [id, ...prev.filter((c) => c !== id)].slice(0, 5);
      localStorage.setItem('aether-recent-commands', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Navigation commands
  const navCommands: Command[] = [
    { id: 'home', label: 'Home', icon: <Home size={18} />, category: 'navigation', href: '/' },
    { id: 'cart', label: 'Cart', icon: <ShoppingCart size={18} />, category: 'navigation', href: '/cart' },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} />, category: 'navigation', href: '/dashboard' },
    { id: 'orders', label: 'Orders', icon: <Package size={18} />, category: 'navigation', href: '/dashboard' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, category: 'navigation', href: '/dashboard' }
  ];

  // Action commands
  const actionCommands: Command[] = [
    { id: 'toggle-theme', label: `Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />, category: 'action', action: toggleTheme },
    { id: 'currency-usd', label: 'Currency: USD ($)', icon: <Zap size={18} />, category: 'settings', action: () => setCurrency('USD'), visible: currency !== 'USD' },
    { id: 'currency-eur', label: 'Currency: EUR (€)', icon: <Zap size={18} />, category: 'settings', action: () => setCurrency('EUR'), visible: currency !== 'EUR' },
    { id: 'currency-gbp', label: 'Currency: GBP (£)', icon: <Zap size={18} />, category: 'settings', action: () => setCurrency('GBP'), visible: currency !== 'GBP' },
    { id: 'currency-azn', label: 'Currency: AZN (₼)', icon: <Zap size={18} />, category: 'settings', action: () => setCurrency('AZN'), visible: currency !== 'AZN' },
    { id: 'accent-obsidian', label: 'Accent: Obsidian (Purple)', icon: <Palette size={18} />, category: 'settings', action: () => setAccentColor('obsidian'), visible: accentColor !== 'obsidian' },
    { id: 'accent-rose', label: 'Accent: Rose Gold (Red)', icon: <Palette size={18} />, category: 'settings', action: () => setAccentColor('rose-gold'), visible: accentColor !== 'rose-gold' },
    { id: 'accent-arctic', label: 'Accent: Arctic Blue (Blue)', icon: <Palette size={18} />, category: 'settings', action: () => setAccentColor('arctic-blue'), visible: accentColor !== 'arctic-blue' }
  ];

  // Product commands (from search)
  const productCommands: Command[] = products.slice(0, 5).map((product) => ({
    id: `product-${product.id}`,
    label: product.name,
    icon: <img src={product.image} alt="" className="w-5 h-5 object-cover rounded" />,
    category: 'product',
    href: `/product/${product.id}`,
    data: product
  }));

  // Filter commands based on query
  const filterCommands = (commands: Command[]) => {
    if (!query) return commands.filter((c) => c.visible !== false);
    const q = query.toLowerCase();
    return commands.filter((c) => {
      if (c.visible === false) return false;
      return c.label.toLowerCase().includes(q) || 
             c.id.toLowerCase().includes(q) ||
             (c.category === 'product' && fuzzyMatch(q, c.label));
    });
  };

  // Fuzzy search matching
  const fuzzyMatch = (query: string, text: string): boolean => {
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) qi++;
    }
    return qi === q.length;
  };

  // Combine all commands
  let allCommands = [
    ...filterCommands(navCommands),
    ...filterCommands(actionCommands),
    ...productCommands
  ];

  // Show recent commands if no query
  if (!query && recentCommands.length > 0) {
    const recent = navCommands.filter((c) => recentCommands.includes(c.id));
    if (recent.length > 0) {
      allCommands = [{ id: 'recent-header', label: 'Recent', icon: <Clock size={18} />, category: 'navigation' } as Command, ...recent, ...allCommands];
    }
  }

  // Remove duplicates and header from filtered results
  const seen = new Set();
  allCommands = allCommands.filter((c) => {
    if (c.id === 'recent-header') return true;
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  // Handle command selection
  const selectCommand = (command: Command) => {
    if (command.id === 'recent-header') return;
    
    addToRecent(command.id);
    
    if (command.action) {
      command.action();
      onClose();
    } else if (command.href) {
      navigate(command.href);
      onClose();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allCommands[selectedIndex]) {
        selectCommand(allCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101]"
          >
            <div className="bg-[#141414] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-800">
                <Search className="text-gray-500 flex-shrink-0" size={22} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, navigate, change settings..."
                  className="flex-1 bg-transparent text-white text-lg placeholder-gray-600 outline-none"
                />
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Commands List */}
              <div ref={listRef} className="max-h-[500px] overflow-y-auto py-3">
                {allCommands.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Search size={32} className="mx-auto mb-3 opacity-50" />
                    <div>No results found</div>
                  </div>
                ) : (
                  allCommands.map((command, index) => (
                    <button
                      key={`${command.id}-${index}`}
                      onClick={() => selectCommand(command)}
                      className={`w-full px-6 py-3 flex items-center gap-4 transition-colors ${
                        index === selectedIndex
                          ? 'bg-[#7C3AED]/20 text-white'
                          : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                      } ${command.id === 'recent-header' ? 'px-6 py-2 text-xs text-gray-600 uppercase tracking-wider' : ''}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className={`flex-shrink-0 ${command.id === 'recent-header' ? 'hidden' : ''}`}>
                        {command.icon}
                      </span>
                      <span className="flex-1 text-left truncate">{command.label}</span>
                      {command.category === 'navigation' && command.id !== 'recent-header' && (
                        <ChevronRight size={16} className="text-gray-600" />
                      )}
                      {command.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-gray-800 rounded text-gray-500">
                          {command.shortcut}
                        </kbd>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-4">
                  <span><kbd className="px-2 py-0.5 bg-gray-800 rounded">↑↓</kbd> Navigate</span>
                  <span><kbd className="px-2 py-0.5 bg-gray-800 rounded">↵</kbd> Select</span>
                  <span><kbd className="px-2 py-0.5 bg-gray-800 rounded">ESC</kbd> Close</span>
                </div>
                <div className="flex items-center gap-2">
                  <Search size={12} />
                  <span>Fuzzy search enabled</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
