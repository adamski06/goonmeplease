import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2, X, Send } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

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

type ChatStep = 'website' | 'socials' | 'description' | 'location' | 'products' | 'audience' | 'age-range' | 'reach' | 'credentials' | 'complete';

interface ChatMessage {
  id: string;
  role: 'jarla' | 'user';
  content: string;
  type?: 'text' | 'social-picker' | 'country-picker' | 'age-picker' | 'reach-picker' | 'credentials-form';
}

const BusinessAuth: React.FC = () => {
  const [mode, setMode] = useState<'intro' | 'chat' | 'login'>('intro');
  const [companyName, setCompanyName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatStep, setChatStep] = useState<ChatStep>('website');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Collected data
  const [website, setWebsite] = useState('');
  const [socialMedia, setSocialMedia] = useState<Record<string, string>>({});
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [audienceDescription, setAudienceDescription] = useState('');
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [globalReach, setGlobalReach] = useState<'worldwide' | 'specific'>('worldwide');
  const [targetCountries, setTargetCountries] = useState<string[]>([]);

  // Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [devMode, setDevMode] = useState(false);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus chat input when entering chat mode
  useEffect(() => {
    if (mode === 'chat' && chatStep === 'website') {
      setTimeout(() => chatInputRef.current?.focus(), 500);
    }
  }, [mode, chatStep]);

  // Typewriter effect for intro
  useEffect(() => {
    if (mode === 'intro') {
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
  }, [mode, i18n.language]);

  // Add Jarla message with typing effect
  const addJarlaMessage = (content: string, type: ChatMessage['type'] = 'text') => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'jarla',
        content,
        type
      }]);
      setIsTyping(false);
    }, 800);
  };

  // Start chat after company name
  const startChat = () => {
    if (!companyName.trim()) return;
    setMode('chat');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv' 
          ? `Trevligt att träffas, ${companyName}! Vad är er webbadress?`
          : `Nice to meet you, ${companyName}! What's your website?`
      );
    }, 300);
  };

  // Handle user sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim() && chatStep !== 'socials') return;

    const userMessage = inputValue.trim();
    
    if (userMessage) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage
      }]);
    }
    
    setInputValue('');

    // Process based on current step
    switch (chatStep) {
      case 'website':
        setWebsite(userMessage);
        setChatStep('socials');
        setTimeout(() => {
          addJarlaMessage(
            i18n.language === 'sv'
              ? 'Finns ni på några sociala medier?'
              : 'Are you on any social media?',
            'social-picker'
          );
        }, 500);
        break;

      case 'description':
        setDescription(userMessage);
        setChatStep('location');
        setTimeout(() => {
          addJarlaMessage(
            i18n.language === 'sv'
              ? 'Var är ni baserade?'
              : 'Where are you based?',
            'country-picker'
          );
        }, 500);
        break;

      case 'products':
        setProductsServices(userMessage);
        setChatStep('audience');
        setTimeout(() => {
          addJarlaMessage(
            i18n.language === 'sv'
              ? 'Beskriv er målgrupp - vilka är era kunder?'
              : 'Describe your target audience - who are your customers?'
          );
        }, 500);
        break;

      case 'audience':
        setAudienceDescription(userMessage);
        setChatStep('age-range');
        setTimeout(() => {
          addJarlaMessage(
            i18n.language === 'sv'
              ? 'Vilka åldersgrupper riktar ni er mot?'
              : 'Which age groups are you targeting?',
            'age-picker'
          );
        }, 500);
        break;
    }
  };

  // Handle social media step completion
  const handleSocialsComplete = () => {
    const socialCount = Object.keys(socialMedia).filter(k => socialMedia[k]).length;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: socialCount > 0 
        ? `${socialCount} ${i18n.language === 'sv' ? 'plattformar tillagda' : 'platforms added'}`
        : i18n.language === 'sv' ? 'Inga sociala medier' : 'No social media'
    }]);
    setChatStep('description');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv'
          ? `Berätta kort om ${companyName} - vad gör ni?`
          : `Tell me briefly about ${companyName} - what do you do?`
      );
    }, 500);
  };

  // Handle country selection
  const handleCountrySelect = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: selectedCountry
    }]);
    setChatStep('products');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv'
          ? 'Vilka produkter eller tjänster erbjuder ni?'
          : 'What products or services do you offer?'
      );
    }, 500);
  };

  // Handle age range selection complete
  const handleAgeRangeComplete = () => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: ageRanges.join(', ')
    }]);
    setChatStep('reach');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv'
          ? 'Verkar ni globalt eller i specifika länder?'
          : 'Do you operate globally or in specific countries?',
        'reach-picker'
      );
    }, 500);
  };

  // Handle reach selection complete
  const handleReachComplete = () => {
    const reachText = globalReach === 'worldwide' 
      ? (i18n.language === 'sv' ? 'Världsomspännande' : 'Worldwide')
      : targetCountries.join(', ');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: reachText
    }]);
    setChatStep('credentials');
    setTimeout(() => {
      addJarlaMessage(
        i18n.language === 'sv'
          ? 'Perfekt! Nu behöver vi bara skapa ditt konto.'
          : "Perfect! Now we just need to create your account.",
        'credentials-form'
      );
    }, 500);
  };

  // Handle final submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('auth.validationError'),
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      return;
    }

    setIsLoading(true);
    setIsSigningUp(true);

    try {
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

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const currentUserId = session.session.user.id;

      const fullDescription = [
        description,
        productsServices ? `Products/Services: ${productsServices}` : '',
        ageRanges.length ? `Target Age: ${ageRanges.join(', ')}` : '',
        globalReach === 'worldwide' ? 'Reach: Worldwide' : `Reach: ${targetCountries.join(', ')}`,
        audienceDescription ? `Audience: ${audienceDescription}` : ''
      ].filter(Boolean).join('\n\n');

      const { error: profileError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: currentUserId,
          company_name: companyName,
          description: fullDescription || null,
          website: website || null,
        });

      if (profileError) throw profileError;

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

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('auth.validationError'),
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      return;
    }

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

  // Check if user is already logged in
  useEffect(() => {
    if (!loading && user && !devMode && !isSigningUp) {
      const checkBusinessRole = async () => {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const hasBusiness = roles?.some(r => r.role === 'business');
        if (hasBusiness) {
          navigate('/business');
        }
      };
      checkBusinessRole();
    }
  }, [user, loading, devMode, isSigningUp, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  // Render social media picker
  const renderSocialPicker = () => {
    const activePlatforms = Object.keys(socialMedia);
    const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !activePlatforms.includes(p.id));

    return (
      <div className="space-y-3 mt-2">
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
                onChange={(e) => setSocialMedia(prev => ({ ...prev, [platformId]: e.target.value }))}
                className="flex-1 bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setSocialMedia(prev => {
                    const newState = { ...prev };
                    delete newState[platformId];
                    return newState;
                  });
                }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        {availablePlatforms.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                setSocialMedia(prev => ({ ...prev, [e.target.value]: '' }));
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
        )}

        <Button 
          onClick={handleSocialsComplete}
          className="w-full rounded-[3px] font-montserrat mt-2"
        >
          {t('common.continue')}
        </Button>
      </div>
    );
  };

  // Render country picker
  const renderCountryPicker = () => (
    <select
      value={country}
      onChange={(e) => handleCountrySelect(e.target.value)}
      className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-foreground/20 font-geist text-sm rounded-[3px] focus:outline-none focus:border-foreground text-muted-foreground cursor-pointer mt-2"
    >
      <option value="" disabled className="bg-white dark:bg-zinc-800">{t('businessAuth.selectCountry')}</option>
      {COUNTRIES.map((c) => (
        <option key={c} value={c} className="bg-white dark:bg-zinc-800 text-foreground">
          {c}
        </option>
      ))}
    </select>
  );

  // Render age picker
  const renderAgePicker = () => (
    <div className="space-y-3 mt-2">
      <div className="flex flex-wrap gap-2">
        {AGE_RANGES.map((age) => (
          <button
            key={age}
            type="button"
            onClick={() => {
              if (ageRanges.includes(age)) {
                setAgeRanges(ageRanges.filter(a => a !== age));
              } else {
                setAgeRanges([...ageRanges, age]);
              }
            }}
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
      <Button 
        onClick={handleAgeRangeComplete}
        disabled={ageRanges.length === 0}
        className="w-full rounded-[3px] font-montserrat"
      >
        {t('common.continue')}
      </Button>
    </div>
  );

  // Render reach picker
  const renderReachPicker = () => (
    <div className="space-y-3 mt-2">
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
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                if (targetCountries.includes(c)) {
                  setTargetCountries(targetCountries.filter(tc => tc !== c));
                } else {
                  setTargetCountries([...targetCountries, c]);
                }
              }}
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

      <Button 
        onClick={handleReachComplete}
        disabled={globalReach === 'specific' && targetCountries.length === 0}
        className="w-full rounded-[3px] font-montserrat"
      >
        {t('common.continue')}
      </Button>
    </div>
  );

  // Render credentials form
  const renderCredentialsForm = () => (
    <form onSubmit={handleFinalSubmit} className="space-y-4 mt-2">
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
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm font-montserrat">{t('businessAuth.workEmail')}</Label>
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
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox 
          id="terms" 
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="h-4 w-4 rounded-none"
        />
        <Label 
          htmlFor="terms" 
          className="text-xs text-muted-foreground font-geist cursor-pointer"
        >
          {t('businessAuth.agreeToTerms')}
        </Label>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || !fullName.trim() || !email.trim() || !password.trim() || !termsAccepted}
        className="w-full rounded-[3px] font-montserrat"
      >
        {isLoading ? t('businessAuth.creating') : t('businessAuth.completeSetup')}
      </Button>
    </form>
  );

  // Login screen
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 grainy-background" />
        <div className="noise-layer" />
        
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

        <div className="relative z-10 flex flex-col min-h-screen px-6 py-12 justify-center">
          <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-center">
              {t('businessAuth.businessLogin')}
            </h2>
            
            <form onSubmit={handleLogin} className="w-full space-y-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-montserrat">{t('auth.email')}</Label>
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
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
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full rounded-full font-montserrat"
              >
                {isLoading ? t('common.loading') : t('auth.login')}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground font-geist">
              {t('businessAuth.dontHaveBusinessAccount')}{' '}
              <button
                onClick={() => setMode('intro')}
                className="text-foreground hover:underline font-medium"
              >
                {t('businessAuth.createOne')}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dev mode toggle */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setDevMode(!devMode)}
          className={`px-3 py-1 text-xs rounded-full transition-all ${
            devMode ? 'bg-green-500 text-white' : 'bg-foreground/20 text-foreground/60 hover:bg-foreground/30'
          }`}
        >
          Dev Mode
        </button>
        <button
          onClick={() => setMode('login')}
          className="px-3 py-1 text-xs rounded-full bg-foreground/20 text-foreground/60 hover:bg-foreground/30"
        >
          Login
        </button>
      </div>

      <div className="absolute inset-0 grainy-background" />
      <div className="noise-layer" />
      
      {/* Logo */}
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

      <div className="relative z-10">
        {mode === 'intro' ? (
          // Intro screen - company name input
          <div className="flex flex-col items-center justify-center min-h-screen px-6">
            {!showNameInput ? (
              <div className="animate-spin">
                <Loader2 className="h-8 w-8 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-8 animate-fade-in">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-5xl md:text-7xl font-bold font-montserrat text-foreground whitespace-nowrap">
                    {t('businessAuth.hello')}
                  </h1>
                  <div className="relative" style={{ width: '220px' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && companyName.trim()) {
                          e.preventDefault();
                          startChat();
                        }
                      }}
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
                  onClick={startChat} 
                  className={`rounded-full px-8 font-montserrat transition-opacity duration-300 ${companyName.trim() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  {t('common.continue')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Chat interface - centered layout
          <div className="flex flex-col min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-lg space-y-6 animate-fade-in">
              {/* Current question - centered */}
              {messages.length > 0 && messages[messages.length - 1].role === 'jarla' && !isTyping && (
                <div className="text-center space-y-1">
                  <div className="text-xs text-muted-foreground font-montserrat">Jarla</div>
                  <p className="text-xl md:text-2xl font-medium font-montserrat text-foreground">
                    {messages[messages.length - 1].content}
                  </p>
                </div>
              )}

              {isTyping && (
                <div className="text-center space-y-2">
                  <div className="text-xs text-muted-foreground font-montserrat">Jarla</div>
                  <div className="flex justify-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Input area directly below */}
              {!isTyping && messages.length > 0 && (
                <div className="space-y-4">
                  {/* Text input for website, description, products, audience */}
                  {['website', 'description', 'products', 'audience'].includes(chatStep) && (
                    <div className="space-y-4">
                      <Input
                        ref={chatInputRef}
                        type={chatStep === 'website' ? 'url' : 'text'}
                        placeholder={
                          chatStep === 'website' 
                            ? 'https://yourcompany.com'
                            : i18n.language === 'sv' ? 'Skriv ditt svar...' : 'Type your answer...'
                        }
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && inputValue.trim()) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="w-full bg-white dark:bg-white/10 border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-[3px] font-geist"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="w-full rounded-full font-montserrat"
                      >
                        {t('common.continue')}
                      </Button>
                    </div>
                  )}

                  {/* Social picker */}
                  {chatStep === 'socials' && messages[messages.length - 1].type === 'social-picker' && renderSocialPicker()}

                  {/* Country picker */}
                  {chatStep === 'location' && messages[messages.length - 1].type === 'country-picker' && renderCountryPicker()}

                  {/* Age picker */}
                  {chatStep === 'age-range' && messages[messages.length - 1].type === 'age-picker' && renderAgePicker()}

                  {/* Reach picker */}
                  {chatStep === 'reach' && messages[messages.length - 1].type === 'reach-picker' && renderReachPicker()}

                  {/* Credentials form */}
                  {chatStep === 'credentials' && messages[messages.length - 1].type === 'credentials-form' && renderCredentialsForm()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAuth;
