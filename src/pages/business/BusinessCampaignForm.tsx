import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';

interface Tier {
  min_views: number;
  max_views: number | null;
  rate_per_view: number;
}

const BusinessCampaignForm: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    brand_name: '',
    title: '',
    description: '',
    deadline: '',
    total_budget: 0,
  });
  const [guidelines, setGuidelines] = useState<string[]>(['']);
  const [tiers, setTiers] = useState<Tier[]>([
    { min_views: 0, max_views: 1000, rate_per_view: 0.02 },
    { min_views: 1001, max_views: 10000, rate_per_view: 0.015 },
    { min_views: 10001, max_views: null, rate_per_view: 0.01 },
  ]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  // Auto-fill brand name from profile
  useEffect(() => {
    if (!isEditing && profile?.full_name) {
      setFormData(prev => ({ ...prev, brand_name: profile.full_name || '' }));
    }
  }, [profile, isEditing]);

  useEffect(() => {
    if (isEditing && user) {
      fetchCampaign();
    }
  }, [isEditing, user]);

  const fetchCampaign = async () => {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        brand_name: campaign.brand_name || '',
        title: campaign.title || '',
        description: campaign.description || '',
        deadline: campaign.deadline ? campaign.deadline.split('T')[0] : '',
        total_budget: campaign.total_budget || 0,
      });

      // Parse guidelines from newline-separated string to array
      if (campaign.guidelines) {
        const guidelinesArray = campaign.guidelines.split('\n').filter((g: string) => g.trim());
        setGuidelines(guidelinesArray.length > 0 ? guidelinesArray : ['']);
      }

      // Fetch tiers
      const { data: tierData } = await supabase
        .from('campaign_tiers')
        .select('*')
        .eq('campaign_id', id)
        .order('min_views', { ascending: true });

      if (tierData && tierData.length > 0) {
        setTiers(tierData.map(t => ({
          min_views: t.min_views,
          max_views: t.max_views,
          rate_per_view: Number(t.rate_per_view),
        })));
      }
    } catch (err) {
      console.error('Error fetching campaign:', err);
      toast({ title: 'Error loading campaign', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Convert guidelines array to newline-separated string
      const guidelinesString = guidelines.filter(g => g.trim()).join('\n');

      const campaignData = {
        business_id: user.id,
        brand_name: formData.brand_name,
        title: formData.title,
        description: formData.description,
        guidelines: guidelinesString,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        total_budget: formData.total_budget,
        is_active: true,
        status: 'active',
      };

      let campaignId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', id);

        if (error) throw error;

        // Delete existing tiers
        await supabase.from('campaign_tiers').delete().eq('campaign_id', id);
      } else {
        const { data, error } = await supabase
          .from('campaigns')
          .insert(campaignData)
          .select()
          .single();

        if (error) throw error;
        campaignId = data.id;
      }

      // Insert tiers
      const tierData = tiers.map(tier => ({
        campaign_id: campaignId,
        min_views: tier.min_views,
        max_views: tier.max_views,
        rate_per_view: tier.rate_per_view,
      }));

      const { error: tierError } = await supabase.from('campaign_tiers').insert(tierData);
      if (tierError) throw tierError;

      toast({ title: isEditing ? 'Campaign updated!' : 'Campaign created!' });
      navigate('/business/campaigns');
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      toast({ title: 'Error saving campaign', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addGuideline = () => {
    setGuidelines([...guidelines, '']);
  };

  const removeGuideline = (index: number) => {
    if (guidelines.length > 1) {
      setGuidelines(guidelines.filter((_, i) => i !== index));
    } else {
      setGuidelines(['']);
    }
  };

  const updateGuideline = (index: number, value: string) => {
    const newGuidelines = [...guidelines];
    newGuidelines[index] = value;
    setGuidelines(newGuidelines);
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMinViews = lastTier?.max_views ? lastTier.max_views + 1 : 0;
    setTiers([...tiers, { min_views: newMinViews, max_views: null, rate_per_view: 0.01 }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  const updateTier = (index: number, field: keyof Tier, value: number | null) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/business/campaigns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditing ? 'Edit Campaign' : 'Create Campaign'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditing ? 'Update your campaign details' : 'Set up a new advertising campaign'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                      placeholder="Your brand name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Summer Refresh Campaign"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you want creators to make..."
                    rows={3}
                  />
                </div>
                
                {/* Guidelines as list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Guidelines</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={addGuideline} className="h-7 px-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {guidelines.map((guideline, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm w-4">•</span>
                        <Input
                          value={guideline}
                          onChange={(e) => updateGuideline(index, e.target.value)}
                          placeholder="Enter a guideline..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGuideline(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Tiers */}
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payment Tiers</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addTier}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tier
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {tiers.map((tier, index) => (
                  <div key={index} className="flex items-end gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Min Views</Label>
                      <Input
                        type="number"
                        value={tier.min_views}
                        onChange={(e) => updateTier(index, 'min_views', parseInt(e.target.value) || 0)}
                        min={0}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Max Views (empty = unlimited)</Label>
                      <Input
                        type="number"
                        value={tier.max_views ?? ''}
                        onChange={(e) => updateTier(index, 'max_views', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Rate per View (SEK)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={tier.rate_per_view}
                        onChange={(e) => updateTier(index, 'rate_per_view', parseFloat(e.target.value) || 0)}
                        min={0}
                      />
                    </div>
                    {tiers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTier(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Budget & Deadline */}
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardHeader>
                <CardTitle>Budget & Deadline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_budget">Total Budget (SEK)</Label>
                    <Input
                      id="total_budget"
                      type="number"
                      value={formData.total_budget}
                      onChange={(e) => setFormData({ ...formData, total_budget: parseFloat(e.target.value) || 0 })}
                      placeholder="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/business/campaigns')}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : (isEditing ? 'Update Campaign' : 'Create Campaign')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaignForm;