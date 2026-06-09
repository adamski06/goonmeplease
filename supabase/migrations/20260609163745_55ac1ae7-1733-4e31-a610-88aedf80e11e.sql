
CREATE POLICY "Admins can delete campaigns" ON public.campaigns FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete deals" ON public.deals FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete reward ads" ON public.reward_ads FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
