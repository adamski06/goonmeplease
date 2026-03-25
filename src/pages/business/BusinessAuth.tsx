import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { z } from 'zod';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const BusinessAuth: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'password'>('initial');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();


  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: error.errors[0].message, variant: 'destructive' });
      }
      return;
    }
    setStep('password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: error.errors[0].message, variant: 'destructive' });
      }
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/business');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/business`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        if (data.user && data.session) {
          await supabase.rpc('register_as_business', { p_company_name: fullName || 'My Company' });
          toast({ title: 'Account created', description: 'Welcome to Jarla Business!' });
          navigate('/business');
        } else if (data.user && !data.session) {
          toast({ title: 'Account created', description: 'Please check your email to verify your account.' });
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <img
            src={jarlaLogo}
            alt="Jarla"
            className="h-8 mb-10 dark:brightness-100 brightness-0"
          />

          <h1
            className="text-[28px] font-bold text-foreground mb-8"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {isLogin ? 'Log in' : 'Create account'}
          </h1>


          {step === 'initial' ? (
            <form onSubmit={handleEmailContinue} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-transparent border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-colors"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep('initial')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <span className="text-sm text-muted-foreground">{email}</span>
              </div>


              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-transparent border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-lg"
                />
              </div>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => toast({ title: 'Reset password', description: 'Please contact support to reset your password.' })}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  Forgot your password?
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isLoading
                  ? (isLogin ? 'Signing in...' : 'Creating account...')
                  : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </form>
          )}

          <p className="text-center text-muted-foreground text-sm mt-8">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setStep('initial'); }}
              className="text-foreground underline underline-offset-2 hover:opacity-70"
            >
              {isLogin ? 'Create your account' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right decorative panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-4">
        <div
          className="w-full h-full rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, hsl(var(--muted)) 0%, hsl(var(--foreground) / 0.12) 50%, hsl(var(--foreground) / 0.25) 100%)',
            border: '1px solid hsl(var(--border))',
          }}
        />
      </div>
    </div>
  );
};

export default BusinessAuth;
