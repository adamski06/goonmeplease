-- Fix campaign-assets UPDATE/DELETE policies: thumbnails don't use user-id folders
-- Replace overly restrictive folder-based policies with authenticated-user policies

DROP POLICY IF EXISTS "Owners can update own campaign assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete own campaign assets" ON storage.objects;

CREATE POLICY "Authenticated users can update campaign assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete campaign assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'campaign-assets' AND auth.uid() IS NOT NULL);