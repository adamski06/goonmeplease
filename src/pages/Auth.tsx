import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import jarlaLogo from '@/assets/jarla-logo.png';

import AgeStep from '@/components/auth/AgeStep';
import CredentialsStep from '@/components/auth/CredentialsStep';
import UsernameStep from '@/components/auth/UsernameStep';
import LoginForm from '@/components/auth/LoginForm';
import PhoneVerifyStep from '@/components/auth/PhoneVerifyStep';

// Signup flow: credentials → age → phone → username
type SignUpStep = 'credentials' | 'age' | 'phone' | 'username';
type ViewState = 'loading' | 'ready';

const TRANSITION_DELAY = 500;
const TOTAL_STEPS = 4;

const stepNumber = (step: SignUpStep) => {
  switch (step) {
    case 'credentials': return 1;
    case 'age': return 2;
    case 'phone': return 3;
    case 'username': return 4;
  }
};

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') !== 'login');
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
    if (!loading && user && signUpStep !== 'username' && signUpStep !== 'age' && signUpStep !== 'phone') {
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

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: currentUserId, role: 'creator' });

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Error adding creator role:', roleError);
      }

      // After account creation, go to age step
      setSignUpStep('age');
    } catch (error: any) {
      toast({ title: t('auth.signUpFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const currentStep = stepNumber(signUpStep);

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
                    onSwitchToLogin={() => { setIsSignUp(false); setSignUpStep('credentials'); }}
                    isLoading={isLoading}
                  />
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
                onSwitchToSignUp={() => { setIsSignUp(true); setSignUpStep('credentials'); }}
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
