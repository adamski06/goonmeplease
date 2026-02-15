
-- RPC to register a user as a business (called after signup)
CREATE OR REPLACE FUNCTION public.register_as_business(p_company_name text DEFAULT 'My Company')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove creator role if exists
  DELETE FROM public.user_roles WHERE user_id = auth.uid() AND role = 'creator';
  -- Add business role
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'business')
  ON CONFLICT (user_id, role) DO NOTHING;
  -- Create business profile if not exists
  INSERT INTO public.business_profiles (user_id, company_name)
  VALUES (auth.uid(), p_company_name)
  ON CONFLICT DO NOTHING;
END;
$$;
