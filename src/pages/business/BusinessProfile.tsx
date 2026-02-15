import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Settings, ExternalLink, Plus } from 'lucide-react';

interface BusinessProfileData {
  company_name: string;
  description: string | null;
  website: string | null;
  phone_number: string | null;
  organization_number: string | null;
  logo_url: string | null;
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
      supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      // business_id in campaigns = auth.uid() per RLS policy
      supabase.from('campaigns').select('id, title, brand_name, cover_image_url, is_active').eq('business_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) {
      const p = {
        company_name: profileRes.data.company_name,
        description: profileRes.data.description,
        website: profileRes.data.website,
        phone_number: profileRes.data.phone_number,
        organization_number: profileRes.data.organization_number,
        logo_url: profileRes.data.logo_url,
      };
      setProfile(p);
      setEditData(p);
    }

    setCampaigns(campaignsRes.data || []);
    setLoading(false);
  };

  const isProfileIncomplete = !profile?.description && !profile?.website;

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
        phone_number: editData.phone_number,
        organization_number: editData.organization_number,
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Profile header */}
      <div className="flex items-start gap-8 mb-10">
        {/* Avatar */}
        <div className="h-36 w-36 rounded-full bg-muted flex items-center justify-center shrink-0">
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="text-5xl font-bold text-muted-foreground/60 font-montserrat">{initial}</span>
          )}
        </div>

        {/* Info */}
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
          </div>

          {profile?.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-md">{profile.description}</p>
          )}
        </div>
      </div>

      {/* Finish profile prompt */}
      {isProfileIncomplete && !editing && (
        <div className="rounded-xl border border-border bg-card p-5 mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-1">Finish your profile</h3>
          <p className="text-sm text-muted-foreground mb-3">Add a description and website to help creators learn about your brand.</p>
          <Button size="sm" onClick={() => { setEditData(profile); setEditing(true); }}>
            Complete Profile
          </Button>
        </div>
      )}

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
              <Label className="text-xs font-medium">Phone</Label>
              <Input value={editData.phone_number || ''} onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Organization number</Label>
              <Input value={editData.organization_number || ''} onChange={(e) => setEditData({ ...editData, organization_number: e.target.value })} className="h-9 text-sm" />
            </div>
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
            {/* New Campaign card */}
            <button
              onClick={() => navigate('/business/create')}
              className="aspect-square rounded-xl border border-dashed border-border bg-card hover:bg-accent/50 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">New Campaign</span>
            </button>

            {/* Existing campaigns */}
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="aspect-square rounded-xl border border-border bg-card overflow-hidden flex flex-col"
              >
                {c.cover_image_url ? (
                  <img src={c.cover_image_url} alt="" className="flex-1 object-cover" />
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
