import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { gzip as gzipCallback } from 'node:zlib';
import { promisify } from 'node:util';
import { routeInfo, SITEMAP_PATHS } from '../src/data/siteRoutes.js';

const gzip = promisify(gzipCallback);
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.avif': 'image/avif' };

export function createStaticHandler({ directory = resolve('dist'), publicOrigin, indexable = false }) {
  const root = resolve(directory), origin = new URL(publicOrigin).origin;
  return async function serve(req, res) {
    const headers = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'Cache-Control': 'no-cache' };
    if (origin.startsWith('https://')) headers['Strict-Transport-Security'] = 'max-age=31536000';
    async function send(status, body, type, extra = {}) {
      let bytes = Buffer.isBuffer(body) ? body : Buffer.from(body);
      const responseHeaders = { ...headers, 'Content-Type': type, ...extra };
      if (bytes.length > 1024 && /^(text\/|application\/(?:javascript|xml))/.test(type)) {
        responseHeaders.Vary = 'Accept-Encoding';
        if (/(?:^|,)\s*gzip\s*(?:,|$)/i.test(req.headers['accept-encoding'] || '')) {
          bytes = await gzip(bytes); responseHeaders['Content-Encoding'] = 'gzip';
        }
      }
      res.writeHead(status, { ...responseHeaders, 'Content-Length': bytes.length });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    }
    try {
      if (!['GET', 'HEAD'].includes(req.method)) return send(405, 'Method not allowed', 'text/plain; charset=utf-8', { Allow: 'GET, HEAD' });
      let pathname;
      try { pathname = decodeURIComponent(new URL(req.url, origin).pathname); } catch { return send(400, 'Invalid address', 'text/plain; charset=utf-8'); }
      if (pathname === '/robots.txt') return send(200, indexable ? `User-agent: *\nDisallow: /studio\nDisallow: /track\nDisallow: /orders\nDisallow: /my-orders\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n', 'text/plain; charset=utf-8');
      if (pathname === '/sitemap.xml' && indexable) return send(200, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${SITEMAP_PATHS.map(path => `<url><loc>${escape(origin + path)}</loc></url>`).join('')}</urlset>`, 'application/xml; charset=utf-8');
      const filePath = resolve(root, `.${pathname}`);
      if ((!filePath.startsWith(root + sep) && filePath !== root) || /(?:^|\/)[.]|\.(?:sqlite\w*|key|log)$/i.test(pathname)) return send(404, 'Not found', 'text/plain; charset=utf-8');
      let asset = false;
      try { asset = (await stat(filePath)).isFile() && filePath !== resolve(root, 'index.html'); } catch { /* Page routes use the application shell. */ }
      if (asset) {
        const actualPath = await realpath(filePath);
        if (!actualPath.startsWith(root + sep)) return send(404, 'Not found', 'text/plain; charset=utf-8');
        return send(200, await readFile(actualPath), types[extname(filePath)] || 'application/octet-stream', { 'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600' });
      }
      if (extname(pathname) && pathname !== '/index.html') return send(404, 'Not found', 'text/plain; charset=utf-8');
      const info = routeInfo(pathname === '/index.html' ? '/' : pathname);
      const allowed = indexable && info.indexable;
      let html = await readFile(resolve(root, 'index.html'), 'utf8');
      html = html.replace('data-indexable="false"', `data-indexable="${indexable}"`)
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(info.title)}</title>`)
        .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(info.description)}" />`)
        .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${allowed ? 'index, follow' : 'noindex, nofollow'}" />`)
        .replace('</head>', `<link rel="canonical" href="${escape(origin + info.canonical)}" /><meta property="og:type" content="website" /><meta property="og:title" content="${escape(info.title)}" /><meta property="og:description" content="${escape(info.description)}" /><meta property="og:url" content="${escape(origin + info.canonical)}" /></head>`);
      if (!allowed) headers['X-Robots-Tag'] = 'noindex, nofollow';
      return send(info.known ? 200 : 404, html, types['.html']);
    } catch {
      return send(500, 'The website could not be loaded.', 'text/plain; charset=utf-8');
    }
  };
}
