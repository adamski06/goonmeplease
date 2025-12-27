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
import { Sparkles, Loader2 } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type Step = 'company-name' | 'company-description' | 'products' | 'audience' | 'credentials' | 'login';

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

const AUDIENCE_TYPES = [
  'Students', 'Young Professionals', 'Parents', 'Gamers', 'Fitness Enthusiasts',
  'Tech Enthusiasts', 'Fashion Lovers', 'Foodies', 'Travelers', 'Entrepreneurs',
  'Artists/Creatives', 'Music Lovers', 'Sports Fans', 'Eco-Conscious', 'Luxury Seekers'
];

const ALL_STEPS: Step[] = ['company-name', 'company-description', 'products', 'audience', 'credentials'];

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
  const [audienceDescription, setAudienceDescription] = useState('');
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [globalReach, setGlobalReach] = useState<'worldwide' | 'specific'>('worldwide');
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [audienceTypes, setAudienceTypes] = useState<string[]>([]);
  
  // Final data
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [highestStepReached, setHighestStepReached] = useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Animate name input after 1 second on company-name step with cycling typewriter effect
  useEffect(() => {
    if (step === 'company-name') {
      setShowNameInput(false);
      setTypewriterText('');
      
      const companyNames = [
        'Acme Corp',
        'TechFlow',
        'Bright Ideas',
        'Nova Labs',
        'Spark Studio',
        'Blue Horizon',
        'Pixel Perfect',
        'Swift Solutions'
      ];
      
      let nameIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let typeTimer: ReturnType<typeof setInterval>;
      
      const showTimer = setTimeout(() => {
        setShowNameInput(true);
        setTimeout(() => inputRef.current?.focus(), 100);
        
        typeTimer = setInterval(() => {
          const currentName = companyNames[nameIndex];
          
          if (!isDeleting) {
            // Typing
            if (charIndex <= currentName.length) {
              setTypewriterText(currentName.slice(0, charIndex));
              charIndex++;
            } else {
              // Pause at end before deleting
              setTimeout(() => {
                isDeleting = true;
              }, 1500);
            }
          } else {
            // Deleting
            if (charIndex > 0) {
              charIndex--;
              setTypewriterText(currentName.slice(0, charIndex));
            } else {
              // Move to next name
              isDeleting = false;
              nameIndex = (nameIndex + 1) % companyNames.length;
            }
          }
        }, 100);
      }, 1000);
      
      return () => {
        clearTimeout(showTimer);
        if (typeTimer) clearInterval(typeTimer);
      };
    }
  }, [step]);

  // Track highest step reached
  useEffect(() => {
    const currentIndex = ALL_STEPS.indexOf(step as Step);
    if (currentIndex > highestStepReached && step !== 'login') {
      setHighestStepReached(currentIndex);
    }
  }, [step, highestStepReached]);

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

  const handleAnalyzeWebsite = async () => {
    if (!website.trim()) {
      toast({
        title: 'Website required',
        description: 'Please enter a website URL first.',
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
        body: JSON.stringify({ url: website }),
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

      toast({
        title: 'Website analyzed!',
        description: 'Form fields have been auto-filled. Review and adjust as needed.',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Could not analyze website',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
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
      case 'company-name': {
        const textToMeasure = companyName || typewriterText || 'company name';
        const underlineWidth = Math.max(textToMeasure.length * 2, 26);
        return (
          <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
            <div className="flex flex-col items-center space-y-8">
              <div className="flex items-baseline gap-3">
                <h1 className="text-5xl md:text-7xl font-bold font-montserrat text-foreground whitespace-nowrap animate-fade-in">Hello</h1>
                <div className="relative" style={{ width: '220px' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onKeyDown={handleCompanyNameKeyDown}
                    placeholder=""
                    className={`w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-medium font-montserrat text-foreground pb-1 whitespace-nowrap transition-opacity duration-300 ${showNameInput ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {!companyName && showNameInput && (
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
                Continue
              </Button>
            </div>
          </div>
        );
      }

      case 'company-description':
        return (
          <div className="flex flex-col min-h-screen px-6 pt-32 pb-12 animate-fade-in overflow-y-auto">
            <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground text-left w-full">
                Tell us about <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent">{companyName}</span>
              </h2>
              
              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">Short description</Label>
                  <Textarea
                    placeholder="We're a company that..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none resize-none text-base font-montserrat"
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">Website (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none font-montserrat flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAnalyzeWebsite}
                      disabled={isAnalyzing || !website.trim()}
                      className="border-foreground/20 hover:bg-foreground/10 font-montserrat gap-2 whitespace-nowrap"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Automate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground text-sm font-montserrat">Where are you based?</Label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 bg-transparent border border-foreground/20 text-foreground font-montserrat text-sm focus:outline-none focus:border-foreground/50"
                  >
                    <option value="" className="bg-background text-foreground">Select a country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-background text-foreground">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full font-montserrat">
                  Continue
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
                Tell us more about your product/service
              </h2>
              
              <div className="w-full space-y-6">
                <Textarea
                  placeholder="We offer premium fitness apparel, supplements, and workout programs..."
                  value={productsServices}
                  onChange={(e) => setProductsServices(e.target.value)}
                  rows={5}
                  className="w-full bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none resize-none text-lg font-montserrat"
                  autoFocus
                />
              </div>

              <div className="flex gap-4 w-full">
                <Button variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full font-montserrat">
                  Continue
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
                Who's your audience?
              </h2>
              
              {/* Audience Description Textbox */}
              <div className="w-full space-y-2">
                <Label className="text-muted-foreground text-sm font-montserrat">Describe your target audience</Label>
                <Textarea
                  placeholder="E.g., Health-conscious millennials interested in sustainable living, busy professionals looking for quick meal solutions..."
                  value={audienceDescription}
                  onChange={(e) => setAudienceDescription(e.target.value)}
                  className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none font-montserrat min-h-[80px] resize-none"
                />
              </div>

              {/* Audience Types */}
              <div className="w-full space-y-3">
                <Label className="text-muted-foreground text-sm font-montserrat">Audience Types</Label>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem(audienceTypes, setAudienceTypes, type)}
                      className={`px-3 py-1.5 text-xs font-montserrat transition-all ${
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

              {/* Age Ranges */}
              <div className="w-full space-y-3">
                <Label className="text-muted-foreground text-sm font-montserrat">Target Age Range</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => toggleArrayItem(ageRanges, setAgeRanges, age)}
                      className={`px-4 py-2 text-sm font-montserrat transition-all ${
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
                <Label className="text-muted-foreground text-sm font-montserrat">Geographic Reach</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGlobalReach('worldwide')}
                    className={`flex-1 p-3 text-sm font-montserrat transition-all ${
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
                    className={`flex-1 p-3 text-sm font-montserrat transition-all ${
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
                        className={`p-2 text-left text-xs font-montserrat transition-all ${
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

              <div className="flex gap-4 w-full pt-4">
                <Button variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                  Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full font-montserrat">
                  Continue
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
                Create your account
              </h2>
              <p className="text-muted-foreground text-center font-montserrat">Almost done! Set up your login credentials</p>
              
              <form onSubmit={handleFinalSubmit} className="w-full space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">Your Name</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none font-montserrat"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">Work Email</Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none font-montserrat"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">Password</Label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none font-montserrat"
                  />
                </div>
                
                <div className="flex gap-4 w-full pt-4">
                  <Button type="button" variant="ghost" onClick={goBack} className="flex-1 font-montserrat">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full font-montserrat" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Complete Setup'}
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
                Business Login
              </h2>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none font-montserrat"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-montserrat">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-transparent border-foreground/20 text-foreground placeholder:text-muted-foreground/50 rounded-none font-montserrat"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full font-montserrat" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                <p className="text-center text-muted-foreground text-sm mt-4 font-montserrat">
                  Don't have a business account?{' '}
                  <button
                    type="button"
                    onClick={() => setStep('company-name')}
                    className="text-foreground underline hover:text-foreground/80 font-montserrat"
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

  const STEP_LABELS: Record<Step, string> = {
    'company-name': 'Company Name',
    'company-description': 'Description',
    'products': 'Products',
    'audience': 'Audience',
    'credentials': 'Account',
    'login': 'Login'
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
                    {STEP_LABELS[s]}
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
    </div>
  );
};

export default BusinessAuth;
