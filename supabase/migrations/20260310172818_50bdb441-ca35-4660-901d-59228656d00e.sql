CREATE OR REPLACE FUNCTION public.store_tiktok_tokens(p_tiktok_account_id uuid, p_access_token text, p_refresh_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_encrypted_access text;
  v_encrypted_refresh text;
  v_owner uuid;
BEGIN
  -- Verify the caller owns this account
  SELECT user_id INTO v_owner
  FROM public.tiktok_accounts
  WHERE id = p_tiktok_account_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'TikTok account not found';
  END IF;

  IF v_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this TikTok account';
  END IF;

  -- Encrypt tokens using pgsodium
  SELECT encode(pgsodium.crypto_aead_det_encrypt(
    convert_to(p_access_token, 'utf8'),
    convert_to(p_tiktok_account_id::text, 'utf8'),
    (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
  ), 'base64') INTO v_encrypted_access;
  
  SELECT encode(pgsodium.crypto_aead_det_encrypt(
    convert_to(p_refresh_token, 'utf8'),
    convert_to(p_tiktok_account_id::text, 'utf8'),
    (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
  ), 'base64') INTO v_encrypted_refresh;
  
  -- Update the tiktok_accounts table with encrypted values
  UPDATE public.tiktok_accounts 
  SET 
    access_token = v_encrypted_access,
    refresh_token = v_encrypted_refresh,
    updated_at = now()
  WHERE id = p_tiktok_account_id;
END;
$function$;