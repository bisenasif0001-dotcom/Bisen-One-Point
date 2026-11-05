import { DUA_POSTERS } from './duaPosters.js';
import { PVC_PRODUCTS } from './pvcCards.js';
import { ITRA_PRODUCTS } from './itraProducts.js';
import { FRAME_FINISHES, ISLAMIC_ART_COLLECTION } from './products.js';

export const SITE_DESCRIPTION = 'Photo printing and custom frames in Lucknow. Explore real frame finishes, original Dua posters, personalised cards and PVC printing at AL-NOOR.';
const pages = {
  '/': ['Custom Frames & Photo Printing in Lucknow', '/'],
  '/frames-catalogue': ['The Frame Collection'], '/custom-framing': ['Custom Framing Studio'],
  '/photo-prints': ['Photo Prints'], '/dua-posters': ['Dua Posters'], '/pvc-cards': ['PVC Cards'],
  '/pvc-cards/bulk': ['Bulk PVC Card Printing'], '/printing-services': ['Printing Services'],
  '/gallery-walls': ['Gallery Walls'], '/birthday-cards': ['Personalised Birthday Cards'],
  '/cards': ['Cards & Invitations'], '/islamic-art': ['Dua & Islamic Wall Art'],
  '/itra-perfumes': ['Itra & Fragrance'], '/size-guide': ['Frame Size Guide'],
  '/cancellation': ['Cancellation'], '/grievance': ['Grievance & Customer Care'], '/privacy': ['Privacy'], '/terms': ['Terms'], '/returns': ['Returns & Order Changes'], '/shipping': ['Shipping & Delivery'], '/original-files': ['Original Print Files'],
  '/about': ['About the Studio'], '/contact': ['Contact AL-NOOR'],
  '/occasions': ['Gifts for Every Occasion'], '/gift-sets': ['Gift Sets'],
};
const aliases = {
  '/prints': '/photo-prints', '/create-card': '/birthday-cards', '/cards-and-gifts': '/cards',
  '/cards-invitations': '/cards', '/gallery-wall': '/gallery-walls', '/shop': '/frames-catalogue',
  '/asma-ul-husna': '/islamic-art', '/99-names': '/islamic-art', '/itra': '/itra-perfumes', '/fragrance': '/itra-perfumes',
};
const occasions = ['birthday', 'wedding', 'anniversary', 'new-baby', 'parents', 'eid'];
const cards = ['tpl-1', 'tpl-2', 'tpl-3', 'tpl-4'];

// Shared by the browser and production HTTP server so invalid product URLs are real 404s.
export function routeInfo(rawPath) {
  let path;
  try { path = decodeURIComponent(rawPath).replace(/\/+$/, '') || '/'; } catch { path = ''; }
  const canonical = aliases[path] || path;
  let title = pages[canonical]?.[0];
  let privatePage = false;
  if (/^\/studio(?:\/|$)/.test(path)) { title = 'Studio Sign In'; privatePage = true; }
  if (['/track-order', '/track', '/orders', '/my-orders'].includes(path)) { title = 'Track Your Order'; privatePage = true; }
  const segments = path.split('/').filter(Boolean);
  if (!title && segments.length === 2) {
    const [collection, id] = segments;
    if (collection === 'dua-posters') title = DUA_POSTERS.find(item => item.id === id)?.title;
    if (collection === 'pvc-cards') title = PVC_PRODUCTS.find(item => item.id === id)?.title;
    if (['itra', 'fragrance', 'itra-perfumes'].includes(collection)) title = ITRA_PRODUCTS.find(item => item.id === id)?.name;
    if (['card', 'cards'].includes(collection) && cards.includes(id)) title = 'Personalised Greeting Card';
    if (['occasions', 'occasion'].includes(collection) && occasions.includes(id)) title = `Gifts for ${id.replaceAll('-', ' ')}`;
    if (collection === 'product') title = FRAME_FINISHES.find(item => item.id === id || item.legacyId === id)?.name || ISLAMIC_ART_COLLECTION.find(item => item.id === id)?.title;
  }
  const known = Boolean(title);
  return { known, private: privatePage, title: `${title || 'Page Not Found'} | AL-NOOR Studio`, description: SITE_DESCRIPTION,
    canonical: ['itra', 'fragrance'].includes(segments[0]) && segments.length === 2 ? `/itra-perfumes/${segments[1]}` : canonical,
    indexable: known && !privatePage && !['product', 'card', 'cards'].includes(segments.length === 2 ? segments[0] : '') };
}

export const SITEMAP_PATHS = [...Object.keys(pages),
  ...DUA_POSTERS.map(item => `/dua-posters/${item.id}`), ...PVC_PRODUCTS.map(item => `/pvc-cards/${item.id}`),
  ...ITRA_PRODUCTS.map(item => `/itra-perfumes/${item.id}`), ...occasions.map(id => `/occasions/${id}`)];
