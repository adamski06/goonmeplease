
-- Create reward_submissions table
CREATE TABLE public.reward_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_ad_id uuid NOT NULL REFERENCES public.reward_ads(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL,
  tiktok_account_id uuid NOT NULL REFERENCES public.tiktok_accounts(id),
  tiktok_video_url text NOT NULL,
  tiktok_video_id text,
  status text NOT NULL DEFAULT 'pending_review',
  current_views integer DEFAULT 0,
  current_likes integer DEFAULT 0,
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  coupon_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reward_ad_id, creator_id)
);

-- Enable RLS
ALTER TABLE public.reward_submissions ENABLE ROW LEVEL SECURITY;

-- Creators can create submissions
CREATE POLICY "Creators can create reward submissions"
ON public.reward_submissions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = creator_id);

-- Creators can view own submissions
CREATE POLICY "Creators can view own reward submissions"
ON public.reward_submissions FOR SELECT TO authenticated
USING (auth.uid() = creator_id);

-- Businesses can view submissions for their reward ads
CREATE POLICY "Businesses can view reward submissions for their ads"
ON public.reward_submissions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.reward_ads
  WHERE reward_ads.id = reward_submissions.reward_ad_id
  AND reward_ads.business_id = auth.uid()
));

-- Businesses can update submissions for their reward ads
CREATE POLICY "Businesses can update reward submissions"
ON public.reward_submissions FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.reward_ads
  WHERE reward_ads.id = reward_submissions.reward_ad_id
  AND reward_ads.business_id = auth.uid()
));

-- Admins can view all
CREATE POLICY "Admins can view all reward submissions"
ON public.reward_submissions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all
CREATE POLICY "Admins can update all reward submissions"
ON public.reward_submissions FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));
