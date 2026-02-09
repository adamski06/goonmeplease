import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign, campaigns } from '@/data/campaigns';
import { useAuth } from '@/contexts/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteCampaigns, setFavoriteCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!user) {
      setFavoriteCampaigns([]);
      return;
    }
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('campaign_id')
        .eq('user_id', user.id);
      if (data) {
        const favCampaigns = data
          .map(f => campaigns.find(c => c.id === f.campaign_id))
          .filter((c): c is Campaign => !!c);
        setFavoriteCampaigns(favCampaigns);
      }
    };
    fetchFavorites();
  }, [user]);

  return favoriteCampaigns;
}
