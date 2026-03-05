
CREATE TABLE public.reward_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  brand_name text NOT NULL,
  brand_logo_url text,
  title text NOT NULL,
  description text,
  guidelines text[],
  category text,
  cover_image_url text,
  reward_description text NOT NULL,
  views_required integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reward_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active reward ads" ON public.reward_ads
  FOR SELECT USING (is_active = true);

CREATE POLICY "Businesses can view own reward ads" ON public.reward_ads
  FOR SELECT USING (auth.uid() = business_id);

CREATE POLICY "Businesses can create reward ads" ON public.reward_ads
  FOR INSERT WITH CHECK (auth.uid() = business_id AND has_role(auth.uid(), 'business'::app_role));

CREATE POLICY "Businesses can update own reward ads" ON public.reward_ads
  FOR UPDATE USING (auth.uid() = business_id);

CREATE POLICY "Businesses can delete own reward ads" ON public.reward_ads
  FOR DELETE USING (auth.uid() = business_id);
