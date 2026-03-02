import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
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

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

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
    <div className="min-h-screen flex bg-[#1a1a1a]">
      {/* Left panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <img
            src={jarlaLogo}
            alt="Jarla"
            className="h-8 brightness-0 invert mb-10"
          />

          <h1
            className="text-[28px] font-bold text-white mb-8"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {isLogin ? 'Log in' : 'Create account'}
          </h1>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full h-11 rounded-lg border border-white/20 bg-transparent text-white text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-white/5 transition-colors mb-4"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/40 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {step === 'initial' ? (
            <form onSubmit={handleEmailContinue} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80">Email</label>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-transparent border-white/20 text-white placeholder:text-white/30 focus-visible:ring-white/30 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
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
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <span className="text-sm text-white/60">{email}</span>
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Full name</label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 bg-transparent border-white/20 text-white placeholder:text-white/30 focus-visible:ring-white/30 rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-transparent border-white/20 text-white placeholder:text-white/30 focus-visible:ring-white/30 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isLoading
                  ? (isLogin ? 'Signing in...' : 'Creating account...')
                  : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </form>
          )}

          <p className="text-center text-white/40 text-sm mt-8">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setStep('initial'); }}
              className="text-white underline underline-offset-2 hover:text-white/80"
            >
              {isLogin ? 'Create your account' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right gradient panel — desktop only */}
      <div
        className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a1a1a 0%, #1a3a5c 30%, #2a5a8a 50%, #c44a7a 75%, #e86040 100%)',
        }}
      />
    </div>
  );
};

export default BusinessAuth;
