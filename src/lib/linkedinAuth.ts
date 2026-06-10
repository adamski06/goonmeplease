import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const LINKEDIN_CLIENT_ID = '786z4999y9zvyb';
const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-callback`;
const PUBLISHED_ORIGIN = 'https://goonmeplease.lovable.app';
const APP_SCHEME = 'app.lovable.jarla';

/**
 * Redirects the browser to LinkedIn's OAuth dialog.
 * - Web: full page redirect, callback returns to current origin.
 * - Native iOS: opens in SFSafariViewController; edge function deep-links back via custom scheme.
 */
export async function signInWithLinkedIn() {
  const isNative = Capacitor.isNativePlatform();
  const nonce = crypto.randomUUID();
  const origin = isNative ? PUBLISHED_ORIGIN : window.location.origin;
  const statePayload: Record<string, string> = { origin, nonce };
  if (isNative) statePayload.native = APP_SCHEME;
  const state = btoa(JSON.stringify(statePayload));

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: SUPABASE_FN_URL,
    scope: 'openid profile email',
    state,
  });

  const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  if (isNative) {
    await Browser.open({ url });
    return;
  }

  window.location.href = url;
}
