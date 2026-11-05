export const GALLERY_LAYOUTS = [
  { id: 'classic-trio', name: 'The Classic Trio', framesCount: 3, framesLabel: '3 Frames', startingPrice: 2499, layoutType: 'A classic triptych', idealSpan: '130–180 cm', dimensions: '3 × A3', description: 'Three favourite moments. One calm, balanced line.', roomImage: '/rooms/size-guide/console-v2.webp', slots: [
    { sizeId: 'A3', orientation: 'portrait', label: 'Left', sample: 'bride' },
    { sizeId: 'A3', orientation: 'portrait', label: 'Centre', sample: 'couple' },
    { sizeId: 'A3', orientation: 'portrait', label: 'Right', sample: 'groom' },
  ] },
  { id: 'family-wall', name: 'The Family Wall', framesCount: 5, framesLabel: '5 Frames', startingPrice: 3999, layoutType: 'A centrepiece with four companions', idealSpan: '150–210 cm', dimensions: '1 × A2 + 4 × A4', description: 'A standout centrepiece, with room for the little moments around it.', roomImage: '/rooms/size-guide/living-v2.webp', slots: [
    { sizeId: 'A2', orientation: 'portrait', label: 'Centre', sample: 'couple' },
    { sizeId: 'A4', orientation: 'portrait', label: 'Top left', sample: 'bride' },
    { sizeId: 'A4', orientation: 'portrait', label: 'Bottom left', sample: 'groom-accessories' },
    { sizeId: 'A4', orientation: 'portrait', label: 'Top right', sample: 'groom' },
    { sizeId: 'A4', orientation: 'portrait', label: 'Bottom right', sample: 'bride-accessories' },
  ] },
  { id: 'wedding-salon', name: 'The Wedding Salon', framesCount: 7, framesLabel: '7 Frames', startingPrice: 5799, layoutType: 'An editorial arrangement in two rows', idealSpan: '180–240 cm', dimensions: '1 × A2 + 2 × A3 + 4 × A4', description: 'The big moment and all the beautiful details that made it yours.', roomImage: '/rooms/size-guide/bedroom-v2.webp', slots: [
    { sizeId: 'A2', orientation: 'landscape', label: 'Top centre', sample: 'couple' },
    { sizeId: 'A3', orientation: 'portrait', label: 'Top left', sample: 'bride' },
    { sizeId: 'A3', orientation: 'portrait', label: 'Top right', sample: 'groom' },
    { sizeId: 'A4', orientation: 'landscape', label: 'Lower row · 1', sample: 'groom-accessories' },
    { sizeId: 'A4', orientation: 'landscape', label: 'Lower row · 2', sample: 'bride' },
    { sizeId: 'A4', orientation: 'landscape', label: 'Lower row · 3', sample: 'groom' },
    { sizeId: 'A4', orientation: 'landscape', label: 'Lower row · 4', sample: 'bride-accessories' },
  ] },
  { id: 'memory-grid', name: 'The Memory Grid', framesCount: 9, framesLabel: '9 Frames', startingPrice: 7499, layoutType: 'A balanced 3 × 3 grid', idealSpan: '160–220 cm', dimensions: '9 × A4', description: 'Nine chapters, neatly together. For family days, travels and everything between.', roomImage: '/rooms/size-guide/living-v2.webp', slots: Array.from({ length: 9 }, (_, i) => ({ sizeId: 'A4', orientation: 'portrait', label: `Row ${Math.floor(i / 3) + 1} · Column ${i % 3 + 1}`, sample: ['bride', 'couple', 'groom', 'bride-accessories', 'couple', 'groom-accessories', 'groom', 'bride', 'couple'][i] })),
  },
];

export const GALLERY_WALL_DATA = GALLERY_LAYOUTS;
export const GALLERY_ROOMS = [
  { id: 'living', name: 'Living room', image: '/rooms/size-guide/living-v2.webp', alt: 'A linen sofa beneath a clear, warmly lit wall', centerX: .51, centerY: .265 },
  { id: 'console', name: 'Console', image: '/rooms/size-guide/console-v2.webp', alt: 'A walnut console beneath a sunlit plaster wall', centerX: .5, centerY: .29 },
  { id: 'bedroom', name: 'Bedroom', image: '/rooms/size-guide/bedroom-v2.webp', alt: 'A calm bedroom with space for a gallery above the headboard', centerX: .5, centerY: .285 },
];

export const GALLERY_DEFAULTS = { frameId: 'regal_aurelia', roomId: 'living', photoMode: 'now', tone: 'original' };

export function getGalleryLayout(id) {
  return GALLERY_LAYOUTS.find(layout => layout.id === id) || GALLERY_LAYOUTS[1];
}
