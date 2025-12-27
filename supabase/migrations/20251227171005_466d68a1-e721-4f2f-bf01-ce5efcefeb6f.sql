-- Create business_profiles table for additional business information
CREATE TABLE public.business_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  logo_url text,
  description text,
  website text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view business profiles" 
ON public.business_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own business profile" 
ON public.business_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile" 
ON public.business_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_business_profiles_updated_at
BEFORE UPDATE ON public.business_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for business logos
INSERT INTO storage.buckets (id, name, public) VALUES ('business-logos', 'business-logos', true);

-- Storage policies for business logos
CREATE POLICY "Anyone can view business logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-logos');

CREATE POLICY "Authenticated users can upload business logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own business logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own business logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);