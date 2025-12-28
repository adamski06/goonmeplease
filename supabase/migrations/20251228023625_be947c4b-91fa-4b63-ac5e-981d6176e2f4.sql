-- Drop the problematic SELECT policy that could expose tokens
DROP POLICY IF EXISTS "Users can view own tiktok accounts without tokens" ON public.tiktok_accounts;

-- Create a strict policy that blocks ALL direct SELECT access to tiktok_accounts
-- Users must use the get_user_tiktok_accounts() function or tiktok_accounts_safe view instead
CREATE POLICY "Block direct token access - use safe view or function" 
ON public.tiktok_accounts 
FOR SELECT 
USING (false);

-- Add RLS policies to tiktok_accounts_safe view so users can access their account info
-- First, we need to check if RLS is enabled on the view (views don't support RLS directly)
-- Instead, let's recreate the view with proper security

-- Drop and recreate the safe view with SECURITY INVOKER (default) to respect RLS
DROP VIEW IF EXISTS public.tiktok_accounts_safe;

CREATE VIEW public.tiktok_accounts_safe AS
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
COMMENT ON VIEW public.tiktok_accounts_safe IS 'Safe view that excludes access_token and refresh_token. Use get_tiktok_tokens() function to access tokens when needed.';