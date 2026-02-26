import React, { useState, useEffect, useRef } from 'react';
import JarlaLoader from '@/components/JarlaLoader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import jarlaLogo from '@/assets/jarla-logo.png';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';

import AgeStep from '@/components/auth/AgeStep';
import CredentialsStep from '@/components/auth/CredentialsStep';
import UsernameStep from '@/components/auth/UsernameStep';
import LoginForm from '@/components/auth/LoginForm';
import PhoneVerifyStep from '@/components/auth/PhoneVerifyStep';
import TikTokStep from '@/components/auth/TikTokStep';

// Grid images – reuse existing assets
import img1 from '@/assets/campaigns/fashion-style.jpg';
import img2 from '@/assets/campaigns/tech-unboxing.jpg';
import img3 from '@/assets/campaigns/coffee-moment.jpg';
import img4 from '@/assets/campaigns/fitness-workout.jpg';
import img5 from '@/assets/campaigns/music-lifestyle.jpg';
import img6 from '@/assets/campaigns/street-style.jpg';
import img7 from '@/assets/campaigns/creative-design.jpg';
import img8 from '@/assets/campaigns/food-delivery.jpg';

const gridImages = [img1, img2, img3, img4, img5, img6, img7, img8];

// Signup flow: credentials → tiktok → age → phone → username
type SignUpStep = 'credentials' | 'tiktok' | 'age' | 'phone' | 'username';
type ViewState = 'loading' | 'ready';
type AuthView = 'welcome' | 'signup' | 'login';

const TRANSITION_DELAY = 500;
const TOTAL_STEPS = 5;

const stepNumber = (step: SignUpStep) => {
  switch (step) {
    case 'credentials': return 1;
    case 'tiktok': return 2;
    case 'age': return 3;
    case 'phone': return 4;
    case 'username': return 5;
  }
};

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialView: AuthView = searchParams.get('mode') === 'login' ? 'login' : 'welcome';
  const [authView, setAuthView] = useState<AuthView>(initialView);
  const [isSignUp, setIsSignUp] = useState(true);
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('credentials');
  const [selectedAge, setSelectedAge] = useState<number>(18);
  const [isLoading, setIsLoading] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [signUpFullName, setSignUpFullName] = useState<string>('');
  const [viewState, setViewState] = useState<ViewState>('loading');

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const prevStepRef = useRef(signUpStep);
  const prevIsSignUpRef = useRef(isSignUp);

  useEffect(() => {
    if (prevStepRef.current !== signUpStep || prevIsSignUpRef.current !== isSignUp) {
      prevStepRef.current = signUpStep;
      prevIsSignUpRef.current = isSignUp;
      setViewState('loading');
      const timer = setTimeout(() => setViewState('ready'), TRANSITION_DELAY);
      return () => clearTimeout(timer);
    }
  }, [signUpStep, isSignUp]);

  useEffect(() => {
    setViewState('loading');
    const timer = setTimeout(() => setViewState('ready'), TRANSITION_DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && user && signUpStep !== 'username' && signUpStep !== 'age' && signUpStep !== 'phone' && signUpStep !== 'tiktok') {
      checkCreatorRole();
    }
  }, [user, loading, signUpStep]);

  const checkCreatorRole = async () => {
    if (!user) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

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

    navigate('/user');
  };

  const handleCredentialsNext = async (data: {
    method: 'email';
    email: string;
    password: string;
    fullName: string;
  }) => {
    setIsLoading(true);

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
    } catch (error: any) {
      toast({ title: t('auth.signUpFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTikTokNext = (username: string) => {
    // Store the TikTok username - could save to DB here
    setSignUpStep('age');
  };

  const handleTikTokSkip = () => {
    setSignUpStep('age');
  };

  const handleAgeNext = (age: number) => {
    setSelectedAge(age);
    setSignUpStep('phone');
  };

  const handlePhoneNext = () => {
    setSignUpStep('username');
  };

  const handleUsernameComplete = () => {
    navigate('/user');
  };

  const handleLogin = async (email: string, password: string) => {
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

  if (loading) {
    return <JarlaLoader />;
  }

  const currentStep = stepNumber(signUpStep);

  // Welcome screen — Vinted-inspired
  if (authView === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <LanguageSwitcher />
          <button
            onClick={() => { setAuthView('login'); setIsSignUp(false); }}
            className="text-sm font-medium text-black/60 hover:text-black transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center pt-6 pb-10">
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
        <div className="overflow-hidden pb-6 space-y-3">
          {/* Row 1 — scrolls left */}
          <div className="relative h-[160px]">
            <div className="flex gap-3 animate-[scrollLeft_35s_linear_infinite] absolute" style={{ width: 'max-content' }}>
              {[...gridImages, ...gridImages].map((src, i) => (
                <div key={`r1-${i}`} className="w-[120px] h-[160px] rounded-xl overflow-hidden shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          {/* Row 2 — scrolls right */}
          <div className="relative h-[160px]">
            <div className="flex gap-3 animate-[scrollRight_38s_linear_infinite] absolute" style={{ width: 'max-content' }}>
              {[...gridImages.slice().reverse(), ...gridImages.slice().reverse()].map((src, i) => (
                <div key={`r2-${i}`} className="w-[120px] h-[160px] rounded-xl overflow-hidden shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover" />
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
        `}</style>

        {/* Tagline & buttons */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10">
          <h1 className="text-3xl font-bold text-black text-center leading-tight mb-8">
            Create content.<br />Get paid.
          </h1>

          <div className="w-full max-w-xs space-y-1.5">
            <button
              onClick={() => { setAuthView('signup'); setIsSignUp(true); setSignUpStep('credentials'); }}
              className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-all"
              style={{
                background: 'rgba(0,0,0,0.88)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Register now
            </button>
            <button
              onClick={() => { setAuthView('login'); setIsSignUp(false); }}
              className="w-full py-2.5 rounded-full text-sm font-semibold text-black transition-all"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,0,0,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              I already have an account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signup / Login forms
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {viewState === 'loading' ? (
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-10 w-[140px] mb-6">
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
            <div className="w-32 h-[3px] rounded-full bg-black/10 overflow-hidden flex items-center justify-center">
              <div
                className="h-full rounded-full bg-black/40"
                style={{ animation: 'expandCenter 0.5s ease-out forwards' }}
              />
            </div>
            <style>{`
              @keyframes expandCenter {
                0% { width: 0%; }
                100% { width: 100%; }
              }
            `}</style>
          </div>
        ) : (
          <div
            className="w-full max-w-sm rounded-3xl p-8 border border-white/40 animate-fade-in"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: '0 0 60px rgba(255,255,255,0.2), 0 0 120px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.06)',
            }}
          >
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
                {signUpStep === 'age' && <AgeStep onNext={handleAgeNext} />}
                {signUpStep === 'phone' && newUserId && (
                  <PhoneVerifyStep userId={newUserId} onNext={handlePhoneNext} onSkip={handlePhoneNext} />
                )}
                {signUpStep === 'username' && newUserId && (
                  <UsernameStep userId={newUserId} fullName={signUpFullName} onComplete={handleUsernameComplete} />
                )}

                {/* Step indicator */}
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
              </>
            ) : (
              <LoginForm
                onSubmit={handleLogin}
                onSwitchToSignUp={() => { setIsSignUp(true); setAuthView('signup'); setSignUpStep('credentials'); }}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
