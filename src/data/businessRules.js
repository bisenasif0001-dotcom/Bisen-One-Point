export const DEFAULT_BUSINESS_RULES = {
  shipping: { pickupEnabled: true, pvcStarting: 69, printsStarting: 79, freeThreshold: 999, freePincodes: [], freeTypes: ['pvc_card', 'photo_prints'], freeMaxCharge: 0 },
  production: { dispatchMinDays: 2, dispatchMaxDays: 4 },
  refunds: { initiateBusinessDays: 3, damagePreferredHours: 48 },
  retention: { workingDaysAfterDelivery: 30, backupDays: 30 },
  grievance: { name: 'M. Talib Khan', designation: 'Grievance Officer' },
  coupons: [
    { code: 'WELCOME10', enabled: true, kind: 'percent', value: 10, maxDiscount: 100, minSubtotal: 499, firstOrderOnly: true, perMobileLimit: 1, expires: '', eligibleTypes: ['custom_frame', 'photo_prints', 'birthday_card', 'itra_perfume'], excludeDiscounted: true },
    { code: 'SAVE150', enabled: true, kind: 'fixed', value: 150, maxDiscount: 150, minSubtotal: 1499, firstOrderOnly: false, perMobileLimit: 1, expires: '', eligibleTypes: ['custom_frame', 'photo_prints', 'birthday_card', 'itra_perfume'], excludeDiscounted: true },
  ],
};
export const COMMERCE_TYPES = ['custom_frame', 'photo_prints', 'birthday_card', 'itra_perfume', 'gallery_wall', 'pvc_card', 'islamic_art'];
export function couponCalculation({ rules = DEFAULT_BUSINESS_RULES, code = '', items = [], subtotal = 0, hasPriorOrder = false, uses = 0, now = new Date() }) {
  code = String(code).trim().toUpperCase();
  if (!code) return { code: '', discountAmount: 0, error: '' };
  const coupon = rules.coupons.find(item => item.code === code);
  const fail = error => ({ code, discountAmount: 0, error });
  if (!coupon?.enabled) return fail('This coupon is unavailable.');
  if (coupon.expires && now > new Date(`${coupon.expires}T23:59:59+05:30`)) return fail('This coupon has expired.');
  if (subtotal < coupon.minSubtotal) return fail(`This coupon needs an item subtotal of at least ₹${coupon.minSubtotal}.`);
  if (coupon.firstOrderOnly && hasPriorOrder) return fail('WELCOME10 is for your first order. A previous or active order exists for this mobile number.');
  if (coupon.perMobileLimit && uses >= coupon.perMobileLimit) return fail('This coupon’s limit has been reached for this mobile number.');
  const eligible = items.filter(item => coupon.eligibleTypes.includes(item.type) && !(coupon.excludeDiscounted && item.discounted));
  const eligibleTotal = eligible.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!eligibleTotal) return fail('This coupon does not apply to these products, discounted sets or custom bulk quotations.');
  const amount = coupon.kind === 'percent' ? Math.round(eligibleTotal * coupon.value / 100) : coupon.value;
  return { code, discountAmount: Math.max(0, Math.min(eligibleTotal, amount, coupon.maxDiscount || amount)), error: '' };
}
export function isFreeDeliveryEligible(rules, { items, subtotal, pincode, courierFee, packagingFee }) {
  return subtotal >= rules.shipping.freeThreshold && items.length > 0
    && items.every(item => rules.shipping.freeTypes.includes(item.type))
    && rules.shipping.freePincodes.includes(pincode)
    && rules.shipping.freeMaxCharge > 0 && courierFee + packagingFee <= rules.shipping.freeMaxCharge;
}
