import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { lovable } from '@/integrations/lovable/index';

/**
 * Handles Apple Sign In across web and native Capacitor environments.
 * Uses Lovable managed auth bridge for both environments.
 */
export async function signInWithApple(): Promise<{ error: any }> {
  const isNative = Capacitor.isNativePlatform();

  try {
    const result = isNative
      ? await lovable.auth.signInWithOAuth('apple')
      : await lovable.auth.signInWithOAuth('apple', {
          redirect_uri: window.location.origin,
        });

    if (result.error) return { error: result.error };

    // If auth requires browser redirect, handle it explicitly per platform
    if (result.redirected && typeof (result as any).url === 'string') {
      const oauthUrl = (result as any).url as string;

      if (isNative) {
        await Browser.open({ url: oauthUrl });
        return { error: null };
      }

      const popup = window.open(oauthUrl, 'apple-auth', 'width=500,height=700');
      if (!popup) {
        window.location.assign(oauthUrl);
        return { error: null };
      }

      return new Promise((resolve) => {
        const interval = setInterval(async () => {
          if (popup.closed) {
            clearInterval(interval);
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
              window.location.reload();
            }
            resolve({ error: null });
          }
        }, 500);

        setTimeout(() => {
          clearInterval(interval);
          resolve({ error: null });
        }, 120000);
      });
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || err };
  }
}
