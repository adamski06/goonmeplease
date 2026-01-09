import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Pencil, Loader2 } from 'lucide-react';
import CampaignPreview from '@/components/CampaignPreview';

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

interface CampaignStats {
  totalViews: number;
  totalSpent: number;
  pendingCount: number;
  approvedCount: number;
  creatorCount: number;
}

const BusinessCampaignDetail: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats>({ totalViews: 0, totalSpent: 0, pendingCount: 0, approvedCount: 0, creatorCount: 0 });
  const [businessProfile, setBusinessProfile] = useState<{ company_name: string; logo_url: string | null } | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchCampaignData();
      fetchBusinessProfile();
    }
  }, [user, id]);

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

      // Fetch submissions for stats
      const { data: submissions } = await supabase
        .from('content_submissions')
        .select('current_views, status, creator_id')
        .eq('campaign_id', id);

      const totalViews = submissions?.reduce((sum, s) => sum + (s.current_views || 0), 0) || 0;
      const pendingCount = submissions?.filter(s => s.status === 'pending_review').length || 0;
      const approvedCount = submissions?.filter(s => s.status === 'approved' || s.status === 'paid').length || 0;
      const uniqueCreators = new Set(submissions?.map(s => s.creator_id) || []);

      setStats({
        totalViews,
        totalSpent: 0,
        pendingCount,
        approvedCount,
        creatorCount: uniqueCreators.size,
      });
    } catch (err) {
      console.error('Error fetching campaign:', err);
      toast({ title: 'Error loading campaign', variant: 'destructive' });
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <BusinessLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </BusinessLayout>
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

  const formatNumber = (num: number) => {
    return num.toLocaleString('sv-SE');
  };

  const getRequirements = (guidelines: string | null): string[] => {
    if (!guidelines) return [];
    return guidelines.split('\n').filter(g => g.trim());
  };

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/business/campaigns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground flex-1">{campaign.title}</h1>
            <Button variant="outline" size="sm" onClick={() => navigate(`/business/campaigns/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] mb-8">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{formatNumber(stats.totalViews)}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.creatorCount}</div>
                <div className="text-xs text-muted-foreground">Creators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.pendingCount}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.approvedCount}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatNumber(campaign.total_budget || 0)}</div>
              <div className="text-xs text-muted-foreground">Budget (SEK)</div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex justify-center">
            <CampaignPreview
              formData={{
                brand_name: campaign.brand_name,
                title: campaign.title,
                description: campaign.description || '',
                deadline: campaign.deadline || '',
                total_budget: campaign.total_budget || 0,
              }}
              requirements={getRequirements(campaign.guidelines)}
              selectedPlatforms={[]}
              businessProfile={businessProfile}
            />
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaignDetail;
