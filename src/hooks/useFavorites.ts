import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types/campaign';
import { fetchCampaignsByIds } from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteCampaigns, setFavoriteCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavoriteCampaigns([]);
      setLoading(false);
      return;
    }
    const fetchFavorites = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('favorites')
        .select('campaign_id')
        .eq('user_id', user.id);
      if (data && data.length > 0) {
        const ids = data.map(f => f.campaign_id);
        const campaigns = await fetchCampaignsByIds(ids);
        setFavoriteCampaigns(campaigns);
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  return { campaigns: favoriteCampaigns, loading };
}
