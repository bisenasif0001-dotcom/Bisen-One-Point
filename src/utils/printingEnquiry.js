import { PRINTING_OPTIONS, PRINTING_SIZES } from '../data/printingServices';
import { DUA_POSTERS } from '../data/duaPosters';
import { FRAME_FINISHES } from '../data/products';

export function localPrintingDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function isPrintCount(value) { return /^\d+$/.test(String(value).trim()) && Number(value) >= 1 && Number(value) <= 100000; }

export function printingQuantity(service, draft) {
  return service.id === 'bulk' ? Number(draft.photoCount) * Number(draft.copies) : Number(draft.quantity);
}

export function printingQuantityLabel(service, draft) {
  const quantity = printingQuantity(service, draft);
  const unit = service.id === 'bulk' ? 'print' : service.id === 'pvc' ? 'card' : 'piece';
  return `${quantity.toLocaleString('en-IN')} ${unit}${quantity === 1 ? '' : 's'}`;
}

export function validatePrintingEnquiry(service, draft, today = localPrintingDate()) {
  const errors = {};
  if (!draft.name?.trim()) errors.name = 'Add your name so the studio knows who the enquiry is for.';
  else if (draft.name.trim().length > 100) errors.name = 'Use up to 100 characters for your name.';
  if (service.id === 'bulk') {
    if (!isPrintCount(draft.photoCount)) errors.photoCount = 'Enter a whole number of photographs, from 1 to 100,000.';
    if (!isPrintCount(draft.copies)) errors.copies = 'Enter a whole number of copies, from 1 to 100,000.';
    if (!errors.photoCount && !errors.copies && printingQuantity(service, draft) > 100000) errors.copies = 'Keep the total to 100,000 prints or fewer for this enquiry.';
  } else if (!isPrintCount(draft.quantity)) errors.quantity = 'Enter a whole quantity, from 1 to 100,000.';
  const sizes = PRINTING_SIZES[service.id] || [];
  if (!['advise','custom',...sizes.map(size => size.id)].includes(draft.sizeId)) errors.sizeId = 'Choose a size or ask the studio for advice.';
  if (draft.sizeId === 'custom') for (const key of ['width','height']) {
    const value = String(draft[key]).trim();
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) || Number(value) <= 0 || Number(value) > 10000) errors[key] = `Enter a ${key} greater than 0 and up to 10,000.`;
  }
  if (draft.sizeId === 'custom' && !['mm','cm','in'].includes(draft.unit)) errors.unit = 'Choose mm, cm or inches.';
  const choices = [['artwork','artwork'], ['delivery','delivery']];
  if (service.id === 'pvc') choices.push(['purpose','purpose'], ['finish','cardFinish']);
  if (service.id === 'posters') choices.push(['posterUse','posterUse'], ['finish','finish']);
  if (service.id === 'bulk') choices.push(['finish','finish'], ['border','border']);
  if (service.id === 'dua') choices.push(['duaSource','duaSource'], ['presentation','presentation']);
  if (service.id === 'design') choices.push(['project','project'], ['finish','finish']);
  for (const [key, options] of choices) if (!PRINTING_OPTIONS[options].some(option=>option.value===draft[key])) errors[key]='Choose one of the available options.';
  if (service.id === 'pvc' && !['single','double'].includes(draft.sides)) errors.sides='Choose front only or front & back.';
  if (draft.sizeId !== 'custom' && !(service.id === 'dua' && draft.duaSource === 'collection') && !['portrait','landscape'].includes(draft.orientation)) errors.orientation='Choose an orientation for your print.';
  if (draft.details.length > 2000) errors.details = 'Use up to 2,000 characters for your project notes.';
  if (service.id === 'design' && draft.project === 'other' && !draft.details.trim()) errors.details = 'Tell us briefly what you would like to create.';
  if (draft.designId && service.id === 'dua' && draft.duaSource === 'collection' && !DUA_POSTERS.some(poster => poster.id === draft.designId)) errors.designId = 'Choose a collection design or ask for help.';
  if (service.id === 'dua' && draft.presentation === 'framed' && draft.frameId && !FRAME_FINISHES.some(frame=>frame.id===draft.frameId)) errors.frameId='Choose a frame or ask the studio for advice.';
  if (draft.deadline) {
    const date = new Date(`${draft.deadline}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.deadline) || Number.isNaN(date.getTime()) || localPrintingDate(date) !== draft.deadline || draft.deadline < today) errors.deadline = 'Choose today or a future date. The studio will confirm availability.';
  }
  return errors;
}

const optionLabel = (key, value) => PRINTING_OPTIONS[key]?.find(option => option.value === value)?.label || 'Please advise';

export function printingSizeLabel(service, draft) {
  if (draft.sizeId === 'custom') return `${Number(draft.width)} × ${Number(draft.height)} ${draft.unit} (custom request)`;
  const size = PRINTING_SIZES[service.id]?.find(option => option.id === draft.sizeId);
  if (!size) return 'Please help me choose';
  const originalDua = service.id === 'dua' && draft.duaSource === 'collection';
  const sides = draft.orientation === 'landscape' && service.id !== 'pvc' && !originalDua ? [...(size.cm || [])].reverse() : size.cm;
  return size.label + (sides?.length ? ` · ${sides.join(' × ')} cm` : '');
}

/** The onscreen review and the WhatsApp brief share the same human-readable specification. */
export function printingEnquiryRows(service, draft) {
  const rows = [{ label: 'Service', value: service.title }];
  if (service.id === 'bulk') rows.push({ label: 'Photographs & copies', value: `${draft.photoCount} photos × ${draft.copies} copies = ${printingQuantity(service,draft).toLocaleString('en-IN')} prints` });
  else rows.push({ label: 'Quantity', value: printingQuantityLabel(service, draft) });
  if (service.id === 'pvc') rows.push({ label: 'Card purpose', value: optionLabel('purpose',draft.purpose) }, { label: 'Printed sides', value: draft.sides === 'double' ? 'Front & back' : 'Front only' });
  if (service.id === 'posters') rows.push({ label: 'Poster content', value: optionLabel('posterUse',draft.posterUse) });
  if (service.id === 'dua') {
    rows.push({ label: 'Design source', value: optionLabel('duaSource',draft.duaSource) });
    if (draft.duaSource === 'collection') rows.push({ label: 'Collection design', value: DUA_POSTERS.find(poster => poster.id === draft.designId)?.title || 'Please help me choose a design' });
    rows.push({ label: 'Presentation', value: optionLabel('presentation',draft.presentation) });
    if (draft.presentation === 'framed') {
      const frame = FRAME_FINISHES.find(frame => frame.id === draft.frameId);
      rows.push({ label: 'Frame preference', value: frame ? `${frame.name} · ${frame.finish}` : 'Please advise' });
    }
  }
  if (service.id === 'design') rows.push({ label: 'Project', value: optionLabel('project',draft.project) });
  rows.push({ label: 'Size', value: printingSizeLabel(service,draft) });
  const customOrientation = Number(draft.width) === Number(draft.height) ? 'Square' : Number(draft.width) > Number(draft.height) ? 'Landscape' : 'Portrait';
  rows.push({ label: 'Orientation', value: draft.sizeId === 'custom' ? `${customOrientation} · from custom dimensions` : service.id === 'pvc' ? (draft.orientation === 'portrait' ? 'Vertical card' : 'Horizontal card') : (service.id === 'dua' && draft.duaSource === 'collection') ? 'Portrait · original design' : draft.orientation === 'portrait' ? 'Portrait' : 'Landscape' });
  if (service.id === 'dua') rows.push({ label: 'Print finish', value: '250 GSM glossy for collection prints; discuss requirements for custom work' });
  else rows.push({ label: 'Finish preference', value: optionLabel(service.id === 'pvc' ? 'cardFinish' : 'finish',draft.finish) });
  if (service.id === 'bulk') rows.push({ label: 'Photo border', value: optionLabel('border',draft.border) });
  rows.push({ label: 'Artwork / design help', value: optionLabel('artwork',draft.artwork) }, { label: 'Collection / delivery', value: optionLabel('delivery',draft.delivery) });
  if (draft.deadline) rows.push({ label: 'Requested date', value: `${draft.deadline} · subject to availability` });
  if (draft.details.trim()) rows.push({ label: 'Project notes', value: draft.details.trim() });
  return rows;
}

export function buildPrintingMessage(service,draft) {
  return [`Hello AL-NOOR! I would like a printing quote.`, `Name: ${draft.name.trim()}`, '', ...printingEnquiryRows(service,draft).map(row=>`${row.label}: ${row.value}`), '', 'Please confirm the suitable material, artwork requirements, price and turnaround. I will share my artwork / original files in this conversation.'].join('\n');
}
