import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CampaignPreview from '@/components/CampaignPreview';

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
  brand_logo_url: string | null;
  description: string | null;
  guidelines: string | null;
  total_budget: number | null;
  is_active: boolean;
}

interface CampaignStats {
  totalViews: number;
  totalSpent: number;
  pendingCount: number;
  approvedCount: number;
  creatorCount: number;
}

const BusinessCampaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<Record<string, CampaignStats>>({});
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [businessProfile, setBusinessProfile] = useState<{ company_name: string; logo_url: string | null } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
      fetchBusinessProfile();
    }
  }, [user]);

  const fetchBusinessProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('business_profiles')
      .select('company_name, logo_url')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setBusinessProfile(data);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('id, title, brand_name, brand_logo_url, description, guidelines, total_budget, is_active')
        .eq('business_id', user?.id)
        .order('created_at', { ascending: false });

      if (campaignsData) {
        setCampaigns(campaignsData);
        
        // Auto-select first campaign
        if (campaignsData.length > 0 && !selectedCampaign) {
          setSelectedCampaign(campaignsData[0]);
        }
        
        // Fetch stats for each campaign
        const statsPromises = campaignsData.map(async (campaign) => {
          const { data: submissions } = await supabase
            .from('content_submissions')
            .select('current_views, status, creator_id')
            .eq('campaign_id', campaign.id);

          const totalViews = submissions?.reduce((sum, s) => sum + (s.current_views || 0), 0) || 0;
          const pendingCount = submissions?.filter(s => s.status === 'pending_review').length || 0;
          const approvedCount = submissions?.filter(s => s.status === 'approved' || s.status === 'paid').length || 0;
          const uniqueCreators = new Set(submissions?.map(s => s.creator_id) || []);

          return {
            campaignId: campaign.id,
            stats: {
              totalViews,
              totalSpent: 0,
              pendingCount,
              approvedCount,
              creatorCount: uniqueCreators.size,
            }
          };
        });

        const allStats = await Promise.all(statsPromises);
        const statsMap: Record<string, CampaignStats> = {};
        allStats.forEach(({ campaignId, stats }) => {
          statsMap[campaignId] = stats;
        });
        setCampaignStats(statsMap);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const formatExact = (num: number) => {
    return num.toLocaleString('sv-SE');
  };

  // Parse requirements from guidelines string
  const getRequirements = (guidelines: string | null): string[] => {
    if (!guidelines) return [];
    return guidelines.split('\n').filter(g => g.trim());
  };

  return (
    <BusinessLayout>
      <div className="h-full flex animate-fade-in" style={{ animationDelay: '0s', animationDuration: '0.4s', animationFillMode: 'both' }}>
        {/* Left: Campaign List Panel */}
        <div className="w-[440px] flex-shrink-0 h-screen overflow-y-auto backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface border-r border-black/10 dark:border-white/20 scrollbar-thin">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
              <Button onClick={() => navigate('/business/campaigns/new')} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>

            {loadingCampaigns ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4 text-sm">No campaigns yet</p>
                <Button onClick={() => navigate('/business/campaigns/new')} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign, index) => {
                  const stats = campaignStats[campaign.id] || { totalViews: 0, totalSpent: 0, pendingCount: 0, approvedCount: 0, creatorCount: 0 };
                  const isSelected = selectedCampaign?.id === campaign.id;

                  return (
                    <button
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign)}
                      className={`w-full text-left p-4 rounded-[4px] transition-all duration-200 ${
                        isSelected 
                          ? 'bg-white dark:bg-white/10 shadow-[0_0_15px_rgba(0,0,0,0.08)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]' 
                          : 'hover:bg-white/50 dark:hover:bg-white/5'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 truncate">{campaign.brand_name}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-semibold text-foreground">{formatExact(stats.totalViews)}</div>
                          <div className="text-xs text-muted-foreground">views</div>
                        </div>
                      </div>
                      
                      {/* Stats row */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{stats.creatorCount} creators</span>
                        <span>{stats.pendingCount} pending</span>
                        <span>{stats.approvedCount} approved</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview Area */}
        <div className="flex-1 overflow-y-auto bg-background p-8 scrollbar-thin">
          <div className="flex items-start justify-center min-h-full">
            {selectedCampaign ? (
              <div className="flex flex-col items-center gap-6">
                <CampaignPreview
                  formData={{
                    brand_name: selectedCampaign.brand_name,
                    title: selectedCampaign.title,
                    description: selectedCampaign.description || '',
                    deadline: '',
                    total_budget: selectedCampaign.total_budget || 0,
                  }}
                  requirements={getRequirements(selectedCampaign.guidelines)}
                  selectedPlatforms={[]}
                  businessProfile={businessProfile}
                />
                
                {/* Action buttons below preview */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/business/campaigns/${selectedCampaign.id}/edit`)}
                  >
                    Edit Campaign
                  </Button>
                  <Button
                    onClick={() => navigate(`/business/campaigns/${selectedCampaign.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <p>Select a campaign to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaigns;
