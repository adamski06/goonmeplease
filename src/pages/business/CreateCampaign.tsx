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

const steps = ['Ad Details', 'Target Audience', 'Rate', 'Budget', 'Checkout'];

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

  // Step 3: Pricing
  const [ratePerThousand, setRatePerThousand] = useState(1); // USD per 1000 views
  const [maxPayoutPerCreator, setMaxPayoutPerCreator] = useState<number | null>(null);
  const [customPayoutInput, setCustomPayoutInput] = useState('');
  const [payoutMode, setPayoutMode] = useState<'preset' | 'custom' | null>(null);

  // Step 4: Budget
  const [budgetOption, setBudgetOption] = useState<'preset' | 'custom' | null>(null);
  const [customBudgetInput, setCustomBudgetInput] = useState('25');

  const getBudget = () => {
    if (budgetOption === 'preset') return 10000;
    return Math.max(25, parseInt(customBudgetInput) || 25);
  };

  const getBudgetAmount = () => getBudget();
  const getFee = () => 0;
  const getTotal = () => getBudget();

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return true;
    if (step === 2) return ratePerThousand > 0 && maxPayoutPerCreator !== null && maxPayoutPerCreator > 0;
    if (step === 3) return budgetOption === 'preset' || (budgetOption === 'custom' && (parseInt(customBudgetInput) || 0) >= 25);
    if (step === 4) return true;
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
    const { data: bp } = await supabase.from('business_profiles').select('company_name, logo_url').eq('user_id', user.id).maybeSingle();

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
      brand_logo_url: bp?.logo_url || null,
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

  const [chatCollapsed, setChatCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
      {/* Top bar — matches sidebar logo height: py-5 (20+20) + h-6 (24) = 64px */}
      <div
        className="w-full flex items-center shrink-0 animate-in slide-in-from-top-2 duration-300"
        style={{
          height: '64px',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'hsl(var(--background))',
          paddingLeft: '20px',
        }}
      >
        <span className="text-sm font-semibold text-foreground font-montserrat">Create a Spread</span>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
      {/* Chat panel + toggle */}
      <div
        className="shrink-0 border-r border-border h-full relative flex transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: chatCollapsed ? '32px' : '340px' }}
      >
        {/* Chat content — fixed 340px, clipped by parent overflow-hidden */}
        <div className="w-[340px] h-full shrink-0">
          <CampaignChat
            formData={formData}
            requirements={guidelinesList.filter(g => g.trim())}
            onFormUpdate={handleFormUpdate}
            onRequirementsUpdate={handleRequirementsUpdate}
            onAudienceUpdate={handleAudienceUpdate}
            currentStep={step}
          />
        </div>

        {/* Toggle button — always pinned to right edge of visible panel */}
        <button
          onClick={() => setChatCollapsed(c => !c)}
          className="absolute top-0 bottom-0 right-0 w-8 flex items-center justify-center hover:bg-muted transition-colors bg-background"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          title={chatCollapsed ? 'Expand chat' : 'Collapse chat'}
        >
          {chatCollapsed ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Form panel */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-xl mx-auto px-6 flex-1 flex flex-col justify-center w-full">
          {/* Progress bar */}
          <div className="mb-8 px-[15%]">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Ad Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Ad title *</Label>
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

          {/* Step 3: Pricing */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-bold text-foreground font-montserrat">Set your rate</h2>
              </div>

              {/* Rate node */}
              <div className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-4 min-h-[200px]">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">${ratePerThousand.toFixed(1)}</span>
                  <span className="text-base text-muted-foreground">/ 1,000 views</span>
                </div>
                <div className="w-full">
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.5}
                    value={ratePerThousand}
                    onChange={(e) => setRatePerThousand(Number(e.target.value))}
                    className="rate-slider w-full"
                    style={{
                      background: `linear-gradient(to right, hsl(0 0% 10%) ${((ratePerThousand - 0.5) / 2.5) * 100}%, hsl(var(--border)) ${((ratePerThousand - 0.5) / 2.5) * 100}%)`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0.50</span>
                  <span>$3.00</span>
                </div>
              </div>

              {/* Max payout node */}
              <div className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-4 min-h-[200px]">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Max payout per creator</p>
                <div className="flex gap-3 flex-1 items-stretch">
                  {([10, 25, 50] as const).map((amount) => (
                    <div key={amount} className="flex-1 relative flex flex-col">
                      {amount === 25 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                              background: 'linear-gradient(135deg, hsl(142 60% 40% / 0.25) 0%, hsl(142 60% 30% / 0.15) 100%)',
                              border: '1px solid hsl(142 60% 45% / 0.4)',
                              color: 'hsl(142 60% 35%)',
                              backdropFilter: 'blur(8px)',
                            }}
                          >
                            Popular
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setPayoutMode('preset');
                          setMaxPayoutPerCreator(maxPayoutPerCreator === amount && payoutMode === 'preset' ? null : amount);
                        }}
                        className="flex-1 rounded-xl flex flex-col items-center justify-center py-5 transition-all text-2xl font-bold"
                        style={maxPayoutPerCreator === amount && payoutMode === 'preset' ? {
                          background: 'linear-gradient(135deg, hsl(142 60% 40% / 0.25) 0%, hsl(142 60% 30% / 0.15) 100%)',
                          boxShadow: 'inset 0 1px 0 hsl(142 60% 80% / 0.3), 0 0 20px hsl(142 60% 40% / 0.15)',
                          border: '1px solid hsl(142 60% 45% / 0.5)',
                          color: 'hsl(142 60% 30%)',
                        } : {
                          background: 'transparent',
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))',
                        }}
                      >
                        ${amount}
                      </button>
                    </div>
                  ))}
                  {/* Custom payout option */}
                  <div className="flex-1 relative flex flex-col">
                    <button
                      onClick={() => {
                        setPayoutMode('custom');
                        const val = parseInt(customPayoutInput) || 0;
                        setMaxPayoutPerCreator(val > 0 ? val : null);
                      }}
                      className="flex-1 rounded-xl flex flex-col items-center justify-center py-5 transition-all text-2xl font-bold"
                      style={payoutMode === 'custom' ? {
                        background: 'linear-gradient(135deg, hsl(142 60% 40% / 0.25) 0%, hsl(142 60% 30% / 0.15) 100%)',
                        boxShadow: 'inset 0 1px 0 hsl(142 60% 80% / 0.3), 0 0 20px hsl(142 60% 40% / 0.15)',
                        border: '1px solid hsl(142 60% 45% / 0.5)',
                        color: 'hsl(142 60% 30%)',
                      } : {
                        background: 'transparent',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      Custom
                    </button>
                  </div>
                </div>
                {payoutMode === 'custom' && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">$</span>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Enter amount"
                      value={customPayoutInput}
                      onChange={(e) => {
                        setCustomPayoutInput(e.target.value);
                        const val = parseInt(e.target.value) || 0;
                        setMaxPayoutPerCreator(val > 0 ? val : null);
                      }}
                      className="text-lg font-bold h-12"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-bold text-foreground font-montserrat">Set your budget</h2>
              </div>

              <div className="flex gap-3">
                {/* $10,000 preset node */}
                <button
                  onClick={() => setBudgetOption('preset')}
                  className="flex-1 rounded-2xl border p-6 flex flex-col gap-2 text-left transition-all"
                  style={{
                    minHeight: '230px',
                    ...(budgetOption === 'preset' ? {
                      background: 'linear-gradient(135deg, hsl(142 60% 40% / 0.25) 0%, hsl(142 60% 30% / 0.15) 100%)',
                      boxShadow: 'inset 0 1px 0 hsl(142 60% 80% / 0.3), 0 0 20px hsl(142 60% 40% / 0.15)',
                      border: '1px solid hsl(142 60% 45% / 0.5)',
                    } : {
                      background: 'transparent',
                      border: '1px solid hsl(var(--border))',
                    })
                  }}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Standard</p>
                  <p className="text-4xl font-bold text-foreground mt-auto">$10,000</p>
                  <p className="text-xs text-muted-foreground">Fixed budget, ready to launch</p>
                </button>

                {/* Custom node */}
                <button
                  onClick={() => setBudgetOption('custom')}
                  className="flex-1 rounded-2xl border p-6 flex flex-col gap-2 text-left transition-all"
                  style={{
                    minHeight: '230px',
                    ...(budgetOption === 'custom' ? {
                      background: 'linear-gradient(135deg, hsl(142 60% 40% / 0.25) 0%, hsl(142 60% 30% / 0.15) 100%)',
                      boxShadow: 'inset 0 1px 0 hsl(142 60% 80% / 0.3), 0 0 20px hsl(142 60% 40% / 0.15)',
                      border: '1px solid hsl(142 60% 45% / 0.5)',
                    } : {
                      background: 'transparent',
                      border: '1px solid hsl(var(--border))',
                    })
                  }}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Custom</p>
                  <p className="text-4xl font-bold text-foreground mt-auto">
                    {customBudgetInput ? `$${parseInt(customBudgetInput).toLocaleString()}` : '$—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Min. $25 USD</p>
                </button>
              </div>

              {/* Custom input — shown below when custom is selected */}
              {budgetOption === 'custom' && (
                <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Enter budget</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">$</span>
                    <Input
                      type="number"
                      min={25}
                      placeholder="Enter exact amount"
                      value={customBudgetInput}
                      onChange={(e) => setCustomBudgetInput(e.target.value)}
                      className="text-2xl font-bold h-14"
                    />
                    <span className="text-base text-muted-foreground">USD</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum budget: $25</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Checkout */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-bold text-foreground font-montserrat">Review & Pay</h2>
              </div>

              {/* Summary card */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ad</p>
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
                  <p className="text-xs text-muted-foreground mb-1">Rate</p>
                  <p className="text-sm font-semibold text-foreground">${ratePerThousand} / 1,000 views</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Max payout per creator</p>
                  <p className="text-sm font-semibold text-foreground">${maxPayoutPerCreator}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Budget</p>
                  <p className="text-sm font-semibold text-foreground">${getBudget().toLocaleString()}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate per 1,000 views</span>
                  <span className="text-sm font-medium text-foreground">${ratePerThousand}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max payout per creator</span>
                  <span className="text-sm font-medium text-foreground">${maxPayoutPerCreator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Campaign budget</span>
                  <span className="text-sm font-medium text-foreground">${getBudget().toLocaleString()}</span>
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
    </div>
  );
};

export default CreateCampaign;
