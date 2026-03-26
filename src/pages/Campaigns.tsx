import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import RewardCard from '@/components/RewardCard';
import BottomNav from '@/components/BottomNav';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useDeals } from '@/hooks/useDeals';
import { useRewards } from '@/hooks/useRewards';

const preloadImage = (url: string) =>
  new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const img = new Image();
    img.onload = finish;
    img.onerror = finish;
    img.src = url;

    if (typeof img.decode === 'function') {
      img.decode().then(finish).catch(() => undefined);
    }

    window.setTimeout(finish, 1500);
  });

const Campaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { campaigns, loading: campaignsLoading, initialLoadComplete, hasMore, loadMore, refresh } = useCampaigns(2);
  const { deals } = useDeals();
  const { rewards } = useRewards();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pull-to-refresh state
  const touchStartY = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [feedVisualReady, setFeedVisualReady] = useState(false);

  // Interleave deals into campaign feed (1 deal every 3 campaigns)
  const feedItems = React.useMemo(() => {
    const items: Array<{ type: 'campaign' | 'deal' | 'reward'; data: typeof campaigns[0] }> = [];
    let dealIdx = 0;
    let rewardIdx = 0;
    campaigns.forEach((campaign, i) => {
      items.push({ type: 'campaign', data: campaign });
      // Insert a deal after every 3rd campaign
      if ((i + 1) % 3 === 0 && dealIdx < deals.length) {
        items.push({ type: 'deal', data: deals[dealIdx++] });
      }
      // Insert a reward after every 5th campaign
      if ((i + 1) % 5 === 0 && rewardIdx < rewards.length) {
        items.push({ type: 'reward', data: rewards[rewardIdx++] });
      }
    });
    // Append remaining deals
    while (dealIdx < deals.length) {
      items.push({ type: 'deal', data: deals[dealIdx++] });
    }
    // Append remaining rewards
    while (rewardIdx < rewards.length) {
      items.push({ type: 'reward', data: rewards[rewardIdx++] });
    }
    return items;
  }, [campaigns, deals, rewards]);

  // Keep launch spinner visible until first card media is decoded
  useEffect(() => {
    if (!initialLoadComplete) {
      setFeedVisualReady(false);
      return;
    }

    if (feedVisualReady) return;

    if (feedItems.length === 0) {
      setFeedVisualReady(true);
      return;
    }

    let cancelled = false;

    const loadFirstCardAssets = async () => {
      const firstVisibleItems = feedItems.slice(0, 1);
      const urls = Array.from(
        new Set(
          firstVisibleItems
            .flatMap((item) => [item.data.image, item.data.logo])
            .filter((url): url is string => Boolean(url && url.trim()))
        )
      );

      if (urls.length > 0) {
        await Promise.all(urls.map(preloadImage));
      }

      if (!cancelled) {
        setFeedVisualReady(true);
      }
    };

    loadFirstCardAssets();

    return () => {
      cancelled = true;
    };
  }, [initialLoadComplete, feedItems, feedVisualReady]);

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

  // Scroll to top when feed items first populate (e.g. after login)
  const prevFeedLength = useRef(0);
  useEffect(() => {
    if (feedItems.length > 0 && prevFeedLength.current === 0 && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevFeedLength.current = feedItems.length;
  }, [feedItems.length]);

  // Load more when scrolling near the end
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < clientHeight) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  // Faster snap settling — detect scroll end and snap programmatically
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSnapSettle = useCallback(() => {
    if (feedItems.length <= 1) return; // No snapping needed for single item
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cardHeight = container.clientHeight;
      if (cardHeight === 0) return;
      const targetIndex = Math.round(container.scrollTop / cardHeight);
      const targetScroll = targetIndex * cardHeight;
      if (Math.abs(container.scrollTop - targetScroll) > 2) {
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }, 80);
  }, [feedItems.length]);

  const onScroll = useCallback(() => {
    handleScroll();
    handleSnapSettle();
  }, [handleScroll, handleSnapSettle]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === 0 || refreshing) return;
    if (scrollRef.current && scrollRef.current.scrollTop > 0) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.4, 80));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 50 && !refreshing) {
      setRefreshing(true);
      setPullDistance(60);
      await refresh();
      setRefreshing(false);
    }
    setPullDistance(0);
    touchStartY.current = 0;
  }, [pullDistance, refreshing, refresh]);

  // Loading handled by UserLayout

  return (
    <div className="h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <BottomNav variant="dark" onAuthRequired={() => setShowAuthPrompt(true)} />

      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Pull-to-refresh indicator */}
        {(pullDistance > 0 || refreshing) && (
          <div
            className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center pointer-events-none"
            style={{ height: `${pullDistance}px`, transition: refreshing ? 'none' : 'height 0.15s ease-out' }}
          >
            <div className={`w-6 h-6 border-2 border-white/40 border-t-white/80 rounded-full ${refreshing ? 'animate-spin' : ''}`}
              style={{ opacity: Math.min(pullDistance / 50, 1) }}
            />
          </div>
        )}

        {!feedVisualReady && (
          <div className="h-[calc(100dvh-80px)] flex items-center justify-center bg-black">
            <div className="h-5 w-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={onScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex-1 overflow-y-scroll ${feedItems.length > 1 ? 'snap-y snap-mandatory' : ''} scrollbar-hide h-[calc(100dvh-80px)] overscroll-none ${!feedVisualReady ? 'hidden' : ''}`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
            transition: pullDistance > 0 ? 'none' : 'transform 0.3s ease-out',
          } as React.CSSProperties}
        >
          {feedItems.map((item) =>
            item.type === 'reward' ? (
              <RewardCard
                key={`reward-${item.data.id}`}
                reward={item.data}
                isSaved={false}
                onToggleFavorite={() => {}}
              />
            ) : item.type === 'deal' ? (
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
          {/* Spacer so the last card can snap fully into view — only when multiple items */}
          {feedItems.length > 1 && !campaignsLoading && (
            <div className="h-[calc(100dvh-80px)] snap-start flex items-center justify-center">
              <p className="text-white/20 text-sm font-jakarta">You're all caught up</p>
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
