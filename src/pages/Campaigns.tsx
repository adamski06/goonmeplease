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
import BottomNav from '@/components/BottomNav';
import { useCampaigns } from '@/hooks/useCampaigns';

const Campaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { campaigns, loading: campaignsLoading, hasMore, loadMore } = useCampaigns();
  const scrollRef = useRef<HTMLDivElement>(null);

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
    // Load more when within 2 screens of the bottom
    if (scrollHeight - scrollTop - clientHeight < clientHeight * 2) {
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
      <div className="absolute inset-0 bg-black" />
      <BottomNav variant="dark" onAuthRequired={() => setShowAuthPrompt(true)} />

      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide h-[calc(100dvh-80px)]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              isSaved={favorites.includes(campaign.id)}
              onSelect={() => {}}
              onToggleFavorite={toggleFavorite}
            />
          ))}
          {campaignsLoading && campaigns.length === 0 && (
            <div className="h-[calc(100dvh-80px)] flex items-center justify-center snap-start">
              <div className="animate-pulse text-white/40">Loading campaigns...</div>
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
              onClick={() => { setShowAuthPrompt(false); navigate('/auth?mode=signup'); }}
              className="w-full py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-black/80 transition-colors"
            >
              Create account
            </button>
            <button 
              onClick={() => { setShowAuthPrompt(false); navigate('/auth?mode=login'); }}
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
