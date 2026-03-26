
-- Performance indexes for scaling to 100K+ users

-- content_submissions: frequently filtered by creator_id, campaign_id, status
CREATE INDEX IF NOT EXISTS idx_content_submissions_creator_id ON public.content_submissions (creator_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_campaign_id ON public.content_submissions (campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_status ON public.content_submissions (status);

-- earnings: filtered by creator_id, submission_id, is_paid
CREATE INDEX IF NOT EXISTS idx_earnings_creator_id ON public.earnings (creator_id);
CREATE INDEX IF NOT EXISTS idx_earnings_is_paid ON public.earnings (creator_id, is_paid);

-- notifications: filtered by user_id, is_read, ordered by created_at
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id, is_read) WHERE is_read = false;

-- favorites: filtered by user_id
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);

-- profiles: looked up by user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

-- creator_stats: looked up by user_id
CREATE INDEX IF NOT EXISTS idx_creator_stats_user_id ON public.creator_stats (user_id);

-- campaigns: filtered by business_id, is_active, status
CREATE INDEX IF NOT EXISTS idx_campaigns_business_id ON public.campaigns (business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.campaigns (is_active, status);

-- deals: filtered by business_id, is_active
CREATE INDEX IF NOT EXISTS idx_deals_business_id ON public.deals (business_id);
CREATE INDEX IF NOT EXISTS idx_deals_active ON public.deals (is_active, status);

-- deal_applications: filtered by deal_id, creator_id
CREATE INDEX IF NOT EXISTS idx_deal_applications_deal_id ON public.deal_applications (deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_applications_creator_id ON public.deal_applications (creator_id);

-- reward_ads: filtered by business_id, is_active
CREATE INDEX IF NOT EXISTS idx_reward_ads_business_id ON public.reward_ads (business_id);
CREATE INDEX IF NOT EXISTS idx_reward_ads_active ON public.reward_ads (is_active, status);

-- reward_submissions: filtered by reward_ad_id, creator_id
CREATE INDEX IF NOT EXISTS idx_reward_submissions_reward_ad_id ON public.reward_submissions (reward_ad_id);
CREATE INDEX IF NOT EXISTS idx_reward_submissions_creator_id ON public.reward_submissions (creator_id);

-- user_roles: looked up by user_id (critical for RLS has_role checks)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id, role);

-- tiktok_accounts: looked up by user_id
CREATE INDEX IF NOT EXISTS idx_tiktok_accounts_user_id ON public.tiktok_accounts (user_id);

-- support_requests: filtered by user_id
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON public.support_requests (user_id);

-- payout_requests: filtered by creator_id
CREATE INDEX IF NOT EXISTS idx_payout_requests_creator_id ON public.payout_requests (creator_id);

-- campaign_tiers: filtered by campaign_id
CREATE INDEX IF NOT EXISTS idx_campaign_tiers_campaign_id ON public.campaign_tiers (campaign_id);
