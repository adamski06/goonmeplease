/**
 * Ensures Clearbit logo URLs request the highest quality (512px PNG).
 * Passes through non-Clearbit URLs unchanged.
 */
export function getHighResLogoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes('logo.clearbit.com')) {
    // Strip existing query params and add max quality
    const base = url.split('?')[0];
    return `${base}?size=512&format=png`;
  }
  return url;
}
