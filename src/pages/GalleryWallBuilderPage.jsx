import React, { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Expand, ImagePlus, Layers, MessageCircle, Ruler, ShoppingBag, Upload, X } from 'lucide-react';
import { GALLERY_DEFAULTS, GALLERY_LAYOUTS, GALLERY_ROOMS, getGalleryLayout } from '../data/galleryWalls';
import { FRAME_FINISHES } from '../data/products';
import { homeFrame } from '../data/homeStudio';
import { getWhatsAppUrl } from '../data/businessConfig';
import { createGalleryWallItem, galleryOrderDetails, galleryPrintDimensions, getGalleryPlan, getGalleryPrice, swapGalleryEntries, validateGalleryOrder } from '../utils/galleryWalls';
import { getStudioQuality, validateStudioFile } from '../utils/frameStudio';
import { savePrintOriginals } from '../utils/printPhotoStorage';
import GalleryWallPreview from '../components/GalleryWallPreview';
import FramedPosterPreview from '../components/FramedPosterPreview';
import './GalleryWallBuilderPage.css';

const money = amount => `₹${amount.toLocaleString('en-IN')}`;
const STEPS = ['The arrangement', 'Your photographs', 'Finish & review'];
const defaultSettings = { fit: 'cover', panX: 50, panY: 20 };

function LayoutMini({ id }) {
  const plan = getGalleryPlan(id);
  return <svg viewBox={`-5 -5 ${plan.width + 10} ${plan.height + 10}`} aria-hidden="true">{plan.slots.map((slot, index) => <g key={index}><rect x={slot.x} y={slot.y} width={slot.width} height={slot.height} fill="#657b56" /><rect x={slot.x + 2.2} y={slot.y + 2.2} width={slot.width - 4.4} height={slot.height - 4.4} fill="#fffcef" /><rect x={slot.x + 6} y={slot.y + 6} width={slot.width - 12} height={slot.height - 12} fill={index === 0 ? '#b6c6a1' : '#d4ddc7'} /></g>)}</svg>;
}

function PreviewMode({ mode, setMode }) {
  return <div className="gw-segment" role="group" aria-label="Gallery preview mode"><button type="button" aria-pressed={mode === 'room'} onClick={() => setMode('room')}><ImagePlus size={14} /> In a room</button><button type="button" aria-pressed={mode === 'plan'} onClick={() => setMode('plan')}><Layers size={14} /> Layout view</button></div>;
}

function GalleryInspector({ config, photos, settings, activeIndex, setActiveIndex, mode, setMode, onClose, onEdit }) {
  const dialogRef = useRef(null);
  const layout = getGalleryLayout(config.layoutId);
  const ready = layout.slots.filter((_, index) => photos[index]).length;
  useEffect(() => {
    const dialog = dialogRef.current, previousOverflow = document.body.style.overflow;
    dialog.showModal(); document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog className="gw-dialog" ref={dialogRef} aria-label="Your gallery wall preview" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><header><div><span className="gw-kicker">LIVE GALLERY · {ready}/{layout.framesCount} PHOTOS ADDED</span><h2>{getGalleryLayout(config.layoutId).name}</h2></div><button type="button" className="gw-icon" autoFocus aria-label="Close gallery preview" onClick={onClose}><X size={21} /></button></header><PreviewMode mode={mode} setMode={setMode} /><GalleryWallPreview config={config} photos={photos} settings={settings} activeIndex={activeIndex} onSelect={setActiveIndex} mode={mode} /><div className="gw-dialog-footer"><p>Tap a numbered frame to select it. {ready < layout.framesCount && <>Sample photos appear in empty frames. </>}Room scenes are illustrative; check print sizes before ordering.</p><button type="button" className="gw-primary" onClick={onEdit}>Edit frame {activeIndex + 1} <ArrowUpRight size={15} /></button></div></dialog>;
}

async function prepareGalleryPhoto(file) {
  const problem = validateStudioFile(file);
  if (problem) throw new Error(problem);
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = objectUrl; await image.decode();
    const width = image.naturalWidth, height = image.naturalHeight;
    if (!width || !height) throw new Error('This image could not be opened. Choose another photograph.');
    const scale = Math.min(1, 560 / Math.max(width, height));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { id: `gallery-photo-${crypto.randomUUID()}`, name: file.name, width, height, file, url: canvas.toDataURL('image/jpeg', .78), isSample: false };
  } finally { URL.revokeObjectURL(objectUrl); }
}

export default function GalleryWallBuilderPage({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const layout = getGalleryLayout(searchParams.get('layout'));
  const [step, setStep] = useState(0), [config, setConfig] = useState(GALLERY_DEFAULTS);
  const [photos, setPhotos] = useState({}), [settings, setSettings] = useState({}), [activePhoto, setActivePhoto] = useState(0);
  const [mode, setMode] = useState('room'), [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState(''), [uploading, setUploading] = useState(false), [saving, setSaving] = useState(false);
  const editorRef = useRef(null), errorRef = useRef(null), fileInput = useRef(null), batchInput = useRef(null), uploadTarget = useRef(0), previewOpener = useRef(null);
  const currentConfig = { ...config, layoutId: layout.id };
  const activeIndex = Math.min(activePhoto, layout.framesCount - 1);
  const slot = layout.slots[activeIndex], photo = photos[activeIndex], treatment = settings[activeIndex] || defaultSettings;
  const frame = homeFrame(config.frameId), pricing = getGalleryPrice(layout.id, config.frameId);
  const ready = layout.slots.filter((_, index) => Boolean(photos[index])).length;
  const plan = getGalleryPlan(layout.id, config.frameId);
  const quality = photo ? getStudioQuality({ photoWidth: photo.width, photoHeight: photo.height, sizeId: slot.sizeId, orientation: slot.orientation, fit: treatment.fit }) : null;
  const update = (key, value) => { setConfig(current => ({ ...current, [key]: value })); setError(''); };
  const setTreatment = (key, value) => setSettings(current => ({ ...current, [activeIndex]: { ...defaultSettings, ...current[activeIndex], [key]: value } }));
  const showError = message => { setError(message); requestAnimationFrame(() => { errorRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); errorRef.current?.focus({ preventScroll: true }); }); };
  const goTo = next => { setStep(next); setError(''); requestAnimationFrame(() => editorRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })); };
  const chooseLayout = id => { const next = getGalleryLayout(id); setSearchParams(previous => { const query = new URLSearchParams(previous); query.set('layout', next.id); return query; }); setActivePhoto(current => Math.min(current, next.framesCount - 1)); setError(''); };
  const nextStep = () => { if (step === 1) { const problem = validateGalleryOrder(currentConfig, photos); if (problem) { showError(problem); return; } } goTo(Math.min(2, step + 1)); };
  const openPreview = event => { previewOpener.current = event.currentTarget; if (window.matchMedia('(max-width: 760px)').matches) setMode('plan'); setPreviewOpen(true); };
  const closePreview = () => { setPreviewOpen(false); requestAnimationFrame(() => previewOpener.current?.focus({ preventScroll: true })); };
  const requestPhoto = index => { uploadTarget.current = index; fileInput.current.click(); };
  const uploadFiles = async (files, multiple = false) => {
    if (!files.length || uploading) return;
    setUploading(true); setError('');
    const empty = layout.slots.map((_, index) => index).filter(index => !photos[index]);
    const targets = multiple ? empty : [uploadTarget.current];
    if (!targets.length) { setUploading(false); showError('Every frame has a photo. Select a frame and choose “Change photo” to replace one.'); return; }
    const uploaded = {}, failures = [];
    for (const [index, file] of Array.from(files).slice(0, targets.length).entries()) {
      try { uploaded[targets[index]] = await prepareGalleryPhoto(file); }
      catch (problem) { failures.push(`${file.name}: ${problem.message || 'This photo could not be opened.'}`); }
    }
    if (Object.keys(uploaded).length) { setPhotos(current => ({ ...current, ...uploaded })); setSettings(current => { const updated = { ...current }; for (const index of Object.keys(uploaded)) updated[index] = defaultSettings; return updated; }); setActivePhoto(Number(Object.keys(uploaded)[0])); }
    if (files.length > targets.length) failures.push(`There were only ${targets.length} empty frames. Extra files were not added.`);
    setUploading(false); if (fileInput.current) fileInput.current.value = ''; if (batchInput.current) batchInput.current.value = '';
    if (failures.length) showError(failures.join(' '));
  };
  const addToBag = async () => {
    const problem = validateGalleryOrder(currentConfig, photos);
    if (problem) { showError(problem); return; }
    setSaving(true); setError('');
    try {
      const item = createGalleryWallItem(currentConfig, photos, settings);
      const originals = layout.slots.map((_, index) => photos[index]).filter(Boolean);
      if (originals.length) await savePrintOriginals(originals);
      onAddToCart(item);
    } catch (problem) { showError(problem.message || 'Your gallery could not be saved. Please try again.'); }
    finally { setSaving(false); }
  };
  const askStudio = () => {
    const item = createGalleryWallItem({ ...currentConfig, photoMode: 'later' }, photos, settings);
    return getWhatsAppUrl(`Hello AL-NOOR! Please help me plan this gallery wall.\n\n${galleryOrderDetails(item)}\nSet total: ${money(pricing.total)} + delivery.`);
  };

  return <div className="gw-page"><div className="gw-wrap">
    <div className="gw-breadcrumb"><Link to="/frames-catalogue"><ArrowLeft size={13} /> The frame collection</Link><span>/</span><span>The gallery wall studio</span></div>
    <header className="gw-intro"><div><span className="gw-kicker"><Layers size={13} /> THE GALLERY WALL STUDIO</span><h1>A collection of moments.<br /><em>A wall that feels like you.</em></h1><p>Bring your favourite photographs together. Find an arrangement, make every frame personal and see the whole story take shape.</p></div><aside><span>ONE WALL. YOUR WHOLE STORY.</span><div><strong>3, 5, 7 or 9</strong><small>frames, thoughtfully arranged</small></div><p>Photo prints + frames + hanging template.<br />From ₹2,499 per complete set.</p></aside></header>
    <nav className="gw-steps" aria-label="Gallery builder steps">{STEPS.map((label, index) => <button type="button" key={label} aria-current={step === index ? 'step' : undefined} onClick={() => goTo(index)}><span>{step > index ? <Check size={15} /> : `0${index + 1}`}</span><strong>{label}</strong><ArrowRight size={15} /></button>)}</nav>
    <div className={`gw-builder gw-step-${step}`}>
      <aside className="gw-preview" aria-label="Live gallery preview"><div className="gw-preview-heading"><span className="gw-kicker"><i /> YOUR GALLERY, COMING TOGETHER</span><button type="button" className="gw-icon" aria-label="Enlarge gallery preview" onClick={openPreview}><Expand size={17} /></button></div><PreviewMode mode={mode} setMode={setMode} /><GalleryWallPreview config={currentConfig} mode={mode} photos={photos} settings={settings} activeIndex={activeIndex} onSelect={index => { setActivePhoto(index); goTo(1); }} />
        <div className="gw-preview-caption"><span><strong>{layout.name}</strong><small>{layout.framesCount} frames · {layout.dimensions}</small></span><span className="gw-photo-status">{ready}/{layout.framesCount} photos added</span></div>
        {mode === 'room' && <div className="gw-room-options" role="group" aria-label="Preview room">{GALLERY_ROOMS.map(room => <button type="button" key={room.id} aria-pressed={config.roomId === room.id} onClick={() => update('roomId', room.id)}>{room.name}</button>)}</div>}
        <div className="gw-preview-note"><Ruler size={16} /><span>{mode === 'plan' ? `Approx. arrangement: ${Math.round(plan.width)} × ${Math.round(plan.height)} cm, with ${plan.gap} cm gaps.` : 'Room preview is illustrative. Use the listed print sizes to plan your wall.'}<small>{ready < layout.framesCount ? 'Sample photos are shown in empty frames.' : 'Your photos are shown in every frame.'}</small></span></div>
      </aside>
      <div className="gw-editor" ref={editorRef}><div className="gw-editor-heading"><span className="gw-kicker">STEP 0{step + 1} / 03</span><button type="button" className="gw-mobile-preview" onClick={openPreview}><Expand size={14} /> Live preview</button><h2>{step === 0 ? 'Find your wall’s rhythm.' : step === 1 ? 'Every frame has a story.' : 'The finishing touch.'}</h2><p>{step === 0 ? 'A quiet trio or a wall full of memories? Pick the arrangement that makes room for your story.' : step === 1 ? 'Choose a numbered frame, add its photograph and check how it fits. Your photos stay available when you switch layouts.' : 'One finish brings the collection together. Check your photos and the complete set before adding it to your bag.'}</p></div>
        {step === 0 && <><div className="gw-layout-options" role="group" aria-label="Gallery wall arrangement">{GALLERY_LAYOUTS.map(item => <button type="button" key={item.id} aria-pressed={layout.id === item.id} onClick={() => chooseLayout(item.id)}><div><LayoutMini id={item.id} /><span>{item.framesCount} FRAMES</span>{layout.id === item.id && <i><Check size={12} /></i>}</div><strong>{item.name}</strong><span>{item.dimensions}</span><small>From <b>{money(item.startingPrice)}</b></small></button>)}</div><div className="gw-layout-description"><span className="gw-kicker">{layout.layoutType}</span><p>{layout.description}</p><span><Ruler size={14} /> Suggested clear wall width: {layout.idealSpan}</span></div><details className="gw-size-list"><summary><Layers size={15} /> What sizes are in this set?<span>+</span></summary><p>Sizes below are the printed photographs. Finished frame dimensions also include the mount and moulding.</p><ol>{layout.slots.map((item, index) => <li key={index}><span>{index + 1}</span><div><strong>{item.label}</strong><small>{item.orientation}</small></div><strong>{item.sizeId}</strong><small>{galleryPrintDimensions(item).join(' × ')} cm</small></li>)}</ol></details></>}
        {step === 1 && <><div className="gw-photo-choice" role="group" aria-label="When to share photos"><button type="button" aria-pressed={config.photoMode === 'now'} onClick={() => update('photoMode', 'now')}><Upload size={16} /><span>Add my photos now<small>Preview your own photos in each frame</small></span>{config.photoMode === 'now' && <Check size={14} />}</button><button type="button" aria-pressed={config.photoMode === 'later'} onClick={() => update('photoMode', 'later')}><MessageCircle size={16} /><span>Share remaining photos later<small>Confirm them with the studio before printing</small></span>{config.photoMode === 'later' && <Check size={14} />}</button></div>
          <div className="gw-photo-rail-heading"><span>{ready} of {layout.framesCount} frames have your photos</span><button type="button" className="gw-text-button" disabled={uploading} onClick={() => batchInput.current.click()}><ImagePlus size={14} /> Add multiple photos</button></div><div className="gw-photo-rail" role="group" aria-label="Select a frame to personalise">{layout.slots.map((item, index) => <button type="button" key={index} aria-label={`Select frame ${index + 1}: ${item.label}`} aria-pressed={activeIndex === index} onClick={() => { setActivePhoto(index); setError(''); }}><img src={photos[index]?.url || `/hero/wedding-${item.sample}.jpg`} alt="" /><span>{index + 1}</span>{photos[index] && <i><Check size={9} /></i>}</button>)}</div>
          <div className="gw-photo-editor"><div className="gw-selected-photo-heading"><strong>Frame {activeIndex + 1} <span>· {slot.label}</span></strong><small>{slot.sizeId} · {slot.orientation}</small></div><div className="gw-photo-adjust"><div className="gw-single-frame"><FramedPosterPreview poster={photo ? { image: photo.url, title: photo.name, width: photo.width, height: photo.height } : { image: `/hero/wedding-${slot.sample}.jpg`, title: 'Sample photograph', width: 434, height: 724 }} frame={frame} orientation={slot.orientation} fit={treatment.fit} panX={treatment.panX} panY={treatment.panY} filter={config.tone === 'mono' ? 'grayscale(1)' : 'none'} /><small>{photo ? 'YOUR PHOTOGRAPH' : 'SAMPLE · PREVIEW ONLY'}</small></div><div className="gw-photo-controls"><button type="button" className="gw-upload" disabled={uploading} onClick={() => requestPhoto(activeIndex)}><Upload size={17} /><span>{uploading ? 'Preparing photos…' : photo ? 'Change photo' : `Add photo to frame ${activeIndex + 1}`}<small>JPG, PNG or WebP · Up to 20 MB</small></span></button>{photo && <p className="gw-photo-filename">{photo.name} <button type="button" aria-label={`Remove photo from frame ${activeIndex + 1}`} onClick={() => { setPhotos(current => { const next = { ...current }; delete next[activeIndex]; return next; }); setError(''); }}><X size={13} /></button></p>}{photo && <label className="gw-swap-photo">Move / swap this photo<select aria-label="Move selected photo to another frame" value="" onChange={event => { const target = Number(event.target.value); setPhotos(current => swapGalleryEntries(current, activeIndex, target)); setSettings(current => swapGalleryEntries(current, activeIndex, target)); setActivePhoto(target); }}><option value="" disabled>Choose another frame…</option>{layout.slots.map((item, index) => index !== activeIndex && <option key={index} value={index}>Frame {index + 1} · {item.label}</option>)}</select></label>}<label className="gw-control-label">Photo fit</label><div className="gw-segment" role="group" aria-label="Selected photo fit"><button type="button" aria-pressed={treatment.fit === 'cover'} onClick={() => setTreatment('fit', 'cover')}>Fill opening</button><button type="button" aria-pressed={treatment.fit === 'contain'} onClick={() => setTreatment('fit', 'contain')}>Full photo</button></div>{treatment.fit === 'cover' && <div className="gw-crop-controls"><label>Move left / right<input type="range" min="0" max="100" value={treatment.panX} onChange={event => setTreatment('panX', Number(event.target.value))} /></label><label>Move up / down<input type="range" min="0" max="100" value={treatment.panY} onChange={event => setTreatment('panY', Number(event.target.value))} /></label></div>}{quality && <p className={`gw-quality gw-quality-${quality.level}`}>{quality.dpi} DPI · {quality.label}</p>}</div></div></div><p className="gw-upload-help">{config.photoMode === 'later' ? `${layout.framesCount - ready} remaining photo(s) can be shared after ordering. The studio needs the originals before printing.` : 'Upload your own photograph for every frame, or choose to share the remaining photos later.'}</p><input ref={fileInput} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={event => uploadFiles(event.target.files)} /><input ref={batchInput} type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={event => uploadFiles(event.target.files, true)} /></>}
        {step === 2 && <><fieldset className="gw-finishes"><legend>Choose one finish for your gallery</legend><div>{FRAME_FINISHES.map(item => <button type="button" key={item.id} aria-pressed={config.frameId === item.id} onClick={() => update('frameId', item.id)}><img src={homeFrame(item.id).frontImage} alt="" /><span><strong>{item.name}</strong><small>{item.finish}</small><small className="gw-finish-price">Included in set price</small></span>{config.frameId === item.id && <Check size={13} />}</button>)}</div><p>The photographed mount and inner detailing are part of the selected frame finish.</p></fieldset><div className="gw-tone"><span>Photo presentation · applies to every frame</span><div className="gw-segment" role="group" aria-label="Gallery photo tone"><button type="button" aria-pressed={config.tone === 'original'} onClick={() => update('tone', 'original')}>Original colour</button><button type="button" aria-pressed={config.tone === 'mono'} onClick={() => update('tone', 'mono')}>Black & white</button></div></div><div className="gw-review-card"><div><span className="gw-kicker">YOUR GALLERY AT A GLANCE</span><button type="button" className="gw-text-button" onClick={openPreview}>Inspect gallery <Expand size={12} /></button></div><dl><div><dt>Arrangement</dt><dd>{layout.name} · {layout.framesCount} frames</dd></div><div><dt>Print sizes</dt><dd>{layout.dimensions}</dd></div><div><dt>Finish</dt><dd>{frame.name}</dd></div><div><dt>Photos</dt><dd>{ready} added{ready < layout.framesCount ? ` · ${layout.framesCount - ready} to share` : ' · All ready'}</dd></div><div><dt>Also included</dt><dd>Prints + hanging template</dd></div></dl><button type="button" className="gw-text-button" onClick={() => goTo(1)}>Review each photograph <ArrowUpRight size={13} /></button></div><div className="gw-price"><div><span>{layout.name} · complete set</span><span>{money(pricing.base)}</span></div>{pricing.finishUpgrade > 0 && <div><span>Finish upgrade · {layout.framesCount} × {money(pricing.finishPerFrame)}</span><span>+{money(pricing.finishUpgrade)}</span></div>}<div className="gw-price-total"><span>Set total<small>{layout.framesCount} frames, printed & ready to arrange</small></span><strong>{money(pricing.total)}</strong></div><p>Delivery is calculated at checkout.</p></div><p className="gw-order-note"><Check size={15} /> Your layout, frame finish and photo placements are saved together. Original files stay on this device; share them with the studio to confirm printing.</p></>}
        {error && <p className="gw-error" role="alert" ref={errorRef} tabIndex={-1}>{error}</p>}
        <div className="gw-editor-actions">{step ? <button type="button" className="gw-back" onClick={() => goTo(step - 1)}><ArrowLeft size={15} /> Back</button> : <span className="gw-action-price"><small>Your complete set</small><strong>{money(pricing.total)}</strong></span>}{step < 2 ? <button type="button" className="gw-primary" disabled={uploading} onClick={nextStep}>{step === 0 ? 'Make it personal' : 'Finish & review'} <ArrowRight size={16} /></button> : <button type="button" className="gw-primary" disabled={saving || uploading} onClick={addToBag}><ShoppingBag size={15} /> {saving ? 'Saving gallery…' : `Add set · ${money(pricing.total)}`} <ArrowRight size={15} /></button>}</div>
        <a className="gw-studio-help" href={askStudio()} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> Plan this wall with the studio <ArrowUpRight size={13} /></a>
      </div>
    </div>
    <div className="gw-afterword"><div><Ruler size={22} strokeWidth={1.2} /><span><strong>A little planning. A lovely result.</strong><small>Measure your clear wall space, check the print sizes and use the included paper template to position your frames.</small></span></div><Link to="/#custom-frames">Have a different arrangement in mind? <ArrowUpRight size={15} /></Link></div>
  </div>{previewOpen && <GalleryInspector config={currentConfig} photos={photos} settings={settings} activeIndex={activeIndex} setActiveIndex={setActivePhoto} mode={mode} setMode={setMode} onClose={closePreview} onEdit={() => { closePreview(); goTo(1); }} />}</div>;
}

