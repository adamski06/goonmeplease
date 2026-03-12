
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_username text;
  v_base_username text;
  v_counter integer := 0;
  v_provider text;
  v_full_name text;
  v_random_suffix text;
BEGIN
  -- Detect auth provider
  v_provider := coalesce(NEW.raw_app_meta_data ->> 'provider', 'email');

  -- Extract full name - handle Apple's different metadata format
  v_full_name := NEW.raw_user_meta_data ->> 'full_name';
  
  -- Apple sometimes stores name as separate fields
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := trim(concat_ws(' ',
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name'
    ));
  END IF;
  
  -- Apple may also use 'name' field
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := NEW.raw_user_meta_data ->> 'name';
  END IF;
  
  -- Fallback to email prefix
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := split_part(coalesce(NEW.email, ''), '@', 1);
  END IF;

  -- Generate username for ALL users (email and OAuth)
  v_base_username := lower(regexp_replace(
    coalesce(split_part(v_full_name, ' ', 1), 'user'),
    '[^a-z0-9]', '', 'gi'
  ));
  
  IF length(v_base_username) < 3 THEN
    v_base_username := v_base_username || 'user';
  END IF;
  
  -- Add random 4-digit suffix
  v_random_suffix := lpad(floor(random() * 10000)::text, 4, '0');
  v_username := v_base_username || v_random_suffix;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_random_suffix := lpad(floor(random() * 10000)::text, 4, '0');
    v_username := v_base_username || v_random_suffix;
  END LOOP;

  INSERT INTO public.profiles (user_id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.raw_user_meta_data ->> 'avatar_url',
    v_username
  );
  
  -- Default role is creator
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator');
  
  RETURN NEW;
END;
$function$;
