import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types/campaign';
import { fetchCampaignsByIds } from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteCampaigns, setFavoriteCampaigns] = useState<Campaign[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      setFavoriteCampaigns([]);
      setFavoriteIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('favorites')
      .select('campaign_id')
      .eq('user_id', user.id);
    const ids = data ? data.map(f => f.campaign_id) : [];
    setFavoriteIds(ids);
    if (ids.length > 0) {
      const campaigns = await fetchCampaignsByIds(ids);
      setFavoriteCampaigns(campaigns);
    } else {
      setFavoriteCampaigns([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (campaignId: string) => {
    if (!user) return;
    if (favoriteIds.includes(campaignId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('campaign_id', campaignId);
      setFavoriteIds(prev => prev.filter(id => id !== campaignId));
      setFavoriteCampaigns(prev => prev.filter(c => c.id !== campaignId));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, campaign_id: campaignId });
      setFavoriteIds(prev => [...prev, campaignId]);
      // Refetch to get full campaign data
      fetchFavorites();
    }
  };

  return { campaigns: favoriteCampaigns, favoriteIds, loading, refetch: fetchFavorites, toggleFavorite };
}
