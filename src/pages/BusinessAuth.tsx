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
import { Upload, X, Building2 } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const companyNameSchema = z.string().min(1, 'Company name is required').max(100, 'Company name too long');
const websiteSchema = z.string().url('Please enter a valid URL').optional().or(z.literal(''));
const descriptionSchema = z.string().max(500, 'Description too long').optional();

type Step = 'credentials' | 'company-info';

const BusinessAuth: React.FC = () => {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already logged in and has business role, go to dashboard
    if (!loading && user) {
      checkBusinessRole();
    }
  }, [user, loading]);

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

  const validateCompanyInfo = () => {
    try {
      companyNameSchema.parse(companyName);
      if (website) websiteSchema.parse(website);
      if (description) descriptionSchema.parse(description);
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
      // Check if user has business role
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

  const handleSignUpStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCredentials()) return;

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Account exists',
          description: 'This email is already registered. Please sign in.',
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
      setStep('company-info');
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

  const handleCompanySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCompanyInfo()) return;

    setIsLoading(true);

    try {
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

      // Create business profile
      const { error: profileError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: userId,
          company_name: companyName,
          logo_url: logoUrl,
          description: description || null,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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
      
      <Card className="w-full max-w-md bg-black/5 dark:bg-white/10 backdrop-blur-md border-black/10 dark:border-white/20 shadow-lg relative z-10 rounded-none">
        {step === 'credentials' ? (
          <>
            <CardHeader className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Building2 className="w-12 h-12 text-foreground" />
              </div>
              <CardTitle className="text-4xl font-bold text-foreground">
                {isLogin ? 'Business Login' : 'Start your business'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLogin ? (
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
                      onClick={() => setIsLogin(false)}
                      className="text-foreground underline hover:text-foreground/80"
                    >
                      Create one
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignUpStep1} className="space-y-4">
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
                  <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Continue'}
                  </Button>
                  <div className="text-center space-y-1 mt-4">
                    <p className="text-muted-foreground text-sm">
                      Already have a business account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className="text-foreground underline hover:text-foreground/80"
                      >
                        Log in
                      </button>
                    </p>
                    <p className="text-muted-foreground text-sm">1/2</p>
                  </div>
                </form>
              )}
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center py-8">
              <CardTitle className="text-3xl font-bold text-foreground">Tell us about your company</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySetup} className="space-y-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label className="text-foreground">Company Logo</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-foreground">Company Name *</Label>
                  <Input
                    id="company-name"
                    type="text"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-foreground">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">About your company</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us what your company does..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-foreground placeholder:text-muted-foreground rounded-none resize-none"
                  />
                </div>

                <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
                
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">2/2</p>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default BusinessAuth;