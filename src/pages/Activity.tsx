import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import SubmissionGuide from '@/components/SubmissionGuide';
import { Campaign } from '@/data/campaigns';
import { useRecentCampaigns } from '@/hooks/useRecentCampaigns';
import { ChevronRight, X } from 'lucide-react';
import tiktokIcon from '@/assets/tiktok-icon.png';

const Activity: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideSliding, setGuideSliding] = useState(false);
  const [activeTab, setActiveTab] = useState<'action' | 'recent'>('action');
  const recentCampaigns = useRecentCampaigns();

  // Check if a campaign was passed via navigation state
  useEffect(() => {
    const state = location.state as { campaign?: Campaign } | null;
    if (state?.campaign) {
      setActiveCampaign(state.campaign);
      setActiveTab('action');
      // Small delay then slide in the guide
      setTimeout(() => {
        setGuideSliding(true);
        setTimeout(() => {
          setShowGuide(true);
          setGuideSliding(false);
        }, 300);
      }, 100);
      // Clear navigation state so refresh doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
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

  const handleRecentCampaignClick = (campaign: Campaign) => {
    navigate('/activity', { state: { campaign } });
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
      {/* Header with safe area */}
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center justify-center px-4 py-3">
          <span className="text-base font-semibold text-black">Action</span>
        </div>
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          onClick={() => setActiveTab('action')}
          className="px-5 py-2 rounded-full text-sm font-semibold font-montserrat transition-all"
          style={{
            background: activeTab === 'action'
              ? 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
            color: activeTab === 'action' ? 'white' : 'rgba(0,0,0,0.5)',
            border: activeTab === 'action'
              ? '1.5px solid rgba(60,60,60,0.6)'
              : '1px solid rgba(0,0,0,0.06)',
            boxShadow: activeTab === 'action'
              ? '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
              : 'none',
          }}
        >
          In Action
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className="px-5 py-2 rounded-full text-sm font-semibold font-montserrat transition-all"
          style={{
            background: activeTab === 'recent'
              ? 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
            color: activeTab === 'recent' ? 'white' : 'rgba(0,0,0,0.5)',
            border: activeTab === 'recent'
              ? '1.5px solid rgba(60,60,60,0.6)'
              : '1px solid rgba(0,0,0,0.06)',
            boxShadow: activeTab === 'recent'
              ? '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
              : 'none',
          }}
        >
          Recent
        </button>
      </div>

      {/* In Action Tab */}
      {activeTab === 'action' && (
        <>
          {!activeCampaign && !showGuide && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
              <p className="text-black/40 font-jakarta text-sm">No active campaigns yet</p>
            </div>
          )}

          {/* Active campaign inside expanded node */}
          {activeCampaign && (
            <div className="px-3 pt-3">
              <div
                className="rounded-[36px] overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                  maxHeight: 'calc(100dvh - 230px)',
                }}
              >
                <div className="relative overflow-hidden" style={{ height: 'calc(100dvh - 230px)' }}>
                  {/* Campaign summary (slides out left when guide comes in) */}
                  <div
                    className="absolute inset-0 flex flex-col overflow-hidden"
                    style={{
                      transform: showGuide || guideSliding ? 'translateX(-100%)' : 'translateX(0)',
                      opacity: showGuide || guideSliding ? 0 : 1,
                      transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                      pointerEvents: !showGuide && !guideSliding ? 'auto' : 'none',
                    }}
                  >
                    {/* X close button */}
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

                  {/* Guide (slides in from right) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: showGuide && !guideSliding ? 'translateX(0)' : 'translateX(100%)',
                      opacity: showGuide && !guideSliding ? 1 : 0,
                      transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                      pointerEvents: showGuide && !guideSliding ? 'auto' : 'none',
                    }}
                  >
                    <SubmissionGuide campaign={activeCampaign} onBack={handleCloseGuide} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent Tab */}
      {activeTab === 'recent' && (
        <div className="px-3 pt-3">
          {recentCampaigns.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
              <p className="text-black/40 font-jakarta text-sm">No recent campaigns</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentCampaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => handleRecentCampaignClick(campaign)}
                  className="w-full rounded-[28px] overflow-hidden flex items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                    border: '1.5px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Campaign image */}
                  <div className="w-14 h-14 rounded-[18px] overflow-hidden flex-shrink-0">
                    <img src={campaign.image} alt={campaign.brand} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                        <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-black font-montserrat truncate">{campaign.brand}</span>
                    </div>
                    <p className="text-xs text-black/50 font-jakarta line-clamp-1">{campaign.description}</p>
                  </div>

                  {/* Earnings + arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[14px] px-2.5 py-1 flex items-baseline gap-0.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <span className="text-xs font-bold text-white font-montserrat">
                        {campaign.maxEarnings.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-semibold text-white/80 font-montserrat">sek</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-black/30" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Activity;
