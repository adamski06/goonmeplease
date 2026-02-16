import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<BusinessProfileData | null>(null);
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
      setEditData(profileRes.data);
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

  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('business_profiles')
      .update({
        company_name: editData.company_name,
        description: editData.description,
        website: editData.website,
        industry: editData.industry,
        target_audience: editData.target_audience,
        brand_values: editData.brand_values,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setProfile(editData);
      setEditing(false);
      toast({ title: 'Saved' });
    }
    setSaving(false);
  };

  const initial = profile?.company_name?.charAt(0)?.toUpperCase() || '?';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  // Show onboarding chat when triggered
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
              className="h-full w-full rounded-full object-contain p-4"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                // Try Google favicon fallback
                const domain = (profile.website || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                const fallback = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';
                if (fallback && img.src !== fallback) {
                  img.src = fallback;
                } else {
                  img.style.display = 'none';
                  // Show initial instead
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
              onClick={() => { setEditData(profile); setEditing(!editing); }}
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

      {/* Edit form */}
      {editing && editData && (
        <div className="rounded-xl border border-border bg-card p-6 mb-8 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Edit Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company name</Label>
              <Input value={editData.company_name} onChange={(e) => setEditData({ ...editData, company_name: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Website</Label>
              <Input value={editData.website || ''} onChange={(e) => setEditData({ ...editData, website: e.target.value })} placeholder="https://" className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="Tell creators about your brand" rows={3} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Industry</Label>
              <Input value={editData.industry || ''} onChange={(e) => setEditData({ ...editData, industry: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Target Audience</Label>
              <Input value={editData.target_audience || ''} onChange={(e) => setEditData({ ...editData, target_audience: e.target.value })} className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Brand Values</Label>
            <Input value={editData.brand_values || ''} onChange={(e) => setEditData({ ...editData, brand_values: e.target.value })} className="h-9 text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}

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
