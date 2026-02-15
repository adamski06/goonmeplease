import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

const CreateCampaign: React.FC = () => {
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [videoLength, setVideoLength] = useState('');
  const [maxEarnings, setMaxEarnings] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !brandName.trim()) {
      toast({ title: 'Required', description: 'Title and brand name are required.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const guidelinesArray = guidelines
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean);

    // business_id = auth.uid() per RLS policy
    const { error } = await supabase.from('campaigns').insert({
      title: title.trim(),
      brand_name: brandName.trim(),
      description: description.trim() || null,
      video_length: videoLength.trim() || null,
      max_earnings: maxEarnings ? parseFloat(maxEarnings) : null,
      total_budget: totalBudget ? parseFloat(totalBudget) : null,
      guidelines: guidelinesArray.length > 0 ? guidelinesArray : null,
      business_id: user.id,
      is_active: true,
      status: 'active',
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Campaign created', description: 'Your campaign is now live.' });
      navigate('/business');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-montserrat text-foreground">Create Campaign</h1>
          <p className="text-sm text-muted-foreground">Set up a new UGC campaign for creators</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Campaign title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Vibes 2026"
              className="h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Brand name *</Label>
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Your brand"
              className="h-10"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you're looking for from creators..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Video length</Label>
            <Input
              value={videoLength}
              onChange={(e) => setVideoLength(e.target.value)}
              placeholder="15-60s"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Max earnings (SEK)</Label>
            <Input
              type="number"
              value={maxEarnings}
              onChange={(e) => setMaxEarnings(e.target.value)}
              placeholder="5000"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Total budget (SEK)</Label>
            <Input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="50000"
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Guidelines</Label>
          <Textarea
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            placeholder="One guideline per line&#10;e.g. Show the product within 3 seconds&#10;Use trending audio"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">One per line</p>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full h-10 font-semibold mt-2">
          {isSubmitting ? 'Creating...' : 'Create Campaign'}
        </Button>
      </form>
    </div>
  );
};

export default CreateCampaign;
