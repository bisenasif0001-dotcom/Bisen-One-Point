import { DUA_PRINT_PRICES } from '../data/duaPricing.js';
import { PRINT_SIZES } from '../data/printSizes.js';
import {
  FRAME_SIZES,
  FRAME_FINISHES,
  GLASS_OPTIONS,
  MAT_OPTIONS,
  ISLAMIC_ART_COLLECTION,
  SAMPLE_CARDS_AND_GIFTS,
} from '../data/products.js';
import { CARD_SIZES } from '../data/birthdayCards.js';
import { GALLERY_LAYOUTS } from '../data/galleryWalls.js';
import { ITRA_PRODUCTS } from '../data/itraProducts.js';
import { DEFAULT_PVC_PRICES } from '../data/pvcCards.js';

let activeOverrides = {};

const resolveOverrides = overrides => (overrides !== undefined ? overrides : activeOverrides) || {};

export function setActivePriceOverrides(overrides) {
  activeOverrides = overrides && typeof overrides === 'object' ? overrides : {};
}

export function getActivePriceOverrides() {
  return activeOverrides;
}

export function getFrameSizeBasePrice(sizeId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.frameSizes?.[sizeId] !== undefined) {
    return src.frameSizes[sizeId];
  }
  const size = FRAME_SIZES.find(s => s.id === sizeId);
  return size?.basePrice ?? 0;
}

export function getFramePrintAddonPrice(sizeId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.framePrintAddons?.[sizeId] !== undefined) {
    return src.framePrintAddons[sizeId];
  }
  const size = FRAME_SIZES.find(s => s.id === sizeId);
  return size?.printAddon ?? 0;
}

export function getFrameFinishExtraPrice(frameId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.frameFinishes?.[frameId] !== undefined) {
    return src.frameFinishes[frameId];
  }
  const finish = FRAME_FINISHES.find(f => f.id === frameId);
  return finish?.extraPrice ?? 0;
}

export function getGlassExtraPrice(glassId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.glassOptions?.[glassId] !== undefined) {
    return src.glassOptions[glassId];
  }
  const glass = GLASS_OPTIONS.find(g => g.id === glassId);
  return glass?.extra ?? 0;
}

export function getMatExtraPrice(matId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.matOptions?.[matId] !== undefined) {
    return src.matOptions[matId];
  }
  const mat = MAT_OPTIONS.find(m => m.id === matId);
  return mat?.extra ?? 0;
}

export function getPrintSizePrice(sizeId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.printSizes?.[sizeId] !== undefined) {
    return src.printSizes[sizeId];
  }
  const size = PRINT_SIZES.find(s => s.id === sizeId);
  return size?.price ?? 0;
}

export function getDuaPosterPrice(sizeId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.duaPrices?.[sizeId] !== undefined) {
    return src.duaPrices[sizeId];
  }
  return DUA_PRINT_PRICES[sizeId] ?? null;
}

export function getCardSizePrice(sizeId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.cardSizes?.[sizeId] !== undefined) {
    return src.cardSizes[sizeId];
  }
  const size = CARD_SIZES.find(s => s.id === sizeId);
  return size?.unitPrice ?? 0;
}

export function getGalleryLayoutAutoBasePrice(layoutId, overrides) {
  const layout = GALLERY_LAYOUTS.find(l => l.id === layoutId);
  if (!layout) return 0;
  return layout.slots.reduce(
    (sum, slot) => sum + getFrameSizeBasePrice(slot.sizeId, overrides) + getFramePrintAddonPrice(slot.sizeId, overrides),
    0,
  );
}

export function getGalleryLayoutPrice(layoutId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.galleryLayouts?.[layoutId] !== undefined) {
    return src.galleryLayouts[layoutId];
  }
  return getGalleryLayoutAutoBasePrice(layoutId, overrides);
}

export function getItraProductPrice(productId, volume, overrides) {
  const src = resolveOverrides(overrides);
  if (src.itraPrices?.[productId]?.[volume] !== undefined) {
    return src.itraPrices[productId][volume];
  }
  const product = ITRA_PRODUCTS.find(p => p.id === productId);
  return product?.prices?.[volume] ?? null;
}

export function getIslamicArtFramedPrice(artId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.islamicArt?.[artId]?.framedPriceA4 !== undefined) {
    return src.islamicArt[artId].framedPriceA4;
  }
  const art = ISLAMIC_ART_COLLECTION.find(a => a.id === artId);
  return art?.framedPriceA4 ?? 0;
}

export function getIslamicArtUnframedPrice(artId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.islamicArt?.[artId]?.unframedPriceA4 !== undefined) {
    return src.islamicArt[artId].unframedPriceA4;
  }
  const art = ISLAMIC_ART_COLLECTION.find(a => a.id === artId);
  return art?.unframedPriceA4 ?? 0;
}

export function getGiftItemPrice(giftId, overrides) {
  const src = resolveOverrides(overrides);
  if (src.gifts?.[giftId] !== undefined) {
    return src.gifts[giftId];
  }
  const gift = SAMPLE_CARDS_AND_GIFTS.find(g => g.id === giftId);
  return gift?.price ?? 0;
}

export function getPvcPrice(key, overrides) {
  const src = resolveOverrides(overrides);
  if (src.pvcPrices?.[key] !== undefined) {
    return src.pvcPrices[key];
  }
  return DEFAULT_PVC_PRICES[key] ?? 0;
}

export function getMinFramePrice(sizeId = 'A5', { includePrint = true, overrides } = {}) {
  const base = getFrameSizeBasePrice(sizeId, overrides);
  const printExtra = includePrint ? getFramePrintAddonPrice(sizeId, overrides) : 0;
  const minFinishExtra = Math.min(...FRAME_FINISHES.map(f => getFrameFinishExtraPrice(f.id, overrides)));
  return base + printExtra + minFinishExtra;
}

export function getMinPrintPrice(overrides) {
  return Math.min(...PRINT_SIZES.map(s => getPrintSizePrice(s.id, overrides)));
}

export function getMinCardPrice(overrides) {
  return Math.min(...CARD_SIZES.map(s => getCardSizePrice(s.id, overrides)));
}

export function getMinItraPrice(overrides, { volume = null } = {}) {
  const values = [];
  for (const product of ITRA_PRODUCTS) {
    for (const vol of Object.keys(product.prices || {})) {
      if (volume && vol !== volume) continue;
      const val = getItraProductPrice(product.id, vol, overrides);
      if (Number.isFinite(val)) values.push(val);
    }
  }
  return values.length ? Math.min(...values) : 0;
}
