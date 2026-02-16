
-- Allow anyone (including anonymous/unauthenticated users) to view active campaigns
DROP POLICY "Anyone can view active campaigns" ON public.campaigns;

CREATE POLICY "Anyone can view active campaigns"
ON public.campaigns
FOR SELECT
USING (is_active = true);

-- Also allow public read on campaign_tiers so tiers load for anon users
DROP POLICY IF EXISTS "Anyone can view campaign tiers" ON public.campaign_tiers;

CREATE POLICY "Anyone can view campaign tiers"
ON public.campaign_tiers
FOR SELECT
USING (true);
