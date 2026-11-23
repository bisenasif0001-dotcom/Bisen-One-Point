import { FRAME_FINISHES, FRAME_SIZES } from '../data/products.js';
import { DUA_PRINT_PRICES } from '../data/duaPricing.js';
import { getActivePriceOverrides, getDuaPosterPrice, getFrameFinishExtraPrice } from './priceRegistry.js';
import { getCataloguePrice } from './frameCatalogue.js';

export const ASMA_PRINT_PRICES = DUA_PRINT_PRICES;

export const asmaArtworkPath = item => `/islamic-art/${item.id}`;
export const asmaArtworkImage = item => `/islamic-calligraphy/${encodeURIComponent(item.fileName)}`;

export function asmaArtworkPrice(item, format, sizeId, frame, overrides) {
  const size = FRAME_SIZES.find(option => option.id === sizeId);
  if (!size || !item) return null;
  const src = (overrides !== undefined ? overrides : getActivePriceOverrides()) || {};
  const artOverride = src.islamicArt?.[item.id];
  if (format === 'print') {
    if (artOverride?.unframedPriceA4 !== undefined) {
      return Math.round(artOverride.unframedPriceA4 * size.multiplier / 1.35);
    }
    return getDuaPosterPrice(sizeId, overrides) ?? Math.round((item.unframedPriceA4 ?? 79) * size.multiplier / 1.35);
  }
  if (artOverride?.framedPriceA4 !== undefined) {
    const finishExtra = frame ? getFrameFinishExtraPrice(frame.id, overrides) : 0;
    return Math.round(artOverride.framedPriceA4 * size.multiplier / 1.35 + finishExtra);
  }
  const printPrice = getDuaPosterPrice(sizeId, overrides) ?? Math.round((item.unframedPriceA4 ?? 79) * size.multiplier / 1.35);
  const framePrice = getCataloguePrice(frame?.id || FRAME_FINISHES[0].id, sizeId, overrides, { includePrint: false }) ?? 0;
  return printPrice + framePrice;
}

export function buildAsmaArtworkEnquiry({ item, order, frame }) {
  if (!order.valid) return '';
  return [
    'Hello! I would like to enquire about this Names of Allah artwork.',
    `Design: ${item.title} (${item.arabicTitle})`,
    `Product ID: ${item.id}`,
    `Format: ${order.format === 'framed' ? 'With frame' : 'Rolled print without frame'}`,
    `Size: ${order.sizeId} (${order.dimensions})`,
    ...(frame ? [`Frame: ${frame.name} (${frame.finish})`] : []),
    `Quantity: ${order.quantity}`,
    ...(order.subtotal !== null ? [`Estimated subtotal: Rs ${order.subtotal} (delivery extra)`] : []),
    'Please confirm availability, final price and delivery charges.',
  ].join('\n');
}
