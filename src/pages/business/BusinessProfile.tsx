import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

import { Pencil, ExternalLink, Plus } from 'lucide-react';
import ProfileOnboardingChat from '@/components/business/ProfileOnboardingChat';

interface BusinessProfileData {
  company_name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  industry: string | null;
  target_audience: string | null;
  brand_values: string | null;
  onboarding_complete: boolean | null;
}

interface CampaignItem {
  id: string;
  title: string;
  brand_name: string;
  cover_image_url: string | null;
  is_active: boolean | null;
}

const BusinessProfile: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const [totalViews, setTotalViews] = useState<number>(0);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, campaignsRes] = await Promise.all([
      supabase.from('business_profiles').select('company_name, description, website, logo_url, industry, target_audience, brand_values, onboarding_complete').eq('user_id', user.id).maybeSingle(),
      supabase.from('campaigns').select('id, title, brand_name, cover_image_url, is_active').eq('business_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
    }

    const fetchedCampaigns = campaignsRes.data || [];
    setCampaigns(fetchedCampaigns);

    // Fetch total views across all submissions for this business's campaigns
    if (fetchedCampaigns.length > 0) {
      const campaignIds = fetchedCampaigns.map(c => c.id);
      const { data: submissions } = await supabase
        .from('content_submissions')
        .select('current_views')
        .in('campaign_id', campaignIds);
      const views = (submissions || []).reduce((sum, s) => sum + (s.current_views || 0), 0);
      setTotalViews(views);
    }

    setLoading(false);
  };

  const [showOnboarding, setShowOnboarding] = useState(false);
  const needsOnboarding = profile && !profile.onboarding_complete;

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchData();
  };

  const initial = profile?.company_name?.charAt(0)?.toUpperCase() || '?';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (showOnboarding || needsOnboarding) {
    return (
      <div className="h-full">
        <ProfileOnboardingChat onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Profile header — no card node */}
      <div className="mb-10 flex items-start gap-6">
        {/* Logo / Avatar — 1.5x bigger */}
        <div className="h-40 w-40 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
          {profile?.logo_url ? (
            <img
              src={profile.logo_url}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const domain = (profile.website || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                const fallback = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';
                if (fallback && img.src !== fallback) {
                  img.src = fallback;
                } else {
                  img.style.display = 'none';
                  img.parentElement?.querySelector('span')?.classList.remove('hidden');
                }
              }}
            />
          ) : null}
          <span className={`text-5xl font-bold text-muted-foreground/60 font-montserrat ${profile?.logo_url ? 'hidden' : ''}`}>{initial}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-xl font-bold text-foreground font-montserrat truncate mb-1">
            {profile?.company_name || 'Your Company'}
          </h1>
          {profile?.description && (
            <p className="text-sm text-muted-foreground font-jakarta leading-snug line-clamp-2 mb-3">{profile.description}</p>
          )}
          {/* Buttons + stats all in one row */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/business/edit-profile')}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              }}
            >
              <Pencil className="h-3 w-3" />
              Edit Profile
            </button>
            {profile?.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {/* Stats inline */}
            <div className="flex items-center gap-4 ml-1">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-bold text-foreground font-montserrat leading-none">{campaigns.length}</span>
                <span className="text-xs text-muted-foreground font-jakarta">Ads</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-bold text-foreground font-montserrat leading-none">
                  {totalViews >= 1000000
                    ? `${(totalViews / 1000000).toFixed(1)}M`
                    : totalViews >= 1000
                    ? `${(totalViews / 1000).toFixed(1)}K`
                    : totalViews}
                </span>
                <span className="text-xs text-muted-foreground font-jakarta">Views</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Ads section */}
      <div>
        <h2 className="text-base font-bold text-foreground font-montserrat mb-4">Ads</h2>
        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* New Ad card */}
            <button
              onClick={() => navigate('/business/campaigns/new')}
              className="aspect-[9/14] rounded-[48px] overflow-hidden flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                border: '1.5px dashed hsl(var(--border))',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'hsl(var(--muted))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground font-jakarta">New Campaign</span>
            </button>

            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/business/campaigns/${c.id}`)}
                className="aspect-[9/14] rounded-[48px] overflow-hidden flex flex-col text-left transition-all active:scale-[0.98] relative"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1.5px solid hsl(var(--border))',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
              >
                {/* Cover image */}
                {c.cover_image_url ? (
                  <img src={c.cover_image_url} alt="" className="flex-1 w-full object-cover" />
                ) : (
                  <div
                    className="flex-1 flex items-center justify-center"
                    style={{ background: 'hsl(var(--muted))' }}
                  >
                    <span className="text-3xl font-bold font-montserrat" style={{ color: 'hsl(var(--muted-foreground) / 0.4)' }}>
                      {c.brand_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Bottom node — mimics the mobile white node */}
                <div
                  className="px-4 pt-3 pb-4 flex-shrink-0"
                  style={{
                    background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                    borderTop: '1px solid hsl(var(--border))',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {/* Status dot */}
                    <span
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ background: c.is_active ? 'hsl(142 70% 45%)' : 'hsl(var(--muted-foreground))' }}
                    />
                    <p className="text-xs font-bold text-foreground font-montserrat truncate">{c.brand_name}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-jakarta line-clamp-2 leading-snug">{c.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
