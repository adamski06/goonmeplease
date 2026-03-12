import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';

/**
 * Sets up the native deep-link listener for OAuth callbacks.
 * When the published app redirects to `app.lovable.jarla://auth-callback?access_token=...&refresh_token=...`,
 * this handler picks up the tokens, sets the Supabase session, and closes the in-app browser.
 *
 * Call once at app startup (only runs on native platforms).
 */
export function initNativeAuthHandler() {
  if (!Capacitor.isNativePlatform()) return;

  CapApp.addListener('appUrlOpen', async ({ url }) => {
    try {
      const urlObj = new URL(url);

      // Only handle our auth callback
      if (urlObj.host !== 'auth-callback') return;

      const hashParams = new URLSearchParams(urlObj.hash.replace(/^#/, ''));
      const accessToken = urlObj.searchParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlObj.searchParams.get('refresh_token') || hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Dismiss the in-app browser overlay
        try {
          await Browser.close();
        } catch {
          // Browser.close() can throw if already closed
        }
      }
    } catch (e) {
      console.error('[NativeAuth] Error handling auth callback:', e);
    }
  });
}
