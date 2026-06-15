import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SignupOptions = {
  email: boolean;
  tiktok: boolean;
  linkedin: boolean;
  facebook: boolean;
};

const KEYS = {
  email: 'signup_email_enabled',
  tiktok: 'signup_tiktok_enabled',
  linkedin: 'signup_linkedin_enabled',
  facebook: 'signup_facebook_enabled',
} as const;

export const SIGNUP_OPTION_KEYS = KEYS;

export const useSignupOptions = () => {
  const [options, setOptions] = useState<SignupOptions>({
    email: true,
    tiktok: true,
    linkedin: true,
    facebook: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('key,value')
        .in('key', Object.values(KEYS));
      if (cancelled) return;
      if (data) {
        const map = Object.fromEntries(data.map((r: any) => [r.key, r.value === 'true']));
        setOptions({
          email: map[KEYS.email] ?? true,
          tiktok: map[KEYS.tiktok] ?? true,
          linkedin: map[KEYS.linkedin] ?? true,
          facebook: map[KEYS.facebook] ?? true,
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { options, loading };
};
