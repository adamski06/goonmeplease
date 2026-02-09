import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign, CampaignTier } from '@/types/campaign';

const BATCH_SIZE = 6;

interface UseCampaignsReturn {
  campaigns: Campaign[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  getCampaignById: (id: string) => Campaign | undefined;
}

function mapDbCampaign(
  row: any,
  tiers: { campaign_id: string; min_views: number; max_views: number | null; rate_per_view: number }[]
): Campaign {
  const campaignTiers: CampaignTier[] = tiers
    .filter(t => t.campaign_id === row.id)
    .sort((a, b) => a.min_views - b.min_views)
    .map(t => ({ minViews: t.min_views, maxViews: t.max_views, rate: t.rate_per_view }));

  return {
    id: row.id,
    brand: row.brand_name,
    title: row.title,
    description: row.description || '',
    maxEarnings: Number(row.max_earnings) || 0,
    logo: row.brand_logo_url || '',
    image: row.cover_image_url || '',
    contentType: row.category || '',
    productVisibility: row.product_visibility || '',
    videoLength: row.video_length || '',
    guidelines: row.guidelines || [],
    tiers: campaignTiers,
    exampleImages: row.example_image_urls || [],
  };
}

export function useCampaigns(): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const allTiersRef = useRef<any[]>([]);
  const initialLoadDone = useRef(false);

  const fetchBatch = useCallback(async (offset: number) => {
    const { data: rows, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error || !rows) {
      setHasMore(false);
      return [];
    }

    if (rows.length < BATCH_SIZE) {
      setHasMore(false);
    }

    // Fetch tiers for this batch
    const ids = rows.map(r => r.id);
    if (ids.length > 0) {
      const { data: tiers } = await supabase
        .from('campaign_tiers')
        .select('*')
        .in('campaign_id', ids);
      if (tiers) {
        allTiersRef.current = [...allTiersRef.current, ...tiers];
      }
    }

    return rows.map(row => mapDbCampaign(row, allTiersRef.current));
  }, []);

  // Initial load
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const load = async () => {
      setLoading(true);
      const batch = await fetchBatch(0);
      setCampaigns(batch);
      offsetRef.current = batch.length;
      setLoading(false);
    };
    load();
  }, [fetchBatch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const batch = await fetchBatch(offsetRef.current);
    setCampaigns(prev => [...prev, ...batch]);
    offsetRef.current += batch.length;
    setLoading(false);
  }, [hasMore, loading, fetchBatch]);

  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  return { campaigns, loading, hasMore, loadMore, getCampaignById };
}

// Fetch a single campaign by ID (for deep links, recent, favorites)
export async function fetchCampaignById(id: string): Promise<Campaign | null> {
  const { data: row } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!row) return null;

  const { data: tiers } = await supabase
    .from('campaign_tiers')
    .select('*')
    .eq('campaign_id', id);

  return mapDbCampaign(row, tiers || []);
}

// Fetch multiple campaigns by IDs (for recent/favorites lists)
export async function fetchCampaignsByIds(ids: string[]): Promise<Campaign[]> {
  if (ids.length === 0) return [];

  const { data: rows } = await supabase
    .from('campaigns')
    .select('*')
    .in('id', ids)
    .eq('is_active', true);

  if (!rows || rows.length === 0) return [];

  const { data: tiers } = await supabase
    .from('campaign_tiers')
    .select('*')
    .in('campaign_id', rows.map(r => r.id));

  const mapped = rows.map(row => mapDbCampaign(row, tiers || []));

  // Preserve original order
  return ids.map(id => mapped.find(c => c.id === id)).filter((c): c is Campaign => !!c);
}
