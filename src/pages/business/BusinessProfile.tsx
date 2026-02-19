import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, ExternalLink, Plus, Megaphone, Handshake } from 'lucide-react';
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
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                      style={{ background: 'hsl(var(--muted))' }}
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ background: 'hsl(var(--muted-foreground) / 0.15)', border: '1.5px dashed hsl(var(--muted-foreground) / 0.3)' }}
                      >
                        <Plus className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }} />
                      </div>
                      <span className="text-[10px] font-medium font-jakarta text-center px-4 leading-snug" style={{ color: 'hsl(var(--muted-foreground) / 0.55)' }}>
                        Add thumbnail
                      </span>
                    </div>
                  )}

                  {/* Type badge — top right corner */}
                  <div className="absolute top-3 right-3">
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={isSpread ? {
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(37,99,235,0.28) 100%)',
                        border: '1px solid rgba(59,130,246,0.45)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                        color: 'rgb(29,78,216)',
                        backdropFilter: 'blur(8px)',
                      } : {
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.12) 100%)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                        color: 'rgba(255,255,255,0.88)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {isSpread ? <Megaphone className="h-3 w-3" /> : <Handshake className="h-3 w-3" />}
                      {isSpread ? 'Spread' : 'Deal'}
                    </span>
                  </div>

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
                    {/* Brand name */}
                    <p className="text-xs font-bold text-black font-montserrat truncate">{ad.brand_name}</p>

                    {/* Title */}
                    <p className="text-[11px] text-black/55 font-jakarta line-clamp-2 leading-snug">{ad.title}</p>

                    {/* Stats row */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] font-semibold text-black/50 font-jakarta">
                        {isSpread ? 'Creators' : 'Requests'}
                      </span>
                      <span className="text-[10px] font-semibold text-black/50 font-jakarta">Views</span>
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
