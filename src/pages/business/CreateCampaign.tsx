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

const steps = ['Ad Details', 'Target Audience', 'Rate', 'Checkout'];

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
  const [maxPayoutPerCreator, setMaxPayoutPerCreator] = useState<number | null>(25);
  const [customPayoutInput, setCustomPayoutInput] = useState('');
  const [payoutMode, setPayoutMode] = useState<'preset' | 'custom' | null>(null);

  // Step 4: Budget
  const [budgetOption, setBudgetOption] = useState<'preset' | 'custom' | null>(null);
  const [totalBudget, setTotalBudget] = useState<number>(250); // default 10x of maxPayout

  // Update budget default when maxPayout changes
  React.useEffect(() => {
    if (maxPayoutPerCreator && maxPayoutPerCreator > 0) {
      setTotalBudget(prev => {
        const min = maxPayoutPerCreator;
        const def = maxPayoutPerCreator * 10;
        if (prev < min) return def;
        return prev;
      });
    }
  }, [maxPayoutPerCreator]);

  const getBudget = () => {
    const min = maxPayoutPerCreator || 1;
    return Math.max(min, totalBudget || min);
  };

  const getBudgetAmount = () => getBudget();
  const getFee = () => 0;
  const getTotal = () => getBudget();

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return true;
    if (step === 2) {
      const rateOk = ratePerThousand > 0 && maxPayoutPerCreator !== null && maxPayoutPerCreator > 0;
      const budgetOk = totalBudget >= (maxPayoutPerCreator || 1);
      return rateOk && budgetOk;
    }
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
  const chatRelevant = step <= 1;

  // Auto-collapse chat when it becomes irrelevant
  React.useEffect(() => {
    if (!chatRelevant) {
      setChatCollapsed(true);
    }
  }, [chatRelevant]);

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
        className="shrink-0 border-r border-border h-full relative flex transition-all duration-500 ease-in-out overflow-hidden"
        style={{ width: chatCollapsed ? '0px' : '340px', opacity: chatRelevant ? 1 : 0 }}
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

        {/* Toggle button — only show when chat is relevant */}
        {chatRelevant && (
          <button
            onClick={() => setChatCollapsed(c => !c)}
            className="absolute top-0 bottom-0 right-0 w-8 flex items-center justify-center hover:bg-muted transition-colors bg-background"
            style={{ color: 'hsl(var(--muted-foreground))' }}
            title={chatCollapsed ? 'Expand chat' : 'Collapse chat'}
          >
            {chatCollapsed ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Form panel */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className={`mx-auto px-6 flex-1 flex flex-col justify-center w-full ${step === 2 ? 'max-w-2xl' : 'max-w-xl'}`}>
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

              {/* Rate + Total Views — same row */}
              <div className="grid grid-cols-[1fr_auto] gap-6">
                {/* Rate input */}
                <div className="rounded-2xl border border-border bg-background p-5 flex flex-col gap-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rate</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">$</span>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={ratePerThousand || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setRatePerThousand(Math.round(val * 10) / 10);
                        }}
                        placeholder="2.0"
                        className="text-sm font-semibold h-10 pr-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap pointer-events-none">/ 1,000 views</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 ml-[calc(0.5rem+1ch+0.5rem)]">
                    {[1.5, 2.5, 4].map(v => (
                      <button
                        key={v}
                        onClick={() => setRatePerThousand(v)}
                        className={`px-3 py-2.5 rounded-[4px] text-xs font-medium border transition-colors ${ratePerThousand === v ? 'bg-foreground text-background border-foreground' : 'bg-muted/50 text-muted-foreground border-border hover:border-foreground/30'}`}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total views display — matches Rate node height */}
                <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col items-center justify-center gap-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total views</p>
                  <p className="text-2xl font-bold text-foreground">
                    {ratePerThousand > 0 && maxPayoutPerCreator && maxPayoutPerCreator > 0
                      ? Math.round((getBudget() / ratePerThousand) * 1000).toLocaleString()
                      : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">across all creators</p>
                </div>
              </div>

              {/* Max payout input */}
              <div className="rounded-2xl border border-border bg-background p-5 flex flex-col gap-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Max payout</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">$</span>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={maxPayoutPerCreator ?? ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setMaxPayoutPerCreator(val > 0 ? val : null);
                      }}
                      placeholder="25"
                      className="text-sm font-semibold h-10 pr-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap pointer-events-none">per creator</span>
                  </div>
                </div>
                <div className="flex gap-1.5 ml-[calc(0.5rem+1ch+0.5rem)]">
                  {[5, 10, 25].map(v => (
                    <button
                      key={v}
                      onClick={() => setMaxPayoutPerCreator(v)}
                      className={`px-3 py-2.5 rounded-[4px] text-xs font-medium border transition-colors ${maxPayoutPerCreator === v ? 'bg-foreground text-background border-foreground' : 'bg-muted/50 text-muted-foreground border-border hover:border-foreground/30'}`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pot */}
              <div className="rounded-2xl border border-border bg-background p-5 flex flex-col gap-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pot</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">$</span>
                  <Input
                    type="number"
                    min={maxPayoutPerCreator || 1}
                    step={1}
                    value={totalBudget || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setTotalBudget(val);
                    }}
                    placeholder={String((maxPayoutPerCreator || 25) * 10)}
                    className="text-sm font-semibold h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="flex gap-1.5 ml-[calc(0.5rem+1ch+0.5rem)]">
                  {[
                    { label: `$${maxPayoutPerCreator || 25}`, value: maxPayoutPerCreator || 25 },
                    { label: `$${(maxPayoutPerCreator || 25) * 10}`, value: (maxPayoutPerCreator || 25) * 10 },
                    { label: `$${((maxPayoutPerCreator || 25) * 100).toLocaleString()}`, value: (maxPayoutPerCreator || 25) * 100 },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setTotalBudget(opt.value)}
                      className={`px-3 py-2.5 rounded-[4px] text-xs font-medium border transition-colors ${totalBudget === opt.value ? 'bg-foreground text-background border-foreground' : 'bg-muted/50 text-muted-foreground border-border hover:border-foreground/30'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Min. ${maxPayoutPerCreator || 1} (max payout per creator).</p>
              </div>
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
                  <p className="text-xs text-muted-foreground mb-1">Pot</p>
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
                  <span className="text-sm text-muted-foreground">Pot</span>
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
