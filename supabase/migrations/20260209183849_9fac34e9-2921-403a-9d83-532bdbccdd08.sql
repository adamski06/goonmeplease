
-- Create creator_stats table for cached performance metrics
CREATE TABLE public.creator_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_balance numeric NOT NULL DEFAULT 0,
  pending_balance numeric NOT NULL DEFAULT 0,
  total_views integer NOT NULL DEFAULT 0,
  total_videos integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_stats ENABLE ROW LEVEL SECURITY;

-- Users can only view their own stats
CREATE POLICY "Users can view own stats"
ON public.creator_stats FOR SELECT
USING (auth.uid() = user_id);

-- System/admin can manage stats (updated via triggers)
CREATE POLICY "System can manage stats"
ON public.creator_stats FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Allow insert for the trigger (runs as security definer)
-- Auto-create stats row when a new profile is created
CREATE OR REPLACE FUNCTION public.handle_new_creator_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.creator_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_creator_stats();

-- Trigger to update stats when earnings change
CREATE OR REPLACE FUNCTION public.update_creator_stats_on_earning()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Recalculate totals for the creator
  UPDATE public.creator_stats SET
    total_earnings = COALESCE((SELECT SUM(amount) FROM public.earnings WHERE creator_id = NEW.creator_id), 0),
    total_balance = COALESCE((SELECT SUM(amount) FROM public.earnings WHERE creator_id = NEW.creator_id AND is_paid = false), 0),
    pending_balance = COALESCE((SELECT SUM(amount) FROM public.earnings WHERE creator_id = NEW.creator_id AND is_paid = false), 0),
    updated_at = now()
  WHERE user_id = NEW.creator_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_earning_change_update_stats
  AFTER INSERT OR UPDATE ON public.earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_creator_stats_on_earning();

-- Trigger to update stats when submissions change
CREATE OR REPLACE FUNCTION public.update_creator_stats_on_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.creator_stats SET
    total_videos = COALESCE((SELECT COUNT(*) FROM public.content_submissions WHERE creator_id = NEW.creator_id AND status = 'approved'), 0),
    total_views = COALESCE((SELECT SUM(current_views) FROM public.content_submissions WHERE creator_id = NEW.creator_id), 0),
    updated_at = now()
  WHERE user_id = NEW.creator_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_submission_change_update_stats
  AFTER INSERT OR UPDATE ON public.content_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_creator_stats_on_submission();

-- Add timestamp update trigger
CREATE TRIGGER update_creator_stats_updated_at
  BEFORE UPDATE ON public.creator_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
