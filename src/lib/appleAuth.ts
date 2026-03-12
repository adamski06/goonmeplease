import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

/**
 * Handles Apple Sign In across web and native Capacitor environments.
 * On web (especially in iframes/preview), uses a popup to bypass cookie restrictions.
 * On native iOS, opens in the system browser.
 */
export async function signInWithApple(): Promise<{ error: any }> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // Native: use Lovable auth bridge with system browser
    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: `${window.location.origin}/user/auth`,
    });

    if (result.error) return { error: result.error };

    if (result.redirected && typeof (result as any).url === 'string') {
      await Browser.open({ url: (result as any).url });
    }

    return { error: null };
  }

  // Web: use popup flow to escape iframe cookie restrictions
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        skipBrowserRedirect: true,
        redirectTo: window.location.origin,
      },
    });

    if (error) return { error };

    if (data?.url) {
      const popup = window.open(data.url, 'apple-auth', 'width=500,height=700');

      if (!popup) {
        return { error: 'Popup blocked. Please allow popups for this site and try again.' };
      }

      // Poll for popup close and session update
      return new Promise((resolve) => {
        const interval = setInterval(async () => {
          if (popup.closed) {
            clearInterval(interval);
            // Check if we got a session
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
              window.location.reload();
            }
            resolve({ error: null });
          }
        }, 500);

        // Safety timeout after 2 minutes
        setTimeout(() => {
          clearInterval(interval);
          resolve({ error: null });
        }, 120000);
      });
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || err };
  }
}
