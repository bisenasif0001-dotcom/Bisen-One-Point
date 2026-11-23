import { GALLERY_LAYOUTS } from '../data/galleryWalls.js';

export const SHIPPING_POLICY = {
  lucknowPincodePattern: /^226\d{3}$/,
  porterRates: {
    print_only: 59,
    A5: 69,
    A4: 79,
    A3: 99,
    '12x18': 99,
    '13x19': 99,
    '15x21': 129,
    '16x22': 129,
    A2: 149,
    A1: 249,
    extraFrameFee: 20,
  },
  courierRates: {
    print_only: 69,
    A5: 79,
    A4: 99,
    A3: 149,
    '12x18': 159,
    '13x19': 169,
    '15x21': 229,
    '16x22': 249,
    A2: 279,
    A1: 599,
    extraFrameFeeStandard: 40,
    extraFrameFeeLarge: 80,
    extraFrameFeeOversize: 350,
  },
  freeDeliveryThresholds: {
    printOnly: 799,
    frames: 1999,
  },
};

export function isLucknowPincode(pincode = '') {
  return SHIPPING_POLICY.lucknowPincodePattern.test(String(pincode || '').trim());
}

export function formatFrameSizeLabel(sizeId) {
  if (!sizeId) return '';
  if (['12x18', '13x19', '15x21', '16x22'].includes(sizeId)) {
    return `${sizeId.replace('x', ' × ')} in`;
  }
  return sizeId;
}

function extractFrameSizes(items = []) {
  const frames = [];
  for (const item of items) {
    const qty = Number.isInteger(item?.quantity) && item.quantity > 0 ? item.quantity : 1;
    if (item?.type === 'custom_frame') {
      const sz = item.size || 'A4';
      for (let i = 0; i < qty; i++) frames.push(sz);
    } else if ((item?.type === 'dua_poster' || item?.type === 'islamic_art') && Boolean(item?.frameId)) {
      const sz = item.size || 'A4';
      for (let i = 0; i < qty; i++) frames.push(sz);
    } else if (item?.type === 'gallery_wall') {
      const layout = GALLERY_LAYOUTS.find(entry => entry.id === item.configuration?.layoutId);
      const slotSizes = layout?.slots?.map(slot => slot.sizeId) || ['A3', 'A3', 'A3'];
      for (let i = 0; i < qty; i++) frames.push(...slotSizes);
    }
  }
  return frames;
}

function extraFrameCourierFee(sizeId) {
  if (sizeId === 'A1') return SHIPPING_POLICY.courierRates.extraFrameFeeOversize;
  if (['15x21', '16x22', 'A2'].includes(sizeId)) return SHIPPING_POLICY.courierRates.extraFrameFeeLarge;
  return SHIPPING_POLICY.courierRates.extraFrameFeeStandard;
}

/**
 * Computes delivery charges automatically using fulfillment, PIN code (Lucknow Porter vs Pan-India Courier),
 * physical frame footprint (with multi-frame combo consolidation), and free-delivery thresholds.
 */
export function calculateShipping({ items = [], subtotal = 0, discountAmount = 0, fulfillment = 'courier', pincode = '', rules } = {}) {
  if (fulfillment === 'pickup') {
    return {
      fee: 0,
      zone: 'pickup',
      provider: 'Lucknow Studio Pickup',
      label: 'Free pickup (Kursi Road, Lucknow)',
      freeDeliveryApplied: false,
      confirmed: true,
    };
  }

  if (!Array.isArray(items) || !items.length || items.some(item => item?.price === null || item?.price === undefined)) {
    return {
      fee: null,
      zone: 'quote',
      provider: 'Studio Quote',
      label: 'Quote confirmed by studio',
      freeDeliveryApplied: false,
      confirmed: false,
    };
  }

  const normalizedPin = String(pincode || '').trim();
  if (!/^[1-9]\d{5}$/.test(normalizedPin)) {
    return {
      fee: null,
      zone: 'pending_pincode',
      provider: '',
      label: 'Enter 6-digit PIN code',
      freeDeliveryApplied: false,
      confirmed: false,
    };
  }

  const isLucknow = isLucknowPincode(normalizedPin);
  const netSubtotal = Math.max(0, Number(subtotal || 0) - Number(discountAmount || 0));
  const frames = extractFrameSizes(items);

  if (frames.length === 0) {
    const baseFee = isLucknow ? SHIPPING_POLICY.porterRates.print_only : SHIPPING_POLICY.courierRates.print_only;
    const printFreeThreshold = rules?.shipping?.printFreeThreshold ?? rules?.shipping?.freeThreshold ?? SHIPPING_POLICY.freeDeliveryThresholds.printOnly;
    const free = netSubtotal >= printFreeThreshold;
    return {
      fee: free ? 0 : baseFee,
      zone: isLucknow ? 'lucknow_porter' : 'pan_india_courier',
      provider: isLucknow ? 'Porter (Lucknow Local)' : 'Pan-India Courier',
      label: free
        ? `Free delivery (₹${printFreeThreshold.toLocaleString('en-IN')}+ print & gift order)`
        : isLucknow
          ? 'Porter local delivery (Lucknow)'
          : 'Pan-India courier (protective flat/tube pack)',
      freeDeliveryApplied: free,
      confirmed: true,
    };
  }

  const hasA1 = frames.includes('A1');
  const table = isLucknow ? SHIPPING_POLICY.porterRates : SHIPPING_POLICY.courierRates;
  const sorted = [...frames].sort((a, b) => (table[b] ?? table.A4) - (table[a] ?? table.A4));
  const primaryFee = table[sorted[0]] ?? table.A4;
  const extraFee = sorted.slice(1).reduce(
    (sum, sizeId) => sum + (isLucknow ? SHIPPING_POLICY.porterRates.extraFrameFee : extraFrameCourierFee(sizeId)),
    0,
  );
  const rawFee = primaryFee + extraFee;
  const frameFreeThreshold = rules?.shipping?.frameFreeThreshold ?? SHIPPING_POLICY.freeDeliveryThresholds.frames;
  const free = !hasA1 && netSubtotal >= frameFreeThreshold;

  return {
    fee: free ? 0 : rawFee,
    zone: isLucknow ? 'lucknow_porter' : 'pan_india_courier',
    provider: isLucknow ? 'Porter (Lucknow Local)' : 'Pan-India Courier (Surface)',
    label: free
      ? `Free delivery (₹${frameFreeThreshold.toLocaleString('en-IN')}+ frame order)`
      : isLucknow
        ? 'Porter local delivery (Lucknow · Same/next-day)'
        : hasA1
          ? 'Pan-India heavy surface courier (A1 protective crate)'
          : 'Pan-India surface courier (5-ply protective box)',
    freeDeliveryApplied: free,
    confirmed: true,
  };
}

/**
 * Provides an immediate numeric delivery estimate even before a customer enters their 6-digit PIN code,
 * using Pan-India courier as the baseline while surfacing the lower Lucknow Porter rate.
 */
export function estimateShipping({ items = [], subtotal = 0, discountAmount = 0, fulfillment = 'courier', pincode = '', rules } = {}) {
  const result = calculateShipping({ items, subtotal, discountAmount, fulfillment, pincode, rules });
  if (result.confirmed || result.zone === 'quote') {
    return { ...result, estimated: false };
  }
  const lucknow = calculateShipping({ items, subtotal, discountAmount, fulfillment: 'courier', pincode: '226022', rules });
  const panIndia = calculateShipping({ items, subtotal, discountAmount, fulfillment: 'courier', pincode: '110001', rules });
  return {
    fee: panIndia.fee,
    lucknowFee: lucknow.fee,
    panIndiaFee: panIndia.fee,
    zone: 'estimated_courier',
    provider: panIndia.fee === 0 ? 'Free Delivery' : 'Delivery (Pan-India Est.)',
    label: panIndia.fee === 0
      ? panIndia.label
      : lucknow.fee !== panIndia.fee
        ? `Pan-India courier ₹${panIndia.fee} · Lucknow Porter ₹${lucknow.fee} (enter PIN code to confirm)`
        : `Standard delivery ₹${panIndia.fee} (enter PIN code to confirm)`,
    freeDeliveryApplied: panIndia.freeDeliveryApplied,
    confirmed: false,
    estimated: true,
  };
}
