import { useState, useEffect, useCallback } from 'react';
import { Campaign } from '@/types/campaign';
import { fetchCampaignsByIds } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'jarla_recent_campaigns';
const MAX_RECENT = 20;

// Each entry stores the id and its type so we can fetch from the right table
interface RecentEntry {
  id: string;
  type: 'spread' | 'reward' | 'deal';
}

export function addRecentCampaign(campaignId: string, type: 'spread' | 'reward' | 'deal' = 'spread') {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let entries: RecentEntry[] = [];
    
    // Migrate old format (string[]) to new format
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'string') {
          // Old format: array of strings
          entries = parsed.map((id: string) => ({ id, type: 'spread' as const }));
        } else {
          entries = parsed;
        }
      }
    }
    
    entries = entries.filter(e => e.id !== campaignId);
    entries.unshift({ id: campaignId, type });
    entries = entries.slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function mapDbReward(row: any): Campaign {
  return {
    id: row.id,
    brand: row.brand_name,
    title: row.title,
    description: row.description || '',
    maxEarnings: 0,
    pool: 0,
    logo: row.brand_logo_url || '',
    image: row.cover_image_url || '',
    contentType: row.category || '',
    productVisibility: '',
    videoLength: '',
    guidelines: row.guidelines || [],
    tiers: [],
    exampleImages: [],
    ratePerView: 0,
    type: 'reward',
    rewardDescription: row.reward_description || '',
    viewsRequired: row.views_required || 0,
  };
}

export function useRecentCampaigns(): { campaigns: Campaign[]; loading: boolean; refetch: () => void } {
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = useCallback(async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) { setLoading(false); return; }
      
      let entries: RecentEntry[] = [];
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'string') {
          entries = parsed.map((id: string) => ({ id, type: 'spread' as const }));
        } else {
          entries = parsed;
        }
      }
      
      if (entries.length === 0) { setLoading(false); return; }
      setLoading(true);

      const spreadIds = entries.filter(e => e.type === 'spread').map(e => e.id);
      const rewardIds = entries.filter(e => e.type === 'reward').map(e => e.id);

      const [spreadCampaigns, rewardResults] = await Promise.all([
        spreadIds.length > 0 ? fetchCampaignsByIds(spreadIds) : Promise.resolve([]),
        rewardIds.length > 0
          ? supabase
              .from('reward_ads')
              .select('*')
              .in('id', rewardIds)
              .eq('is_active', true)
              .then(({ data }) => (data || []).map(mapDbReward))
          : Promise.resolve([]),
      ]);

      // Build a map for quick lookup
      const allMap = new Map<string, Campaign>();
      spreadCampaigns.forEach(c => allMap.set(c.id, c));
      rewardResults.forEach(c => allMap.set(c.id, c));

      // Preserve original order
      const ordered = entries
        .map(e => allMap.get(e.id))
        .filter((c): c is Campaign => !!c);

      setRecentCampaigns(ordered);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { campaigns: recentCampaigns, loading, refetch: fetchRecent };
}
