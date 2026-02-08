import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type Method = 'email' | 'phone';

interface CredentialsStepProps {
  onNext: (data: { method: Method; email?: string; phone?: string; password: string; fullName: string }) => void;
  onSwitchToLogin: () => void;
  isLoading: boolean;
}

const CredentialsStep: React.FC<CredentialsStepProps> = ({ onNext, onSwitchToLogin, isLoading }) => {
  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'email') {
      try {
        emailSchema.parse(email);
        passwordSchema.parse(password);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({ title: 'Validation Error', description: error.errors[0].message, variant: 'destructive' });
        }
        return;
      }
      onNext({ method: 'email', email, password, fullName });
    } else {
      if (!phone.trim()) {
        toast({ title: 'Validation Error', description: 'Please enter your phone number', variant: 'destructive' });
        return;
      }
      try {
        passwordSchema.parse(password);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({ title: 'Validation Error', description: error.errors[0].message, variant: 'destructive' });
        }
        return;
      }
      onNext({ method: 'phone', phone, password, fullName });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
      </div>

      {/* Method toggle */}
      <div className="flex rounded-full bg-black/5 p-1">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
            method === 'email' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
            method === 'phone' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Phone
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-name" className="text-foreground text-sm font-medium">Full Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          className="bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground"
        />
      </div>

      {method === 'email' ? (
        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-foreground text-sm font-medium">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="signup-phone" className="text-foreground text-sm font-medium">Phone Number</Label>
          <Input
            id="signup-phone"
            type="tel"
            placeholder="+46 70 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            className="bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="signup-password" className="text-foreground text-sm font-medium">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 py-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full py-3 h-auto rounded-full bg-foreground text-background hover:bg-foreground/80 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Continue'}
        </Button>
      </div>

      <p className="text-center text-muted-foreground text-sm pt-1">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-foreground underline hover:text-foreground/70">
          Log in
        </button>
      </p>
    </form>
  );
};

export default CredentialsStep;
