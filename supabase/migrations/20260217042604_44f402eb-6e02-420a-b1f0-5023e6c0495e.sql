
-- Create a function that finds or creates a tiktok account for a user
-- and returns the account id. This bypasses the SELECT block on tiktok_accounts.
CREATE OR REPLACE FUNCTION public.get_or_create_tiktok_account(
  p_tiktok_username text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id uuid;
BEGIN
  -- Try to find existing account for this user
  SELECT id INTO v_account_id
  FROM public.tiktok_accounts
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- If no account exists, create one
  IF v_account_id IS NULL THEN
    INSERT INTO public.tiktok_accounts (user_id, tiktok_user_id, tiktok_username, is_active)
    VALUES (auth.uid(), p_tiktok_username, p_tiktok_username, true)
    RETURNING id INTO v_account_id;
  END IF;

  RETURN v_account_id;
END;
$$;
