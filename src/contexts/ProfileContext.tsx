import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      fetchedUserIdRef.current = null;
      return;
    }

    // Skip if we already fetched for this user
    if (fetchedUserIdRef.current === user.id) {
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, username, bio')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
      fetchedUserIdRef.current = user.id;
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetchProfile = useCallback(async () => {
    if (!user) return;
    fetchedUserIdRef.current = null; // Reset to force refetch
    await fetchProfile();
  }, [user, fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
