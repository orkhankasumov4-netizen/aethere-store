import { create } from 'zustand';

interface UIStore {
  theme: 'dark' | 'light';
  accentColor: 'obsidian' | 'rose-gold' | 'arctic-blue';
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info'; action?: () => void }>;
  isSearchOpen: boolean;
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isCommandPaletteOpen: boolean;
  toggleTheme: () => void;
  setAccentColor: (color: 'obsidian' | 'rose-gold' | 'arctic-blue') => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', action?: () => void) => void;
  removeToast: (id: string) => void;
  setSearchOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

const getAccentColors = (accent: string) => {
  const colors = {
    'obsidian': { accent: '#7C3AED', accentHover: '#A855F7' },
    'rose-gold': { accent: '#E11D48', accentHover: '#F43F5E' },
    'arctic-blue': { accent: '#0EA5E9', accentHover: '#38BDF8' }
  };
  return colors[accent as keyof typeof colors] || colors.obsidian;
};

export const useUI = create<UIStore>((set, get) => ({
  theme: 'dark',
  accentColor: 'obsidian',
  toasts: [],
  isSearchOpen: false,
  isCartOpen: false,
  isMobileMenuOpen: false,
  isCommandPaletteOpen: false,

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  },

  setAccentColor: (color) => {
    set({ accentColor: color });
    localStorage.setItem('accentColor', color);
    const colors = getAccentColors(color);
    document.documentElement.style.setProperty('--aether-accent', colors.accent);
    document.documentElement.style.setProperty('--aether-accent-hover', colors.accentHover);
  },

  addToast: (message, type = 'success', action) => {
    const id = Date.now().toString();
    set({ toasts: [...get().toasts, { id, message, type, action }] });
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },

  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setCartOpen: (open) => set({ isCartOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open })
}));
