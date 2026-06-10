import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const TIKTOK_CLIENT_KEY = 'awcfi76rii84ifpf';
const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-auth-callback`;
const PUBLISHED_ORIGIN = 'https://goonmeplease.lovable.app';
const APP_SCHEME = 'app.lovable.jarla';

/**
 * Redirects to TikTok's OAuth authorize URL.
 * - Web: full page redirect, callback returns to current origin.
 * - Native iOS: opens in SFSafariViewController; edge function deep-links back via custom scheme.
 */
export async function signInWithTikTok() {
  const isNative = Capacitor.isNativePlatform();
  const nonce = crypto.randomUUID();
  const origin = isNative ? PUBLISHED_ORIGIN : window.location.origin;
  const statePayload: Record<string, string> = { origin, nonce };
  if (isNative) statePayload.native = APP_SCHEME;
  const state = btoa(JSON.stringify(statePayload));

  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    response_type: 'code',
    scope: 'user.info.basic',
    redirect_uri: SUPABASE_FN_URL,
    state,
  });

  const url = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

  if (isNative) {
    await Browser.open({ url });
    return;
  }
  window.location.href = url;
}
