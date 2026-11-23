import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Expand, Frame, Image as ImageIcon, Info, MessageCircle, Minus, Plus, Ruler, ShoppingBag, X } from 'lucide-react';
import { FRAME_FINISHES, FRAME_SIZES } from '../data/products';
import { FRAME_PREVIEW_APERTURES } from '../data/framePreviewApertures';
import { DUA_PRINT_PRICES, DUA_PRINT_SPEC } from '../data/duaPricing';
import { getDuaPosterPrice } from '../utils/priceRegistry';
import { getWhatsAppUrl } from '../data/businessConfig';
import { buildDuaEnquiry, getDuaOrderDetails } from '../utils/duaPosterOrder';
import { asmaArtworkPrice, buildAsmaArtworkEnquiry } from '../utils/asmaArtwork';
import { formatFrameSizeLabel } from '../utils/shippingCalculator';
import FramedPosterPreview from './FramedPosterPreview';
import { usePriceOverrides } from './BusinessRulesProvider';
import './DuaPosterCustomizer.css';

const money = value => `₹${value.toLocaleString('en-IN')}`;
const SIZE_USES = { A5: 'Desk & small spaces', A4: 'Everyday favourite', A3: 'A little more presence', '12x18': 'Studio portrait size', '13x19': 'Poster showcase size', '15x21': 'Statement wall piece', '16x22': 'Large gallery piece', A2: 'Feature wall', A1: 'Statement piece' };

function ArtworkViewSwitch({ value, onChange, label }) {
  return <div className="dpd-view-switch" role="group" aria-label={label}>
    <button type="button" aria-pressed={value === 'framed'} onClick={() => onChange('framed')}>In a frame</button>
    <button type="button" aria-pressed={value === 'artwork'} onClick={() => onChange('artwork')}>Artwork only</button>
  </div>;
}

function ArtworkDialog({ poster, frame, view, transparent, onViewChange, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog className="dpd-art-dialog" ref={dialogRef} aria-label={`${poster.title} enlarged preview`}
    onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dpd-dialog-heading"><div><span className="dpd-eyebrow">A CLOSER LOOK</span><h2>{poster.title}</h2></div>
      <button type="button" className="dpd-icon-button" autoFocus onClick={onClose} aria-label="Close artwork preview"><X size={21} /></button>
    </div>
    {frame && <ArtworkViewSwitch value={view} onChange={onViewChange} label="Enlarged preview view" />}
    <div className={`dpd-dialog-art${transparent ? ' dpd-art-transparent' : ''}`}><FramedPosterPreview poster={poster} frame={view === 'framed' ? frame : null} /></div>
    <p className="dpd-dialog-note">Complete artwork shown. Your order options stay unchanged.</p>
  </dialog>;
}

export default function DuaPosterCustomizer({ poster, initialFrame, initialFormat, initialSize, collectionPath = '/dua-posters', collectionLabel = 'All dua posters', nameArtwork, onAddToCart }) {
  const priceOverrides = usePriceOverrides();
  const [format, setFormat] = useState(initialFormat === 'print' ? 'print' : 'framed');
  const [sizeId, setSizeId] = useState(FRAME_SIZES.some(size => size.id === initialSize) ? initialSize : 'A4');
  const [frameId, setFrameId] = useState(FRAME_FINISHES.some(frame => frame.id === initialFrame && FRAME_PREVIEW_APERTURES[frame.id]) ? initialFrame : 'regal_noir');
  const [quantity, setQuantity] = useState('1');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customUnit, setCustomUnit] = useState('cm');
  const [previewView, setPreviewView] = useState('framed');
  const [expanded, setExpanded] = useState(false);
  const [orderReached, setOrderReached] = useState(false);
  const orderRef = useRef(null);
  const previewTrigger = useRef(null);
  const availableFrames = FRAME_FINISHES.filter(frame => FRAME_PREVIEW_APERTURES[frame.id] && (sizeId === 'Custom' || frame.availableSizes.includes(sizeId)));
  const selectedFrame = availableFrames.find(frame => frame.id === frameId) || availableFrames[0];
  const previewFrame = format === 'framed' && previewView === 'framed' ? selectedFrame : null;
  const details = getDuaOrderDetails({ format, sizeId, quantity, frameId: selectedFrame?.id, customWidth, customHeight, customUnit }, priceOverrides);
  const frame = format === 'framed' ? selectedFrame : null;
  const printFromPrice = getDuaPosterPrice('A5', priceOverrides) ?? DUA_PRINT_PRICES.A5;
  const framedFromPrice = getDuaOrderDetails({ format: 'framed', sizeId: 'A5', quantity: 1, frameId: selectedFrame?.id }, priceOverrides).unitPrice;
  const estimate = nameArtwork ? asmaArtworkPrice(nameArtwork, format, sizeId, frame, priceOverrides) : null;
  const hasCustomArtOverride = Boolean(nameArtwork && priceOverrides?.islamicArt?.[nameArtwork.id]);
  const order = nameArtwork ? { ...details, unitPrice: estimate, subtotal: details.valid && estimate !== null ? estimate * details.quantity : null } : details;
  const enquiry = nameArtwork ? buildAsmaArtworkEnquiry({ item: nameArtwork, order, frame }) : buildDuaEnquiry({ poster, order, frame: selectedFrame });
  const chosenSize = FRAME_SIZES.find(size => size.id === sizeId);
  const priceText = order.errors.quantity ? 'Check quantity' : order.subtotal !== null ? money(order.subtotal) : order.unitPrice !== null ? money(order.unitPrice) : 'Price on request';
  const paper = nameArtwork ? 'Fine-art print' : DUA_PRINT_SPEC;
  const canAddToBag = Boolean(order.valid && order.unitPrice !== null && onAddToCart);
  const addToBag = () => onAddToCart(nameArtwork ? {
    id: `${poster.id}-${format}-${sizeId}-${frame?.id ?? 'print'}-${Date.now()}`,
    productId: poster.id,
    type: 'islamic_art',
    title: `${poster.title} (${nameArtwork.arabicTitle})`,
    arabicTitle: nameArtwork.arabicTitle,
    image: poster.image,
    format: frame ? 'With frame' : 'Without frame (rolled print)',
    frameId: frame?.id,
    finish: frame ? `${frame.name} · ${frame.finish}` : 'Rolled print',
    size: sizeId,
    dimensions: order.dimensions,
    price: order.unitPrice,
    quantity: order.quantity,
  } : {
    id: `dua-${poster.id}-${format}-${sizeId}-${frame?.id ?? 'print'}-${Date.now()}`,
    productId: poster.id,
    type: 'dua_poster',
    title: frame ? `${poster.title} — Framed Dua Poster` : `${poster.title} — Dua Poster Print`,
    image: poster.image,
    format: frame ? 'With frame' : 'Print only (without frame)',
    frameId: frame?.id || null,
    finish: frame ? `${frame.name} · ${frame.finish}` : `${DUA_PRINT_SPEC} · Unframed`,
    size: sizeId,
    dimensions: order.dimensions,
    price: order.unitPrice,
    printPrice: order.printPrice,
    framePrice: order.framePrice,
    quantity: order.quantity,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOrderReached(entry.isIntersecting || entry.boundingClientRect.top < 0), { threshold: 0 });
    observer.observe(orderRef.current);
    return () => observer.disconnect();
  }, []);

  const selectFormat = value => { setFormat(value); setPreviewView(value === 'framed' ? 'framed' : 'artwork'); };
  const openPreview = event => { previewTrigger.current = event.currentTarget; setExpanded(true); };
  const closePreview = () => {
    setExpanded(false);
    requestAnimationFrame(() => previewTrigger.current?.focus({ preventScroll: true }));
  };
  const changeQuantity = delta => setQuantity(String(Math.min(10000, Math.max(1, (order.quantity || 1) + delta))));
  const reviewSelection = () => {
    orderRef.current?.focus({ preventScroll: true });
    orderRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };

  return <div className="dua-product-page">
    <div className="dpd-shell">
      <nav className="dpd-breadcrumb" aria-label="Breadcrumb"><Link to={collectionPath}><ArrowLeft size={14} /> {collectionLabel}</Link><span aria-hidden="true">/</span><span>{poster.category}</span></nav>
      <div className="dpd-layout">
        <header className="dpd-heading"><span className="dpd-eyebrow">{nameArtwork ? 'NAMES OF ALLAH' : `${poster.category} · THE DUA COLLECTION`}</span><h1>{poster.title}</h1>
          {nameArtwork ? <p>{nameArtwork.meaning} <span className="dpd-arabic-name" lang="ar" dir="rtl">{nameArtwork.arabicTitle}</span></p> : <p>A meaningful addition to your home, prayer space or a thoughtful gift. Choose your size and finish below.</p>}
          <div className="dpd-artwork-features"><span><Check size={13} /> Original artwork</span><span>{paper}</span><span>Complete design</span></div>
        </header>

        <section className="dpd-preview-column" aria-label="Your poster preview">
          <div className="dpd-preview-card">
            <div className="dpd-preview-toolbar"><span><i aria-hidden="true" /> LIVE PREVIEW</span><button type="button" onClick={openPreview}><Expand size={15} /> Enlarge</button></div>
            {format === 'framed' && <ArtworkViewSwitch value={previewView} onChange={setPreviewView} label="Poster preview view" />}
            <button type="button" className={`dpd-art-stage ${previewFrame ? 'dpd-art-stage-framed' : 'dpd-art-stage-print'}${!nameArtwork ? ' dpd-art-transparent' : ''}`} aria-label="Enlarge selected poster preview" onClick={openPreview}>
              <FramedPosterPreview poster={poster} frame={previewFrame} />
              <span className="dpd-stage-size">{sizeId === 'Custom' ? 'Custom size' : sizeId} <span>· {order.dimensions}</span></span>
            </button>
            <div className="dpd-preview-caption"><div><strong>{format === 'framed' ? selectedFrame.name : nameArtwork ? 'Rolled print' : 'Your poster, beautifully printed.'}</strong><span>{format === 'framed' ? selectedFrame.finish : `${paper} · Without frame`}</span></div><span className="dpd-no-crop"><Check size={13} /> Full artwork</span></div>
          </div>
          <p className="dpd-preview-footnote">{format === 'framed' ? 'Actual catalogue frame photography. ' : ''}Artwork is shown in full, without cropping.{sizeId === 'Custom' && ' Custom-size fit is confirmed by the studio.'}</p>
          <div className="dpd-about-art"><details><summary>Artwork & paper <ChevronDown size={15} /></summary><p>{nameArtwork ? nameArtwork.description : `The original poster design is reproduced as shown in the preview, on ${paper} paper. The full artwork is preserved. Colours may vary slightly between screen and print.`}</p></details><details><summary>How to order <ChevronDown size={15} /></summary><p>{nameArtwork ? 'Add a standard size to your bag or send your selection on WhatsApp. The studio confirms final pricing and delivery.' : 'Choose your format, size and quantity. Continue on WhatsApp with your selection already filled in. The studio confirms your final price, frame availability and delivery charges before you order.'}</p></details></div>
        </section>

        <section className="dpd-config" aria-labelledby="dpd-customise-title">
          <div className="dpd-config-heading"><h2 id="dpd-customise-title">Make it yours.</h2><button type="button" className="dpd-text-button" onClick={openPreview}><Expand size={14} /> Preview</button></div>
          <fieldset className="dpd-fieldset"><legend><span className="dpd-step-number">01</span> Choose your format</legend>
            <div className="dpd-formats">{[['framed', 'With frame', 'Artwork + your chosen frame', Frame], ['print', 'Print only', 'Without a frame', ImageIcon]].map(([value, label, description, Icon]) => {
              const formatFrom = nameArtwork
                ? asmaArtworkPrice(nameArtwork, value, 'A5', value === 'framed' ? selectedFrame : null, priceOverrides)
                : (value === 'framed' ? framedFromPrice : printFromPrice);
              return <button type="button" key={value} aria-pressed={format === value} onClick={() => selectFormat(value)}>
              <span className="dpd-format-top"><Icon size={18} />{format === value && <span className="dpd-check"><Check size={11} /></span>}</span><strong>{label}</strong><small>{description}</small><span className="dpd-format-price">{formatFrom !== null ? `From ${money(formatFrom)}` : 'Price on request'}</span>
            </button>;})}</div>
          </fieldset>

          <fieldset className="dpd-fieldset"><legend><span className="dpd-step-number">02</span> Choose your size</legend>
            <div className="dpd-size-grid">{[...FRAME_SIZES, { id: 'Custom' }].map(size => {
              const printSizePrice = size.id === 'Custom' ? null : (nameArtwork ? asmaArtworkPrice(nameArtwork, 'print', size.id, null, priceOverrides) : (getDuaPosterPrice(size.id, priceOverrides) ?? DUA_PRINT_PRICES[size.id]));
              const framedSizePrice = size.id === 'Custom' ? null : (nameArtwork ? asmaArtworkPrice(nameArtwork, 'framed', size.id, selectedFrame, priceOverrides) : getDuaOrderDetails({ format: 'framed', sizeId: size.id, quantity: 1, frameId: selectedFrame?.id }, priceOverrides).unitPrice);
              const sizeLabel = format === 'print'
                ? (printSizePrice ? `${money(printSizePrice)} / print` : (SIZE_USES[size.id] || 'Ask the studio'))
                : (framedSizePrice ? `${money(framedSizePrice)} · framed` : (SIZE_USES[size.id] || 'Ask the studio'));
              return <button type="button" key={size.id} aria-pressed={sizeId === size.id} aria-label={`${size.id}${size.dimensionsCm ? `, ${size.dimensionsCm.replaceAll(' x ', ' × ')}` : ' size'}`} onClick={() => setSizeId(size.id)}>
              <span><strong>{size.id === 'Custom' ? 'Custom' : formatFrameSizeLabel(size.id)}</strong>{sizeId === size.id && <Check size={12} />}</span><small>{size.dimensionsCm?.replaceAll(' x ', ' × ') || 'Your dimensions'}</small><span className="dpd-size-use">{sizeLabel}</span>
            </button>;})}</div>
            {chosenSize ? <p className="dpd-helper"><Ruler size={13} /> {chosenSize.dimensionsInch.replaceAll(' x ', ' × ')} · Artwork / print dimensions</p> : <div className="dpd-custom-size"><div><label>Width<input type="number" inputMode="decimal" min="0" step="any" value={customWidth} onChange={event => setCustomWidth(event.target.value)} placeholder="e.g. 30" aria-describedby="dpd-custom-size-help" aria-invalid={Boolean(customWidth && (!Number.isFinite(Number(customWidth)) || Number(customWidth) <= 0))} /></label><span aria-hidden="true">×</span><label>Height<input type="number" inputMode="decimal" min="0" step="any" value={customHeight} onChange={event => setCustomHeight(event.target.value)} placeholder="e.g. 45" aria-describedby="dpd-custom-size-help" aria-invalid={Boolean(customHeight && (!Number.isFinite(Number(customHeight)) || Number(customHeight) <= 0))} /></label><label>Unit<select value={customUnit} onChange={event => setCustomUnit(event.target.value)}><option value="cm">cm</option><option value="in">in</option></select></label></div><p id="dpd-custom-size-help" className="dpd-helper">{order.errors.customSize || 'Custom size entered. The studio will confirm fit and pricing.'}</p></div>}
          </fieldset>

          {format === 'framed' && <fieldset className="dpd-fieldset"><legend><span className="dpd-step-number">03</span> Find your frame <small>{availableFrames.length} finishes</small></legend>
            <div className="dpd-frame-grid">{availableFrames.map(frame => <button type="button" key={frame.id} aria-label={`${frame.name}, ${frame.finish}`} aria-pressed={selectedFrame.id === frame.id} onClick={() => { setFrameId(frame.id); setPreviewView('framed'); }}>
              <FramedPosterPreview poster={{ ...poster, image: poster.thumbnail }} frame={frame} /><strong>{frame.name}</strong>{selectedFrame.id === frame.id && <span className="dpd-check"><Check size={11} /></span>}
            </button>)}</div>
            <p className="dpd-frame-detail" aria-live="polite"><span className="dpd-check"><Check size={11} /></span><span><strong>{selectedFrame.name}</strong><small>{selectedFrame.finish} · {selectedFrame.mouldingWidth} moulding{!hasCustomArtOverride && order.framePrice !== null ? ` · Frame ${money(order.framePrice)}` : ''}</small></span></p>
          </fieldset>}

          <div className="dpd-quantity-row"><div><label htmlFor="dpd-quantity">Quantity</label><small>{format === 'framed' ? 'Number of framed pieces' : 'Number of prints'}</small></div><div className="dpd-quantity"><button type="button" aria-label="Decrease quantity" disabled={order.quantity === 1} onClick={() => changeQuantity(-1)}><Minus size={15} /></button><input id="dpd-quantity" type="number" inputMode="numeric" min="1" max="10000" step="1" value={quantity} onChange={event => setQuantity(event.target.value)} aria-invalid={Boolean(order.errors.quantity)} aria-describedby={order.errors.quantity ? 'dpd-quantity-error' : undefined} /><button type="button" aria-label="Increase quantity" disabled={order.quantity === 10000} onClick={() => changeQuantity(1)}><Plus size={15} /></button></div></div>
          {order.errors.quantity && <p id="dpd-quantity-error" className="dpd-error" role="alert">{order.errors.quantity}</p>}

          <div className="dpd-order" id="poster-order" ref={orderRef} tabIndex={-1}>
            <div className="dpd-order-heading"><span className="dpd-eyebrow">YOUR SELECTION</span><span>{format === 'framed' ? (nameArtwork ? 'FRAMED ARTWORK' : 'FRAMED POSTER') : 'PRINT ONLY'}</span></div>
            <div className="dpd-order-line"><div><strong>{sizeId} · {order.quantity || '—'} {order.quantity === 1 ? 'piece' : 'pieces'}</strong><span>{order.dimensions}</span></div><div className="dpd-price" aria-live="polite"><strong>{order.errors.quantity && order.unitPrice !== null ? '—' : priceText}</strong><span>{order.unitPrice !== null ? (nameArtwork ? 'estimated subtotal' : format === 'framed' ? 'poster + frame subtotal' : 'print subtotal') : 'studio quote'}</span></div></div>
            {format === 'framed' && <p>{selectedFrame.name} · {selectedFrame.finish}</p>}
            <p>{paper}{order.unitPrice !== null && ` · ${money(order.unitPrice)} each`} · Delivery extra</p>
            {!hasCustomArtOverride && format === 'framed' && order.printPrice !== null && order.framePrice !== null && (
              <div className="dpd-price-breakdown">
                <div><span>{nameArtwork ? 'Artwork print' : 'Poster print'} ({sizeId} · {paper})</span><span>{money(order.printPrice)}</span></div>
                <div><span>{selectedFrame.name} frame ({sizeId})</span><span>+ {money(order.framePrice)}</span></div>
                <div className="dpd-breakdown-total"><span>Combined total{order.quantity > 1 ? ` (${money(order.unitPrice)} × ${order.quantity})` : ' (Poster + Frame)'}</span><strong>{money(order.subtotal ?? order.unitPrice)}</strong></div>
              </div>
            )}
          </div>
          {canAddToBag && <button type="button" className="dpd-primary" onClick={addToBag}><ShoppingBag size={18} /> Add to Bag · {money(order.subtotal ?? order.unitPrice)} <ArrowRight size={17} /></button>}
          {order.valid ? <a className={canAddToBag ? 'dpd-primary dpd-secondary-action' : 'dpd-primary'} href={getWhatsAppUrl(enquiry)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} />{nameArtwork || order.unitPrice === null ? 'Get quote on WhatsApp' : 'Order on WhatsApp'}<ArrowUpRight size={17} /></a> : <><button type="button" className="dpd-primary" disabled><MessageCircle size={18} />Complete your selection</button><p className="dpd-error" role="status">{order.errors.quantity || order.errors.customSize || 'Check your options above.'}</p></>}
          <p className="dpd-order-note"><Info size={13} /> {canAddToBag ? 'Add to bag to checkout online, or order directly on WhatsApp. Delivery charges are confirmed before payment.' : `Opens WhatsApp with your selection. The studio confirms ${order.unitPrice !== null ? 'delivery charges' : 'price and delivery'} before you order.`}</p>
          <Link className="dpd-size-help" to="/size-guide"><Ruler size={14} /> Need help choosing a size? <ArrowRight size={14} /></Link>
        </section>
      </div>
      <div className="dpd-back-collection"><span>Find something meaningful for every corner.</span><Link to={collectionPath}>{nameArtwork ? 'Back to Names of Allah' : collectionLabel === 'Verse collection' ? 'Return to the verse collection' : 'Explore the full dua collection'} <ArrowRight size={16} /></Link></div>
    </div>
    {!orderReached && !expanded && <div className="dpd-mobile-bar"><div><strong>{priceText}</strong><span>{sizeId} · {format === 'framed' ? 'With frame' : 'Print only'}</span></div><button type="button" onClick={reviewSelection}>Review selection <ArrowRight size={15} /></button></div>}
    {expanded && <ArtworkDialog poster={poster} frame={format === 'framed' ? selectedFrame : null} view={previewView} transparent={!nameArtwork} onViewChange={setPreviewView} onClose={closePreview} />}
  </div>;
}
