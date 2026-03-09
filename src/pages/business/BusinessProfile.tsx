import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, ExternalLink, Plus, Megaphone, Handshake, Gift } from 'lucide-react';
import ProfileOnboardingChat from '@/components/business/ProfileOnboardingChat';
import { getHighResLogoUrl } from '@/lib/logoUrl';


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

interface AdItem {
  id: string;
  title: string;
  brand_name: string;
  cover_image_url: string | null;
  is_active: boolean | null;
  max_earnings: number | null;
  type: 'spread' | 'deal' | 'reward';
}

const BusinessProfile: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, campaignsRes, dealsRes, rewardsRes] = await Promise.all([
      supabase.from('business_profiles').select('company_name, description, website, logo_url, industry, target_audience, brand_values, onboarding_complete').eq('user_id', user.id).maybeSingle(),
      supabase.from('campaigns').select('id, title, brand_name, cover_image_url, is_active, max_earnings').eq('business_id', user.id).order('created_at', { ascending: false }),
      supabase.from('deals').select('id, title, brand_name, cover_image_url, is_active, max_earnings').eq('business_id', user.id).order('created_at', { ascending: false }),
      supabase.from('reward_ads').select('id, title, brand_name, cover_image_url, is_active').eq('business_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);

    const spreadAds: AdItem[] = (campaignsRes.data || []).map(c => ({ ...c, type: 'spread' as const }));
    const dealAds: AdItem[] = (dealsRes.data || []).map(d => ({ ...d, type: 'deal' as const }));
    const rewardAds: AdItem[] = (rewardsRes.data || []).map(r => ({ ...r, max_earnings: null, type: 'reward' as const }));
    const allAds = [...spreadAds, ...dealAds, ...rewardAds].sort(() => 0);
    setAds(allAds);

    if (spreadAds.length > 0) {
      const campaignIds = spreadAds.map(c => c.id);
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

  const handleLogoClick = () => {
    navigate('/business/edit-profile');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Profile header */}
      <div className="mb-10 flex items-center gap-6">
        <button
          onClick={handleLogoClick}
          className="h-40 w-40 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border hover:bg-muted/80 transition-colors cursor-pointer"
        >
          {profile?.logo_url ? (
            <img
              src={getHighResLogoUrl(profile.logo_url) || profile.logo_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold text-muted-foreground">ad profile</p>
              <p className="text-sm font-semibold text-muted-foreground">picture +</p>
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground font-montserrat truncate mb-1">
            {profile?.company_name || 'Your Company'}
          </h1>
          {profile?.description && (
            <p className="text-sm text-muted-foreground font-jakarta leading-snug line-clamp-2 mb-3">{profile.description}</p>
          )}
          <div className="flex items-center gap-6 flex-wrap">
            <button
              onClick={() => navigate('/business/edit-profile')}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors bg-card border border-border text-foreground hover:bg-muted"
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
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground font-jakarta">{ads.length}</span>
              <span className="text-xs text-muted-foreground font-jakarta">Ads</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground font-jakarta">
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

      {/* Ads section */}
      <div>
        <h2 className="text-base font-bold text-foreground font-montserrat mb-4">Ads</h2>
        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* New Ad card */}
            <button
              onClick={() => navigate('/business/new')}
              className="group relative aspect-[9/14] rounded-[48px] overflow-hidden flex flex-col items-center justify-center gap-2 active:scale-[0.98] border border-border hover:border-white/[0.08] bg-card transition-all duration-500 ease-in-out"
            >
              {/* Dark overlay that fades in on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, hsl(0,0%,18%) 0%, hsl(0,0%,10%) 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 hsla(0,0%,100%,0.06)',
                }}
              />
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-white/60 transition-colors duration-500 relative z-10" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-white/70 font-jakarta transition-colors duration-500 relative z-10">New Ad</span>
            </button>

            {ads.map((ad) => {
              const path = ad.type === 'spread' ? `/business/campaigns/${ad.id}` : ad.type === 'deal' ? `/business/deals/${ad.id}` : `/business/rewards/${ad.id}`;
              const isSpread = ad.type === 'spread';
              return (
                <button
                  key={`${ad.type}-${ad.id}`}
                  onClick={() => navigate(path)}
                  className="aspect-[9/14] rounded-[48px] overflow-hidden text-left transition-all active:scale-[0.98] relative"
                  style={{
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Cover image — fills entire card */}
                  {ad.cover_image_url ? (
                    <img src={ad.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
                      style={{ background: 'hsl(var(--muted))' }}
                    >
                      <Plus className="h-5 w-5" style={{ color: 'hsl(var(--muted-foreground) / 0.4)' }} />
                      <span className="text-[10px] font-medium font-jakarta text-center px-4 leading-snug" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>
                        Add thumbnail
                      </span>
                    </div>
                  )}

                  {/* Floating white node inside card */}
                  <div
                    className="absolute left-3 right-3 bottom-3 rounded-[28px] px-4 py-3 flex flex-col gap-2"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(242,242,242,0.96) 100%)',
                      border: '1.5px solid rgba(255,255,255,0.9)',
                      boxShadow: '0 -4px 20px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,1)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {/* Title row — title on left, badge top-right */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold text-black font-montserrat line-clamp-2 leading-snug flex-1 min-w-0">{ad.title}</p>
                      <span
                        className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.32) 0%, rgba(37,99,235,0.22) 100%)',
                          border: '1px solid rgba(59,130,246,0.45)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
                          color: 'rgb(29,78,216)',
                          backdropFilter: 'blur(6px)',
                        }}
                      >
                        {isSpread ? <Megaphone className="h-2.5 w-2.5" /> : <Handshake className="h-2.5 w-2.5" />}
                        {isSpread ? 'Spread' : 'Deal'}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col gap-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-black/45 font-jakarta">{isSpread ? 'Creators' : 'Requests'}</span>
                        <span className="text-[10px] font-semibold text-black font-jakarta">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-black/45 font-jakarta">Views</span>
                        <span className="text-[10px] font-semibold text-black font-jakarta">0</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
