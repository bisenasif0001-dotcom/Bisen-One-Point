// Old or damaged browser data must not prevent the storefront from opening.
export function readSavedCart(storage) {
  try {
    const value = JSON.parse((storage || globalThis.localStorage)?.getItem('alnoor_cart') || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter(item => item && typeof item === 'object' && typeof item.id === 'string'
      && Number.isSafeInteger(item.quantity) && item.quantity > 0
      && Number.isFinite(item.price) && item.price >= 0);
  } catch {
    return [];
  }
}
