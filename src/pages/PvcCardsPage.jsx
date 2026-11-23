import React, { useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, CreditCard, FileCheck2, GraduationCap, Heart, IdCard, Layers, MessageCircle, Search, ShoppingBag, Sparkles, Ticket, Upload, Users, X } from 'lucide-react';
import PvcCardArt from '../components/PvcCardArt';
import StudioEnquiryReceipt from '../components/StudioEnquiryReceipt';
import { useBusinessRules } from '../components/BusinessRulesProvider';
import { PVC_CARD_TYPES, PVC_CATEGORIES, PVC_PRODUCTS, PVC_SPEC, PVC_VOLUME_TIERS, filterPvcProducts, getPvcProduct, getPvcType, pvcCategoryPath, pvcProductPath } from '../data/pvcCards';
import { PVC_ACCESSORIES, PVC_QUANTITIES, buildPvcMessage, createPvcDraft, getPvcPricing, pvcEnquiryRows, validatePvcDraft, validatePvcFile } from '../utils/pvcEnquiry';
import './PvcCardsPage.css';

const categoryIcons = { id: IdCard, business: CreditCard, membership: Users, events: Ticket, personalised: Heart, bulk: Layers };
const bulkTierSummary = PVC_VOLUME_TIERS
  .filter(tier => tier.discountPercent > 0)
  .slice()
  .reverse()
  .map(tier => `${tier.min}+ cards ${tier.discountPercent}% off`)
  .join(' · ');
const maxBulkDiscount = Math.max(...PVC_VOLUME_TIERS.map(tier => tier.discountPercent));

function PvcFaq() {
  return <section className="pvc-faq" aria-labelledby="pvc-faq-title"><div><span className="pvc-kicker">A LITTLE CLARITY</span><h2 id="pvc-faq-title">Before we<br /><em>make your cards.</em></h2><p>A single keepsake or your whole team. We’ll help you get the details right.</p></div><div>
    {[
      ['Can I order just one card?', 'Yes. Choose Single card on any product page and add it directly to your bag, or select Bulk enquiry for a larger batch with volume savings up to 45% off.'],
      ['Can each card have a different name or photo?', 'Yes. For a batch, share your final names and details in a spreadsheet, with clearly matched original photographs, in the studio’s WhatsApp conversation. We will confirm the layout and proof before printing.'],
      ['What size and material are the cards?', 'The standard card is 86 × 54 mm, 0.76 mm thick, on white inkjet-coated PVC. Choose horizontal or vertical layouts and full-colour printing on one side or both sides. Front and back are printed in separate passes.'],
      ['Can you design it and add a QR code?', 'Choose Get it designed for layout help. For a printed QR code, send the exact website or contact link and check the final proof with the studio. The previews here are illustrative designs.'],
      ['How are files, accessories and timing confirmed?', 'Files chosen here stay on your device. Send the original files in WhatsApp or upload them after placing your order. Card holders and lanyards are dispatched subject to studio confirmation; printed cards need at least 24 hours to dry.'],
    ].map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={16} /></summary><p>{answer}</p></details>)}
  </div></section>;
}

export default function PvcCardsPage() {
  const { priceOverrides: overrides } = useBusinessRules();
  const [params, setParams] = useSearchParams();
  const requestedCategory = params.get('category') || 'all';
  const category = PVC_CATEGORIES.some(item => item.id === requestedCategory && item.id !== 'bulk') ? requestedCategory : 'all';
  const [query, setQuery] = useState('');
  const products = filterPvcProducts(category, query);
  const current = PVC_CATEGORIES.find(item => item.id === category);
  const singlePrice = getPvcPricing({ quantity: 1, sides: 'single' }, overrides).total;
  const doublePrice = getPvcPricing({ quantity: 1, sides: 'double' }, overrides).total;
  const setCategory = id => { const next = new URLSearchParams(params); if (id === 'all') next.delete('category'); else next.set('category', id); setParams(next, { state: { preservePvcScroll: true } }); };
  return <div className="pvc-page"><div className="pvc-container">
    <nav className="pvc-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>PVC cards</span></nav>
    <header className="pvc-hero"><div className="pvc-hero-copy"><span className="pvc-kicker"><CreditCard size={15} /> THE PVC CARD STUDIO</span><h1>Small card.<br /><em>Lasting impression.</em></h1><p>For your team, your business or a memory worth keeping. Personalised PVC cards, thoughtfully designed and printed.</p><div className="pvc-actions"><a className="pvc-primary" href="#pvc-collection">Find your card <ArrowRight size={16} /></a><Link className="pvc-text-link" to="/pvc-cards/bulk">Plan a bulk order <ArrowUpRight size={15} /></Link></div><div className="pvc-hero-notes"><span><Check size={13} /> From ₹{singlePrice} / card</span><span><Check size={13} /> Up to {maxBulkDiscount}% bulk savings</span><span><Check size={13} /> Design help available</span></div></div>
      <div className="pvc-hero-scene" role="img" aria-label="Illustrative PVC employee, business and membership card designs"><span className="pvc-scene-note">YOUR PEOPLE. YOUR BRAND. YOUR LITTLE MOMENTS.</span><div className="pvc-scene-card pvc-scene-id"><PvcCardArt product={PVC_PRODUCTS[1]} decorative /></div><div className="pvc-scene-card pvc-scene-business"><PvcCardArt product={PVC_PRODUCTS[4]} decorative /></div><div className="pvc-scene-card pvc-scene-member"><PvcCardArt product={PVC_PRODUCTS[5]} decorative /></div><span className="pvc-scene-tag"><Sparkles size={14} /> Made a little more personal.</span><small>ILLUSTRATIVE DESIGNS / YOUR ARTWORK COMES NEXT</small></div>
    </header>
    <div className="pvc-spec-strip"><span><CreditCard size={18} /> <b>{PVC_SPEC.size}</b> Standard card size</span><span><Layers size={18} /><b>{PVC_SPEC.thickness}</b> White coated PVC</span><span><FileCheck2 size={18} /><b>One side or both</b> Your design, your layout</span><span><Sparkles size={18} /><b>From ₹{singlePrice} / card</b> Single ₹{singlePrice} · Both sides ₹{doublePrice}</span></div>
    <section className="pvc-collection" id="pvc-collection" aria-labelledby="pvc-collection-title"><div className="pvc-section-heading"><div><span className="pvc-kicker">01 / FIND YOUR KIND OF CARD</span><h2 id="pvc-collection-title">{current ? current.headline : <>A card for<br className="pvc-mobile-break" /> <em>every connection.</em></>}</h2><p>{current?.description || 'Start with a purpose. Make it yours with your design, details and finishing touches.'}</p></div><Link className="pvc-text-link" to="/pvc-cards/bulk">Ordering for a team? <ArrowUpRight size={15} /></Link></div>
      <nav className="pvc-categories" aria-label="PVC card categories"><button onClick={() => setCategory('all')} aria-current={category === 'all' ? 'page' : undefined}><CreditCard size={17} /><span>All cards<small>Explore the collection</small></span></button>{PVC_CATEGORIES.map(item => { const Icon = categoryIcons[item.id]; return item.id === 'bulk' ? <Link key={item.id} to={pvcCategoryPath(item.id)}><Icon size={17} /><span>{item.label}<small>{item.note}</small></span><ArrowUpRight size={12} /></Link> : <button key={item.id} onClick={() => setCategory(item.id)} aria-current={category === item.id ? 'page' : undefined}><Icon size={17} /><span>{item.label}<small>{item.note}</small></span></button>; })}</nav>
      {requestedCategory !== 'all' && category === 'all' && <p className="pvc-info" role="status">Explore all cards below, or choose a category.</p>}
      <div className="pvc-collection-toolbar"><p aria-live="polite"><strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}{query.trim() ? ` matching “${query.trim()}”` : category === 'all' ? ' · Made for you, one card or a whole batch' : ` in ${current.label.toLowerCase()}`}</p><div className="pvc-search"><Search size={16} /><input aria-label="Search PVC cards" placeholder="Search cards, e.g. student or gym" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear card search" onClick={() => setQuery('')}><X size={15} /></button>}</div></div>
      {products.length ? <div className="pvc-product-grid">{products.map(product => <Link className={`pvc-product pvc-tone-${product.colour}`} key={product.id} to={pvcProductPath(product.id)}><div className="pvc-product-art"><span>{product.tag}</span><div><PvcCardArt product={product} decorative /></div><i><ArrowUpRight size={17} /></i></div><div className="pvc-product-copy"><small>{product.use}</small><h3>{product.title}</h3><p>{product.description}</p><div className="pvc-product-price"><strong>From ₹{singlePrice}<span>/card</span></strong><small>Bulk up to {maxBulkDiscount}% off</small></div><span>Choose options <ArrowRight size={15} /></span></div></Link>)}</div> : <div className="pvc-empty"><Search size={26} /><h3>Let’s find the right card.</h3><p>Try another word, or explore the whole collection.</p><button className="pvc-primary" onClick={() => { setQuery(''); setCategory('all'); }}>Show all cards <ArrowRight size={15} /></button></div>}
    </section>
    <section className="pvc-type-directory" aria-labelledby="pvc-types-title"><div><span className="pvc-kicker">MORE WAYS TO MAKE IT YOURS</span><h2 id="pvc-types-title">Have a particular<br /><em>card in mind?</em></h2><p>Find your purpose below. Each opens the right product with your card type already selected.</p></div><div>{PVC_CATEGORIES.filter(item => item.id !== 'bulk').map(item => <details key={item.id}><summary>{item.label}<span>{PVC_CARD_TYPES.filter(type => type.category === item.id).length} types <ChevronDown size={15} /></span></summary><div>{PVC_CARD_TYPES.filter(type => type.category === item.id).map(type => <Link key={type.id} to={pvcProductPath(type.productId, type.id)}>{type.label}<ArrowUpRight size={12} /></Link>)}</div></details>)}</div></section>
    <section className="pvc-bulk-banner"><div className="pvc-bulk-symbol"><GraduationCap size={31} strokeWidth={1.2} /><Users size={31} strokeWidth={1.2} /></div><div><span className="pvc-kicker">FOR YOUR WHOLE COMMUNITY</span><h2>One person. Or everyone.</h2><p>Schools, offices, gyms, shops and events. Plan a consistent batch with individual names and photos.</p></div><Link className="pvc-primary" to="/pvc-cards/bulk">Build a bulk enquiry <ArrowUpRight size={16} /></Link></section>
    <PvcFaq />
  </div></div>;
}

function Choice({ label, value, options, onChange }) {
  return <div className="pvc-field"><span>{label}</span><div className="pvc-choices" role="group" aria-label={label}>{options.map(item => <button key={item.value} type="button" aria-pressed={value === item.value} onClick={() => onChange(item.value)}>{value === item.value && <Check size={13} />}{item.label}</button>)}</div></div>;
}

function DesignFile({ side, file, onChange }) {
  const [error, setError] = useState('');
  const input = useRef(null);
  return <div className="pvc-file"><label htmlFor={`pvc-file-${side}`}><Upload size={17} /><span>{side === 'front' ? 'Front design' : 'Back design'}<small>PDF, JPG, PNG or WebP · Up to 20 MB</small></span><span className="pvc-file-pick">Choose file</span><input ref={input} className="pvc-sr-only" type="file" id={`pvc-file-${side}`} accept="application/pdf,image/jpeg,image/png,image/webp" aria-invalid={Boolean(error)} aria-describedby={error ? `pvc-file-error-${side}` : undefined} onChange={event => { const selected = event.target.files?.[0]; if (!selected) return; const message = validatePvcFile(selected); setError(message); onChange(message ? null : selected); if (message) event.target.value = ''; }} /></label>{file && <div className="pvc-file-selected"><FileCheck2 size={14} /><span>{file.name}</span><button type="button" aria-label={`Remove ${side} design`} onClick={() => { onChange(null); setError(''); if (input.current) input.current.value = ''; }}><X size={15} /></button></div>}{error && <p className="pvc-error" role="alert" id={`pvc-file-error-${side}`}>{error}</p>}</div>;
}

function CardEnquiry({ initialProduct, bulk, initialType, onAddToCart }) {
  const { rules, priceOverrides: overrides } = useBusinessRules();
  const shipping = rules?.shipping || {};
  const printFreeThreshold = shipping.printFreeThreshold ?? 799;
  const porterStarting = shipping.porterStarting ?? 59;
  const printsStarting = shipping.printsStarting ?? 69;
  const [draft, setDraft] = useState(() => createPvcDraft(initialProduct, { bulk, type: initialType }));
  const [files, setFiles] = useState({ front: null, back: null });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('edit');
  const [side, setSide] = useState('front');
  const [customQuantity, setCustomQuantity] = useState(false);
  const [added, setAdded] = useState(false);
  const form = useRef(null), panel = useRef(null), errorSummary = useRef(null), reviewHeading = useRef(null);
  const product = getPvcProduct(draft.productId);
  const type = getPvcType(draft.type);
  const category = PVC_CATEGORIES.find(item => item.id === product.category);
  const pricing = getPvcPricing({ quantity: draft.quantity, sides: draft.sides, accessories: draft.accessories, design: draft.design }, overrides);
  const { rates } = pricing;
  const accessoryLabel = PVC_ACCESSORIES.find(item => item.id === draft.accessories)?.label || 'Card only';
  const accessoryPriceLabel = item => {
    if (item.id === 'holder') return `${item.label} (+₹${rates.holder_extra})`;
    if (item.id === 'lanyard') return `${item.label} (+₹${rates.lanyard_extra})`;
    if (item.id === 'both') return `${item.label} (+₹${rates.both_accessories_extra})`;
    return item.label;
  };
  const update = (key, value) => { setDraft(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); };
  const setQuantity = value => { setDraft(current => ({ ...current, quantity: value, order: Number(value) > 1 ? 'bulk' : Number(value) === 1 ? 'single' : current.order })); setErrors(current => ({ ...current, quantity: undefined })); };
  const chooseProduct = id => { const next = getPvcProduct(id); setDraft(current => ({ ...current, productId: next.id, type: next.defaultType, orientation: next.orientation })); setFiles({ front: null, back: null }); setSide('front'); setErrors({}); };
  const move = next => { setStep(next); requestAnimationFrame(() => { panel.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); if (next === 'review') reviewHeading.current?.focus({ preventScroll: true }); }); };
  const review = event => { event.preventDefault(); const next = validatePvcDraft(draft); setErrors(next); if (Object.keys(next).length) { requestAnimationFrame(() => { errorSummary.current?.scrollIntoView({ behavior: 'instant', block: 'center' }); errorSummary.current?.focus({ preventScroll: true }); }); return; } move('review'); };
  const handleAddToBag = () => {
    if (!pricing.valid) {
      setErrors(current => ({ ...current, quantity: 'Enter a whole number from 1 to 100,000 cards.' }));
      requestAnimationFrame(() => document.getElementById('pvc-quantity')?.focus());
      return;
    }
    if (!onAddToCart) return;
    const purposeLabel = type?.label || product.title;
    const noteParts = [
      draft.organisation.trim() ? `Organisation: ${draft.organisation.trim()}` : '',
      draft.notes.trim(),
    ].filter(Boolean);
    onAddToCart({
      id: `pvc-${product.id}-${draft.sides}-${draft.accessories}-${draft.design}-${pricing.quantity}-${Date.now()}`,
      type: 'pvc_card',
      productId: product.id,
      title: `${product.title} (${pricing.quantity} ${pricing.quantity === 1 ? 'card' : 'cards'})`,
      size: PVC_SPEC.size,
      dimensions: draft.orientation === 'portrait' ? '54 × 86 mm' : '86 × 54 mm',
      orientation: draft.orientation,
      finish: `${draft.sides === 'double' ? 'Both sides' : 'Single side'} · ${accessoryLabel}`,
      format: `${purposeLabel} · ${PVC_SPEC.thickness} white coated PVC`,
      cardCount: pricing.quantity,
      quantity: 1,
      price: pricing.total,
      unitPrice: pricing.unitPrice,
      designFee: pricing.designFee,
      discountPercent: pricing.discountPercent,
      specialInstructions: noteParts.join(' — '),
      configuration: {
        productId: product.id,
        type: draft.type,
        cardCount: pricing.quantity,
        sides: draft.sides,
        orientation: draft.orientation,
        accessories: draft.accessories,
        design: draft.design,
        organisation: draft.organisation.trim(),
        frontFileName: files.front?.name || '',
        backFileName: draft.sides === 'double' ? (files.back?.name || '') : '',
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  const message = step === 'review' ? buildPvcMessage(draft, files, overrides) : '';
  const title = bulk ? 'PVC cards for your whole community.' : product.title;
  return <div className="pvc-page pvc-detail-page"><div className="pvc-container">
    <nav className="pvc-breadcrumb" aria-label="Breadcrumb"><Link to="/pvc-cards"><ArrowLeft size={12} /> PVC cards</Link><span>/</span><Link to={pvcCategoryPath(bulk ? 'bulk' : product.category)}>{bulk ? 'Bulk printing' : category.label}</Link>{!bulk && <><span>/</span><span>{product.title}</span></>}</nav>
    <header className="pvc-detail-heading"><span className="pvc-kicker">{bulk ? <Layers size={14} /> : <CreditCard size={14} />} {bulk ? 'THE BULK PVC DESK' : product.tag}</span><h1>{title}</h1><p>{bulk ? 'For schools, offices, gyms and local businesses. See instant per-card and bulk rates, add directly to your bag, or send a custom brief.' : product.description}</p></header>
    <div className="pvc-detail-layout"><aside className={`pvc-preview pvc-tone-${product.colour}`} aria-label="PVC card preview"><div className="pvc-preview-top"><span className="pvc-kicker"><span className="pvc-dot" /> DESIGN INSPIRATION</span><span>{draft.orientation === 'portrait' ? '54 × 86' : '86 × 54'} mm</span></div><div className={`pvc-preview-stage ${draft.orientation === 'portrait' ? 'is-portrait' : ''}`}><div><PvcCardArt product={product} orientation={draft.orientation} side={draft.sides === 'double' ? side : 'front'} /></div></div><div className="pvc-preview-bottom"><span>{type?.label || product.title}</span>{draft.sides === 'double' && <div className="pvc-preview-sides" role="group" aria-label="Preview card side">{['front', 'back'].map(value => <button type="button" key={value} aria-pressed={side === value} onClick={() => setSide(value)}>{value === 'front' ? 'Front' : 'Back'}</button>)}</div>}</div>
      <div className="pvc-preview-price" aria-live="polite">
        <div>
          <strong>{pricing.valid ? `₹${pricing.total.toLocaleString('en-IN')}` : `From ₹${rates.single_card}`}</strong>
          <small>{pricing.valid ? `${pricing.quantity.toLocaleString('en-IN')} ${pricing.quantity === 1 ? 'card' : 'cards'} · ₹${pricing.unitPrice}/card${pricing.designFee ? ` + ₹${pricing.designFee} design` : ''}` : 'Standard 0.76 mm coated PVC'}</small>
        </div>
        {pricing.valid && pricing.discountPercent > 0 && <span className="pvc-price-badge">Save {pricing.discountPercent}%</span>}
      </div>
      <p className="pvc-preview-caption">Illustrative sample. Your artwork and final layout are confirmed with the studio before printing.</p><div className="pvc-preview-specs"><span><Layers size={16} /><b>0.76 mm</b>White coated PVC</span><span><Sparkles size={16} /><b>Full colour</b>Your chosen layout</span></div><Link className="pvc-preview-browse" to="/pvc-cards">Explore other PVC cards <ArrowUpRight size={14} /></Link></aside>
      <div className="pvc-config" ref={panel}><div className="pvc-config-progress"><span aria-current={step === 'edit' ? 'step' : undefined}><b>{step === 'review' ? <Check size={12} /> : '01'}</b> Your card</span><ArrowRight size={13} /><span aria-current={step === 'review' ? 'step' : undefined}><b>02</b> Review & enquire</span></div><div className="pvc-config-heading"><span className="pvc-kicker">{step === 'edit' ? 'A FEW CHOICES. ALL YOURS.' : 'READY FOR THE STUDIO'}</span><h2 ref={reviewHeading} tabIndex={-1}>{step === 'edit' ? 'Let’s make it yours.' : 'Your card brief is ready.'}</h2><p>{step === 'edit' ? 'See live pricing as you customise. Add directly to your bag for checkout, or prepare a studio enquiry brief.' : 'Review the details, then open WhatsApp to send your enquiry and share the original files.'}</p></div>
        {step === 'edit' ? <form onSubmit={review} ref={form} noValidate>
          {Object.values(errors).some(Boolean) && <div ref={errorSummary} className="pvc-error-summary" role="alert" tabIndex={-1}><strong>Please check these details:</strong><ul>{Object.values(errors).filter(Boolean).map(error => <li key={error}>{error}</li>)}</ul></div>}
          <fieldset><legend><span>01</span> The card & quantity</legend>{bulk && <label className="pvc-field" htmlFor="pvc-product"><span>Choose a PVC product</span><select id="pvc-product" value={draft.productId} onChange={event => chooseProduct(event.target.value)}>{PVC_PRODUCTS.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
            <label className="pvc-field" htmlFor="pvc-purpose"><span>Card purpose</span><select id="pvc-purpose" value={draft.type} onChange={event => update('type', event.target.value)}>{PVC_CARD_TYPES.filter(item => item.productId === product.id).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <Choice label="Order type" value={draft.order} options={[{ value: 'single', label: 'Single card' }, { value: 'bulk', label: 'Bulk enquiry' }]} onChange={value => { setDraft(current => ({ ...current, order: value, quantity: value === 'single' ? '1' : Number(current.quantity) > 1 ? current.quantity : '25' })); setErrors(current => ({ ...current, quantity: undefined })); setCustomQuantity(false); }} />
            <div className="pvc-field"><span>Quantity</span><div className="pvc-quantity" role="group" aria-label="Card quantity">{PVC_QUANTITIES.map(quantity => <button key={quantity} type="button" aria-pressed={!customQuantity && Number(draft.quantity) === quantity} onClick={() => { setQuantity(String(quantity)); setCustomQuantity(false); }}>{quantity}</button>)}<button type="button" aria-pressed={customQuantity} onClick={() => { setCustomQuantity(true); requestAnimationFrame(() => document.getElementById('pvc-quantity')?.focus()); }}>Custom</button></div>{customQuantity && <label className="pvc-custom-quantity" htmlFor="pvc-quantity"><span>Number of cards</span><input id="pvc-quantity" type="text" inputMode="numeric" maxLength={8} value={draft.quantity} onChange={event => setQuantity(event.target.value)} aria-invalid={Boolean(errors.quantity)} aria-describedby={errors.quantity ? 'pvc-quantity-error' : undefined} /></label>}{errors.quantity && <span className="pvc-error" id="pvc-quantity-error">{errors.quantity}</span>}<small>Bulk savings: {bulkTierSummary}.</small></div>
          </fieldset>
          <fieldset><legend><span>02</span> Printing & presentation</legend><Choice label="Printing side" value={draft.sides} options={[{ value: 'single', label: `Single side (₹${rates.single_card})` }, { value: 'double', label: `Both sides (+₹${rates.double_side_extra})` }]} onChange={value => { update('sides', value); setSide('front'); }} /><Choice label="Card orientation" value={draft.orientation} options={[{ value: 'landscape', label: 'Horizontal' }, { value: 'portrait', label: 'Vertical' }]} onChange={value => update('orientation', value)} /><Choice label="Accessories" value={draft.accessories} options={PVC_ACCESSORIES.map(item => ({ value: item.id, label: accessoryPriceLabel(item) }))} onChange={value => update('accessories', value)} /><p className="pvc-field-hint">Holders and lanyards are included per card in the unit price above.</p></fieldset>
          <fieldset><legend><span>03</span> Your design</legend><Choice label="Design" value={draft.design} options={[{ value: 'upload', label: 'Upload your design (Free)' }, { value: 'design', label: `Get it designed (+₹${rates.design_fee})` }]} onChange={value => update('design', value)} />{draft.design === 'upload' ? <div className="pvc-artwork-files"><DesignFile key={`${product.id}-front`} side="front" file={files.front} onChange={value => setFiles(current => ({ ...current, front: value }))} />{draft.sides === 'double' && <DesignFile key={`${product.id}-back`} side="back" file={files.back} onChange={value => setFiles(current => ({ ...current, back: value }))} />}<p><FileCheck2 size={14} /><span>Choose files now or share originals later after placing your order or in WhatsApp.</span></p></div> : <p className="pvc-design-help"><Sparkles size={17} />One-time ₹{rates.design_fee} studio layout & design service included. Share your logo, wording, photos and references in WhatsApp or after checkout.</p>}</fieldset>
          <fieldset><legend><span>04</span> A little context</legend><div className="pvc-two-fields"><label className="pvc-field" htmlFor="pvc-name"><span>Your name <small>(required for enquiry)</small></span><input id="pvc-name" autoComplete="name" value={draft.name} maxLength={100} onChange={event => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'pvc-name-error' : undefined} />{errors.name && <span className="pvc-error" id="pvc-name-error">{errors.name}</span>}</label><label className="pvc-field" htmlFor="pvc-organisation"><span>Organisation <small>(optional)</small></span><input id="pvc-organisation" autoComplete="organization" value={draft.organisation} maxLength={150} onChange={event => update('organisation', event.target.value)} /></label></div><label className="pvc-field" htmlFor="pvc-notes"><span>Anything we should know? <small>(optional)</small></span><textarea id="pvc-notes" rows={3} maxLength={2000} value={draft.notes} placeholder={bulk ? 'Different names or photos, batch size, deadline, collection or delivery…' : 'Your wording, logo, a QR destination, a special date or delivery requirements…'} onChange={event => update('notes', event.target.value)} /><small>{draft.notes.length.toLocaleString('en-IN')}/2,000 characters</small></label></fieldset>
          <div className="pvc-price-box" aria-live="polite">
            <div className="pvc-price-row">
              <span>
                {pricing.valid ? `${pricing.quantity.toLocaleString('en-IN')} × ${draft.sides === 'double' ? 'Both-side' : 'Single-side'} PVC card` : 'PVC card printing'}
                {pricing.accessoryExtra > 0 ? ` + ${accessoryLabel}` : ''}
                <small>
                  {pricing.valid
                    ? pricing.discountPercent > 0
                      ? <><s>₹{pricing.unitBeforeDiscount}</s> ₹{pricing.unitPrice}/card · {pricing.tierLabel}</>
                      : `₹${pricing.unitPrice}/card`
                    : `From ₹${rates.single_card}/card`}
                </small>
              </span>
              <strong>{pricing.valid ? `₹${pricing.cardsSubtotal.toLocaleString('en-IN')}` : '—'}</strong>
            </div>
            {pricing.designFee > 0 && (
              <div className="pvc-price-row">
                <span>Studio custom design service<small>One-time layout & proof setup</small></span>
                <strong>+ ₹{pricing.designFee.toLocaleString('en-IN')}</strong>
              </div>
            )}
            {pricing.savings > 0 && (
              <div className="pvc-price-row is-savings">
                <span>Bulk quantity savings ({pricing.discountPercent}% off)</span>
                <strong>− ₹{pricing.savings.toLocaleString('en-IN')}</strong>
              </div>
            )}
            <div className="pvc-price-row">
              <span>
                Delivery (Porter / Courier)
                <small>{pricing.valid && pricing.total >= printFreeThreshold ? `Free delivery unlocked (₹${printFreeThreshold.toLocaleString('en-IN')}+ order) · Studio pickup free` : `Lucknow Porter ₹${porterStarting} · Pan-India ₹${printsStarting} · Free at ₹${printFreeThreshold.toLocaleString('en-IN')}+`}</small>
              </span>
              <strong>{pricing.valid && pricing.total >= printFreeThreshold ? 'Free' : `From ₹${porterStarting}`}</strong>
            </div>
            <div className="pvc-price-total">
              <span>Estimated total<small><MessageCircle size={13} /> Studio confirms artwork & final proof before printing.</small></span>
              <strong>{pricing.valid ? `₹${pricing.total.toLocaleString('en-IN')}` : 'Enter valid quantity'}</strong>
            </div>
          </div>
          <div className="pvc-config-actions">
            <span>
              <small>{pricing.valid ? `TOTAL · ${pricing.quantity.toLocaleString('en-IN')} ${pricing.quantity === 1 ? 'CARD' : 'CARDS'}` : 'YOUR CARD BRIEF'}</small>
              <strong>{pricing.valid ? `₹${pricing.total.toLocaleString('en-IN')}` : 'Custom quantity'}</strong>
            </span>
            <div className="pvc-action-buttons">
              <button className="pvc-primary" type="button" disabled={!pricing.valid || !onAddToCart} onClick={handleAddToBag}>
                {added ? <><Check size={16} /> Added to bag</> : <><ShoppingBag size={16} /> Add to Bag{pricing.valid ? ` · ₹${pricing.total.toLocaleString('en-IN')}` : ''}</>}
              </button>
              <button className="pvc-secondary" type="submit">Review enquiry <ArrowRight size={15} /></button>
            </div>
          </div>
        </form> : <div className="pvc-review"><div className="pvc-review-ready"><Check size={17} /><span>Prepared for {draft.name.trim()}<small>Final artwork proof confirmed by the studio</small></span></div><dl>{pvcEnquiryRows(draft, files, overrides).map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl><div className="pvc-review-reminder"><Upload size={16} /><p>After sending this brief, attach your original design or photos in WhatsApp. For bulk cards, include a list of names and the matching photos.</p></div><div className="pvc-config-actions"><button className="pvc-text-link" type="button" onClick={() => move('edit')}><ArrowLeft size={14} /> Edit details</button></div><StudioEnquiryReceipt itemType="pvc_card" title={product.title} details={message} name={draft.name} quantity={Number(draft.quantity)} /></div>}
      </div>
    </div><PvcFaq />
    {step === 'edit' && <div className="pvc-mobile-action"><span><small>{pricing.valid ? `${pricing.quantity.toLocaleString('en-IN')} ${pricing.quantity === 1 ? 'CARD' : 'CARDS'} · ₹${pricing.unitPrice}/CARD` : 'PVC CARD PRINT'}</small><strong>{pricing.valid ? `₹${pricing.total.toLocaleString('en-IN')}` : 'Enter valid qty'}</strong></span><div className="pvc-mobile-buttons"><button className="pvc-secondary" type="button" onClick={() => form.current?.requestSubmit()}>Enquire</button><button className="pvc-primary" type="button" disabled={!pricing.valid || !onAddToCart} onClick={handleAddToBag}>{added ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Add to Bag</>}</button></div></div>}
  </div></div>;
}

export function PvcCardPage({ bulk = false, onAddToCart }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const product = bulk ? PVC_PRODUCTS[0] : getPvcProduct(id);
  if (!product) return <div className="pvc-page"><div className="pvc-container pvc-empty"><CreditCard size={34} /><h1>Let’s find your card.</h1><p>This product isn’t in the collection. Explore our PVC cards or plan a custom batch.</p><Link className="pvc-primary" to="/pvc-cards">Explore PVC cards <ArrowRight size={16} /></Link></div></div>;
  return <CardEnquiry key={`${product.id}-${bulk}-${params.get('type') || ''}`} initialProduct={product} bulk={bulk} initialType={params.get('type')} onAddToCart={onAddToCart} />;
}
