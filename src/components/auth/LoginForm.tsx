import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { lovable } from '@/integrations/lovable/index';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchToSignUp: () => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onSwitchToSignUp, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: error.errors[0].message, variant: 'destructive' });
      }
      return;
    }
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-black">Welcome back</h2>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signin-email" className="text-black text-sm font-medium">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 py-2 text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:border-black"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signin-password" className="text-black text-sm font-medium">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 py-2 text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:border-black"
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full py-3 h-auto rounded-full font-semibold text-white border border-white/20 shadow-lg hover:opacity-90"
          style={{
            background: 'linear-gradient(180deg, rgba(60, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.95) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-black/10" />
        <span className="text-xs text-black/40">or</span>
        <div className="flex-1 h-px bg-black/10" />
      </div>

      {/* Apple Sign In */}
      <button
        type="button"
        onClick={async () => {
          const { error } = await lovable.auth.signInWithOAuth('apple', {
            redirect_uri: window.location.origin,
          });
          if (error) {
            toast({ title: 'Sign in failed', description: String(error), variant: 'destructive' });
          }
        }}
        className="w-full py-3 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
        style={{
          background: 'rgba(0,0,0,0.88)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        Continue with Apple
      </button>

      <p className="text-center text-black/50 text-sm pt-2">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToSignUp} className="text-black underline hover:text-black/70">
          Sign up
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
