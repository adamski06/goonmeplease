/**
 * Ensures Clearbit logo URLs request the highest quality (512px PNG)
 * and normalizes the domain to lowercase (Clearbit is case-sensitive).
 * Passes through non-Clearbit URLs unchanged.
 */
export function getHighResLogoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes('logo.clearbit.com')) {
    // Extract the domain part and lowercase it
    const base = url.split('?')[0];
    const parts = base.split('logo.clearbit.com/');
    if (parts[1]) {
      return `https://logo.clearbit.com/${parts[1].toLowerCase()}?size=512&format=png`;
    }
    return `${base}?size=512&format=png`;
  }
  return url;
}
