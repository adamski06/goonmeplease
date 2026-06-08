const FACEBOOK_APP_ID = '986627434278211';
const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-auth-callback`;

/**
 * Redirects the browser to Facebook's OAuth dialog.
 * After consent, Facebook → edge function → /auth/facebook/callback#token_hash=...
 */
export function signInWithFacebook() {
  const nonce = crypto.randomUUID();
  const state = btoa(JSON.stringify({ origin: window.location.origin, nonce }));

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: SUPABASE_FN_URL,
    state,
    response_type: 'code',
    scope: 'public_profile,email',
  });

  window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}
