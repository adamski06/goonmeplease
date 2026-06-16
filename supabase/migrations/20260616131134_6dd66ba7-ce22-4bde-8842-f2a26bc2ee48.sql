
-- Notify when reward submission gets approved
CREATE OR REPLACE FUNCTION public.notify_on_reward_submission_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_reward_title text;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    SELECT title INTO v_reward_title FROM public.reward_ads WHERE id = NEW.reward_ad_id;
    PERFORM create_notification(
      NEW.creator_id,
      'reward_approved',
      'Reward Post Accepted 🎉',
      'Your video for "' || COALESCE(v_reward_title, 'a reward') || '" has been accepted. Keep growing those views!',
      jsonb_build_object('reward_submission_id', NEW.id, 'reward_ad_id', NEW.reward_ad_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_reward_submission_approved ON public.reward_submissions;
CREATE TRIGGER trg_notify_reward_submission_approved
AFTER UPDATE OF status ON public.reward_submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_reward_submission_approved();

-- Notify when reward goal is reached
CREATE OR REPLACE FUNCTION public.notify_on_reward_goal_reached()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_required integer;
  v_title text;
  v_already boolean;
BEGIN
  IF NEW.status NOT IN ('approved', 'completed') THEN
    RETURN NEW;
  END IF;

  SELECT views_required, title INTO v_required, v_title
  FROM public.reward_ads WHERE id = NEW.reward_ad_id;

  IF v_required IS NULL THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.current_views, 0) >= v_required
     AND COALESCE(OLD.current_views, 0) < v_required THEN
    -- Avoid duplicate notification
    SELECT EXISTS (
      SELECT 1 FROM public.notifications
      WHERE user_id = NEW.creator_id
        AND type = 'reward_goal_reached'
        AND (data->>'reward_submission_id') = NEW.id::text
    ) INTO v_already;

    IF NOT v_already THEN
      PERFORM create_notification(
        NEW.creator_id,
        'reward_goal_reached',
        'Reward Unlocked 🎁',
        'Your video for "' || COALESCE(v_title, 'a reward') || '" reached the goal. Tap to claim your reward.',
        jsonb_build_object('reward_submission_id', NEW.id, 'reward_ad_id', NEW.reward_ad_id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_reward_goal_reached ON public.reward_submissions;
CREATE TRIGGER trg_notify_reward_goal_reached
AFTER UPDATE OF current_views, status ON public.reward_submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_reward_goal_reached();
