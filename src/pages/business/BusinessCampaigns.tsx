import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
              totalSpent: 0, // Would need earnings calculation
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

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <Button onClick={() => navigate('/business/campaigns/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>

          {loadingCampaigns ? (
            <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No campaigns yet. Create your first campaign to get started.</p>
              <Button onClick={() => navigate('/business/campaigns/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-32">
              {campaigns.map((campaign, index) => {
                const stats = campaignStats[campaign.id] || { totalViews: 0, totalSpent: 0, pendingCount: 0, approvedCount: 0, creatorCount: 0 };
                const budget = campaign.total_budget || 0;
                const budgetLeft = budget - stats.totalSpent;
                const cpv = stats.totalViews > 0 ? (stats.totalSpent / stats.totalViews).toFixed(3) : '0.000';

                return (
                  <Card 
                    key={campaign.id}
                    onClick={() => navigate(`/business/campaigns/${campaign.id}`)}
                    className="bg-white/40 dark:bg-dark-surface border-0 rounded-[4px] pt-3 pb-6 px-6 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_20px_rgba(0,0,0,0.4)] opacity-0 animate-fade-in cursor-pointer hover:shadow-[0_0_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-shadow" 
                    style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <h2 className="text-2xl font-bold font-geist mt-2 mb-3">{campaign.title}</h2>
                    <div className="flex items-stretch gap-3">
                      <div className="flex flex-col gap-2 flex-1">
                        <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                          <CardContent className="px-8 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-6xl font-normal font-montserrat">{formatExact(stats.totalViews)}</span>
                              <span className="text-6xl font-normal font-montserrat">views</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                          <CardContent className="px-6 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-normal font-montserrat">{formatExact(stats.totalSpent)} sek</span>
                              <span className="text-3xl font-normal font-montserrat">/</span>
                              <span className="text-3xl font-normal font-montserrat">{formatExact(budget)} sek</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                          <CardContent className="px-6 py-2">
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="w-8 h-14 bg-muted rounded-[4px]" />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                        <CardContent className="px-8 py-6 h-full">
                          <div className="flex h-full flex-col justify-between font-sana">
                            <div className="flex justify-between items-baseline gap-4">
                              <span className="text-base text-muted-foreground font-normal">Budget</span>
                              <span className="text-lg font-normal">{budget >= 1000 ? `${Math.round(budget / 1000)}k` : budget}</span>
                            </div>
                            <div className="flex justify-between items-baseline gap-4">
                              <span className="text-base text-muted-foreground font-normal">Left</span>
                              <span className="text-lg font-normal">{budgetLeft >= 1000 ? `${Math.round(budgetLeft / 1000)}k` : budgetLeft}</span>
                            </div>
                            <div className="flex justify-between items-baseline gap-4">
                              <span className="text-base text-muted-foreground font-normal">Pending</span>
                              <span className="text-lg font-normal">{stats.pendingCount}</span>
                            </div>
                            <div className="flex justify-between items-baseline gap-4">
                              <span className="text-base text-muted-foreground font-normal">Approved</span>
                              <span className="text-lg font-normal">{stats.approvedCount}</span>
                            </div>
                            <div className="flex justify-between items-baseline gap-4">
                              <span className="text-base text-muted-foreground font-normal">Creators</span>
                              <span className="text-lg font-normal">{stats.creatorCount}</span>
                            </div>
                            <div className="flex justify-between items-baseline gap-4">
                              <span className="text-base text-muted-foreground font-normal">CPV</span>
                              <span className="text-lg font-normal">{cpv}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {/* iPhone aspect ratio placeholder (9:19.5) */}
                      <div className="bg-muted rounded-[4px] h-full" style={{ aspectRatio: '9/19.5' }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bottom New Campaign Button */}
          {campaigns.length > 0 && (
            <div className="mt-16 flex justify-center opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <Button onClick={() => navigate('/business/campaigns/new')} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaigns;