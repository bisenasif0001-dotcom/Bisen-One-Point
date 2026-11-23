import { ApiError } from './pricing.mjs';
import { CUSTOM_FRAME_SIZES } from '../src/utils/frameStudio.js';
import {
  FRAME_FINISHES,
  GLASS_OPTIONS,
  MAT_OPTIONS,
  ISLAMIC_ART_COLLECTION,
  SAMPLE_CARDS_AND_GIFTS,
} from '../src/data/products.js';
import { ASMA_UL_HUSNA_ITEMS } from '../src/data/asmaUlHusnaData.js';
import { PRINT_SIZES } from '../src/utils/photoPrints.js';
import { DUA_PRINT_PRICES } from '../src/data/duaPricing.js';
import { CARD_SIZES } from '../src/data/birthdayCards.js';
import { GALLERY_LAYOUTS } from '../src/data/galleryWalls.js';
import { ITRA_PRODUCTS } from '../src/data/itraProducts.js';
import { DEFAULT_PVC_PRICES } from '../src/data/pvcCards.js';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const VALID_FRAME_SIZES = new Set(CUSTOM_FRAME_SIZES.map(s => s.id));
const VALID_FRAME_FINISHES = new Set(FRAME_FINISHES.map(f => f.id));
const VALID_GLASS_OPTIONS = new Set(GLASS_OPTIONS.map(g => g.id));
const VALID_MAT_OPTIONS = new Set(MAT_OPTIONS.map(m => m.id));
const VALID_PRINT_SIZES = new Set(PRINT_SIZES.map(s => s.id));
const VALID_DUA_SIZES = new Set(Object.keys(DUA_PRINT_PRICES));
const VALID_PVC_KEYS = new Set(Object.keys(DEFAULT_PVC_PRICES));
const VALID_CARD_SIZES = new Set(CARD_SIZES.map(s => s.id));
const VALID_GALLERY_LAYOUTS = new Set(GALLERY_LAYOUTS.map(l => l.id));
const VALID_ITRA_PRODUCTS = new Map(ITRA_PRODUCTS.map(p => [p.id, new Set(Object.keys(p.prices || {}))]));
const VALID_ISLAMIC_ART = new Set([
  ...ISLAMIC_ART_COLLECTION.map(a => a.id),
  ...ASMA_UL_HUSNA_ITEMS.map(a => a.id),
]);
const VALID_GIFTS = new Set(SAMPLE_CARDS_AND_GIFTS.map(g => g.id));

export function readPriceOverrides(db) {
  const row = db.prepare('SELECT data FROM price_overrides WHERE id=1').get();
  return row ? JSON.parse(row.data) : {};
}

export function validatePriceOverrides(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ApiError(400, 'Invalid price data.');
  }
  const result = {};
  const number = (value, min, max) => {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) return null;
    return Math.round(n);
  };

  const assignGroup = (groupKey, validSet, min, max) => {
    const raw = input[groupKey];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;
    const out = {};
    for (const [key, val] of Object.entries(raw)) {
      if (FORBIDDEN_KEYS.has(key) || !validSet.has(key)) continue;
      const price = number(val, min, max);
      if (price !== null) out[key] = price;
    }
    if (Object.keys(out).length > 0) result[groupKey] = out;
  };

  assignGroup('frameSizes', VALID_FRAME_SIZES, 1, 100000);
  assignGroup('framePrintAddons', VALID_FRAME_SIZES, 0, 100000);
  assignGroup('frameFinishes', VALID_FRAME_FINISHES, 0, 100000);
  assignGroup('glassOptions', VALID_GLASS_OPTIONS, 0, 100000);
  assignGroup('matOptions', VALID_MAT_OPTIONS, 0, 100000);
  assignGroup('printSizes', VALID_PRINT_SIZES, 1, 100000);
  assignGroup('duaPrices', VALID_DUA_SIZES, 1, 100000);
  assignGroup('pvcPrices', VALID_PVC_KEYS, 0, 100000);
  assignGroup('cardSizes', VALID_CARD_SIZES, 1, 100000);
  assignGroup('galleryLayouts', VALID_GALLERY_LAYOUTS, 1, 1000000);
  assignGroup('gifts', VALID_GIFTS, 1, 1000000);

  if (input.itraPrices && typeof input.itraPrices === 'object' && !Array.isArray(input.itraPrices)) {
    const out = {};
    for (const [productId, volumes] of Object.entries(input.itraPrices)) {
      const validVols = VALID_ITRA_PRODUCTS.get(productId);
      if (FORBIDDEN_KEYS.has(productId) || !validVols || !volumes || typeof volumes !== 'object' || Array.isArray(volumes)) {
        continue;
      }
      const productOut = {};
      for (const [vol, val] of Object.entries(volumes)) {
        if (FORBIDDEN_KEYS.has(vol) || !validVols.has(vol)) continue;
        const price = number(val, 1, 1000000);
        if (price !== null) productOut[vol] = price;
      }
      if (Object.keys(productOut).length > 0) out[productId] = productOut;
    }
    if (Object.keys(out).length > 0) result.itraPrices = out;
  }

  if (input.islamicArt && typeof input.islamicArt === 'object' && !Array.isArray(input.islamicArt)) {
    const out = {};
    for (const [artId, prices] of Object.entries(input.islamicArt)) {
      if (FORBIDDEN_KEYS.has(artId) || !VALID_ISLAMIC_ART.has(artId) || !prices || typeof prices !== 'object' || Array.isArray(prices)) {
        continue;
      }
      const itemOut = {};
      const framed = number(prices.framedPriceA4, 1, 1000000);
      const unframed = number(prices.unframedPriceA4, 1, 1000000);
      if (framed !== null) itemOut.framedPriceA4 = framed;
      if (unframed !== null) itemOut.unframedPriceA4 = unframed;
      if (Object.keys(itemOut).length > 0) out[artId] = itemOut;
    }
    if (Object.keys(out).length > 0) result.islamicArt = out;
  }

  return result;
}
