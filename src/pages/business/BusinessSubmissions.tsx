import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X, ExternalLink, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Submission {
  id: string;
  creator_id: string;
  campaign_id: string;
  tiktok_video_url: string;
  status: string;
  current_views: number;
  created_at: string;
  review_notes: string | null;
  campaigns?: {
    title: string;
    brand_name: string;
  };
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const BusinessSubmissions: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending_review');
  const [campaigns, setCampaigns] = useState<{ id: string; title: string }[]>([]);
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
      fetchSubmissions();
    }
  }, [user, statusFilter, campaignFilter]);

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('business_id', user?.id);
    setCampaigns(data || []);
  };

  const fetchSubmissions = async () => {
    try {
      // First get the business's campaign IDs
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('id')
        .eq('business_id', user?.id);

      const campaignIds = campaignData?.map(c => c.id) || [];
      
      if (campaignIds.length === 0) {
        setSubmissions([]);
        setLoadingData(false);
        return;
      }

      let query = supabase
        .from('content_submissions')
        .select(`
          *,
          campaigns:campaign_id (title, brand_name)
        `)
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all' && ['approved', 'denied', 'paid', 'pending_review'].includes(statusFilter)) {
        query = query.eq('status', statusFilter as 'approved' | 'denied' | 'paid' | 'pending_review');
      }

      if (campaignFilter !== 'all') {
        query = query.eq('campaign_id', campaignFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions((data || []) as any);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: 'approved' | 'denied' | 'paid' | 'pending_review') => {
    try {
      const { error } = await supabase
        .from('content_submissions')
        .update({ 
          status, 
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', submissionId);

      if (error) throw error;
      toast({ title: `Submission ${status}` });
      fetchSubmissions();
    } catch (err) {
      console.error('Error updating submission:', err);
      toast({ title: 'Error updating submission', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

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

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Submissions</h1>
              <p className="text-muted-foreground mt-1">Review creator content submissions</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_review">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submissions List */}
          <Card className="bg-card/50 backdrop-blur-sm border-border rounded-none">
            <CardHeader>
              <CardTitle>
                {statusFilter === 'pending_review' ? 'Pending Review' : 'All Submissions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {statusFilter === 'pending_review' 
                    ? 'No pending submissions' 
                    : 'No submissions found'}
                </p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div 
                      key={submission.id} 
                      className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                    >
                      {/* Creator & Campaign Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {submission.profiles?.full_name || 'Unknown Creator'}
                          </span>
                          {getStatusBadge(submission.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {submission.campaigns?.title} • {submission.campaigns?.brand_name}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{submission.current_views?.toLocaleString() || 0} views</span>
                          <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Video Link */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(submission.tiktok_video_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
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
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => updateSubmissionStatus(submission.id, 'denied')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessSubmissions;
