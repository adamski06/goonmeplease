import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface CampaignStats {
  id: string;
  title: string;
  brand_name: string;
  total_views: number;
  creators_count: number;
  total_budget: number;
  spent_budget: number;
}

const BusinessAnalytics: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [totals, setTotals] = useState({
    views: 0,
    creators: 0,
    totalBudget: 0,
    spentBudget: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Get campaigns with their submissions and tiers
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          brand_name,
          total_budget,
          content_submissions (
            id,
            creator_id,
            current_views
          ),
          campaign_tiers (
            rate_per_view
          )
        `)
        .eq('business_id', user?.id);

      if (campaigns) {
        const stats: CampaignStats[] = campaigns.map(c => {
          const submissions = c.content_submissions || [];
          const tiers = c.campaign_tiers || [];
          const defaultRate = tiers.length > 0 ? Number(tiers[0].rate_per_view) : 0.04;
          const totalViews = submissions.reduce((sum: number, s: any) => sum + (s.current_views || 0), 0);
          const uniqueCreators = new Set(submissions.map((s: any) => s.creator_id)).size;
          const totalBudget = c.total_budget || 0;
          const spentBudget = Math.min(totalViews * defaultRate, totalBudget);
          
          return {
            id: c.id,
            title: c.title,
            brand_name: c.brand_name,
            total_views: totalViews,
            creators_count: uniqueCreators,
            total_budget: totalBudget,
            spent_budget: spentBudget,
          };
        });

        setCampaignStats(stats);

        // Calculate totals
        setTotals({
          views: stats.reduce((sum, s) => sum + s.total_views, 0),
          creators: stats.reduce((sum, s) => sum + s.creators_count, 0),
          totalBudget: stats.reduce((sum, s) => sum + s.total_budget, 0),
          spentBudget: stats.reduce((sum, s) => sum + s.spent_budget, 0),
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingData(false);
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
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Performance overview across all campaigns</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardContent className="pt-4">
                <div className="text-muted-foreground text-sm">Views</div>
                <p className="text-3xl font-bold mt-2">{formatNumber(totals.views)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardContent className="pt-4">
                <div className="text-muted-foreground text-sm">Creators</div>
                <p className="text-3xl font-bold mt-2">{totals.creators}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardContent className="pt-4">
                <div className="text-muted-foreground text-sm">Budget</div>
                <p className="text-3xl font-bold mt-2">
                  {Math.round(totals.spentBudget).toLocaleString()}/{totals.totalBudget.toLocaleString()} SEK
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Breakdown */}
          <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : campaignStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No campaigns to analyze yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Campaign</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Views</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Creators</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Budget</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignStats.map((stat) => (
                        <tr 
                          key={stat.id} 
                          className="border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                          onClick={() => navigate(`/business/campaigns/${stat.id}`)}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{stat.title}</p>
                              <p className="text-sm text-muted-foreground">{stat.brand_name}</p>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatNumber(stat.total_views)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {stat.creators_count}
                          </td>
                          <td className="text-right py-3 px-4">
                            {Math.round(stat.spent_budget).toLocaleString()}/{stat.total_budget.toLocaleString()} SEK
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessAnalytics;
