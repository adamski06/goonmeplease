import { Capacitor } from '@capacitor/core';

/**
 * Lovable Assets are served as relative paths (e.g. /__l5e/assets-v1/...).
 * In a native Capacitor build the web view loads from capacitor://localhost,
 * so relative asset URLs 404 (showing as broken question-mark images).
 * Prefix the published origin when running natively so the asset CDN resolves.
 */
const PRODUCTION_ORIGIN = 'https://jarla.app';

export function resolveAssetUrl(url: string): string {
  if (!url) return url;
  // Already absolute
  if (/^https?:\/\//i.test(url)) return url;
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_ORIGIN + url;
  }
  return url;
}
