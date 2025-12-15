-- Remove foreign key constraint on favorites.campaign_id
-- This allows favorites to work with mock campaign IDs that don't exist in the campaigns table
ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_campaign_id_fkey;