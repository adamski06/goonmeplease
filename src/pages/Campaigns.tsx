import React, { useEffect, useState, useRef, useCallback } from 'react';
import JarlaLoader from '@/components/JarlaLoader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CampaignCard from '@/components/CampaignCard';
import DealCard from '@/components/DealCard';
import BottomNav from '@/components/BottomNav';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useDeals } from '@/hooks/useDeals';
import jarlaLogo from '@/assets/jarla-logo.png';

const Campaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { campaigns, loading: campaignsLoading, hasMore, loadMore } = useCampaigns(2);
  const { deals } = useDeals();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Interleave deals into campaign feed (1 deal every 3 campaigns)
  const feedItems = React.useMemo(() => {
    const items: Array<{ type: 'campaign' | 'deal'; data: typeof campaigns[0] }> = [];
    let dealIdx = 0;
    campaigns.forEach((campaign, i) => {
      items.push({ type: 'campaign', data: campaign });
      // Insert a deal after every 3rd campaign
      if ((i + 1) % 3 === 0 && dealIdx < deals.length) {
        items.push({ type: 'deal', data: deals[dealIdx++] });
      }
    });
    // Append remaining deals
    while (dealIdx < deals.length) {
      items.push({ type: 'deal', data: deals[dealIdx++] });
    }
    return items;
  }, [campaigns, deals]);

  // Fetch user favorites
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
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('campaign_id', campaignId);
      setFavorites(favorites.filter(id => id !== campaignId));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, campaign_id: campaignId });
      setFavorites([...favorites, campaignId]);
    }
  };

  // Load more when scrolling near the end
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Load 2 more when within 1 card of the bottom
    if (scrollHeight - scrollTop - clientHeight < clientHeight) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  if (loading) {
    return <JarlaLoader />;
  }

  return (
    <div className="h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <BottomNav variant="dark" onAuthRequired={() => setShowAuthPrompt(true)} />

      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide h-[calc(100dvh-80px)]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {feedItems.map((item) =>
            item.type === 'deal' ? (
              <DealCard
                key={`deal-${item.data.id}`}
                deal={item.data}
                isSaved={false}
                onToggleFavorite={() => {}}
              />
            ) : (
              <CampaignCard
                key={`campaign-${item.data.id}`}
                campaign={item.data}
                isSaved={favorites.includes(item.data.id)}
                onSelect={() => {}}
                onToggleFavorite={toggleFavorite}
              />
            )
          )}
          {campaignsLoading && campaigns.length === 0 && (
            <div className="h-[calc(100dvh-80px)] flex flex-col items-center justify-center snap-start bg-black">
              <div className="relative h-10 w-[140px] mb-6">
                <div
                  className="absolute inset-0 bg-white/20"
                  style={{
                    WebkitMaskImage: `url(${jarlaLogo})`,
                    maskImage: `url(${jarlaLogo})`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />
              </div>
              <div className="w-32 h-[3px] rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                <div
                  className="h-full rounded-full bg-white/20"
                  style={{ animation: 'expandCenter 0.5s ease-out forwards' }}
                />
              </div>
              <style>{`
                @keyframes expandCenter {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
              `}</style>
            </div>
          )}
          {!campaignsLoading && campaigns.length === 0 && (
            <div className="h-[calc(100dvh-80px)] flex items-center justify-center snap-start">
              <div className="text-white/40">No campaigns available</div>
            </div>
          )}
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

export default Campaigns;
