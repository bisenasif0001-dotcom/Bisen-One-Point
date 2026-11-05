import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, Heart, ImagePlus, Mail, Maximize2, MessageCircle, ShoppingBag, Sparkles, Upload, X } from 'lucide-react';
import BirthdayCardPreview from '../components/BirthdayCardPreview';
import { CARD_CATEGORIES, CARD_DEMO_PHOTO, CARD_SIZES, CARD_TEMPLATES, MESSAGE_IDEAS, QUANTITY_DISCOUNTS } from '../data/birthdayCards';
import { birthdayOrderDetails, createBirthdayCardItem, getCardPricing, validateCard } from '../utils/birthdayCards';
import { savePrintOriginals } from '../utils/printPhotoStorage';
import { getWhatsAppUrl } from '../data/businessConfig';
import './BirthdayCardBuilderPage.css';

const money = value => `₹${value.toLocaleString('en-IN')}`;
const STEPS = [{ title: 'Choose a design', detail: 'Find their kind of lovely' }, { title: 'Make it personal', detail: 'Your photo. Your words.' }, { title: 'The finishing touches', detail: 'Size, quantity & review' }];
const INITIAL_CONFIG = { templateId: CARD_TEMPLATES[0].id, recipientName: '', headline: CARD_TEMPLATES[0].sampleGreeting, message: '', signoff: '', sizeId: '5x7', cardCount: 1, includePhoto: false, photoFit: 'cover', panX: 50, panY: 50 };

function PreviewControls({ view, onChange }) {
  return <div className="bday-view-switch" role="group" aria-label="Card preview side"><button type="button" aria-pressed={view === 'front'} onClick={() => onChange('front')}><Mail size={15} /> Front cover</button><button type="button" aria-pressed={view === 'inside'} onClick={() => onChange('inside')}><BookOpen size={15} /> Open card</button></div>;
}

function CardScene({ config, photo, view, artworkRef }) {
  return <div className={`bday-scene bday-scene-${view}`}>
    {view === 'front' && <div className="bday-envelope" aria-hidden="true"><span><Heart size={15} strokeWidth={1.3} /></span></div>}
    <div ref={artworkRef} className="bday-artwork"><BirthdayCardPreview config={config} photo={photo} view={view} className={view === 'inside' ? 'bday-inside-spread' : undefined} />{view === 'inside' && <BirthdayCardPreview config={config} photo={photo} view="inside" singlePage className="bday-inside-page" />}</div>
  </div>;
}

function PreviewDialog({ config, photo, view, setView, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current, previousOverflow = document.body.style.overflow;
    dialog.showModal(); document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={dialogRef} className="bday-dialog" aria-label="Your birthday card preview" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><div><span className="bday-eyebrow">YOUR WORDS, BEAUTIFULLY SET</span><h2>A closer look.</h2></div><button type="button" className="bday-icon" autoFocus aria-label="Close card preview" onClick={onClose}><X size={22} /></button></header>
    <PreviewControls view={view} onChange={setView} /><CardScene config={config} photo={photo} view={view} />
    <p className="bday-preview-note">{view === 'inside' ? 'Your inside message · Printed on the right-hand page.' : 'The front cover · Colours on paper may vary slightly from your screen.'}</p>
  </dialog>;
}

async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP photograph.');
  if (file.size > 20 * 1024 * 1024) throw new Error('This photo is over 20 MB. Choose a smaller original.');
  const temporaryUrl = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = temporaryUrl; await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('This photograph could not be opened. Please choose another file.');
    const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { id: `card-photo-${crypto.randomUUID()}`, file, name: file.name, width: image.naturalWidth, height: image.naturalHeight, url: canvas.toDataURL('image/jpeg', .82), isSample: false };
  } finally { URL.revokeObjectURL(temporaryUrl); }
}

export default function BirthdayCardBuilderPage({ onAddToCart }) {
  const [step, setStep] = useState(0), [category, setCategory] = useState('All');
  const [config, setConfig] = useState(INITIAL_CONFIG), [photo, setPhoto] = useState(null);
  const [view, setView] = useState('front'), [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const inputRef = useRef(null), editorRef = useRef(null), previewOpener = useRef(null), frontRef = useRef(null), errorRef = useRef(null);
  const template = CARD_TEMPLATES.find(item => item.id === config.templateId);
  const size = CARD_SIZES.find(item => item.id === config.sizeId);
  const pricing = getCardPricing(config.sizeId, config.cardCount);
  const previewPhoto = photo || { ...CARD_DEMO_PHOTO, isSample: true };
  const filtered = CARD_TEMPLATES.filter(item => category === 'All' || item.category === category);
  const update = (key, value) => { setConfig(current => ({ ...current, [key]: value })); setError(''); };
  const showError = message => { setError(message); requestAnimationFrame(() => { errorRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); errorRef.current?.focus({ preventScroll: true }); }); };
  const goTo = next => {
    setStep(next); setError('');
    if (next === 0) setView('front');
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };
  const nextStep = () => {
    if (step === 1) {
      const problem = validateCard(config, photo);
      if (problem) { showError(problem); return; }
    }
    goTo(Math.min(2, step + 1));
  };
  const chooseTemplate = item => {
    setConfig(current => ({ ...current, templateId: item.id, headline: current.headline === template.sampleGreeting ? item.sampleGreeting : current.headline, includePhoto: item.hasPhoto && (item.photoFirst || Boolean(photo && current.includePhoto)) }));
    setError(''); setView('front');
  };
  const upload = async file => {
    if (!file || uploading) return;
    setUploading(true); setError('');
    try { const prepared = await preparePhoto(file); setPhoto(prepared); setConfig(current => ({ ...current, includePhoto: true, panX: 50, panY: 50 })); setView('front'); }
    catch (problem) { showError(problem.message || 'This photo could not be opened. Try a different image.'); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  const openPreview = event => { previewOpener.current = event.currentTarget; setPreviewOpen(true); };
  const closePreview = () => { setPreviewOpen(false); requestAnimationFrame(() => previewOpener.current?.focus({ preventScroll: true })); };
  const addToBag = async () => {
    const problem = validateCard(config, photo);
    if (problem) { showError(problem); return; }
    setBusy(true); setError('');
    try {
      // Keep the exact vector design in the order, with a compact photo preview. Originals stay on this device.
      const svg = frontRef.current.querySelector('svg').outerHTML;
      const image = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      const item = createBirthdayCardItem(config, photo, image);
      if (config.includePhoto) await savePrintOriginals([photo]);
      onAddToCart(item);
    } catch (problem) { showError(problem.message || 'Your card could not be added. Please try again.'); }
    finally { setBusy(false); }
  };
  const askStudio = () => {
    const problem = validateCard(config, photo);
    if (problem) { showError(problem); return; }
    const item = createBirthdayCardItem(config, photo, '');
    window.open(getWhatsAppUrl(`Hello AL-NOOR! I’d like to discuss this birthday card.\n\n${birthdayOrderDetails(item)}\nSize: ${size.name} (${size.dimensionsCm})\nCard total: ${money(pricing.total)} (delivery extra)`), '_blank', 'noopener,noreferrer');
  };

  return <div className="bday-page">
    <div className="bday-wrap">
      <div className="bday-intro"><div><span className="bday-eyebrow"><Heart size={13} /> THE BIRTHDAY CARD STUDIO</span><h1>A little paper.<br /><em>A lot of heart.</em></h1><p>For their day. In your words. Create a birthday card that feels like it could only come from you.</p></div><aside><span className="bday-intro-mark" aria-hidden="true">with<br /><em>love.</em></span><div><span>MADE TO BE KEPT</span><p>350 GSM textured board<br />A matching envelope with every card</p><strong>From ₹149 <small>/ personalised card</small></strong></div></aside></div>
      <nav className="bday-steps" aria-label="Card designer steps">{STEPS.map((item, index) => <button type="button" key={item.title} aria-current={step === index ? 'step' : undefined} onClick={() => goTo(index)}><span className="bday-step-number">{index < step ? <Check size={16} /> : `0${index + 1}`}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><ChevronRight size={17} /></button>)}</nav>
      <div className={`bday-studio bday-step-${step}`}>
        <aside className="bday-preview" aria-label="Live card preview"><div className="bday-preview-top"><span className="bday-eyebrow"><i /> YOUR CARD, COMING TO LIFE</span><button type="button" className="bday-icon" aria-label="Enlarge card preview" onClick={openPreview}><Maximize2 size={17} /></button></div>
          <PreviewControls view={view} onChange={setView} /><CardScene config={config} photo={previewPhoto} view={view} />
          <div className="bday-preview-caption"><span>{view === 'front' ? template.name : 'A note, just for them.'}</span><small>{view === 'front' ? 'Front cover' : 'Inside message'} · {size.name}</small></div>
          <div className="bday-paper-note"><Mail size={17} /><span>Folded with care.<br /><small>Textured card + matching envelope included.</small></span><Heart size={18} strokeWidth={1.2} /></div>
          {config.includePhoto && !photo && <p className="bday-sample-note">Sample photo for inspiration. Add your own in step 2.</p>}
        </aside>
        <div className="bday-editor" ref={editorRef}>
          <div className="bday-editor-heading"><span className="bday-eyebrow">STEP 0{step + 1} / 03</span><button type="button" className="bday-mobile-preview" onClick={openPreview}><Maximize2 size={14} /> Live preview</button><h2>{step === 0 ? 'Find their kind of lovely.' : step === 1 ? 'Make it unmistakably yours.' : 'Ready for their big day.'}</h2><p>{step === 0 ? 'A quiet note or a little celebration? Start with a design that feels like them.' : step === 1 ? 'A name on the cover. A favourite memory. Words they’ll want to keep.' : 'Choose your card size, then check the details before adding it to your bag.'}</p></div>
          {step === 0 && <div className="bday-design-panel"><div className="bday-categories" role="group" aria-label="Filter card designs">{CARD_CATEGORIES.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="bday-design-grid">{filtered.map(item => <button type="button" key={item.id} className="bday-design" aria-pressed={config.templateId === item.id} onClick={() => chooseTemplate(item)}><div className="bday-design-art"><BirthdayCardPreview decorative demo config={{ templateId: item.id, headline: item.sampleGreeting, includePhoto: Boolean(item.photoFirst) }} /><span className="bday-selected-check"><Check size={14} /></span></div><span className="bday-design-label"><strong>{item.name}</strong><small>{item.category}</small></span></button>)}</div><p className="bday-selection-note"><Check size={14} /><span><strong>{template.name}</strong> · {template.description}</span></p></div>}
          {step === 1 && <div className="bday-personalise">
            <div className="bday-field-row"><label>Who’s it for?<span><input value={config.recipientName} maxLength={30} onChange={e => update('recipientName', e.target.value)} onFocus={() => setView('front')} placeholder="Their first name" autoComplete="off" /><small>{config.recipientName.length}/30</small></span></label><label>Front-cover greeting<span><input value={config.headline} maxLength={48} onChange={e => update('headline', e.target.value)} onFocus={() => setView('front')} /><small>{config.headline.length}/48</small></span></label></div>
            {template.hasPhoto && <div className="bday-photo-section"><div className="bday-field-title"><span><ImagePlus size={16} /> A favourite photograph</span><small>Optional</small></div><div className="bday-segment" role="group" aria-label="Include a photograph"><button type="button" aria-pressed={!config.includePhoto} onClick={() => { update('includePhoto', false); setView('front'); }}>Without photo</button><button type="button" aria-pressed={config.includePhoto} onClick={() => { update('includePhoto', true); setView('front'); }}>With photo</button></div>
              {config.includePhoto && <><button type="button" className="bday-upload" disabled={uploading} onClick={() => inputRef.current.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files[0]); }}>{photo ? <img src={photo.url} alt="Your uploaded photograph" /> : <span className="bday-upload-icon"><Upload size={21} /></span>}<span><strong>{uploading ? 'Preparing your photo…' : photo ? 'Change photograph' : 'Upload a favourite memory'}</strong><small>{photo ? photo.name : 'Choose a file or drop it here · JPG, PNG, WebP · Up to 20 MB'}</small></span><ArrowUpRight size={17} /></button><input ref={inputRef} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={e => upload(e.target.files[0])} />
              {photo ? <><div className="bday-segment" role="group" aria-label="Photo fit"><button type="button" aria-pressed={config.photoFit === 'cover'} onClick={() => { update('photoFit', 'cover'); setView('front'); }}>Fill photo area</button><button type="button" aria-pressed={config.photoFit === 'contain'} onClick={() => { update('photoFit', 'contain'); setView('front'); }}>Keep whole photo</button></div>{config.photoFit === 'cover' && <div className="bday-crop"><label>Move left / right<input type="range" min="0" max="100" value={config.panX} onChange={e => { update('panX', Number(e.target.value)); setView('front'); }} /></label><label>Move up / down<input type="range" min="0" max="100" value={config.panY} onChange={e => { update('panY', Number(e.target.value)); setView('front'); }} /></label></div>}<p className="bday-help">Your original stays on this device. Share it with the studio when confirming your order.</p></> : <p className="bday-help">The preview uses a sample. Your own photo is required to order this version.</p>}</>}
            </div>}
            <div className="bday-message-section"><div className="bday-field-title"><span><BookOpen size={16} /> The words inside</span><button type="button" className="bday-text-button" onClick={event => { setView('inside'); openPreview(event); }}>See inside <ArrowUpRight size={13} /></button></div><label>Your birthday message<textarea rows={5} maxLength={400} placeholder="A wish, a memory, a little thank-you…" value={config.message} onChange={e => update('message', e.target.value)} onFocus={() => setView('inside')} /><span className="bday-field-help"><span>Printed on the right-hand page. Up to 10 lines.</span><span>{config.message.length}/400</span></span></label><details className="bday-message-ideas"><summary><Sparkles size={14} /> Need a little inspiration?</summary><p>Choose a starting point, then make the words your own. This replaces the message above.</p><div>{MESSAGE_IDEAS.map(idea => <button type="button" key={idea.label} onClick={() => { update('message', idea.text); setView('inside'); }}>{idea.label} <span>+</span></button>)}</div></details></div>
            <label>From you<input value={config.signoff} maxLength={64} placeholder="With love, Zaid & family" onChange={e => update('signoff', e.target.value)} onFocus={() => setView('inside')} /><span className="bday-field-help"><span>Your name or a personal sign-off.</span><span>{config.signoff.length}/64</span></span></label>
          </div>}
          {step === 2 && <div className="bday-review">
            <fieldset><legend>The size of your sentiment <small>Dimensions when folded</small></legend><div className="bday-size-options">{CARD_SIZES.map(item => <button type="button" key={item.id} aria-pressed={config.sizeId === item.id} onClick={() => update('sizeId', item.id)}><span className={`bday-size-symbol bday-size-${item.id}`} /><strong>{item.name}</strong><small>{item.dimensionsCm}</small><span>{item.label}</span><b>{money(item.unitPrice)} <small>/ card</small></b>{item.id === config.sizeId && <Check size={13} />}</button>)}</div></fieldset>
            <fieldset><legend>How many cards? <small>Same design & message in each set</small></legend><div className="bday-quantity-options">{QUANTITY_DISCOUNTS.map(item => <button type="button" key={item.qty} aria-pressed={config.cardCount === item.qty} onClick={() => update('cardCount', item.qty)}><strong>{item.qty}</strong><small>{item.qty === 1 ? 'card' : 'cards'}</small>{item.discountPercent > 0 && <span>−{item.discountPercent}%</span>}</button>)}</div></fieldset>
            <div className="bday-order-review"><div className="bday-review-title"><span><Check size={16} /> YOUR CARD AT A GLANCE</span><button type="button" className="bday-text-button" onClick={() => goTo(1)}>Edit details <ArrowUpRight size={13} /></button></div><dl><div><dt>Design</dt><dd>{template.name}</dd></div><div><dt>For</dt><dd>{config.recipientName || 'Add their name'}</dd></div><div><dt>Cover</dt><dd>{config.headline}</dd></div><div><dt>Photograph</dt><dd>{config.includePhoto ? photo?.name || 'Upload your photo' : 'Without photo'}</dd></div></dl><p className="bday-review-message">{config.message || 'Add your personal message in step 2.'}</p><p className="bday-review-signoff">{config.signoff || 'Add your sign-off in step 2.'}</p><button type="button" className="bday-text-button" onClick={event => { setView('inside'); openPreview(event); }}>Check the open card <BookOpen size={14} /></button></div>
            <div className="bday-price-summary"><div><span>{config.cardCount} {config.cardCount === 1 ? 'card' : 'cards'} × {money(size.unitPrice)}</span><span>{money(pricing.baseTotal)}</span></div>{pricing.savings > 0 && <div className="bday-saving"><span>Set saving · {pricing.percent}%</span><span>−{money(pricing.savings)}</span></div>}<div className="bday-order-total"><span>Card total<small>Envelope included with every card</small></span><strong>{money(pricing.total)}</strong></div><p>Delivery charges calculated at checkout.</p></div>
            <p className="bday-proof-note"><Heart size={16} /><span>Please check names, spelling and photo placement. Your selected design and full message are saved with your order.</span></p>
          </div>}
          {error && <p className="bday-error" ref={errorRef} tabIndex={-1} role="alert">{error}</p>}
          <div className="bday-editor-actions">{step > 0 ? <button type="button" className="bday-back" onClick={() => goTo(step - 1)}><ArrowLeft size={16} /> Back</button> : <span className="bday-action-hint">Seven designs.<br /><em>One very personal card.</em></span>}{step < 2 ? <button type="button" className="bday-primary" onClick={nextStep}>{step === 0 ? 'Make it personal' : 'Size & review'} <ArrowRight size={16} /></button> : <button type="button" className="bday-primary" disabled={busy || uploading} onClick={addToBag}><ShoppingBag size={16} /> {busy ? 'Saving your card…' : `Add to bag · ${money(pricing.total)}`} <ArrowRight size={16} /></button>}</div>
          {step === 2 && <button type="button" className="bday-studio-help" onClick={askStudio}><MessageCircle size={15} /> Prefer to discuss it? Ask the studio <ArrowUpRight size={14} /></button>}
        </div>
      </div>
      <div className="bday-bottom-note"><Heart size={18} /><span>A birthday lasts a day.<br /><em>A thoughtful note stays a little longer.</em></span><span>DESIGNED BY YOU. PRINTED AT AL-NOOR.</span></div>
    </div>
    <div className="bday-hidden-art" ref={frontRef} aria-hidden="true"><BirthdayCardPreview config={config} photo={photo} /></div>
    {previewOpen && <PreviewDialog config={config} photo={previewPhoto} view={view} setView={setView} onClose={closePreview} />}
  </div>;
}

