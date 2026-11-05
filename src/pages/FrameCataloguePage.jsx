import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Expand, Frame, Image as ImageIcon, Info, Layers, Ruler, X } from 'lucide-react';
import { FRAME_FINISHES } from '../data/products';
import { homeFrame } from '../data/homeStudio';
import { CUSTOM_FRAME_SIZES } from '../utils/frameStudio';
import { CATALOGUE_FILTERS, getCatalogueDimensions, getCatalogueFinishes, getCataloguePrice } from '../utils/frameCatalogue';
import { GUIDE_ROOMS, GUIDE_SIZES, getGuideFramePlacement } from '../data/sizeGuide';
import CatalogueFramePreview from '../components/CatalogueFramePreview';
import CustomFrameShowcase from '../components/CustomFrameShowcase';
import './FrameCataloguePage.css';

const money = value => `₹${value.toLocaleString('en-IN')}`;
const sizeName = id => id === '12x18' ? '12 × 18 in' : id;
const ANGLE_NAMES = { front: 'Front view', corner: 'Corner detail', layered: 'Layered view', side: 'Side profile' };

function FrameInspector({ frame, sizeId, orientation, onClose }) {
  const [angleId, setAngleId] = useState('front');
  const dialogRef = useRef(null);
  const angle = frame.angles.find(item => item.id === angleId);
  const price = getCataloguePrice(frame.id, sizeId);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={dialogRef} className="fcat-inspector" aria-label={`Inspect ${frame.name}`} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="fcat-dialog-heading"><span className="fcat-eyebrow">A CLOSER LOOK / {frame.name}</span><button type="button" autoFocus className="fcat-icon-button" aria-label="Close frame details" onClick={onClose}><X size={21} /></button></div>
    <div className="fcat-inspector-layout">
      <div className="fcat-inspector-gallery"><div className={`fcat-inspector-art fcat-angle-${angleId}`}>
        {angleId === 'front' ? <CatalogueFramePreview frame={frame} orientation={orientation} withPhoto={false} /> : <img src={angle.image} alt={`${frame.name}, ${ANGLE_NAMES[angleId]}`} />}
        <span>{ANGLE_NAMES[angleId]} · Original catalogue photograph</span>
      </div><div className="fcat-angle-options" role="group" aria-label="Frame photograph angle">{frame.angles.map(option => <button type="button" key={option.id} aria-pressed={option.id === angleId} onClick={() => setAngleId(option.id)}>{ANGLE_NAMES[option.id]}</button>)}</div></div>
      <div className="fcat-inspector-copy"><span className="fcat-eyebrow">{frame.category}</span><h2>{frame.name}</h2><p className="fcat-dialog-finish"><i style={{ background: frame.colorHex }} />{frame.finish}</p><p className="fcat-dialog-description">{frame.desc}</p>
        <dl className="fcat-specification"><div><dt>Moulding</dt><dd>{frame.mouldingWidth}</dd></div><div><dt>Depth</dt><dd>{frame.depth}</dd></div><div><dt>Material & mount</dt><dd>{frame.material}</dd></div><div><dt>Glazing</dt><dd>{frame.glazing}</dd></div><div><dt>Hanging</dt><dd>{frame.hanging}</dd></div></dl>
        <div className="fcat-dialog-price"><div><span>{sizeName(sizeId)} framed photo</span><strong>{money(price)}</strong></div><span>{getCatalogueDimensions(sizeId, orientation)}<br />{orientation} · Delivery extra</span></div>
        <Link className="fcat-primary" to="/custom-framing" state={{ frameId: frame.id, size: sizeId, orientation }}>Create with {frame.name} <ArrowUpRight size={16} /></Link><p className="fcat-dialog-help">Photo print, studio mount & standard acrylic included. Upload your photo in the frame studio.</p>
      </div>
    </div>
  </dialog>;
}

export default function FrameCataloguePage() {
  const [category, setCategory] = useState('all');
  const [sizeId, setSizeId] = useState('A5');
  const [orientation, setOrientation] = useState('portrait');
  const [previewMode, setPreviewMode] = useState('photo');
  const [sort, setSort] = useState('collection');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [inspectedFrame, setInspectedFrame] = useState(null);
  const inspectorTrigger = useRef(null);
  const finishes = getCatalogueFinishes({ category, sizeId, sort });
  const dimensions = getCatalogueDimensions(sizeId, orientation);
  const room = GUIDE_ROOMS[0];
  const roomSize = GUIDE_SIZES.find(size => size.id === 'A2');
  const placement = getGuideFramePlacement(roomSize, room, 'regal_aurelia', 'landscape');
  const openInspector = (frame, event) => { inspectorTrigger.current = event.currentTarget; setInspectedFrame(frame); };
  const closeInspector = () => { setInspectedFrame(null); requestAnimationFrame(() => inspectorTrigger.current?.focus({ preventScroll: true })); };

  return <div className="frame-catalogue-page"><div className="fcat-container">
    <div className="fcat-breadcrumb"><Link to="/"><ArrowLeft size={13} /> The studio</Link><span>/</span><span>The frame collection</span></div>
    <header className="fcat-header"><div><span className="fcat-eyebrow">THE FRAME ATELIER / AL-NOOR</span><h1>Find your memory’s<br /><em>finishing touch.</em></h1><p>Warm wood, quietly classic or a little touch of gold. Explore our actual frames and find the finish that feels like you.</p></div><aside className="fcat-intro-note"><span><Frame size={20} strokeWidth={1.2} /><strong>{FRAME_FINISHES.length} real frame designs</strong></span><p>Preview the finish. Inspect the details.<br />Make it personal in our frame studio.</p><Link to="/size-guide"><Ruler size={14} /> Find the right size <ArrowUpRight size={14} /></Link></aside></header>

    <div className="fcat-comparison" role="group" aria-label="Catalogue preview settings" data-mobile-open={controlsOpen}><button type="button" className="fcat-mobile-control-toggle" aria-label="Change catalogue preview settings" aria-expanded={controlsOpen} aria-controls="fcat-comparison-settings" onClick={() => setControlsOpen(current => !current)}><span><Ruler size={16} /> Preview & size</span><span>{sizeName(sizeId)} · {orientation}<ChevronDown size={14} /></span></button><div className="fcat-comparison-body" id="fcat-comparison-settings"><div className="fcat-comparison-intro"><span className="fcat-eyebrow">A LITTLE COMPARISON GOES A LONG WAY</span><span>One size. Every finish. Your choice.</span></div><div className="fcat-controls">
      <label className="fcat-size-control"><span>Print size</span><div><Ruler size={15} /><select aria-label="Compare frame size" value={sizeId} onChange={event => setSizeId(event.target.value)}>{CUSTOM_FRAME_SIZES.map(size => <option key={size.id} value={size.id}>{sizeName(size.id)} · {size.dimensionsCm.replaceAll(' x ', ' × ')}</option>)}</select><ChevronDown size={13} /></div></label>
      <div className="fcat-control"><span>Frame layout</span><div className="fcat-segmented" role="group" aria-label="Frame orientation">{['portrait', 'landscape'].map(value => <button type="button" key={value} aria-pressed={orientation === value} onClick={() => setOrientation(value)}><i className={`fcat-orientation-icon ${value}`} aria-hidden="true" />{value === 'portrait' ? 'Portrait' : 'Landscape'}</button>)}</div></div>
      <div className="fcat-control"><span>Preview</span><div className="fcat-segmented" role="group" aria-label="Catalogue preview mode"><button type="button" aria-pressed={previewMode === 'photo'} onClick={() => setPreviewMode('photo')}><ImageIcon size={14} />With photo</button><button type="button" aria-pressed={previewMode === 'frame'} onClick={() => setPreviewMode('frame')}><Frame size={14} />Frame only</button></div></div>
    </div><p className="fcat-included"><Check size={13} /> Prices include a photo print, studio mount & standard acrylic. Delivery extra.</p></div></div>

    <div className="fcat-filter-row"><div className="fcat-filters" role="group" aria-label="Filter frame styles">{CATALOGUE_FILTERS.map(filter => <button type="button" key={filter.id} aria-pressed={category === filter.id} onClick={() => setCategory(filter.id)}>{filter.label}<span>{getCatalogueFinishes({ category: filter.id, sizeId }).length}</span></button>)}</div></div>
    <div className="fcat-results"><p role="status">{finishes.length} {finishes.length === 1 ? 'finish' : 'finishes'} <span>· {sizeName(sizeId)} · {dimensions} · {orientation}</span></p><label className="fcat-sort"><span className="fcat-sr-only">Sort frames</span><select aria-label="Sort frames" value={sort} onChange={event => setSort(event.target.value)}><option value="collection">Collection order</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select><ChevronDown size={12} /></label></div>

    <section className="fcat-products" aria-label="Frame collection"><h2 className="fcat-sr-only">Explore the frame finishes</h2><div className="fcat-grid">{finishes.map(frame => <article className="fcat-card" key={frame.id}>
      <button type="button" className={`fcat-card-art fcat-card-art-${frame.id} fcat-${orientation}`} aria-label={`Inspect ${frame.name} frame photographs`} onClick={event => openInspector(frame, event)}>
        <span className="fcat-card-number">0{FRAME_FINISHES.findIndex(item => item.id === frame.id) + 1} / THE FRAME COLLECTION</span><CatalogueFramePreview frame={homeFrame(frame.id)} orientation={orientation} withPhoto={previewMode === 'photo'} /><span className="fcat-card-inspect"><Expand size={13} /> Inspect frame</span><span className="fcat-card-preview-label">{previewMode === 'photo' ? 'SAMPLE PHOTO' : 'ACTUAL FRAME'}</span>
      </button>
      <div className="fcat-card-copy"><span className="fcat-eyebrow">{frame.category}</span><div className="fcat-card-title"><h3>{frame.name}</h3><i style={{ background: frame.colorHex }} aria-hidden="true" /></div><p>{frame.finish}</p><dl className="fcat-card-facts"><div><dt>Moulding</dt><dd>{frame.mouldingWidth}</dd></div><div><dt>Depth</dt><dd>{frame.depth}</dd></div></dl><div className="fcat-card-bottom"><div><span>{sizeName(sizeId)} framed photo</span><strong>{money(getCataloguePrice(frame.id, sizeId))}<small> + delivery</small></strong></div><Link to="/custom-framing" state={{ frameId: frame.id, size: sizeId, orientation }} aria-label={`Create with ${frame.name}`}><span>Make it yours</span><ArrowUpRight size={17} /></Link></div></div>
    </article>)}</div></section>

    <div className="fcat-afterword"><span><Info size={14} /> Frame previews show the finish and artwork fit. Outside dimensions vary with the selected size and moulding.</span><a href="#catalogue-custom-frames">Need a custom size or design? <ArrowUpRight size={14} /></a></div>
    <CustomFrameShowcase placement="catalogue" id="catalogue-custom-frames" />
    <aside className="fcat-size-story" aria-labelledby="fcat-size-title"><div className="fcat-room-scene"><img src={room.image} alt={room.alt} loading="lazy" width="1536" height="1024" /><div className="fcat-room-frame" style={placement}><CatalogueFramePreview frame={homeFrame('regal_aurelia')} orientation="landscape" /></div><span>ROOM INSPIRATION / A2 LANDSCAPE</span></div><div className="fcat-size-story-copy"><span className="fcat-eyebrow">BEFORE YOU CHOOSE</span><h2 id="fcat-size-title">A little perspective.<br /><em>A perfect place.</em></h2><p>Not sure which size belongs in your space? Try a room scene and compare sizes in our live size guide.</p><Link className="fcat-primary" to="/size-guide">Find your frame’s place <ArrowUpRight size={16} /></Link><Link className="fcat-gallery-link" to="/gallery-walls">Thinking of a whole gallery wall? <ArrowRight size={14} /></Link></div></aside>
    <div className="fcat-closing"><Layers size={19} strokeWidth={1.3} /><p>From a favourite photo to a thoughtful finishing touch.</p><Link to="/custom-framing">Create something personal <ArrowUpRight size={15} /></Link></div>
  </div>{inspectedFrame && <FrameInspector key={inspectedFrame.id} frame={inspectedFrame} sizeId={sizeId} orientation={orientation} onClose={closeInspector} />}</div>;
}
