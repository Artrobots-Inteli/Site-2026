/** Public presentation policy. Pure validation, without DNS or network access.
 * Both raw input and canonical href are bounded in UTF-16 units. */
export const MAX_PUBLIC_HTTPS_URL_LENGTH = 2000;

export function normalizePublicHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > MAX_PUBLIC_HTTPS_URL_LENGTH) return null;
  const input = value.trim();
  if (!input || input.length > MAX_PUBLIC_HTTPS_URL_LENGTH
    || /[\u0000-\u001f\u007f\\]/.test(input) || !/^https:\/\/[^/\\\s?#]+(?:[/?#]|$)/i.test(input)) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.+$/, '');
    if (!host || host === 'localhost' || /\.(?:localhost|local|internal)$/.test(host)) return null;
    if (host.includes(':')) {
      if (host.startsWith('::') || /^(?:fc|fd|fe[89ab])/.test(host)) return null;
    } else {
      if (!host.includes('.')) return null;
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        const [a, b] = host.split('.').map(Number);
        if (a === 0 || a === 10 || a === 127 || a === 169 && b === 254
          || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168
          || a === 100 && b >= 64 && b <= 127 || a >= 224) return null;
      }
    }
    return url.href.length <= MAX_PUBLIC_HTTPS_URL_LENGTH ? url.href : null;
  } catch { return null; }
}
