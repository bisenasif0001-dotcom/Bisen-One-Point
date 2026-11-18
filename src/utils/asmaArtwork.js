import { FRAME_SIZES } from '../data/products.js';

export const asmaArtworkPath = item => `/islamic-art/${item.id}`;
export const asmaArtworkImage = item => `/islamic-calligraphy/${encodeURIComponent(item.fileName)}`;

export function asmaArtworkPrice(item, format, sizeId, frame) {
  const size = FRAME_SIZES.find(option => option.id === sizeId);
  if (!size) return null;
  const basePrice = format === 'framed' ? item.framedPriceA4 : item.unframedPriceA4;
  const finishPrice = format === 'framed' ? (frame?.extraPrice ?? 0) / 2 : 0;
  return Math.round(basePrice * size.multiplier / 1.35 + finishPrice);
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
