import { createClient } from 'npm:@supabase/supabase-js@2';

const FACEBOOK_APP_ID = '986627434278211';
const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/facebook-auth-callback`;

function htmlError(message: string, origin?: string) {
  const safeOrigin = origin ?? '';
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Sign-in failed</title>
<body style="font-family:system-ui;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<div style="text-align:center;max-width:420px;padding:24px">
<p style="font-size:14px;opacity:0.8">${message}</p>
${safeOrigin ? `<a href="${safeOrigin}/user/auth" style="color:#1877F2">Return to sign in</a>` : ''}
</div></body>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const fbError = url.searchParams.get('error');

    if (fbError) {
      return htmlError(`Facebook error: ${url.searchParams.get('error_description') ?? fbError}`);
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

    const originOk =
      state.origin === 'https://goonmeplease.lovable.app' ||
      state.origin === 'https://jarla.app' ||
      /^http:\/\/localhost(:\d+)?$/.test(state.origin) ||
      /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(state.origin);
    if (!originOk) {
      return htmlError('Untrusted origin.');
    }

    const clientSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    if (!clientSecret) return htmlError('Server missing Facebook secret.', state.origin);

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      code,
    });
    const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams.toString()}`);
    if (!tokenRes.ok) {
      console.error('Facebook token exchange failed', await tokenRes.text());
      return htmlError('Could not exchange Facebook code.', state.origin);
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;

    // Fetch user profile
    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
    );
    if (!userRes.ok) {
      console.error('Facebook userinfo failed', await userRes.text());
      return htmlError('Could not load Facebook profile.', state.origin);
    }
    const profile = await userRes.json();
    const fbId = profile.id as string;
    const fullName = (profile.name as string) ?? 'Facebook User';
    const avatarUrl = profile.picture?.data?.url as string | undefined;
    const email = (profile.email as string | undefined) ?? `fb_${fbId}@facebook.jarla.app`;

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
        provider: 'facebook',
        facebook_id: fbId,
      },
      app_metadata: { provider: 'facebook', providers: ['facebook'] },
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
    const redirect = `${state.origin}/auth/facebook/callback#token_hash=${encodeURIComponent(tokenHash)}&email=${encodeURIComponent(email)}`;
    return new Response(null, { status: 302, headers: { Location: redirect } });
  } catch (e) {
    console.error('facebook-auth-callback fatal', e);
    return htmlError('Unexpected error.');
  }
});
