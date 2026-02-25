import React, { useEffect, useState, useRef, useCallback } from 'react';
import JarlaLoader from '@/components/JarlaLoader';
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
import { useDeals } from '@/hooks/useDeals';
import BottomNav from '@/components/BottomNav';
import CampaignOverlay from '@/components/CampaignOverlay';
import DealOverlay from '@/components/DealOverlay';

const Discover: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Campaign | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);
  const [isClosingDeal, setIsClosingDeal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);
  const { campaigns, loading: campaignsLoading, hasMore, loadMore } = useCampaigns();
  const { deals } = useDeals();

  const filteredCampaigns = searchQuery.trim()
    ? campaigns.filter(c =>
        c.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : campaigns;

  const filteredDeals = searchQuery.trim()
    ? deals.filter(d =>
        d.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : deals;

  const handleSelectCampaign = (campaign: Campaign) => {
    if (featuredScrollRef.current) {
      savedScrollPosition.current = featuredScrollRef.current.scrollTop;
    }
    setSelectedCampaign(campaign);
    addRecentCampaign(campaign.id);
  };

  const handleSelectDeal = (deal: Campaign) => {
    if (featuredScrollRef.current) {
      savedScrollPosition.current = featuredScrollRef.current.scrollTop;
    }
    setSelectedDeal(deal);
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

  const handleBackFromDeal = () => {
    if (isClosingDeal) return;
    setIsClosingDeal(true);
    setTimeout(() => {
      setSelectedDeal(null);
      setIsClosingDeal(false);
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

  const handleScroll = useCallback(() => {
    if (!featuredScrollRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = featuredScrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < clientHeight) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  if (loading) {
    return <JarlaLoader />;
  }

  const cardBottomPanel = {
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
    border: '1.5px solid rgba(255,255,255,0.8)',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)',
  };

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
        {selectedDeal && (
          <DealOverlay
            deal={selectedDeal}
            isClosing={isClosingDeal}
            onClose={handleBackFromDeal}
            isSaved={false}
            onToggleSave={() => {}}
          />
        )}

        <div className="flex flex-col border-b border-black/10 bg-white safe-area-top">
          <div className="flex items-center justify-center px-4 py-3">
            <span className="text-base font-semibold text-black">Discover</span>
          </div>
        </div>

        <div className="px-3 pt-2 pb-1 bg-white">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/60 z-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 rounded-full text-sm text-black placeholder:text-black/35 outline-none transition-all"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
            />
          </div>
        </div>

        <div
          ref={featuredScrollRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto pt-2 pb-24 scrollbar-hide overscroll-contain"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          <div className="px-3 space-y-4">

            {/* Deals section */}
            {filteredDeals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-black/40 uppercase tracking-widest font-montserrat">Deals</span>
                  <div className="flex-1 h-[1px] bg-black/10" />
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                  {filteredDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => handleSelectDeal(deal)}
                      className="relative overflow-hidden w-full rounded-[28px] aspect-[9/14] select-none"
                      style={{ WebkitUserDrag: 'none', touchAction: 'pan-y' } as React.CSSProperties}
                    >
                      <img src={deal.image || placeholderBlue} alt={deal.brand} className="absolute inset-0 w-full h-full object-cover rounded-[28px] pointer-events-none select-none" draggable={false} />
                      <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none rounded-[28px]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
                      <div className="absolute inset-x-0 top-0 h-[70px] bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none rounded-t-[28px]" />
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center gap-1.5">
                        <div className="h-[20px] w-[20px] rounded-full overflow-hidden border border-white/30 flex-shrink-0 bg-black/20">
                          {deal.logo && <img src={deal.logo} alt={deal.brand} className="w-full h-full object-cover pointer-events-none" draggable={false} />}
                        </div>
                        <span className="text-sm font-medium text-white font-montserrat drop-shadow-md flex-1 truncate">{deal.brand}</span>
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded-[22px] px-2.5 pt-2 pb-2 flex flex-col gap-1.5" style={cardBottomPanel}>
                        <p className="text-[11px] font-medium text-black font-jakarta line-clamp-2 leading-relaxed px-0.5">
                          {deal.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="rounded-[16px] px-3 py-1.5 flex items-center gap-1 border shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" style={{ background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)', borderColor: 'rgba(96,165,250,0.4)' }}>
                            <span className="text-[10px] font-bold text-white font-montserrat">DEAL</span>
                          </div>
                          <div className="bg-gradient-to-b from-gray-700 to-gray-900 rounded-full h-[32px] w-[32px] flex items-center justify-center border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                            <img src={tiktokIcon} alt="TikTok" className="w-4 h-4 object-contain pointer-events-none" draggable={false} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spread campaigns section */}
            {(filteredCampaigns.length > 0 || campaignsLoading) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-black/40 uppercase tracking-widest font-montserrat">Spread</span>
                  <div className="flex-1 h-[1px] bg-black/10" />
                </div>
                {campaignsLoading && campaigns.length === 0 ? (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="relative w-full rounded-[28px] aspect-[9/14] overflow-hidden" style={{ background: 'linear-gradient(180deg, #e8e8e8 0%, #f0f0f0 100%)' }}>
                        <div className="absolute inset-0 skeleton-shimmer" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-black/[0.07]" />
                          <div className="h-3 w-16 rounded-full bg-black/[0.07]" />
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded-[22px] px-2.5 pt-2 pb-2 bg-white/60">
                          <div className="h-3 w-full rounded-full bg-black/[0.07] mb-2" />
                          <div className="h-3 w-3/4 rounded-full bg-black/[0.07] mb-3" />
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-20 rounded-[16px] bg-black/[0.07]" />
                            <div className="h-8 w-8 rounded-full bg-black/[0.07]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                    {filteredCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        onClick={() => handleSelectCampaign(campaign)}
                        className="relative overflow-hidden w-full rounded-[28px] aspect-[9/14] select-none"
                        style={{ WebkitUserDrag: 'none', touchAction: 'pan-y' } as React.CSSProperties}
                      >
                        <img src={campaign.image || placeholderBlue} alt={campaign.brand} className="absolute inset-0 w-full h-full object-cover rounded-[28px] pointer-events-none select-none" draggable={false} />
                        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none rounded-[28px]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
                        <div className="absolute inset-x-0 top-0 h-[70px] bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none rounded-t-[28px]" />
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center gap-1.5">
                          <div className="h-[20px] w-[20px] rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                            <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover pointer-events-none" draggable={false} />
                          </div>
                          <span className="text-sm font-medium text-white font-montserrat drop-shadow-md">{campaign.brand}</span>
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded-[22px] px-2.5 pt-2 pb-2 flex flex-col gap-1.5" style={cardBottomPanel}>
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
                )}
                {campaignsLoading && campaigns.length > 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-pulse text-black/40 text-sm">Loading...</div>
                  </div>
                )}
              </div>
            )}

            {!campaignsLoading && filteredCampaigns.length === 0 && filteredDeals.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <p className="text-black/40 text-sm">{searchQuery.trim() ? 'No results found' : 'No campaigns available'}</p>
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
