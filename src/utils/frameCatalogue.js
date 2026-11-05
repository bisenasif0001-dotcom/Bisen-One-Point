import { FRAME_FINISHES, GLASS_OPTIONS } from '../data/products.js';
import { CUSTOM_FRAME_SIZES, getStudioPrice } from './frameStudio.js';

export const CATALOGUE_FILTERS = [
  { id: 'all', label: 'All frames', category: null },
  { id: 'wood', label: 'Natural wood', category: 'Natural Solid Wood' },
  { id: 'modern', label: 'Modern & minimal', category: 'Modern & Minimalist' },
  { id: 'royal', label: 'Royal & antique', category: 'Royal & Antique Gold' },
];

export function getCataloguePrice(frameId, sizeId) {
  return getStudioPrice({ frameId, sizeId, glassId: GLASS_OPTIONS[0].id })?.unit ?? null;
}

export function getCatalogueFinishes({ category = 'all', sizeId = 'A5', sort = 'collection' } = {}) {
  if (!CUSTOM_FRAME_SIZES.some(size => size.id === sizeId)) return [];
  const filter = CATALOGUE_FILTERS.find(item => item.id === category);
  if (!filter) return [];
  const frames = FRAME_FINISHES.filter(frame =>
    (!filter.category || frame.category === filter.category) &&
    (sizeId === '12x18' || frame.availableSizes.includes(sizeId)),
  );
  if (sort === 'price-asc' || sort === 'price-desc') {
    frames.sort((a, b) => (getCataloguePrice(a.id, sizeId) - getCataloguePrice(b.id, sizeId)) * (sort === 'price-desc' ? -1 : 1));
  }
  return frames;
}

export function getCatalogueDimensions(sizeId, orientation = 'portrait') {
  const size = CUSTOM_FRAME_SIZES.find(item => item.id === sizeId);
  if (!size) return '';
  const sides = size.dimensionsCm.split(' x ').map(parseFloat);
  return `${(orientation === 'landscape' ? sides.reverse() : sides).join(' × ')} cm`;
}
