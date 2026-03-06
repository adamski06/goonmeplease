
-- Add payout delay tracking to content_submissions
ALTER TABLE public.content_submissions ADD COLUMN IF NOT EXISTS payout_available_at timestamp with time zone;

-- Add payout delay tracking to deal_applications
ALTER TABLE public.deal_applications ADD COLUMN IF NOT EXISTS payout_available_at timestamp with time zone;

-- Allow admins to update submissions (accept/deny)
CREATE POLICY "Admins can update all submissions"
ON public.content_submissions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update deal applications
CREATE POLICY "Admins can update all deal applications"
ON public.deal_applications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
