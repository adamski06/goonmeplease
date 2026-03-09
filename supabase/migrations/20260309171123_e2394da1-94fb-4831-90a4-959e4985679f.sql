
CREATE OR REPLACE FUNCTION public.claim_reward_coupon(p_submission_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_submission RECORD;
  v_reward_ad RECORD;
  v_coupon text;
  v_remaining text[];
BEGIN
  -- Get the submission and verify ownership
  SELECT rs.id, rs.reward_ad_id, rs.creator_id, rs.status, rs.coupon_code, rs.current_views
  INTO v_submission
  FROM public.reward_submissions rs
  WHERE rs.id = p_submission_id;

  IF v_submission IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  IF v_submission.creator_id != auth.uid() THEN
    RAISE EXCEPTION 'Not your submission';
  END IF;

  -- Already claimed
  IF v_submission.coupon_code IS NOT NULL THEN
    RETURN v_submission.coupon_code;
  END IF;

  -- Must be approved
  IF v_submission.status != 'approved' THEN
    RAISE EXCEPTION 'Submission not approved';
  END IF;

  -- Get the reward ad
  SELECT ra.id, ra.views_required, ra.coupon_codes
  INTO v_reward_ad
  FROM public.reward_ads ra
  WHERE ra.id = v_submission.reward_ad_id;

  IF v_reward_ad IS NULL THEN
    RAISE EXCEPTION 'Reward ad not found';
  END IF;

  -- Check views goal
  IF v_submission.current_views < v_reward_ad.views_required THEN
    RAISE EXCEPTION 'Views goal not reached';
  END IF;

  -- Pop a coupon code
  IF v_reward_ad.coupon_codes IS NULL OR array_length(v_reward_ad.coupon_codes, 1) IS NULL OR array_length(v_reward_ad.coupon_codes, 1) = 0 THEN
    RAISE EXCEPTION 'No coupon codes available';
  END IF;

  v_coupon := v_reward_ad.coupon_codes[1];
  v_remaining := v_reward_ad.coupon_codes[2:];

  -- Update reward_ads to remove the used coupon
  UPDATE public.reward_ads
  SET coupon_codes = v_remaining, updated_at = now()
  WHERE id = v_reward_ad.id;

  -- Assign coupon to submission
  UPDATE public.reward_submissions
  SET coupon_code = v_coupon, status = 'completed', updated_at = now()
  WHERE id = p_submission_id;

  RETURN v_coupon;
END;
$$;
