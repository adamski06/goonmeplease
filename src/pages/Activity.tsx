import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import SubmissionGuide from '@/components/SubmissionGuide';
import { Campaign } from '@/data/campaigns';

const Activity: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideSliding, setGuideSliding] = useState(false);

  // Check if a campaign was passed via navigation state
  useEffect(() => {
    const state = location.state as { campaign?: Campaign } | null;
    if (state?.campaign) {
      setActiveCampaign(state.campaign);
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

      {/* Content */}
      {!activeCampaign && !showGuide && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <p className="text-black/40">No activity yet</p>
        </div>
      )}

      {/* Campaign info + Guide overlay */}
      {activeCampaign && (
        <div className="relative overflow-hidden" style={{ height: 'calc(100dvh - 130px)' }}>
          {/* Campaign summary (slides out left when guide comes in) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            style={{
              transform: showGuide || guideSliding ? 'translateX(-100%)' : 'translateX(0)',
              opacity: showGuide || guideSliding ? 0 : 1,
              transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
              pointerEvents: !showGuide && !guideSliding ? 'auto' : 'none',
            }}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border border-black/10">
              <img src={activeCampaign.logo} alt={activeCampaign.brand} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-bold text-black font-montserrat mb-1">{activeCampaign.brand}</h2>
            <p className="text-sm text-black/60 font-jakarta text-center max-w-[260px]">{activeCampaign.description}</p>
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
      )}

      <BottomNav />
    </div>
  );
};

export default Activity;
