import { PRINT_FINISHES, PRINT_SIZES } from '../utils/photoPrints';

export const PRINTING_SERVICES = [
  { id: 'pvc', name: 'PVC cards', title: 'PVC Card Printing', kicker: 'SMALL FORMAT. A SMART IMPRESSION.', headline: 'Your details.\nA card of your own.', description: 'Personal, membership or business cards. Tell us what belongs on the front, what goes on the back and how many you need.', short: 'Personal, membership & business cards, made around your brief.', features: ['Single or double sided', '86 × 54 mm coated PVC', 'Artwork & layout help'], prompt: 'Names or text to include, card purpose, colours and any design references…', related: null },
  { id: 'posters', name: 'Photo posters', title: 'Photo & Poster Printing', kicker: 'MAKE A LITTLE MORE ROOM FOR YOUR IDEA.', headline: 'A favourite moment.\nA bigger impression.', description: 'A photo for your wall, an art print or a poster for your next project. Start with a size and tell us how you want it to feel.', short: 'Photos, artwork & promotional posters in the size you need.', features: ['A-series & custom sizes', 'Portrait or landscape', 'Photo & promotional artwork'], prompt: 'What is the poster for? Tell us about your photograph, artwork, text or preferred look…', related: { to: '/photo-prints', label: 'Print standard photos online', note: 'For regular photo sizes with live previews and listed prices.' } },
  { id: 'dua', name: 'Dua posters', title: 'Custom Dua Poster Printing', kicker: 'MEANINGFUL WORDS. A PERSONAL PRESENTATION.', headline: 'Words that matter.\nA place of their own.', description: 'Choose an original design from our collection or discuss a personal layout. Request your size, presentation and quantity in one clear brief.', short: 'Original dua designs or a personal layout, with or without a frame.', features: ['Original design collection', 'Print only or with a frame', 'Personal size & layout requests'], prompt: 'Design reference, exact text you will provide, preferred colours and any framing requests…', related: { to: '/dua-posters', label: 'Explore the original dua collection', note: 'Choose a ready-made design with listed print and frame options.' } },
  { id: 'bulk', name: 'Bulk photo prints', title: 'Bulk Photo Printing', kicker: 'MORE MOMENTS. ONE THOUGHTFUL ORDER.', headline: 'A whole collection.\nBeautifully in print.', description: 'Family albums, events, gifts or a bigger photo project. Tell us how many photographs you have and how many copies of each you need.', short: 'Albums, events & larger photo projects, clearly organised.', features: ['Photos × copies made clear', 'Photo sizes & paper finishes', 'Mixed requirements welcome'], prompt: 'Album, event or gifting project? Note mixed sizes, different copy counts or special requirements…', related: { to: '/photo-prints', label: 'Open the photo print studio', note: `For standard orders, choose your photos and see prices from ₹${PRINT_SIZES[0].price} per print.` } },
  { id: 'design', name: 'Custom design & printing', title: 'Design & Printing', kicker: 'FROM A LITTLE IDEA TO THE FINISHED PRINT.', headline: 'Bring the idea.\nWe’ll help shape it.', description: 'A fresh layout, a design that needs refining or something you have in mind but not on paper yet. Share your reference and the print you need.', short: 'Layout help, design refinements & printing for your next idea.', features: ['New layouts & refinements', 'Cards, posters & print projects', 'Reference-led enquiries'], prompt: 'What would you like to create? Include the text, theme, colours and where the print will be used…', related: { to: '/#custom-frames', label: 'Need a custom frame, too?', note: 'See custom frame and print examples from the studio.' } },
];

const A_SIZES = [
  { id: 'A5', label: 'A5', cm: [14.8,21] }, { id: 'A4', label: 'A4', cm: [21,29.7] },
  { id: 'A3', label: 'A3', cm: [29.7,42] }, { id: 'A2', label: 'A2', cm: [42,59.4] }, { id: 'A1', label: 'A1', cm: [59.4,84.1] },
];

export const PRINTING_SIZES = {
  pvc: [{ id: 'wallet', label: 'Standard wallet card' }],
  posters: A_SIZES,
  dua: A_SIZES,
  bulk: PRINT_SIZES.map(size => ({ id: size.id, label: size.name, cm: size.mm.map(mm => Number((mm / 10).toFixed(1))) })),
  design: [{ id: 'wallet', label: 'Standard card layout' }, ...A_SIZES],
};

export const PRINTING_OPTIONS = {
  artwork: [{ value: 'advise', label: 'Help me decide' }, { value: 'ready', label: 'I have artwork / photos ready' }, { value: 'refine', label: 'My existing design needs refining' }, { value: 'new', label: 'I need help with a new layout' }],
  finish: [{ value: 'advise', label: 'Help me choose' }, ...PRINT_FINISHES.map(item => ({ value: item.id, label: item.name }))],
  cardFinish: [{ value: 'advise', label: 'Help me choose' }, { value: 'gloss', label: 'Gloss preference' }, { value: 'matte', label: 'Matte preference' }],
  purpose: [{ value: 'personal', label: 'Personal / membership' }, { value: 'business', label: 'Business / loyalty' }, { value: 'event', label: 'Staff / event' }, { value: 'other', label: 'Something else' }],
  posterUse: [{ value: 'photo', label: 'A photograph' }, { value: 'art', label: 'Artwork / art print' }, { value: 'promotion', label: 'A promotional poster' }],
  duaSource: [{ value: 'collection', label: 'An original collection design' }, { value: 'own', label: 'I have a design / artwork' }, { value: 'custom', label: 'I need a personal layout' }],
  presentation: [{ value: 'print', label: 'Print only' }, { value: 'framed', label: 'With a frame' }, { value: 'advise', label: 'Help me choose' }],
  border: [{ value: 'borderless', label: 'Borderless' }, { value: 'white', label: 'White border' }, { value: 'advise', label: 'Help me choose' }],
  project: [{ value: 'poster', label: 'Poster / art print' }, { value: 'card', label: 'Card / invitation layout' }, { value: 'photo', label: 'Photo layout' }, { value: 'other', label: 'Something else' }],
  delivery: [{ value: 'discuss', label: 'Discuss with the studio' }, { value: 'pickup', label: 'Collect from the Lucknow studio' }, { value: 'delivery', label: 'Delivery required' }],
};

export function getPrintingService(value) {
  return PRINTING_SERVICES.find(service => service.id === value || service.name === value) || null;
}

export function printingServicePath(service) {
  return service.id === 'pvc' ? '/pvc-cards' : `/printing-services?service=${encodeURIComponent(service.name)}`;
}

export function createPrintingDraft(service) {
  return { quantity: '1', photoCount: '10', copies: '5', sizeId: service.id === 'pvc' ? 'wallet' : 'advise', width: '', height: '', unit: 'cm', orientation: service.id === 'pvc' ? 'landscape' : 'portrait', sides: 'single', finish: 'advise', purpose: 'personal', posterUse: 'photo', duaSource: 'collection', designId: '', presentation: 'print', frameId: '', border: 'borderless', project: 'poster', artwork: 'advise', delivery: 'discuss', deadline: '', details: '' };
}
