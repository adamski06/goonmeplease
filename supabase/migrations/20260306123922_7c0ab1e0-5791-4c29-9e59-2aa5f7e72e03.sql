
-- Admin can view ALL campaigns (including inactive)
CREATE POLICY "Admins can view all campaigns"
ON public.campaigns FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL deals
CREATE POLICY "Admins can view all deals"
ON public.deals FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL reward_ads
CREATE POLICY "Admins can view all reward ads"
ON public.reward_ads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL content_submissions
CREATE POLICY "Admins can view all submissions"
ON public.content_submissions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL deal_applications
CREATE POLICY "Admins can view all deal applications"
ON public.deal_applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL campaign_tiers
CREATE POLICY "Admins can view all campaign tiers"
ON public.campaign_tiers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL earnings
CREATE POLICY "Admins can view all earnings"
ON public.earnings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
