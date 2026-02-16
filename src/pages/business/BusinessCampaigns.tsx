import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CampaignItem {
  id: string;
  title: string;
  brand_name: string;
  cover_image_url: string | null;
  is_active: boolean | null;
  status: string | null;
  total_budget: number | null;
  created_at: string;
  description: string | null;
}

interface CampaignStats {
  campaign_id: string;
  submissions: number;
  approved: number;
  total_views: number;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  active: { label: 'Active', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  paused: { label: 'Paused', icon: Clock, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  ended: { label: 'Ended', icon: XCircle, className: 'bg-muted text-muted-foreground border-border' },
};

const BusinessCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [stats, setStats] = useState<Record<string, CampaignStats>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rows } = await supabase
        .from('campaigns')
        .select('id, title, brand_name, cover_image_url, is_active, status, total_budget, created_at, description')
        .eq('business_id', user.id)
        .order('created_at', { ascending: false });

      setCampaigns(rows || []);

      // Fetch submission stats for each campaign
      if (rows && rows.length > 0) {
        const ids = rows.map(r => r.id);
        const { data: subs } = await supabase
          .from('content_submissions')
          .select('campaign_id, status, current_views')
          .in('campaign_id', ids);

        if (subs) {
          const grouped: Record<string, CampaignStats> = {};
          for (const s of subs) {
            if (!grouped[s.campaign_id]) {
              grouped[s.campaign_id] = { campaign_id: s.campaign_id, submissions: 0, approved: 0, total_views: 0 };
            }
            grouped[s.campaign_id].submissions++;
            if (s.status === 'approved' || s.status === 'paid') grouped[s.campaign_id].approved++;
            grouped[s.campaign_id].total_views += s.current_views || 0;
          }
          setStats(grouped);
        }
      }

      setLoading(false);
    };
    load();
  }, []);

  const getStatus = (c: CampaignItem) => {
    if (c.status && statusConfig[c.status]) return c.status;
    return c.is_active ? 'active' : 'ended';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-montserrat">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => navigate('/business/campaigns/new')}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Create your first campaign and start getting UGC content from creators.
          </p>
          <Button
            onClick={() => navigate('/business/campaigns/new')}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const status = getStatus(c);
            const cfg = statusConfig[status] || statusConfig.active;
            const StatusIcon = cfg.icon;
            const s = stats[c.id];

            return (
              <button
                key={c.id}
                onClick={() => navigate(`/business/campaigns/${c.id}`)}
                className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors text-left"
              >
                {/* Thumbnail */}
                <div className="h-20 w-20 rounded-lg bg-muted shrink-0 overflow-hidden">
                  {c.cover_image_url ? (
                    <img src={c.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground/40 font-montserrat">
                        {c.brand_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">{c.title}</h3>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 shrink-0 ${cfg.className}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.description || 'No description'}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{s?.submissions || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Submissions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{s?.approved || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {s?.total_views ? (s.total_views >= 1000 ? `${(s.total_views / 1000).toFixed(1)}k` : s.total_views) : 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Views</p>
                  </div>
                  {c.total_budget && (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">${c.total_budget.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Budget</p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusinessCampaigns;
