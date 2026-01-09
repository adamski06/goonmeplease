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
import { ArrowLeft, Plus, X, Image, Video, Loader2 } from 'lucide-react';
import CampaignPreview from '@/components/CampaignPreview';

// Platform logo imports
import tiktokLogo from '@/assets/platforms/tiktok.png';
import instagramLogo from '@/assets/platforms/instagram.png';
import youtubeLogo from '@/assets/platforms/youtube.png';
import facebookLogo from '@/assets/platforms/facebook.png';
import linkedinLogo from '@/assets/platforms/linkedin.png';

type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin';

const platforms: { id: Platform; name: string; logo: string }[] = [
  { id: 'tiktok', name: 'TikTok', logo: tiktokLogo },
  { id: 'instagram', name: 'Instagram', logo: instagramLogo },
  { id: 'youtube', name: 'YouTube', logo: youtubeLogo },
  { id: 'facebook', name: 'Facebook', logo: facebookLogo },
  { id: 'linkedin', name: 'LinkedIn', logo: linkedinLogo },
];

const BusinessCampaignForm: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  const togglePlatform = (platformId: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  // Brief loading delay for smooth transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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

      } else {
        const { data, error } = await supabase
          .from('campaigns')
          .insert(campaignData)
          .select()
          .single();

        if (error) throw error;
        campaignId = data.id;
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


  if (loading || initialLoading) {
    return (
      <BusinessLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </BusinessLayout>
    );
  }


  return (
    <BusinessLayout>
      <div className="min-h-full p-8 animate-fade-in flex gap-8 items-start" style={{ animationDelay: '0s', animationDuration: '0.4s', animationFillMode: 'both' }}>
        {/* Left: Form */}
        <div className="w-[440px] flex-shrink-0">
          <h2 className="text-base font-medium text-muted-foreground mb-4">Create Campaign</h2>
          <form onSubmit={handleSubmit} className="space-y-6 pb-8">
            {/* Campaign Info */}
            <Card className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface border-border rounded-[4px]">
              <CardContent className="pt-6 space-y-4">
                {/* Platform Selection */}
                <div className="space-y-6 max-w-lg">
                  <Label>Target Platforms</Label>
                  <div className="flex justify-center gap-5">
                    {platforms.map(({ id, name, logo }) => {
                      const isSelected = selectedPlatforms.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => togglePlatform(id)}
                          className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
                            isSelected ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-[2px] overflow-hidden">
                            <img 
                              src={logo} 
                              alt={name} 
                              className={`w-full h-full object-cover ${
                                id === 'instagram' ? 'scale-125' : id === 'youtube' ? 'scale-[1.15]' : ''
                              }`}
                            />
                          </div>
                          <span className="text-xs font-medium text-foreground">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 space-y-2 max-w-lg">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Summer Refresh Campaign"
                    required
                  />
                </div>
                <div className="space-y-2 max-w-lg">
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
                <div className="space-y-2 max-w-lg">
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


            {/* Budget */}
            <Card className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface border-border rounded-[4px]">
              <CardHeader>
                <CardTitle>Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-lg">
                  <Label htmlFor="total_budget">Total Budget (SEK)</Label>
                  <Input
                    id="total_budget"
                    type="number"
                    min={10000}
                    value={formData.total_budget || ''}
                    onChange={(e) => setFormData({ ...formData, total_budget: Math.max(0, parseFloat(e.target.value) || 0) })}
                    placeholder="10000"
                  />
                  <p className="text-xs text-muted-foreground">Minimum budget: 10,000 SEK</p>
                </div>

                {/* Budget Calculator */}
                {formData.total_budget >= 10000 && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-foreground">Estimated reach</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-foreground">
                          {Math.floor((formData.total_budget / 10000) * 100000).toLocaleString()}+
                        </p>
                        <p className="text-xs text-muted-foreground">Guaranteed views</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-foreground">
                          {Math.floor((formData.total_budget / 10000) * 10)}+
                        </p>
                        <p className="text-xs text-muted-foreground">Creators</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground border-t border-border pt-3">
                      10,000 SEK = 100,000+ views • 10+ creators
                    </p>
                  </div>
                )}

                {formData.total_budget > 0 && formData.total_budget < 10000 && (
                  <p className="text-xs text-destructive">
                    Budget must be at least 10,000 SEK
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Deadline */}
            <Card className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface border-border rounded-[4px]">
              <CardHeader>
                <CardTitle>Deadline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-lg">
                  <Label htmlFor="deadline">Campaign Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
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
        {/* Right: Preview */}
        <div className="flex-1 min-w-0 sticky top-8">
          <CampaignPreview
            formData={formData}
            requirements={requirements}
            selectedPlatforms={selectedPlatforms}
            businessProfile={businessProfile}
            campaignVideoPreview={campaignVideoPreview}
          />
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaignForm;