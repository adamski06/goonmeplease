import { useState, useEffect } from 'react';
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

export function useRecentCampaigns(): { campaigns: Campaign[]; loading: boolean } {
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) { setLoading(false); return; }
      const ids: string[] = JSON.parse(stored);
      if (ids.length === 0) { setLoading(false); return; }
      fetchCampaignsByIds(ids).then(c => { setRecentCampaigns(c); setLoading(false); });
    } catch { setLoading(false); }
  }, []);

  return { campaigns: recentCampaigns, loading };
}
