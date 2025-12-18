-- Add 'business' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'business';

-- Add status column to campaigns table for active/paused/ended states
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'status') THEN
    ALTER TABLE public.campaigns ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended'));
  END IF;
END $$;

-- Add total_budget column to campaigns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'total_budget') THEN
    ALTER TABLE public.campaigns ADD COLUMN total_budget numeric DEFAULT 0;
  END IF;
END $$;

-- Create index for faster business queries
CREATE INDEX IF NOT EXISTS idx_campaigns_business_id ON public.campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_content_submissions_campaign_id ON public.content_submissions(campaign_id);