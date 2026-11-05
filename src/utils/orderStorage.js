/** Saved checkout requests. Studio/payment/dispatch confirmation happens on WhatsApp. */
const STORAGE_KEY = 'alnoor_orders';
export const ORDER_STORAGE_EVENT = 'alnoor:orders-changed';

export const ORDER_STAGES = [
  { step: 0, id: 'saved', title: 'Request saved', description: 'Your items and contact details are saved on this device.' },
  { step: 1, id: 'confirmation', title: 'Studio confirmation', description: 'Confirm the artwork, final amount and payment with the studio.' },
  { step: 2, id: 'making', title: 'Printing & making', description: 'The studio shares progress after your order is confirmed.' },
  { step: 3, id: 'dispatch', title: 'Ready for collection / dispatch', description: 'The studio confirms collection or shares courier tracking.' },
  { step: 4, id: 'complete', title: 'Order completed', description: 'Delivery or collection is confirmed with the studio.' },
];

export function normaliseOrderId(value) {
  return String(value || '').trim().replace(/^#+\s*/, '').replace(/\s*-\s*/g, '-').toUpperCase();
}

export function normaliseOrderPhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}

export function parseOrderSearch(value) {
  const input = String(value || '').trim();
  if (!input) return { error: 'Enter your order reference or the mobile number used at checkout.' };
  if (input.length > 80) return { error: 'Check the reference or enter your 10-digit mobile number.' };
  const id = normaliseOrderId(input);
  if (/^ALN-(?:[A-F0-9]{12}|(?:WA-)?\d{6})$/.test(id)) return { type: 'id', value: id };
  if (/^[+\d\s().-]+$/.test(input)) {
    const phone = normaliseOrderPhone(input);
    if (phone) return { type: 'phone', value: phone };
  }
  return { error: 'Use your full reference (ALN-123456 or ALN-WA-123456), or your 10-digit mobile number.' };
}

export const orderMoneyValue = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
export const orderPaymentLabel = method => ({ whatsapp: 'Confirm on WhatsApp', upi_qr: 'UPI', card: 'Card', netbanking: 'Net banking', cod: 'Pay on delivery' }[method] || 'Confirm with the studio');

export function normaliseStoredOrder(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const orderId = normaliseOrderId(raw.orderId || raw.id);
  if (!/^ALN-(?:WA-)?\d{6}$/.test(orderId)) return null;
  const date = raw.placedAt && !Number.isNaN(Date.parse(raw.placedAt)) ? new Date(raw.placedAt).toISOString() : null;
  const customer = raw.customer && typeof raw.customer === 'object' ? raw.customer : {};
  const items = Array.isArray(raw.items) ? raw.items.filter(item => item && typeof item === 'object' && !Array.isArray(item)).map(item => ({
    ...item,
    title: typeof item.title === 'string' && item.title.trim() ? item.title : 'Personalised item',
    price: orderMoneyValue(item.price),
    quantity: Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0 ? Number(item.quantity) : null,
  })) : [];
  const method = raw.paymentMethod || raw.payment?.method || 'whatsapp';
  return {
    id: `#${orderId}`, orderId: `#${orderId}`, schemaVersion: 2, source: 'browser',
    placedAt: date, items,
    subtotal: orderMoneyValue(raw.subtotal), discountAmount: orderMoneyValue(raw.discountAmount) ?? 0,
    discountCode: typeof raw.discountCode === 'string' ? raw.discountCode : '',
    shippingFee: orderMoneyValue(raw.shippingFee), grandTotal: orderMoneyValue(raw.grandTotal),
    customer: Object.fromEntries(['name','phone','email','address','apartment','city','state','pincode'].map(key => [key, typeof customer[key] === 'string' ? customer[key] : ''])),
    payment: { method, status: method === 'cod' ? 'Pay on delivery · confirm with studio' : 'Awaiting studio verification', isPaid: false },
    delivery: { speed: raw.deliverySpeed || raw.delivery?.speed || 'standard', courier: null, awb: null, estimatedArrival: null },
    currentStageStep: 0, statusLabel: 'Awaiting studio confirmation',
  };
}

export function readOrderStore(storage) {
  try {
    const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
    if (!store) return { orders: [], status: typeof window === 'undefined' ? 'ready' : 'unavailable' };
    const value = store.getItem(STORAGE_KEY);
    if (!value) return { orders: [], status: 'ready' };
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return { orders: [], status: 'invalid' };
    const records = parsed.map(normaliseStoredOrder).filter(Boolean);
    const unique = new Map();
    for (const order of records) if (!unique.has(order.orderId)) unique.set(order.orderId, order);
    const orders = [...unique.values()].sort((a,b) => (Date.parse(b.placedAt) || 0) - (Date.parse(a.placedAt) || 0));
    return { orders, status: records.length !== parsed.length ? 'partial' : 'ready' };
  } catch { return { orders: [], status: 'unavailable' }; }
}

export function getStoredOrders(storage) { return readOrderStore(storage).orders; }

export function savePlacedOrder(order, storage) {
  const record = normaliseStoredOrder({ ...order, placedAt: order.placedAt || new Date().toISOString() });
  if (!record) return null;
  try {
    const store = storage ?? window.localStorage;
    const existing = readOrderStore(store);
    // Keep a damaged history intact rather than silently replacing it.
    if (existing.status !== 'ready') return { ...record, persisted: false };
    store.setItem(STORAGE_KEY, JSON.stringify([record, ...existing.orders.filter(saved => saved.orderId !== record.orderId)]));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(ORDER_STORAGE_EVENT));
    return { ...record, persisted: true };
  } catch { return { ...record, persisted: false }; }
}

export function findOrders(query, orders = getStoredOrders()) {
  const parsed = parseOrderSearch(query);
  if (parsed.error) return [];
  return orders.filter(order => parsed.type === 'id' ? normaliseOrderId(order.orderId || order.id) === parsed.value : normaliseOrderPhone(order.customer?.phone) === parsed.value);
}

export function findOrder(query) { return findOrders(query)[0] || null; }

export function buildOrderStatusMessage(reference = '') {
  const parsed = parseOrderSearch(reference);
  const identifier = parsed.type === 'id' ? `Order reference: #${parsed.value}` : parsed.type === 'phone' ? `Checkout mobile: ${parsed.value}` : '';
  return ['Hello AL-NOOR! Please share an update on my order.', identifier, '', 'Please confirm the current status, payment verification and the expected collection or dispatch date. If dispatched, please share the courier tracking link.'].filter((line,index) => line || index > 1).join('\n');
}
