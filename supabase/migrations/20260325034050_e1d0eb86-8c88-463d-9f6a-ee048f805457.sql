
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role / triggers to insert
CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Function to create notification (called by triggers)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data);
END;
$$;

-- Trigger: when submission status changes to approved
CREATE OR REPLACE FUNCTION public.notify_on_submission_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_campaign_title text;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    SELECT title INTO v_campaign_title FROM public.campaigns WHERE id = NEW.campaign_id;
    PERFORM create_notification(
      NEW.creator_id,
      'video_approved',
      'Video Approved! 🎉',
      'Your video for "' || COALESCE(v_campaign_title, 'a campaign') || '" has been approved and is now live.',
      jsonb_build_object('submission_id', NEW.id, 'campaign_id', NEW.campaign_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_submission_approved
  AFTER UPDATE ON public.content_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_submission_approved();

-- Trigger: when earning is created/updated (payout received)
CREATE OR REPLACE FUNCTION public.notify_on_earning()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.amount > OLD.amount) THEN
    PERFORM create_notification(
      NEW.creator_id,
      'earning_received',
      'Earnings Updated 💰',
      'You earned $' || ROUND(NEW.amount, 2) || ' from your content.',
      jsonb_build_object('earning_id', NEW.id, 'amount', NEW.amount)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_earning
  AFTER INSERT OR UPDATE ON public.earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_earning();

-- Trigger: when payout request status changes to completed
CREATE OR REPLACE FUNCTION public.notify_on_payout_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM create_notification(
      NEW.creator_id,
      'payout_completed',
      'Payout Sent! 🎉',
      'Your payout of $' || ROUND(NEW.amount, 2) || ' has been sent to your account.',
      jsonb_build_object('payout_id', NEW.id, 'amount', NEW.amount)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_payout_completed
  AFTER UPDATE ON public.payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_payout_completed();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
