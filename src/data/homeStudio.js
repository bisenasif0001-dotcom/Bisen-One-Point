import { FRAME_FINISHES, SAMPLE_CUSTOM_PHOTOS } from './products';
import { DUA_POSTERS } from './duaPosters';

export const HOME_PHOTO = { title: 'A family moment by the sea', image: SAMPLE_CUSTOM_PHOTOS[1].url };
export const HOME_LANDSCAPE = { title: 'A favourite view', image: SAMPLE_CUSTOM_PHOTOS[0].url };
export const homeFrame = id => {
  const frame = FRAME_FINISHES.find(f => f.id === id) || FRAME_FINISHES[0];
  return { ...frame, frontImage: `/studio-previews/${frame.id.replaceAll('_', '-')}.webp` };
};
export const homeDua = id => DUA_POSTERS.find(p => p.id === id) || DUA_POSTERS[0];
export const HOME_CATEGORIES = [
  { id: 'frames', title: 'Photo frames', note: 'Your photo, your finish', path: '/custom-framing' },
  { id: 'prints', title: 'Photo prints', note: 'Memories you can hold', path: '/photo-prints' },
  { id: 'duas', title: 'Dua & wall art', note: 'Art with meaning', path: '/dua-posters' },
  { id: 'pvc', title: 'PVC cards', note: 'Your team. Your business. Your design.', path: '/pvc-cards' },
  { id: 'cards', title: 'Cards & gifts', note: 'Make their day personal', path: '/cards' },
  { id: 'gallery', title: 'Gallery walls', note: 'Your story, together', path: '/gallery-walls' },
];
