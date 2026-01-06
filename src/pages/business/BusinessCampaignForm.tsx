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

// Platform logos as SVG components with brand colors
const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10">
    <path fill="#25F4EE" d="M9.37 23.5a7.12 7.12 0 0 1-7.12-7.12 7.12 7.12 0 0 1 7.12-7.13c.39 0 .77.03 1.15.09v3.63a3.51 3.51 0 0 0-1.15-.2 3.52 3.52 0 0 0 0 7.03 3.52 3.52 0 0 0 3.52-3.52V0h3.5a5.63 5.63 0 0 0 5.62 5.62v3.5a9.11 9.11 0 0 1-5.62-1.93v9.19a7.12 7.12 0 0 1-7.02 7.12z"/>
    <path fill="#FE2C55" d="M10.52 23.5a7.12 7.12 0 0 1-7.12-7.12 7.12 7.12 0 0 1 7.12-7.13c.39 0 .77.03 1.15.09v3.63a3.51 3.51 0 0 0-1.15-.2 3.52 3.52 0 0 0 0 7.03 3.52 3.52 0 0 0 3.52-3.52V0h3.5a5.63 5.63 0 0 0 5.62 5.62v3.5a9.11 9.11 0 0 1-5.62-1.93v9.19a7.12 7.12 0 0 1-7.02 7.12z" opacity="0.5"/>
    <path fill="#000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10">
    <defs>
      <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="5%" stopColor="#fdf497"/>
        <stop offset="45%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-gradient)"/>
    <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.5"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/>
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#fff" strokeWidth="1.5"/>
  </svg>
);

const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10">
    <rect width="24" height="24" rx="6" fill="#FF0000"/>
    <path fill="#fff" d="M9.5 16.5v-9l7 4.5-7 4.5z"/>
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10">
    <rect width="24" height="24" rx="6" fill="#1877F2"/>
    <path fill="#fff" d="M16.5 12.5h-2.5v8h-3v-8h-2v-2.5h2v-1.5c0-2.5 1-4 3.5-4h2.5v2.5h-1.5c-1 0-1.5.5-1.5 1.5v1.5h3l-.5 2.5z"/>
  </svg>
);

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10">
    <rect width="24" height="24" rx="6" fill="#0A66C2"/>
    <path fill="#fff" d="M8 10h-2v8h2v-8zm-1-3.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm9 3.5h-2.5c0 0 0 3.5 0 5.5 0 1-.5 1.5-1.25 1.5s-1.25-.5-1.25-1.5v-5.5h-2v6c0 2 1 3 2.5 3s2-.5 2.5-1.5v1h2v-8.5z"/>
  </svg>
);

type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin';

const platforms: { id: Platform; name: string; Logo: React.FC }[] = [
  { id: 'tiktok', name: 'TikTok', Logo: TikTokLogo },
  { id: 'instagram', name: 'Instagram', Logo: InstagramLogo },
  { id: 'youtube', name: 'YouTube', Logo: YouTubeLogo },
  { id: 'facebook', name: 'Facebook', Logo: FacebookLogo },
  { id: 'linkedin', name: 'LinkedIn', Logo: LinkedInLogo },
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
      <BusinessLayout hideChat>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </BusinessLayout>
    );
  }

  const handleFormUpdate = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleRequirementsUpdate = (newRequirements: string[]) => {
    setRequirements(newRequirements);
  };

  return (
    <BusinessLayout
      formData={formData}
      requirements={requirements}
      onFormUpdate={handleFormUpdate}
      onRequirementsUpdate={handleRequirementsUpdate}
    >
      <div className="p-8 animate-fade-in" style={{ animationDelay: '0s', animationDuration: '0.4s', animationFillMode: 'both' }}>
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
            {/* Campaign Info */}
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {businessProfile?.logo_url ? (
                    <img 
                      src={businessProfile.logo_url} 
                      alt="Company logo" 
                      className="h-10 w-10 object-cover rounded-sm" 
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-sm bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold text-muted-foreground">
                        {businessProfile?.company_name?.charAt(0)?.toUpperCase() || 'B'}
                      </span>
                    </div>
                  )}
                  <CardTitle>{businessProfile?.company_name || 'Your Business'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Platform Selection */}
                <div className="space-y-3">
                  <Label>Target Platforms</Label>
                  <div className="flex gap-6">
                    {platforms.map(({ id, name, Logo }) => {
                      const isSelected = selectedPlatforms.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => togglePlatform(id)}
                          className={`flex flex-col items-center gap-2 transition-all duration-200 ${
                            isSelected ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'
                          }`}
                        >
                          <Logo />
                          <span className="text-xs font-medium text-foreground">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
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


            {/* Budget */}
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardHeader>
                <CardTitle>Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
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
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardHeader>
                <CardTitle>Deadline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaignForm;