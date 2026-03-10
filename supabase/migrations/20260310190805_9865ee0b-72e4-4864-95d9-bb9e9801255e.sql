
-- 1. Drop the dangerous direct INSERT policy on payout_requests
DROP POLICY IF EXISTS "Creators can insert own payout requests" ON public.payout_requests;

-- 2. Fix business_profiles: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view business profiles" ON public.business_profiles;
CREATE POLICY "Authenticated users can view business profiles"
  ON public.business_profiles FOR SELECT TO authenticated USING (true);

-- 3. Fix campaign-assets storage: scope UPDATE/DELETE to file owner
DROP POLICY IF EXISTS "Businesses can update own campaign assets" ON storage.objects;
DROP POLICY IF EXISTS "Businesses can delete own campaign assets" ON storage.objects;

CREATE POLICY "Owners can update own campaign assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'campaign-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can delete own campaign assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'campaign-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
