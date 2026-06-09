
-- 1. business-logos: require path-based ownership on upload
DROP POLICY IF EXISTS "Authenticated users can upload business logos" ON storage.objects;
CREATE POLICY "Users can upload own business logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 2. business_profiles: scope UPDATE to authenticated only
DROP POLICY IF EXISTS "Users can update own business profile" ON public.business_profiles;
CREATE POLICY "Users can update own business profile"
ON public.business_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. user_roles: scope self-insert creator role to authenticated only
DROP POLICY IF EXISTS "Users can add creator role to self" ON public.user_roles;
CREATE POLICY "Users can add creator role to self"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'creator'::app_role);
