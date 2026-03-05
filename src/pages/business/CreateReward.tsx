import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Plus, X, ChevronDown, Ticket, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CampaignChat from '@/components/CampaignChat';

const steps = ['Ad Details', 'Reward', 'Review'];
const VIEW_PRESETS = [
  { label: 'Just by posting', value: 0 },
  { label: '100 views', value: 100 },
  { label: '250 views', value: 250 },
  { label: '500 views', value: 500 },
  { label: '1,000 views', value: 1000 },
  { label: 'Custom', value: -1 },
];

const CreateReward: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Step 1
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guidelinesList, setGuidelinesList] = useState<string[]>(['']);
  const [audience, setAudience] = useState('');

  // Step 2
  const [rewardDescription, setRewardDescription] = useState('');
  const [viewsPreset, setViewsPreset] = useState<number | null>(null);
  const [customViews, setCustomViews] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');

  const effectiveViews = viewsPreset === -1 ? (parseInt(customViews) || 0) : (viewsPreset ?? 0);
  const selectedPresetLabel = VIEW_PRESETS.find(p => p.value === viewsPreset)?.label;

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return rewardDescription.trim().length > 0 && viewsPreset !== null && (viewsPreset !== -1 || parseInt(customViews) > 0);
    return true;
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

  const addCouponCode = () => {
    const code = newCouponCode.trim();
    if (code && !couponCodes.includes(code)) {
      setCouponCodes([...couponCodes, code]);
      setNewCouponCode('');
    }
  };

  const removeCouponCode = (i: number) => setCouponCodes(couponCodes.filter((_, idx) => idx !== i));

  const exportCouponCodes = () => {
    const csv = couponCodes.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coupon-codes.csv';
    a.click();
    URL.revokeObjectURL(url);
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

    const { error } = await supabase.from('reward_ads').insert({
      business_id: user.id,
      brand_name: bp?.company_name || 'My Brand',
      brand_logo_url: bp?.logo_url || null,
      title: title.trim(),
      description: description.trim() || null,
      guidelines: guidelinesArray.length > 0 ? guidelinesArray : null,
      category: audience.trim() || null,
      reward_description: rewardDescription.trim(),
      views_required: effectiveViews,
      is_active: true,
      status: 'active',
    } as any);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    toast({ title: 'Reward ad launched!' });
    navigate('/business/deals');
  };

  const formData = { brand_name: '', title, description, deadline: '', total_budget: 0 };

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

  const stepTitles = ['Ad Details', 'Choose your reward', 'Review & Launch'];
  const [portalReady, setPortalReady] = useState(false);
  React.useEffect(() => { setPortalReady(true); }, []);
  const topbarCenter = portalReady ? document.getElementById('topbar-center') : null;
  const topbarProgress = portalReady ? document.getElementById('topbar-progress') : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
        {/* Chat panel */}
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
          <div className="mx-auto px-6 flex-1 flex flex-col w-full max-w-xl justify-center">

            {/* Step 1: Ad Details */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Ad title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Rewards 2026" className="h-10" />
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
                        placeholder={`User must include...`}
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

            {/* Step 2: Choose your reward */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">What reward will creators receive? *</Label>
                  <Input
                    value={rewardDescription}
                    onChange={(e) => setRewardDescription(e.target.value)}
                    placeholder="e.g. 20% discount code, free product sample..."
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">Describe the reward your company will give creators who complete this ad.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Views required to earn reward *</Label>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between h-10 rounded-[4px] border border-input bg-background px-3 text-sm transition-colors hover:border-foreground/50"
                    >
                      <span className={selectedPresetLabel ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedPresetLabel || 'Select views required...'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                        {VIEW_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => {
                              setViewsPreset(preset.value);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-accent ${viewsPreset === preset.value ? 'bg-accent font-medium text-foreground' : 'text-foreground'}`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {viewsPreset === -1 && (
                    <div className="mt-2">
                      <Input
                        type="number"
                        value={customViews}
                        onChange={(e) => setCustomViews(e.target.value)}
                        placeholder="Enter custom view count"
                        className="h-10"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 2 && (
              <div className="space-y-6">
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
                    <p className="text-xs text-muted-foreground mb-1">Reward</p>
                    <p className="text-sm font-semibold text-foreground">{rewardDescription}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Views required</p>
                    <p className="text-sm font-semibold text-foreground">
                      {effectiveViews === 0 ? 'Just by posting' : `${effectiveViews.toLocaleString()} views`}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">How Rewards work</p>
                  <p>Creators post a video about your brand. Once they hit the required views, they receive your reward. No monetary payout — you provide the reward directly.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-center mt-8 pt-6 gap-3">
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
                  {isSubmitting ? 'Launching...' : 'Launch Reward Ad'}
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

export default CreateReward;
