
DELETE FROM public.reward_coupons
WHERE ctid IN (
  SELECT ctid FROM (
    SELECT ctid, ROW_NUMBER() OVER (PARTITION BY reward_ad_id, code ORDER BY created_at, ctid) AS rn
    FROM public.reward_coupons
  ) t
  WHERE t.rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reward_coupons_ad_code
  ON public.reward_coupons (reward_ad_id, code);
