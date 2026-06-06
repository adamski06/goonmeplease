import React, { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import JarlaLoader from '@/components/JarlaLoader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { signInWithApple } from '@/lib/appleAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import jarlaLogo from '@/assets/jarla-logo.png';
import { Button } from '@/components/ui/button';
import a2Asset from '@/assets/auth-bg/a2.png.asset.json';
import a3Asset from '@/assets/auth-bg/a3.png.asset.json';
import a4Asset from '@/assets/auth-bg/a4.png.asset.json';
import a5Asset from '@/assets/auth-bg/a5.png.asset.json';

const AUTH_IMAGES = [a2Asset.url, a3Asset.url, a4Asset.url, a5Asset.url];
const GRAIN_SVG = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

import CredentialsStep from '@/components/auth/CredentialsStep';
import LoginForm from '@/components/auth/LoginForm';
import PhoneVerifyStep from '@/components/auth/PhoneVerifyStep';
import TikTokStep from '@/components/auth/TikTokStep';


// Signup flow: credentials → tiktok → phone (email) or just tiktok (Apple)
type SignUpStep = 'credentials' | 'tiktok' | 'phone';
type AuthView = 'welcome' | 'signup' | 'login';

const TOTAL_STEPS = 3;

const stepNumber = (step: SignUpStep) => {
  switch (step) {
    case 'credentials': return 1;
    case 'tiktok': return 2;
    case 'phone': return 3;
  }
};

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialView: AuthView = searchParams.get('mode') === 'login' ? 'login' : 'welcome';
  const [authView, setAuthView] = useState<AuthView>(initialView);
  const [isSignUp, setIsSignUp] = useState(true);
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [signUpFullName, setSignUpFullName] = useState<string>('');
  const [showMethodSheet, setShowMethodSheet] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const emailSignupInProgress = React.useRef(false);
  // Gate: don't show auth UI until we've confirmed user needs it
  const [authCheckDone, setAuthCheckDone] = useState(false);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Detect returning OAuth users who need onboarding
  useEffect(() => {
    if (loading) return;

    if (!user) {
      // No user — show auth UI
      setAuthCheckDone(true);
      return;
    }

    // If email signup is in progress, let handleCredentialsNext manage the flow
    if (emailSignupInProgress.current) {
      setAuthCheckDone(true);
      return;
    }
    // If we're mid-signup flow (email), don't interfere
    if (isSignUp && signUpStep !== 'credentials') {
      setAuthCheckDone(true);
      return;
    }

    // Check if this user needs onboarding (new OAuth user with no username)
    const checkOnboarding = async () => {
      const [{ data: profile }, { data: tiktokAccounts }] = await Promise.all([
        supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('tiktok_accounts_safe')
          .select('id')
          .eq('user_id', user.id)
          .limit(1),
      ]);

      const hasTikTok = tiktokAccounts && tiktokAccounts.length > 0;

      if (!hasTikTok) {
        // New user (OAuth or otherwise) — show TikTok onboarding
        const provider = user.app_metadata?.provider;
        const oauthUser = provider && provider !== 'email';
        setIsOAuthUser(!!oauthUser);
        setNewUserId(user.id);
        setIsSignUp(true);
        setSignUpStep('tiktok');
        setAuthView('signup');
        setAuthCheckDone(true);
        return;
      }

      // Existing user with profile — redirect (don't show auth UI at all)
      checkCreatorRole();
    };

    checkOnboarding();
  }, [user, loading]);

  const checkCreatorRole = async () => {
    if (!user) return;
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasCreator = roles?.some(r => r.role === 'creator');
    const hasBusiness = roles?.some(r => r.role === 'business');

    if (hasBusiness && !hasCreator) {
      toast({ title: t('auth.notCreatorAccount'), description: t('auth.notCreatorAccountDesc'), variant: 'destructive' });
      await supabase.auth.signOut();
      return;
    }
    navigate('/user');
  };

  const handleCredentialsNext = async (data: {
    method: 'email';
    email: string;
    password: string;
    fullName: string;
  }) => {
    setIsLoading(true);
    emailSignupInProgress.current = true;
    try {
      setSignUpFullName(data.fullName || '');
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        if (error.message.includes('already registered')) {
          toast({ title: t('auth.accountExists'), description: t('auth.accountExistsDesc'), variant: 'destructive' });
        } else {
          toast({ title: t('auth.signUpFailed'), description: error.message, variant: 'destructive' });
        }
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const currentUserId = session.session.user.id;
      setNewUserId(currentUserId);
      setSignUpStep('tiktok');
      emailSignupInProgress.current = false;
    } catch (error: any) {
      emailSignupInProgress.current = false;
      toast({ title: t('auth.signUpFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTikTokNext = (username: string) => {
    setSignUpStep('phone');
  };

  const handleTikTokSkip = () => {
    setSignUpStep('phone');
  };

  const handlePhoneNext = () => {
    navigate('/user');
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: t('auth.signInFailed'),
        description: error.message === 'Invalid login credentials' ? t('auth.invalidCredentials') : error.message,
        variant: 'destructive',
      });
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.session.user.id);

      const hasCreator = roles?.some(r => r.role === 'creator');
      const hasBusiness = roles?.some(r => r.role === 'business');

      if (hasBusiness && !hasCreator) {
        toast({ title: t('auth.notCreatorAccount'), description: t('auth.notCreatorAccountDesc'), variant: 'destructive' });
        await supabase.auth.signOut();
        return;
      }
    }
    navigate('/user');
  };

  // Show white screen while auth is initializing — matches auth page bg for seamless transition
  if (loading || !authCheckDone) {
    return <div className="min-h-screen bg-white" />;
  }

  const currentStep = stepNumber(signUpStep);

  const slideDirection = authView === 'welcome' ? 0 : 1;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Welcome screen */}
      <div
        className="min-h-screen flex flex-col absolute inset-0"
        style={{
          transform: `translateX(${slideDirection === 0 ? '0%' : '-100%'})`,
          transition: 'transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
          pointerEvents: authView === 'welcome' ? 'auto' : 'none',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center pt-24 pb-6">
          <div className="relative h-10 w-[140px]">
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
                maskPosition: 'center',
              }}
            />
          </div>
        </div>

        {/* Animated image rows */}
        <div className="overflow-hidden pb-4 space-y-3 mt-2">
          <div className="relative h-[160px]">
            <div className="flex gap-3 animate-[scrollLeft_35s_linear_infinite] absolute" style={{ width: 'max-content' }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={`r1-${i}`} className="relative w-[120px] h-[160px] rounded-xl shrink-0 overflow-hidden bg-black/5">
                  <img src={AUTH_IMAGES[i % AUTH_IMAGES.length]} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60" style={{ backgroundImage: GRAIN_SVG, backgroundSize: '160px 160px' }} />
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[160px]">
            <div className="flex gap-3 animate-[scrollRight_38s_linear_infinite] absolute" style={{ width: 'max-content' }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={`r2-${i}`} className="relative w-[120px] h-[160px] rounded-xl shrink-0 overflow-hidden bg-black/5">
                  <img src={AUTH_IMAGES[(i + 2) % AUTH_IMAGES.length]} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60" style={{ backgroundImage: GRAIN_SVG, backgroundSize: '160px 160px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes scrollLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scrollRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          @keyframes sheetUp {
            0% { transform: translateY(100%); }
            100% { transform: translateY(0); }
          }
          @keyframes sheetDown {
            0% { transform: translateY(0); }
            100% { transform: translateY(100%); }
          }
        `}</style>

        {/* Tagline & buttons */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10">
          <h1 className="text-2xl font-bold text-black text-center mb-8 font-montserrat">
            Start creating
          </h1>

          <div className="w-full max-w-xs space-y-2.5">
            <button
              onClick={() => {
                Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
                setShowMethodSheet(true);
              }}
              className="w-full py-3.5 rounded-full text-base font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(180deg, rgba(30,30,30,0.92) 0%, rgba(0,0,0,0.96) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Register now
            </button>
            <button
              onClick={() => {
                Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
                setAuthView('login');
                setIsSignUp(false);
              }}
              className="w-full py-3.5 rounded-full text-base font-bold text-black transition-all"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(0,0,0,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              I already have an account
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-black/40 leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="https://jarla.org/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-black/70">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="https://jarla.org/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-black/70">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Bottom sheet for sign-up method */}
        {showMethodSheet && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 transition-opacity"
              onClick={() => setShowMethodSheet(false)}
            />
            <div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] px-6 pt-6 pb-10"
              style={{
                animation: 'sheetUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex justify-center mb-5">
                <div className="w-10 h-1 rounded-full bg-black/15" />
              </div>

              <h3 className="text-lg font-bold text-black text-center mb-6 font-montserrat">
                Get started
              </h3>

              <div className="space-y-2.5 max-w-xs mx-auto">
                <button
                  onClick={async () => {
                    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
                    const { error } = await signInWithApple();
                    if (error) {
                      toast({ title: 'Sign in failed', description: String(error), variant: 'destructive' });
                    }
                  }}
                  className="w-full py-3.5 rounded-full text-base font-bold text-white flex items-center justify-center gap-2.5 transition-all"
                  style={{
                    background: 'linear-gradient(180deg, rgba(30,30,30,0.92) 0%, rgba(0,0,0,0.96) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-black/10" />
                  <span className="text-xs text-black/40 font-medium">or</span>
                  <div className="flex-1 h-px bg-black/10" />
                </div>

                <button
                  onClick={() => {
                    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
                    setShowMethodSheet(false);
                    setAuthView('signup');
                    setIsSignUp(true);
                    setSignUpStep('credentials');
                  }}
                  className="w-full py-3.5 rounded-full text-base font-bold text-black flex items-center justify-center gap-2.5 transition-all"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 16px rgba(0,0,0,0.08)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  Sign up with email
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Login / Signup forms — slides in from right */}
      <div
        className="min-h-screen flex flex-col absolute inset-0"
        style={{
          transform: `translateX(${slideDirection === 0 ? '100%' : '0%'})`,
          transition: 'transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
          pointerEvents: authView !== 'welcome' ? 'auto' : 'none',
        }}
      >
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            {/* Logo */}
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
                    maskPosition: 'center',
                  }}
                />
              </div>
            </div>

            {isSignUp ? (
              <>
                {signUpStep === 'credentials' && (
                  <CredentialsStep
                    onNext={handleCredentialsNext}
                    onSwitchToLogin={() => { setIsSignUp(false); setAuthView('login'); }}
                    isLoading={isLoading}
                  />
                )}
                {signUpStep === 'tiktok' && newUserId && (
                  <TikTokStep userId={newUserId} onNext={handleTikTokNext} onSkip={handleTikTokSkip} />
                )}
                {signUpStep === 'phone' && newUserId && (
                  <PhoneVerifyStep userId={newUserId} onNext={handlePhoneNext} onSkip={handlePhoneNext} />
                )}

                {!isOAuthUser && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          s === currentStep ? 'w-6 bg-black' : 'w-1.5 bg-black/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <LoginForm
                onSubmit={handleLogin}
                onSwitchToSignUp={() => { setIsSignUp(true); setAuthView('signup'); setSignUpStep('credentials'); }}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
