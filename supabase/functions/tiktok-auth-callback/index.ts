import { createClient } from 'npm:@supabase/supabase-js@2';

const TIKTOK_CLIENT_KEY = 'awcfi76rii84ifpf';
const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-auth-callback`;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function htmlError(message: string, origin?: string) {
  const safeOrigin = origin && /^https?:\/\/[a-zA-Z0-9.\-:]+$/.test(origin) ? origin : '';
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Sign-in failed</title>
<body style="font-family:system-ui;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<div style="text-align:center;max-width:420px;padding:24px">
<p style="font-size:14px;opacity:0.8">${escapeHtml(message)}</p>
${safeOrigin ? `<a href="${escapeHtml(safeOrigin)}/user/auth" style="color:#3c82f6">Return to sign in</a>` : ''}
</div></body>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const tkError = url.searchParams.get('error');

    if (tkError) {
      return htmlError(`TikTok error: ${url.searchParams.get('error_description') ?? tkError}`);
    }
    if (!code || !stateParam) {
      return htmlError('Missing authorization code.');
    }

    let state: { origin: string; nonce: string; native?: string };
    try {
      state = JSON.parse(atob(stateParam));
    } catch {
      return htmlError('Invalid state.');
    }
    const ALLOWED_ORIGINS = [
      'https://goonmeplease.lovable.app',
      'https://jarla.app',
      'https://id-preview--a3ff5a4c-b5be-4e65-88ae-74826bb85319.lovable.app',
    ];
    const originOk =
      ALLOWED_ORIGINS.includes(state.origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(state.origin) ||
      /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(state.origin);
    if (!originOk) {
      return htmlError('Untrusted origin.');
    }

    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');
    if (!clientSecret) return htmlError('Server missing TikTok secret.', state.origin);

    // Exchange code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });
    if (!tokenRes.ok) {
      console.error('TikTok token exchange failed', await tokenRes.text());
      return htmlError('Could not exchange TikTok code.', state.origin);
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;
    const openId = tokenJson.open_id as string;

    if (!accessToken || !openId) {
      console.error('TikTok token missing fields', tokenJson);
      return htmlError('TikTok did not return a valid token.', state.origin);
    }

    // Fetch user info (display_name, avatar_url)
    let displayName = 'TikTok User';
    let avatarUrl: string | undefined;
    try {
      const userRes = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (userRes.ok) {
        const userJson = await userRes.json();
        displayName = userJson?.data?.user?.display_name ?? displayName;
        avatarUrl = userJson?.data?.user?.avatar_url ?? undefined;
      }
    } catch (e) {
      console.warn('TikTok userinfo fetch failed', e);
    }

    // TikTok doesn't return email; synthesize a stable placeholder
    const email = `tt_${openId}@tiktok.jarla.app`;

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        avatar_url: avatarUrl,
        provider: 'tiktok',
        tiktok_open_id: openId,
        tiktok_username: displayName,
      },
      app_metadata: { provider: 'tiktok', providers: ['tiktok'] },
    });
    if (createErr && !String(createErr.message).toLowerCase().includes('already')) {
      console.error('createUser error', createErr);
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error('generateLink error', linkErr);
      return htmlError('Could not create session.', state.origin);
    }

    const tokenHash = linkData.properties.hashed_token;
    const nativeScheme = state.native && /^[a-z0-9.\-]+$/i.test(state.native) ? state.native : null;
    const redirect = nativeScheme
      ? `${nativeScheme}://auth-callback#token_hash=${encodeURIComponent(tokenHash)}&email=${encodeURIComponent(email)}`
      : `${state.origin}/auth/tiktok/callback#token_hash=${encodeURIComponent(tokenHash)}&email=${encodeURIComponent(email)}`;
    return new Response(null, { status: 302, headers: { Location: redirect } });
  } catch (e) {
    console.error('tiktok-auth-callback fatal', e);
    return htmlError('Unexpected error.');
  }
});
