export const ORDER_FILE_RULES = Object.freeze({ maxFileBytes: 20 * 1024 * 1024, maxOrderBytes: 250 * 1024 * 1024, maxFiles: 50, accept: '.jpg,.jpeg,.png,.webp,.pdf' });
export function originalReferences(items = []) {
  const references = new Map();
  const add = (id, name, label) => { if (id && !references.has(id)) references.set(id, { id, name: name || 'Original photo', label }); };
  for (const [index, item] of items.entries()) {
    const label = `Item ${index + 1} · ${item.title}`;
    add(item.originalId, item.photoName, label);
    for (const [photoIndex, photo] of (item.photos || []).entries()) add(photo.assetId, photo.name, `${label} · Photo ${photoIndex + 1}`);
    add(item.configuration?.photo?.originalId, item.configuration?.photo?.name, `${label} · Card photo`);
    for (const slot of item.configuration?.slots || []) add(slot.photo?.originalId, slot.photo?.name, `${label} · Frame ${slot.index + 1}`);
  }
  return [...references.values()];
}
