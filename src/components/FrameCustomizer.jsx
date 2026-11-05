import { savePrintOriginals } from '../utils/printPhotoStorage';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown,
  Crop, Expand, Frame, Image as ImageIcon, Info, Maximize, MessageCircle,
  RotateCcw, Ruler, SlidersHorizontal, Upload, X,
} from 'lucide-react';
import { FRAME_FINISHES, MAT_OPTIONS, GLASS_OPTIONS } from '../data/products';
import { FRAME_STUDIO_SAMPLES } from '../data/frameStudioSamples';
import { FRAME_PREVIEW_APERTURES } from '../data/framePreviewApertures';
import { getWhatsAppUrl } from '../data/businessConfig';
import {
  CUSTOM_FRAME_SIZES as FRAME_SIZES,
  getStudioPrice,
  getStudioQuality,
  STUDIO_FILTERS,
  validateStudioFile,
  readStudioPhoto,
  measureStudioImage as measureImage,
} from '../utils/frameStudio';
import FramedPosterPreview from './FramedPosterPreview';
import StudioOrderButton from './StudioOrderButton';
import './FrameCustomizer.css';

const STEPS = [
  { id: 'photo', label: 'Your photo', description: 'Upload & adjust' },
  { id: 'frame', label: 'Size & frame', description: 'Find your finish' },
  { id: 'review', label: 'Review & order', description: 'Make it yours' },
];
const WALLS = [
  { id: 'linen', name: 'Warm linen', color: '#e7e3d8' },
  { id: 'sage', name: 'Soft sage', color: '#dce3d3' },
  { id: 'white', name: 'Gallery white', color: '#f3f2ec' },
  { id: 'charcoal', name: 'Deep charcoal', color: '#35413c' },
];
const money = value => `₹${value.toLocaleString('en-IN')}`;
const samplePhoto = sample => ({ url: sample.url, name: sample.name, width: sample.width ?? null, height: sample.height ?? null, isSample: true });

function FrameOrientationControl({ orientation, onChange, label }) {
  return (
    <div className="fs-segmented fs-orientation-control" role="group" aria-label={label}>
      {['portrait', 'landscape'].map(value => (
        <button type="button" key={value} aria-pressed={orientation === value}
          className={orientation === value ? 'selected' : ''} onClick={() => onChange(value)}>
          <span className={`fs-orientation-icon${value === 'landscape' ? ' horizontal' : ''}`} aria-hidden="true" />
          {value === 'portrait' ? 'Portrait' : 'Landscape'}
        </button>
      ))}
    </div>
  );
}

function PreviewDialog({ children, onClose, frameName }) {
  const dialog = useRef(null);
  useEffect(() => {
    const el = dialog.current;
    el.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { el.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog className="fs-preview-dialog" ref={dialog} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-label={`Enlarged ${frameName} frame preview`}><button className="fs-dialog-close" onClick={onClose} aria-label="Close enlarged preview"><X size={22} /></button><div className="fs-dialog-art">{children}</div><p>{frameName} · Your selected photo and finish</p></dialog>;
}

export default function FrameCustomizer({
  onAddToCart,
  onOpenSizeGuide,
  preselectedFrameId = null,
  preselectedSizeId = null,
  initialOrientation = 'portrait',
  initialPhoto = null,
  requestUpload = false,
}) {
  const initialFrame = FRAME_FINISHES.find(f => f.id === preselectedFrameId || f.legacyId === preselectedFrameId) || FRAME_FINISHES[0];
  const [step, setStep] = useState('photo');
  const [photo, setPhoto] = useState(() => initialPhoto?.url ? initialPhoto : samplePhoto(
    FRAME_STUDIO_SAMPLES.find(sample => sample.orientation === (initialOrientation === 'landscape' ? 'landscape' : 'portrait')),
  ));
  const [sizeId, setSizeId] = useState(FRAME_SIZES.some(size => size.id === preselectedSizeId) ? preselectedSizeId : 'A4');
  const [frameId, setFrameId] = useState(initialFrame.id);
  const [glassId, setGlassId] = useState(GLASS_OPTIONS[0].id);
  const [orientation, setOrientation] = useState(initialOrientation === 'landscape' ? 'landscape' : 'portrait');
  const [fit, setFit] = useState('contain');
  const [panX, setPanX] = useState(50);
  const [panY, setPanY] = useState(50);
  const [filterId, setFilterId] = useState('original');
  const [quantity, setQuantity] = useState('1');
  const [wallId, setWallId] = useState('linen');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState('All frames');
  const uploadInput = useRef(null);
  const uploadTarget = useRef(null);
  const uploadSequence = useRef(0);
  const mounted = useRef(true);
  const panelTitle = useRef(null);
  const quantityInput = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; uploadSequence.current += 1; };
  }, []);
  useEffect(() => {
    if (!photo.isSample) return;
    let cancelled = false;
    measureImage(photo.url).then(dimensions => {
      if (!cancelled) setPhoto(current => current.url === photo.url && current.isSample ? { ...current, ...dimensions, loadError: false } : current);
    }).catch(() => { if (!cancelled) setPhoto(current => current.url === photo.url && current.isSample ? { ...current, loadError: true } : current); });
    return () => { cancelled = true; };
  }, [photo.url, photo.isSample]);
  useEffect(() => { if (requestUpload) uploadTarget.current?.focus(); }, [requestUpload]);

  const frame = FRAME_FINISHES.find(f => f.id === frameId) || initialFrame;
  const size = FRAME_SIZES.find(s => s.id === sizeId);
  const [widthCm, heightCm] = size.dimensionsCm.split(' x ').map(parseFloat);
  const displayDimensions = orientation === 'landscape' ? `${heightCm} × ${widthCm} cm` : `${widthCm} × ${heightCm} cm`;
  const glass = GLASS_OPTIONS.find(g => g.id === glassId);
  const mount = MAT_OPTIONS[0];
  const filter = STUDIO_FILTERS.find(f => f.id === filterId);
  const wall = WALLS.find(w => w.id === wallId);
  const count = Number(quantity);
  const price = getStudioPrice({ sizeId, frameId: frame.id, glassId, quantity: count });
  const unitPrice = getStudioPrice({ sizeId, frameId: frame.id, glassId, quantity: 1 });
  const quality = !photo.isSample ? getStudioQuality({ photoWidth: photo.width, photoHeight: photo.height, sizeId, orientation, fit }) : null;
  const frames = FRAME_FINISHES.filter(f => FRAME_PREVIEW_APERTURES[f.id] && (f.availableSizes.includes(sizeId) || sizeId === '12x18') && (category === 'All frames' || f.category === category));
  const previewPoster = { image: photo.url, title: photo.isSample ? 'Sample photo' : photo.name, width: photo.width, height: photo.height };
  const previewProps = { poster: previewPoster, frame, orientation, fit, panX, panY, filter: filter.css };
  const update = (setter, value) => setter(value);
  const goTo = next => {
    setStep(next);
    requestAnimationFrame(() => {
      panelTitle.current?.focus({ preventScroll: true });
      if (window.innerWidth < 900) document.getElementById('fs-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  const resetPosition = () => { setPanX(50); setPanY(50); };
  const changeOrientation = value => { setOrientation(value); resetPosition(); };
  const chooseSample = sample => {
    uploadSequence.current += 1;
    setPhoto(samplePhoto(sample)); setUploading(false); setUploadError('');
    changeOrientation(sample.orientation);
  };
  const chooseFile = async file => {
    const sequence = ++uploadSequence.current;
    setUploading(false);
    const error = validateStudioFile(file);
    if (error) { setUploadError(error); return; }
    setUploadError(''); setUploading(true);
    try {
      const loadedPhoto = await readStudioPhoto(file);
      if (!mounted.current || uploadSequence.current !== sequence) return;
      setPhoto(loadedPhoto);
      setPanX(50); setPanY(50);
    } catch (error) {
      if (mounted.current && uploadSequence.current === sequence) setUploadError(error.message);
    } finally {
      if (mounted.current && uploadSequence.current === sequence) setUploading(false);
    }
  };
  const orderReady = !photo.isSample && !uploading && !saving && Boolean(price);
  const addToBag = async () => {
    if (!orderReady) return;
    setSaving(true); setOrderError('');
    try {
    await savePrintOriginals([photo]);
    onAddToCart?.({
      id: `custom-frame-${crypto.randomUUID()}`,
      type: 'custom_frame', title: `${frame.name} Photo Frame`,
      frameId: frame.id, originalId: photo.id, photoUrl: photo.url, photoName: photo.name, image: photo.url,
      photoWidth: photo.width, photoHeight: photo.height,
      size: size.id, dimensions: displayDimensions, dimensionsInch: size.dimensionsInch,
      finish: frame.name, finishColor: frame.colorHex, mat: mount.name, glass: glass.name,
      orientation, fit, panX, panY, filter: filterId, filterCss: filter.css,
      price: price.unit, quantity: count,
      personalisation: { frameId: frame.id, photoName: photo.name, size: size.id, orientation, fit, panX, panY, filter: filter.label, mount: 'As shown in catalogue', glass: glass.name },
    });
    } catch (error) { setOrderError(error.message || 'The original photo could not be saved. Please try again.'); } finally { setSaving(false); }
  };
  const enquiry = `Hello! I would like help with this custom frame.\nFrame: ${frame.name} (${frame.id})\nSize: ${size.id} (${displayDimensions})\nOrientation: ${orientation}\nPhoto fit: ${fit === 'contain' ? 'Keep full photo' : 'Fill opening (crop)'}\nCrop position: ${panX}% horizontal, ${panY}% vertical\nPhoto effect: ${filter.label}\nMount: ${mount.name} (catalogue style)\nGlazing: ${glass.name}\nQuantity: ${price ? count : 'Please advise'}\nFrame price: ${money(unitPrice.unit)} each + delivery.\n${photo.isSample ? 'I am exploring with a sample photo.' : 'I will attach the original photograph here.'}`;
  const nextStep = step === 'photo' ? 'frame' : 'review';

  return <div className="frame-studio-page">
    <div className="fs-intro"><div><Link to="/frames-catalogue" className="fs-back-link"><ArrowLeft size={13} /> Explore our frames</Link><span className="fs-eyebrow">THE PERSONAL FRAME STUDIO</span><h1>A memory worth framing.</h1><p>Your photo. Our real frames. A preview you can make your own.</p></div><div className="fs-intro-note"><Frame size={22} /><span><strong>{FRAME_FINISHES.length} real frame designs</strong><small>See your photo inside the actual frame.</small></span></div></div>
    <nav className="fs-steps" aria-label="Custom frame steps">{STEPS.map((item, i) => <button key={item.id} aria-current={step === item.id ? 'step' : undefined} className={step === item.id ? 'active' : ''} onClick={() => goTo(item.id)}><span className="fs-step-number">{i === 0 && !photo.isSample ? <Check size={15} /> : `0${i + 1}`}</span><span><strong>{item.label}</strong><small>{item.description}</small></span><ArrowRight className="fs-step-arrow" size={16} /></button>)}</nav>
    <input ref={uploadInput} className="fs-hidden-input" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose a photo file" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) chooseFile(file); }} />
    <div className="fs-workspace">
      <div className="fs-preview-column"><div className="fs-preview-card"><div className="fs-stage-toolbar"><span><span /> LIVE PREVIEW <small>{photo.isSample ? 'SAMPLE PHOTO' : 'YOUR PHOTO'}</small></span><button onClick={() => setExpanded(true)} aria-label="Enlarge frame preview"><Expand size={16} /><span>Enlarge</span></button></div><div className="fs-preview-orientation"><span className="fs-control-label">FRAME ORIENTATION</span><FrameOrientationControl orientation={orientation} onChange={changeOrientation} label="Preview frame orientation" /></div><div className={`fs-wall fs-wall-${wall.id}`} style={{ backgroundColor: wall.color }}><div className="fs-wall-light" aria-hidden="true" />{photo.loadError ? <div className="fs-photo-placeholder"><ImageIcon size={35} /><p>Make this space yours.</p><button className="fs-text-button" onClick={() => uploadInput.current?.click()}>Upload your photo <Upload size={15} /></button></div> : <div className={`fs-framed-art fs-orientation-${orientation}`} style={{ '--frame-scale': size.scaleRatio }}><FramedPosterPreview {...previewProps} /></div>}<span className="fs-preview-size">{size.id} / {displayDimensions}</span></div><div className="fs-wall-picker"><span>Try a wall colour</span><div>{WALLS.map(option => <button key={option.id} title={option.name} aria-label={option.name} aria-pressed={wallId === option.id} className={wallId === option.id ? 'selected' : ''} onClick={() => setWallId(option.id)} style={{ '--wall-colour': option.color }} />)}</div><span className="fs-wall-name">{wall.name}</span></div><div className="fs-selected-frame"><span className="fs-selected-thumb"><img src={frame.frontImage} alt="" /></span><span><strong>{frame.name}</strong><small>{frame.finish}</small></span><button className="fs-text-button" onClick={() => goTo('frame')}>Change frame <ArrowRight size={14} /></button></div></div><div className="fs-photo-fit"><div><span className="fs-control-label">PHOTO FIT</span><div className="fs-segmented">{[['contain', 'Keep full photo', Maximize], ['cover', 'Fill opening', Crop]].map(([value, label, Icon]) => <button key={value} aria-pressed={fit === value} className={fit === value ? 'selected' : ''} onClick={() => { update(setFit, value); setPanX(50); setPanY(50); }}><Icon size={14} />{label}</button>)}</div></div><p>{fit === 'contain' ? 'Your complete photo stays visible. White space may appear around it.' : 'The opening is filled. Some photo edges are cropped; adjust the position below.'}</p>{fit === 'cover' && <div className="fs-position-controls"><label>Left / right<input type="range" min="0" max="100" value={panX} onChange={e => update(setPanX, Number(e.target.value))} /></label><label>Up / down<input type="range" min="0" max="100" value={panY} onChange={e => update(setPanY, Number(e.target.value))} /></label><button className="fs-text-button" onClick={resetPosition}><RotateCcw size={12} /> Centre photo</button></div>}</div><p className="fs-preview-caption">Preview uses our actual catalogue frame photography. Final outside dimensions vary by size and moulding.</p></div>
      <div className="fs-editor" id="fs-editor"><div className="fs-panel-heading"><span className="fs-eyebrow">STEP {STEPS.findIndex(s => s.id === step) + 1} OF 3</span><h2 tabIndex={-1} ref={panelTitle}>{step === 'photo' ? 'Start with a favourite photo.' : step === 'frame' ? 'A frame that feels like you.' : 'One last look. All yours.'}</h2><p>{step === 'photo' ? 'Upload an original photo for the best print. You can explore with a sample first.' : step === 'frame' ? 'Choose a size, then tap a real frame to see your photo inside it.' : 'Check your photo, frame and finish before adding to your bag.'}</p></div>
        {step === 'photo' && <div className="fs-photo-step"><button className={`fs-drop-zone ${dragging ? 'is-dragging' : ''} ${!photo.isSample ? 'has-photo' : ''}`} ref={uploadTarget} onClick={() => uploadInput.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) chooseFile(file); }} disabled={uploading}><span className="fs-upload-icon">{uploading ? <span className="fs-spinner" /> : !photo.isSample ? <CheckCircle2 size={23} /> : <Upload size={23} />}</span><strong>{uploading ? 'Preparing your photo…' : photo.isSample ? 'Drop your photo here' : photo.name}</strong><span>{uploading ? 'Checking your image before previewing' : photo.isSample ? <>or <u>browse files</u> on your device</> : 'Click to replace with another photo'}</span><small>JPG, PNG or WebP · Up to 20 MB</small></button>{uploadError && <p className="fs-error" role="alert"><Info size={15} />{uploadError}</p>}{!photo.isSample && <div className={`fs-quality fs-quality-${quality?.level || 'fair'}`}><ImageIcon size={18} /><div><strong>{photo.width} × {photo.height} pixels</strong><p>{quality?.label} {quality && <span>· Approx. {quality.dpi} PPI at {size.id}</span>}</p></div></div>}<div className="fs-samples"><div className="fs-label-row"><span className="fs-control-label">JUST EXPLORING? TRY A SAMPLE</span><span>Preview only</span></div><div className="fs-sample-grid">{FRAME_STUDIO_SAMPLES.map(sample => <button className="fs-sample-option" data-orientation={sample.orientation} aria-label={`Preview ${sample.name}, ${sample.orientation} sample`} key={sample.id} aria-pressed={photo.isSample && photo.url === sample.url} onClick={() => chooseSample(sample)} title={sample.name}><img src={sample.url} alt={sample.name} loading="lazy" /><small className="fs-sample-caption">{sample.orientation === 'portrait' ? 'Portrait' : 'Landscape'}</small>{photo.isSample && photo.url === sample.url && <span><Check size={12} /></span>}</button>)}</div><p className="fs-sample-help">2 landscape · 2 portrait. Tap a sample to match the frame layout.</p></div><fieldset className="fs-fieldset"><legend>Photo finish</legend><div className="fs-effect-options">{STUDIO_FILTERS.map(effect => <button key={effect.id} aria-pressed={filterId === effect.id} className={filterId === effect.id ? 'selected' : ''} onClick={() => update(setFilterId, effect.id)}>{effect.label}</button>)}</div><p className="fs-helper">Your original photo stays unchanged. The selected effect is included in your order details.</p></fieldset><div className="fs-tip"><Info size={16} /><p>Send the original image from your camera roll. Screenshots and compressed forwards can lose print detail.</p></div></div>}
        {step === 'frame' && <div className="fs-frame-step"><fieldset className="fs-fieldset"><legend className="fs-label-row"><span>Choose a print size</span><button className="fs-text-button" onClick={onOpenSizeGuide}><Ruler size={13} /> Size guide</button></legend><div className="fs-size-grid">{FRAME_SIZES.map(option => <button key={option.id} aria-pressed={sizeId === option.id} className={sizeId === option.id ? 'selected' : ''} onClick={() => update(setSizeId, option.id)}><strong>{option.id}</strong><span>{option.dimensionsCm.replace(' x ', ' × ')}</span></button>)}</div></fieldset><fieldset className="fs-fieldset fs-orientation-field"><legend>Orientation</legend><FrameOrientationControl orientation={orientation} onChange={changeOrientation} label="Frame size orientation" /></fieldset><fieldset className="fs-fieldset"><legend className="fs-label-row"><span>Choose your frame</span><span>{FRAME_FINISHES.length} real designs</span></legend><label className="fs-frame-filter"><SlidersHorizontal size={14} /><select aria-label="Filter frame styles" value={category} onChange={e => setCategory(e.target.value)}>{['All frames', ...new Set(FRAME_FINISHES.map(f => f.category))].map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={13} /></label><div className="fs-frame-grid">{frames.map(option => <button key={option.id} className={frame.id === option.id ? 'selected' : ''} aria-pressed={frame.id === option.id} onClick={() => update(setFrameId, option.id)}><FramedPosterPreview {...previewProps} frame={option} /><strong>{option.name}</strong><small>{option.finish}</small><span className="fs-frame-extra">{option.extraPrice ? `+ ${money(option.extraPrice)}` : 'No frame upgrade'}</span>{frame.id === option.id && <span className="fs-frame-tick"><Check size={10} /></span>}</button>)}</div></fieldset><details className="fs-finishing"><summary><span>Mount & glazing</span><span>{glass.extra ? `+ ${money(glass.extra)}` : 'Standard acrylic'}<ChevronDown size={14} /></span></summary><div><p className="fs-helper">The mount and decorative inner border are shown in the catalogue frame preview. The studio mount is included in the price breakdown.</p><label>Glazing<select value={glassId} onChange={e => update(setGlassId, e.target.value)}>{GLASS_OPTIONS.slice(0, 2).map(option => <option key={option.id} value={option.id}>{option.name}{option.extra ? ` (+${money(option.extra)})` : ' (included)'}</option>)}</select></label><p className="fs-helper">Glazing differences are not simulated in the preview.</p></div></details>{quality?.level === 'low' && <div className="fs-tip"><Info size={16} /><p>{quality.label}. You can return to Photo to replace it.</p></div>}</div>}
        {step === 'review' && <div className="fs-review-step">{photo.isSample && <div className="fs-sample-warning"><ImageIcon size={19} /><div><strong>You’re previewing a sample photo.</strong><p>Upload your own image before placing an order.</p><button className="fs-text-button" onClick={() => { goTo('photo'); uploadInput.current?.click(); }}>Upload my photo <Upload size={13} /></button></div></div>}<div className="fs-review-summary"><div><span>Photo</span><strong>{photo.isSample ? 'Sample — replace before ordering' : photo.name}</strong><button aria-label="Edit photo" onClick={() => goTo('photo')}>Edit</button></div><div><span>Frame</span><strong>{frame.name}<small>{frame.finish}</small></strong><button aria-label="Edit frame" onClick={() => goTo('frame')}>Edit</button></div><div><span>Print size</span><strong>{size.id} · {orientation}<small>{displayDimensions}</small></strong><button aria-label="Edit size" onClick={() => goTo('frame')}>Edit</button></div><div><span>Photo fit</span><strong>{fit === 'contain' ? 'Keep full photo' : 'Fill opening · edges cropped'}<small>{filter.label}</small></strong><button onClick={() => setExpanded(true)}>Preview</button></div><div><span>Finish</span><strong>Catalogue mount<small>{glass.name}</small></strong><button aria-label="Edit finishing" onClick={() => goTo('frame')}>Edit</button></div></div><div className="fs-price-breakdown"><h3>Your price, explained.</h3><div><span>{size.id} photo & base frame</span><span>{money(unitPrice.base)}</span></div><div><span>{frame.name} upgrade</span><span>{unitPrice.frame ? money(unitPrice.frame) : 'Included'}</span></div><div><span>Studio mount</span><span>{money(unitPrice.mount)}</span></div><div><span>Glazing upgrade</span><span>{unitPrice.glass ? money(unitPrice.glass) : 'Included'}</span></div><div className="fs-unit-total"><strong>Price per frame</strong><strong>{money(unitPrice.unit)}</strong></div><label className="fs-quantity">Quantity<input ref={quantityInput} type="number" min="1" max="99" step="1" value={quantity} onChange={e => update(setQuantity, e.target.value)} aria-invalid={!price} /></label>{!price && <p className="fs-error" role="alert">Choose a whole quantity between 1 and 99.</p>}</div><p className="fs-order-note"><Info size={15} /> Your photo and frame are ready to review. Check the preview above, then add to your bag.</p><a className="fs-whatsapp-link" href={getWhatsAppUrl(enquiry)} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> Ask the studio about this frame <ArrowUpRight size={14} /></a><p className="fs-helper">For a WhatsApp enquiry, attach your original photo in the chat.</p></div>}
        {orderError && <p className="fs-error" role="alert">{orderError}</p>}<div className="fs-panel-footer"><div className="fs-running-price"><span>{price && count > 1 ? `${count} frames` : 'Your frame'}</span><strong>{money(price?.total ?? unitPrice.unit)}</strong><small>+ delivery at checkout</small></div><div className="fs-footer-actions">{step !== 'photo' && <button className="fs-back-button" onClick={() => goTo(step === 'review' ? 'frame' : 'photo')} aria-label="Previous step"><ArrowLeft size={17} /></button>}{step === 'review' ? <StudioOrderButton
            isSample={photo.isSample}
            uploading={uploading}
            validQuantity={Boolean(price)}
            onUpload={() => { goTo('photo'); uploadInput.current?.click(); }}
            onFixQuantity={() => { quantityInput.current?.focus(); quantityInput.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
            onAddToBag={addToBag}
          /> : <button className="fs-primary" onClick={() => goTo(nextStep)}>{step === 'photo' ? 'Choose size & frame' : 'Review my frame'}<ArrowRight size={16} /></button>}</div></div>{step === 'review' && !orderReady && <p id="fs-order-help" className="fs-order-help" role="status">{uploading ? 'Your photo is being prepared. The button will be available when it is ready.' : photo.isSample ? 'Sample photos are for preview. Upload your own photo to add this frame to your bag.' : 'Choose a whole quantity between 1 and 99 to add this frame.'}</p>}<div className="fs-preview-mobile-action"><button className="fs-text-button" onClick={() => setExpanded(true)}><Expand size={14} /> See your frame preview</button></div>
      </div>
    </div>
    <div className="fs-bottom-assurance"><span><Check size={14} /> Real catalogue frames</span><span><Check size={14} /> Price updates as you choose</span><span><Check size={14} /> Review before you order</span></div>
    {expanded && <PreviewDialog onClose={() => setExpanded(false)} frameName={frame.name}><FramedPosterPreview {...previewProps} /></PreviewDialog>}
  </div>;
}
