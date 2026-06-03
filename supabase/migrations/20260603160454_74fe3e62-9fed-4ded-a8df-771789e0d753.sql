
-- 1. Fix store_tiktok_tokens missing ownership check
CREATE OR REPLACE FUNCTION public.store_tiktok_tokens(p_tiktok_account_id uuid, p_access_token text, p_refresh_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_encrypted_access text;
  v_encrypted_refresh text;
  v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner
  FROM public.tiktok_accounts
  WHERE id = p_tiktok_account_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'TikTok account not found';
  END IF;

  IF v_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this TikTok account';
  END IF;

  SELECT encode(pgsodium.crypto_aead_det_encrypt(
    convert_to(p_access_token, 'utf8'),
    convert_to(p_tiktok_account_id::text, 'utf8'),
    (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
  ), 'base64') INTO v_encrypted_access;

  SELECT encode(pgsodium.crypto_aead_det_encrypt(
    convert_to(p_refresh_token, 'utf8'),
    convert_to(p_tiktok_account_id::text, 'utf8'),
    (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
  ), 'base64') INTO v_encrypted_refresh;

  UPDATE public.tiktok_accounts
  SET access_token = v_encrypted_access,
      refresh_token = v_encrypted_refresh,
      updated_at = now()
  WHERE id = p_tiktok_account_id;
END;
$function$;

-- 2. Add ownership/admin guard on calculate_submission_earnings
CREATE OR REPLACE FUNCTION public.calculate_submission_earnings(p_submission_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  SELECT id, campaign_id, creator_id, current_views
  INTO v_submission
  FROM public.content_submissions
  WHERE id = p_submission_id;

  IF v_submission IS NULL THEN
    RETURN 0;
  END IF;

  -- Authorization: caller must be the creator, the campaign owner, or an admin
  IF v_submission.creator_id <> auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin'::app_role)
     AND NOT EXISTS (
       SELECT 1 FROM public.campaigns c
       WHERE c.id = v_submission.campaign_id AND c.business_id = auth.uid()
     )
  THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT id, max_earnings, total_budget, budget_spent
  INTO v_campaign
  FROM public.campaigns
  WHERE id = v_submission.campaign_id;

  IF v_campaign IS NULL THEN
    RETURN 0;
  END IF;

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

    IF v_remaining_views >= v_tier.min_views THEN
      IF v_tier.max_views IS NOT NULL THEN
        v_tier_views := LEAST(v_remaining_views, v_tier.max_views) - v_tier.min_views;
      ELSE
        v_tier_views := v_remaining_views - v_tier.min_views;
      END IF;

      IF v_tier_views > 0 THEN
        v_tier_earnings := (v_tier_views::numeric / 1000.0) * v_tier.rate_per_view;
        v_total_earnings := v_total_earnings + v_tier_earnings;
      END IF;
    END IF;
  END LOOP;

  v_max_earnings := COALESCE(v_campaign.max_earnings, 0);
  IF v_max_earnings > 0 AND v_total_earnings > v_max_earnings THEN
    v_total_earnings := v_max_earnings;
  END IF;

  v_budget_remaining := COALESCE(v_campaign.total_budget, 0) - COALESCE(v_campaign.budget_spent, 0);

  SELECT COALESCE(SUM(amount), 0) INTO v_capped_earnings
  FROM public.earnings
  WHERE submission_id = p_submission_id;

  v_total_earnings := v_total_earnings - v_capped_earnings;

  IF v_total_earnings <= 0 THEN
    RETURN v_capped_earnings;
  END IF;

  IF v_budget_remaining >= 0 AND v_total_earnings > v_budget_remaining THEN
    v_total_earnings := v_budget_remaining;
  END IF;

  IF v_total_earnings > 0 THEN
    INSERT INTO public.earnings (creator_id, submission_id, views_counted, amount)
    VALUES (v_submission.creator_id, p_submission_id, v_submission.current_views, v_total_earnings + v_capped_earnings)
    ON CONFLICT (submission_id) DO UPDATE SET
      views_counted = EXCLUDED.views_counted,
      amount = EXCLUDED.amount,
      updated_at = now();

    UPDATE public.campaigns
    SET budget_spent = COALESCE(budget_spent, 0) + v_total_earnings
    WHERE id = v_submission.campaign_id;
  END IF;

  RETURN v_total_earnings + v_capped_earnings;
END;
$function$;

-- 3. Restrict create_notification to admins (triggers run as SECURITY DEFINER, unaffected)
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only admins (or internal SECURITY DEFINER triggers, which set role to function owner) may inject notifications
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data);
END;
$function$;

-- 4. Require business role to insert business_profiles
DROP POLICY IF EXISTS "Users can insert own business profile" ON public.business_profiles;
CREATE POLICY "Users can insert own business profile"
ON public.business_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'business'::app_role));

-- 5. Convert helper views to security_invoker so RLS applies as the caller
ALTER VIEW public.business_profiles_public SET (security_invoker = true);
ALTER VIEW public.profiles_public SET (security_invoker = true);
ALTER VIEW public.tiktok_accounts_safe SET (security_invoker = true);

-- 6. Lock down phone_verifications (RLS enabled but no policies)
CREATE POLICY "Admins manage phone verifications"
ON public.phone_verifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
