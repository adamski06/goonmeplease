
-- 1. Create payout_requests table
CREATE TABLE public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  stripe_transfer_id text,
  stripe_account_id text,
  admin_notes text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own payout requests" ON public.payout_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert own payout requests" ON public.payout_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Admins can view all payout requests" ON public.payout_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all payout requests" ON public.payout_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Create platform_settings table
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings" ON public.platform_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can update settings" ON public.platform_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed min payout amount (9.50 USD ≈ 100 SEK)
INSERT INTO public.platform_settings (key, value) VALUES ('min_payout_amount', '9.50');

-- 3. Add stripe_connect_id to profiles
ALTER TABLE public.profiles ADD COLUMN stripe_connect_id text;
