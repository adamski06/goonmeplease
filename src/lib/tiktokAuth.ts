const TIKTOK_CLIENT_KEY = 'awcfi76rii84ifpf';
const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-auth-callback`;

/**
 * Redirects the browser to TikTok's OAuth authorize URL.
 * After consent, TikTok → edge function → /auth/tiktok/callback#token_hash=...
 */
export function signInWithTikTok() {
  const nonce = crypto.randomUUID();
  const state = btoa(JSON.stringify({ origin: window.location.origin, nonce }));

  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    response_type: 'code',
    scope: 'user.info.basic',
    redirect_uri: SUPABASE_FN_URL,
    state,
  });

  window.location.href = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}
