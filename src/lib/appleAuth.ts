import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { lovable } from '@/integrations/lovable/index';

const PUBLISHED_ORIGIN = 'https://goonmeplease.lovable.app';
const APP_SCHEME = 'app.lovable.jarla';

/**
 * Apple Sign In:
 * - Web/preview: uses Lovable managed auth (popup/redirect within browser)
 * - Native iOS: opens OAuth in SFSafariViewController via Browser.open(),
 *   then the published app redirects back via custom URL scheme deep link.
 */
export async function signInWithApple(): Promise<{ error: any }> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
      // Include native=true so the published app knows to redirect back via custom scheme
      const redirectUri = `${PUBLISHED_ORIGIN}/user/auth?native=${APP_SCHEME}`;

      const params = new URLSearchParams({
        provider: 'apple',
        redirect_uri: redirectUri,
        state,
      });

      const oauthUrl = `${PUBLISHED_ORIGIN}/~oauth/initiate?${params.toString()}`;

      // Open in SFSafariViewController (overlay) — WebView stays intact underneath
      await Browser.open({ url: oauthUrl });

      // The callback is handled by appUrlOpen listener in nativeAuthHandler.ts
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  }

  // Web: use Lovable managed auth (handles iframe/popup automatically)
  try {
    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: window.location.origin,
    });

    if (result.error) return { error: result.error };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || err };
  }
}
