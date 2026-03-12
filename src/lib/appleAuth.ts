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
    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: isNative
        ? `${window.location.origin}/user/auth`
        : window.location.origin,
    });

    if (result.error) return { error: result.error };

    // Native: open in system browser if we got a URL
    if (isNative && result.redirected && typeof (result as any).url === 'string') {
      await Browser.open({ url: (result as any).url });
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || err };
  }
}
