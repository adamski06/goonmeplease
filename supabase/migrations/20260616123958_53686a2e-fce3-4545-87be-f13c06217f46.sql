
-- Admin DELETE policies on submissions
CREATE POLICY "Admins can delete all submissions"
ON public.content_submissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all deal applications"
ON public.deal_applications FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all reward submissions"
ON public.reward_submissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin UPDATE/DELETE on reward_coupons (to release them)
CREATE POLICY "Admins can update all coupons"
ON public.reward_coupons FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger: when a reward submission is removed, release its coupon
CREATE OR REPLACE FUNCTION public.release_coupon_on_reward_submission_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.coupon_code IS NOT NULL THEN
    UPDATE public.reward_coupons
    SET claimed_by = NULL, claimed_at = NULL
    WHERE reward_ad_id = OLD.reward_ad_id
      AND code = OLD.coupon_code;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_release_coupon_on_reward_submission_delete ON public.reward_submissions;
CREATE TRIGGER trg_release_coupon_on_reward_submission_delete
BEFORE DELETE ON public.reward_submissions
FOR EACH ROW EXECUTE FUNCTION public.release_coupon_on_reward_submission_delete();
