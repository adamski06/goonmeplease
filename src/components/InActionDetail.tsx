import React, { useEffect, useState } from 'react';
import { ChevronLeft, Eye, Heart, Clock, CheckCircle, Share2, Lock } from 'lucide-react';
import { ActiveSubmission } from './InActionCard';
import { supabase } from '@/integrations/supabase/client';
import EarningsGraph from '@/components/EarningsGraph';
import { CampaignTier } from '@/types/campaign';
import { useCurrency } from '@/contexts/CurrencyContext';

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
  const { convert, label } = useCurrency();
  const [views, setViews] = useState(submission.current_views || 0);
  const [likes, setLikes] = useState(submission.current_likes || 0);
  const [shares, setShares] = useState((submission as any).current_shares || 0);
  const [refreshing, setRefreshing] = useState(false);
  const [campaignTiers, setCampaignTiers] = useState<CampaignTier[]>([]);
  const [maxEarnings, setMaxEarnings] = useState(0);
  const [poolTotal, setPoolTotal] = useState(0);
  const [poolSpent, setPoolSpent] = useState(0);
  const [myEarnings, setMyEarnings] = useState(0);
  const [payoutAvailableAt, setPayoutAvailableAt] = useState<string | null>(null);

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
          if (r.shares > 0) setShares(r.shares);
        }
      } catch (e) {
        console.error('Failed to fetch TikTok stats:', e);
      }
      setRefreshing(false);
    };

    const fetchCampaignData = async () => {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('max_earnings, total_budget, budget_spent')
        .eq('id', submission.campaign_id)
        .maybeSingle();
      if (campaign) {
        setMaxEarnings(campaign.max_earnings || 0);
        setPoolTotal(campaign.total_budget || 0);
        setPoolSpent(campaign.budget_spent || 0);
      }

      const { data: tiers } = await supabase
        .from('campaign_tiers')
        .select('min_views, max_views, rate_per_view')
        .eq('campaign_id', submission.campaign_id)
        .order('min_views', { ascending: true });
      if (tiers && tiers.length > 0) {
        const parsedTiers = tiers.map(t => ({
          minViews: t.min_views,
          maxViews: t.max_views,
          rate: t.rate_per_view,
        }));
        setCampaignTiers(parsedTiers);

        // Calculate earnings client-side from views and tiers
        // Note: rate_per_view is actually stored as rate per 1000 views (CPM)
        const currentViews = views || submission.current_views || 0;
        let calculated = 0;
        for (const tier of parsedTiers) {
          if (currentViews > tier.minViews) {
            const upper = tier.maxViews != null ? Math.min(currentViews, tier.maxViews) : currentViews;
            const tierViews = upper - tier.minViews;
            if (tierViews > 0) calculated += (tierViews / 1000) * tier.rate;
          }
        }
        // Cap at max earnings
        if (campaign?.max_earnings && calculated > campaign.max_earnings) {
          calculated = campaign.max_earnings;
        }
        // Cap at pool remaining
        const remaining = (campaign?.total_budget || 0) - (campaign?.budget_spent || 0);
        if (remaining >= 0 && calculated > remaining) {
          calculated = remaining;
        }
        setMyEarnings(Math.round(calculated * 100) / 100);
      }

      // Fetch payout_available_at
      const { data: subData } = await supabase
        .from('content_submissions')
        .select('payout_available_at')
        .eq('id', submission.id)
        .maybeSingle();
      if (subData && (subData as any).payout_available_at) {
        setPayoutAvailableAt((subData as any).payout_available_at);
      }
    };

    fetchStats();
    fetchCampaignData();
  }, [submission.id, submission.campaign_id]);

  const poolRemaining = Math.max(0, poolTotal - poolSpent);
  const poolPercent = poolTotal > 0 ? Math.min((poolSpent / poolTotal) * 100, 100) : 0;
  const myProgress = maxEarnings > 0 ? Math.min((myEarnings / maxEarnings) * 100, 100) : 0;

  // Claim cooldown
  const now = Date.now();
  const payoutTime = payoutAvailableAt ? new Date(payoutAvailableAt).getTime() : null;
  const canClaim = payoutTime !== null && payoutTime <= now && myEarnings > 0;
  const daysUntilClaim = payoutTime ? Math.max(0, Math.ceil((payoutTime - now) / (1000 * 60 * 60 * 24))) : null;

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
        {/* Status badge */}
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
                style={{ width: '325px', height: '720px', border: 'none' }}
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
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Eye, value: views, label: 'Views' },
              { icon: Heart, value: likes, label: 'Likes' },
              { icon: Share2, value: shares, label: 'Shares' },
              { icon: Clock, value: new Date(submission.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), label: 'Submitted' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-3 text-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <stat.icon className="h-4 w-4 text-black/40 mx-auto mb-1" />
                <p className="text-lg font-bold text-black font-montserrat">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                <p className="text-[11px] text-black/50 font-jakarta">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings — all inside green node */}
        {(campaignTiers.length > 0 || maxEarnings > 0) && (
          <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-2xl p-4 mt-4 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            
            {/* Your earnings progress */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-white/60 font-montserrat uppercase tracking-wider">Your Earnings</span>
              <span className="text-lg font-bold text-white font-montserrat">
                {convert(myEarnings).toLocaleString()} <span className="text-xs font-normal text-white/50">{label}</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden bg-white/10 mb-1">
              <div className="h-full rounded-full bg-white/50 transition-all" style={{ width: `${myProgress}%` }} />
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-[10px] text-white/40 font-jakarta">0</span>
              <span className="text-[10px] text-white/40 font-jakarta">Max {convert(maxEarnings).toLocaleString()} {label}</span>
            </div>

            {/* Pool */}
            {poolTotal > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-white/60 font-montserrat uppercase tracking-wider">Pool</span>
                  <span className="text-sm font-bold text-white font-montserrat">
                    {convert(poolRemaining).toLocaleString()} <span className="text-[10px] font-normal text-white/40">/ {convert(poolTotal).toLocaleString()} {label}</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div className="h-full rounded-full bg-white/30 transition-all" style={{ width: `${poolPercent}%` }} />
                </div>
              </div>
            )}

            {/* Graph */}
            {campaignTiers.length > 0 && maxEarnings > 0 && (
              <EarningsGraph tiers={campaignTiers} maxEarnings={maxEarnings} />
            )}

            {/* Claim button / countdown */}
            {myEarnings > 0 && (
              <div className="mt-4">
                {canClaim ? (
                  <button
                    className="w-full py-3.5 rounded-full font-bold text-sm font-montserrat transition-all active:scale-[0.97]"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.9) 100%)',
                      color: '#065f46',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1)',
                    }}
                  >
                    Claim {convert(myEarnings).toLocaleString()} {label}
                  </button>
                ) : (
                  <div
                    className="w-full py-3.5 rounded-full text-center"
                    style={{
                      background: 'rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-white/40" />
                      <span className="text-sm font-semibold text-white/60 font-montserrat">
                        {daysUntilClaim !== null && daysUntilClaim > 0
                          ? `Claim in ${daysUntilClaim} day${daysUntilClaim !== 1 ? 's' : ''}`
                          : 'Processing...'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InActionDetail;
