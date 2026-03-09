import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types/campaign';

const DEFAULT_BATCH_SIZE = 6;

interface UseRewardsReturn {
  rewards: Campaign[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
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
    productVisibility: row.product_visibility || '',
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

export function useRewards(batchSize: number = DEFAULT_BATCH_SIZE): UseRewardsReturn {
  const [rewards, setRewards] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const initialLoadDone = useRef(false);

  const fetchBatch = useCallback(async (offset: number) => {
    const { data: rows, error } = await supabase
      .from('reward_ads')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + batchSize - 1);

    if (error || !rows) {
      setHasMore(false);
      return [];
    }

    if (rows.length < batchSize) {
      setHasMore(false);
    }

    return rows.map(mapDbReward);
  }, [batchSize]);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const load = async () => {
      setLoading(true);
      const batch = await fetchBatch(0);
      setRewards(batch);
      offsetRef.current = batch.length;
      setLoading(false);
    };
    load();
  }, [fetchBatch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const batch = await fetchBatch(offsetRef.current);
    setRewards(prev => [...prev, ...batch]);
    offsetRef.current += batch.length;
    setLoading(false);
  }, [hasMore, loading, fetchBatch]);

  return { rewards, loading, hasMore, loadMore };
}
