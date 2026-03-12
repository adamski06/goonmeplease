
-- Fix security definer views - set to security invoker
ALTER VIEW public.profiles_public SET (security_invoker = on);
ALTER VIEW public.business_profiles_public SET (security_invoker = on);
