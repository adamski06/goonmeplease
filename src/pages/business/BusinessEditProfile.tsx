import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Camera } from 'lucide-react';

interface EditData {
  company_name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  industry: string | null;
  target_audience: string | null;
  brand_values: string | null;
  email: string;
}

const BusinessEditProfile: React.FC = () => {
  const [data, setData] = useState<EditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('company_name, description, website, logo_url, industry, target_audience, brand_values')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profile) setData({ ...profile, email: user.email || '' });
      setLoading(false);
    };
    load();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/business-logo.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const url = `${publicUrl}?t=${Date.now()}`;
      setData(prev => prev ? { ...prev, logo_url: url } : prev);
      toast({ title: 'Logo uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('business_profiles')
        .update({
          company_name: data.company_name,
          description: data.description,
          website: data.website,
          logo_url: data.logo_url,
          industry: data.industry,
          target_audience: data.target_audience,
          brand_values: data.brand_values,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Profile updated' });
      navigate('/business');
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const initial = data.company_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button onClick={() => navigate('/business')} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-foreground/60" />
        </button>
        <h2 className="text-base font-bold text-foreground font-montserrat">Edit Profile</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-semibold font-montserrat text-blue-600 disabled:text-muted-foreground"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative"
            disabled={uploading}
          >
            <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {data.logo_url ? (
                <img
                  src={data.logo_url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const domain = (data.website || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
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
              <span className={`text-3xl font-bold text-muted-foreground/60 font-montserrat ${data.logo_url ? 'hidden' : ''}`}>{initial}</span>
            </div>
            <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <p className="text-xs text-muted-foreground mt-2">Tap to change logo</p>
        </div>

        {/* Fields */}
        <div className="space-y-5 max-w-lg mx-auto w-full">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat">Company Name</Label>
            <Input value={data.company_name} onChange={e => setData({ ...data, company_name: e.target.value })} className="h-10 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat">Website</Label>
            <Input value={data.website || ''} onChange={e => setData({ ...data, website: e.target.value })} placeholder="https://" className="h-10 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat">Description</Label>
            <Textarea value={data.description || ''} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Tell creators about your brand" rows={3} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat">Industry</Label>
            <Input value={data.industry || ''} onChange={e => setData({ ...data, industry: e.target.value })} className="h-10 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat">Target Audience</Label>
            <Input value={data.target_audience || ''} onChange={e => setData({ ...data, target_audience: e.target.value })} className="h-10 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat">Brand Values</Label>
            <Input value={data.brand_values || ''} onChange={e => setData({ ...data, brand_values: e.target.value })} className="h-10 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-montserrat">Email</Label>
            <Input value={data.email} disabled className="h-10 text-sm disabled:opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessEditProfile;
