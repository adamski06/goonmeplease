
-- Add toggleable signup options
INSERT INTO public.platform_settings (key, value) VALUES
  ('signup_email_enabled', 'true'),
  ('signup_tiktok_enabled', 'true'),
  ('signup_linkedin_enabled', 'true'),
  ('signup_facebook_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Allow anyone (including not-logged-in users on the auth screen) to read platform settings
GRANT SELECT ON public.platform_settings TO anon;

DROP POLICY IF EXISTS "Anyone can view settings" ON public.platform_settings;
CREATE POLICY "Anyone can view settings" ON public.platform_settings
  FOR SELECT
  USING (true);
