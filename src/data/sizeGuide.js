import { FRAME_FINISHES } from './products';
import { CUSTOM_FRAME_SIZES, getFrameGeometry } from '../utils/frameStudio';

export const GUIDE_ROOMS = [
  {
    id: 'living',
    name: 'Living room',
    caption: 'Soft linen, natural light and a little room for your story.',
    image: '/rooms/size-guide/living-v2.webp',
    alt: 'Warm living room with a linen sofa and a clear wall above it',
    centerX: 0.51,
    centerY: 0.265,
    largestFrameHeight: 0.49,
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    caption: 'A quieter corner, made a little more personal.',
    image: '/rooms/size-guide/bedroom-v2.webp',
    alt: 'Calm neutral bedroom with an upholstered headboard and clear wall',
    centerX: 0.5,
    centerY: 0.285,
    largestFrameHeight: 0.51,
  },
  {
    id: 'console',
    name: 'Console / desk',
    caption: 'Warm walnut and a thoughtful finishing touch.',
    image: '/rooms/size-guide/console-v2.webp',
    alt: 'Walnut console against an empty plaster wall in a sunlit room',
    centerX: 0.5,
    centerY: 0.29,
    largestFrameHeight: 0.5,
  },
];

const PLACEMENTS = {
  A5: { label: 'A little keepsake', use: 'Desks, bedside tables and small gifts' },
  A4: { label: 'The everyday classic', use: 'Portraits, certificates and gallery grids' },
  A3: { label: 'A personal focal point', use: 'Reading corners, pairs and gallery walls' },
  '12x18': { label: 'The portrait format', use: 'Photography, portraits and wall displays' },
  A2: { label: 'Room to make a statement', use: 'Living rooms, hallways and feature walls' },
  A1: { label: 'The larger picture', use: 'Spacious walls and a single focal artwork' },
};

export const GUIDE_SIZES = CUSTOM_FRAME_SIZES.map(size => {
  const [shortCm, longCm] = size.dimensionsCm.split(' x ').map(parseFloat);
  return { ...size, shortCm, longCm, ...PLACEMENTS[size.id] };
});

export function getGuideDimensions(size, orientation, unit = 'cm') {
  const sides = orientation === 'landscape'
    ? [size.longCm, size.shortCm]
    : [size.shortCm, size.longCm];
  const values = unit === 'in' ? sides.map(value => value / 2.54) : sides;
  const formatted = values.map(value => Number(value.toFixed(1)));
  return `${formatted[0]} × ${formatted[1]} ${unit}`;
}

// Compare relative finished sizes, allowing for moulding and the standard mount.
// The largest frame stays inside each scene's clear wall area.
// All backgrounds use the same 1536 × 1024 camera canvas and the original frame aspect ratio.
export function getGuideFramePlacement(size, room, frameId, orientation) {
  const geometry = getFrameGeometry(frameId, orientation);
  const reference = getFrameGeometry(frameId, 'portrait');
  const frame = FRAME_FINISHES.find(item => item.id === frameId);
  const mouldingCm = parseFloat(frame.mouldingWidth) / 10;
  const surroundCm = 2 * (mouldingCm + 3.81);
  const scale = (size.longCm + surroundCm) / (84.1 + surroundCm);
  const portraitHeight = room.largestFrameHeight * scale;
  const portraitWidth = portraitHeight * (2 / 3) * (reference.width / reference.height);
  const width = orientation === 'landscape' ? portraitHeight * (2 / 3) : portraitWidth;
  const height = width * (geometry.height / geometry.width) * (3 / 2);
  return {
    left: `${room.centerX * 100}%`,
    top: `${room.centerY * 100}%`,
    width: `${width * 100}%`,
    height: `${height * 100}%`,
  };
}
