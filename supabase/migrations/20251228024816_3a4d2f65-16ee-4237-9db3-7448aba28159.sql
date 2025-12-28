-- Create the trigger on auth.users to call handle_new_user
-- The function already exists with SECURITY DEFINER which bypasses RLS
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();