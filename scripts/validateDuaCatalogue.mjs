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
assert.deepEqual(DUA_PRINT_PRICES, { A5: 22, A4: 43, A3: 85, A2: 170, A1: 340 });
assert.equal(DUA_PRINT_PRICES.A3 * 3, 255);
assert.equal(DUA_PRINT_PRICES.A1 * 2, 680);
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
