import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditProfile: React.FC = () => {
  const { user } = useAuth();
  const { profile, refetchProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setPhoneNumber(profile.phone_number || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const canChangeUsername = () => {
    if (!profile?.username_changed_at) return true;
    const lastChanged = new Date(profile.username_changed_at);
    const now = new Date();
    const daysSinceChange = (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceChange >= 14;
  };

  const daysUntilUsernameChange = () => {
    if (!profile?.username_changed_at) return 0;
    const lastChanged = new Date(profile.username_changed_at);
    const now = new Date();
    const daysSinceChange = (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(14 - daysSinceChange));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache buster
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithCacheBust);

      toast({ title: 'Photo uploaded', description: 'Your profile photo has been updated.' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const updates: Record<string, any> = {
        full_name: fullName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        avatar_url: avatarUrl || null,
      };

      // Only update username if changed and allowed
      const usernameChanged = username.trim() !== (profile?.username || '');
      if (usernameChanged) {
        if (!canChangeUsername()) {
          toast({
            title: 'Cannot change username',
            description: `You can change your username again in ${daysUntilUsernameChange()} days.`,
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
        updates.username = username.trim() || null;
        updates.username_changed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({ ...updates, user_id: user.id }, { onConflict: 'user_id' });

      if (error) throw error;

      await refetchProfile();
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
      navigate('/profile');
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const firstName = fullName?.split(' ')[0] || username || 'U';

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center px-4 py-3 relative">
          <button onClick={() => navigate('/profile')} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <span className="text-base font-semibold text-black flex-1 text-center pr-6 font-montserrat">
            Edit Profile
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="absolute right-4 text-sm font-semibold font-montserrat"
            style={{ color: saving ? 'rgba(0,0,0,0.3)' : '#000' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-8 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative"
            disabled={uploading}
          >
            <Avatar className="h-[100px] w-[100px]">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={firstName} />
              ) : null}
              <AvatarFallback
                className="text-2xl font-medium font-montserrat"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                  color: 'rgba(0,0,0,0.4)',
                }}
              >
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.9) 100%)',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Camera className="h-3.5 w-3.5 text-black/60" />
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <p className="text-xs text-black/40 mt-2 font-jakarta">Tap to change photo</p>
        </div>

        {/* Form fields */}
        <div className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat">
              Username
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40 font-jakarta">@</span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                disabled={!canChangeUsername()}
                placeholder="username"
                className="pl-7 bg-black/[0.03] border-black/[0.06] text-black font-jakarta disabled:opacity-60"
              />
            </div>
            {!canChangeUsername() && (
              <p className="text-xs text-black/40 font-jakarta">
                You can change your username again in {daysUntilUsernameChange()} days
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat">
              Full Name
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="bg-black/[0.03] border-black/[0.06] text-black font-jakarta"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat">
              Email
            </Label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-black/[0.03] border-black/[0.06] text-black/50 font-jakarta disabled:opacity-60"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat">
              Phone Number
            </Label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+46 70 123 45 67"
              type="tel"
              className="bg-black/[0.03] border-black/[0.06] text-black font-jakarta"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
