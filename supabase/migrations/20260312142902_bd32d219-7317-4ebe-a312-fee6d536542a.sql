-- Drop the overly broad policies (owner-scoped ones already exist)
DROP POLICY IF EXISTS "Authenticated users can update campaign assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete campaign assets" ON storage.objects;