import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import CampaignChat from '@/components/CampaignChat';

// Exponential slider for rate: 75% of slider = $0.50–$3.00, remaining 25% = $3.00–$10.00
const RATE_MIN = 0.5;
const RATE_MID = 5;
const RATE_MAX = 10;
const RATE_BREAK = 75;
const rateToSlider = (rate: number): number => {
  if (rate <= RATE_MIN) return 0;
  if (rate <= RATE_MID) return ((Math.log(rate) - Math.log(RATE_MIN)) / (Math.log(RATE_MID) - Math.log(RATE_MIN))) * RATE_BREAK;
  return RATE_BREAK + ((Math.log(rate) - Math.log(RATE_MID)) / (Math.log(RATE_MAX) - Math.log(RATE_MID))) * (100 - RATE_BREAK);
};
const sliderToRate = (s: number): number => {
  if (s <= 0) return RATE_MIN;
  const logVal = s <= RATE_BREAK
    ? Math.log(RATE_MIN) + (s / RATE_BREAK) * (Math.log(RATE_MID) - Math.log(RATE_MIN))
    : Math.log(RATE_MID) + ((s - RATE_BREAK) / (100 - RATE_BREAK)) * (Math.log(RATE_MAX) - Math.log(RATE_MID));
  return Math.round(Math.exp(logVal) * 10) / 10;
};

const steps = ['Ad Details', 'Target Audience', 'Rate', 'Review'];

const CreateDeal: React.FC = () => {
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
  const [ratePerThousand, setRatePerThousand] = useState(1);
  const [maxPayoutPerCreator, setMaxPayoutPerCreator] = useState<number | null>(null);
  const [customPayoutInput, setCustomPayoutInput] = useState('');
  const [payoutMode, setPayoutMode] = useState<'preset' | 'custom' | null>(null);

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return true;
    if (step === 2) return ratePerThousand > 0 && maxPayoutPerCreator !== null && maxPayoutPerCreator > 0;
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
        <span className="text-sm font-semibold text-foreground font-montserrat">Create a Deal</span>
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
                <Label className="text-sm font-medium">Who should see this deal?</Label>
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
                <Slider
                  value={[rateToSlider(ratePerThousand)]}
                  onValueChange={(value) => {
                    setRatePerThousand(sliderToRate(value[0]));
                  }}
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0.50</span>
                  <span>$10.00</span>
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

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-xl font-bold text-foreground font-montserrat">Review & Launch</h2>
              </div>

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
                  <p className="text-sm font-semibold text-foreground">${ratePerThousand} / 1,000 views</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Max payout per creator</p>
                  <p className="text-sm font-semibold text-foreground">${maxPayoutPerCreator}</p>
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
                  <span className="text-sm font-medium text-foreground">${ratePerThousand}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Max payout per creator</span>
                  <span className="text-lg font-bold text-foreground">${maxPayoutPerCreator}</span>
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
