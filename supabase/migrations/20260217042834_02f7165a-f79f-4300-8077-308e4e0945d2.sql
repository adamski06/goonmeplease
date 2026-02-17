
-- Fix the encrypt trigger to skip when tokens are null/empty
CREATE OR REPLACE FUNCTION public.encrypt_tiktok_tokens_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_encrypted_access text;
  v_encrypted_refresh text;
  v_key_id uuid;
BEGIN
  -- If both tokens are null or empty, skip encryption entirely
  IF (NEW.access_token IS NULL OR NEW.access_token = '') 
     AND (NEW.refresh_token IS NULL OR NEW.refresh_token = '') THEN
    RETURN NEW;
  END IF;

  -- Get the encryption key
  SELECT id INTO v_key_id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1;
  
  IF v_key_id IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured. Cannot store TikTok tokens securely.';
  END IF;
  
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' THEN
    IF NEW.access_token !~ '^[A-Za-z0-9+/=]+$' OR length(NEW.access_token) < 100 THEN
      SELECT encode(pgsodium.crypto_aead_det_encrypt(
        convert_to(NEW.access_token, 'utf8'),
        convert_to(NEW.id::text, 'utf8'),
        v_key_id
      ), 'base64') INTO v_encrypted_access;
      NEW.access_token := v_encrypted_access;
    END IF;
  END IF;
  
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' THEN
    IF NEW.refresh_token !~ '^[A-Za-z0-9+/=]+$' OR length(NEW.refresh_token) < 100 THEN
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
$function$;
