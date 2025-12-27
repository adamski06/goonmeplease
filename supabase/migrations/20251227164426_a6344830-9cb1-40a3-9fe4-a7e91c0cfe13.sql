-- Create a secure view that excludes sensitive token columns
CREATE OR REPLACE VIEW public.tiktok_accounts_safe AS
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
FROM public.tiktok_accounts;

-- Enable RLS on the view
ALTER VIEW public.tiktok_accounts_safe SET (security_invoker = on);

-- Drop the existing SELECT policy that exposes tokens
DROP POLICY IF EXISTS "Users can view own tiktok accounts" ON public.tiktok_accounts;

-- Create a new SELECT policy that only allows access via SECURITY DEFINER functions
-- Users can only see their own accounts but tokens are excluded via the view
CREATE POLICY "Users can view own tiktok accounts without tokens" 
ON public.tiktok_accounts 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND current_setting('app.use_secure_view', true) = 'true'
);

-- Create a SECURITY DEFINER function for safe account listing (no tokens)
CREATE OR REPLACE FUNCTION public.get_user_tiktok_accounts(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  tiktok_user_id text,
  tiktok_username text,
  follower_count integer,
  is_active boolean,
  token_expires_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller owns the account
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to TikTok accounts';
  END IF;

  RETURN QUERY
  SELECT 
    ta.id,
    ta.user_id,
    ta.tiktok_user_id,
    ta.tiktok_username,
    ta.follower_count,
    ta.is_active,
    ta.token_expires_at,
    ta.created_at,
    ta.updated_at
  FROM public.tiktok_accounts ta
  WHERE ta.user_id = p_user_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_tiktok_accounts(uuid) TO authenticated;