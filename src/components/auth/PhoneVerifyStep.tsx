import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const blueGlassStyle = {
  background: 'linear-gradient(180deg, rgba(60, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.95) 100%)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
};

interface PhoneVerifyStepProps {
  userId: string;
  onNext: () => void;
  onSkip: () => void;
}

const PhoneVerifyStep: React.FC<PhoneVerifyStepProps> = ({ userId, onNext, onSkip }) => {
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();

    if (!trimmed || trimmed.length < 6) {
      toast({ title: 'Invalid number', description: 'Please enter a valid phone number', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: trimmed })
        .eq('user_id', userId);

      if (error) throw error;
      onNext();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-black">Verify your number</h2>
        <p className="text-sm text-black/50">Add your phone number so brands can reach you</p>
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
      </div>

      <Button
        type="submit"
        className="w-full py-3 h-auto rounded-full font-semibold text-white border border-white/20 shadow-lg hover:opacity-90"
        style={blueGlassStyle}
        disabled={isSaving || !phone.trim()}
      >
        {isSaving ? 'Saving...' : 'Continue'}
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
};

export default PhoneVerifyStep;
