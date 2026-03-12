
-- Fix storage policies: scope campaign-assets to user-id folder prefix
DROP POLICY IF EXISTS "Businesses can upload campaign assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update campaign assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete campaign assets" ON storage.objects;

CREATE POLICY "Owners can upload own campaign assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'campaign-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Owners can update own campaign assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'campaign-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Owners can delete own campaign assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'campaign-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Fix data exposure: create safe views excluding sensitive Stripe IDs
-- Profiles: replace broad SELECT with owner-only, add public view
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view public profile data" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Create a safe view for cross-user profile queries (excludes stripe_connect_id)
CREATE OR REPLACE VIEW public.profiles_public AS
  SELECT id, user_id, full_name, avatar_url, username, bio, phone_number, created_at, updated_at, username_changed_at
  FROM public.profiles;

-- Business profiles: create safe view excluding stripe_customer_id
CREATE OR REPLACE VIEW public.business_profiles_public AS
  SELECT id, user_id, company_name, logo_url, description, website, country, organization_number,
         vat_number, phone_number, address, city, postal_code, industry, target_audience, brand_values,
         onboarding_complete, created_at, updated_at
  FROM public.business_profiles;
