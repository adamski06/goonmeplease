import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type Step = 'company-name' | 'company-description' | 'location' | 'products' | 'audience' | 'credentials' | 'login';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Japan', 'South Korea', 'Singapore', 'India', 'Brazil', 'Mexico', 'Other'
];

const AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

const AUDIENCE_TYPES = [
  'Students', 'Young Professionals', 'Parents', 'Gamers', 'Fitness Enthusiasts',
  'Tech Enthusiasts', 'Fashion Lovers', 'Foodies', 'Travelers', 'Entrepreneurs',
  'Artists/Creatives', 'Music Lovers', 'Sports Fans', 'Eco-Conscious', 'Luxury Seekers'
];

const ALL_STEPS: Step[] = ['company-name', 'company-description', 'location', 'products', 'audience', 'credentials'];

const BusinessAuth: React.FC = () => {
  const [step, setStep] = useState<Step>('company-name');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Step 1: Company Name
  const [companyName, setCompanyName] = useState('');
  
  // Step 2: Company Description
  const [description, setDescription] = useState('');
  
  // Step 3: Location
  const [country, setCountry] = useState('');
  
  // Step 4: Products/Services
  const [productsServices, setProductsServices] = useState('');
  
  // Step 5: Target Audience
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [globalReach, setGlobalReach] = useState<'worldwide' | 'specific'>('worldwide');
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [audienceTypes, setAudienceTypes] = useState<string[]>([]);
  
  // Final data
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Animate name input after 1 second on company-name step
  useEffect(() => {
    if (step === 'company-name') {
      setShowNameInput(false);
      const timer = setTimeout(() => {
        setShowNameInput(true);
        // Focus the input after animation starts
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (!loading && user && !devMode) {
      checkBusinessRole();
    }
  }, [user, loading, devMode]);

  const checkBusinessRole = async () => {
    if (!user) return;
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const hasBusiness = roles?.some(r => r.role === 'business');
    if (hasBusiness) {
      navigate('/business');
    }
  };

  const getCurrentStepIndex = () => ALL_STEPS.indexOf(step as Step);
  const getTotalSteps = () => ALL_STEPS.length;

  const goNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < ALL_STEPS.length - 1) {
      setStep(ALL_STEPS[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setStep(ALL_STEPS[currentIndex - 1]);
    }
  };

  const validateCredentials = () => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCredentials()) return;

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.session.user.id);
        
        const hasBusiness = roles?.some(r => r.role === 'business');
        if (hasBusiness) {
          navigate('/business');
        } else {
          toast({
            title: 'Not a business account',
            description: 'This account is not registered as a business.',
            variant: 'destructive',
          });
          await supabase.auth.signOut();
        }
      }
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCredentials()) return;

    setIsLoading(true);

    try {
      // First create the user account
      const { error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({
            title: 'Account exists',
            description: 'This email is already registered. Please sign in.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Sign up failed',
            description: signUpError.message,
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

      // Build full description with all collected data
      const fullDescription = [
        description,
        productsServices ? `Products/Services: ${productsServices}` : '',
        ageRanges.length ? `Target Age: ${ageRanges.join(', ')}` : '',
        globalReach === 'worldwide' ? 'Reach: Worldwide' : `Reach: ${targetCountries.join(', ')}`,
        audienceTypes.length ? `Audience: ${audienceTypes.join(', ')}` : ''
      ].filter(Boolean).join('\n\n');

      // Create business profile
      const { error: profileError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: currentUserId,
          company_name: companyName,
          description: fullDescription || null,
          website: website || null,
        });

      if (profileError) throw profileError;

      // Add business role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: currentUserId,
          role: 'business',
        });

      if (roleError) throw roleError;

      toast({
        title: 'Business account created!',
        description: 'Welcome to your business dashboard.',
      });

      navigate('/business');
    } catch (error: any) {
      toast({
        title: 'Setup failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleCompanyNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && companyName.trim()) {
      e.preventDefault();
      goNext();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Check if we should show the company name header (after first step)
  const showCompanyHeader = step !== 'company-name' && step !== 'login' && companyName;

  const renderStepContent = () => {
    switch (step) {
      case 'company-name':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen px-6">
            <div className="space-y-8">
              <div className="flex items-baseline gap-4">
                <h1 className="text-5xl md:text-7xl font-light text-foreground whitespace-nowrap">Hello</h1>
                {showNameInput && (
                  <div className="relative inline-block animate-fade-in">
                    <input
                      ref={inputRef}
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onKeyDown={handleCompanyNameKeyDown}
                      placeholder="company name"
                      className="bg-transparent border-none outline-none text-5xl md:text-7xl font-light placeholder:text-muted-foreground/40 text-foreground min-w-[200px]"
                      style={{ width: companyName ? `${Math.max(companyName.length, 12)}ch` : '12ch' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/30" />
                  </div>
                )}
              </div>
              
              {companyName.trim() && (
                <div className="flex justify-center animate-fade-in">
                  <Button 
                    onClick={goNext} 
                    className="rounded-full px-8"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'company-description':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-light text-foreground text-center">
                Describe your company
              </h2>
              <p className="text-muted-foreground text-center">Help creators understand what you do</p>
              
              <div className="w-full space-y-6">
                <Textarea
                  placeholder="We're a company that..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none resize-none text-lg"
                  autoFocus
                />
                
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Website (optional)</Label>
                  <Input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-light text-foreground text-center">
                Where are you based?
              </h2>
              
              <div className="w-full grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCountry(c)}
                    className={`p-3 text-left text-sm transition-all ${
                      country === c 
                        ? 'bg-foreground text-background' 
                        : 'bg-transparent border border-foreground/20 hover:border-foreground/50 text-foreground'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full" disabled={!country}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-light text-foreground text-center">
                What do you sell?
              </h2>
              <p className="text-muted-foreground text-center">Describe your products or services</p>
              
              <Textarea
                placeholder="We offer premium fitness apparel, supplements, and workout programs..."
                value={productsServices}
                onChange={(e) => setProductsServices(e.target.value)}
                rows={5}
                className="w-full bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none resize-none text-lg"
                autoFocus
              />

              <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12">
            <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto space-y-8 overflow-y-auto">
              <h2 className="text-3xl md:text-4xl font-light text-foreground text-center">
                Who's your audience?
              </h2>
              
              {/* Age Ranges */}
              <div className="w-full space-y-3">
                <Label className="text-muted-foreground text-sm">Target Age Range</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => toggleArrayItem(ageRanges, setAgeRanges, age)}
                      className={`px-4 py-2 text-sm transition-all ${
                        ageRanges.includes(age)
                          ? 'bg-foreground text-background'
                          : 'bg-transparent border border-foreground/20 hover:border-foreground/50 text-foreground'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Geographic Reach */}
              <div className="w-full space-y-3">
                <Label className="text-muted-foreground text-sm">Geographic Reach</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGlobalReach('worldwide')}
                    className={`flex-1 p-3 text-sm transition-all ${
                      globalReach === 'worldwide'
                        ? 'bg-foreground text-background'
                        : 'bg-transparent border border-foreground/20 hover:border-foreground/50 text-foreground'
                    }`}
                  >
                    Worldwide
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlobalReach('specific')}
                    className={`flex-1 p-3 text-sm transition-all ${
                      globalReach === 'specific'
                        ? 'bg-foreground text-background'
                        : 'bg-transparent border border-foreground/20 hover:border-foreground/50 text-foreground'
                    }`}
                  >
                    Specific Countries
                  </button>
                </div>
                
                {globalReach === 'specific' && (
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto mt-2">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayItem(targetCountries, setTargetCountries, c)}
                        className={`p-2 text-left text-xs transition-all ${
                          targetCountries.includes(c)
                            ? 'bg-foreground text-background'
                            : 'bg-transparent border border-foreground/20 hover:border-foreground/50 text-foreground'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Audience Types */}
              <div className="w-full space-y-3">
                <Label className="text-muted-foreground text-sm">Audience Types</Label>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem(audienceTypes, setAudienceTypes, type)}
                      className={`px-3 py-1.5 text-xs transition-all ${
                        audienceTypes.includes(type)
                          ? 'bg-foreground text-background'
                          : 'bg-transparent border border-foreground/20 hover:border-foreground/50 text-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 w-full pt-4">
                <Button variant="ghost" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        );

      case 'credentials':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-light text-foreground text-center">
                Create your account
              </h2>
              <p className="text-muted-foreground text-center">Almost done! Set up your login credentials</p>
              
              <form onSubmit={handleFinalSubmit} className="w-full space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Your Name</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Work Email</Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Password</Label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none"
                  />
                </div>
                
                <div className="flex gap-4 w-full pt-4">
                  <Button type="button" variant="ghost" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Complete Setup'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'login':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen px-6">
            <div className="w-full max-w-md space-y-8">
              <h2 className="text-3xl md:text-4xl font-light text-foreground text-center">
                Business Login
              </h2>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                <p className="text-center text-muted-foreground text-sm mt-4">
                  Don't have a business account?{' '}
                  <button
                    type="button"
                    onClick={() => setStep('company-name')}
                    className="text-foreground underline hover:text-foreground/80"
                  >
                    Create one
                  </button>
                </p>
              </form>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dev mode toggle - top right */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2 flex-wrap justify-end">
        <button
          onClick={() => setDevMode(!devMode)}
          className={`px-3 py-1 text-xs rounded-full transition-all ${
            devMode ? 'bg-green-500 text-white' : 'bg-foreground/20 text-foreground/60 hover:bg-foreground/30'
          }`}
        >
          Dev Mode
        </button>
        {devMode && (
          <div className="flex gap-1 flex-wrap">
            {ALL_STEPS.map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`px-2 py-1 text-xs rounded ${
                  step === s ? 'bg-foreground text-background' : 'bg-foreground/20 text-foreground'
                }`}
              >
                {s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
            <button
              onClick={() => setStep('login')}
              className={`px-2 py-1 text-xs rounded ${
                step === 'login' ? 'bg-foreground text-background' : 'bg-foreground/20 text-foreground'
              }`}
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Static Grainy Background */}
      <div className="absolute inset-0 grainy-background" />
      <div className="noise-layer" />
      
      {/* Logo in top left corner */}
      <div className="fixed top-6 left-6 z-50">
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

      {/* Company name header - shown after first step */}
      {showCompanyHeader && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40">
          <h1 className="text-2xl font-light text-foreground">{companyName}</h1>
        </div>
      )}

      {/* Progress indicator */}
      {step !== 'login' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
          <div className="flex gap-1.5">
            {ALL_STEPS.map((s, i) => (
              <div 
                key={s}
                className={`h-1 w-6 transition-all ${
                  i <= getCurrentStepIndex() ? 'bg-foreground' : 'bg-foreground/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default BusinessAuth;
