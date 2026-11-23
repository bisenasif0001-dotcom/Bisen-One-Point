import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { DUA_POSTERS, DUA_CATEGORIES } from '../src/data/duaPosters.js';
import { DUA_PRINT_PRICES } from '../src/data/duaPricing.js';
assert.equal(DUA_POSTERS.length, 22);
assert.equal(new Set(DUA_POSTERS.map(p => p.id)).size, 22);
for (const poster of DUA_POSTERS) {
  assert.ok(DUA_CATEGORIES.includes(poster.category), poster.title);
  assert.ok(existsSync(`public${poster.image}`), poster.image);
  assert.ok(existsSync(`public${poster.thumbnail}`), poster.thumbnail);
}
assert.deepEqual(DUA_PRINT_PRICES, {
  A5: 49,
  A4: 79,
  A3: 149,
  '12x18': 179,
  '13x19': 199,
  '15x21': 279,
  '16x22': 299,
  A2: 329,
  A1: 549,
});
assert.equal(DUA_PRINT_PRICES.A3 * 3, 447);
assert.equal(DUA_PRINT_PRICES.A1 * 2, 1098);
const server = await createServer({ server: { middlewareMode: true, hmr: false } });
try {
  const { DuaPosterCollection } = await server.ssrLoadModule('/src/pages/DuaPostersPage.jsx');
  const base = server.config.base.replace(/\/$/, '');
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, {
    basename: server.config.base,
    initialEntries: [`${base}/dua-posters`],
  }, React.createElement(DuaPosterCollection)));
  const cardLinks = [...html.matchAll(/class="dua-card" href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(cardLinks, DUA_POSTERS.map(poster => `${base}/dua-posters/${poster.id}`), 'Card links must include the router base exactly once');
  for (const poster of DUA_POSTERS) assert.ok(html.includes(`src="${base}${poster.thumbnail}"`), poster.title);
} finally {
  await server.close();
}
console.log('Validated 22 poster links under the configured base, 44 image assets and area-based prices.');
