import { useState, useCallback } from 'react';
import { Campaign, campaigns } from '@/data/campaigns';

const STORAGE_KEY = 'jarla_recent_campaigns';
const MAX_RECENT = 20;

export function addRecentCampaign(campaignId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let ids: string[] = stored ? JSON.parse(stored) : [];
    // Remove if already present, then prepend
    ids = ids.filter(id => id !== campaignId);
    ids.unshift(campaignId);
    // Keep only the most recent
    ids = ids.slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // silently fail
  }
}

export function useRecentCampaigns(): Campaign[] {
  const [recentCampaigns] = useState<Campaign[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const ids: string[] = JSON.parse(stored);
      return ids
        .map(id => campaigns.find(c => c.id === id))
        .filter((c): c is Campaign => !!c);
    } catch {
      return [];
    }
  });

  return recentCampaigns;
}
