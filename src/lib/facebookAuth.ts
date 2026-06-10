import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const FACEBOOK_APP_ID = '986627434278211';
const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-auth-callback`;
const PUBLISHED_ORIGIN = 'https://goonmeplease.lovable.app';
const APP_SCHEME = 'app.lovable.jarla';

/**
 * Redirects the browser to Facebook's OAuth dialog.
 * - Web: full page redirect, callback returns to current origin.
 * - Native iOS: opens in SFSafariViewController; edge function deep-links back via custom scheme.
 */
export async function signInWithFacebook() {
  const isNative = Capacitor.isNativePlatform();
  const nonce = crypto.randomUUID();
  const origin = isNative ? PUBLISHED_ORIGIN : window.location.origin;
  const statePayload: Record<string, string> = { origin, nonce };
  if (isNative) statePayload.native = APP_SCHEME;
  const state = btoa(JSON.stringify(statePayload));

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: SUPABASE_FN_URL,
    state,
    response_type: 'code',
    scope: 'public_profile,email',
  });

  const url = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

  if (isNative) {
    await Browser.open({ url });
    return;
  }
  window.location.href = url;
}
