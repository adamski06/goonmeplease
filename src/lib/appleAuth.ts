import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { lovable } from '@/integrations/lovable/index';

/**
 * Handles Apple Sign In across web and native Capacitor environments.
 * Always uses the Lovable auth bridge (which manages Apple OAuth config).
 * On native iOS, opens the auth URL in the system browser since WebView
 * can't handle the OAuth redirect properly.
 */
export async function signInWithApple(): Promise<{ error: any }> {
  const isNative = Capacitor.isNativePlatform();

  const result = await lovable.auth.signInWithOAuth('apple', {
    redirect_uri: isNative
      ? `${window.location.origin}/user/auth`
      : window.location.origin,
  });

  if (result.error) return { error: result.error };

  // On native, if we got a redirect URL but it wasn't auto-followed
  // (e.g. WebView blocked it), open it in the system browser
  if (isNative && result.redirected && typeof (result as any).url === 'string') {
    await Browser.open({ url: (result as any).url });
  }

  return { error: null };
}
