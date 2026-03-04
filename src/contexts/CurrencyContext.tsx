import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type CurrencyCode = 'SEK' | 'USD';

interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  rate: number; // multiplier from USD to user currency
  /** Format a number that is stored in USD into the user's currency */
  formatPrice: (amountUsd: number, opts?: { decimals?: number; showSymbol?: boolean }) => string;
  /** Just the converted number (no formatting) */
  convert: (amountUsd: number) => number;
  /** Currency label like "sek" or "usd" for inline display */
  label: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function detectCurrency(): CurrencyCode {
  try {
    const lang = navigator.language || navigator.languages?.[0] || '';
    // Swedish locale → SEK
    if (lang.toLowerCase().startsWith('sv') || lang.toLowerCase().includes('-se')) {
      return 'SEK';
    }
    // Check timezone as fallback
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Stockholm') || tz.includes('Europe/Stockholm')) {
      return 'SEK';
    }
  } catch {}
  return 'USD';
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency] = useState<CurrencyCode>(detectCurrency);
  const [usdToSek, setUsdToSek] = useState(10.5); // sensible fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-exchange-rate');
        if (!error && data?.usdToSek) {
          setUsdToSek(data.usdToSek);
        }
      } catch (e) {
        console.error('Failed to fetch exchange rate:', e);
      }
      setLoading(false);
    };
    fetchRate();
  }, []);

  const rate = currency === 'SEK' ? usdToSek : 1;
  const symbol = currency === 'SEK' ? 'kr' : '$';
  const label = currency === 'SEK' ? 'sek' : 'usd';

  const convert = useCallback(
    (amountUsd: number) => Math.round(amountUsd * rate * 100) / 100,
    [rate]
  );

  const formatPrice = useCallback(
    (amountUsd: number, opts?: { decimals?: number; showSymbol?: boolean }) => {
      const converted = convert(amountUsd);
      const decimals = opts?.decimals ?? (converted % 1 === 0 ? 0 : 2);
      const formatted = converted.toLocaleString(currency === 'SEK' ? 'sv-SE' : 'en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      if (opts?.showSymbol === false) return formatted;
      return currency === 'SEK' ? `${formatted} kr` : `$${formatted}`;
    },
    [convert, currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, symbol, rate, formatPrice, convert, label, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
