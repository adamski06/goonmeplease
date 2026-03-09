
-- Allow admins to update campaigns
CREATE POLICY "Admins can update all campaigns"
ON public.campaigns FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update deals
CREATE POLICY "Admins can update all deals"
ON public.deals FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update reward ads
CREATE POLICY "Admins can update all reward ads"
ON public.reward_ads FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
