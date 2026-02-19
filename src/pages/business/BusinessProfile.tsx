import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, ExternalLink, Plus, Megaphone, Handshake } from 'lucide-react';
import ProfileOnboardingChat from '@/components/business/ProfileOnboardingChat';
import tiktokIcon from '@/assets/tiktok-icon.png';

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
  type: 'spread' | 'deal';
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

    const [profileRes, campaignsRes, dealsRes] = await Promise.all([
      supabase.from('business_profiles').select('company_name, description, website, logo_url, industry, target_audience, brand_values, onboarding_complete').eq('user_id', user.id).maybeSingle(),
      supabase.from('campaigns').select('id, title, brand_name, cover_image_url, is_active, max_earnings').eq('business_id', user.id).order('created_at', { ascending: false }),
      supabase.from('deals').select('id, title, brand_name, cover_image_url, is_active, max_earnings').eq('business_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);

    const spreadAds: AdItem[] = (campaignsRes.data || []).map(c => ({ ...c, type: 'spread' as const }));
    const dealAds: AdItem[] = (dealsRes.data || []).map(d => ({ ...d, type: 'deal' as const }));
    const allAds = [...spreadAds, ...dealAds].sort(() => 0); // preserve creation order interleaved
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Profile header */}
      <div className="mb-10 flex items-center gap-6">
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
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-bold text-foreground font-montserrat leading-none">{ads.length}</span>
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

      {/* Ads section */}
      <div>
        <h2 className="text-base font-bold text-foreground font-montserrat mb-4">Ads</h2>
        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* New Ad card */}
            <button
              onClick={() => navigate('/business/new')}
              className="aspect-[9/14] rounded-[48px] overflow-hidden flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground font-jakarta">New Ad</span>
            </button>

            {ads.map((ad) => {
              const path = ad.type === 'spread' ? `/business/campaigns/${ad.id}` : `/business/deals/${ad.id}`;
              return (
                <button
                  key={`${ad.type}-${ad.id}`}
                  onClick={() => navigate(path)}
                  className="aspect-[9/14] rounded-[48px] overflow-hidden flex flex-col text-left transition-all active:scale-[0.98] relative"
                  style={{
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Cover image — takes all space above the node */}
                  <div className="flex-1 relative overflow-hidden">
                    {ad.cover_image_url ? (
                      <img src={ad.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: 'hsl(var(--muted))' }}
                      >
                        <span className="text-3xl font-bold font-montserrat" style={{ color: 'hsl(var(--muted-foreground) / 0.4)' }}>
                          {ad.brand_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* White node — mimics user app campaign card node */}
                  <div
                    className="px-4 pt-3 pb-4 flex-shrink-0 flex flex-col gap-2"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.97) 100%)',
                      borderTop: '1.5px solid rgba(255,255,255,0.8)',
                      boxShadow: 'inset 0 2px 0 rgba(255,255,255,1)',
                    }}
                  >
                    {/* Brand + type badge */}
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-xs font-bold text-black font-montserrat truncate">{ad.brand_name}</p>
                      <span
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0"
                        style={{
                          background: ad.type === 'spread' ? 'rgba(0,0,0,0.06)' : 'rgba(59,130,246,0.12)',
                          color: ad.type === 'spread' ? 'rgba(0,0,0,0.55)' : 'rgb(37,99,235)',
                        }}
                      >
                        {ad.type === 'spread' ? <Megaphone className="h-2.5 w-2.5" /> : <Handshake className="h-2.5 w-2.5" />}
                        {ad.type === 'spread' ? 'Spread' : 'Deal'}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-[11px] text-black/60 font-jakarta line-clamp-2 leading-snug">{ad.title}</p>

                    {/* Max earnings + platform */}
                    <div className="flex items-center justify-between mt-0.5">
                      <div
                        className="flex items-baseline gap-1 px-2.5 py-1 rounded-full"
                        style={{
                          background: 'linear-gradient(180deg, rgb(22,101,52) 0%, rgb(20,83,45) 100%)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}
                      >
                        <span className="text-sm font-bold text-white font-montserrat leading-none">
                          {(ad.max_earnings || 0).toLocaleString()}
                        </span>
                        <span className="text-[9px] font-semibold text-white/70 font-montserrat">sek</span>
                      </div>
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(180deg, rgb(55,65,81) 0%, rgb(17,24,39) 100%)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                      >
                        <img src={tiktokIcon} alt="TikTok" className="w-4 h-4 object-contain" />
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
