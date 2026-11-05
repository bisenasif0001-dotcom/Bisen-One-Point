import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Expand, Frame, Image, Ruler, Search, Sparkles, X } from 'lucide-react';
import { FRAME_FINISHES, FRAME_SIZES } from '../data/products';
import { FRAME_PREVIEW_APERTURES } from '../data/framePreviewApertures';
import { DUA_PRINT_PRICES, DUA_PRINT_SPEC } from '../data/duaPricing';
import { VERSE_ARTWORKS, VERSE_FILTERS, filterVerseArtworks, verseDesignPath, buildQulsSetEnquiry, getVerseSelection } from '../data/islamicArt';
import { getWhatsAppUrl } from '../data/businessConfig';
import FramedPosterPreview from './FramedPosterPreview';

const money = amount => `₹${amount.toLocaleString('en-IN')}`;
const FAQ = [
  ['Will the artwork be cropped?', 'The full original poster is shown and preserved. The frame preview uses actual catalogue frame photography. You can enlarge a design to inspect its original layout before choosing your options.'],
  ['Can I choose just a print?', `Yes. Choose Print only to see the listed price for your selected size. Original collection posters are printed on ${DUA_PRINT_SPEC} paper. Delivery is extra. Frame prices are confirmed by the studio.`],
  ['Can I order the three Quls designs together?', 'Yes. Al-Ikhlas, Al-Falaq and An-Nas are three individual designs. Ask the studio for a matching set, your preferred frame finish and sizes. A set quote is confirmed before you order.'],
  ['What if I want a different verse or custom size?', 'Share the exact text or reference artwork and the size you have in mind through our custom printing desk. The studio will discuss the layout, artwork, frame options, price and timing with you.'],
];

function DesignDialog({ item, frame, format, sizeId, onClose }) {
  const ref = useRef(null);
  const [view, setView] = useState(format);
  useEffect(() => {
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={ref} className="ia-dialog" aria-labelledby="ia-dialog-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="ia-dialog-header"><div><span className="ia-kicker">THE COMPLETE ORIGINAL DESIGN</span><h2 id="ia-dialog-title">{item.displayTitle}</h2></div><button type="button" className="ia-icon-button" aria-label="Close design preview" autoFocus onClick={onClose}><X size={21} /></button></div>
    <div className="ia-dialog-layout"><div className="ia-dialog-art"><FramedPosterPreview poster={item} frame={view === 'framed' ? frame : null} /></div><div className="ia-dialog-copy"><span className="ia-kicker">A CLOSER LOOK</span><h3>A little detail.<br /><em>A meaningful display.</em></h3><p>{item.description}</p><div className="ia-view-choice" role="group" aria-label="Enlarged artwork view"><button type="button" aria-pressed={view === 'framed'} onClick={() => setView('framed')}>In a frame</button><button type="button" aria-pressed={view === 'print'} onClick={() => setView('print')}>Artwork only</button></div><p className="ia-dialog-note">View the artwork in full. Your order selection stays as shown below.</p><dl><div><dt>Size</dt><dd>{sizeId}</dd></div><div><dt>Presentation</dt><dd>{format === 'framed' ? frame.name : 'Print only'}</dd></div><div><dt>{format === 'framed' ? 'Frame price' : 'Print price'}</dt><dd>{format === 'framed' ? 'Studio quote' : `${money(DUA_PRINT_PRICES[sizeId])} + delivery`}</dd></div></dl><Link className="ia-primary" to={verseDesignPath(item, { format, frameId: frame.id, sizeId })}>Customise this design<ArrowRight size={15} /></Link></div></div>
  </dialog>;
}

export default function IslamicArtGallery() {
  const [params] = useSearchParams();
  const initialSelection = getVerseSelection(params);
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState(initialSelection.format);
  const [sizeId, setSizeId] = useState(initialSelection.sizeId);
  const [frameId, setFrameId] = useState(initialSelection.frameId);
  const [preview, setPreview] = useState(null);
  const trigger = useRef(null);
  const frames = FRAME_FINISHES.filter(frame => FRAME_PREVIEW_APERTURES[frame.id] && frame.availableSizes.includes(sizeId));
  const selectedFrame = frames.find(frame => frame.id === frameId) || frames[0];
  const selectedSize = FRAME_SIZES.find(size => size.id === sizeId);
  const designs = filterVerseArtworks(query, group);
  const openPreview = (event, item) => { trigger.current = event.currentTarget; setPreview(item); };
  const closePreview = () => { setPreview(null); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); };
  const reset = () => { setQuery(''); setGroup('all'); };

  return <div className="ia-verse-gallery">
    <div className="ia-section-heading"><div><span className="ia-kicker">ORIGINAL ARTWORK. YOUR PRESENTATION.</span><h2>Find a design<br /><em>that feels at home.</em></h2></div><p>Four original posters, shown in full. Start with your preferred presentation, then open a design to make it yours.</p></div>
    <div className="ia-preview-settings"><div className="ia-settings-heading"><span><Frame size={17} /><strong>Style your collection preview</strong></span><small>These choices carry through to your selected design.</small></div><div className="ia-settings-fields"><div className="ia-view-choice" role="group" aria-label="Collection presentation"><button type="button" aria-pressed={format === 'framed'} onClick={() => setFormat('framed')}><Frame size={14} /> With frame</button><button type="button" aria-pressed={format === 'print'} onClick={() => setFormat('print')}><Image size={14} /> Print only</button></div><label className="ia-select-field"><span>Print size</span><div><select aria-label="Collection print size" value={sizeId} onChange={event => setSizeId(event.target.value)}>{FRAME_SIZES.map(size => <option key={size.id} value={size.id}>{size.id} · {size.dimensionsCm.replaceAll(' x ', ' × ')}</option>)}</select><ChevronDown size={14} /></div></label>{format === 'framed' ? <label className="ia-select-field"><span>Frame finish</span><div><select aria-label="Collection frame finish" value={selectedFrame.id} onChange={event => setFrameId(event.target.value)}>{frames.map(frame => <option value={frame.id} key={frame.id}>{frame.name} · {frame.finish}</option>)}</select><ChevronDown size={14} /></div></label> : <div className="ia-paper-info"><Check size={15} /><span><strong>{DUA_PRINT_SPEC}</strong><small>{money(DUA_PRINT_PRICES[sizeId])} per print · Delivery extra</small></span></div>}</div><div className="ia-preview-summary" role="status"><Check size={12} />{sizeId} · {format === 'framed' ? `${selectedFrame.name} · ${selectedFrame.finish}` : `${DUA_PRINT_SPEC} · Print only`}<span>{format === 'framed' ? 'Frame pricing confirmed by the studio' : 'Without a frame'}</span></div></div>
    <div className="ia-gallery-toolbar"><div className="ia-filter-buttons" role="group" aria-label="Filter verse designs">{VERSE_FILTERS.map(filter => <button type="button" key={filter.id} aria-pressed={group === filter.id} onClick={() => setGroup(filter.id)}>{filter.label}<span>{filter.id === 'all' ? VERSE_ARTWORKS.length : VERSE_ARTWORKS.filter(item => item.group === filter.id).length}</span></button>)}</div><label className="ia-search"><Search size={16} /><input type="search" aria-label="Search verse designs" placeholder="Search Ayat or Surah…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear design search" onClick={() => setQuery('')}><X size={15} /></button>}</label></div>
    <div className="ia-results-label" role="status">{designs.length} {designs.length === 1 ? 'design' : 'designs'}{group !== 'all' || query ? ' found' : ' in the original collection'}<span>{format === 'framed' ? 'Actual catalogue frames · Full artwork' : `${selectedSize.id} print · Full artwork`}</span></div>
    {designs.length ? <div className="ia-design-grid">{designs.map(item => <article className="ia-design-card" key={item.id}><button type="button" className={`ia-design-art ia-design-art-${format}`} aria-label={`Enlarge ${item.displayTitle}`} onClick={event => openPreview(event, item)}><span className="ia-card-index">0{VERSE_ARTWORKS.findIndex(art => art.id === item.id) + 1} / ORIGINAL DESIGN</span><FramedPosterPreview poster={{ ...item, image: item.thumbnail }} frame={format === 'framed' ? selectedFrame : null} /><span className="ia-expand"><Expand size={13} /> A closer look</span></button><div className="ia-design-copy"><span className="ia-kicker">{item.eyebrow}</span><h3>{item.displayTitle}</h3><p>{item.description}</p><div className="ia-card-price"><strong>{format === 'framed' ? 'Made with your frame' : money(DUA_PRINT_PRICES[sizeId])}</strong><small>{format === 'framed' ? `${sizeId} · Price on request` : `${sizeId} · Print only · Delivery extra`}</small></div><Link className="ia-card-action" to={verseDesignPath(item, { format, sizeId, frameId: selectedFrame.id })}>Customise this design<ArrowUpRight size={15} /></Link></div></article>)}</div> : <div className="ia-empty"><Search size={25} strokeWidth={1.3} /><h3>No designs match yet.</h3><p>Try “Kursi”, “Ikhlas”, “Falaq” or “Nas”, or clear the filters to see all four.</p><button type="button" className="ia-primary" onClick={reset}>Show all designs<ArrowRight size={15} /></button></div>}
    <aside className="ia-set-feature"><div className="ia-set-art" aria-label="Three matching Quls designs">{VERSE_ARTWORKS.slice(1).map(item => <FramedPosterPreview key={item.id} poster={{ ...item, image: item.thumbnail }} frame={selectedFrame} />)}</div><div className="ia-set-copy"><span className="ia-kicker">THREE DESIGNS. ONE THOUGHTFUL DISPLAY.</span><h2>Bring the Quls<br /><em>together.</em></h2><p>Al-Ikhlas, Al-Falaq and An-Nas, in a coordinated arrangement. Choose matching frames and ask the studio for a set quote in the sizes you need.</p><a className="ia-primary" href={getWhatsAppUrl(buildQulsSetEnquiry({ format, frame: selectedFrame, sizeId }))} target="_blank" rel="noopener noreferrer">Ask about a matching set<ArrowUpRight size={15} /></a><small>Three individual designs · Set price confirmed with your quote</small></div></aside>
    <section className="ia-help" aria-labelledby="ia-help-title"><div><span className="ia-kicker">A LITTLE HELP BEFORE YOU CHOOSE</span><h2 id="ia-help-title">Thoughtful details.<br /><em>A clear next step.</em></h2><Link to="/size-guide" className="ia-text-link"><Ruler size={14} /> Explore the size guide<ArrowUpRight size={13} /></Link></div><div>{FAQ.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={15} /></summary><p>{answer}</p></details>)}</div></section>
    <aside className="ia-custom-request"><span className="ia-custom-icon"><Sparkles size={25} strokeWidth={1.3} /></span><div><h2>Something personal in mind?</h2><p>A different verse, your own reference or a custom frame size. Share your idea with the print studio.</p></div><Link className="ia-text-link" to="/printing-services?service=Dua%20posters">Start a custom request<ArrowUpRight size={15} /></Link></aside>
    {preview && <DesignDialog item={preview} frame={selectedFrame} format={format} sizeId={sizeId} onClose={closePreview} />}
  </div>;
}
