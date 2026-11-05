import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, CreditCard, Sparkles } from 'lucide-react';
import FramedPosterPreview from './FramedPosterPreview';
import { DUA_POSTERS } from '../data/duaPosters';
import { FRAME_FINISHES, FRAME_SIZES, MAT_OPTIONS } from '../data/products';
import { DUA_PRINT_PRICES } from '../data/duaPricing';
import { HOME_CATEGORIES, HOME_PHOTO, HOME_LANDSCAPE, homeDua, homeFrame } from '../data/homeStudio';
import './HomeCollections.css';

const FRAME_STORY = { title: 'A wedding memory worth keeping', image: '/hero/wedding-couple.jpg', width: 434, height: 724 };

export function HomeGalleryScene({ className = '' }) {
  return <div className={`home-gallery-scene ${className}`} role="img" aria-label="Three original Al-Noor photo frames arranged above a linen sofa">
    <img src="/rooms/size-guide/living-v2.webp" alt="" loading="lazy" width="1536" height="1024" />
    <div className="home-gallery-arrangement" aria-hidden="true">
      {[['bride', 'regal_aurelia'], ['couple', 'regal_aurelia'], ['groom', 'regal_aurelia']].map(([subject, frameId]) => <div key={subject}><FramedPosterPreview poster={{ image: `/hero/wedding-${subject}.jpg`, title: 'Wedding photograph', width: 434, height: 724 }} frame={homeFrame(frameId)} /></div>)}
    </div>
  </div>;
}

function CategoryVisual({ id }) {
  if (id === 'frames') return <FramedPosterPreview poster={FRAME_STORY} frame={homeFrame('regal_aurelia')} fit="cover" />;
  if (id === 'prints') return <div className="catalogue-photo-stack"><img src={HOME_PHOTO.image} alt="Family photo print" loading="lazy" /><img src={HOME_LANDSCAPE.image} alt="Landscape photo print" loading="lazy" /></div>;
  if (id === 'duas') return <img className="catalogue-dua-print" src={homeDua('ayat-al-kursi').thumbnail} alt="Ayat al-Kursi poster" loading="lazy" />;
  if (id === 'pvc') return <div className="catalogue-pvc" aria-hidden="true"><span>AL-NOOR / PRINT STUDIO</span><CreditCard size={27} strokeWidth={1.2} /><strong>Your ideas.<br />Made tangible.</strong><i /></div>;
  if (id === 'cards') return <div className="catalogue-greeting" aria-hidden="true"><span>for someone</span><strong>special.</strong><Sparkles size={25} /><small>MAKE IT PERSONAL</small></div>;
  return <HomeGalleryScene />;
}

export function HomeServicesSection() {
  return <section className="home-section home-category-section" id="shop-creations" aria-labelledby="home-shop-heading"><div className="home-container">
    <div className="home-section-heading"><div><span className="home-kicker"><span>01</span> THE STUDIO COLLECTIONS</span><h2 id="home-shop-heading">A little personal.<br /><em>A lot of possibility.</em></h2></div><p>Start with a memory, an idea or someone special.<br /> We’ll help you make something worth keeping.</p></div>
    <div className="home-category-grid">{HOME_CATEGORIES.map((item, index) => <Link className={`home-category home-category-${item.id}`} key={item.id} to={item.path}>
      <div className="home-category-visual"><span className="home-category-number">0{index + 1}</span><CategoryVisual id={item.id} /><span className="home-category-arrow"><ArrowUpRight size={17} /></span></div>
      <div className="home-category-copy"><h3>{item.title}</h3><p>{item.note}</p></div>
    </Link>)}</div>
  </div></section>;
}

export function HomeFramesSection() {
  const [selectedId, setSelectedId] = useState(FRAME_FINISHES[0].id);
  const frame = homeFrame(selectedId);
  const startingPrice = FRAME_SIZES[0].basePrice + MAT_OPTIONS[0].extra + frame.extraPrice;
  return <section className="home-section home-frames-section" aria-labelledby="home-frame-heading"><div className="home-container">
    <div className="home-section-heading"><div><span className="home-kicker"><span>02</span> THE FRAME ATELIER</span><h2 id="home-frame-heading">The same memory.<br /><em>A different feeling.</em></h2></div><Link className="home-text-link" to="/frames-catalogue">Explore all frames <ArrowUpRight size={17} /></Link></div>
    <div className="home-frame-experience">
      <div className="home-frame-stage"><div className="home-frame-stage-top"><span>YOUR MEMORY, BEAUTIFULLY FRAMED</span><span>LIVE FINISH PREVIEW</span></div><div className="home-frame-stage-art"><FramedPosterPreview poster={FRAME_STORY} frame={frame} fit="cover" panY={0} /></div><div className="home-frame-stage-note"><span>Original catalogue frames.</span><em>Made part of your story.</em></div></div>
      <div className="home-frame-selector"><span className="home-kicker">FIND YOUR FINISH</span><h3>Which one feels like you?</h3><p>Warm wood, a touch of gold or quietly classic. Tap a finish to see your memory in a new light.</p>
        <div className="home-frame-rail" role="group" aria-label="Choose a frame finish">{FRAME_FINISHES.map(item => <button className="home-frame-card" type="button" key={item.id} aria-label={`Try ${item.name}, ${item.finish}`} aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)}><div className="home-frame-photo"><FramedPosterPreview poster={FRAME_STORY} frame={homeFrame(item.id)} fit="cover" panY={0} /></div><span>{item.name}</span>{selectedId === item.id && <i aria-hidden="true"><Check size={10} /></i>}</button>)}</div>
        <div className="home-frame-selection" aria-live="polite"><div><strong>{frame.name}</strong><span>{frame.finish}</span></div><div><span>A5 from</span><strong>₹{startingPrice}<small> + delivery</small></strong></div></div>
        <Link className="home-button" to="/custom-framing" state={{ frameId: frame.id, size: 'A5', orientation: 'portrait' }}>Create with this frame <ArrowUpRight size={17} /></Link>
        <div className="home-frame-note"><span>7 real finishes · Portrait & landscape</span><Link to="/size-guide">Find your size <ArrowUpRight size={13} /></Link></div>
      </div>
    </div>
  </div></section>;
}

function DuaProductDetails({ poster, frame }) {
  return <div className="home-dua-info"><span className="home-dua-category">{poster.category}</span><h3>{poster.title}</h3><p>{frame.name} shown · With frame or print only</p><div className="home-dua-purchase"><span><small>Print only from</small><strong>₹{DUA_PRINT_PRICES.A5}<small> + delivery</small></strong></span><span className="home-dua-action"><ArrowUpRight size={18} /><span className="home-sr-only">Choose options</span></span></div></div>;
}

export function HomeDuaSection() {
  const designs = [['ayat-al-kursi', 'regal_aurelia'], ['allah-will-suffice-you-in-everything', 'regal_noir'], ['sayyid-al-istighfar', 'regal_heritage']];
  return <section className="home-section home-dua-section" aria-labelledby="home-dua-heading"><div className="home-container">
    <div className="home-section-heading"><div><span className="home-kicker"><span>03</span> ART WITH MEANING</span><h2 id="home-dua-heading">A beautiful reminder.<br /><em>Every single day.</em></h2><p className="home-heading-description">Original poster designs for a corner that feels like yours.</p></div><Link className="home-text-link" to="/dua-posters">View all {DUA_POSTERS.length} designs <ArrowUpRight size={17} /></Link></div>
    <div className="home-dua-layout">{designs.map(([id, frameId], index) => { const poster = homeDua(id); const frame = homeFrame(frameId); return <Link className={index === 0 ? 'home-dua-feature' : 'home-dua-compact'} to={`/dua-posters/${id}?frame=${frameId}`} key={id}>
      <div className="home-dua-product-art"><span>0{index + 1} / THE DUA COLLECTION</span><FramedPosterPreview poster={poster} frame={frame} /><span className="home-dua-view">View design <ArrowUpRight size={13} /></span></div><DuaProductDetails poster={poster} frame={frame} />
    </Link>; })}</div>
    <div className="home-dua-specs"><span><Check size={14} />250 GSM glossy</span><span><Check size={14} />With or without a frame</span><span><Check size={14} />A5–A1 & custom sizes</span></div>
  </div></section>;
}
