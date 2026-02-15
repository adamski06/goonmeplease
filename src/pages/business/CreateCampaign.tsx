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

const steps = ['Ad Details', 'Target Audience', 'Budget'];

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

  // Step 3: Budget
  const [maxEarnings, setMaxEarnings] = useState('');
  const [totalBudget, setTotalBudget] = useState('');

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return true;
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
    if (updates.total_budget !== undefined) setTotalBudget(String(updates.total_budget));
  };

  const handleRequirementsUpdate = (requirements: string[]) => {
    setGuidelinesList(requirements.length > 0 ? requirements : ['']);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const guidelinesArray = guidelinesList.map((g) => g.trim()).filter(Boolean);

    const { data: bp } = await supabase.from('business_profiles').select('company_name').eq('user_id', user.id).maybeSingle();

    const { error } = await supabase.from('campaigns').insert({
      title: title.trim(),
      brand_name: bp?.company_name || 'My Brand',
      description: description.trim() || null,
      max_earnings: maxEarnings ? parseFloat(maxEarnings) : null,
      total_budget: totalBudget ? parseFloat(totalBudget) : null,
      guidelines: guidelinesArray.length > 0 ? guidelinesArray : null,
      category: audience.trim() || null,
      business_id: user.id,
      is_active: true,
      status: 'active',
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Campaign created' });
      navigate('/business');
    }
    setIsSubmitting(false);
  };

  const formData = {
    brand_name: '',
    title,
    description,
    deadline: '',
    total_budget: totalBudget ? parseFloat(totalBudget) : 0,
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
        />
      </div>

      {/* Form panel */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-10">
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
              <h2 className="text-xl font-bold text-foreground font-montserrat">Target audience</h2>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Who should see this campaign?</Label>
                <Input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Gen Z fashion lovers in Scandinavia"
                  className="h-10"
                />
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground font-montserrat">Set your budget</h2>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Max earnings per creator (SEK)</Label>
                <Input type="number" value={maxEarnings} onChange={(e) => setMaxEarnings(e.target.value)} placeholder="5000" className="h-10" />
                <p className="text-xs text-muted-foreground">The maximum a single creator can earn</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Total campaign budget (SEK)</Label>
                <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="50000" className="h-10" />
                <p className="text-xs text-muted-foreground">Total amount allocated for this campaign</p>
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
                disabled={isSubmitting || !canProceed()}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Campaign'}
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
