ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS bonus_views_threshold integer DEFAULT NULL;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS bonus_rate_per_view numeric DEFAULT NULL;