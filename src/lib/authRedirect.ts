import { Capacitor } from '@capacitor/core';

const PUBLISHED_AUTH_ORIGIN = 'https://goonmeplease.lovable.app';

export function getAuthRedirectUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const origin = Capacitor.isNativePlatform() ? PUBLISHED_AUTH_ORIGIN : window.location.origin;

  return `${origin}${normalizedPath}`;
}