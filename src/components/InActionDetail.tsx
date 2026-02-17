import React, { useEffect, useState } from 'react';
import { ChevronLeft, Eye, Heart, Clock, CheckCircle } from 'lucide-react';
import { ActiveSubmission } from './InActionCard';
import { supabase } from '@/integrations/supabase/client';
import EarningsGraph from '@/components/EarningsGraph';
import { CampaignTier } from '@/types/campaign';

interface InActionDetailProps {
  submission: ActiveSubmission;
  onBack: () => void;
}

const statusConfig = {
  pending_review: {
    label: 'Under Review',
    gradient: 'linear-gradient(180deg, rgba(245,158,11,0.85) 0%, rgba(217,119,6,0.95) 100%)',
    border: 'rgba(252,211,77,0.5)',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    gradient: 'linear-gradient(180deg, rgba(5,150,105,0.9) 0%, rgba(4,120,87,0.95) 100%)',
    border: 'rgba(52,211,153,0.5)',
    icon: CheckCircle,
  },
  denied: {
    label: 'Denied',
    gradient: 'linear-gradient(180deg, rgba(220,38,38,0.85) 0%, rgba(185,28,28,0.95) 100%)',
    border: 'rgba(252,165,165,0.5)',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    gradient: 'linear-gradient(180deg, rgba(5,150,105,0.9) 0%, rgba(4,120,87,0.95) 100%)',
    border: 'rgba(52,211,153,0.5)',
    icon: CheckCircle,
  },
};

const InActionDetail: React.FC<InActionDetailProps> = ({ submission, onBack }) => {
  const status = statusConfig[submission.status];
  const StatusIcon = status.icon;
  const [views, setViews] = useState(submission.current_views || 0);
  const [likes, setLikes] = useState(submission.current_likes || 0);
  const [refreshing, setRefreshing] = useState(false);
  const [campaignTiers, setCampaignTiers] = useState<CampaignTier[]>([]);
  const [maxEarnings, setMaxEarnings] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setRefreshing(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-tiktok-stats', {
          body: { submission_ids: [submission.id] },
        });
        if (!error && data?.results?.[submission.id]) {
          const r = data.results[submission.id];
          if (r.views > 0) setViews(r.views);
          if (r.likes > 0) setLikes(r.likes);
        }
      } catch (e) {
        console.error('Failed to fetch TikTok stats:', e);
      }
      setRefreshing(false);
    };

    const fetchCampaignData = async () => {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('max_earnings')
        .eq('id', submission.campaign_id)
        .maybeSingle();
      if (campaign?.max_earnings) setMaxEarnings(campaign.max_earnings);

      const { data: tiers } = await supabase
        .from('campaign_tiers')
        .select('min_views, max_views, rate_per_view')
        .eq('campaign_id', submission.campaign_id)
        .order('min_views', { ascending: true });
      if (tiers) {
        setCampaignTiers(tiers.map(t => ({
          minViews: t.min_views,
          maxViews: t.max_views,
          rate: t.rate_per_view,
        })));
      }
    };

    fetchStats();
    fetchCampaignData();
  }, [submission.id, submission.campaign_id]);

  return (
    <div className="h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-black/60" />
        </button>
        <div className="flex items-center gap-2 flex-1 justify-center pr-6">
          {submission.campaign_logo && (
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <img src={submission.campaign_logo} alt={submission.campaign_brand} className="w-full h-full object-cover" />
            </div>
          )}
          <h2 className="text-sm font-bold text-black font-montserrat">{submission.campaign_brand}</h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Status badge - glassy */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-[14px]"
            style={{
              background: status.gradient,
              border: `1px solid ${status.border}`,
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-sm font-bold text-white font-montserrat">{status.label}</span>
          </div>
        </div>

        {/* TikTok embed */}
        {submission.tiktok_video_id && (
          <div className="flex justify-center mb-4">
            <div style={{
              transform: 'scale(0.75)',
              transformOrigin: 'top center',
              height: '565px',
              marginBottom: '-100px',
              overflow: 'hidden',
              borderRadius: '12px',
            }}>
              <iframe
                src={`https://www.tiktok.com/embed/v2/${submission.tiktok_video_id}`}
                style={{
                  width: '325px',
                  height: '720px',
                  border: 'none',
                }}
                allowFullScreen
                allow="encrypted-media"
              />
            </div>
          </div>
        )}

        {/* Performance stats */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black font-montserrat">Performance</h3>
            {refreshing && (
              <div className="h-3 w-3 border border-black/20 border-t-black/60 rounded-full animate-spin" />
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Eye className="h-4 w-4 text-black/40 mx-auto mb-1" />
              <p className="text-lg font-bold text-black font-montserrat">{views.toLocaleString()}</p>
              <p className="text-[11px] text-black/50 font-jakarta">Views</p>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Heart className="h-4 w-4 text-black/40 mx-auto mb-1" />
              <p className="text-lg font-bold text-black font-montserrat">{likes.toLocaleString()}</p>
              <p className="text-[11px] text-black/50 font-jakarta">Likes</p>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Clock className="h-4 w-4 text-black/40 mx-auto mb-1" />
              <p className="text-lg font-bold text-black font-montserrat">
                {new Date(submission.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
              <p className="text-[11px] text-black/50 font-jakarta">Submitted</p>
            </div>
          </div>
        </div>

        {/* Earnings tracking */}
        {campaignTiers.length > 0 && maxEarnings > 0 && (
          <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-2xl p-4 mt-4 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <EarningsGraph tiers={campaignTiers} maxEarnings={maxEarnings} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InActionDetail;
