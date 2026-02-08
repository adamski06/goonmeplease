import React, { useState, useEffect } from 'react';
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

type SignUpStep = 'age' | 'credentials' | 'username';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') !== 'login');
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('age');
  const [selectedAge, setSelectedAge] = useState<number>(18);
  const [isLoading, setIsLoading] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && user && signUpStep !== 'username') {
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

    navigate('/');
  };

  const handleAgeNext = (age: number) => {
    setSelectedAge(age);
    setSignUpStep('credentials');
  };

  const handleCredentialsNext = async (data: {
    method: 'email' | 'phone';
    email?: string;
    phone?: string;
    password: string;
    fullName: string;
  }) => {
    setIsLoading(true);

    try {
      if (data.method === 'email' && data.email) {
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
      } else if (data.method === 'phone' && data.phone) {
        // Phone signup - use email-based for now with phone as metadata
        toast({ title: 'Coming soon', description: 'Phone signup will be available soon. Please use email.' });
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
      setNewUserId(currentUserId);

      // Add creator role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: currentUserId, role: 'creator' });

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Error adding creator role:', roleError);
      }

      setSignUpStep('username');
    } catch (error: any) {
      toast({ title: t('auth.signUpFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameComplete = () => {
    navigate('/');
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

    // Check roles
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
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Progress indicator for signup
  const stepNumber = signUpStep === 'age' ? 1 : signUpStep === 'credentials' ? 2 : 3;

  return (
    <div className="min-h-screen flex flex-col bg-black/40 backdrop-blur-sm">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40">
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
              {signUpStep === 'age' && <AgeStep onNext={handleAgeNext} />}
              {signUpStep === 'credentials' && (
                <CredentialsStep
                  onNext={handleCredentialsNext}
                  onSwitchToLogin={() => { setIsSignUp(false); setSignUpStep('age'); }}
                  isLoading={isLoading}
                />
              )}
              {signUpStep === 'username' && newUserId && (
                <UsernameStep userId={newUserId} onComplete={handleUsernameComplete} />
              )}

              {/* Step indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s === stepNumber ? 'w-6 bg-foreground' : 'w-1.5 bg-foreground/20'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToSignUp={() => { setIsSignUp(true); setSignUpStep('age'); }}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
