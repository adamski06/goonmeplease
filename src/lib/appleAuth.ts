import { Capacitor } from '@capacitor/core';
import { createLovableAuth } from '@lovable.dev/cloud-auth-js';
import { lovable } from '@/integrations/lovable/index';

/**
 * Apple OAuth on native local builds cannot use a relative /~oauth endpoint from capacitor://localhost.
 * We route native auth through the hosted OAuth broker + hosted redirect URI.
 */
const NATIVE_HOSTED_ORIGIN = 'https://goonmeplease.lovable.app';
const nativeAuth = createLovableAuth({
  oauthBrokerUrl: `${NATIVE_HOSTED_ORIGIN}/~oauth/initiate`,
});

export async function signInWithApple(): Promise<{ error: any }> {
  const isNative = Capacitor.isNativePlatform();
  const isNativeLocalOrigin = isNative && !window.location.origin.startsWith('http');

  try {
    const result = isNativeLocalOrigin
      ? await nativeAuth.signInWithOAuth('apple', {
          redirect_uri: `${NATIVE_HOSTED_ORIGIN}/user/auth`,
        })
      : await lovable.auth.signInWithOAuth('apple', {
          redirect_uri: window.location.origin,
        });

    if (result.error) return { error: result.error };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || err };
  }
}
