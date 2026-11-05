import { FRAME_SIZES } from '../data/products.js';
import { DUA_PRINT_PRICES, DUA_PRINT_SPEC } from '../data/duaPricing.js';

export function getDuaOrderDetails({ format, sizeId, quantity, customWidth = '', customHeight = '', customUnit = 'cm' }) {
  const size = FRAME_SIZES.find(item => item.id === sizeId);
  const count = Number(quantity);
  const errors = {};
  if (!Number.isInteger(count) || count < 1 || count > 10000) errors.quantity = 'Enter a whole quantity from 1 to 10,000.';
  if (!['framed', 'print'].includes(format)) errors.format = 'Choose a poster format.';
  if (!size && sizeId !== 'Custom') errors.size = 'Choose a poster size.';
  const width = Number(customWidth);
  const height = Number(customHeight);
  if (sizeId === 'Custom' && (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || !['cm', 'in'].includes(customUnit))) {
    errors.customSize = 'Enter a width and height greater than zero.';
  }
  const valid = Object.keys(errors).length === 0;
  const unitPrice = format === 'print' ? DUA_PRINT_PRICES[sizeId] ?? null : null;
  const dimensions = size ? size.dimensionsCm.replaceAll(' x ', ' × ') : errors.customSize ? 'Add your dimensions' : `${width} × ${height} ${customUnit}`;
  return { format, sizeId, dimensions, quantity: errors.quantity ? null : count, unitPrice, subtotal: valid && unitPrice ? unitPrice * count : null, valid, errors };
}

export function buildDuaEnquiry({ poster, order, frame }) {
  if (!order.valid) return '';
  return [
    'Hello! I would like to enquire about this Dua poster.',
    `Design: ${poster.title}`,
    `Product ID: ${poster.id}`,
    `Category: ${poster.category}`,
    `Format: ${order.format === 'framed' ? 'With frame' : 'Print only (without frame)'}`,
    `Size: ${order.sizeId} (${order.dimensions})`,
    ...(order.format === 'framed' ? [`Frame: ${frame.name} (${frame.id})`, `Finish: ${frame.finish}`] : []),
    `Paper: ${DUA_PRINT_SPEC}`,
    `Quantity: ${order.quantity}`,
    ...(order.unitPrice ? [`Unit print price: Rs ${order.unitPrice}`, `Print subtotal: Rs ${order.subtotal} (delivery extra)`] : []),
    `Please confirm ${order.unitPrice ? 'delivery charges and my order' : 'the price, available finish and delivery charges'}.`,
  ].join('\n');
}
