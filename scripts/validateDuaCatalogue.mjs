import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
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
console.log('Validated 22 unique posters, categories, 44 image assets and area-based prices.');
