-- Add a policy that allows users to insert their own business role
-- This is safe because they can only add roles to their own user_id
CREATE POLICY "Users can add business role to self" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'business'
);

-- Add comment explaining the policy
COMMENT ON POLICY "Users can add business role to self" ON public.user_roles IS 'Allows authenticated users to add the business role to themselves during business registration. This is secure because it only allows adding to their own user_id and only the business role.';