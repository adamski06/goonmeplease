import React from 'react';
import { CURRENCIES, POPULAR_CURRENCY_CODES } from '@/data/currencies';
import { useCurrency } from '@/contexts/CurrencyContext';

const CurrencySelector: React.FC<{ className?: string }> = ({ className }) => {
  const { currency, setCurrency } = useCurrency();

  const popular = POPULAR_CURRENCY_CODES
    .map(code => CURRENCIES.find(c => c.code === code)!)
    .filter(Boolean);
  const rest = CURRENCIES.filter(c => !POPULAR_CURRENCY_CODES.includes(c.code));

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className={`bg-transparent outline-none w-full text-sm font-semibold text-foreground cursor-pointer ${className || ''}`}
    >
      <optgroup label="Popular">
        {popular.map(c => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </optgroup>
      <optgroup label="All currencies">
        {rest.map(c => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </optgroup>
    </select>
  );
};

export default CurrencySelector;
