import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import SubmissionGuide from '@/components/SubmissionGuide';
import SubmitDraft from '@/components/SubmitDraft';
import CampaignOverlay from '@/components/CampaignOverlay';
import InActionCard, { ActiveSubmission } from '@/components/InActionCard';
import InActionDetail from '@/components/InActionDetail';
import { Campaign } from '@/types/campaign';
import { useRecentCampaigns } from '@/hooks/useRecentCampaigns';
import { ChevronRight, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';

const CampaignList: React.FC<{ campaigns: Campaign[]; onSelect: (c: Campaign) => void }> = ({ campaigns, onSelect }) => (
  <div className="space-y-2.5">
    {campaigns.map((campaign) => (
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
        <div className="w-14 h-14 rounded-[18px] overflow-hidden flex-shrink-0">
          <img src={campaign.image} alt={campaign.brand} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold text-black font-montserrat truncate">{campaign.brand}</span>
          </div>
          <p className="text-xs text-black/50 font-jakarta line-clamp-1">{campaign.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[14px] px-2.5 py-1 flex items-baseline gap-0.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <span className="text-xs font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
            <span className="text-[9px] font-semibold text-white/80 font-montserrat">sek</span>
          </div>
          <ChevronRight className="h-4 w-4 text-black/30" />
        </div>
      </button>
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
  const recentCampaigns = useRecentCampaigns();
  const favoriteCampaigns = useFavorites();

  // In Action state
  const [activeSubmissions, setActiveSubmissions] = useState<ActiveSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ActiveSubmission | null>(null);
  const [isClosingSubmission, setIsClosingSubmission] = useState(false);

  const fetchActiveSubmissions = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('content_submissions')
      .select('id, campaign_id, tiktok_video_url, tiktok_video_id, status, current_views, current_likes, created_at')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) return;

    // Fetch campaign details for each submission
    const campaignIds = [...new Set(data.map(s => s.campaign_id))];
    if (campaignIds.length === 0) {
      setActiveSubmissions([]);
      return;
    }

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
  }, [user]);

  useEffect(() => {
    fetchActiveSubmissions();
  }, [fetchActiveSubmissions]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-black/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center justify-center px-4 py-3">
          <span className="text-base font-semibold text-black">Action</span>
        </div>
      </div>

      {/* In Action Section */}
      <div className="px-4 pt-4 pb-1">
        <h2 className="text-sm font-bold text-black font-montserrat">In Action</h2>
      </div>

      {/* Active submissions list */}
      {activeSubmissions.length > 0 && !activeCampaign && (
        <div className="px-3 pt-2 space-y-2.5">
          {activeSubmissions.map(sub => (
            <InActionCard key={sub.id} submission={sub} onClick={() => setSelectedSubmission(sub)} />
          ))}
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

      {!activeCampaign && activeSubmissions.length === 0 && (
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
            {recentCampaigns.length === 0 ? (
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
            {favoriteCampaigns.length === 0 ? (
              <div className="flex items-center justify-center px-6 py-10">
                <p className="text-black/40 font-jakarta text-sm">No favourite campaigns</p>
              </div>
            ) : (
              <CampaignList campaigns={favoriteCampaigns} onSelect={handleRecentCampaignClick} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Campaign detail overlay */}
      {selectedRecentCampaign && (
        <CampaignOverlay
          campaign={selectedRecentCampaign}
          isClosing={isClosingOverlay}
          onClose={handleCloseOverlay}
          isSaved={false}
          onToggleSave={() => {}}
        />
      )}

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

      <BottomNav />
    </div>
  );
};

export default Activity;
