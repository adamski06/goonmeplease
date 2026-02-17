import React, { useEffect, useState, useRef, useCallback } from 'react';
import placeholderBlue from '@/assets/campaigns/placeholder-blue.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import tiktokIcon from '@/assets/tiktok-icon.png';
import { supabase } from '@/integrations/supabase/client';
import { addRecentCampaign } from '@/hooks/useRecentCampaigns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Campaign } from '@/types/campaign';
import { useCampaigns } from '@/hooks/useCampaigns';
import BottomNav from '@/components/BottomNav';
import CampaignOverlay from '@/components/CampaignOverlay';

const Discover: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);
  const { campaigns, loading: campaignsLoading, hasMore, loadMore } = useCampaigns();

  const handleSelectCampaign = (campaign: Campaign) => {
    if (featuredScrollRef.current) {
      savedScrollPosition.current = featuredScrollRef.current.scrollTop;
    }
    setSelectedCampaign(campaign);
    addRecentCampaign(campaign.id);
  };

  const handleBackFromDetail = () => {
    if (isClosingDetail) return;
    setIsClosingDetail(true);
    setTimeout(() => {
      setSelectedCampaign(null);
      setIsClosingDetail(false);
      requestAnimationFrame(() => {
        if (featuredScrollRef.current) {
          featuredScrollRef.current.scrollTop = savedScrollPosition.current;
        }
      });
    }, 400);
  };

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const { data } = await supabase
          .from('favorites')
          .select('campaign_id')
          .eq('user_id', user.id);
        if (data) {
          setFavorites(data.map(f => f.campaign_id));
        }
      };
      fetchFavorites();
    }
  }, [user]);

  const toggleFavorite = async (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    if (favorites.includes(campaignId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('campaign_id', campaignId);
      setFavorites(favorites.filter(id => id !== campaignId));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, campaign_id: campaignId });
      setFavorites([...favorites, campaignId]);
    }
  };

  // Load more on scroll
  const handleScroll = useCallback(() => {
    if (!featuredScrollRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = featuredScrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < clientHeight) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <BottomNav onAuthRequired={() => setShowAuthPrompt(true)} />

      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {selectedCampaign && (
          <CampaignOverlay
            campaign={selectedCampaign}
            isClosing={isClosingDetail}
            onClose={handleBackFromDetail}
            isSaved={favorites.includes(selectedCampaign.id)}
            onToggleSave={(e) => toggleFavorite(selectedCampaign.id, e)}
          />
        )}

        <div className="flex flex-col border-b border-black/10 bg-white safe-area-top">
          <div className="flex items-center justify-center px-4 py-3">
            <span className="text-base font-semibold text-black">Discover</span>
          </div>
        </div>

        <div
          ref={featuredScrollRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto pt-4 pb-24 scrollbar-hide overscroll-contain"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          <div className="px-3">
            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => handleSelectCampaign(campaign)}
                  className="relative overflow-hidden w-full rounded-[28px] aspect-[9/14] select-none"
                  style={{ WebkitUserDrag: 'none', touchAction: 'pan-y' } as React.CSSProperties}
                >
                  <img src={campaign.image || placeholderBlue} alt={campaign.brand} className="absolute inset-0 w-full h-full object-cover rounded-[28px] pointer-events-none select-none" draggable={false} />
                  <div
                    className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none rounded-[28px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  <div className="absolute inset-x-0 top-0 h-[70px] bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none rounded-t-[28px]" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center gap-1.5">
                    <div className="h-[20px] w-[20px] rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                      <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover pointer-events-none" draggable={false} />
                    </div>
                    <span className="text-sm font-medium text-white font-montserrat drop-shadow-md">{campaign.brand}</span>
                  </div>
                  <div
                    className="absolute bottom-1.5 left-1.5 right-1.5 rounded-[22px] px-2.5 pt-2 pb-2 flex flex-col gap-1.5"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                      border: '1.5px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 -4px 20px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)',
                    }}
                  >
                    <p className="text-[11px] font-medium text-black font-jakarta line-clamp-2 leading-relaxed px-0.5">
                      {campaign.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[16px] px-3 py-1.5 flex items-baseline gap-0.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                        <span className="text-sm font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                        <span className="text-[10px] font-semibold text-white/80 font-montserrat">sek</span>
                      </div>
                      <div className="bg-gradient-to-b from-gray-700 to-gray-900 rounded-full h-[32px] w-[32px] flex items-center justify-center border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                        <img src={tiktokIcon} alt="TikTok" className="w-4 h-4 object-contain pointer-events-none" draggable={false} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {campaignsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-black/40 text-sm">Loading...</div>
              </div>
            )}
            {!campaignsLoading && campaigns.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <p className="text-black/40 text-sm">No campaigns available</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="sm:max-w-sm bg-white border-0 rounded-[24px] p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-black">Join Jarla</DialogTitle>
          </DialogHeader>
          <p className="text-center text-black/60 text-sm mb-6">
            Create an account to save campaigns, track your submissions, and start earning.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setShowAuthPrompt(false); navigate('/user/auth?mode=signup'); }}
              className="w-full py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-black/80 transition-colors"
            >
              Create account
            </button>
            <button
              onClick={() => { setShowAuthPrompt(false); navigate('/user/auth?mode=login'); }}
              className="w-full py-3 border border-black/20 text-black rounded-full text-sm font-medium hover:bg-black/5 transition-colors"
            >
              Log in
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discover;
