import assert from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createServer } from 'vite';
import { ITRA_PRODUCTS } from '../src/data/itraProducts.js';
import { readSavedCart } from '../src/utils/cartStorage.js';
import { cleanItems } from '../server/pricing.mjs';
import { SITEMAP_PATHS, routeInfo } from '../src/data/siteRoutes.js';

for (const raw of ['', 'null', '{}', '[null]', 'broken', '[{"id":"a","quantity":-1,"price":10}]']) assert.deepEqual(readSavedCart({ getItem: () => raw }), []);
assert.deepEqual(readSavedCart({ getItem() { throw new Error('Storage blocked'); } }), []);
assert.equal(readSavedCart({ getItem: () => '[{"id":"valid","quantity":2,"price":49}]' })[0].quantity, 2);
let prices = 0;
for (const product of ITRA_PRODUCTS) for (const [volume, price] of Object.entries(product.prices)) {
  const item = cleanItems([{ id: `line-${product.id}`, productId: product.id, type: 'itra_perfume', volume, quantity: 1, price: 1 }])[0];
  assert.equal(item.price, price, `${product.id} ${volume}`); prices++;
}
const server = await createServer({ server: { middlewareMode: true } });
try {
  const { SEARCH_INDEX } = await server.ssrLoadModule('/src/components/SearchCommandPalette.jsx');
  const links = [...new Set([...SITEMAP_PATHS, ...SEARCH_INDEX.map(item => item.link)])];
  for (const link of links) assert.ok(routeInfo(new URL(link, 'https://local.test').pathname).known, link);
  for (const entry of SEARCH_INDEX) if (entry.thumbnail?.startsWith('/')) assert.ok(existsSync(`public${entry.thumbnail}`), entry.thumbnail);
  const { default: Additions } = await server.ssrLoadModule('/src/components/SmartCrossSell.jsx');
  const additions = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Additions, { cartItems: [{ id: 'qa-card', type: 'birthday_card' }] })));
  for (const path of ['/custom-framing', '/photo-prints', '/birthday-cards']) assert.ok(additions.includes(`href="${path}"`));
  assert.ok(!additions.includes('<button'), 'Additions must open a builder rather than add an unconfigured product');
  const { default: Itra } = await server.ssrLoadModule('/src/pages/ItraProductDetailPage.jsx');
  const render = (id) => renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [`/itra/${id}`] }, React.createElement(Routes, null, React.createElement(Route, { path: '/itra/:id', element: React.createElement(Itra) }))));
  for (const product of ITRA_PRODUCTS) {
    const html = render(product.id);
    assert.ok(html.includes(product.name.replaceAll('&', '&amp;')));
    for (const size of Object.keys(product.prices)) assert.ok(html.includes(size));
    if (!product.prices['3ml']) assert.ok(!html.includes('Add 3ml Discovery Sample'), product.id);
  }
  assert.ok(render('does-not-exist').includes('404 • Page Not Found'));
  const report = { checkedAt: new Date().toISOString(), passed: { routeAndSearchLinks: links.length, authoritativeItraPrices: prices, invalidCartRecovery: true, unknownProductProtection: true }, openLaunchFindings: [
    'Privacy, Terms, Returns and Shipping footer links still lead to Contact. Merchant policy decisions are required.',
    'Final domain/hosting and real Razorpay test/live webhook confirmation remain pending.',
    'Merchant approval of legacy cards, Itra, gift bundles, materials, delivery promises and stock is required.'
  ] };
  writeFileSync('output/prelaunch-review/summary.json', JSON.stringify(report, null, 2));
  console.log(`Passed ${links.length} known route/search destinations, ${prices} server-owned Itra prices, corrupt-cart recovery and product/sample safeguards. Open launch findings recorded separately.`);
} finally { await server.close(); }
