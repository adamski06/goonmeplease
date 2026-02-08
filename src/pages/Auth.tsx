import React, { useState, useEffect } from 'react';
import { Link } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import jarlaLogo from '@/assets/jarla-logo.png';
import tiktokLogo from '@/assets/tiktok-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

// TikTok logo SVG component - simple version for button
const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Colored TikTok logo with cyan and red/pink
const TikTokColoredIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    {/* Cyan shadow layer */}
    <path 
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
      fill="#00F2EA"
      transform="translate(-0.5, 0)"
    />
    {/* Red/pink shadow layer */}
    <path 
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
      fill="#FF0050"
      transform="translate(0.5, 0)"
    />
    {/* Main white layer */}
    <path 
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
      fill="white"
    />
  </svg>
);

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') !== 'login');
  const [signUpStep, setSignUpStep] = useState(1);
  const [devMode, setDevMode] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Only auto-redirect if user is logged in AND we're not in the TikTok connect step AND not in dev mode
    if (!loading && user && signUpStep !== 2 && !devMode) {
      checkCreatorRole();
    }
  }, [user, loading, navigate, signUpStep, devMode]);

  const checkCreatorRole = async () => {
    if (!user) return;
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const hasCreator = roles?.some(r => r.role === 'creator');
    const hasBusiness = roles?.some(r => r.role === 'business');
    
    if (hasBusiness && !hasCreator) {
      // Business account trying to access creator - sign out and show error
      toast({
        title: t('auth.notCreatorAccount'),
        description: t('auth.notCreatorAccountDesc'),
        variant: 'destructive',
      });
      await supabase.auth.signOut();
      return;
    }
    
    navigate('/');
  };

  const validateForm = (isSignUp: boolean) => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: t('auth.signInFailed'),
        description: error.message === 'Invalid login credentials' 
          ? t('auth.invalidCredentials')
          : error.message,
        variant: 'destructive',
      });
    } else {
      // Check if user has business role only (no creator role)
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.session.user.id);
        
        const hasCreator = roles?.some(r => r.role === 'creator');
        const hasBusiness = roles?.some(r => r.role === 'business');
        
        if (hasBusiness && !hasCreator) {
          toast({
            title: t('auth.notCreatorAccount'),
            description: t('auth.notCreatorAccountDesc'),
            variant: 'destructive',
          });
          await supabase.auth.signOut();
          return;
        }
      }
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: t('auth.accountExists'),
            description: t('auth.accountExistsDesc'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.signUpFailed'),
            description: error.message,
            variant: 'destructive',
          });
        }
        setIsLoading(false);
        return;
      }

      // Wait for session
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const currentUserId = session.session.user.id;

      // Add creator role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: currentUserId,
          role: 'creator',
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Error adding creator role:', roleError);
      }

      // Navigate to home after successful signup
      navigate('/');
    } catch (error: any) {
      toast({
        title: t('auth.signUpFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectTikTok = () => {
    // TODO: Implement TikTok OAuth connection
    toast({
      title: 'Coming soon',
      description: 'TikTok connection will be available soon.',
    });
    navigate('/');
  };

  const handleSkipTikTok = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black/40 backdrop-blur-sm">
      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40">
          {/* Logo as title */}
          <div className="flex justify-center mb-8">
            <div className="relative h-12 w-[160px]">
              <div 
                className="absolute inset-0 bg-black"
                style={{
                  WebkitMaskImage: `url(${jarlaLogo})`,
                  maskImage: `url(${jarlaLogo})`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center'
                }} 
              />
            </div>
          </div>
          
          {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-black text-sm font-medium">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 py-2 text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-black text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
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
                    <Label htmlFor="signup-password" className="text-black text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 py-2 text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" className="w-full py-3 h-auto rounded-full bg-black text-white hover:bg-black/80 font-semibold" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </div>
                  <div className="text-center space-y-2 pt-2">
                    <p className="text-black/60 text-sm">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="text-black underline hover:text-black/70"
                      >
                        Log in
                      </button>
                    </p>
                    <p className="text-black/40 text-sm">1/2</p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-5">
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
                    <Button type="submit" className="w-full py-3 h-auto rounded-full bg-black text-white hover:bg-black/80 font-semibold" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                  <p className="text-center text-black/60 text-sm pt-2">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-black underline hover:text-black/70"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
