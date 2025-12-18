import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Eye, DollarSign, TrendingUp, Users } from 'lucide-react';

interface CampaignStats {
  id: string;
  title: string;
  brand_name: string;
  total_views: number;
  submissions_count: number;
  approved_count: number;
}

const BusinessAnalytics: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [totals, setTotals] = useState({
    views: 0,
    submissions: 0,
    approved: 0,
    spent: 0,
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
      // Get campaigns with their submissions
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          brand_name,
          content_submissions (
            id,
            status,
            current_views
          )
        `)
        .eq('business_id', user?.id);

      if (campaigns) {
        const stats: CampaignStats[] = campaigns.map(c => {
          const submissions = c.content_submissions || [];
          return {
            id: c.id,
            title: c.title,
            brand_name: c.brand_name,
            total_views: submissions.reduce((sum: number, s: any) => sum + (s.current_views || 0), 0),
            submissions_count: submissions.length,
            approved_count: submissions.filter((s: any) => s.status === 'approved').length,
          };
        });

        setCampaignStats(stats);

        // Calculate totals
        setTotals({
          views: stats.reduce((sum, s) => sum + s.total_views, 0),
          submissions: stats.reduce((sum, s) => sum + s.submissions_count, 0),
          approved: stats.reduce((sum, s) => sum + s.approved_count, 0),
          spent: 0, // Would need earnings table to calculate
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Eye className="h-4 w-4" />
                  Total Views
                </div>
                <p className="text-3xl font-bold mt-2">{formatNumber(totals.views)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  Total Submissions
                </div>
                <p className="text-3xl font-bold mt-2">{totals.submissions}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Approved
                </div>
                <p className="text-3xl font-bold mt-2">{totals.approved}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" />
                  Approval Rate
                </div>
                <p className="text-3xl font-bold mt-2">
                  {totals.submissions > 0 
                    ? Math.round((totals.approved / totals.submissions) * 100) 
                    : 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Breakdown */}
          <Card className="bg-card/50 backdrop-blur-sm border-border">
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
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Submissions</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Approved</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Rate</th>
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
                            {stat.submissions_count}
                          </td>
                          <td className="text-right py-3 px-4">
                            {stat.approved_count}
                          </td>
                          <td className="text-right py-3 px-4">
                            {stat.submissions_count > 0 
                              ? Math.round((stat.approved_count / stat.submissions_count) * 100) 
                              : 0}%
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
