-- Fix 1: Recreate view as security definer so it can read through tiktok_accounts RLS
DROP VIEW IF EXISTS public.tiktok_accounts_safe;
CREATE VIEW public.tiktok_accounts_safe
WITH (security_invoker = false)
AS
SELECT id, user_id, tiktok_user_id, tiktok_username, follower_count, is_active, token_expires_at, created_at, updated_at
FROM tiktok_accounts
WHERE user_id = auth.uid();

-- Fix 2: Update get_or_create_tiktok_account to also update username on existing accounts
CREATE OR REPLACE FUNCTION public.get_or_create_tiktok_account(p_tiktok_username text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_account_id uuid;
BEGIN
  -- Try to find existing account for this user
  SELECT id INTO v_account_id
  FROM public.tiktok_accounts
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_account_id IS NOT NULL THEN
    -- Update the username on existing account
    UPDATE public.tiktok_accounts
    SET tiktok_username = p_tiktok_username,
        tiktok_user_id = p_tiktok_username,
        updated_at = now()
    WHERE id = v_account_id;
  ELSE
    -- Create new account
    INSERT INTO public.tiktok_accounts (user_id, tiktok_user_id, tiktok_username, is_active)
    VALUES (auth.uid(), p_tiktok_username, p_tiktok_username, true)
    RETURNING id INTO v_account_id;
  END IF;

  RETURN v_account_id;
END;
$function$;

-- Fix 3: Update the existing broken record
UPDATE public.tiktok_accounts 
SET tiktok_username = 'unknown', tiktok_user_id = 'unknown'
WHERE user_id = '36535723-21c9-44e7-bab7-cc62d1c757d2' AND tiktok_username = 'unknown';