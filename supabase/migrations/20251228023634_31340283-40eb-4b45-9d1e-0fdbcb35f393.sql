-- Recreate the view with explicit SECURITY INVOKER to fix the linter warning
DROP VIEW IF EXISTS public.tiktok_accounts_safe;

CREATE VIEW public.tiktok_accounts_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  tiktok_user_id,
  tiktok_username,
  follower_count,
  is_active,
  token_expires_at,
  created_at,
  updated_at
FROM public.tiktok_accounts
WHERE user_id = auth.uid();

-- Grant access to the view for authenticated users
GRANT SELECT ON public.tiktok_accounts_safe TO authenticated;

-- Add a comment explaining the security model
COMMENT ON VIEW public.tiktok_accounts_safe IS 'Safe view that excludes access_token and refresh_token. Uses SECURITY INVOKER so RLS is enforced. Use get_tiktok_tokens() function to access tokens when needed.';