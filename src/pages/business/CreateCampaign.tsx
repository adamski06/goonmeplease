import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import CampaignChat from '@/components/CampaignChat';

const steps = ['Ad Details', 'Target Audience', 'Budget', 'Checkout'];

const CreateCampaign: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Step 1: Ad details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guidelinesList, setGuidelinesList] = useState<string[]>(['']);

  // Step 2: Audience
  const [audience, setAudience] = useState('');

  // Step 3: Budget package
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [customBudget, setCustomBudget] = useState('');

  const getBudgetAmount = () => {
    if (selectedPackage === 'base') return 1000;
    if (selectedPackage === 'pro') return 5000;
    if (selectedPackage === 'custom' && customBudget) return parseFloat(customBudget);
    return 0;
  };

  const getFee = () => getBudgetAmount() * 0.1;
  const getTotal = () => getBudgetAmount() + getFee();

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return true;
    if (step === 2) return selectedPackage !== null && (selectedPackage !== 'custom' || (customBudget && parseFloat(customBudget) > 0));
    if (step === 3) return true;
    return false;
  };

  const addGuideline = () => setGuidelinesList([...guidelinesList, '']);
  const removeGuideline = (i: number) => setGuidelinesList(guidelinesList.filter((_, idx) => idx !== i));
  const updateGuideline = (i: number, val: string) => {
    const updated = [...guidelinesList];
    updated[i] = val;
    setGuidelinesList(updated);
  };

  const handleFormUpdate = (updates: Partial<{ brand_name: string; title: string; description: string; deadline: string; total_budget: number }>) => {
    if (updates.title !== undefined) setTitle(updates.title);
    if (updates.description !== undefined) setDescription(updates.description);
  };

  const handleRequirementsUpdate = (requirements: string[]) => {
    setGuidelinesList(requirements.length > 0 ? requirements : ['']);
  };

  const handleAudienceUpdate = (value: string) => {
    setAudience(value);
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const guidelinesArray = guidelinesList.map((g) => g.trim()).filter(Boolean);
    const { data: bp } = await supabase.from('business_profiles').select('company_name').eq('user_id', user.id).maybeSingle();

    const campaignData = {
      title: title.trim(),
      brand_name: bp?.company_name || 'My Brand',
      description: description.trim() || null,
      guidelines: guidelinesArray.length > 0 ? guidelinesArray : null,
      category: audience.trim() || null,
      total_budget: getTotal(),
    };

    const { data, error } = await supabase.functions.invoke('create-campaign-checkout', {
      body: {
        amount: getTotal(),
        campaignTitle: title.trim(),
        campaignData,
      },
    });

    if (error || !data?.url) {
      toast({ title: 'Error', description: error?.message || 'Could not create checkout session', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    // Also create the campaign in the database before redirecting
    const { error: insertError } = await supabase.from('campaigns').insert({
      title: campaignData.title,
      brand_name: campaignData.brand_name,
      description: campaignData.description,
      max_earnings: null,
      total_budget: campaignData.total_budget,
      guidelines: campaignData.guidelines,
      category: campaignData.category,
      business_id: user.id,
      is_active: true,
      status: 'active',
    });

    if (insertError) {
      toast({ title: 'Error', description: insertError.message, variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    // Redirect to Stripe checkout
    window.location.href = data.url;
  };

  const formData = {
    brand_name: '',
    title,
    description,
    deadline: '',
    total_budget: getBudgetAmount(),
  };

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden">
      {/* Chat panel */}
      <div className="w-[340px] shrink-0 border-r border-border h-full">
        <CampaignChat
          formData={formData}
          requirements={guidelinesList.filter(g => g.trim())}
          onFormUpdate={handleFormUpdate}
          onRequirementsUpdate={handleRequirementsUpdate}
          onAudienceUpdate={handleAudienceUpdate}
          currentStep={step}
        />
      </div>

      {/* Form panel */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-xl mx-auto px-6 flex-1 flex flex-col justify-center w-full">
          {/* Progress bar */}
          <div className="mb-8 px-[15%]">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Ad Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Campaign title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Vibes 2026" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you're looking for..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Guidelines</Label>
                {guidelinesList.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={g}
                      onChange={(e) => updateGuideline(i, e.target.value)}
                      placeholder={`Guideline ${i + 1}`}
                      className="h-9 text-sm"
                    />
                    {guidelinesList.length > 1 && (
                      <button onClick={() => removeGuideline(i)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addGuideline} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
                  <Plus className="h-3.5 w-3.5" /> Add guideline
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(0)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-bold text-foreground font-montserrat">Target audience</h2>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Who should see this campaign?</Label>
                <Textarea
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. 18-35 year olds interested in fitness, lifestyle, health & wellness. Broad reach across Scandinavia."
                  rows={6}
                />
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-bold text-foreground font-montserrat">Choose your plan</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Base */}
                <button
                  onClick={() => { setSelectedPackage('base'); setCustomBudget(''); }}
                  className={`rounded-xl border px-5 py-6 text-left transition-all flex items-center justify-between ${
                    selectedPackage === 'base'
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                      : 'border-border hover:border-foreground/20'
                  }`}
                >
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1">Base</div>
                    <div className="text-2xl font-bold text-foreground">$1,000</div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">1,000,000 – 3,000,000 <span className="text-sm font-medium text-muted-foreground">views</span></div>
                </button>

                {/* Pro */}
                <button
                  onClick={() => { setSelectedPackage('pro'); setCustomBudget(''); }}
                  className={`rounded-xl border px-5 py-6 text-left transition-all relative flex items-center justify-between ${
                    selectedPackage === 'pro'
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                      : 'border-border hover:border-foreground/20'
                  }`}
                >
                  <div className="absolute -top-2 right-3 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">Popular</div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1">Pro</div>
                    <div className="text-2xl font-bold text-foreground">$5,000</div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">5,000,000 – 15,000,000 <span className="text-sm font-medium text-muted-foreground">views</span></div>
                </button>

                {/* Custom */}
                <button
                  onClick={() => setSelectedPackage('custom')}
                  className={`rounded-xl border px-5 py-6 text-left transition-all flex items-center justify-between ${
                    selectedPackage === 'custom'
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                      : 'border-border hover:border-foreground/20'
                  }`}
                >
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-1">Custom</div>
                    <div className="text-2xl font-bold text-foreground">Custom</div>
                  </div>
                  <div className="text-sm text-muted-foreground">You set the budget, we deliver the views</div>
                </button>
              </div>

              {selectedPackage === 'custom' && (
                <div className="space-y-1.5 pt-2">
                  <Label className="text-sm font-medium">Your budget (USD)</Label>
                  <Input
                    type="number"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    placeholder="Enter amount"
                    className="h-10"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Checkout */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-bold text-foreground font-montserrat">Review & Pay</h2>
              </div>

              {/* Summary card */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Campaign</p>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                </div>
                {description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{description}</p>
                  </div>
                )}
                {audience && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Audience</p>
                    <p className="text-sm text-foreground">{audience}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plan</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{selectedPackage}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Campaign budget</span>
                  <span className="text-sm font-medium text-foreground">${getBudgetAmount().toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jarla service fee (10%)</span>
                  <span className="text-sm font-medium text-foreground">${getFee().toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">${getTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-center mt-8 pt-6 border-t border-border">
            {step < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
