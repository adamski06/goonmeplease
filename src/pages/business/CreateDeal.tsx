import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import CampaignChat from '@/components/CampaignChat';
import { useCurrency } from '@/contexts/CurrencyContext';
import CurrencySelector from '@/components/CurrencySelector';
import { formatCurrencyValue, getPlaceholderValue } from '@/data/currencies';

const steps = ['Ad Details', 'Rate', 'Review'];

const CreateDeal: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultsShown, setResultsShown] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { symbol, label, currency } = useCurrency();

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

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return ratePerThousand > 0 && maxPayoutPerCreator !== null && maxPayoutPerCreator > 0;
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const guidelinesArray = guidelinesList.map(g => g.trim()).filter(Boolean);
    const { data: bp } = await supabase
      .from('business_profiles')
      .select('company_name, logo_url')
      .eq('user_id', user.id)
      .maybeSingle();

    const { error } = await supabase.from('deals').insert({
      business_id: user.id,
      brand_name: bp?.company_name || 'My Brand',
      brand_logo_url: bp?.logo_url || null,
      title: title.trim(),
      description: description.trim() || null,
      guidelines: guidelinesArray.length > 0 ? guidelinesArray : null,
      category: audience.trim() || null,
      rate_per_view: ratePerThousand,
      max_earnings: maxPayoutPerCreator,
      total_budget: null,
      is_active: true,
      status: 'active',
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    toast({ title: 'Deal launched!' });
    navigate('/business/deals');
  };

  const formData = {
    brand_name: '',
    title,
    description,
    deadline: '',
    total_budget: 0,
  };

  const [chatCollapsed, setChatCollapsed] = useState(false);
  const shouldHideChat = step === 1;

  React.useEffect(() => {
    if (shouldHideChat) setChatCollapsed(true);
  }, [shouldHideChat]);

  React.useEffect(() => {
    const handler = () => {
      if (!shouldHideChat) setChatCollapsed(c => !c);
    };
    window.addEventListener('toggle-ai-chat', handler);
    return () => window.removeEventListener('toggle-ai-chat', handler);
  }, [shouldHideChat]);

  const stepTitles = ['Ad Details', 'Set your rate', 'Review & Launch'];
  const [portalReady, setPortalReady] = useState(false);
  React.useEffect(() => { setPortalReady(true); }, []);
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
        <div className="h-[3px] w-full bg-muted">
          <div 
            className="h-full bg-foreground transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>,
        topbarProgress
      )}

      <div className="flex flex-1 overflow-hidden relative">
      {/* Chat panel (collapsible, no border) */}
      <div
        className="shrink-0 h-full relative flex transition-all duration-500 ease-in-out overflow-hidden"
        style={{ width: chatCollapsed || shouldHideChat ? '0px' : '340px' }}
      >
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
      </div>

      {/* Form panel */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className={`mx-auto px-6 flex-1 flex flex-col w-full ${step === 1 ? 'max-w-5xl justify-start pt-10' : 'max-w-xl justify-center'}`}>

          {/* Step 1: Ad Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Deal title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Collab 2026" className="h-10" />
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

              {/* Header labels */}
              <div className="grid gap-3" style={{ gridTemplateColumns: '110px 1fr 1fr 1fr' }}>
                <div className="rounded-md bg-muted/50 px-4 py-2.5 text-xs font-semibold text-foreground uppercase tracking-wide">CURRENCY</div>
                <div className="rounded-md bg-muted/50 px-4 py-2.5 text-xs font-semibold text-foreground uppercase tracking-wide">MAX PAYOUT / CREATOR</div>
                <div className="rounded-md bg-muted/50 px-4 py-2.5 text-xs font-semibold text-foreground uppercase tracking-wide">CREATORS RECEIVE</div>
                <div className="rounded-md bg-muted/50 px-4 py-2.5 text-xs font-semibold text-foreground uppercase tracking-wide">YOU PAY</div>
              </div>

              {/* Input row */}
              <div className="grid gap-3 px-2" style={{ gridTemplateColumns: '110px 1fr 1fr 1fr' }}>
                <div className="rounded border border-border bg-muted/50 flex items-center px-2 h-8 overflow-visible">
                  <CurrencySelector />
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

              {/* Results node — glassy black, stays visible once shown */}
              {(() => {
                const allFilled = maxPayoutPerCreator !== null && maxPayoutPerCreator > 0 && ratePerThousand > 0;
                const viewsPerCreator = allFilled ? Math.round((maxPayoutPerCreator / ratePerThousand) * 1000) : 0;
                const viewsEstimated = Math.round(viewsPerCreator * 1.4);
                if (allFilled && !resultsShown) setResultsShown(true);
                if (!allFilled && !resultsShown) return null;
                return (
                  <div
                    className="rounded-xl px-6 py-8 border animate-in fade-in slide-in-from-bottom-2 duration-500"
                    style={{
                      background: 'linear-gradient(135deg, hsla(0,0%,6%,0.97), hsla(0,0%,12%,0.93), hsla(0,0%,8%,0.95))',
                      borderColor: 'hsla(0,0%,100%,0.08)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 0 40px hsla(0,0%,100%,0.03), inset 0 1px 0 hsla(0,0%,100%,0.06)',
                    }}
                  >
                    <p className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'hsla(0,0%,100%,0.4)' }}>Views per creator to earn max payout</p>
                    <p className="text-4xl font-bold tracking-tight" style={{ color: 'hsla(0,0%,100%,0.95)', textShadow: '0 0 20px hsla(0,0%,100%,0.15)' }}>
                      {allFilled ? `${viewsPerCreator.toLocaleString()} – ${viewsEstimated.toLocaleString()}` : '—'}
                    </p>
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
                  <p className="text-xs text-muted-foreground mb-1">Deal</p>
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
              </div>

              {/* How Deals work */}
              <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">How Deals work</p>
                <p>Creators browse your deal and send a collaboration request. You review and accept or reject each one. Accepted creators then film and post their content.</p>
              </div>

              {/* Rate breakdown */}
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
                  <span className="text-sm text-muted-foreground">Jarla service fee (15%)</span>
                  <span className="text-sm font-medium text-foreground">{maxPayoutPerCreator ? fmtInline(Math.round(maxPayoutPerCreator * 0.15 * 100) / 100) : '0'}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total per creator</span>
                  <span className="text-lg font-bold text-foreground">{maxPayoutPerCreator ? fmtInline(Math.round(maxPayoutPerCreator * 1.15 * 100) / 100) : '0'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-center mt-8 pt-6 border-t border-border gap-3">
            {step < steps.length - 1 ? (
              <>
                {step === 1 && resultsShown && (
                  <div
                    className="rounded border border-border bg-muted/50 px-3 h-8 flex items-center text-sm font-semibold text-foreground animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '800ms', animationFillMode: 'both' }}
                  >
                    Total: {symbol}{maxPayoutPerCreator ? `${Math.round(maxPayoutPerCreator * 1.15).toLocaleString()}` : '0'} / creator
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Launching...' : 'Launch Deal'}
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

export default CreateDeal;
