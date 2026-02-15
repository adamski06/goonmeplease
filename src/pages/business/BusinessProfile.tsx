import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

interface BusinessProfile {
  company_name: string;
  description: string | null;
  website: string | null;
  phone_number: string | null;
  organization_number: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

const BusinessProfile: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        company_name: data.company_name,
        description: data.description,
        website: data.website,
        phone_number: data.phone_number,
        organization_number: data.organization_number,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
        country: data.country,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('business_profiles')
      .update({
        company_name: profile.company_name,
        description: profile.description,
        website: profile.website,
        phone_number: profile.phone_number,
        organization_number: profile.organization_number,
        address: profile.address,
        city: profile.city,
        postal_code: profile.postal_code,
        country: profile.country,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Profile updated successfully.' });
    }
    setSaving(false);
  };

  const updateField = (field: keyof BusinessProfile, value: string) => {
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-montserrat text-foreground">Company Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your business information</p>
        </div>
      </div>

      {profile && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Company name</Label>
            <Input
              value={profile.company_name}
              onChange={(e) => updateField('company_name', e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={profile.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Tell us about your company"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Website</Label>
              <Input
                value={profile.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Phone</Label>
              <Input
                value={profile.phone_number || ''}
                onChange={(e) => updateField('phone_number', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Organization number</Label>
            <Input
              value={profile.organization_number || ''}
              onChange={(e) => updateField('organization_number', e.target.value)}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Address</Label>
              <Input
                value={profile.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">City</Label>
              <Input
                value={profile.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Postal code</Label>
              <Input
                value={profile.postal_code || ''}
                onChange={(e) => updateField('postal_code', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="mt-4">
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessProfile;
