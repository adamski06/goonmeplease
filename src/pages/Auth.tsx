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

      // Move to step 2 (TikTok connect)
      setSignUpStep(2);
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dev mode toggle - top right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={() => setDevMode(!devMode)}
          className={`px-3 py-1 text-xs rounded-full transition-all ${
            devMode ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60 hover:bg-white/30'
          }`}
        >
          Dev Mode
        </button>
        {devMode && (
          <div className="flex gap-1">
            <button
              onClick={() => { setSignUpStep(1); setIsSignUp(true); }}
              className={`px-2 py-1 text-xs rounded ${signUpStep === 1 && isSignUp ? 'bg-white text-black' : 'bg-white/20 text-white'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setSignUpStep(1); setIsSignUp(false); }}
              className={`px-2 py-1 text-xs rounded ${signUpStep === 1 && !isSignUp ? 'bg-white text-black' : 'bg-white/20 text-white'}`}
            >
              Log In
            </button>
            <button
              onClick={() => setSignUpStep(2)}
              className={`px-2 py-1 text-xs rounded ${signUpStep === 2 ? 'bg-white text-black' : 'bg-white/20 text-white'}`}
            >
              TikTok
            </button>
          </div>
        )}
      </div>

      {/* Static Grainy Background */}
      <div className="absolute inset-0 grainy-background" />
      <div className="noise-layer" />
      
      {/* Logo in top left corner */}
      <div className="absolute top-6 left-6 z-20">
        <div className="relative h-10 w-[130px]">
          <div 
            className="absolute inset-0 bg-foreground"
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
      
      <Card className="w-full max-w-md bg-black/5 dark:bg-white/10 backdrop-blur-md border-black/10 dark:border-white/20 shadow-lg relative z-10 rounded-none">
        {signUpStep === 2 ? (
          // Step 2: Connect TikTok - no header title
          <CardContent className="pt-12 pb-8">
            <div className="space-y-8">
              {/* Logos */}
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="relative h-20 w-[220px]">
                  <div 
                    className="absolute inset-0 bg-foreground"
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
                <Link className="w-5 h-5 text-muted-foreground" />
                <img src={tiktokLogo} alt="TikTok" className="h-20 object-contain dark:invert" />
              </div>
              
              {/* Connect button */}
              <div className="flex justify-center">
                <Button 
                  onClick={handleConnectTikTok}
                  className="px-6 py-2 h-auto rounded-full bg-foreground text-background hover:bg-foreground/80 flex items-center justify-center gap-2 text-base"
                >
                  Connect
                  <img src={tiktokLogo} alt="TikTok" className="h-5 object-contain invert dark:invert-0" />
                </Button>
              </div>
              
              {/* Skip option with step indicator */}
              <div className="text-center space-y-1">
                <button
                  type="button"
                  onClick={handleSkipTikTok}
                  className="text-foreground underline hover:text-foreground/80 text-sm"
                >
                  Skip for now
                </button>
                <p className="text-muted-foreground text-sm">2/2</p>
              </div>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader className="text-center py-8">
              <CardTitle className="text-5xl font-bold text-foreground">Let's start!</CardTitle>
            </CardHeader>
            <CardContent>
              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-foreground">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <div className="text-center space-y-1 mt-4">
                    <p className="text-muted-foreground text-sm">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="text-foreground underline hover:text-foreground/80"
                      >
                        Log in
                      </button>
                    </p>
                    <p className="text-muted-foreground text-sm">1/2</p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-foreground">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-foreground">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <p className="text-center text-muted-foreground text-sm mt-4">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-foreground underline hover:text-foreground/80"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;
