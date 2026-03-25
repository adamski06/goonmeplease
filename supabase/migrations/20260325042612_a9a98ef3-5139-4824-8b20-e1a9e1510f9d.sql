
ALTER TABLE public.content_submissions ADD COLUMN IF NOT EXISTS ai_review jsonb DEFAULT NULL;
ALTER TABLE public.deal_applications ADD COLUMN IF NOT EXISTS ai_review jsonb DEFAULT NULL;
ALTER TABLE public.reward_submissions ADD COLUMN IF NOT EXISTS ai_review jsonb DEFAULT NULL;
