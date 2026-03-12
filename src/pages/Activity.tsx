import React, { useEffect, useState, useCallback, useRef } from 'react';
import JarlaLoader from '@/components/JarlaLoader';
import placeholderBlue from '@/assets/campaigns/placeholder-blue.jpg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import SubmissionGuide from '@/components/SubmissionGuide';
import SubmitDraft from '@/components/SubmitDraft';
import CampaignOverlay from '@/components/CampaignOverlay';
import RewardOverlay from '@/components/RewardOverlay';
import InActionCard, { ActiveSubmission } from '@/components/InActionCard';
import InActionDetail from '@/components/InActionDetail';
import RewardInActionDetail, { RewardSubmission } from '@/components/RewardInActionDetail';
import { Campaign } from '@/types/campaign';
import { useRecentCampaigns } from '@/hooks/useRecentCampaigns';
import { ChevronRight, X, Clock, CheckCircle, Send, Gift } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';

const CampaignList: React.FC<{ campaigns: Campaign[]; onSelect: (c: Campaign) => void }> = ({ campaigns, onSelect }) => (
  <div className="space-y-2.5">
    {campaigns.map((campaign) => {
      const isReward = campaign.type === 'reward';
      return (
        <button
          key={campaign.id}
          onClick={() => onSelect(campaign)}
          className="w-full rounded-[28px] overflow-hidden flex items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
            border: '1.5px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
          }}
        >
          <div className="w-14 h-14 rounded-[18px] overflow-hidden flex-shrink-0 bg-black/5 flex items-center justify-center">
            {campaign.logo ? (
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-black/30">{campaign.brand?.[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-black font-montserrat truncate block mb-0.5">{campaign.brand}</span>
            <p className="text-xs text-black/50 font-jakarta line-clamp-1">{campaign.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isReward ? (
              <div className="rounded-[14px] px-2.5 py-1 flex items-center gap-1 border border-purple-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" style={{ background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)' }}>
                <Gift className="h-3 w-3 text-white/80" />
                <span className="text-[10px] font-bold text-white font-montserrat">REWARD</span>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[14px] px-2.5 py-1 flex items-baseline gap-0.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <span className="text-xs font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                <span className="text-[9px] font-semibold text-white/80 font-montserrat">sek</span>
              </div>
            )}
            <ChevronRight className="h-4 w-4 text-black/30" />
          </div>
        </button>
      );
    })}
  </div>
);

const CampaignListSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="space-y-2.5">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="w-full rounded-[28px] overflow-hidden flex items-center gap-3 px-4 py-3 relative"
        style={{
          background: 'linear-gradient(180deg, #f0f0f0 0%, #e8e8e8 100%)',
          border: '1.5px solid rgba(255,255,255,0.8)',
        }}
      >
        <div className="absolute inset-0 skeleton-shimmer rounded-[28px]" />
        <div className="w-14 h-14 rounded-[18px] bg-black/[0.06] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-black/[0.06]" />
            <div className="h-3 w-20 rounded-full bg-black/[0.06]" />
          </div>
          <div className="h-2.5 w-3/4 rounded-full bg-black/[0.06]" />
        </div>
        <div className="h-7 w-16 rounded-[14px] bg-black/[0.06] flex-shrink-0" />
      </div>
    ))}
  </div>
);

const Activity: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideSliding, setGuideSliding] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitSliding, setSubmitSliding] = useState(false);
  const [selectedRecentCampaign, setSelectedRecentCampaign] = useState<Campaign | null>(null);
  const [isClosingOverlay, setIsClosingOverlay] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const { campaigns: recentCampaigns, loading: recentLoading, refetch: refetchRecent } = useRecentCampaigns();
  const { campaigns: favoriteCampaigns, loading: favoritesLoading, favoriteIds, toggleFavorite, refetch: refetchFavorites } = useFavorites();

  // In Action state
  const [activeSubmissions, setActiveSubmissions] = useState<ActiveSubmission[]>([]);
  const [rewardSubmissions, setRewardSubmissions] = useState<RewardSubmission[]>([]);
  const [dealApplications, setDealApplications] = useState<{ id: string; deal_id: string; status: string; created_at: string; deal_brand: string; deal_title: string; deal_logo: string }[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ActiveSubmission | null>(null);
  const [selectedRewardSubmission, setSelectedRewardSubmission] = useState<RewardSubmission | null>(null);
  const [isClosingSubmission, setIsClosingSubmission] = useState(false);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPulling = useRef(false);
  const PULL_THRESHOLD = 80;

  const fetchActiveSubmissions = useCallback(async (silent = false) => {
    if (!user) { setSubmissionsLoading(false); return; }
    if (!silent) setSubmissionsLoading(true);

    // Fetch campaign submissions, deal applications, and reward submissions in parallel
    const [submissionsRes, dealsRes, rewardsRes] = await Promise.all([
      supabase
        .from('content_submissions')
        .select('id, campaign_id, tiktok_video_url, tiktok_video_id, status, current_views, current_likes, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('deal_applications')
        .select('id, deal_id, status, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('reward_submissions')
        .select('id, reward_ad_id, tiktok_video_url, tiktok_video_id, status, current_views, current_likes, coupon_code, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    // Process campaign submissions
    const data = submissionsRes.data;
    if (data && data.length > 0) {
      const campaignIds = [...new Set(data.map(s => s.campaign_id))];
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, title, brand_name, brand_logo_url')
        .in('id', campaignIds);

      const campaignMap = new Map((campaigns || []).map(c => [c.id, c]));

      const submissions: ActiveSubmission[] = data.map(s => {
        const campaign = campaignMap.get(s.campaign_id);
        return {
          id: s.id,
          campaign_id: s.campaign_id,
          tiktok_video_url: s.tiktok_video_url,
          tiktok_video_id: s.tiktok_video_id,
          status: s.status,
          current_views: s.current_views || 0,
          current_likes: s.current_likes || 0,
          created_at: s.created_at,
          campaign_title: campaign?.title || '',
          campaign_brand: campaign?.brand_name || '',
          campaign_logo: campaign?.brand_logo_url || '',
        };
      });
      setActiveSubmissions(submissions);

      // Auto-fetch fresh TikTok stats
      if (submissions.length > 0) {
        try {
          const { data: statsData } = await supabase.functions.invoke('fetch-tiktok-stats', {
            body: { submission_ids: submissions.map(s => s.id) },
          });
          if (statsData?.results) {
            setActiveSubmissions(prev => prev.map(s => {
              const r = statsData.results[s.id];
              if (r) {
                return {
                  ...s,
                  current_views: r.views > 0 ? r.views : s.current_views,
                  current_likes: r.likes > 0 ? r.likes : s.current_likes,
                };
              }
              return s;
            }));
          }
        } catch (e) {
          console.error('Auto-fetch TikTok stats failed:', e);
        }
      }
    } else {
      setActiveSubmissions([]);
    }

    // Process deal applications
    const dealData = dealsRes.data;
    if (dealData && dealData.length > 0) {
      const dealIds = [...new Set(dealData.map(d => d.deal_id))];
      const { data: deals } = await supabase
        .from('deals')
        .select('id, title, brand_name, brand_logo_url')
        .in('id', dealIds);

      const dealMap = new Map((deals || []).map(d => [d.id, d]));
      setDealApplications(dealData.map(da => {
        const deal = dealMap.get(da.deal_id);
        return {
          id: da.id,
          deal_id: da.deal_id,
          status: da.status,
          created_at: da.created_at,
          deal_brand: deal?.brand_name || '',
          deal_title: deal?.title || '',
          deal_logo: deal?.brand_logo_url || '',
        };
      }));
    } else {
      setDealApplications([]);
    }

    // Process reward submissions
    const rewardData = rewardsRes.data;
    if (rewardData && rewardData.length > 0) {
      const rewardAdIds = [...new Set(rewardData.map(r => r.reward_ad_id))];
      const { data: rewardAds } = await supabase
        .from('reward_ads')
        .select('id, title, brand_name, brand_logo_url, reward_description, views_required')
        .in('id', rewardAdIds);

      const rewardMap = new Map((rewardAds || []).map(r => [r.id, r]));
      setRewardSubmissions(rewardData.map(rs => {
        const ad = rewardMap.get(rs.reward_ad_id);
        return {
          id: rs.id,
          reward_ad_id: rs.reward_ad_id,
          tiktok_video_url: rs.tiktok_video_url,
          tiktok_video_id: rs.tiktok_video_id,
          status: rs.status,
          current_views: rs.current_views || 0,
          current_likes: rs.current_likes || 0,
          created_at: rs.created_at,
          coupon_code: rs.coupon_code,
          reward_brand: ad?.brand_name || '',
          reward_title: ad?.title || '',
          reward_logo: ad?.brand_logo_url || '',
          reward_description: ad?.reward_description || '',
          views_required: ad?.views_required || 0,
        };
      }));
    } else {
      setRewardSubmissions([]);
    }

    setSubmissionsLoading(false);
  }, [user]);

  // Track if initial fetch is done
  const initialFetchDone = useRef(false);

  useEffect(() => {
    fetchActiveSubmissions().then(() => {
      initialFetchDone.current = true;
    });
  }, [fetchActiveSubmissions]);

  // Refetch submissions when this tab becomes visible (user navigates to /user/activity)
  const lastPath = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname === '/user/activity' && lastPath.current !== '/user/activity' && initialFetchDone.current) {
      fetchActiveSubmissions(true);
    }
    lastPath.current = location.pathname;
  }, [location.pathname, fetchActiveSubmissions]);

  useEffect(() => {
    const state = location.state as { campaign?: Campaign } | null;
    if (state?.campaign) {
      setActiveCampaign(state.campaign);
      setTimeout(() => {
        setGuideSliding(true);
        setTimeout(() => {
          setShowGuide(true);
          setGuideSliding(false);
        }, 300);
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/user/auth');
    }
  }, [user, loading, navigate]);

  const handleCloseGuide = () => {
    setGuideSliding(true);
    setTimeout(() => {
      setShowGuide(false);
      setActiveCampaign(null);
      setGuideSliding(false);
    }, 300);
  };

  const handleGuideComplete = () => {
    setGuideSliding(true);
    setTimeout(() => {
      setShowGuide(false);
      setGuideSliding(false);
      setSubmitSliding(true);
      setTimeout(() => {
        setShowSubmit(true);
        setSubmitSliding(false);
      }, 300);
    }, 300);
  };

  const handleBackFromSubmit = () => {
    setSubmitSliding(true);
    setTimeout(() => {
      setShowSubmit(false);
      setSubmitSliding(false);
      setActiveCampaign(null);
      // Refresh submissions list
      fetchActiveSubmissions();
    }, 300);
  };

  const handleRecentCampaignClick = (campaign: Campaign) => {
    setSelectedRecentCampaign(campaign);
  };

  const handleCloseOverlay = () => {
    if (isClosingOverlay) return;
    setIsClosingOverlay(true);
    setTimeout(() => {
      setSelectedRecentCampaign(null);
      setIsClosingOverlay(false);
    }, 400);
  };

  // Pull-to-refresh handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchActiveSubmissions(),
      refetchRecent(),
      refetchFavorites(),
    ]);
    setIsRefreshing(false);
  }, [fetchActiveSubmissions, refetchRecent, refetchFavorites]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    const scrollTop = scrollContainerRef.current
      ? scrollContainerRef.current.scrollTop
      : window.scrollY || document.documentElement.scrollTop;
    if (scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setPullDistance(Math.min(deltaY * 0.5, 120));
    } else {
      isPulling.current = false;
      setPullDistance(0);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= PULL_THRESHOLD) {
      handleRefresh();
      setPullDistance(0);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, handleRefresh]);

  // Loading handled by UserLayout

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-screen bg-white pb-24 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center justify-center px-4 py-3">
          <span className="text-base font-semibold text-black">Action</span>
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: isRefreshing ? 48 : pullDistance > 10 ? pullDistance : 0 }}
      >
        <div className={`flex items-center gap-2 ${isRefreshing ? 'animate-pulse' : ''}`}>
          <svg
            className={`h-5 w-5 text-black/40 transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: !isRefreshing ? `rotate(${Math.min(pullDistance / PULL_THRESHOLD, 1) * 360}deg)` : undefined }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          <span className="text-xs font-medium text-black/40 font-jakarta">
            {isRefreshing ? 'Updating...' : pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* In Action Section */}
      <div className="px-4 pt-4 pb-1">
        <h2 className="text-sm font-bold text-black font-montserrat">In Action</h2>
      </div>

      {/* Active submissions list */}
      {!submissionsLoading && (activeSubmissions.length > 0 || dealApplications.length > 0 || rewardSubmissions.length > 0) && !activeCampaign && (
        <div className="px-3 pt-2 space-y-2.5">
          {activeSubmissions.map(sub => (
            <InActionCard key={sub.id} submission={sub} onClick={() => setSelectedSubmission(sub)} />
          ))}
          {dealApplications.map(da => {
            const dealStatusConfig: Record<string, { label: string; gradient: string; border: string }> = {
              pending: { label: 'Requested', gradient: 'linear-gradient(180deg, rgba(245,158,11,0.85) 0%, rgba(217,119,6,0.95) 100%)', border: 'rgba(252,211,77,0.5)' },
              accepted: { label: 'Accepted', gradient: 'linear-gradient(180deg, rgba(5,150,105,0.9) 0%, rgba(4,120,87,0.95) 100%)', border: 'rgba(52,211,153,0.5)' },
              declined: { label: 'Declined', gradient: 'linear-gradient(180deg, rgba(220,38,38,0.85) 0%, rgba(185,28,28,0.95) 100%)', border: 'rgba(252,165,165,0.5)' },
            };
            const ds = dealStatusConfig[da.status] || dealStatusConfig.pending;
            return (
              <div
                key={da.id}
                className="w-full rounded-[28px] overflow-hidden flex items-center gap-3 px-4 py-3 text-left"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                }}
              >
                <div className="w-14 h-14 rounded-[18px] overflow-hidden flex-shrink-0 bg-black/5 flex items-center justify-center">
                  {da.deal_logo ? (
                    <img src={da.deal_logo} alt={da.deal_brand} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-black/30">{da.deal_brand[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-black font-montserrat truncate block">{da.deal_brand}</span>
                  <p className="text-xs text-black/50 font-jakarta line-clamp-1">{da.deal_title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Send className="h-3 w-3 text-black/30" />
                    <span className="text-[11px] font-medium text-black/40 font-jakarta">Deal</span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-[14px] px-2.5 py-1 flex-shrink-0"
                  style={{
                    background: ds.gradient,
                    border: `1px solid ${ds.border}`,
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <span className="text-[10px] font-bold text-white font-montserrat">{ds.label}</span>
                </div>
              </div>
            );
          })}
          {rewardSubmissions.map(rs => {
            const rewardStatusConfig: Record<string, { label: string; gradient: string; border: string }> = {
              pending_review: { label: 'Under Review', gradient: 'linear-gradient(180deg, rgba(245,158,11,0.85) 0%, rgba(217,119,6,0.95) 100%)', border: 'rgba(252,211,77,0.5)' },
              approved: { label: 'Approved', gradient: 'linear-gradient(180deg, rgba(5,150,105,0.9) 0%, rgba(4,120,87,0.95) 100%)', border: 'rgba(52,211,153,0.5)' },
              denied: { label: 'Denied', gradient: 'linear-gradient(180deg, rgba(220,38,38,0.85) 0%, rgba(185,28,28,0.95) 100%)', border: 'rgba(252,165,165,0.5)' },
              completed: { label: 'Completed', gradient: 'linear-gradient(180deg, rgba(124,58,237,0.9) 0%, rgba(109,40,217,0.95) 100%)', border: 'rgba(167,139,250,0.5)' },
            };
            const rs_status = rewardStatusConfig[rs.status] || rewardStatusConfig.pending_review;
            return (
              <button
                key={rs.id}
                onClick={() => setSelectedRewardSubmission(rs)}
                className="w-full rounded-[28px] overflow-hidden flex items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                }}
              >
                <div className="w-14 h-14 rounded-[18px] overflow-hidden flex-shrink-0 bg-black/5 flex items-center justify-center">
                  {rs.reward_logo ? (
                    <img src={rs.reward_logo} alt={rs.reward_brand} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-black/30">{rs.reward_brand[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-black font-montserrat truncate block">{rs.reward_brand}</span>
                  <p className="text-xs text-black/50 font-jakarta line-clamp-1">{rs.reward_title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Gift className="h-3 w-3 text-purple-500/60" />
                    <span className="text-[11px] font-medium text-black/40 font-jakarta">Reward</span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-[14px] px-2.5 py-1 flex-shrink-0"
                  style={{
                    background: rs_status.gradient,
                    border: `1px solid ${rs_status.border}`,
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <span className="text-[10px] font-bold text-white font-montserrat">{rs_status.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeCampaign && (
        <div className="px-3 pt-2">
          <div
            className="rounded-[36px] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
              border: '1.5px solid rgba(255,255,255,0.8)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
              maxHeight: 'calc(100dvh - 280px)',
            }}
          >
            <div className="relative overflow-hidden" style={{ height: 'calc(100dvh - 280px)' }}>
              <div
                className="absolute inset-0 flex flex-col overflow-hidden"
                style={{
                  transform: (showGuide || guideSliding || showSubmit || submitSliding) ? 'translateX(-100%)' : 'translateX(0)',
                  opacity: (showGuide || guideSliding || showSubmit || submitSliding) ? 0 : 1,
                  transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                  pointerEvents: (!showGuide && !guideSliding && !showSubmit && !submitSliding) ? 'auto' : 'none',
                }}
              >
                <button
                  onClick={handleCloseGuide}
                  className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.1) 100%)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <X className="h-4 w-4 text-black/60" />
                </button>
                <div className="flex flex-col items-center justify-center flex-1 px-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border border-black/10">
                    <img src={activeCampaign.logo} alt={activeCampaign.brand} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-lg font-bold text-black font-montserrat mb-1">{activeCampaign.brand}</h2>
                  <p className="text-sm text-black/60 font-jakarta text-center max-w-[260px]">{activeCampaign.description}</p>
                </div>
              </div>

              <div
                className="absolute inset-0"
                style={{
                  transform: showGuide && !guideSliding ? 'translateX(0)' : 'translateX(100%)',
                  opacity: showGuide && !guideSliding ? 1 : 0,
                  transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                  pointerEvents: showGuide && !guideSliding ? 'auto' : 'none',
                }}
              >
                <SubmissionGuide campaign={activeCampaign} onBack={handleCloseGuide} onComplete={handleGuideComplete} />
              </div>

              <div
                className="absolute inset-0"
                style={{
                  transform: showSubmit && !submitSliding ? 'translateX(0)' : 'translateX(100%)',
                  opacity: showSubmit && !submitSliding ? 1 : 0,
                  transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                  pointerEvents: showSubmit && !submitSliding ? 'auto' : 'none',
                }}
              >
                <SubmitDraft campaign={activeCampaign} onBack={handleBackFromSubmit} />
              </div>
            </div>
          </div>
        </div>
      )}

      {!submissionsLoading && !activeCampaign && activeSubmissions.length === 0 && dealApplications.length === 0 && rewardSubmissions.length === 0 && (
        <div className="flex items-center justify-center px-6 py-10">
          <p className="text-black/40 font-jakarta text-sm">No active campaigns yet</p>
        </div>
      )}

      {/* Recent / Favourites Tabs */}
      <div className="px-3 pt-4">
        <Tabs defaultValue="recent">
          <TabsList className="w-full bg-black/5 rounded-full p-0.5 h-9">
            <TabsTrigger value="recent" className="flex-1 rounded-full text-xs font-semibold font-montserrat data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-black/50 h-8">
              Recent
            </TabsTrigger>
            <TabsTrigger value="favourites" className="flex-1 rounded-full text-xs font-semibold font-montserrat data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-black/50 h-8">
              Favourites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-3">
            {recentLoading ? (
              <CampaignListSkeleton count={3} />
            ) : recentCampaigns.length === 0 ? (
              <div className="flex items-center justify-center px-6 py-10">
                <p className="text-black/40 font-jakarta text-sm">No recent campaigns</p>
              </div>
            ) : (
              <>
                <CampaignList campaigns={showAllRecent ? recentCampaigns : recentCampaigns.slice(0, 3)} onSelect={handleRecentCampaignClick} />
                {!showAllRecent && recentCampaigns.length > 3 && (
                  <button
                    onClick={() => setShowAllRecent(true)}
                    className="w-full mt-3 py-2.5 rounded-full text-xs font-semibold font-montserrat text-black/50 active:scale-[0.98] transition-all"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                      border: '1.5px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    Show more
                  </button>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="favourites" className="mt-3">
            {favoritesLoading ? (
              <CampaignListSkeleton count={3} />
            ) : favoriteCampaigns.length === 0 ? (
              <div className="flex items-center justify-center px-6 py-10">
                <p className="text-black/40 font-jakarta text-sm">No favourite campaigns</p>
              </div>
            ) : (
              <CampaignList campaigns={favoriteCampaigns} onSelect={handleRecentCampaignClick} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Campaign/Reward detail overlay */}
      {selectedRecentCampaign && selectedRecentCampaign.type === 'reward' ? (
        <RewardOverlay
          reward={selectedRecentCampaign}
          isClosing={isClosingOverlay}
          onClose={handleCloseOverlay}
          isSaved={favoriteIds.includes(selectedRecentCampaign.id)}
          onToggleSave={(e) => { e.stopPropagation(); toggleFavorite(selectedRecentCampaign.id); }}
        />
      ) : selectedRecentCampaign ? (
        <CampaignOverlay
          campaign={selectedRecentCampaign}
          isClosing={isClosingOverlay}
          onClose={handleCloseOverlay}
          isSaved={favoriteIds.includes(selectedRecentCampaign.id)}
          onToggleSave={(e) => { e.stopPropagation(); toggleFavorite(selectedRecentCampaign.id); }}
        />
      ) : null}

      {/* In Action detail overlay */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            style={{
              opacity: isClosingSubmission ? 0 : 1,
              transition: 'opacity 0.35s ease-out',
            }}
            onClick={() => {
              if (isClosingSubmission) return;
              setIsClosingSubmission(true);
              setTimeout(() => {
                setSelectedSubmission(null);
                setIsClosingSubmission(false);
              }, 400);
            }}
          />

          <style>{`
            @keyframes action-slide-up {
              0% { transform: translateY(calc(100% + 92px)); }
              100% { transform: translateY(0); }
            }
            @keyframes action-slide-down {
              0% { transform: translateY(0); }
              100% { transform: translateY(calc(100% + 92px)); }
            }
          `}</style>

          <div
            className="absolute left-3 right-3 bottom-[92px] rounded-[48px] overflow-hidden z-[60]"
            style={{
              maxHeight: 'calc(100dvh - 148px)',
              background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)',
              border: '1.5px solid rgba(255,255,255,0.8)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
              animation: isClosingSubmission
                ? 'action-slide-down 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards'
                : 'action-slide-up 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ maxHeight: 'calc(100dvh - 148px)', height: 'calc(100dvh - 148px)' }}>
              <InActionDetail
                submission={selectedSubmission}
                onBack={() => {
                  if (isClosingSubmission) return;
                  setIsClosingSubmission(true);
                  setTimeout(() => {
                    setSelectedSubmission(null);
                    setIsClosingSubmission(false);
                  }, 400);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reward submission detail overlay */}
      {selectedRewardSubmission && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            style={{
              opacity: isClosingSubmission ? 0 : 1,
              transition: 'opacity 0.35s ease-out',
            }}
            onClick={() => {
              if (isClosingSubmission) return;
              setIsClosingSubmission(true);
              setTimeout(() => {
                setSelectedRewardSubmission(null);
                setIsClosingSubmission(false);
              }, 400);
            }}
          />

          <style>{`
            @keyframes reward-slide-up {
              0% { transform: translateY(calc(100% + 92px)); }
              100% { transform: translateY(0); }
            }
            @keyframes reward-slide-down {
              0% { transform: translateY(0); }
              100% { transform: translateY(calc(100% + 92px)); }
            }
          `}</style>

          <div
            className="absolute left-3 right-3 bottom-[92px] rounded-[48px] overflow-hidden z-[60]"
            style={{
              maxHeight: 'calc(100dvh - 148px)',
              background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)',
              border: '1.5px solid rgba(255,255,255,0.8)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
              animation: isClosingSubmission
                ? 'reward-slide-down 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards'
                : 'reward-slide-up 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ maxHeight: 'calc(100dvh - 148px)', height: 'calc(100dvh - 148px)' }}>
              <RewardInActionDetail
                submission={selectedRewardSubmission}
                onBack={() => {
                  if (isClosingSubmission) return;
                  setIsClosingSubmission(true);
                  setTimeout(() => {
                    setSelectedRewardSubmission(null);
                    setIsClosingSubmission(false);
                  }, 400);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Activity;
