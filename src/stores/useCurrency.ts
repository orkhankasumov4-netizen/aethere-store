import { create } from 'zustand';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AZN';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  AZN: { code: 'AZN', symbol: '₼', locale: 'az-AZ' }
};

// Fixed conversion rates (1 USD = ...)
export const CONVERSION_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AZN: 1.70
};

interface CurrencyStore {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number, targetCurrency?: Currency) => number;
  format: (amount: number, currency?: Currency) => string;
  getSymbol: () => string;
  getLocale: () => string;
}

export const useCurrency = create<CurrencyStore>((set, get) => ({
  currency: (typeof localStorage !== 'undefined' && 
    localStorage.getItem('currency') as Currency) || 'USD',

  setCurrency: (currency) => {
    set({ currency });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currency', currency);
    }
  },

  convert: (amount, targetCurrency) => {
    const { currency } = get();
    const toCurrency = targetCurrency || currency;
    // Convert from USD to target currency
    return amount * CONVERSION_RATES[toCurrency];
  },

  format: (amount, currency) => {
    const { currency: storeCurrency } = get();
    const targetCurrency = currency || storeCurrency;
    const info = CURRENCIES[targetCurrency];
    const convertedAmount = get().convert(amount, targetCurrency);
    
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  },

  getSymbol: () => {
    const { currency } = get();
    return CURRENCIES[currency].symbol;
  },

  getLocale: () => {
    const { currency } = get();
    return CURRENCIES[currency].locale;
  }
}));

// Helper hook for components
export const useFormattedPrice = (amount: number, currency?: Currency) => {
  const { format } = useCurrency();
  return format(amount, currency);
};
