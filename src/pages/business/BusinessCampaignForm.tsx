import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, X, Upload, Image, Video } from 'lucide-react';

interface Tier {
  min_views: number;
  max_views: number | null;
  rate_per_view: number;
}

const BusinessCampaignForm: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<{ company_name: string; logo_url: string | null } | null>(null);
  const [formData, setFormData] = useState({
    brand_name: '',
    title: '',
    description: '',
    deadline: '',
    total_budget: 0,
  });
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [requirementImages, setRequirementImages] = useState<File[]>([]);
  const [requirementImagePreviews, setRequirementImagePreviews] = useState<string[]>([]);
  const [campaignVideo, setCampaignVideo] = useState<File | null>(null);
  const [campaignVideoPreview, setCampaignVideoPreview] = useState<string>('');
  const [tiers, setTiers] = useState<Tier[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  // Fetch business profile
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('business_profiles')
        .select('company_name, logo_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setBusinessProfile(data);
        if (!isEditing) {
          setFormData(prev => ({ ...prev, brand_name: data.company_name }));
        }
      }
    };
    
    fetchBusinessProfile();
  }, [user, isEditing]);

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

      // Parse requirements from newline-separated string to array
      if (campaign.guidelines) {
        const requirementsArray = campaign.guidelines.split('\n').filter((g: string) => g.trim());
        setRequirements(requirementsArray.length > 0 ? requirementsArray : ['']);
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
      // Convert requirements array to newline-separated string
      const requirementsString = requirements.filter(g => g.trim()).join('\n');

      const campaignData = {
        business_id: user.id,
        brand_name: formData.brand_name,
        brand_logo_url: businessProfile?.logo_url || null,
        title: formData.title,
        description: formData.description,
        guidelines: requirementsString,
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

      // Insert tiers only if there are any
      if (tiers.length > 0) {
        const tierData = tiers.map(tier => ({
          campaign_id: campaignId,
          min_views: tier.min_views,
          max_views: tier.max_views,
          rate_per_view: tier.rate_per_view,
        }));

        const { error: tierError } = await supabase.from('campaign_tiers').insert(tierData);
        if (tierError) throw tierError;
      }

      toast({ title: isEditing ? 'Campaign updated!' : 'Campaign created!' });
      navigate('/business/campaigns');
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      toast({ title: 'Error saving campaign', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    } else {
      setRequirements(['']);
    }
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setRequirementImages([...requirementImages, ...newFiles]);
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setRequirementImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setRequirementImages(requirementImages.filter((_, i) => i !== index));
    setRequirementImagePreviews(requirementImagePreviews.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCampaignVideo(file);
      const url = URL.createObjectURL(file);
      setCampaignVideoPreview(url);
    }
  };

  const removeVideo = () => {
    setCampaignVideo(null);
    setCampaignVideoPreview('');
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

                {/* Video Upload */}
                <div className="space-y-2">
                  <Label>Campaign Video</Label>
                  {campaignVideoPreview ? (
                    <div className="relative w-32 aspect-[9/16]">
                      <video 
                        src={campaignVideoPreview} 
                        controls 
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeVideo}
                        className="absolute top-2 right-2 h-6 w-6 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 aspect-[9/16] border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Video className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground text-center px-2">Upload video</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {/* Requirements as list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Requirements</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={addRequirement} className="h-7 px-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm w-4">•</span>
                        <Input
                          value={requirement}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          placeholder="Enter a requirement..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRequirement(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirement Images */}
                <div className="space-y-2">
                  <Label>Reference Images</Label>
                  <div className="flex flex-wrap gap-3">
                    {requirementImagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img 
                          src={preview} 
                          alt={`Reference ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-background border border-border rounded-full hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Image className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
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
                {tiers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No payment tiers added yet.</p>
                    <p className="text-xs mt-1">Click "Add Tier" to create payment tiers based on views.</p>
                  </div>
                ) : (
                  tiers.map((tier, index) => (
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTier(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
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