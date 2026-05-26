
-- 1. Reward coupons private table
CREATE TABLE public.reward_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_ad_id uuid NOT NULL REFERENCES public.reward_ads(id) ON DELETE CASCADE,
  code text NOT NULL,
  claimed_by uuid,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reward_coupons_reward_unclaimed ON public.reward_coupons(reward_ad_id) WHERE claimed_at IS NULL;
ALTER TABLE public.reward_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage own coupons"
ON public.reward_coupons FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.reward_ads ra WHERE ra.id = reward_coupons.reward_ad_id AND ra.business_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.reward_ads ra WHERE ra.id = reward_coupons.reward_ad_id AND ra.business_id = auth.uid()));

CREATE POLICY "Admins view all coupons"
ON public.reward_coupons FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing codes
INSERT INTO public.reward_coupons (reward_ad_id, code)
SELECT id, unnest(coupon_codes) FROM public.reward_ads WHERE coupon_codes IS NOT NULL AND array_length(coupon_codes, 1) > 0;

-- Drop old column
ALTER TABLE public.reward_ads DROP COLUMN coupon_codes;

-- Update claim function to use new table
CREATE OR REPLACE FUNCTION public.claim_reward_coupon(p_submission_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_submission RECORD;
  v_reward_ad RECORD;
  v_coupon_row RECORD;
BEGIN
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
  IF v_submission.coupon_code IS NOT NULL THEN
    RETURN v_submission.coupon_code;
  END IF;
  IF v_submission.status != 'approved' THEN
    RAISE EXCEPTION 'Submission not approved';
  END IF;

  SELECT ra.id, ra.views_required INTO v_reward_ad
  FROM public.reward_ads ra WHERE ra.id = v_submission.reward_ad_id;

  IF v_reward_ad IS NULL THEN
    RAISE EXCEPTION 'Reward ad not found';
  END IF;
  IF v_submission.current_views < v_reward_ad.views_required THEN
    RAISE EXCEPTION 'Views goal not reached';
  END IF;

  -- Atomically grab an unclaimed coupon
  UPDATE public.reward_coupons
  SET claimed_by = auth.uid(), claimed_at = now()
  WHERE id = (
    SELECT id FROM public.reward_coupons
    WHERE reward_ad_id = v_reward_ad.id AND claimed_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING * INTO v_coupon_row;

  IF v_coupon_row IS NULL THEN
    RAISE EXCEPTION 'No coupon codes available';
  END IF;

  UPDATE public.reward_submissions
  SET coupon_code = v_coupon_row.code, status = 'completed', updated_at = now()
  WHERE id = p_submission_id;

  RETURN v_coupon_row.code;
END;
$function$;

-- 2. business_profiles: restrict SELECT
DROP POLICY IF EXISTS "Authenticated users can view business profiles" ON public.business_profiles;
CREATE POLICY "Owners can view own business profile"
ON public.business_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all business profiles"
ON public.business_profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Recreate safe public view (only non-sensitive fields)
DROP VIEW IF EXISTS public.business_profiles_public;
CREATE VIEW public.business_profiles_public
WITH (security_invoker = on) AS
SELECT id, user_id, company_name, logo_url, description, website, industry, country, city
FROM public.business_profiles;
GRANT SELECT ON public.business_profiles_public TO anon, authenticated;

-- Allow the public view to bypass the new owner-only policy by adding a public read policy
-- scoped to safe columns: we'll instead add a permissive policy that grants SELECT to all,
-- and rely on the view's column projection. But that re-exposes all columns to ad-hoc queries.
-- Better: add a SECURITY DEFINER-like approach via the view itself.
-- Switch the view to SECURITY DEFINER so it bypasses RLS but only exposes safe columns.
ALTER VIEW public.business_profiles_public SET (security_invoker = off);

-- 3. profiles: restrict SELECT, keep own + admin
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Recreate safe public profiles view (no phone_number, no stripe_connect_id)
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = off) AS
SELECT id, user_id, full_name, avatar_url, username, bio, created_at, updated_at, username_changed_at
FROM public.profiles;
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 4. phone_verifications: remove SELECT access entirely
DROP POLICY IF EXISTS "Users can view own verifications" ON public.phone_verifications;

-- 5. tiktok_accounts_safe view - switch to security_invoker
ALTER VIEW public.tiktok_accounts_safe SET (security_invoker = on);

-- 6. user_roles: remove self-assign business role
DROP POLICY IF EXISTS "Users can add business role to self" ON public.user_roles;
