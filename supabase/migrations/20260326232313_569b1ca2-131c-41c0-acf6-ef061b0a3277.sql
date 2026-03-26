CREATE TABLE public.phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone_number text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications" ON public.phone_verifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_phone_verifications_user ON public.phone_verifications(user_id);
CREATE INDEX idx_phone_verifications_lookup ON public.phone_verifications(user_id, phone_number, code);