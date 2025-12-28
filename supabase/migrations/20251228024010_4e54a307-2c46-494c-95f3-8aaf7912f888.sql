-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Add comment explaining the security model
COMMENT ON POLICY "Authenticated users can view profiles" ON public.profiles IS 'Only authenticated users can view profile data. Unauthenticated users cannot access any profile information.';