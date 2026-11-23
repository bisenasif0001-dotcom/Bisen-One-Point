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
import { usePriceOverrides } from './BusinessRulesProvider';
import { getFrameFinishExtraPrice, getGlassExtraPrice, getMatExtraPrice } from '../utils/priceRegistry';
import { formatFrameSizeLabel } from '../utils/shippingCalculator';
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
const defaultPanY = dir => (dir === 'portrait' ? 12 : 50);

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
  initialIncludePrint = true,
}) {
  const initialFrame = FRAME_FINISHES.find(f => f.id === preselectedFrameId || f.legacyId === preselectedFrameId) || FRAME_FINISHES[0];
  const [includePrint, setIncludePrint] = useState(initialIncludePrint);
  const [step, setStep] = useState(initialIncludePrint ? 'photo' : 'frame');
  const [photo, setPhoto] = useState(() => initialPhoto?.url ? initialPhoto : samplePhoto(
    FRAME_STUDIO_SAMPLES.find(sample => sample.orientation === (initialOrientation === 'landscape' ? 'landscape' : 'portrait')),
  ));
  const [sizeId, setSizeId] = useState(FRAME_SIZES.some(size => size.id === preselectedSizeId) ? preselectedSizeId : 'A4');
  const [frameId, setFrameId] = useState(initialFrame.id);
  const [glassId, setGlassId] = useState(GLASS_OPTIONS[0].id);
  const [matId, setMatId] = useState('no_mat');
  const [orientation, setOrientation] = useState(initialOrientation === 'landscape' ? 'landscape' : 'portrait');
  const [fit, setFit] = useState('cover');
  const [panX, setPanX] = useState(50);
  const [panY, setPanY] = useState(() => defaultPanY(initialOrientation === 'landscape' ? 'landscape' : 'portrait'));
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
  const mount = MAT_OPTIONS.find(m => m.id === matId) || MAT_OPTIONS[0];
  const filter = STUDIO_FILTERS.find(f => f.id === filterId);
  const wall = WALLS.find(w => w.id === wallId);
  const priceOverrides = usePriceOverrides();
  const count = Number(quantity);
  const price = getStudioPrice({ sizeId, frameId: frame.id, glassId, matId, includePrint, quantity: count, overrides: priceOverrides });
  const unitPrice = getStudioPrice({ sizeId, frameId: frame.id, glassId, matId, includePrint, quantity: 1, overrides: priceOverrides });
  const quality = includePrint && !photo.isSample ? getStudioQuality({ photoWidth: photo.width, photoHeight: photo.height, sizeId, orientation, fit }) : null;
  const frames = FRAME_FINISHES.filter(f => FRAME_PREVIEW_APERTURES[f.id] && (f.availableSizes.includes(sizeId) || sizeId === '12x18') && (category === 'All frames' || f.category === category));
  const previewPoster = includePrint
    ? { image: photo.url, title: photo.isSample ? 'Sample photo' : photo.name, width: photo.width, height: photo.height }
    : { image: '', title: `${frame.name} empty frame` };
  const previewProps = { poster: previewPoster, frame, orientation, fit, panX, panY, filter: includePrint ? filter.css : 'none' };
  const update = (setter, value) => setter(value);
  const toggleOrderMode = withPrint => {
    setIncludePrint(withPrint);
    setOrderError('');
    if (!withPrint && step === 'photo') setStep('frame');
    if (withPrint && photo.isSample) setStep('photo');
  };
  const goTo = next => {
    setStep(next);
    requestAnimationFrame(() => {
      panelTitle.current?.focus({ preventScroll: true });
      if (window.innerWidth < 900) document.getElementById('fs-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  const resetPosition = (dir = orientation) => { setPanX(50); setPanY(defaultPanY(dir)); };
  const changeOrientation = value => { setOrientation(value); resetPosition(value); };
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
      const nextOrientation = loadedPhoto.width > loadedPhoto.height ? 'landscape' : 'portrait';
      setPhoto(loadedPhoto);
      setOrientation(nextOrientation);
      setFit('cover');
      setPanX(50);
      setPanY(defaultPanY(nextOrientation));
    } catch (error) {
      if (mounted.current && uploadSequence.current === sequence) setUploadError(error.message);
    } finally {
      if (mounted.current && uploadSequence.current === sequence) setUploading(false);
    }
  };
  const orderReady = (!includePrint || !photo.isSample) && !uploading && !saving && Boolean(price);
  const withPrintUnit = getStudioPrice({ sizeId, frameId: frame.id, glassId, matId, includePrint: true, quantity: 1, overrides: priceOverrides })?.unit ?? unitPrice.unit;
  const frameOnlyUnit = getStudioPrice({ sizeId, frameId: frame.id, glassId, matId, includePrint: false, quantity: 1, overrides: priceOverrides })?.unit ?? unitPrice.unit;
  const addToBag = async () => {
    if (!orderReady) return;
    setSaving(true); setOrderError('');
    try {
      if (includePrint && !photo.isSample) await savePrintOriginals([photo]);
      onAddToCart?.({
        id: `custom-frame-${crypto.randomUUID()}`,
        type: 'custom_frame',
        title: includePrint ? `${frame.name} Photo Frame` : `${frame.name} Frame (Without Print)`,
        frameId: frame.id,
        originalId: includePrint ? photo.id : '',
        photoUrl: includePrint ? photo.url : '',
        photoName: includePrint ? photo.name : '',
        image: includePrint ? photo.url : frame.frontImage,
        photoWidth: includePrint ? photo.width : undefined,
        photoHeight: includePrint ? photo.height : undefined,
        size: size.id,
        dimensions: displayDimensions,
        dimensionsInch: size.dimensionsInch,
        format: includePrint ? 'With photo print' : 'Frame only (without print)',
        finish: frame.name,
        finishColor: frame.colorHex,
        mat: mount.name,
        glass: glass.name,
        orientation,
        fit: includePrint ? fit : 'contain',
        panX: includePrint ? panX : 50,
        panY: includePrint ? panY : 50,
        filter: includePrint ? filterId : 'original',
        filterCss: includePrint ? filter.css : 'none',
        price: price.unit,
        quantity: count,
        configuration: { includePrint, matId: mount.id, glassId: glass.id },
        personalisation: includePrint
          ? { frameId: frame.id, format: 'With photo print', photoName: photo.name, size: size.id, orientation, fit, panX, panY, filter: filter.label, mount: mount.name, glass: glass.name }
          : { frameId: frame.id, format: 'Frame only (without print)', size: size.id, orientation, mount: mount.name, glass: glass.name },
      });
    } catch (error) { setOrderError(error.message || 'The original photo could not be saved. Please try again.'); } finally { setSaving(false); }
  };
  const enquiry = `Hello! I would like help with this ${includePrint ? 'custom photo frame' : 'empty frame (without print)'}.\nOrder option: ${includePrint ? 'Frame + Photo Print' : 'Frame Only (Without Print)'}\nFrame: ${frame.name} (${frame.id})\nSize: ${formatFrameSizeLabel(size.id)} (${displayDimensions})\nOrientation: ${orientation}${includePrint ? `\nPhoto fit: ${fit === 'contain' ? 'Keep full photo' : 'Fill opening (crop)'}\nCrop position: ${panX}% horizontal, ${panY}% vertical\nPhoto effect: ${filter.label}` : ''}\nMount: ${mount.name}\nGlazing: ${glass.name}\nQuantity: ${price ? count : 'Please advise'}\nFrame price: ${money(unitPrice.unit)} each + delivery.${includePrint ? `\n${photo.isSample ? 'I am exploring with a sample photo.' : 'I will attach the original photograph here.'}` : ''}`;
  const nextStep = step === 'photo' ? 'frame' : 'review';

  return <div className="frame-studio-page">
    <div className="fs-intro"><div><Link to="/frames-catalogue" className="fs-back-link"><ArrowLeft size={13} /> Explore our frames</Link><span className="fs-eyebrow">THE PERSONAL FRAME STUDIO</span><h1>A memory worth framing.</h1><p>Order your frame complete with a printed photograph, or order the empty handcrafted frame ready for your own print.</p></div><div className="fs-intro-note"><Frame size={22} /><span><strong>{FRAME_FINISHES.length} real frame designs</strong><small>With print or empty frame · 9 sizes available.</small></span></div></div>
    <nav className="fs-steps" aria-label="Custom frame steps">{STEPS.map((item, i) => <button key={item.id} aria-current={step === item.id ? 'step' : undefined} className={step === item.id ? 'active' : ''} onClick={() => goTo(item.id)}><span className="fs-step-number">{i === 0 && (!includePrint || !photo.isSample) ? <Check size={15} /> : `0${i + 1}`}</span><span><strong>{item.label}</strong><small>{i === 0 && !includePrint ? 'Skipped (Frame only)' : item.description}</small></span><ArrowRight className="fs-step-arrow" size={16} /></button>)}</nav>
    <input ref={uploadInput} className="fs-hidden-input" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose a photo file" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) chooseFile(file); }} />
    <div className="fs-workspace">
      <div className="fs-preview-column"><div className="fs-preview-card"><div className="fs-stage-toolbar"><span><span /> LIVE PREVIEW <small>{!includePrint ? 'FRAME ONLY' : photo.isSample ? 'SAMPLE PHOTO' : 'YOUR PHOTO'}</small></span><button onClick={() => setExpanded(true)} aria-label="Enlarge frame preview"><Expand size={16} /><span>Enlarge</span></button></div><div className="fs-preview-orientation"><span className="fs-control-label">FRAME ORIENTATION</span><FrameOrientationControl orientation={orientation} onChange={changeOrientation} label="Preview frame orientation" /></div><div className={`fs-wall fs-wall-${wall.id}`} style={{ backgroundColor: wall.color }}><div className="fs-wall-light" aria-hidden="true" />{includePrint && photo.loadError ? <div className="fs-photo-placeholder"><ImageIcon size={35} /><p>Make this space yours.</p><button className="fs-text-button" onClick={() => uploadInput.current?.click()}>Upload your photo <Upload size={15} /></button></div> : <div className={`fs-framed-art fs-orientation-${orientation}`} style={{ '--frame-scale': size.scaleRatio }}><FramedPosterPreview {...previewProps} /></div>}<span className="fs-preview-size">{formatFrameSizeLabel(size.id)} / {displayDimensions}</span></div><div className="fs-wall-picker"><span>Try a wall colour</span><div>{WALLS.map(option => <button key={option.id} title={option.name} aria-label={option.name} aria-pressed={wallId === option.id} className={wallId === option.id ? 'selected' : ''} onClick={() => setWallId(option.id)} style={{ '--wall-colour': option.color }} />)}</div><span className="fs-wall-name">{wall.name}</span></div><div className="fs-selected-frame"><span className="fs-selected-thumb"><img src={frame.frontImage} alt="" /></span><span><strong>{frame.name}</strong><small>{frame.finish}</small></span><button className="fs-text-button" onClick={() => goTo('frame')}>Change frame <ArrowRight size={14} /></button></div></div>{includePrint && <div className="fs-photo-fit"><div><span className="fs-control-label">PHOTO FIT</span><div className="fs-segmented">{[['cover', 'Fill opening', Crop], ['contain', 'Keep full photo', Maximize]].map(([value, label, Icon]) => <button key={value} aria-pressed={fit === value} className={fit === value ? 'selected' : ''} onClick={() => { update(setFit, value); resetPosition(); }}><Icon size={14} />{label}</button>)}</div></div><p>{fit === 'contain' ? 'Your complete photo stays visible. White space may appear around it.' : 'Photo fills the frame edge-to-edge with no white space. Adjust position below if needed.'}</p>{fit === 'cover' && <div className="fs-position-controls"><label>Left / right<input type="range" min="0" max="100" value={panX} onChange={e => update(setPanX, Number(e.target.value))} /></label><label>Up / down<input type="range" min="0" max="100" value={panY} onChange={e => update(setPanY, Number(e.target.value))} /></label><button className="fs-text-button" onClick={() => resetPosition()}><RotateCcw size={12} /> Centre photo</button></div>}</div>}<p className="fs-preview-caption">Preview uses our actual catalogue frame photography. Final outside dimensions vary by size and moulding.</p></div>
      <div className="fs-editor" id="fs-editor">
        <div className="fs-mode-switch" role="group" aria-label="Order presentation option">
          <button type="button" aria-pressed={includePrint} onClick={() => toggleOrderMode(true)}>
            <strong><ImageIcon size={14} /> Frame + Photo Print</strong>
            <small>{money(withPrintUnit)} · Printed & framed ready to hang</small>
          </button>
          <button type="button" aria-pressed={!includePrint} onClick={() => toggleOrderMode(false)}>
            <strong><Frame size={14} /> Frame Only (Without Print)</strong>
            <small>{money(frameOnlyUnit)} · Empty frame ready for your art</small>
          </button>
        </div>
        <div className="fs-panel-heading"><span className="fs-eyebrow">STEP {STEPS.findIndex(s => s.id === step) + 1} OF 3</span><h2 tabIndex={-1} ref={panelTitle}>{step === 'photo' ? (includePrint ? 'Start with a favourite photo.' : 'Ordering an empty frame.') : step === 'frame' ? 'A frame that feels like you.' : 'One last look. All yours.'}</h2><p>{step === 'photo' ? (includePrint ? 'Upload an original photo for the best print. You can explore with a sample first.' : 'No photo upload is required for Frame Only orders. Switch back anytime if you want us to print your photo too.') : step === 'frame' ? 'Choose a size, then tap a real frame finish for your space.' : 'Check your selections and breakdown before adding to your bag.'}</p></div>
        {step === 'photo' && (includePrint ? <div className="fs-photo-step"><button className={`fs-drop-zone ${dragging ? 'is-dragging' : ''} ${!photo.isSample ? 'has-photo' : ''}`} ref={uploadTarget} onClick={() => uploadInput.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) chooseFile(file); }} disabled={uploading}><span className="fs-upload-icon">{uploading ? <span className="fs-spinner" /> : !photo.isSample ? <CheckCircle2 size={23} /> : <Upload size={23} />}</span><strong>{uploading ? 'Preparing your photo…' : photo.isSample ? 'Drop your photo here' : photo.name}</strong><span>{uploading ? 'Checking your image before previewing' : photo.isSample ? <>or <u>browse files</u> on your device</> : 'Click to replace with another photo'}</span><small>JPG, PNG or WebP · Up to 20 MB</small></button>{uploadError && <p className="fs-error" role="alert"><Info size={15} />{uploadError}</p>}{!photo.isSample && <div className={`fs-quality fs-quality-${quality?.level || 'fair'}`}><ImageIcon size={18} /><div><strong>{photo.width} × {photo.height} pixels</strong><p>{quality?.label} {quality && <span>· Approx. {quality.dpi} PPI at {formatFrameSizeLabel(size.id)}</span>}</p></div></div>}<div className="fs-samples"><div className="fs-label-row"><span className="fs-control-label">JUST EXPLORING? TRY A SAMPLE</span><span>Preview only</span></div><div className="fs-sample-grid">{FRAME_STUDIO_SAMPLES.map(sample => <button className="fs-sample-option" data-orientation={sample.orientation} aria-label={`Preview ${sample.name}, ${sample.orientation} sample`} key={sample.id} aria-pressed={photo.isSample && photo.url === sample.url} onClick={() => chooseSample(sample)} title={sample.name}><img src={sample.url} alt={sample.name} loading="lazy" /><small className="fs-sample-caption">{sample.orientation === 'portrait' ? 'Portrait' : 'Landscape'}</small>{photo.isSample && photo.url === sample.url && <span><Check size={12} /></span>}</button>)}</div><p className="fs-sample-help">2 landscape · 2 portrait. Tap a sample to match the frame layout.</p></div><fieldset className="fs-fieldset"><legend>Photo finish</legend><div className="fs-effect-options">{STUDIO_FILTERS.map(effect => <button key={effect.id} aria-pressed={filterId === effect.id} className={filterId === effect.id ? 'selected' : ''} onClick={() => update(setFilterId, effect.id)}>{effect.label}</button>)}</div><p className="fs-helper">Your original photo stays unchanged. The selected effect is included in your order details.</p></fieldset><div className="fs-tip"><Info size={16} /><p>Send the original image from your camera roll. Screenshots and compressed forwards can lose print detail.</p></div></div> : <div className="fs-photo-step"><div className="fs-tip"><Frame size={16} /><p><strong>Frame Only (Without Print)</strong> is active. You receive the ready-to-hang frame with shatterproof crystal acrylic and backing board. Click <em>Choose size & frame</em> below to continue.</p></div><button type="button" className="fs-text-button" onClick={() => toggleOrderMode(true)}>Want us to print a photo too? Switch to Frame + Photo Print</button></div>)}
        {step === 'frame' && <div className="fs-frame-step"><fieldset className="fs-fieldset"><legend className="fs-label-row"><span>Choose a frame size</span><button className="fs-text-button" onClick={onOpenSizeGuide}><Ruler size={13} /> Size guide</button></legend><div className="fs-size-grid">{FRAME_SIZES.map(option => <button key={option.id} aria-pressed={sizeId === option.id} className={sizeId === option.id ? 'selected' : ''} onClick={() => update(setSizeId, option.id)}><strong>{formatFrameSizeLabel(option.id)}</strong><span>{option.dimensionsCm.replace(' x ', ' × ')}</span></button>)}</div></fieldset><fieldset className="fs-fieldset fs-orientation-field"><legend>Orientation</legend><FrameOrientationControl orientation={orientation} onChange={changeOrientation} label="Frame size orientation" /></fieldset><fieldset className="fs-fieldset"><legend className="fs-label-row"><span>Choose your frame</span><span>{FRAME_FINISHES.length} real designs</span></legend><label className="fs-frame-filter"><SlidersHorizontal size={14} /><select aria-label="Filter frame styles" value={category} onChange={e => setCategory(e.target.value)}>{['All frames', ...new Set(FRAME_FINISHES.map(f => f.category))].map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={13} /></label><div className="fs-frame-grid">{frames.map(option => { const extra = priceOverrides?.frameFinishes?.[option.id] ?? getFrameFinishExtraPrice(option.id); return <button key={option.id} className={frame.id === option.id ? 'selected' : ''} aria-pressed={frame.id === option.id} onClick={() => update(setFrameId, option.id)}><FramedPosterPreview {...previewProps} frame={option} /><strong>{option.name}</strong><small>{option.finish}</small><span className="fs-frame-extra">{extra ? `+ ${money(extra)}` : 'No frame upgrade'}</span>{frame.id === option.id && <span className="fs-frame-tick"><Check size={10} /></span>}</button>; })}</div></fieldset><details className="fs-finishing"><summary><span>Mount & glazing</span><span>{unitPrice.mount || unitPrice.glass ? `+ ${money(unitPrice.mount + unitPrice.glass)}` : 'No mat · Standard acrylic'}<ChevronDown size={14} /></span></summary><div><p className="fs-helper">Choose an optional archival bevel mat or upgrade to anti-glare optical acrylic.</p><label>Mount / Mat<select value={matId} onChange={e => update(setMatId, e.target.value)}>{MAT_OPTIONS.map(option => { const matExtra = priceOverrides?.matOptions?.[option.id] ?? getMatExtraPrice(option.id); return <option key={option.id} value={option.id}>{option.name}{matExtra ? ` (+${money(matExtra)})` : ' (included)'}</option>; })}</select></label><label>Glazing<select value={glassId} onChange={e => update(setGlassId, e.target.value)}>{GLASS_OPTIONS.slice(0, 2).map(option => { const glassExtra = priceOverrides?.glassOptions?.[option.id] ?? getGlassExtraPrice(option.id); return <option key={option.id} value={option.id}>{option.name}{glassExtra ? ` (+${money(glassExtra)})` : ' (included)'}</option>; })}</select></label><p className="fs-helper">Glazing differences are not simulated in the preview.</p></div></details>{quality?.level === 'low' && <div className="fs-tip"><Info size={16} /><p>{quality.label}. You can return to Photo to replace it.</p></div>}</div>}
        {step === 'review' && <div className="fs-review-step">{includePrint && photo.isSample && <div className="fs-sample-warning"><ImageIcon size={19} /><div><strong>You’re previewing a sample photo.</strong><p>Upload your own image before ordering Frame + Photo Print, or switch to Frame Only above.</p><button className="fs-text-button" onClick={() => { goTo('photo'); uploadInput.current?.click(); }}>Upload my photo <Upload size={13} /></button></div></div>}<div className="fs-review-summary"><div><span>Option</span><strong>{includePrint ? 'Frame + Photo Print' : 'Frame Only (Without Print)'}<small>{includePrint ? (photo.isSample ? 'Sample — upload photo before ordering' : photo.name) : 'Empty frame ready to insert your photo'}</small></strong><button aria-label="Switch mode" onClick={() => toggleOrderMode(!includePrint)}>{includePrint ? 'Frame only' : 'Add print'}</button></div><div><span>Frame</span><strong>{frame.name}<small>{frame.finish}</small></strong><button aria-label="Edit frame" onClick={() => goTo('frame')}>Edit</button></div><div><span>Frame size</span><strong>{formatFrameSizeLabel(size.id)} · {orientation}<small>{displayDimensions}</small></strong><button aria-label="Edit size" onClick={() => goTo('frame')}>Edit</button></div>{includePrint && <div><span>Photo fit</span><strong>{fit === 'contain' ? 'Keep full photo' : 'Fill opening · edges cropped'}<small>{filter.label}</small></strong><button onClick={() => setExpanded(true)}>Preview</button></div>}<div><span>Finishing</span><strong>{mount.name}<small>{glass.name}</small></strong><button aria-label="Edit finishing" onClick={() => goTo('frame')}>Edit</button></div></div><div className="fs-price-breakdown"><h3>Your price, explained.</h3><div><span>{formatFrameSizeLabel(size.id)} base frame (empty)</span><span>{money(unitPrice.base)}</span></div>{includePrint && <div><span>{formatFrameSizeLabel(size.id)} high-res photo print</span><span>+ {money(unitPrice.print)}</span></div>}<div><span>{frame.name} upgrade</span><span>{unitPrice.frame ? `+ ${money(unitPrice.frame)}` : 'Included'}</span></div><div><span>{mount.name}</span><span>{unitPrice.mount ? `+ ${money(unitPrice.mount)}` : 'Included'}</span></div><div><span>{glass.name}</span><span>{unitPrice.glass ? `+ ${money(unitPrice.glass)}` : 'Included'}</span></div><div className="fs-unit-total"><strong>Price per frame</strong><strong>{money(unitPrice.unit)}</strong></div><label className="fs-quantity">Quantity<input ref={quantityInput} type="number" min="1" max="99" step="1" value={quantity} onChange={e => update(setQuantity, e.target.value)} aria-invalid={!price} /></label>{!price && <p className="fs-error" role="alert">Choose a whole quantity between 1 and 99.</p>}</div><p className="fs-order-note"><Info size={15} /> Check your frame size and options above, then add to your bag. Delivery charges are calculated at checkout by PIN code.</p><a className="fs-whatsapp-link" href={getWhatsAppUrl(enquiry)} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> Ask the studio about this frame <ArrowUpRight size={14} /></a>{includePrint && <p className="fs-helper">For a WhatsApp enquiry, attach your original photo in the chat.</p>}</div>}
        {orderError && <p className="fs-error" role="alert">{orderError}</p>}<div className="fs-panel-footer"><div className="fs-running-price"><span>{price && count > 1 ? `${count} frames` : includePrint ? 'Frame + print' : 'Frame only'}</span><strong>{money(price?.total ?? unitPrice.unit)}</strong><small>+ Porter / courier delivery at checkout</small></div><div className="fs-footer-actions">{step !== 'photo' && <button className="fs-back-button" onClick={() => goTo(step === 'review' ? (includePrint || step === 'review' ? 'frame' : 'photo') : 'photo')} aria-label="Previous step"><ArrowLeft size={17} /></button>}{step === 'review' ? <StudioOrderButton
            isSample={photo.isSample}
            includePrint={includePrint}
            uploading={uploading}
            validQuantity={Boolean(price)}
            onUpload={() => { goTo('photo'); uploadInput.current?.click(); }}
            onFixQuantity={() => { quantityInput.current?.focus(); quantityInput.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
            onAddToBag={addToBag}
          /> : <button className="fs-primary" onClick={() => goTo(nextStep)}>{step === 'photo' ? 'Choose size & frame' : 'Review my frame'}<ArrowRight size={16} /></button>}</div></div>{step === 'review' && !orderReady && <p id="fs-order-help" className="fs-order-help" role="status">{uploading ? 'Your photo is being prepared. The button will be available when it is ready.' : includePrint && photo.isSample ? 'Sample photos are for preview. Upload your own photo or switch to Frame Only to add this frame to your bag.' : 'Choose a whole quantity between 1 and 99 to add this frame.'}</p>}<div className="fs-preview-mobile-action"><button className="fs-text-button" onClick={() => setExpanded(true)}><Expand size={14} /> See your frame preview</button></div>
      </div>
    </div>
    <div className="fs-bottom-assurance"><span><Check size={14} /> Real catalogue frames</span><span><Check size={14} /> Frame Only or With Photo Print</span><span><Check size={14} /> Shatterproof acrylic protection</span></div>
    {expanded && <PreviewDialog onClose={() => setExpanded(false)} frameName={frame.name}><FramedPosterPreview {...previewProps} /></PreviewDialog>}
  </div>;
}
