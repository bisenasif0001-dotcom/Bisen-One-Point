import { FRAME_SIZES, FRAME_FINISHES, MAT_OPTIONS, GLASS_OPTIONS } from '../data/products.js';
import { FRAME_PREVIEW_APERTURES } from '../data/framePreviewApertures.js';

// Keep the size guide and the custom frame builder on the same supported sizes.
export const CUSTOM_FRAME_SIZES = [
  ...FRAME_SIZES.slice(0, 3),
  {
    id: '12x18',
    name: '12 × 18 inches',
    dimensionsCm: '30.48 x 45.72 cm',
    dimensionsInch: '12.0 x 18.0 in',
    bestFor: 'Portrait photography, wall displays and gifts',
    basePrice: 1199,
    multiplier: 2,
    aspectRatio: '2/3',
    scaleRatio: 0.9,
  },
  ...FRAME_SIZES.slice(3),
];

export const STUDIO_MAX_FILE_BYTES = 20 * 1024 * 1024;
export const STUDIO_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const STUDIO_FILTERS = [
  { id: 'original', label: 'Original', css: 'none' },
  { id: 'mono', label: 'Black & white', css: 'grayscale(1)' },
  { id: 'warm', label: 'Warm', css: 'sepia(.18) saturate(1.12)' },
  { id: 'sepia', label: 'Sepia', css: 'sepia(.7)' },
];

export function validateStudioFile(file) {
  if (!file || !STUDIO_FILE_TYPES.includes(file.type)) return 'Please choose a JPG, PNG or WebP image. Convert HEIC photos to JPG first.';
  if (file.size === 0) return 'This image file is empty. Please choose another photo.';
  if (file.size > STUDIO_MAX_FILE_BYTES) return 'This photo is larger than 20 MB. Please choose a JPG, PNG or WebP under 20 MB.';
  return '';
}

export function getFrameGeometry(frameId, orientation = 'portrait') {
  const opening = FRAME_PREVIEW_APERTURES[frameId];
  if (!opening) return null;
  if (orientation === 'landscape') return {
    width: 1402, height: 1122,
    opening: { x: 1402 - opening.y - opening.height, y: opening.x, width: opening.height, height: opening.width },
    frameTransform: 'translate(1402 0) rotate(90)',
  };
  return { width: 1122, height: 1402, opening, frameTransform: undefined };
}

// Keep aspect ratio and clamp the pan to the actual overflow, so no blank edges appear in Fill mode.
export function placeStudioPhoto({ photoWidth, photoHeight, width, height, fit = 'contain', panX = 50, panY = 50 }) {
  if (![photoWidth, photoHeight, width, height].every(v => Number.isFinite(v) && v > 0)) return null;
  const scale = (fit === 'cover' ? Math.max : Math.min)(width / photoWidth, height / photoHeight);
  const imageWidth = photoWidth * scale;
  const imageHeight = photoHeight * scale;
  const x = (width - imageWidth) * (fit === 'cover' ? Math.max(0, Math.min(100, panX)) / 100 : .5);
  const y = (height - imageHeight) * (fit === 'cover' ? Math.max(0, Math.min(100, panY)) / 100 : .5);
  return { x, y, width: imageWidth, height: imageHeight };
}

export function getStudioPrice({ sizeId, frameId, glassId, quantity = 1 }) {
  const size = CUSTOM_FRAME_SIZES.find(s => s.id === sizeId);
  const frame = FRAME_FINISHES.find(f => f.id === frameId);
  const glass = GLASS_OPTIONS.find(g => g.id === glassId);
  if (!size || !frame || !glass || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
  // Retain the existing builder prices, including its default studio mount.
  const mount = MAT_OPTIONS[0];
  const unit = size.basePrice + frame.extraPrice + mount.extra + glass.extra;
  return { base: size.basePrice, frame: frame.extraPrice, mount: mount.extra, glass: glass.extra, unit, total: unit * quantity };
}

export function getStudioQuality({ photoWidth, photoHeight, sizeId, orientation = 'portrait', fit = 'contain' }) {
  const size = CUSTOM_FRAME_SIZES.find(s => s.id === sizeId);
  if (!size || !photoWidth || !photoHeight) return null;
  const [a, b] = size.dimensionsCm.split(' x ').map(v => parseFloat(v) / 2.54);
  const [w, h] = orientation === 'landscape' ? [b, a] : [a, b];
  const dpi = Math.round((fit === 'cover' ? Math.min : Math.max)(photoWidth / w, photoHeight / h));
  return { dpi, level: dpi >= 240 ? 'good' : dpi >= 150 ? 'fair' : 'low', label: dpi >= 240 ? 'Good detail for this size' : dpi >= 150 ? 'Suitable for normal viewing distance' : 'A smaller size or higher-resolution photo will look sharper' };
}

export function measureStudioImage(url) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('This image cannot be opened. Please export it as a JPG or PNG and try again.'));
    image.src = url;
  });
}

export async function readStudioPhoto(file) {
  const error = validateStudioFile(file);
  if (error) throw new Error(error);
  const url = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('This photo could not be read. Please try another file.'));
    reader.readAsDataURL(file);
  });
  const dimensions = await measureStudioImage(url);
  return { id: `frame-photo-${crypto.randomUUID()}`, file, url, name: file.name, ...dimensions, isSample: false };
}
