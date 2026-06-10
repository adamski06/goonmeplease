ALTER TABLE public.reward_ads
  ADD COLUMN IF NOT EXISTS coupon_sheet_id text,
  ADD COLUMN IF NOT EXISTS coupon_sheet_url text,
  ADD COLUMN IF NOT EXISTS coupon_source text NOT NULL DEFAULT 'manual';

ALTER TABLE public.reward_coupons
  ADD COLUMN IF NOT EXISTS sheet_row integer;