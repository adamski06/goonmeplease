import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { signInWithLinkedIn } from '@/lib/linkedinAuth';
import { signInWithTikTok } from '@/lib/tiktokAuth';
import { signInWithFacebook } from '@/lib/facebookAuth';

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
          className="w-full py-3.5 sm:py-4 md:py-5 h-auto rounded-full text-base sm:text-lg md:text-xl font-bold text-white border border-white/20 shadow-lg hover:opacity-90"
          style={{
            background: 'linear-gradient(180deg, rgba(60, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
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

      {/* TikTok Sign In */}
      <button
        type="button"
        onClick={() => {
          try {
            signInWithTikTok();
          } catch (e) {
            toast({ title: 'Sign in failed', description: String(e), variant: 'destructive' });
          }
        }}
        className="w-full py-3.5 rounded-full text-base font-bold text-white flex items-center justify-center gap-2.5 transition-all hover:opacity-90"
        style={{
          background: 'linear-gradient(180deg, rgba(20,20,20,0.96) 0%, rgba(0,0,0,1) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path fill="#25F4EE" d="M19.6 6.3c-1.5-.4-2.7-1.4-3.4-2.7-.2-.4-.4-.8-.5-1.3h-3.2v13.3c0 1.5-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7 1.2-2.7 2.7-2.7c.3 0 .6 0 .9.1V9.6c-.3 0-.6-.1-.9-.1-3.2 0-5.9 2.6-5.9 5.9 0 3.2 2.6 5.9 5.9 5.9 3.2 0 5.9-2.6 5.9-5.9V9.1c1.3.9 2.8 1.4 4.4 1.4V7.3c-.2 0-.4 0-.5-.1z"/>
          <path fill="#FE2C55" d="M20.1 7.2V10c-1.6 0-3.1-.5-4.4-1.4v6.4c0 3.2-2.6 5.9-5.9 5.9-1.2 0-2.4-.4-3.4-1 1.1.9 2.5 1.4 4 1.4 3.2 0 5.9-2.6 5.9-5.9V9c1.3.9 2.8 1.4 4.4 1.4V7.2h-.6z"/>
          <path fill="#fff" d="M15.7 8.6V15c0 3.2-2.6 5.9-5.9 5.9-1.5 0-2.9-.5-4-1.4-1.1-1.1-1.8-2.6-1.8-4.3 0-3.2 2.6-5.9 5.9-5.9.3 0 .6 0 .9.1v3.4c-.3-.1-.6-.1-.9-.1-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V2.3h3.2c.1.5.3.9.5 1.3.7 1.3 1.9 2.3 3.4 2.7v1.9c-1.3-.2-2.7-.7-4-1.6z"/>
        </svg>
        Continue with TikTok
      </button>

      {/* LinkedIn Sign In */}
      <button
        type="button"
        onClick={async () => {
          try {
            await signInWithLinkedIn();
          } catch (e) {
            toast({ title: 'Sign in failed', description: String(e), variant: 'destructive' });
          }
        }}
        className="w-full py-3.5 rounded-full text-base font-bold text-white flex items-center justify-center gap-2.5 transition-all hover:opacity-90"
        style={{
          background: 'linear-gradient(180deg, rgba(10,102,194,0.95) 0%, rgba(0,82,165,1) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 20px rgba(10,102,194,0.35)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
        </svg>
        Continue with LinkedIn
      </button>

      {/* Facebook Sign In */}
      <button
        type="button"
        onClick={async () => {
          try {
            await signInWithFacebook();
          } catch (e) {
            toast({ title: 'Sign in failed', description: String(e), variant: 'destructive' });
          }
        }}
        className="w-full py-3.5 rounded-full text-base font-bold text-white flex items-center justify-center gap-2.5 transition-all hover:opacity-90"
        style={{
          background: 'linear-gradient(180deg, rgba(24,119,242,0.96) 0%, rgba(13,90,196,1) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 20px rgba(24,119,242,0.35)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.017 1.792-4.683 4.533-4.683 1.312 0 2.686.235 2.686.235v2.967h-1.514c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
        Continue with Facebook
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
