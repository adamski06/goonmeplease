-- Create deals table (similar to campaigns but for creator-request flow)
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  title TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  description TEXT,
  guidelines TEXT[],
  cover_image_url TEXT,
  brand_logo_url TEXT,
  rate_per_view NUMERIC DEFAULT 0,
  max_earnings NUMERIC DEFAULT 0,
  total_budget NUMERIC DEFAULT 0,
  category TEXT,
  video_length TEXT,
  product_visibility TEXT,
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Policies for deals
CREATE POLICY "Anyone can view active deals"
  ON public.deals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Businesses can view own deals"
  ON public.deals FOR SELECT
  USING (auth.uid() = business_id);

CREATE POLICY "Businesses can create deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() = business_id AND has_role(auth.uid(), 'business'::app_role));

CREATE POLICY "Businesses can update own deals"
  ON public.deals FOR UPDATE
  USING (auth.uid() = business_id);

CREATE POLICY "Businesses can delete own deals"
  ON public.deals FOR DELETE
  USING (auth.uid() = business_id);

-- Create deal_applications table (creator requests to join a deal)
CREATE TABLE public.deal_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, accepted, rejected
  message TEXT,
  tiktok_video_url TEXT,
  tiktok_video_id TEXT,
  current_views INTEGER DEFAULT 0,
  current_likes INTEGER DEFAULT 0,
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_applications ENABLE ROW LEVEL SECURITY;

-- Policies for deal_applications
CREATE POLICY "Creators can view own applications"
  ON public.deal_applications FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can apply to deals"
  ON public.deal_applications FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own applications (submit video)"
  ON public.deal_applications FOR UPDATE
  USING (auth.uid() = creator_id AND status = 'accepted');

CREATE POLICY "Businesses can view applications for their deals"
  ON public.deal_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_applications.deal_id
    AND deals.business_id = auth.uid()
  ));

CREATE POLICY "Businesses can update application status"
  ON public.deal_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_applications.deal_id
    AND deals.business_id = auth.uid()
  ));

-- Auto-update updated_at triggers
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_applications_updated_at
  BEFORE UPDATE ON public.deal_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();