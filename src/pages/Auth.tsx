import React, { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [signUpStep, setSignUpStep] = useState(1);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Only auto-redirect if user is logged in AND we're not in the TikTok connect step
    if (!loading && user && signUpStep !== 2) {
      navigate('/campaigns');
    }
  }, [user, loading, navigate, signUpStep]);

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
        title: 'Sign in failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/campaigns');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Account exists',
          description: 'This email is already registered. Please sign in instead.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      // Move to step 2 instead of navigating away
      setSignUpStep(2);
    }
  };

  const handleConnectTikTok = () => {
    // TODO: Implement TikTok OAuth connection
    toast({
      title: 'Coming soon',
      description: 'TikTok connection will be available soon.',
    });
    navigate('/campaigns');
  };

  const handleSkipTikTok = () => {
    navigate('/campaigns');
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
      {/* Aurora gradient background */}
      <div className="aurora-gradient-auth" />
      <div className="noise-layer" />
      
      {/* Logo in top left corner */}
      <div className="absolute top-6 left-6 z-20">
        <div className="relative h-10 w-[130px]">
          <div 
            className="absolute inset-0 bg-white"
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
      
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-lg relative z-10">
        {signUpStep === 2 ? (
          // Step 2: Connect TikTok - no header title
          <CardContent className="pt-8 pb-6">
            <div className="space-y-8">
              {/* Logos */}
              <div className="flex items-center justify-center gap-6">
                <div className="relative h-12 w-[160px]">
                  <div 
                    className="absolute inset-0 bg-white"
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
                <Share2 className="w-6 h-6 text-white/60" />
                <img src={tiktokLogo} alt="TikTok" className="h-12 object-contain invert" />
              </div>
              
              {/* Connect button */}
              <Button 
                onClick={handleConnectTikTok}
                className="w-full rounded-full bg-black text-white hover:bg-black/80 flex items-center justify-center gap-2"
              >
                <TikTokIcon className="w-5 h-5" />
                Connect TikTok
              </Button>
              
              {/* Skip option */}
              <p className="text-center text-white/70 text-sm">
                <button
                  type="button"
                  onClick={handleSkipTikTok}
                  className="text-white underline hover:text-white/80"
                >
                  Skip for now
                </button>
              </p>
              
              {/* Step indicator at bottom */}
              <p className="text-white/60 text-sm text-center">2/2</p>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader className="text-center py-8">
              <CardTitle className="text-5xl font-bold text-white">Let's start!</CardTitle>
            </CardHeader>
            <CardContent>
              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <p className="text-center text-white/70 text-sm mt-4">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-white underline hover:text-white/80"
                    >
                      Log in
                    </button>
                  </p>
                  {/* Step indicator at bottom */}
                  <p className="text-white/60 text-sm text-center mt-4">1/2</p>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-white">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <p className="text-center text-white/70 text-sm mt-4">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-white underline hover:text-white/80"
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
