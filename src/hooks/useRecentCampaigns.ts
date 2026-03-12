import { useState, useEffect, useCallback } from 'react';
import { Campaign } from '@/types/campaign';
import { fetchCampaignsByIds } from '@/hooks/useCampaigns';

const STORAGE_KEY = 'jarla_recent_campaigns';
const MAX_RECENT = 20;

export function addRecentCampaign(campaignId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let ids: string[] = stored ? JSON.parse(stored) : [];
    ids = ids.filter(id => id !== campaignId);
    ids.unshift(campaignId);
    ids = ids.slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function useRecentCampaigns(): { campaigns: Campaign[]; loading: boolean; refetch: () => void } {
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) { setLoading(false); return; }
      const ids: string[] = JSON.parse(stored);
      if (ids.length === 0) { setLoading(false); return; }
      setLoading(true);
      fetchCampaignsByIds(ids).then(c => { setRecentCampaigns(c); setLoading(false); });
    } catch { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { campaigns: recentCampaigns, loading, refetch: fetchRecent };
}
