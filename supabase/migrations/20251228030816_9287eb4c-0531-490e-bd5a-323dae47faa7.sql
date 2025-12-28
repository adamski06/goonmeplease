-- Allow users to add creator role to themselves
CREATE POLICY "Users can add creator role to self" 
ON public.user_roles 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) AND (role = 'creator'::app_role));