-- Allow businesses to delete their own campaigns
CREATE POLICY "Businesses can delete own campaigns"
ON public.campaigns
FOR DELETE
USING (auth.uid() = business_id);

-- Also allow deleting associated tiers when campaign is deleted
ALTER TABLE public.campaign_tiers
DROP CONSTRAINT IF EXISTS campaign_tiers_campaign_id_fkey;

ALTER TABLE public.campaign_tiers
ADD CONSTRAINT campaign_tiers_campaign_id_fkey
FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id)
ON DELETE CASCADE;