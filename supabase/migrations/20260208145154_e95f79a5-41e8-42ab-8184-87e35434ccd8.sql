
-- Update handle_new_user to generate a default username from full_name
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
BEGIN
  -- Generate a default username from full_name
  v_base_username := lower(regexp_replace(
    coalesce(NEW.raw_user_meta_data ->> 'full_name', 'user'),
    '[^a-z0-9]', '', 'gi'
  ));
  
  -- Ensure minimum length
  IF length(v_base_username) < 3 THEN
    v_base_username := v_base_username || 'user';
  END IF;
  
  -- Find a unique username
  v_username := v_base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := v_base_username || v_counter::text;
  END LOOP;

  INSERT INTO public.profiles (user_id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    v_username
  );
  
  -- Default role is creator
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator');
  
  RETURN NEW;
END;
$function$;
