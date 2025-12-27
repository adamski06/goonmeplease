import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Upload, X, Building2, ArrowRight, ArrowLeft, Globe, Users, Package, MapPin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const companyNameSchema = z.string().min(1, 'Company name is required').max(100, 'Company name too long');
const websiteSchema = z.string().url('Please enter a valid URL').optional().or(z.literal(''));
const descriptionSchema = z.string().max(500, 'Description too long').optional();

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Logo must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
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

      const userId = session.session.user.id;
      let logoUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('business-logos')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('business-logos')
          .getPublicUrl(filePath);

        logoUrl = urlData.publicUrl;
      }

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
          user_id: userId,
          company_name: companyName,
          logo_url: logoUrl,
          description: fullDescription || null,
          website: website || null,
        });

      if (profileError) throw profileError;

      // Add business role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 'company-name':
        return (
          <>
            <CardHeader className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Building2 className="w-12 h-12 text-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">What's your company name?</CardTitle>
              <p className="text-muted-foreground mt-2">Let's start with the basics</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-foreground">Company Name</Label>
                <Input
                  id="company-name"
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none text-lg py-6"
                  autoFocus
                />
              </div>
              
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-foreground">Company Logo (optional)</Label>
                {logoPreview ? (
                  <div className="relative w-24 h-24 mx-auto">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-foreground/50 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">Upload logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <Button 
                onClick={goNext} 
                className="w-full rounded-full" 
                disabled={!companyName.trim()}
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              
              <p className="text-center text-muted-foreground text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-foreground underline hover:text-foreground/80"
                >
                  Sign in
                </button>
              </p>
            </CardContent>
          </>
        );

      case 'company-description':
        return (
          <>
            <CardHeader className="text-center py-8">
              <CardTitle className="text-3xl font-bold text-foreground">Describe your company</CardTitle>
              <p className="text-muted-foreground mt-2">Help creators understand what you do</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">About {companyName}</Label>
                <Textarea
                  id="description"
                  placeholder="We're a company that..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none resize-none"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">Website (optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="flex-1 rounded-full">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full">
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        );

      case 'location':
        return (
          <>
            <CardHeader className="text-center py-8">
              <div className="flex justify-center mb-4">
                <MapPin className="w-12 h-12 text-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">Where are you based?</CardTitle>
              <p className="text-muted-foreground mt-2">Select your company's country</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCountry(c)}
                    className={`p-3 text-left text-sm border rounded-lg transition-all ${
                      country === c 
                        ? 'bg-foreground text-background border-foreground' 
                        : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 hover:border-foreground/50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="flex-1 rounded-full">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full" disabled={!country}>
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        );

      case 'products':
        return (
          <>
            <CardHeader className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Package className="w-12 h-12 text-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">What do you sell?</CardTitle>
              <p className="text-muted-foreground mt-2">Describe your products or services</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="products" className="text-foreground">Products / Services</Label>
                <Textarea
                  id="products"
                  placeholder="We offer premium fitness apparel, supplements, and workout programs..."
                  value={productsServices}
                  onChange={(e) => setProductsServices(e.target.value)}
                  rows={5}
                  className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="flex-1 rounded-full">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full">
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        );

      case 'audience':
        return (
          <>
            <CardHeader className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">Who's your audience?</CardTitle>
              <p className="text-muted-foreground mt-2">Help us match you with the right creators</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Age Ranges */}
              <div className="space-y-3">
                <Label className="text-foreground">Target Age Range</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => toggleArrayItem(ageRanges, setAgeRanges, age)}
                      className={`px-4 py-2 text-sm border rounded-full transition-all ${
                        ageRanges.includes(age)
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 hover:border-foreground/50'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Geographic Reach */}
              <div className="space-y-3">
                <Label className="text-foreground">Geographic Reach</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGlobalReach('worldwide')}
                    className={`flex-1 p-3 text-sm border rounded-lg transition-all flex items-center justify-center gap-2 ${
                      globalReach === 'worldwide'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 hover:border-foreground/50'
                    }`}
                  >
                    <Globe className="w-4 h-4" /> Worldwide
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlobalReach('specific')}
                    className={`flex-1 p-3 text-sm border rounded-lg transition-all ${
                      globalReach === 'specific'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 hover:border-foreground/50'
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
                        className={`p-2 text-left text-xs border rounded transition-all ${
                          targetCountries.includes(c)
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 hover:border-foreground/50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Audience Types */}
              <div className="space-y-3">
                <Label className="text-foreground">Audience Types</Label>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem(audienceTypes, setAudienceTypes, type)}
                      className={`px-3 py-1.5 text-xs border rounded-full transition-all ${
                        audienceTypes.includes(type)
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 hover:border-foreground/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="flex-1 rounded-full">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full">
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        );

      case 'credentials':
        return (
          <>
            <CardHeader className="text-center py-8">
              <CardTitle className="text-3xl font-bold text-foreground">Create your account</CardTitle>
              <p className="text-muted-foreground mt-2">Almost done! Set up your login credentials</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-foreground">Your Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground">Work Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
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
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={goBack} className="flex-1 rounded-full">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Complete Setup'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        );

      case 'login':
        return (
          <>
            <CardHeader className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Building2 className="w-12 h-12 text-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">Business Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground">Password</Label>
                  <Input
                    id="login-password"
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
            </CardContent>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dev mode toggle - top right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 flex-wrap justify-end">
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

      {/* Progress indicator */}
      {step !== 'login' && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="flex gap-1.5">
            {ALL_STEPS.map((s, i) => (
              <div 
                key={s}
                className={`h-1.5 w-8 rounded-full transition-all ${
                  i <= getCurrentStepIndex() ? 'bg-foreground' : 'bg-foreground/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      
      <Card className="w-full max-w-md bg-black/5 dark:bg-white/10 backdrop-blur-md border-black/10 dark:border-white/20 shadow-lg relative z-10 rounded-none">
        {renderStepContent()}
        
        {step !== 'login' && (
          <div className="text-center pb-6">
            <p className="text-muted-foreground text-sm">{getCurrentStepIndex() + 1}/{getTotalSteps()}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BusinessAuth;
