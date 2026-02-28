import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const BusinessAuth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          // Assign business role
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
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img src={jarlaLogo} alt="Jarla" className="h-10 mx-auto mb-8 brightness-0 invert" />
          <h1 className="text-3xl font-bold text-primary-foreground font-montserrat mb-4">
            Jarla Business
          </h1>
          <p className="text-primary-foreground/60 font-jakarta text-lg">
            Create campaigns. Reach creators. Grow your brand.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-10">
            <img src={jarlaLogo} alt="Jarla" className="h-7" />
            <span className="text-sm font-semibold text-muted-foreground font-montserrat tracking-wide uppercase">Business</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground font-montserrat mb-1">
            {isLogin ? 'Welcome back' : 'Get started'}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {isLogin ? 'Sign in to your business account' : 'Create your business account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading
                ? (isLogin ? 'Signing in...' : 'Creating account...')
                : (isLogin ? 'Sign in' : 'Create account')}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-foreground font-medium underline underline-offset-2 hover:opacity-70"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessAuth;
