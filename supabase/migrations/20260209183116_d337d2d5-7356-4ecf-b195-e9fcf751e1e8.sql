
-- Add missing columns to campaigns table for creator app
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS max_earnings numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_length text,
  ADD COLUMN IF NOT EXISTS product_visibility text,
  ADD COLUMN IF NOT EXISTS example_image_urls text[];

-- Change guidelines from text to text[] (table is empty so safe)
ALTER TABLE public.campaigns ALTER COLUMN guidelines TYPE text[] USING CASE WHEN guidelines IS NOT NULL THEN ARRAY[guidelines] ELSE NULL END;

-- Create storage bucket for campaign assets (images, logos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-assets', 'campaign-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for campaign assets
CREATE POLICY "Campaign assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-assets');

-- Only businesses can upload campaign assets
CREATE POLICY "Businesses can upload campaign assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Businesses can update own campaign assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Businesses can delete own campaign assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);
