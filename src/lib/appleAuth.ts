import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

/**
 * Handles Apple Sign In across web and native Capacitor environments.
 * On native iOS, the lovable auth bridge doesn't work inside a WebView,
 * so we fall back to Supabase OAuth directly with an external browser.
 */
export async function signInWithApple(): Promise<{ error: any }> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // Native: use Supabase directly with skipBrowserRedirect, then open in system browser
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/user/auth`,
        skipBrowserRedirect: true,
      },
    });

    if (error) return { error };

    if (data?.url) {
      // Open in the system browser (Safari) which handles Apple ID natively
      await Browser.open({ url: data.url });
    }

    return { error: null };
  }

  // Web: use the lovable auth bridge as normal
  const result = await lovable.auth.signInWithOAuth('apple', {
    redirect_uri: window.location.origin,
  });

  return { error: result.error || null };
}
