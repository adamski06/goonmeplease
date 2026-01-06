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

// Platform logos as SVG components
const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin';

const platforms: { id: Platform; name: string; Logo: React.FC; color: string }[] = [
  { id: 'tiktok', name: 'TikTok', Logo: TikTokLogo, color: '#000000' },
  { id: 'instagram', name: 'Instagram', Logo: InstagramLogo, color: '#E4405F' },
  { id: 'youtube', name: 'YouTube', Logo: YouTubeLogo, color: '#FF0000' },
  { id: 'facebook', name: 'Facebook', Logo: FacebookLogo, color: '#1877F2' },
  { id: 'linkedin', name: 'LinkedIn', Logo: LinkedInLogo, color: '#0A66C2' },
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
                  <div className="flex gap-4">
                    {platforms.map(({ id, name, Logo, color }) => {
                      const isSelected = selectedPlatforms.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => togglePlatform(id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 w-20 ${
                            isSelected 
                              ? 'border-primary bg-primary/10 scale-105' 
                              : 'border-border bg-background hover:border-muted-foreground/50 hover:bg-muted/30'
                          }`}
                        >
                          <div 
                            className="w-10 h-10 flex items-center justify-center"
                            style={{ color: isSelected ? color : 'hsl(var(--muted-foreground))' }}
                          >
                            <Logo />
                          </div>
                          <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
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