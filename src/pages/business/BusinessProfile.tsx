import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Settings, ExternalLink, Plus } from 'lucide-react';
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

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

    setCampaigns(campaignsRes.data || []);
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
      <div className="flex items-start gap-8 mb-10">
        <div className="h-36 w-36 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
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

        <div className="flex-1 pt-2">
          <h1 className="text-2xl font-bold text-foreground font-montserrat mb-2">
            {profile?.company_name || 'Your Company'}
          </h1>

          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => navigate('/business/edit-profile')}
            >
              <Pencil className="h-3 w-3" />
              Edit Profile
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 border-dashed text-muted-foreground"
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  await supabase.from('business_profiles').update({ onboarding_complete: false }).eq('user_id', user.id);
                  setShowOnboarding(true);
                }
              }}
            >
              🔧 Dev: Reset Onboarding
            </Button>
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
          </div>

          <div className="flex items-center gap-6 text-sm mb-1">
            <span><strong className="text-foreground">{campaigns.length}</strong> <span className="text-muted-foreground">Campaigns</span></span>
            {profile?.industry && (
              <span className="text-muted-foreground">{profile.industry}</span>
            )}
          </div>

          {profile?.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-md">{profile.description}</p>
          )}

          {profile?.target_audience && (
            <p className="text-xs text-muted-foreground/70 mt-1">Target: {profile.target_audience}</p>
          )}
        </div>
      </div>

      {/* Campaigns section */}
      <div>
        <h2 className="text-base font-bold text-foreground font-montserrat mb-4">Campaigns</h2>
        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/business/campaigns/new')}
              className="aspect-[9/14] rounded-[28px] border border-dashed border-border bg-card hover:bg-accent/50 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">New Campaign</span>
            </button>

            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/business/campaigns/${c.id}`)}
                className="aspect-[9/14] rounded-[28px] border border-border bg-card overflow-hidden flex flex-col text-left transition-colors hover:bg-accent/50"
              >
                {c.cover_image_url ? (
                  <img src={c.cover_image_url} alt="" className="flex-1 w-full object-cover" />
                ) : (
                  <div className="flex-1 bg-muted flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground/40 font-montserrat">
                      {c.brand_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.brand_name}</p>
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
