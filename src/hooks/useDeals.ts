import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types/campaign';

const DEFAULT_BATCH_SIZE = 6;

interface UseDealsReturn {
  deals: Campaign[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

function mapDbDeal(row: any): Campaign {
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
    tiers: [],
    exampleImages: [],
    ratePerView: Number(row.rate_per_view) || 0,
    type: 'deal',
  };
}

export function useDeals(batchSize: number = DEFAULT_BATCH_SIZE): UseDealsReturn {
  const [deals, setDeals] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const initialLoadDone = useRef(false);

  const fetchBatch = useCallback(async (offset: number) => {
    const { data: rows, error } = await supabase
      .from('deals')
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

    return rows.map(mapDbDeal);
  }, [batchSize]);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const load = async () => {
      setLoading(true);
      const batch = await fetchBatch(0);
      setDeals(batch);
      offsetRef.current = batch.length;
      setLoading(false);
    };
    load();
  }, [fetchBatch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const batch = await fetchBatch(offsetRef.current);
    setDeals(prev => [...prev, ...batch]);
    offsetRef.current += batch.length;
    setLoading(false);
  }, [hasMore, loading, fetchBatch]);

  return { deals, loading, hasMore, loadMore };
}
