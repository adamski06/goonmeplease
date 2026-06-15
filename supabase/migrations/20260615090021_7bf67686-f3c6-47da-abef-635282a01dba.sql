ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tiktok_username text,
  ADD COLUMN IF NOT EXISTS instagram_username text,
  ADD COLUMN IF NOT EXISTS linkedin_username text;