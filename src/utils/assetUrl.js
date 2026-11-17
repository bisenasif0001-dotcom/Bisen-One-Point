/**
 * Resolves a public asset path by prefixing it with the Vite BASE_URL.
 * Handles dev ('/'), production ('/Bisen-One-Point/'), and skips external/blob/data URLs.
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  if (url.startsWith(cleanBase)) return url;

  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  return `${cleanBase}${cleanUrl}`;
}

