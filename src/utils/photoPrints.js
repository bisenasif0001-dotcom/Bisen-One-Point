export const PRINT_SIZES = [
  { id: '4x6', name: '4 × 6 in', dimensions: '10.2 × 15.2 cm', mm: [101.6, 152.4], price: 29, group: 'photo', use: 'Albums & everyday moments' },
  { id: '5x7', name: '5 × 7 in', dimensions: '12.7 × 17.8 cm', mm: [127, 177.8], price: 49, group: 'photo', use: 'Keepsakes & tabletop frames' },
  { id: '6x8', name: '6 × 8 in', dimensions: '15.2 × 20.3 cm', mm: [152.4, 203.2], price: 69, group: 'photo', use: 'Portraits & thoughtful gifts' },
  { id: '8x10', name: '8 × 10 in', dimensions: '20.3 × 25.4 cm', mm: [203.2, 254], price: 119, group: 'photo', use: 'A favourite photo, a little larger' },
  { id: 'A5', name: 'A5', dimensions: '14.8 × 21 cm', mm: [148, 210], price: 89, group: 'wall', use: 'Small art & desk displays' },
  { id: 'A4', name: 'A4', dimensions: '21 × 29.7 cm', mm: [210, 297], price: 179, group: 'wall', use: 'Artwork & wall displays' },
  { id: 'A3', name: 'A3', dimensions: '29.7 × 42 cm', mm: [297, 420], price: 349, group: 'wall', use: 'A statement on your wall' },
];

export const PRINT_FINISHES = [
  { id: 'lustre', name: 'Lustre', detail: 'Soft pearl sheen', description: 'A subtle sheen for everyday photos.', texture: 'pearl' },
  { id: 'gloss', name: 'Gloss', detail: 'Bright & reflective', description: 'A shiny finish with vivid colour.', texture: 'gloss' },
  { id: 'matte', name: 'Matte', detail: 'Soft, low-glare finish', description: 'An understated finish for art and portraits.', texture: 'matte' },
];

export const PRINT_TONES = [
  { id: 'original', name: 'Original', css: 'none' },
  { id: 'enhance', name: 'Enhanced', css: 'contrast(1.06) saturate(1.08)' },
  { id: 'mono', name: 'Black & white', css: 'grayscale(1)' },
];

export const DEFAULT_PRINT_CONFIG = { sizeId: '5x7', finishId: 'lustre', orientation: 'landscape', border: 'borderless', fit: 'contain', tone: 'original' };
export const MAX_PRINT_PHOTOS = 20;
export const MAX_PRINT_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_PRINT_COPIES = 99;
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export function validatePrintFile(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a JPG, PNG or WebP photo. Convert HEIC files to JPG first.';
  if (!file.size) return 'This file is empty. Please choose another photo.';
  if (file.size > MAX_PRINT_FILE_BYTES) return 'This photo is larger than 25 MB. Please choose a smaller file.';
  return '';
}

export function getPrintTotals(photoCount, sizeId, copies) {
  const size = PRINT_SIZES.find(item => item.id === sizeId);
  const count = Number(copies);
  if (!size || !Number.isInteger(photoCount) || photoCount < 1 || photoCount > MAX_PRINT_PHOTOS || !Number.isInteger(count) || count < 1 || count > MAX_PRINT_COPIES) return null;
  return { photoCount, copies: count, printCount: photoCount * count, unitPrice: size.price, total: photoCount * count * size.price };
}

/** All placement is in millimetres. Rotation changes image geometry before fitting. */
export function getPrintLayout(photo, config = DEFAULT_PRINT_CONFIG) {
  const size = PRINT_SIZES.find(item => item.id === config.sizeId) || PRINT_SIZES[1];
  const [width, height] = config.orientation === 'landscape' ? [...size.mm].reverse() : size.mm;
  const border = config.border === 'white' ? 5 : 0;
  const opening = { x: border, y: border, width: width - 2 * border, height: height - 2 * border };
  const photoWidth = photo?.width > 0 ? photo.width : 900;
  const photoHeight = photo?.height > 0 ? photo.height : 600;
  const rotation = ((Math.round((photo?.rotation || 0) / 90) * 90) % 360 + 360) % 360;
  const sideways = rotation === 90 || rotation === 270;
  const rotatedWidth = sideways ? photoHeight : photoWidth;
  const rotatedHeight = sideways ? photoWidth : photoHeight;
  const fill = config.fit === 'cover';
  const zoom = fill ? clamp(photo?.zoom ?? 1, 1, 3) : 1;
  const scale = (fill ? Math.max : Math.min)(opening.width / rotatedWidth, opening.height / rotatedHeight) * zoom;
  const imageWidth = rotatedWidth * scale;
  const imageHeight = rotatedHeight * scale;
  const panX = fill ? clamp(photo?.panX ?? 50, 0, 100) / 100 : .5;
  const panY = fill ? clamp(photo?.panY ?? 50, 0, 100) / 100 : .5;
  const x = (opening.width - imageWidth) * panX;
  const y = (opening.height - imageHeight) * panY;
  return {
    width, height, opening, rotation, scale,
    centerX: x + imageWidth / 2, centerY: y + imageHeight / 2,
    imageWidth: photoWidth * scale, imageHeight: photoHeight * scale,
    bounds: { x, y, width: imageWidth, height: imageHeight },
  };
}

export function getPrintQuality(photo, config) {
  if (!photo || photo.isSample || !(photo.width > 0 && photo.height > 0)) return null;
  const dpi = Math.round(25.4 / getPrintLayout(photo, config).scale);
  return { dpi, level: dpi >= 240 ? 'good' : dpi >= 150 ? 'fair' : 'low', label: dpi >= 240 ? 'Good detail' : dpi >= 150 ? 'Suitable for normal viewing' : 'A smaller print will look sharper' };
}

export async function readPrintPhoto(file) {
  const error = validatePrintFile(file);
  if (error) throw new Error(error);
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const photo = new window.Image();
      photo.onload = () => resolve(photo);
      photo.onerror = () => reject(new Error('This photo could not be opened. Export it as a JPG or PNG and try again.'));
      photo.src = url;
    });
    const scale = Math.min(1, 180 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the photo. Please try again.');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { id: `print-photo-${crypto.randomUUID()}`, name: file.name, url, thumbnail: canvas.toDataURL('image/jpeg', .74), width: image.naturalWidth, height: image.naturalHeight, file, isSample: false, rotation: 0, panX: 50, panY: 50, zoom: 1 };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function buildPrintCartItem({ photos, config, copies, notes = '', id }) {
  if (!photos.length || photos.some(photo => photo.isSample || !photo.thumbnail)) throw new Error('Upload your own photos before adding prints to the bag.');
  const totals = getPrintTotals(photos.length, config.sizeId, copies);
  const size = PRINT_SIZES.find(item => item.id === config.sizeId);
  const finish = PRINT_FINISHES.find(item => item.id === config.finishId);
  const tone = PRINT_TONES.find(item => item.id === config.tone);
  if (!totals || !finish || !tone) throw new Error('Please check your print options and quantity.');
  const storedPhotos = photos.map(photo => ({
    assetId: photo.id, name: photo.name, width: photo.width, height: photo.height,
    thumbnail: photo.thumbnail, rotation: photo.rotation, panX: photo.panX, panY: photo.panY, zoom: photo.zoom,
  }));
  return {
    id: id || `prints-${crypto.randomUUID()}`, type: 'photo_prints', title: `${size.name} Photo Prints (${finish.name})`,
    size: size.name, dimensions: size.dimensions, finish: finish.name,
    orientation: config.orientation, border: config.border === 'white' ? '5 mm white border' : 'Borderless',
    cropMode: config.fit === 'cover' ? 'Fill the paper' : 'Keep full photo', colorTone: tone.name,
    specialInstructions: notes.trim() || undefined, configuration: { ...config },
    photos: storedPhotos, copiesPerPhoto: totals.copies, photoCount: totals.photoCount, printQuantity: totals.printCount,
    price: totals.total, unitPrice: totals.unitPrice, quantity: 1, image: photos[0].thumbnail,
    personalisation: { specifications: `${totals.photoCount} photos × ${totals.copies} copies · ${size.name} · ${finish.name} · ${config.orientation}`, instructions: notes.trim() || 'No special instructions', colorTone: tone.name },
  };
}
