import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Sparkles, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type Step = 'company-name' | 'your-company' | 'company-description' | 'products' | 'audience' | 'credentials' | 'login';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

import { AUDIENCE_TYPES } from '@/data/audienceTypes';

const ALL_STEPS: Step[] = ['company-name', 'your-company', 'company-description', 'products', 'audience', 'credentials'];

const BusinessAuth: React.FC = () => {
  const [step, setStep] = useState<Step>('company-name');
  const [showAudienceBrowser, setShowAudienceBrowser] = useState(false);
  const [audienceSearch, setAudienceSearch] = useState('');
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
  const [audienceDescription, setAudienceDescription] = useState('');
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [globalReach, setGlobalReach] = useState<'worldwide' | 'specific'>('worldwide');
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [audienceTypes, setAudienceTypes] = useState<string[]>([]);
  
  // Final data
  const [website, setWebsite] = useState('');
  const [socialMedia, setSocialMedia] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [descriptionTypewriter, setDescriptionTypewriter] = useState('');
  const [highestStepReached, setHighestStepReached] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [dialogTermsAccepted, setDialogTermsAccepted] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Animate name input after 1 second on company-name step with typewriter effect
  useEffect(() => {
    if (step === 'company-name') {
      setShowNameInput(false);
      setTypewriterText('');
      
      const placeholderText = i18n.language === 'sv' ? 'Företagsnamn' : 'Company name';
      
      let charIndex = 0;
      let typeTimer: ReturnType<typeof setInterval>;
      
      const showTimer = setTimeout(() => {
        setShowNameInput(true);
        setTimeout(() => inputRef.current?.focus(), 600);
        
        typeTimer = setInterval(() => {
          if (charIndex <= placeholderText.length) {
            setTypewriterText(placeholderText.slice(0, charIndex));
            charIndex++;
          } else {
            clearInterval(typeTimer);
          }
        }, 100);
      }, 500);
      
      return () => {
        clearTimeout(showTimer);
        if (typeTimer) clearInterval(typeTimer);
      };
    }
  }, [step, i18n.language]);

  // Typewriter effect for "Tell us about" heading
  useEffect(() => {
    if (step === 'company-description') {
      setDescriptionTypewriter('');
      const headingText = i18n.language === 'sv' ? `Berätta om ${companyName}` : `Tell us about ${companyName}`;
      
      let charIndex = 0;
      const typeTimer = setInterval(() => {
        if (charIndex <= headingText.length) {
          setDescriptionTypewriter(headingText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeTimer);
        }
      }, 80);
      
      return () => clearInterval(typeTimer);
    }
  }, [step, i18n.language, companyName]);

  // Track highest step reached
  useEffect(() => {
    const currentIndex = ALL_STEPS.indexOf(step as Step);
    if (currentIndex > highestStepReached && step !== 'login') {
      setHighestStepReached(currentIndex);
    }
  }, [step, highestStepReached]);

  useEffect(() => {
    if (!loading && user && !devMode && !isSigningUp) {
      checkBusinessRole();
    }
  }, [user, loading, devMode, isSigningUp]);

  const checkBusinessRole = async () => {
    if (!user) return;
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const hasBusiness = roles?.some(r => r.role === 'business');
    const hasCreator = roles?.some(r => r.role === 'creator');
    
    if (hasCreator && !hasBusiness) {
      // Creator account - sign out and redirect to creator auth
      toast({
        title: t('auth.notBusinessAccount'),
        description: t('auth.notBusinessAccountDesc'),
        variant: 'destructive',
      });
      await supabase.auth.signOut();
      return;
    }
    
    if (hasBusiness) {
      navigate('/business');
    }
  };

  const getCurrentStepIndex = () => ALL_STEPS.indexOf(step as Step);
  const getTotalSteps = () => ALL_STEPS.length;

  const goNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < ALL_STEPS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(ALL_STEPS[currentIndex + 1]);
        setIsTransitioning(false);
      }, 300);
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
          title: t('auth.validationError'),
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
        title: t('auth.signInFailed'),
        description: error.message === 'Invalid login credentials' 
          ? t('auth.invalidCredentials')
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
        const hasCreator = roles?.some(r => r.role === 'creator');
        
        if (hasCreator && !hasBusiness) {
          // Creator account trying to access business - sign out and show error
          toast({
            title: t('auth.notBusinessAccount'),
            description: t('auth.notBusinessAccountDesc'),
            variant: 'destructive',
          });
          await supabase.auth.signOut();
          return;
        }
        
        if (hasBusiness) {
          navigate('/business');
        } else {
          toast({
            title: t('businessAuth.notBusinessAccount'),
            description: t('businessAuth.notBusinessAccountDesc'),
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
    setIsSigningUp(true);

    try {
      // First create the user account
      const { error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({
            title: t('auth.accountExists'),
            description: t('auth.accountExistsDesc'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.signUpFailed'),
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
        title: t('businessAuth.accountCreated'),
        description: t('businessAuth.welcomeToDashboard'),
      });

      navigate('/business');
    } catch (error: any) {
      toast({
        title: t('businessAuth.setupFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsSigningUp(false);
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

  const handleAnalyzeWebsite = async () => {
    if (!website.trim()) {
      toast({
        title: t('businessAuth.websiteRequired'),
        description: t('businessAuth.enterWebsiteFirst'),
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-business-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: website, language: i18n.language }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      const data = result.data;

      // Auto-fill form fields
      if (data.description) {
        setDescription(data.description);
      }
      if (data.productsServices) {
        setProductsServices(data.productsServices);
      }
      if (data.country && COUNTRIES.includes(data.country)) {
        setCountry(data.country);
      }
      if (data.audienceTypes && Array.isArray(data.audienceTypes)) {
        const validTypes = data.audienceTypes.filter((t: string) => AUDIENCE_TYPES.includes(t));
        if (validTypes.length > 0) {
          setAudienceTypes(validTypes);
        }
      }
      if (data.audienceDescription) {
        setAudienceDescription(data.audienceDescription);
      }
      if (data.ageRanges && Array.isArray(data.ageRanges)) {
        const validAges = data.ageRanges.filter((a: string) => AGE_RANGES.includes(a));
        if (validAges.length > 0) {
          setAgeRanges(validAges);
        }
      }

      toast({
        title: t('businessAuth.websiteAnalyzed'),
        description: t('businessAuth.formAutoFilled'),
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: t('businessAuth.analysisFailed'),
        description: error instanceof Error ? error.message : t('businessAuth.couldNotAnalyze'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  // Check if we should show the company name header (after first step)
  const showCompanyHeader = step !== 'company-name' && step !== 'login' && companyName;

  const renderStepContent = () => {
    if (isTransitioning) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      );
    }

    switch (step) {
      case 'company-name': {
        const textToMeasure = companyName || typewriterText || 'company name';
        const underlineWidth = Math.max(textToMeasure.length * 2, 26);
        return (
          <div className="flex flex-col items-center justify-center min-h-screen px-6">
            {!showNameInput ? (
              <div className="animate-spin">
                <Loader2 className="h-8 w-8 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-8 animate-fade-in">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-5xl md:text-7xl font-bold font-montserrat text-foreground whitespace-nowrap">{t('businessAuth.hello')}</h1>
                  <div className="relative" style={{ width: '220px' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onKeyDown={handleCompanyNameKeyDown}
                      placeholder=""
                      className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-medium font-montserrat text-foreground pb-1 whitespace-nowrap"
                    />
                    {!companyName && (
                      <span className="absolute left-0 top-0 text-2xl md:text-3xl font-medium font-montserrat text-muted-foreground/50 pointer-events-none whitespace-nowrap">
                        {typewriterText}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={goNext} 
                  className={`rounded-full px-8 font-montserrat transition-opacity duration-300 ${companyName.trim() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  {t('common.continue')}
                </Button>
              </div>
            )}
          </div>
        );
      }

      case 'your-company': {
        const SOCIAL_PLATFORMS = [
          { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourcompany' },
          { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourcompany' },
          { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourcompany' },
          { id: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/yourcompany' },
          { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
          { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourcompany' },
          { id: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/yourcompany' },
          { id: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/yourcompany' },
        ];

        const activePlatforms = Object.keys(socialMedia);
        const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !activePlatforms.includes(p.id));

        const addPlatform = (platformId: string) => {
          setSocialMedia(prev => ({ ...prev, [platformId]: '' }));
        };

        const removePlatform = (platformId: string) => {
          setSocialMedia(prev => {
            const newState = { ...prev };
            delete newState[platformId];
            return newState;
          });
        };

        const updatePlatformUrl = (platformId: string, url: string) => {
          setSocialMedia(prev => ({ ...prev, [platformId]: url }));
        };

        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12 animate-fade-in overflow-y-auto">
            <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-left w-full">
                {t('businessAuth.whoIs')} {companyName}?
              </h2>
              
              <div className="w-full space-y-6">
                {/* Website */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.website')}</Label>
                  <Input
                    type="url"
                    placeholder={t('businessAuth.websitePlaceholder')}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                    autoFocus
                  />
                </div>

                {/* Social Media - faded until website filled */}
                <div
                  className={`space-y-4 transition-opacity duration-300 ${!website.trim() ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                >
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.wereAlsoOn')}</Label>
                  
                  {/* Active platforms */}
                  <div className="space-y-3">
                    {activePlatforms.map(platformId => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
                      if (!platform) return null;
                      return (
                        <div key={platformId} className="flex items-center gap-2">
                          <div className="w-24 text-sm font-geist text-foreground">{platform.label}</div>
                          <Input
                            type="url"
                            placeholder={platform.placeholder}
                            value={socialMedia[platformId]}
                            onChange={(e) => updatePlatformUrl(platformId, e.target.value)}
                            className="flex-1 bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removePlatform(platformId)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add platform dropdown */}
                  {availablePlatforms.length > 0 && (
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addPlatform(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-foreground/20 font-geist text-sm rounded-[3px] focus:outline-none focus:border-foreground text-muted-foreground cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled className="bg-white dark:bg-zinc-800">{t('businessAuth.addSocialPlatform')}</option>
                        {availablePlatforms.map(platform => (
                          <option key={platform.id} value={platform.id} className="bg-white dark:bg-zinc-800 text-foreground">
                            {platform.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                  {t('common.back')}
                </Button>
                <Button 
                  onClick={() => setShowAiDialog(true)} 
                  disabled={!website.trim()}
                  className={`flex-1 rounded-full font-montserrat transition-opacity duration-300 ${!website.trim() ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                >
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          </div>
        );
      }

      case 'company-description':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12 animate-fade-in overflow-y-auto">
            <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-left w-full min-h-[2.5rem] md:min-h-[3rem]">
                {descriptionTypewriter}
              </h2>
              
              <div className="w-full space-y-6">
                {/* Short description */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.shortDescription')}</Label>
                  <Textarea
                    placeholder={t('businessAuth.descriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[40px] p-3 bg-white dark:bg-white/10 border border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist text-sm focus:outline-none focus:border-foreground resize-none field-sizing-content"
                    style={{ fieldSizing: 'content' } as React.CSSProperties}
                    autoFocus
                  />
                </div>

                {/* Location - faded until description is filled */}
                <div
                  className={`space-y-2 transition-opacity duration-300 ${!description.trim() ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'opacity-100'}`}
                  aria-disabled={!description.trim()}
                >
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.whereAreYouBased')}</Label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    tabIndex={!description.trim() ? -1 : 0}
                    className={`w-full h-10 px-3 bg-white dark:bg-white/10 border border-foreground/20 font-geist text-sm rounded-[3px] focus:outline-none focus:border-foreground ${!country ? 'text-muted-foreground/50' : 'text-foreground'}`}
                  >
                    <option value="" className="bg-white dark:bg-background text-muted-foreground/50">{t('businessAuth.selectCountry')}</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-background text-foreground">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                  {t('common.back')}
                </Button>
                <Button 
                  onClick={goNext} 
                  disabled={!description.trim() || !country}
                  className={`flex-1 rounded-full font-montserrat transition-opacity duration-300 ${!description.trim() || !country ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                >
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12 animate-fade-in overflow-y-auto">
            <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-left w-full">
                {t('businessAuth.productsServicesTitle')}
              </h2>
              
              <div className="w-full space-y-6">
                <Textarea
                  placeholder={t('businessAuth.productsServicesPlaceholder')}
                  value={productsServices}
                  onChange={(e) => setProductsServices(e.target.value)}
                  className="w-full min-h-[120px] bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] resize-none font-geist"
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                  autoFocus
                />
              </div>

              <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                  {t('common.back')}
                </Button>
                <Button 
                  onClick={goNext} 
                  disabled={!productsServices.trim()}
                  className={`flex-1 rounded-full font-montserrat transition-opacity duration-300 ${!productsServices.trim() ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                >
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12 animate-fade-in">
            <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto space-y-6 overflow-y-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-center">
                {t('businessAuth.whosYourAudience')}
              </h2>
              
              {/* Audience Description Textbox */}
              <div className="w-full space-y-2">
                <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.describeAudience')}</Label>
                <Textarea
                  placeholder={t('businessAuth.audienceDescriptionPlaceholder')}
                  value={audienceDescription}
                  onChange={(e) => setAudienceDescription(e.target.value)}
                  className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist min-h-[80px] resize-none"
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
              </div>

              {/* Age Ranges - faded until description filled */}
              <div className={`w-full space-y-3 transition-opacity duration-300 ${!audienceDescription.trim() ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.targetAgeRange')}</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => toggleArrayItem(ageRanges, setAgeRanges, age)}
                      className={`px-4 py-2 text-sm font-geist transition-all rounded-[3px] ${
                        ageRanges.includes(age)
                          ? 'bg-foreground text-background'
                          : 'bg-white dark:bg-white/10 border border-foreground/20 hover:border-foreground/50 text-foreground'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Geographic Reach - faded until age ranges selected */}
              <div className={`w-full space-y-3 transition-opacity duration-300 ${ageRanges.length === 0 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.geographicReach')}</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGlobalReach('worldwide')}
                    className={`flex-1 p-3 text-sm font-geist transition-all rounded-[3px] ${
                      globalReach === 'worldwide'
                        ? 'bg-foreground text-background'
                        : 'bg-white dark:bg-white/10 border border-foreground/20 hover:border-foreground/50 text-foreground'
                    }`}
                  >
                    {t('businessAuth.worldwide')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlobalReach('specific')}
                    className={`flex-1 p-3 text-sm font-geist transition-all rounded-[3px] ${
                      globalReach === 'specific'
                        ? 'bg-foreground text-background'
                        : 'bg-white dark:bg-white/10 border border-foreground/20 hover:border-foreground/50 text-foreground'
                    }`}
                  >
                    {t('businessAuth.specificCountries')}
                  </button>
                </div>
                
                {globalReach === 'specific' && (
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto mt-2">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayItem(targetCountries, setTargetCountries, c)}
                        className={`p-2 text-left text-sm font-geist transition-all rounded-[3px] ${
                          targetCountries.includes(c)
                            ? 'bg-foreground text-background'
                            : 'bg-white dark:bg-white/10 border border-foreground/20 hover:border-foreground/50 text-foreground'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 w-full pt-4">
                <Button variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                  {t('common.back')}
                </Button>
                <Button 
                  onClick={goNext} 
                  disabled={!audienceDescription.trim() || audienceTypes.length === 0 || ageRanges.length === 0}
                  className={`flex-1 rounded-full font-montserrat transition-opacity duration-300 ${!audienceDescription.trim() || audienceTypes.length === 0 || ageRanges.length === 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                >
                  {t('common.continue')}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'credentials':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12 animate-fade-in">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-center">
                {t('businessAuth.createAccountTitle')}
              </h2>
              <p className="text-muted-foreground text-center font-montserrat">{t('businessAuth.almostDone')}</p>
              
              <form onSubmit={handleFinalSubmit} className="w-full space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.yourName')}</Label>
                  <Input
                    type="text"
                    placeholder={t('businessAuth.yourNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                  />
                </div>
                {/* Email - faded until name filled */}
                <div className={`space-y-2 transition-opacity duration-300 ${!fullName.trim() ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.workEmail')}</Label>
                  <Input
                    type="email"
                    placeholder={t('businessAuth.workEmailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    tabIndex={!fullName.trim() ? -1 : 0}
                    className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                  />
                </div>
                {/* Password - faded until email filled */}
                <div className={`space-y-2 transition-opacity duration-300 ${!email.trim() ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('auth.password')}</Label>
                  <Input
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    tabIndex={!email.trim() ? -1 : 0}
                    className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                  />
                </div>
                
                <div className="flex gap-4 w-full pt-4">
                  <Button type="button" variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                    {t('common.back')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !fullName.trim() || !email.trim() || !password.trim()}
                    className={`flex-1 rounded-full font-montserrat transition-opacity duration-300 ${!fullName.trim() || !email.trim() || !password.trim() ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                  >
                    {isLoading ? t('businessAuth.creating') : t('businessAuth.completeSetup')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'login':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
            <div className="w-full max-w-md space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-center">
                {t('businessAuth.businessLogin')}
              </h2>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('auth.email')}</Label>
                  <Input
                    type="email"
                    placeholder={t('businessAuth.workEmailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">{t('auth.password')}</Label>
                  <Input
                    type="password"
                    placeholder={t('auth.passwordPlaceholderLogin')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full font-montserrat" disabled={isLoading}>
                  {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                </Button>
                <p className="text-center text-muted-foreground text-sm mt-4 font-montserrat">
                  {t('businessAuth.dontHaveBusinessAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setStep('company-name')}
                    className="text-foreground underline hover:text-foreground/80 font-montserrat"
                  >
                    {t('businessAuth.createOne')}
                  </button>
                </p>
              </form>
            </div>
          </div>
        );
    }
  };

  const getStepLabel = (s: Step) => {
    const labels: Record<Step, string> = {
      'company-name': t('businessAuth.stepCompanyName'),
      'your-company': t('businessAuth.stepYourCompany'),
      'company-description': t('businessAuth.stepDescription'),
      'products': t('businessAuth.stepProducts'),
      'audience': t('businessAuth.stepAudience'),
      'credentials': t('businessAuth.stepAccount'),
      'login': t('businessAuth.stepLogin')
    };
    return labels[s];
  };

  const canNavigateToStep = (targetStep: Step) => {
    if (step === 'login') return false;
    const targetIndex = ALL_STEPS.indexOf(targetStep);
    // Can navigate to any step up to the highest reached
    return targetIndex <= highestStepReached;
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
          {t('businessAuth.devMode')}
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

      {/* Left sidebar - step navigation (hidden on login and first hello page) */}
      {step !== 'login' && step !== 'company-name' && (
        <div className="fixed left-[15%] top-1/2 -translate-y-1/2 z-40 hidden md:block">
          <div className="flex flex-col gap-4">
            {ALL_STEPS.map((s, i) => {
              const isCurrent = step === s;
              const isVisited = i <= highestStepReached;
              const canClick = canNavigateToStep(s);
              
              return (
                <button
                  key={s}
                  onClick={() => canClick && setStep(s)}
                  disabled={!canClick}
                  className={`flex items-center gap-3 text-left transition-all group ${
                    canClick ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className={`w-3 h-3 transition-all ${
                    isVisited 
                      ? 'bg-foreground' 
                      : 'border border-foreground/30 bg-transparent'
                  } ${isCurrent ? 'scale-110' : ''}`} />
                  <span className={`text-sm font-montserrat transition-all ${
                    isCurrent 
                      ? 'text-foreground font-medium' 
                      : isVisited 
                        ? 'text-foreground/60 group-hover:text-foreground/80' 
                        : 'text-foreground/30'
                  }`}>
                    {getStepLabel(s)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* Progress indicator - mobile only */}
      {step !== 'login' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 md:hidden">
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
      
      <div className="relative z-10" key={step}>
        {renderStepContent()}
      </div>

      {/* AI Automate Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-2xl min-h-[380px] rounded-none flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-2xl">
              {i18n.language === 'sv' ? 'Låt AI fylla i formuläret' : 'Let AI fill out this form'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              {i18n.language === 'sv' 
                ? 'Gå igenom det efteråt för att se att allt stämmer.' 
                : 'Go through it to see if everything is correct.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-auto pb-2">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="dialog-terms" 
                checked={dialogTermsAccepted}
                onCheckedChange={(checked) => setDialogTermsAccepted(checked === true)}
                className="h-3 w-3 rounded-none"
              />
              <Label 
                htmlFor="dialog-terms" 
                className="text-xs text-muted-foreground font-geist cursor-pointer"
              >
                {i18n.language === 'sv' 
                  ? 'Jag godkänner användarvillkoren och integritetspolicyn' 
                  : 'I agree to the Terms of Service and Privacy Policy'}
              </Label>
            </div>
            <div className="space-y-3">
              <Label className="text-muted-foreground text-base font-montserrat">
                {t('businessAuth.websiteOptional')}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder={t('businessAuth.websitePlaceholder')}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setShowAiDialog(false);
                    handleAnalyzeWebsite();
                  }}
                  disabled={isAnalyzing || !website.trim() || !dialogTermsAccepted}
                  className="rounded-[3px] bg-foreground text-background font-montserrat gap-2 border-0 hover:opacity-90 whitespace-nowrap"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('businessAuth.analyzing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t('businessAuth.automate')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessAuth;
