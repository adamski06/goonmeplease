import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('id, title, brand_name, total_budget, is_active')
        .eq('business_id', user?.id)
        .order('created_at', { ascending: false });

      if (campaignsData) {
        setCampaigns(campaignsData);
        
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

  const formatNumber = (num: number) => {
    return num.toLocaleString('sv-SE');
  };

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <Button onClick={() => navigate('/business/campaigns/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>

          {loadingCampaigns ? (
            <div className="flex items-center justify-start py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12">
              <p className="text-muted-foreground mb-4">No campaigns yet</p>
              <Button onClick={() => navigate('/business/campaigns/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign, index) => {
                const stats = campaignStats[campaign.id] || { totalViews: 0, totalSpent: 0, pendingCount: 0, approvedCount: 0, creatorCount: 0 };

                return (
                  <button
                    key={campaign.id}
                    onClick={() => navigate(`/business/campaigns/${campaign.id}`)}
                    className="w-full flex items-center justify-between p-8 bg-white dark:bg-white/5 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-shadow opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    {/* Left: Title */}
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-foreground">{campaign.title}</h3>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex items-center gap-12">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">{formatNumber(stats.totalViews)}</div>
                        <div className="text-sm text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">{stats.creatorCount}</div>
                        <div className="text-sm text-muted-foreground">Creators</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">{stats.pendingCount}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">{stats.approvedCount}</div>
                        <div className="text-sm text-muted-foreground">Approved</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaigns;
