import { DEFAULT_BUSINESS_RULES, COMMERCE_TYPES } from '../src/data/businessRules.js';
import { ApiError } from './pricing.mjs';

export function readBusinessRules(db) {
  const row = db.prepare("SELECT value FROM business_settings WHERE id=1").get();
  return row ? JSON.parse(row.value) : structuredClone(DEFAULT_BUSINESS_RULES);
}
export function validateBusinessRules(value) {
  const rules = structuredClone(DEFAULT_BUSINESS_RULES);
  const number = (object, key, min, max) => { const n = Number(object?.[key]); if (!Number.isSafeInteger(n) || n < min || n > max) throw new ApiError(400, `Check ${key}.`); return n; };
  for (const key of ['pvcStarting', 'printsStarting', 'freeThreshold', 'freeMaxCharge']) rules.shipping[key] = number(value.shipping, key, 0, 100000);
  rules.shipping.pickupEnabled = Boolean(value.shipping.pickupEnabled);
  rules.shipping.freePincodes = [...new Set(value.shipping.freePincodes || [])];
  if (rules.shipping.freePincodes.length > 10000 || rules.shipping.freePincodes.some(pin => !/^[1-9]\d{5}$/.test(pin))) throw new ApiError(400, 'Use valid six-digit eligible PIN codes.');
  rules.shipping.freeTypes = (value.shipping.freeTypes || []).filter(type => ['pvc_card', 'photo_prints'].includes(type));
  rules.production.dispatchMinDays = number(value.production, 'dispatchMinDays', 1, 90);
  rules.production.dispatchMaxDays = number(value.production, 'dispatchMaxDays', rules.production.dispatchMinDays, 180);
  rules.refunds.initiateBusinessDays = number(value.refunds, 'initiateBusinessDays', 1, 30);
  rules.refunds.damagePreferredHours = number(value.refunds, 'damagePreferredHours', 1, 168);
  rules.retention.workingDaysAfterDelivery = number(value.retention, 'workingDaysAfterDelivery', 1, 365);
  rules.retention.backupDays = number(value.retention, 'backupDays', 1, 90);
  for (const key of ['name', 'designation']) { const text = String(value.grievance?.[key] || '').trim(); if (!text || text.length > 120) throw new ApiError(400, 'Enter the grievance officer name and designation.'); rules.grievance[key] = text; }
  if (!Array.isArray(value.coupons) || value.coupons.length > 20) throw new ApiError(400, 'Use up to 20 coupon rules.');
  const codes = new Set();
  rules.coupons = value.coupons.map(coupon => {
    const code = String(coupon.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{3,24}$/.test(code) || codes.has(code)) throw new ApiError(400, 'Coupon codes must be unique, using 3–24 letters/numbers.');
    codes.add(code);
    if (!['fixed', 'percent'].includes(coupon.kind)) throw new ApiError(400, 'Choose fixed or percentage discount.');
    const expires = String(coupon.expires || '');
    if (expires && (!/^\d{4}-\d{2}-\d{2}$/.test(expires) || Number.isNaN(Date.parse(expires)) || new Date(expires).toISOString().slice(0, 10) !== expires)) throw new ApiError(400, 'Choose a valid coupon expiry date.');
    const eligibleTypes = (coupon.eligibleTypes || []).filter(type => COMMERCE_TYPES.includes(type));
    if (!eligibleTypes.length) throw new ApiError(400, 'Select eligible coupon products.');
    return { code, enabled: Boolean(coupon.enabled), kind: coupon.kind, value: number(coupon, 'value', 1, coupon.kind === 'percent' ? 100 : 100000), maxDiscount: number(coupon, 'maxDiscount', 1, 100000), minSubtotal: number(coupon, 'minSubtotal', 0, 1000000), firstOrderOnly: Boolean(coupon.firstOrderOnly), perMobileLimit: number(coupon, 'perMobileLimit', 1, 100), expires, eligibleTypes, excludeDiscounted: Boolean(coupon.excludeDiscounted) };
  });
  return rules;
}
