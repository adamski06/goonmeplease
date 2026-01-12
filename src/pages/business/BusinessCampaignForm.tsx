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
import BudgetDialog from '@/components/BudgetDialog';
import PlatformDialog from '@/components/PlatformDialog';
import AudienceDialog from '@/components/AudienceDialog';

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
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [audienceDialogOpen, setAudienceDialogOpen] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);

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
      <div className="h-full flex animate-fade-in" style={{ animationDelay: '0s', animationDuration: '0.4s', animationFillMode: 'both' }}>
        {/* Left: Form Panel - sidebar style with grey background */}
        <div className="w-[440px] flex-shrink-0 h-screen overflow-hidden backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface border-r border-black/10 dark:border-white/20 relative">
          <div className="p-8 h-full overflow-y-auto scrollbar-thin">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              {/* Initial Setup - Centered when not all selected */}
              {!(selectedPlatform && (selectedRegions.length > 0 || selectedAudiences.length > 0) && formData.total_budget >= 10000) ? (
                <div className="flex-1 flex flex-col items-center justify-center pb-[12.5vh]">
                  {/* Centered setup container */}
                  <div className="w-full max-w-xs border border-input rounded-[4px] p-4">
                    <div className="space-y-6">
                      <button
                        type="button"
                        onClick={() => setPlatformDialogOpen(true)}
                        className="w-full h-10 px-3 flex items-center justify-center text-sm rounded-[4px] border border-input bg-background text-foreground hover:bg-accent transition-colors"
                      >
                        {selectedPlatform 
                          ? platforms.find(p => p.id === selectedPlatform)?.name
                          : 'Select platform'
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => setAudienceDialogOpen(true)}
                        className="w-full h-10 px-3 flex items-center justify-center text-sm rounded-[4px] border border-input bg-background text-foreground hover:bg-accent transition-colors"
                      >
                        {selectedRegions.length > 0 || selectedAudiences.length > 0 
                          ? `${selectedRegions.length > 0 ? `${selectedRegions.length} region${selectedRegions.length > 1 ? 's' : ''}` : ''}${selectedRegions.length > 0 && selectedAudiences.length > 0 ? ', ' : ''}${selectedAudiences.length > 0 ? `${selectedAudiences.length} audience${selectedAudiences.length > 1 ? 's' : ''}` : ''}`
                          : 'Select audience'
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => setBudgetDialogOpen(true)}
                        className="w-full h-10 px-3 flex items-center justify-center text-sm rounded-[4px] border border-input bg-background text-foreground hover:bg-accent transition-colors"
                      >
                        {formData.total_budget >= 10000 
                          ? `${formData.total_budget.toLocaleString()} SEK`
                          : 'Set budget'
                        }
                      </button>
                    </div>

                    {/* Progress indicator inside the node */}
                    <p className="mt-2 text-xs text-muted-foreground text-center leading-none">
                      {(() => {
                        let count = 0;
                        if (selectedPlatform) count++;
                        if (selectedRegions.length > 0 || selectedAudiences.length > 0) count++;
                        if (formData.total_budget >= 10000) count++;
                        return `${count}/3`;
                      })()}
                    </p>
                  </div>
                  
                  <BudgetDialog
                    open={budgetDialogOpen}
                    onOpenChange={setBudgetDialogOpen}
                    budget={formData.total_budget}
                    onBudgetChange={(budget) => setFormData({ ...formData, total_budget: budget })}
                  />
                </div>
              ) : (
                /* Full Form - Shown after all three are set */
                <div className="space-y-6">
                  {/* Compact selectors at top */}
                  <div className="space-y-4">
                    {/* Platform Selection */}
                    <div className="space-y-2 max-w-lg">
                      <Label>Target Platform</Label>
                      <button
                        type="button"
                        onClick={() => setPlatformDialogOpen(true)}
                        className="w-full h-10 px-3 text-center text-sm rounded-none border border-input bg-background text-foreground hover:bg-accent transition-colors"
                      >
                        {platforms.find(p => p.id === selectedPlatform)?.name}
                      </button>
                    </div>

                    {/* Target Audience Selection */}
                    <div className="space-y-2 max-w-lg">
                      <Label>Target Audience</Label>
                      <button
                        type="button"
                        onClick={() => setAudienceDialogOpen(true)}
                        className="w-full h-10 px-3 text-center text-sm rounded-none border border-input bg-background text-foreground hover:bg-accent transition-colors"
                      >
                        {`${selectedRegions.length > 0 ? `${selectedRegions.length} region${selectedRegions.length > 1 ? 's' : ''}` : ''}${selectedRegions.length > 0 && selectedAudiences.length > 0 ? ', ' : ''}${selectedAudiences.length > 0 ? `${selectedAudiences.length} audience${selectedAudiences.length > 1 ? 's' : ''}` : ''}`}
                      </button>
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-2 max-w-lg">
                      <Label>Budget</Label>
                      <button
                        type="button"
                        onClick={() => setBudgetDialogOpen(true)}
                        className="w-full h-10 px-3 text-center text-sm rounded-none border border-input bg-background text-foreground hover:bg-accent transition-colors"
                      >
                        {`${formData.total_budget.toLocaleString()} SEK`}
                      </button>
                      <BudgetDialog
                        open={budgetDialogOpen}
                        onOpenChange={setBudgetDialogOpen}
                        budget={formData.total_budget}
                        onBudgetChange={(budget) => setFormData({ ...formData, total_budget: budget })}
                      />
                    </div>
                  </div>

                  {/* Campaign Details - Only visible after setup */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-2 max-w-lg">
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

                    {/* Deadline Section */}
                    <div className="border-t border-border pt-6 space-y-4">
                      <h3 className="text-base font-semibold text-foreground">Deadline</h3>
                      <div className="space-y-2 max-w-lg">
                        <Label htmlFor="deadline">Campaign Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => navigate('/business/campaigns')}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : (isEditing ? 'Update Campaign' : 'Create Campaign')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Blurred preview at bottom - only show when setup incomplete */}
          {!(selectedPlatform && (selectedRegions.length > 0 || selectedAudiences.length > 0) && formData.total_budget >= 10000) && (
            <div className="absolute bottom-0 left-0 right-0 h-[12.5vh] overflow-hidden pointer-events-none select-none z-10">
              {/* Fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent" />

              <div className="relative h-full px-8 pb-6 pt-4">
                <div className="relative h-full">
                  <div className="space-y-2 blur-[2px]">
                    <div className="space-y-1 max-w-lg">
                      <Label className="text-xs">Campaign Title</Label>
                      <div className="w-full h-8 px-3 rounded-[4px] border border-input bg-background" />
                    </div>
                    <div className="space-y-1 max-w-lg">
                      <Label className="text-xs">Description</Label>
                      <div className="w-full h-10 px-3 rounded-[4px] border border-input bg-background" />
                    </div>
                  </div>

                  <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Complete the steps above</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="flex-1 min-w-0 h-screen flex flex-col">
          <CampaignPreview
            formData={formData}
            requirements={requirements}
            selectedPlatforms={selectedPlatform ? [selectedPlatform] : []}
            businessProfile={businessProfile}
            campaignVideoPreview={campaignVideoPreview}
            isSetupComplete={!!(selectedPlatform && (selectedRegions.length > 0 || selectedAudiences.length > 0) && formData.total_budget >= 10000)}
          />
        </div>
      </div>

      {/* Platform Dialog */}
      <PlatformDialog
        open={platformDialogOpen}
        onOpenChange={setPlatformDialogOpen}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
      />

      {/* Audience Dialog */}
      <AudienceDialog
        open={audienceDialogOpen}
        onOpenChange={setAudienceDialogOpen}
        selectedRegions={selectedRegions}
        selectedAudiences={selectedAudiences}
        onRegionsChange={setSelectedRegions}
        onAudiencesChange={setSelectedAudiences}
      />
    </BusinessLayout>
  );
};

export default BusinessCampaignForm;