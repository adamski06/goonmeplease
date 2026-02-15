
-- Add AI-researched fields to business_profiles
ALTER TABLE public.business_profiles 
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS brand_values text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
