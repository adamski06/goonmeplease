
-- Add current_shares to content_submissions
ALTER TABLE public.content_submissions ADD COLUMN IF NOT EXISTS current_shares integer DEFAULT 0;

-- Add budget_spent to campaigns to track pot consumption
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS budget_spent numeric DEFAULT 0;

-- Create function to calculate and upsert earnings based on views and campaign tiers
CREATE OR REPLACE FUNCTION public.calculate_submission_earnings(p_submission_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_submission RECORD;
  v_campaign RECORD;
  v_tier RECORD;
  v_total_earnings numeric := 0;
  v_remaining_views integer;
  v_tier_views integer;
  v_tier_earnings numeric;
  v_max_earnings numeric;
  v_budget_remaining numeric;
  v_capped_earnings numeric;
BEGIN
  -- Get submission
  SELECT id, campaign_id, creator_id, current_views
  INTO v_submission
  FROM public.content_submissions
  WHERE id = p_submission_id;

  IF v_submission IS NULL THEN
    RETURN 0;
  END IF;

  -- Get campaign
  SELECT id, max_earnings, total_budget, budget_spent
  INTO v_campaign
  FROM public.campaigns
  WHERE id = v_submission.campaign_id;

  IF v_campaign IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate earnings from tiers
  v_remaining_views := v_submission.current_views;

  FOR v_tier IN
    SELECT min_views, max_views, rate_per_view
    FROM public.campaign_tiers
    WHERE campaign_id = v_submission.campaign_id
    ORDER BY min_views ASC
  LOOP
    IF v_remaining_views <= 0 THEN
      EXIT;
    END IF;

    -- Views in this tier range
    IF v_remaining_views >= v_tier.min_views THEN
      IF v_tier.max_views IS NOT NULL THEN
        v_tier_views := LEAST(v_remaining_views, v_tier.max_views) - v_tier.min_views;
      ELSE
        v_tier_views := v_remaining_views - v_tier.min_views;
      END IF;

      IF v_tier_views > 0 THEN
        v_tier_earnings := v_tier_views * v_tier.rate_per_view;
        v_total_earnings := v_total_earnings + v_tier_earnings;
      END IF;
    END IF;
  END LOOP;

  -- Cap at max_earnings per submission
  v_max_earnings := COALESCE(v_campaign.max_earnings, 0);
  IF v_max_earnings > 0 AND v_total_earnings > v_max_earnings THEN
    v_total_earnings := v_max_earnings;
  END IF;

  -- Cap at remaining budget (pot)
  v_budget_remaining := COALESCE(v_campaign.total_budget, 0) - COALESCE(v_campaign.budget_spent, 0);
  
  -- Get existing earnings for this submission to calculate delta
  SELECT COALESCE(SUM(amount), 0) INTO v_capped_earnings
  FROM public.earnings
  WHERE submission_id = p_submission_id;

  -- New earnings delta
  v_total_earnings := v_total_earnings - v_capped_earnings;
  
  IF v_total_earnings <= 0 THEN
    RETURN v_capped_earnings;
  END IF;

  -- Cap delta at remaining budget
  IF v_budget_remaining >= 0 AND v_total_earnings > v_budget_remaining THEN
    v_total_earnings := v_budget_remaining;
  END IF;

  IF v_total_earnings > 0 THEN
    -- Upsert earnings record
    INSERT INTO public.earnings (creator_id, submission_id, views_counted, amount)
    VALUES (v_submission.creator_id, p_submission_id, v_submission.current_views, v_total_earnings + v_capped_earnings)
    ON CONFLICT (submission_id) DO UPDATE SET
      views_counted = EXCLUDED.views_counted,
      amount = EXCLUDED.amount,
      updated_at = now();

    -- Update campaign budget_spent
    UPDATE public.campaigns
    SET budget_spent = COALESCE(budget_spent, 0) + v_total_earnings
    WHERE id = v_submission.campaign_id;
  END IF;

  RETURN v_total_earnings + v_capped_earnings;
END;
$$;

-- Add unique constraint on earnings.submission_id for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'earnings_submission_id_unique'
  ) THEN
    ALTER TABLE public.earnings ADD CONSTRAINT earnings_submission_id_unique UNIQUE (submission_id);
  END IF;
END $$;
