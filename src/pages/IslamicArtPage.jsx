import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, BookOpen, Check, Frame, Sparkles } from 'lucide-react';
import { DuaPosterCollection } from './DuaPostersPage';
import IslamicArtGallery from '../components/IslamicArtGallery';
import AsmaUlHusnaGallery from '../components/AsmaUlHusnaGallery';
import FramedPosterPreview from '../components/FramedPosterPreview';
import { FRAME_FINISHES } from '../data/products';
import { DUA_POSTERS } from '../data/duaPosters';
import { ASMA_UL_HUSNA_COUNT, ASMA_UL_HUSNA_ITEMS } from '../data/asmaUlHusnaData';
import { VERSE_ARTWORKS, resolveIslamicArtTab } from '../data/islamicArt';
import './IslamicArtPage.css';

const COLLECTIONS = [
  { id: 'duas', label: 'Dua posters', note: `${DUA_POSTERS.length} original designs`, icon: BookOpen },
  { id: 'names', label: 'Names of Allah', note: `${ASMA_UL_HUSNA_COUNT} individual artworks`, icon: Sparkles },
  { id: 'verses', label: 'Verses & surahs', note: `${VERSE_ARTWORKS.length} original designs`, icon: Frame },
];
const COPY = {
  verses: { kicker: 'THE VERSE & SURAH COLLECTION', title: 'Sacred words.', accent: 'Beautifully displayed.', description: 'Discover Ayat al-Kursi and our three original Quls designs. Explore the complete artwork, try a frame finish and find the right presentation for your space.', button: 'Explore the verse collection', caption: 'ORIGINAL DESIGNS. A THOUGHTFUL DISPLAY.' },
  duas: { kicker: 'THE DUA POSTER COLLECTION', title: 'A daily reminder.', accent: 'A beautiful place.', description: `Discover ${DUA_POSTERS.length} original dua poster designs for your home, prayer space or a meaningful gift. Find your design, then choose a size and frame that feels right.`, button: 'Explore the dua collection', caption: 'MEANINGFUL WORDS. MADE PART OF YOUR HOME.' },
  names: { kicker: 'THE ASMA-UL-HUSNA COLLECTION', title: 'Beautiful names.', accent: 'Meaningful spaces.', description: `Explore ${ASMA_UL_HUSNA_COUNT} individual calligraphy artworks from our Names of Allah collection. Discover a name, view the design and choose how you would like to display it.`, button: 'Explore the names collection', caption: 'CALLIGRAPHY TO CHOOSE WITH CARE.' },
};

function CollectionHeroArt({ tab }) {
  const posters = tab === 'names' ? [ASMA_UL_HUSNA_ITEMS[1], ASMA_UL_HUSNA_ITEMS[0], ASMA_UL_HUSNA_ITEMS[2]].map(item => ({ title: item.title, image: item.imageUrl })) : tab === 'verses' ? [VERSE_ARTWORKS[1], VERSE_ARTWORKS[0], VERSE_ARTWORKS[2]] : [DUA_POSTERS[2], VERSE_ARTWORKS[0], DUA_POSTERS[4]];
  const frame = FRAME_FINISHES.find(item => item.id === 'regal_noir');
  return <div className="ia-hero-art" aria-label="Original artwork displayed in a catalogue frame"><span className="ia-hero-art-label">A LITTLE MEANING, EVERY DAY</span><div className="ia-hero-frames">{posters.map((poster, index) => <div key={poster.title} className={`ia-hero-frame ia-hero-frame-${index}`}><FramedPosterPreview poster={{ ...poster, image: poster.thumbnail || poster.image }} frame={frame} /></div>)}</div><span className="ia-hero-art-caption">{COPY[tab].caption}</span></div>;
}

export default function IslamicArtPage({ onAddToCart }) {
  const [params] = useSearchParams();
  const location = useLocation();
  const activeTab = resolveIslamicArtTab(params, location.pathname);
  const copy = COPY[activeTab];
  return <div className={`ia-page ia-page-${activeTab}`}><div className="ia-shell">
    <nav className="ia-breadcrumb" aria-label="Breadcrumb"><Link to="/">The studio</Link><span>/</span><span>Dua & wall art</span></nav>
    <header className="ia-hero"><div className="ia-hero-copy"><span className="ia-kicker"><Sparkles size={14} />{copy.kicker}</span><h1>{copy.title}<br /><em>{copy.accent}</em></h1><p>{copy.description}</p><a className="ia-primary" href="#islamic-collection">{copy.button}<ArrowDown size={15} /></a><div className="ia-hero-notes"><span><Check size={13} /> Original artwork</span><span><Check size={13} /> Framed or print only</span></div></div><CollectionHeroArt tab={activeTab} /></header>
    <nav className="ia-collections" aria-label="Islamic art collections">{COLLECTIONS.map(({ id, label, note, icon: Icon }) => <Link key={id} to={`/islamic-art?tab=${id}`} aria-current={activeTab === id ? 'page' : undefined}><Icon size={19} strokeWidth={1.5} /><span><strong>{label}</strong><small>{note}</small></span><ArrowUpRight size={16} /></Link>)}</nav>
    <div className="ia-collection-content" id="islamic-collection">{activeTab === 'verses' ? <IslamicArtGallery /> : activeTab === 'names' ? <AsmaUlHusnaGallery onAddToCart={onAddToCart} /> : <DuaPosterCollection />}</div>
  </div></div>;
}
