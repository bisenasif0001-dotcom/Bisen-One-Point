// One set of rules for checkout, server totals and delivery information.
// Merchant approval of these existing amounts remains on the launch checklist.
export const COMMERCE = Object.freeze({ deliveryFee: 99, freeDeliveryThreshold: 999, expressExtra: 149 });
export const COUPONS = Object.freeze({ WELCOME10: 10, BARAKAH15: 15 });
export function deliveryCharge(subtotal, speed = 'standard') {
  return (subtotal >= COMMERCE.freeDeliveryThreshold || subtotal === 0 ? 0 : COMMERCE.deliveryFee) + (speed === 'express' ? COMMERCE.expressExtra : 0);
}
