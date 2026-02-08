import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';

interface WithdrawContentProps {
  balance: number;
  onBack: () => void;
}

const WithdrawContent: React.FC<WithdrawContentProps> = ({ balance, onBack }) => {
  const [step, setStep] = useState<'amount' | 'method'>('amount');
  const [amount, setAmount] = useState('');
  const [sliding, setSliding] = useState(false);
  const [slidingBack, setSlidingBack] = useState(false);

  const formattedBalance = balance.toLocaleString('sv-SE');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  const numericAmount = parseInt(amount || '0', 10);
  const isValidAmount = numericAmount > 0 && numericAmount <= balance;

  const goToMethod = () => {
    if (!isValidAmount) return;
    setSliding(true);
    setTimeout(() => {
      setStep('method');
      setSliding(false);
    }, 300);
  };

  const goBackToAmount = () => {
    setSlidingBack(true);
    setTimeout(() => {
      setStep('amount');
      setSlidingBack(false);
    }, 300);
  };

  const handleWithdraw = (method: 'swish' | 'paypal') => {
    // Placeholder - would trigger actual withdrawal
    console.log(`Withdrawing ${amount} sek via ${method}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Amount step */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          transform: step === 'amount'
            ? (sliding ? 'translateX(-100%)' : 'translateX(0)')
            : (slidingBack ? 'translateX(0)' : 'translateX(-100%)'),
          opacity: step === 'amount'
            ? (sliding ? 0 : 1)
            : (slidingBack ? 1 : 0),
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
          pointerEvents: step === 'amount' && !sliding ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center px-6 pt-6 pb-4">
          <button onClick={onBack} className="p-1 -ml-1">
            <ChevronLeft className="h-5 w-5 text-white/60" />
          </button>
          <h2 className="text-base font-bold text-white font-montserrat flex-1 text-center pr-6">Withdraw</h2>
        </div>

        {/* Amount input area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-sm text-white/50 font-jakarta mb-3">Enter amount</p>
          <div className="flex items-baseline gap-2">
            <Input
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              inputMode="numeric"
              className="text-5xl font-bold text-white font-montserrat tracking-tight bg-transparent border-none text-center w-48 placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-none h-auto py-0"
              style={{ caretColor: 'white' }}
            />
            <span className="text-2xl text-white/40 font-montserrat">sek</span>
          </div>
          <p className="text-xs text-white/40 font-jakarta mt-4">
            Available: {formattedBalance} sek
          </p>
          {amount && !isValidAmount && numericAmount > balance && (
            <p className="text-xs text-red-300 font-jakarta mt-2">
              Amount exceeds your balance
            </p>
          )}
        </div>

        {/* Withdraw button */}
        <div className="px-6 py-5 flex-shrink-0">
          <button
            onClick={goToMethod}
            disabled={!isValidAmount}
            className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97]"
            style={{
              background: isValidAmount
                ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.9) 100%)'
                : 'rgba(255,255,255,0.1)',
              color: isValidAmount ? '#065f46' : 'rgba(255,255,255,0.3)',
              boxShadow: isValidAmount
                ? '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1)'
                : 'none',
            }}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Method step */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          transform: step === 'method'
            ? (slidingBack ? 'translateX(100%)' : 'translateX(0)')
            : (sliding ? 'translateX(0)' : 'translateX(100%)'),
          opacity: step === 'method'
            ? (slidingBack ? 0 : 1)
            : (sliding ? 1 : 0),
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
          pointerEvents: step === 'method' && !slidingBack ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center px-6 pt-6 pb-4">
          <button onClick={goBackToAmount} className="p-1 -ml-1">
            <ChevronLeft className="h-5 w-5 text-white/60" />
          </button>
          <h2 className="text-base font-bold text-white font-montserrat flex-1 text-center pr-6">Choose method</h2>
        </div>

        {/* Amount summary */}
        <div className="flex flex-col items-center px-6 pt-4 pb-6">
          <p className="text-sm text-white/50 font-jakarta mb-1">Withdrawing</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white font-montserrat tracking-tight">
              {parseInt(amount || '0', 10).toLocaleString('sv-SE')}
            </span>
            <span className="text-xl text-white/40 font-montserrat">sek</span>
          </div>
        </div>

        {/* Method options */}
        <div className="flex-1 px-6 space-y-3">
          <button
            onClick={() => handleWithdraw('swish')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #5BBF2C 0%, #3A9B1A 100%)' }}
            >
              <span className="text-white font-bold text-lg font-montserrat">S</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base font-bold text-white font-montserrat">Swish</span>
              <span className="text-xs text-white/50 font-jakarta">Instant transfer</span>
            </div>
          </button>

          <button
            onClick={() => handleWithdraw('paypal')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #003087 0%, #001F5C 100%)' }}
            >
              <span className="text-white font-bold text-lg font-montserrat">P</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base font-bold text-white font-montserrat">PayPal</span>
              <span className="text-xs text-white/50 font-jakarta">1-2 business days</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawContent;
