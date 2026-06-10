import { createClient } from 'npm:@supabase/supabase-js@2';

const LINKEDIN_CLIENT_ID = '786z4999y9zvyb';
const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/linkedin-callback`;

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
    const linkedinError = url.searchParams.get('error');

    if (linkedinError) {
      return htmlError(`LinkedIn error: ${url.searchParams.get('error_description') ?? linkedinError}`);
    }
    if (!code || !stateParam) {
      return htmlError('Missing authorization code.');
    }

    let state: { origin: string; nonce: string };
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
    // Also allow localhost during dev
    const originOk =
      ALLOWED_ORIGINS.includes(state.origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(state.origin) ||
      /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(state.origin);
    if (!originOk) {
      return htmlError('Untrusted origin.');
    }

    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    if (!clientSecret) return htmlError('Server missing LinkedIn secret.', state.origin);

    // Exchange code for token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: clientSecret,
      }),
    });
    if (!tokenRes.ok) {
      console.error('LinkedIn token exchange failed', await tokenRes.text());
      return htmlError('Could not exchange LinkedIn code.', state.origin);
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;

    // Fetch userinfo
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      console.error('LinkedIn userinfo failed', await userRes.text());
      return htmlError('Could not load LinkedIn profile.', state.origin);
    }
    const profile = await userRes.json();
    const email = profile.email as string | undefined;
    const fullName = (profile.name as string | undefined) ?? profile.given_name ?? 'LinkedIn User';
    const avatarUrl = profile.picture as string | undefined;

    if (!email) {
      return htmlError('LinkedIn account did not return an email.', state.origin);
    }

    // Create or get user
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: avatarUrl,
        provider: 'linkedin',
      },
      app_metadata: { provider: 'linkedin', providers: ['linkedin'] },
    });
    // Ignore "already registered" — proceed to magiclink
    if (createErr && !String(createErr.message).toLowerCase().includes('already')) {
      console.error('createUser error', createErr);
    }

    // Generate magic link (returns hashed_token usable via verifyOtp)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error('generateLink error', linkErr);
      return htmlError('Could not create session.', state.origin);
    }

    const tokenHash = linkData.properties.hashed_token;
    const redirect = `${state.origin}/auth/linkedin/callback#token_hash=${encodeURIComponent(tokenHash)}&email=${encodeURIComponent(email)}`;
    return new Response(null, { status: 302, headers: { Location: redirect } });
  } catch (e) {
    console.error('linkedin-callback fatal', e);
    return htmlError('Unexpected error.');
  }
});
