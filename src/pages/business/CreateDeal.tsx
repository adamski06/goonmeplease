import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

// Reuse the same glassy green style helper
const glassyGreen = {
  background: 'linear-gradient(135deg, hsl(142 60% 40% / 0.18) 0%, hsl(142 60% 30% / 0.10) 100%)',
  border: '1px solid hsl(142 60% 45% / 0.45)',
  backdropFilter: 'blur(8px)',
  color: 'hsl(142 60% 28%)',
  boxShadow: 'inset 0 1px 0 hsl(142 60% 70% / 0.2), 0 0 0 1px hsl(142 60% 45% / 0.15)',
};

const defaultStyle = {
  background: 'transparent',
  border: '1px solid hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  boxShadow: 'none',
  backdropFilter: 'none',
};

const TOTAL_STEPS = 4;

const stepLabels = ['Ad Details', 'Set Rate', 'Set Budget', 'Review'];

const MAX_PAYOUT_OPTIONS = [10, 25, 50];

const CreateDeal: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Ad Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');

  // Step 2 — Rate
  const [ratePerView, setRatePerView] = useState(1.0);
  const [maxPayout, setMaxPayout] = useState<number | null>(null);

  // Step 3 — Budget
  const [budgetOption, setBudgetOption] = useState<'preset' | 'custom' | null>(null);
  const [customBudgetSlider, setCustomBudgetSlider] = useState(5000);

  // AI typing animation for description
  const [aiTyping, setAiTyping] = useState(false);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, []);

  const triggerAiDescription = () => {
    if (!title.trim() || aiTyping) return;
    setAiTyping(true);
    const sample = `We're looking for creators to authentically showcase ${title} to their audience. Create engaging content that highlights the key benefits and fits naturally with your personal style.`;
    let i = 0;
    setDescription('');
    const type = () => {
      if (i < sample.length) {
        setDescription(prev => prev + sample[i]);
        i++;
        typingRef.current = setTimeout(type, 18);
      } else {
        setAiTyping(false);
      }
    };
    type();
  };

  const getBudget = () => {
    if (budgetOption === 'preset') return 10000;
    return customBudgetSlider;
  };

  const canProceed = () => {
    if (step === 1) return title.trim().length > 0 && description.trim().length > 0;
    if (step === 2) return maxPayout !== null;
    if (step === 3) return budgetOption !== null;
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Not authenticated'); setSaving(false); return; }

    const { data: bp } = await supabase
      .from('business_profiles')
      .select('company_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const brandName = bp?.company_name || 'My Brand';

    const guidelinesList = guidelines
      .split('\n')
      .map(g => g.trim())
      .filter(Boolean);

    const { error } = await supabase.from('deals').insert({
      business_id: user.id,
      brand_name: brandName,
      title: title.trim(),
      description: description.trim(),
      guidelines: guidelinesList,
      rate_per_view: ratePerView,
      max_earnings: maxPayout,
      total_budget: getBudget(),
      status: 'active',
      is_active: true,
    });

    if (error) {
      toast.error('Failed to create deal');
      setSaving(false);
      return;
    }

    toast.success('Deal created!');
    navigate('/business/deals');
  };

  const sliderPercent = ((ratePerView - 0.5) / 2.5) * 100;
  const budgetSliderPercent = ((customBudgetSlider - 5000) / 95000) * 100;

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
      {/* Back */}
      <div className="w-full max-w-lg mb-6">
        <button
          onClick={() => step === 1 ? navigate('/business/deals') : setStep(s => s - 1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? 'Back to Deals' : 'Back'}
        </button>
      </div>

      {/* Step indicator */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => {
            const idx = i + 1;
            const done = idx < step;
            const active = idx === step;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-1.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    done ? 'bg-foreground text-background' :
                    active ? 'bg-foreground text-background' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {done ? <Check className="h-3 w-3" /> : idx}
                  </div>
                  <span className={`text-xs font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                </div>
                {i < TOTAL_STEPS - 1 && <div className={`flex-1 h-px ${done ? 'bg-foreground/40' : 'bg-border'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-lg">

        {/* Step 1 — Ad Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground font-montserrat mb-1">Ad Details</h2>
              <p className="text-sm text-muted-foreground">Describe the deal for creators</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">Deal Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={triggerAiDescription}
                placeholder="e.g. Summer Collection Collab"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what you're looking for…"
                rows={4}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
              />
              {aiTyping && <p className="text-[10px] text-muted-foreground mt-1">✦ AI is filling this in…</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-1.5 block">Guidelines <span className="font-normal normal-case text-muted-foreground">(one per line)</span></label>
              <textarea
                value={guidelines}
                onChange={e => setGuidelines(e.target.value)}
                placeholder="Show the product clearly&#10;Use natural lighting&#10;Tag @yourbrand"
                rows={4}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Set Rate */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground font-montserrat mb-1">Set your rate</h2>
              <p className="text-sm text-muted-foreground">How much will you pay per 1,000 views?</p>
            </div>

            {/* Rate slider */}
            <div className="rounded-[24px] p-6" style={{
              background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              border: '1px solid hsl(var(--border))',
            }}>
              <div className="flex items-end justify-between mb-4">
                <span className="text-4xl font-bold text-foreground">${ratePerView.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground mb-1">per 1k views</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.5}
                value={ratePerView}
                onChange={e => setRatePerView(Number(e.target.value))}
                className="rate-slider w-full"
                style={{
                  background: `linear-gradient(to right, hsl(0 0% 10%) ${sliderPercent}%, hsl(var(--border)) ${sliderPercent}%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">$0.5</span>
                <span className="text-[10px] text-muted-foreground">$3.0</span>
              </div>
            </div>

            {/* Max payout */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Max payout per creator</p>
              <div className="grid grid-cols-3 gap-3">
                {MAX_PAYOUT_OPTIONS.map(opt => {
                  const isSelected = maxPayout === opt;
                  return (
                    <div key={opt} className="relative">
                      {opt === 25 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={glassyGreen}>
                            Popular
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => setMaxPayout(opt)}
                        className="w-full rounded-[20px] p-4 text-center transition-all"
                        style={isSelected ? glassyGreen : defaultStyle}
                      >
                        <p className="text-xl font-bold">${opt}</p>
                        <p className="text-[11px] mt-0.5 opacity-70">max</p>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Set Budget */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground font-montserrat mb-1">Set your budget</h2>
              <p className="text-sm text-muted-foreground">How much total are you willing to spend?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Standard node */}
              <button
                onClick={() => setBudgetOption('preset')}
                className="rounded-[24px] p-6 text-left transition-all flex flex-col justify-between"
                style={{ minHeight: '230px', ...(budgetOption === 'preset' ? glassyGreen : defaultStyle) }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">Standard</p>
                  <p className="text-3xl font-bold">$10,000</p>
                </div>
                <p className="text-xs opacity-60 mt-4">Fixed budget — most popular starting point</p>
              </button>

              {/* Custom node */}
              <button
                onClick={() => setBudgetOption('custom')}
                className="rounded-[24px] p-6 text-left transition-all flex flex-col justify-between"
                style={{ minHeight: '230px', ...(budgetOption === 'custom' ? glassyGreen : defaultStyle) }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">Custom</p>
                  <p className="text-3xl font-bold">${customBudgetSlider.toLocaleString()}</p>
                </div>
                {budgetOption === 'custom' && (
                  <div className="mt-4" onClick={e => e.stopPropagation()}>
                    <input
                      type="range"
                      min={5000}
                      max={100000}
                      step={5000}
                      value={customBudgetSlider}
                      onChange={e => setCustomBudgetSlider(Number(e.target.value))}
                      className="rate-slider w-full"
                      style={{
                        background: `linear-gradient(to right, hsl(0 0% 10%) ${budgetSliderPercent}%, hsl(var(--border)) ${budgetSliderPercent}%)`,
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] opacity-50">$5k</span>
                      <span className="text-[9px] opacity-50">$100k</span>
                    </div>
                  </div>
                )}
                {budgetOption !== 'custom' && (
                  <p className="text-xs opacity-60 mt-4">Min $5,000 — drag to set</p>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground font-montserrat mb-1">Review & Launch</h2>
              <p className="text-sm text-muted-foreground">Creators will request to join your deal</p>
            </div>

            <div className="rounded-[24px] p-6 space-y-4" style={{
              background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              border: '1px solid hsl(var(--border))',
            }}>
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Title</span>
                <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{title}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rate</span>
                <span className="text-sm font-semibold text-foreground">${ratePerView.toFixed(1)} / 1k views</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Max payout / creator</span>
                <span className="text-sm font-semibold text-foreground">${maxPayout}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total budget</span>
                <span className="text-sm font-semibold text-foreground">${getBudget().toLocaleString()}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Jarla fee (10%)</span>
                <span className="text-sm font-semibold text-foreground">${(getBudget() * 0.1).toLocaleString()}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">${(getBudget() * 1.1).toLocaleString()}</span>
              </div>
            </div>

            <div className="rounded-[16px] p-4 text-sm text-muted-foreground" style={{
              background: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
            }}>
              <p className="font-semibold text-foreground mb-1">How Deals work</p>
              <p>Creators browse your deal and send a collaboration request. You review and accept or reject each request. Accepted creators then film and post their content.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'hsl(0 0% 10%)', color: 'hsl(0 0% 100%)' }}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'hsl(0 0% 10%)', color: 'hsl(0 0% 100%)' }}
            >
              {saving ? 'Launching…' : 'Launch Deal'}
              {!saving && <Check className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateDeal;
