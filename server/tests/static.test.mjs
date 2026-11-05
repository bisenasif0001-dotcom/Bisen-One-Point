import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createStaticHandler } from '../static.mjs';
import { routeInfo, SITEMAP_PATHS } from '../../src/data/siteRoutes.js';

test('production pages use correct metadata, private indexing rules, compression and real 404 status', async () => {
  let server;
  try {
    const handler = createStaticHandler({ publicOrigin: 'https://studio.example.test', indexable: true });
    server = createServer(handler);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const page = await fetch(`${origin}/photo-prints`);
    const html = await page.text();
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('content-encoding'), 'gzip');
    assert.ok(html.includes('Photo Prints | AL-NOOR Studio'));
    assert.ok(html.includes('href="https://studio.example.test/photo-prints"'));
    assert.ok(html.includes('content="index, follow"'));
    assert.equal(page.headers.get('x-frame-options'), 'DENY');
    for (const path of ['/studio', '/studio/orders', '/track-order', '/track', '/orders', '/my-orders']) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow', path);
    }
    for (const path of ['/not-a-page', '/pvc-cards/not-a-product', '/dua-posters/not-a-poster', '/itra/not-a-scent', '/product/not-a-frame', '/cards/not-a-card', '/occasions/not-an-occasion']) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 404, path);
      assert.ok((await response.text()).includes('Page Not Found'));
    }
    for (const path of ['/.env', '/.studio-data/master.key', '/studio.sqlite', '/missing.jpg', '/%2e%2e%5cpackage.json']) assert.equal((await fetch(origin + path)).status, 404, path);
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const path of SITEMAP_PATHS) assert.ok(sitemap.includes(`https://studio.example.test${path}`), path);
    assert.ok(!sitemap.includes('/studio</loc>'));
    const robots = await (await fetch(`${origin}/robots.txt`)).text();
    assert.ok(robots.includes('Disallow: /api/'));
    assert.ok(robots.includes('Sitemap: https://studio.example.test/sitemap.xml'));
    const head = await fetch(`${origin}/contact`, { method: 'HEAD' });
    assert.equal(head.status, 200); assert.equal(await head.text(), '');
    assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  } finally { if (server) await new Promise(resolve => server.close(resolve)); }
});

test('staging stays out of search until explicitly enabled', async () => {
  let server;
  try {
    server = createServer(createStaticHandler({ publicOrigin: 'https://staging.example.test' }));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const page = await fetch(origin);
    assert.equal(page.headers.get('x-robots-tag'), 'noindex, nofollow');
    assert.ok((await page.text()).includes('data-indexable="false"'));
    assert.ok((await (await fetch(origin + '/robots.txt')).text()).includes('Disallow: /\n'));
    assert.equal((await fetch(origin + '/sitemap.xml')).status, 404);
    assert.equal(routeInfo('/occasions/parents').known, true);
    assert.equal(routeInfo('/occasions/for-parents').known, false);
  } finally { if (server) await new Promise(resolve => server.close(resolve)); }
});
