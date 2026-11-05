import { DUA_POSTERS } from './duaPosters';
import { FRAME_FINISHES, FRAME_SIZES } from './products';

const VERSE_DESIGNS = [
  ['ayat-al-kursi', 'Ayat al-Kursi', 'ayat', 'QURANIC VERSE', 'A detailed original poster, with the Arabic text and transliteration shown in the artwork.'],
  ['quls-1-3-surah-al-ikhlas', 'Surah Al-Ikhlas', 'surahs', 'QULS · DESIGN 1 OF 3', 'The first design in our three-part Quls collection. Display it individually or alongside the other two.'],
  ['quls-2-3-surah-al-falaq', 'Surah Al-Falaq', 'surahs', 'QULS · DESIGN 2 OF 3', 'The second original Quls design, with a matching gold-accented layout for a coordinated display.'],
  ['quls-3-3-surah-an-nas', 'Surah An-Nas', 'surahs', 'QULS · DESIGN 3 OF 3', 'The third original Quls design. Complete the display with Al-Ikhlas and Al-Falaq.'],
];

export const VERSE_ARTWORKS = VERSE_DESIGNS.map(([id, displayTitle, group, eyebrow, description]) => ({
  ...DUA_POSTERS.find(poster => poster.id === id), displayTitle, group, eyebrow, description,
}));

export const VERSE_FILTERS = [
  { id: 'all', label: 'All designs' }, { id: 'ayat', label: 'Ayat al-Kursi' }, { id: 'surahs', label: 'Surahs' },
];

export function resolveIslamicArtTab(params, pathname = '/islamic-art') {
  const value = params.get('tab') || params.get('category');
  if (['names', 'asma-ul-husna'].includes(value)) return 'names';
  if (['verses', 'surahs'].includes(value)) return 'verses';
  if (!value && ['/asma-ul-husna', '/99-names'].includes(pathname)) return 'names';
  return 'duas';
}

export function filterVerseArtworks(query = '', group = 'all') {
  const search = query.trim().toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ');
  return VERSE_ARTWORKS.filter(item => (group === 'all' || item.group === group) && `${item.title} ${item.displayTitle} ${item.group} ${item.id}`.toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').includes(search));
}

export function verseDesignPath(item, { format = 'framed', frameId = 'regal_noir', sizeId = 'A4' } = {}) {
  const params = new URLSearchParams({ format, size: sizeId, from: 'verses' });
  if (format === 'framed') params.set('frame', frameId);
  return `/dua-posters/${item.id}?${params}`;
}

export function getVerseSelection(params) {
  const format = params.get('format') === 'print' ? 'print' : 'framed';
  const sizeId = FRAME_SIZES.some(size => size.id === params.get('size')) ? params.get('size') : 'A4';
  const frameId = FRAME_FINISHES.some(frame => frame.id === params.get('frame') && frame.availableSizes.includes(sizeId)) ? params.get('frame') : 'regal_noir';
  return { format, sizeId, frameId };
}

export function verseCollectionPath(selection) {
  const params = new URLSearchParams({ tab: 'verses', format: selection.format, size: selection.sizeId, frame: selection.frameId });
  return `/islamic-art?${params}`;
}

export function buildQulsSetEnquiry({ format, frame, sizeId }) {
  return ['Hello AL-NOOR! I would like a quote for a matching Quls set.', '', ...VERSE_ARTWORKS.slice(1).map(item => `1 × ${item.displayTitle}`), '', 'Total: 3 individual designs, one of each.', `Size: ${sizeId} for each design`, `Presentation: ${format === 'print' ? 'Print only, without frames' : `With frames · ${frame.name} · ${frame.finish}`}`, '', 'Please confirm the set price, availability, delivery charges and timing.'].join('\n');
}
