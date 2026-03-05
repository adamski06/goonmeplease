import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrencyInfo, formatCurrencyValue, type CurrencyInfo } from '@/data/currencies';

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  currencyInfo: CurrencyInfo;
  symbol: string;
  rate: number;
  formatPrice: (amountUsd: number, opts?: { decimals?: number; showSymbol?: boolean }) => string;
  convert: (amountUsd: number) => number;
  fmtVal: (val: number | null) => string;
  label: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function detectCurrency(): string {
  try {
    const lang = navigator.language || navigator.languages?.[0] || '';
    if (lang.toLowerCase().startsWith('sv') || lang.toLowerCase().includes('-se')) return 'SEK';
    if (lang.toLowerCase().startsWith('nb') || lang.toLowerCase().startsWith('nn') || lang.toLowerCase().includes('-no')) return 'NOK';
    if (lang.toLowerCase().startsWith('da') || lang.toLowerCase().includes('-dk')) return 'DKK';
    if (lang.toLowerCase().startsWith('de') || lang.toLowerCase().includes('-de') || lang.toLowerCase().includes('-at')) return 'EUR';
    if (lang.toLowerCase().startsWith('fr') || lang.toLowerCase().includes('-fr')) return 'EUR';
    if (lang.toLowerCase().startsWith('ja') || lang.toLowerCase().includes('-jp')) return 'JPY';
    if (lang.toLowerCase().startsWith('zh') || lang.toLowerCase().includes('-cn')) return 'CNY';
    if (lang.toLowerCase().startsWith('ko') || lang.toLowerCase().includes('-kr')) return 'KRW';
    if (lang.toLowerCase().includes('-gb') || lang.toLowerCase().includes('-uk')) return 'GBP';
    if (lang.toLowerCase().includes('-au')) return 'AUD';
    if (lang.toLowerCase().includes('-ca')) return 'CAD';
    if (lang.toLowerCase().includes('-in')) return 'INR';
    if (lang.toLowerCase().includes('-br') || lang.toLowerCase().startsWith('pt-br')) return 'BRL';
    if (lang.toLowerCase().includes('-mx')) return 'MXN';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Stockholm')) return 'SEK';
    if (tz.includes('London')) return 'GBP';
    if (tz.includes('Tokyo')) return 'JPY';
    if (tz.includes('Berlin') || tz.includes('Paris') || tz.includes('Amsterdam')) return 'EUR';
  } catch {}
  return 'USD';
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<string>(detectCurrency);
  const [loading, setLoading] = useState(true);
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-exchange-rate');
        if (!error && data?.usdToSek) {
          // Store the live SEK rate; other currencies use approxRate from data
          setLiveRates(prev => ({ ...prev, SEK: data.usdToSek }));
        }
      } catch (e) {
        console.error('Failed to fetch exchange rate:', e);
      }
      setLoading(false);
    };
    fetchRate();
  }, []);

  const info = getCurrencyInfo(currency);
  const rate = liveRates[currency] ?? info.approxRate;
  const symbol = info.symbol;
  const label = currency.toLowerCase();

  const convert = useCallback(
    (amountUsd: number) => Math.floor(amountUsd * rate * 100) / 100,
    [rate]
  );

  const formatPrice = useCallback(
    (amountUsd: number, opts?: { decimals?: number; showSymbol?: boolean }) => {
      const converted = convert(amountUsd);
      const decimals = opts?.decimals ?? (converted % 1 === 0 ? 0 : 2);
      const displayVal = decimals === 0 ? Math.floor(converted) : converted;
      const formatted = displayVal.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      if (opts?.showSymbol === false) return formatted;
      return info.symbolBefore ? `${info.symbol}${formatted}` : `${formatted} ${info.symbol}`;
    },
    [convert, info]
  );

  const fmtVal = useCallback(
    (val: number | null) => formatCurrencyValue(val, currency),
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencyInfo: info, symbol, rate, formatPrice, convert, fmtVal, label, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
