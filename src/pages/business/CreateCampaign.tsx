import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import CampaignChat from '@/components/CampaignChat';
import CurrencySelector from '@/components/CurrencySelector';
import { formatCurrencyValue, getPlaceholderValue } from '@/data/currencies';
import RateColumnHeader from '@/components/business/RateColumnHeader';

const steps = ['Ad Details', 'Rate', 'Checkout'];

const CreateCampaign: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultsShown, setResultsShown] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { symbol, label, formatPrice, currency, rate } = useCurrency();

  const fmtInline = (val: number | null) => formatCurrencyValue(val, currency);
  const fmtPlaceholder = (usdVal: number) => getPlaceholderValue(usdVal, currency);
  const fmtPlaceholderDecimal = (usdVal: number) => getPlaceholderValue(usdVal, currency, false);

  // Step 1: Ad details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guidelinesList, setGuidelinesList] = useState<string[]>(['']);

  // Step 2: Audience
  const [audience, setAudience] = useState('');

  // Step 3: Pricing
  const [ratePerThousand, setRatePerThousand] = useState(0);
  const [maxPayoutPerCreator, setMaxPayoutPerCreator] = useState<number | null>(null);
  const [customPayoutInput, setCustomPayoutInput] = useState('');
  const [payoutMode, setPayoutMode] = useState<'preset' | 'custom' | null>(null);

  // Step 4: Budget
  const [budgetOption, setBudgetOption] = useState<'preset' | 'custom' | null>(null);
  const [totalBudget, setTotalBudget] = useState<number>(0);

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
  const getFee = () => Math.round(getBudget() * 0.10 * 100) / 100;
  const getTotal = () => Math.round((getBudget() + getFee()) * 100) / 100;

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0 && description.trim().length > 0 && guidelinesList.some(g => g.trim().length > 0);
    if (step === 1) {
      const rateOk = ratePerThousand > 0 && maxPayoutPerCreator !== null && maxPayoutPerCreator > 0;
      const budgetOk = totalBudget >= (maxPayoutPerCreator || 1);
      return rateOk && budgetOk;
    }
    if (step === 2) return true;
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
      total_budget: getBudget(),
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

    // Convert local currency values to USD for storage
    const toUsd = (localVal: number) => Math.round((localVal / rate) * 100) / 100;

    // Also create the campaign in the database before redirecting
    const { data: insertData, error: insertError } = await supabase.from('campaigns').insert({
      title: campaignData.title,
      brand_name: campaignData.brand_name,
      description: campaignData.description,
      max_earnings: maxPayoutPerCreator ? toUsd(maxPayoutPerCreator) : null,
      total_budget: toUsd(campaignData.total_budget),
      guidelines: campaignData.guidelines,
      category: campaignData.category,
      business_id: user.id,
      brand_logo_url: bp?.logo_url || null,
      is_active: false,
      status: 'pending',
    }).select('id').single();

    if (insertError || !insertData) {
      toast({ title: 'Error', description: insertError?.message || 'Failed to create campaign', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    // Create a campaign tier with the CPM rate (stored in USD)
    if (ratePerThousand > 0) {
      await supabase.from('campaign_tiers').insert({
        campaign_id: insertData.id,
        min_views: 0,
        max_views: null,
        rate_per_view: toUsd(ratePerThousand),
      });
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
  const shouldHideChat = step === 1;

  // Auto-collapse on rate step
  React.useEffect(() => {
    if (shouldHideChat) setChatCollapsed(true);
  }, [shouldHideChat]);

  // Listen for topbar AI button toggle
  React.useEffect(() => {
    const handler = () => {
      if (!shouldHideChat) setChatCollapsed(c => !c);
    };
    window.addEventListener('toggle-ai-chat', handler);
    return () => window.removeEventListener('toggle-ai-chat', handler);
  }, [shouldHideChat]);

  // Once all rate fields are filled, keep results node visible permanently
  React.useEffect(() => {
    if (totalBudget > 0 && maxPayoutPerCreator !== null && maxPayoutPerCreator > 0 && ratePerThousand > 0) {
      setResultsShown(true);
    }
  }, [totalBudget, maxPayoutPerCreator, ratePerThousand]);

  const stepTitles = ['Ad Details', 'Set your rate', 'Review & Pay'];
  const [portalReady, setPortalReady] = useState(false);
  const [progressMounted, setProgressMounted] = useState(false);
  React.useEffect(() => { setPortalReady(true); }, []);
  React.useEffect(() => {
    const t = setTimeout(() => setProgressMounted(true), 100);
    return () => clearTimeout(t);
  }, []);
  const topbarCenter = portalReady ? document.getElementById('topbar-center') : null;
  const topbarProgress = portalReady ? document.getElementById('topbar-progress') : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Portal: step title into topbar center */}
      {topbarCenter && ReactDOM.createPortal(
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <p className="text-sm font-medium text-muted-foreground font-jakarta tracking-wide">
            {stepTitles[step]}
          </p>
        </div>,
        topbarCenter
      )}

      {/* Portal: progress bar into topbar bottom */}
      {topbarProgress && ReactDOM.createPortal(
        <div className="h-[3px] w-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-foreground"
            style={{ 
              width: progressMounted ? `${((step + 1) / steps.length) * 100}%` : '0%',
              transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>,
        topbarProgress
      )}

      <div className="flex flex-1 overflow-hidden relative">
      {/* Chat panel (collapsible, no border) */}
      <div
        className="shrink-0 h-full relative flex overflow-hidden"
        style={{
          width: chatCollapsed || shouldHideChat ? '0px' : '340px',
          transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="w-[340px] h-full shrink-0"
          style={{
            opacity: chatCollapsed || shouldHideChat ? 0 : 1,
            transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <CampaignChat
            formData={formData}
            requirements={guidelinesList.filter(g => g.trim())}
            onFormUpdate={handleFormUpdate}
            onRequirementsUpdate={handleRequirementsUpdate}
            onAudienceUpdate={handleAudienceUpdate}
            currentStep={step}
          />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div
          className={`mx-auto px-6 flex-1 flex flex-col w-full ${step === 1 ? 'max-w-5xl justify-center' : 'max-w-xl justify-center'}`}
        >

          {/* Step 1: Ad Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Ad title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Vibes 2026" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you're looking for..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Guidelines *</Label>
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
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Target audience</Label>
                <Textarea
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. 18-35 year olds interested in fitness, lifestyle, health & wellness."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 1 && (
            <div className="space-y-5 mt-2">

              {/* Header labels — separate cards */}
              <div className="grid gap-3" style={{ gridTemplateColumns: '110px 1fr 1fr 1fr 1fr' }}>
                <RateColumnHeader label="CURRENCY" />
                <RateColumnHeader label="CREATOR POOL" tooltip="Creator pools can vary from $25 to $10,000 — all dependent on how many people you want to participate." avg={totalBudget > 0 ? fmtInline(Math.round(totalBudget * 0.78)) : undefined} />
                <RateColumnHeader label="MAX PAYOUT / CREATOR" tooltip="Max payout can vary from $5 to $1,000 — all dependent on how much effort you want from your creators. Low amount = simpler videos. High amount = more advanced." avg={maxPayoutPerCreator ? fmtInline(Math.round(maxPayoutPerCreator * 0.82)) : undefined} />
                <RateColumnHeader label="CREATORS RECEIVE" tooltip="This is the rate you're paying creators per 1,000 views they generate. A low CPM works better if your product only needs to be shown for a few seconds. Higher CPM if the video is explanatory." avg={ratePerThousand > 0 ? fmtInline(Math.round(ratePerThousand * 0.85 * 100) / 100) : undefined} />
                <RateColumnHeader label="YOU PAY" tooltip="Jarla takes a fee of 10%. About 5% are banking fees and the other 5% goes to confirming creators follow your brief and helping Jarla run our platform." />
              </div>

              {/* Input row — matching header style */}
              <div className="grid gap-3" style={{ gridTemplateColumns: '110px 1fr 1fr 1fr 1fr' }}>
                <div className="rounded border border-border bg-muted/50 flex items-center px-2 h-8 overflow-visible">
                  <CurrencySelector />
                </div>
                <div className="rounded border border-border bg-muted/50 flex items-center px-3 h-8">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={totalBudget ? fmtInline(totalBudget) : ''}
                    onChange={(e) => setTotalBudget(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                    placeholder={fmtPlaceholder(250)}
                    className="bg-transparent outline-none w-full text-sm font-semibold text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="rounded border border-border bg-muted/50 flex items-center px-3 h-8">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxPayoutPerCreator ? fmtInline(maxPayoutPerCreator) : ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                      setMaxPayoutPerCreator(val > 0 ? val : null);
                    }}
                    placeholder={fmtPlaceholder(25)}
                    className="bg-transparent outline-none w-full text-sm font-semibold text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="rounded border border-border bg-muted/50 flex items-center px-3 h-8">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ratePerThousand ? fmtInline(ratePerThousand) : ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                      setRatePerThousand(Math.round(val * 100) / 100);
                    }}
                    placeholder={fmtPlaceholderDecimal(2)}
                    className="bg-transparent outline-none w-full text-sm font-semibold text-foreground placeholder:text-muted-foreground"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">/ 1000 views</span>
                </div>
                <div className="rounded border border-border bg-muted/50 flex items-center px-3 h-8">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ratePerThousand ? fmtInline(Math.round(ratePerThousand * 1.15 * 100) / 100) : ''}
                    onChange={(e) => {
                      const youPay = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                      const base = Math.round((youPay / 1.15) * 100) / 100;
                      setRatePerThousand(base);
                    }}
                    placeholder={fmtPlaceholderDecimal(2.3)}
                    className="bg-transparent outline-none w-full text-sm font-semibold text-foreground placeholder:text-muted-foreground"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">/ 1000 views</span>
                </div>
              </div>



              {/* Combined results node — always visible */}
              {(() => {
                const allFilled = totalBudget > 0 && maxPayoutPerCreator !== null && maxPayoutPerCreator > 0 && ratePerThousand > 0;
                const viewsGuaranteed = allFilled ? Math.round((getBudget() / ratePerThousand) * 1000) : 0;
                const viewsEstimated = Math.round(viewsGuaranteed * 1.4);
                const creatorsGuaranteed = allFilled ? Math.floor(getBudget() / maxPayoutPerCreator!) : 0;
                const creatorsEstimated = Math.round(creatorsGuaranteed * 2.7);
                return (
                  <div
                    className="rounded-xl px-6 py-8 grid grid-cols-2 gap-6 border relative transition-opacity duration-500"
                    style={{
                      opacity: allFilled ? 1 : 0.45,
                      background: 'linear-gradient(135deg, hsla(0,0%,6%,0.97), hsla(0,0%,12%,0.93), hsla(0,0%,8%,0.95))',
                      borderColor: 'hsla(0,0%,100%,0.08)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 0 40px hsla(0,0%,100%,0.03), inset 0 1px 0 hsla(0,0%,100%,0.06)',
                    }}
                  >
                    {/* Overlay prompt when not filled */}
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none z-10"
                      style={{ opacity: allFilled ? 0 : 1 }}
                    >
                      <p className="text-sm font-medium tracking-wide" style={{ color: 'hsla(0,0%,100%,0.5)' }}>
                        Fill out details above to see results
                      </p>
                    </div>
                    <div className="text-center transition-opacity duration-300" style={{ opacity: allFilled ? 1 : 0.15 }}>
                      <p className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'hsla(0,0%,100%,0.4)' }}>Total views</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <div className="text-center">
                          <p className="text-4xl font-bold tracking-tight" style={{ color: 'hsla(0,0%,100%,0.95)', textShadow: '0 0 20px hsla(0,0%,100%,0.15)' }}>
                            {allFilled ? viewsGuaranteed.toLocaleString() : '—'}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'hsla(0,0%,100%,0.35)' }}>minimum</p>
                        </div>
                        <span className="text-2xl font-light" style={{ color: 'hsla(0,0%,100%,0.3)' }}>–</span>
                        <div className="text-center">
                          <p className="text-4xl font-bold tracking-tight" style={{ color: 'hsla(0,0%,100%,0.95)', textShadow: '0 0 20px hsla(0,0%,100%,0.15)' }}>
                            {allFilled ? viewsEstimated.toLocaleString() : '—'}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'hsla(0,0%,100%,0.35)' }}>likely</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center transition-opacity duration-300" style={{ opacity: allFilled ? 1 : 0.15 }}>
                      <p className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'hsla(0,0%,100%,0.4)' }}>Total creators</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <div className="text-center">
                          <p className="text-4xl font-bold tracking-tight" style={{ color: 'hsla(0,0%,100%,0.95)', textShadow: '0 0 20px hsla(0,0%,100%,0.15)' }}>
                            {allFilled ? creatorsGuaranteed.toLocaleString() : '—'}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'hsla(0,0%,100%,0.35)' }}>minimum</p>
                        </div>
                        <span className="text-2xl font-light" style={{ color: 'hsla(0,0%,100%,0.3)' }}>–</span>
                        <div className="text-center">
                          <p className="text-4xl font-bold tracking-tight" style={{ color: 'hsla(0,0%,100%,0.95)', textShadow: '0 0 20px hsla(0,0%,100%,0.15)' }}>
                            {allFilled ? creatorsEstimated.toLocaleString() : '—'}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'hsla(0,0%,100%,0.35)' }}>likely</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">

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
                  <p className="text-sm font-semibold text-foreground">{fmtInline(ratePerThousand)} / 1,000 views</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Max payout per creator</p>
                  <p className="text-sm font-semibold text-foreground">{fmtInline(maxPayoutPerCreator)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pot</p>
                  <p className="text-sm font-semibold text-foreground">{fmtInline(getBudget())}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate per 1,000 views</span>
                  <span className="text-sm font-medium text-foreground">{fmtInline(ratePerThousand)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max payout per creator</span>
                  <span className="text-sm font-medium text-foreground">{fmtInline(maxPayoutPerCreator)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Creator pool</span>
                  <span className="text-sm font-medium text-foreground">{fmtInline(getBudget())}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jarla service fee (15%)</span>
                  <span className="text-sm font-medium text-foreground">{fmtInline(getFee())}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">{fmtInline(getTotal())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-center mt-8 pt-6 gap-3">
            {step < steps.length - 1 ? (
              <>
                {step === 1 && resultsShown && (
                  <div
                    className="rounded border border-border bg-muted/50 px-3 h-8 flex items-center text-sm font-semibold text-foreground animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '800ms', animationFillMode: 'both' }}
                  >
                    Total: {fmtInline(getTotal())}
                  </div>
                )}
                <Button
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
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
