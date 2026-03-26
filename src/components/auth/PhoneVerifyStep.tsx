import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const blackGlassStyle = {
  background: 'linear-gradient(180deg, rgba(30,30,30,0.92) 0%, rgba(0,0,0,0.95) 100%)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
};

interface PhoneVerifyStepProps {
  userId: string;
  onNext: () => void;
  onSkip: () => void;
}

const PhoneVerifyStep: React.FC<PhoneVerifyStepProps> = ({ userId, onNext, onSkip }) => {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();

    if (!trimmed || trimmed.length < 6) {
      toast({ title: 'Invalid number', description: 'Please enter a valid phone number with country code (e.g. +46701234567)', variant: 'destructive' });
      return;
    }

    // Ensure it starts with +
    const formatted = trimmed.startsWith('+') ? trimmed : `+${trimmed}`;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('phone-verify', {
        body: { action: 'send', phone: formatted },
      });

      if (error) throw new Error(error.message || 'Failed to send code');
      if (data?.error) throw new Error(data.error);

      setPhone(formatted);
      setOtpSent(true);
      toast({ title: 'Code sent!', description: `Verification code sent to ${formatted}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send verification code', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({ title: 'Invalid code', description: 'Please enter the 6-digit code', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('phone-verify', {
        body: { action: 'verify', phone, code: otp },
      });

      if (error) throw new Error(error.message || 'Verification failed');
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Verified!', description: 'Your phone number has been verified.' });
      onNext();
    } catch (err: any) {
      toast({ title: 'Verification failed', description: err.message || 'Invalid or expired code', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResend = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('phone-verify', {
        body: { action: 'send', phone },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setOtp('');
      toast({ title: 'Code resent!', description: `New code sent to ${phone}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to resend code', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!otpSent) {
    return (
      <form onSubmit={handleSendCode} className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-black">Verify your number</h2>
          <p className="text-sm text-black/50">We'll send you a verification code via SMS</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-black text-sm font-medium">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+46 70 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 py-2 text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:border-black"
          />
          <p className="text-xs text-black/40">Include country code (e.g. +46 for Sweden)</p>
        </div>

        <Button
          type="submit"
          className="w-full py-3 h-auto rounded-full font-semibold text-white border border-white/20 shadow-lg hover:opacity-90"
          style={blackGlassStyle}
          disabled={isSaving || !phone.trim()}
        >
          {isSaving ? 'Sending...' : 'Send code'}
        </Button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-sm text-black/40 hover:text-black/60"
        >
          Skip for now
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-black">Enter verification code</h2>
        <p className="text-sm text-black/50">
          Code sent to <span className="font-medium text-black/70">{phone}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        type="submit"
        className="w-full py-3 h-auto rounded-full font-semibold text-white border border-white/20 shadow-lg hover:opacity-90"
        style={blackGlassStyle}
        disabled={isSaving || otp.length !== 6}
      >
        {isSaving ? 'Verifying...' : 'Verify'}
      </Button>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => { setOtpSent(false); setOtp(''); }}
          className="text-sm text-black/40 hover:text-black/60"
        >
          Change number
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isSaving}
          className="text-sm text-black/40 hover:text-black/60"
        >
          Resend code
        </button>
      </div>
    </form>
  );
};

export default PhoneVerifyStep;
