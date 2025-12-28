import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Pencil, Eye, DollarSign, Users, Check, X, ExternalLink } from 'lucide-react';

import defaultAvatar from '@/assets/default-avatar.png';

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
  brand_logo_url: string | null;
  description: string | null;
  guidelines: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  deadline: string | null;
  total_budget: number;
}

interface Submission {
  id: string;
  creator_id: string;
  tiktok_video_url: string;
  status: string;
  current_views: number;
  created_at: string;
  review_notes: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Tier {
  min_views: number;
  max_views: number | null;
  rate_per_view: number;
}

const BusinessCampaignDetail: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchCampaignData();
    }
  }, [user, id]);

  const fetchCampaignData = async () => {
    try {
      // Fetch campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Fetch tiers
      const { data: tierData } = await supabase
        .from('campaign_tiers')
        .select('*')
        .eq('campaign_id', id)
        .order('min_views', { ascending: true });

      setTiers(tierData?.map(t => ({
        min_views: t.min_views,
        max_views: t.max_views,
        rate_per_view: Number(t.rate_per_view),
      })) || []);

      // Fetch submissions
      const { data: submissionData } = await supabase
        .from('content_submissions')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });

      setSubmissions((submissionData || []) as any);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      toast({ title: 'Error loading campaign', variant: 'destructive' });
    } finally {
      setLoadingData(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: 'approved' | 'denied' | 'paid' | 'pending_review', notes?: string) => {
    try {
      const { error } = await supabase
        .from('content_submissions')
        .update({ 
          status, 
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', submissionId);

      if (error) throw error;
      toast({ title: `Submission ${status}` });
      fetchCampaignData();
    } catch (err) {
      console.error('Error updating submission:', err);
      toast({ title: 'Error updating submission', variant: 'destructive' });
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <BusinessLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Campaign not found</p>
          <Button className="mt-4" onClick={() => navigate('/business/campaigns')}>
            Back to Campaigns
          </Button>
        </div>
      </BusinessLayout>
    );
  }

  const totalViews = submissions.reduce((sum, s) => sum + (s.current_views || 0), 0);
  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending_review').length;

  // Calculate max earnings based on tiers or a default rate
  const defaultRate = tiers.length > 0 ? tiers[0].rate_per_view : 0.04;
  const maxEarnings = campaign.total_budget || 0;
  const ratePerThousand = defaultRate * 1000;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Approved</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Pending</Badge>;
      case 'denied':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Parse guidelines into array
  const guidelinesArray = campaign.guidelines 
    ? campaign.guidelines.split('\n').filter(g => g.trim())
    : [];

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/business/campaigns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{campaign.title}</h1>
                <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                  {campaign.status || 'active'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{campaign.brand_name}</p>
            </div>
            <Button variant="outline" onClick={() => navigate(`/business/campaigns/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Eye className="h-4 w-4" />
                  Total Views
                </div>
                <p className="text-2xl font-bold mt-1">{totalViews.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  Submissions
                </div>
                <p className="text-2xl font-bold mt-1">{submissions.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Check className="h-4 w-4" />
                  Approved
                </div>
                <p className="text-2xl font-bold mt-1">{approvedSubmissions}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </div>
                <p className="text-2xl font-bold mt-1">{campaign.total_budget?.toLocaleString()} SEK</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="preview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="preview">Creator Preview</TabsTrigger>
              <TabsTrigger value="submissions">
                Submissions {pendingSubmissions > 0 && `(${pendingSubmissions})`}
              </TabsTrigger>
              <TabsTrigger value="details">Campaign Details</TabsTrigger>
              <TabsTrigger value="tiers">Payment Tiers</TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
                <CardHeader>
                  <CardTitle>How Creators See Your Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Creator Preview - mimics what creators see */}
                  <div className="max-w-2xl">
                    {/* Header - Logo and brand */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0 border border-border overflow-hidden">
                        {campaign.brand_logo_url ? (
                          <img src={campaign.brand_logo_url} alt={campaign.brand_name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl font-bold text-foreground">
                            {campaign.brand_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground font-montserrat">{campaign.brand_name}</h2>
                        <p className="text-sm text-muted-foreground">{campaign.title}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-lg text-foreground font-jakarta leading-relaxed mb-6">
                      {campaign.description || 'No description provided.'}
                    </p>

                    {/* Earnings Display - matching creator view */}
                    <div className="mb-6 relative">
                      {/* Rate per view */}
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-xl font-bold text-foreground font-montserrat">{ratePerThousand.toFixed(0)}</span>
                        <span className="text-sm font-bold text-foreground font-jakarta">sek</span>
                        <span className="text-xs font-bold text-muted-foreground font-jakarta">/ 1000 views</span>
                      </div>

                      {/* Line and bubbles */}
                      <div className="relative mt-4">
                        {/* Earnings bubble - above line */}
                        <div className="absolute -top-10 right-0 pointer-events-none z-20">
                          <div className="bg-black px-4 py-2 flex items-baseline gap-1 rounded-full rounded-br-none">
                            <span className="text-2xl font-bold text-white font-montserrat">{maxEarnings.toLocaleString()}</span>
                            <span className="text-sm text-white font-montserrat">sek</span>
                          </div>
                        </div>

                        {/* The line */}
                        <div className="relative py-4">
                          <div className="h-[2px] bg-foreground w-full" />
                          
                          {/* Min marker - always at left, always 1000 views */}
                          <div className="absolute z-20" style={{ left: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                            <div className="w-[2px] h-[10px] bg-foreground" />
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none">
                              <span className="text-xs text-foreground font-jakarta">min</span>
                            </div>
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                              <span className="text-xs text-muted-foreground font-jakarta">1,000</span>
                            </div>
                          </div>
                        </div>

                        {/* Views bubble - below line */}
                        <div className="absolute top-10 right-0 pointer-events-none z-20">
                          <div className="bg-background border border-border px-3 py-1.5 flex items-baseline gap-1 rounded-full rounded-tr-none">
                            <span className="text-base font-normal text-foreground font-jakarta">
                              {maxEarnings > 0 && ratePerThousand > 0 
                                ? ((maxEarnings / ratePerThousand) * 1000).toLocaleString() 
                                : '0'}
                            </span>
                            <span className="text-xs text-foreground font-jakarta">views</span>
                          </div>
                        </div>
                      </div>

                      {/* Spacer for bubbles */}
                      <div className="h-12" />
                    </div>

                    {/* Requirements */}
                    {guidelinesArray.length > 0 && (
                      <div className="backdrop-blur-md bg-muted/20 rounded-xl p-4 mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3 font-montserrat">Requirements</h3>
                        <ul className="space-y-2">
                          {guidelinesArray.map((guideline, idx) => (
                            <li key={idx} className="text-sm text-foreground font-jakarta flex items-start gap-2">
                              <span className="text-foreground">•</span>
                              {guideline}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Preview */}
                    <Button 
                      size="lg" 
                      className="w-full py-5 text-base font-bold rounded-full"
                      disabled
                    >
                      Submit Content (Preview)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions">
              <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
                <CardHeader>
                  <CardTitle>Content Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {submissions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No submissions yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {submissions.map((submission) => (
                        <div 
                          key={submission.id} 
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                        >
                          {/* Creator Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {submission.profiles?.full_name || 'Unknown Creator'}
                              </span>
                              {getStatusBadge(submission.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {submission.current_views?.toLocaleString() || 0} views
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {new Date(submission.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Video Link */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(submission.tiktok_video_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Video
                          </Button>

                          {/* Actions */}
                          {submission.status === 'pending_review' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => updateSubmissionStatus(submission.id, 'denied')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-muted-foreground">{campaign.description || 'No description'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Guidelines</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{campaign.guidelines || 'No guidelines'}</p>
                  </div>
                  {campaign.deadline && (
                    <div>
                      <h4 className="font-medium mb-1">Deadline</h4>
                      <p className="text-muted-foreground">
                        {new Date(campaign.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tiers">
              <Card className="bg-card/50 backdrop-blur-sm border-border rounded-[4px]">
                <CardHeader>
                  <CardTitle>Payment Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  {tiers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No payment tiers configured
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tiers.map((tier, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <span className="font-medium">
                            {tier.min_views.toLocaleString()} - {tier.max_views ? tier.max_views.toLocaleString() : '∞'} views
                          </span>
                          <span className="text-muted-foreground">
                            {tier.rate_per_view} SEK/view
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaignDetail;