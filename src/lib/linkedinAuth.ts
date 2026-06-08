const LINKEDIN_CLIENT_ID = '786z4999y9zvyb';
const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-callback`;

/**
 * Redirects the browser to LinkedIn's OAuth authorize URL.
 * After consent, LinkedIn → edge function → /auth/linkedin/callback#token_hash=...
 */
export function signInWithLinkedIn() {
  const nonce = crypto.randomUUID();
  const state = btoa(JSON.stringify({ origin: window.location.origin, nonce }));

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: SUPABASE_FN_URL,
    scope: 'openid profile email',
    state,
  });

  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}
