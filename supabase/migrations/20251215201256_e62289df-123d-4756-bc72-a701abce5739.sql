-- Enable the pgsodium extension for encryption (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- Create a function to encrypt and store TikTok tokens securely
CREATE OR REPLACE FUNCTION public.store_tiktok_tokens(
  p_tiktok_account_id uuid,
  p_access_token text,
  p_refresh_token text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_encrypted_access text;
  v_encrypted_refresh text;
BEGIN
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
$$;

-- Create a function to decrypt and retrieve TikTok tokens (only callable by the token owner)
CREATE OR REPLACE FUNCTION public.get_tiktok_tokens(p_tiktok_account_id uuid)
RETURNS TABLE(access_token text, refresh_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_encrypted_access text;
  v_encrypted_refresh text;
BEGIN
  -- Verify the caller owns this account
  SELECT user_id, ta.access_token, ta.refresh_token 
  INTO v_user_id, v_encrypted_access, v_encrypted_refresh
  FROM public.tiktok_accounts ta
  WHERE ta.id = p_tiktok_account_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'TikTok account not found';
  END IF;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to TikTok tokens';
  END IF;
  
  -- Return decrypted tokens
  RETURN QUERY SELECT 
    convert_from(pgsodium.crypto_aead_det_decrypt(
      decode(v_encrypted_access, 'base64'),
      convert_to(p_tiktok_account_id::text, 'utf8'),
      (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
    ), 'utf8') as access_token,
    convert_from(pgsodium.crypto_aead_det_decrypt(
      decode(v_encrypted_refresh, 'base64'),
      convert_to(p_tiktok_account_id::text, 'utf8'),
      (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
    ), 'utf8') as refresh_token;
END;
$$;

-- Add a comment explaining the encryption
COMMENT ON COLUMN public.tiktok_accounts.access_token IS 'Encrypted using pgsodium - use get_tiktok_tokens() to decrypt';
COMMENT ON COLUMN public.tiktok_accounts.refresh_token IS 'Encrypted using pgsodium - use get_tiktok_tokens() to decrypt';