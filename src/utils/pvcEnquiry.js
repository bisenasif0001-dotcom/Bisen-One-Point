import { getPvcProduct, getPvcType, PVC_SPEC } from '../data/pvcCards';

export const PVC_QUANTITIES = [1, 5, 10, 25, 50, 100];
export const PVC_ACCESSORIES = [
  { id: 'none', label: 'Card only' },
  { id: 'holder', label: 'Card holder' },
  { id: 'lanyard', label: 'Lanyard' },
  { id: 'both', label: 'Holder + lanyard' },
];

export function createPvcDraft(product, { bulk = false, type } = {}) {
  const purpose = getPvcType(type);
  return { productId: product.id, type: purpose?.productId === product.id ? purpose.id : product.defaultType, order: bulk ? 'bulk' : 'single', quantity: bulk ? '25' : '1', sides: 'single', design: 'upload', orientation: product.orientation, accessories: 'none', name: '', organisation: '', notes: '' };
}

export function validatePvcDraft(draft) {
  const errors = {};
  const product = getPvcProduct(draft.productId);
  const type = getPvcType(draft.type);
  if (!product) errors.productId = 'Choose a card from the PVC collection.';
  if (!type || type.productId !== product?.id) errors.type = 'Choose a card purpose for this product.';
  if (!['single', 'bulk'].includes(draft.order)) errors.order = 'Choose a single card or a bulk enquiry.';
  if (!/^\d+$/.test(String(draft.quantity)) || !Number.isSafeInteger(Number(draft.quantity)) || Number(draft.quantity) < 1 || Number(draft.quantity) > 100000) errors.quantity = 'Enter a whole number from 1 to 100,000 cards.';
  else if (draft.order === 'single' && Number(draft.quantity) !== 1) errors.quantity = 'Choose Bulk enquiry for more than one card.';
  if (!['single', 'double'].includes(draft.sides)) errors.sides = 'Choose the printed sides.';
  if (!['upload', 'design'].includes(draft.design)) errors.design = 'Choose your artwork option.';
  if (!['portrait', 'landscape'].includes(draft.orientation)) errors.orientation = 'Choose a card orientation.';
  if (!PVC_ACCESSORIES.some(item => item.id === draft.accessories)) errors.accessories = 'Choose an accessories option.';
  if (!String(draft.name || '').trim() || draft.name.trim().length > 100) errors.name = 'Enter your contact name (up to 100 characters).';
  if (String(draft.organisation || '').length > 150) errors.organisation = 'Keep the organisation name within 150 characters.';
  if (String(draft.notes || '').length > 2000) errors.notes = 'Keep your notes within 2,000 characters.';
  return errors;
}

export function validatePvcFile(file) {
  if (!file) return '';
  if (!/\.(pdf|png|jpe?g|webp)$/i.test(file.name) || !['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return 'Choose a PDF, JPG, PNG or WebP design.';
  if (!file.size || file.size > 20 * 1024 * 1024) return 'Choose a non-empty file up to 20 MB.';
  return '';
}

export function pvcEnquiryRows(draft, files = {}) {
  const product = getPvcProduct(draft.productId);
  const fileNames = draft.design === 'upload' ? [files.front?.name && `Front: ${files.front.name}`, draft.sides === 'double' && files.back?.name && `Back: ${files.back.name}`].filter(Boolean) : [];
  return [
    { label: 'Product', value: product?.title || 'PVC card' },
    { label: 'Card purpose', value: getPvcType(draft.type)?.label || 'To discuss' },
    { label: 'Order', value: `${draft.order === 'bulk' ? 'Bulk enquiry' : 'Single card'} · ${Number(draft.quantity).toLocaleString('en-IN')} ${Number(draft.quantity) === 1 ? 'card' : 'cards'}` },
    { label: 'Printing side', value: draft.sides === 'double' ? 'Both sides (front + back)' : 'Single side (front only)' },
    { label: 'Layout', value: draft.orientation === 'portrait' ? 'Vertical · 54 × 86 mm' : 'Horizontal · 86 × 54 mm' },
    { label: 'Material', value: `${PVC_SPEC.thickness} · ${PVC_SPEC.material}` },
    { label: 'Design', value: draft.design === 'design' ? 'Get it designed by the studio' : 'My own design · I will share the original files on WhatsApp' },
    ...(fileNames.length ? [{ label: 'Selected on my device', value: fileNames.join('\n') }] : []),
    { label: 'Accessories', value: PVC_ACCESSORIES.find(item => item.id === draft.accessories)?.label || 'To discuss' },
    { label: 'Contact name', value: draft.name.trim() },
    ...(draft.organisation.trim() ? [{ label: 'Organisation', value: draft.organisation.trim() }] : []),
    ...(draft.notes.trim() ? [{ label: 'Notes', value: draft.notes.trim() }] : []),
  ];
}

export function buildPvcMessage(draft, files = {}) {
  return ['Hello AL-NOOR! I would like a quote for PVC card printing.', '', ...pvcEnquiryRows(draft, files).map(row => `${row.label}: ${row.value}`), '', 'I will attach my original artwork / photos and any batch list in this chat. Files selected on the website are not sent automatically.', 'Please confirm the design proof, accessories availability, final price, payment and collection / delivery timing before printing.'].join('\n');
}
