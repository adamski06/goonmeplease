import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const steps = ['Ad Details', 'Target Audience', 'Budget'];

const CreateCampaign: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Step 1: Ad details
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [videoLength, setVideoLength] = useState('');

  // Step 2: Audience
  const [category, setCategory] = useState('');
  const [reach, setReach] = useState('worldwide');

  // Step 3: Budget
  const [maxEarnings, setMaxEarnings] = useState('');
  const [totalBudget, setTotalBudget] = useState('');

  const canProceed = () => {
    if (step === 0) return title.trim() && brandName.trim();
    if (step === 1) return true;
    if (step === 2) return true;
    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const guidelinesArray = guidelines.split('\n').map((g) => g.trim()).filter(Boolean);

    const { error } = await supabase.from('campaigns').insert({
      title: title.trim(),
      brand_name: brandName.trim(),
      description: description.trim() || null,
      video_length: videoLength.trim() || null,
      max_earnings: maxEarnings ? parseFloat(maxEarnings) : null,
      total_budget: totalBudget ? parseFloat(totalBudget) : null,
      guidelines: guidelinesArray.length > 0 ? guidelinesArray : null,
      category: category.trim() || null,
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

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                i === step
                  ? 'text-foreground'
                  : i < step
                  ? 'text-muted-foreground hover:text-foreground cursor-pointer'
                  : 'text-muted-foreground/40'
              }`}
            >
              <span className={`h-6 w-6 rounded-full text-xs flex items-center justify-center font-semibold ${
                i < step
                  ? 'bg-foreground text-background'
                  : i === step
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? 'bg-foreground' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Ad Details */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground font-montserrat">Create your ad</h2>
            <p className="text-sm text-muted-foreground mt-1">Start with the basics — what's the campaign about?</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Campaign title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Vibes 2026" className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Brand name *</Label>
            <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Your brand" className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you're looking for..." rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Video length</Label>
            <Input value={videoLength} onChange={(e) => setVideoLength(e.target.value)} placeholder="15-60s" className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Guidelines</Label>
            <Textarea value={guidelines} onChange={(e) => setGuidelines(e.target.value)} placeholder={"One per line\ne.g. Show the product within 3 seconds\nUse trending audio"} rows={4} />
            <p className="text-xs text-muted-foreground">One guideline per line</p>
          </div>
        </div>
      )}

      {/* Step 2: Audience */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground font-montserrat">Target audience</h2>
            <p className="text-sm text-muted-foreground mt-1">Who should see this campaign?</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Fashion, Tech, Food" className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Reach</Label>
            <div className="flex gap-2">
              {['worldwide', 'nordic', 'local'].map((r) => (
                <button
                  key={r}
                  onClick={() => setReach(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    reach === r
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Budget */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground font-montserrat">Set your budget</h2>
            <p className="text-sm text-muted-foreground mt-1">How much do you want to spend?</p>
          </div>

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
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => step === 0 ? navigate('/business') : setStep(step - 1)}
          className="gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        {step < steps.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="gap-1.5"
          >
            Next
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !canProceed()}
            className="gap-1.5"
          >
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateCampaign;
