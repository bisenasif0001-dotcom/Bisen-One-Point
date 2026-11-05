import { FRAME_FINISHES, FRAME_SIZES } from '../data/products';
import { GALLERY_LAYOUTS, getGalleryLayout } from '../data/galleryWalls';
import { homeFrame } from '../data/homeStudio';

export function galleryPrintDimensions(slot) {
  const size = FRAME_SIZES.find(item => item.id === slot.sizeId);
  const [short, long] = size.dimensionsCm.split(' x ').map(parseFloat);
  return slot.orientation === 'landscape' ? [long, short] : [short, long];
}

/** Approximate finished frame sizes, including the standard mount and photographed moulding. */
export function getGalleryPlan(layoutId, frameId = 'regal_aurelia') {
  const layout = getGalleryLayout(layoutId);
  const frame = FRAME_FINISHES.find(item => item.id === frameId) || FRAME_FINISHES[0];
  const surround = 2 * (3.81 + parseFloat(frame.mouldingWidth) / 10);
  const slots = layout.slots.map((slot, index) => {
    const [printWidth, printHeight] = galleryPrintDimensions(slot);
    return { ...slot, index, width: printWidth + surround, height: printHeight + surround, x: 0, y: 0 };
  });
  const gap = 6;
  if (layout.id === 'classic-trio') slots.forEach((slot, index) => { slot.x = (index - 1) * (slot.width + gap); });
  if (layout.id === 'family-wall') slots.slice(1).forEach((slot, index) => {
    slot.x = (index < 2 ? -1 : 1) * (slots[0].width / 2 + gap + slot.width / 2);
    slot.y = (index % 2 ? 1 : -1) * (slot.height + gap) / 2;
  });
  if (layout.id === 'wedding-salon') {
    slots[1].x = -(slots[0].width / 2 + gap + slots[1].width / 2);
    slots[2].x = -slots[1].x;
    const rowWidth = slots.slice(3).reduce((sum, slot) => sum + slot.width, gap * 3);
    slots.slice(3).forEach((slot, index) => {
      slot.x = -rowWidth / 2 + slot.width / 2 + index * (slot.width + gap);
      slot.y = slots[0].height / 2 + gap + slot.height / 2;
    });
  }
  if (layout.id === 'memory-grid') slots.forEach((slot, index) => {
    slot.x = (index % 3 - 1) * (slot.width + gap);
    slot.y = (Math.floor(index / 3) - 1) * (slot.height + gap);
  });
  const left = Math.min(...slots.map(slot => slot.x - slot.width / 2));
  const top = Math.min(...slots.map(slot => slot.y - slot.height / 2));
  const right = Math.max(...slots.map(slot => slot.x + slot.width / 2));
  const bottom = Math.max(...slots.map(slot => slot.y + slot.height / 2));
  return { slots: slots.map(slot => ({ ...slot, x: slot.x - slot.width / 2 - left, y: slot.y - slot.height / 2 - top })), width: right - left, height: bottom - top, gap };
}

export function getGalleryPrice(layoutId, frameId) {
  const layout = GALLERY_LAYOUTS.find(item => item.id === layoutId);
  const frame = FRAME_FINISHES.find(item => item.id === frameId);
  if (!layout || !frame) return null;
  // Existing gallery bundles include the chosen catalogue finish at the advertised set price.
  return { base: layout.startingPrice, finishPerFrame: 0, finishUpgrade: 0, total: layout.startingPrice };
}

export function swapGalleryEntries(entries, from, to) {
  const result = { ...entries };
  if (entries[to]) result[from] = entries[to]; else delete result[from];
  if (entries[from]) result[to] = entries[from]; else delete result[to];
  return result;
}

export function validateGalleryOrder(config, photos) {
  const layout = GALLERY_LAYOUTS.find(item => item.id === config.layoutId);
  if (!layout || !getGalleryPrice(config.layoutId, config.frameId)) return 'Choose a gallery layout and frame finish.';
  if (!['now', 'later'].includes(config.photoMode)) return 'Choose whether to upload photos now or share them with the studio later.';
  const ready = layout.slots.filter((_, index) => photos[index]?.url && !photos[index]?.isSample).length;
  if (config.photoMode === 'now' && ready !== layout.framesCount) return `Add your own photo to all ${layout.framesCount} frames, or choose “Share remaining photos later”. Sample photos are for preview only.`;
  return '';
}

export function createGalleryWallItem(config, photos, settings, id = `gallery-wall-${Date.now()}`) {
  const problem = validateGalleryOrder(config, photos);
  if (problem) throw new Error(problem);
  const layout = getGalleryLayout(config.layoutId);
  const frame = FRAME_FINISHES.find(item => item.id === config.frameId);
  const price = getGalleryPrice(config.layoutId, config.frameId);
  const slots = layout.slots.map((slot, index) => ({ ...slot, index, fit: settings[index]?.fit || 'cover', panX: settings[index]?.panX ?? 50, panY: settings[index]?.panY ?? 20,
    photo: photos[index] && !photos[index].isSample ? { url: photos[index].url, name: photos[index].name, width: photos[index].width, height: photos[index].height, originalId: photos[index].id } : null,
  }));
  const photoCount = slots.filter(slot => slot.photo).length;
  return {
    id, type: 'gallery_wall', title: `${layout.name} · ${layout.framesCount} frames`,
    size: layout.dimensions, format: layout.layoutType, finish: frame.name, frameId: frame.id,
    mat: 'Mount as shown in the selected catalogue frame', price: price.total, quantity: 1,
    frameCount: layout.framesCount, photoCount, photosPending: layout.framesCount - photoCount,
    image: slots.find(slot => slot.photo)?.photo.url || homeFrame(frame.id).frontImage,
    configuration: { ...config, slots, frameCount: layout.framesCount }, pricing: price,
    includesTemplate: true, personalisation: { layout: layout.name, frameId: frame.id },
  };
}

export function galleryOrderDetails(item) {
  const c = item.configuration;
  if (!c?.slots) return '';
  return [
    `Gallery: ${item.title}; ${item.quantity} set(s), ${item.frameCount * item.quantity} frames total`,
    `Frame: ${item.finish}; mount as shown in catalogue; ${c.tone === 'mono' ? 'black & white' : 'original colour'}`,
    ...c.slots.map((slot, index) => `Frame ${index + 1} (${slot.label}): ${slot.sizeId} ${slot.orientation}; ${slot.photo?.name || 'Photo to be shared'}; ${slot.fit === 'cover' ? 'Fill opening' : 'Keep full photo'}; crop ${slot.panX}% / ${slot.panY}%`),
    ...(item.photosPending ? [`${item.photosPending} photo(s) per set still to be shared with the studio.`] : []),
    'Original photo files to be shared with the studio before printing. Hanging template included.',
  ].join('\n');
}
