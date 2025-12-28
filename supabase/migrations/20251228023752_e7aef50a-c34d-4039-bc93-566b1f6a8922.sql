-- Create a trigger function that encrypts tokens automatically on INSERT/UPDATE
-- This ensures tokens are NEVER stored in plaintext
CREATE OR REPLACE FUNCTION public.encrypt_tiktok_tokens_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_encrypted_access text;
  v_encrypted_refresh text;
  v_key_id uuid;
BEGIN
  -- Get the encryption key
  SELECT id INTO v_key_id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1;
  
  -- If no encryption key exists, we can't encrypt - fail safely
  IF v_key_id IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured. Cannot store TikTok tokens securely.';
  END IF;
  
  -- Only encrypt if access_token is being set and isn't already encrypted (base64 format)
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' THEN
    -- Check if it looks like it's already encrypted (base64 encoded)
    IF NEW.access_token !~ '^[A-Za-z0-9+/=]+$' OR length(NEW.access_token) < 100 THEN
      -- Encrypt the access token
      SELECT encode(pgsodium.crypto_aead_det_encrypt(
        convert_to(NEW.access_token, 'utf8'),
        convert_to(NEW.id::text, 'utf8'),
        v_key_id
      ), 'base64') INTO v_encrypted_access;
      NEW.access_token := v_encrypted_access;
    END IF;
  END IF;
  
  -- Only encrypt if refresh_token is being set
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' THEN
    -- Check if it looks like it's already encrypted (base64 encoded)
    IF NEW.refresh_token !~ '^[A-Za-z0-9+/=]+$' OR length(NEW.refresh_token) < 100 THEN
      -- Encrypt the refresh token
      SELECT encode(pgsodium.crypto_aead_det_encrypt(
        convert_to(NEW.refresh_token, 'utf8'),
        convert_to(NEW.id::text, 'utf8'),
        v_key_id
      ), 'base64') INTO v_encrypted_refresh;
      NEW.refresh_token := v_encrypted_refresh;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS encrypt_tokens_before_insert ON public.tiktok_accounts;
DROP TRIGGER IF EXISTS encrypt_tokens_before_update ON public.tiktok_accounts;

-- Create triggers for INSERT and UPDATE
CREATE TRIGGER encrypt_tokens_before_insert
  BEFORE INSERT ON public.tiktok_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_tiktok_tokens_trigger();

CREATE TRIGGER encrypt_tokens_before_update
  BEFORE UPDATE ON public.tiktok_accounts
  FOR EACH ROW
  WHEN (NEW.access_token IS DISTINCT FROM OLD.access_token OR NEW.refresh_token IS DISTINCT FROM OLD.refresh_token)
  EXECUTE FUNCTION public.encrypt_tiktok_tokens_trigger();

-- Add comment explaining the security model
COMMENT ON FUNCTION public.encrypt_tiktok_tokens_trigger() IS 'Automatically encrypts TikTok OAuth tokens before storing them. Tokens are encrypted using pgsodium and can only be decrypted using get_tiktok_tokens() function.';