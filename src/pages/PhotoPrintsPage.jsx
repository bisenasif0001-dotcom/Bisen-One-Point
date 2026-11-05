import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Crop, FileText, Image as ImageIcon, Info, LoaderCircle, Maximize2, MessageCircle, Minus, Plus, RotateCw, ShieldCheck, ShoppingBag, SlidersHorizontal, Upload, X } from 'lucide-react';
import { SAMPLE_CUSTOM_PHOTOS } from '../data/products';
import { getWhatsAppUrl } from '../data/businessConfig';
import { measureStudioImage } from '../utils/frameStudio';
import { DEFAULT_PRINT_CONFIG, MAX_PRINT_COPIES, MAX_PRINT_PHOTOS, PRINT_FINISHES, PRINT_SIZES, PRINT_TONES, buildPrintCartItem, getPrintLayout, getPrintQuality, getPrintTotals, readPrintPhoto, validatePrintFile } from '../utils/photoPrints';
import { savePrintOriginals } from '../utils/printPhotoStorage';
import PrintPaperPreview from '../components/PrintPaperPreview';
import './PhotoPrintsPage.css';

const samplePhoto = sample => ({ id: `sample-${sample.id}`, name: sample.name, url: sample.url, isSample: true, width: 900, height: 600, rotation: 0, panX: 50, panY: 50, zoom: 1 });
const initialSample = samplePhoto(SAMPLE_CUSTOM_PHOTOS[1]);
const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
const steps = ['Your photos', 'Print options', 'Review'];

export default function PhotoPrintsPage({ onAddToCart }) {
  const [photos, setPhotos] = useState([initialSample]);
  const [activeId, setActiveId] = useState(initialSample.id);
  const [config, setConfig] = useState({ ...DEFAULT_PRINT_CONFIG });
  const [step, setStep] = useState(0);
  const [sizeGroup, setSizeGroup] = useState('photo');
  const [copies, setCopies] = useState('1');
  const [notes, setNotes] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const [notice, setNotice] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const inputRef = useRef(null);
  const controlsRef = useRef(null);
  const dialogRef = useRef(null);
  const ownedUrls = useRef(new Set());
  const mounted = useRef(true);
  const dragDepth = useRef(0);
  const orientationChosen = useRef(false);
  const currentPhoto = photos.find(photo => photo.id === activeId) || photos[0] || null;
  const activeIndex = currentPhoto ? photos.indexOf(currentPhoto) : -1;
  const uploadedPhotos = photos.filter(photo => !photo.isSample);
  const hasPhotos = uploadedPhotos.length > 0;
  const size = PRINT_SIZES.find(item => item.id === config.sizeId);
  const finish = PRINT_FINISHES.find(item => item.id === config.finishId);
  const totals = getPrintTotals(hasPhotos ? uploadedPhotos.length : 1, config.sizeId, copies);
  const quality = getPrintQuality(currentPhoto, config);
  const lowQualityCount = uploadedPhotos.filter(photo => getPrintQuality(photo, config)?.level === 'low').length;
  const layout = getPrintLayout(currentPhoto, config);
  const busy = uploading || saving;

  useEffect(() => {
    mounted.current = true;
    const urls = ownedUrls.current;
    return () => { mounted.current = false; urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  useEffect(() => {
    if (!currentPhoto?.isSample) return;
    let ignore = false;
    const id = currentPhoto.id;
    measureStudioImage(currentPhoto.url).then(dimensions => {
      if (!ignore) setPhotos(previous => previous.map(photo => photo.id === id ? { ...photo, ...dimensions } : photo));
    }).catch(() => {});
    return () => { ignore = true; };
  }, [currentPhoto?.id, currentPhoto?.url, currentPhoto?.isSample]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!previewOpen) { if (dialog.open) dialog.close(); return; }
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; if (dialog.open) dialog.close(); };
  }, [previewOpen]);

  const changeConfig = (key, value) => { if (key === 'orientation') orientationChosen.current = true; setConfig(previous => ({ ...previous, [key]: value })); setNotice(''); };
  const updatePhoto = changes => setPhotos(previous => previous.map(photo => photo.id === currentPhoto?.id ? { ...photo, ...changes } : photo));
  const rotatePhoto = () => { if (currentPhoto) updatePhoto({ rotation: (currentPhoto.rotation + 90) % 360, panX: 50, panY: 50 }); };
  const goStep = next => {
    setStep(next);
    if (window.innerWidth <= 900 || controlsRef.current?.getBoundingClientRect().top < 100) {
      controlsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
  };
  const browsePhotos = () => inputRef.current?.click();
  const changePhoto = direction => { if (photos.length) setActiveId(photos[(activeIndex + direction + photos.length) % photos.length].id); };

  const uploadPhotos = async files => {
    if (busy || !files.length) return;
    setUploading(true);
    setErrors([]);
    setNotice('');
    const available = MAX_PRINT_PHOTOS - uploadedPhotos.length;
    const problems = [];
    const supported = Array.from(files).filter(file => {
      const error = validatePrintFile(file);
      if (error) problems.push(`${file.name}: ${error}`);
      return !error;
    });
    if (supported.length > available) problems.push(`You can add up to ${MAX_PRINT_PHOTOS} photos in one print selection. Extra files were skipped.`);
    const chosen = supported.slice(0, available);
    const loaded = [];
    for (let offset = 0; offset < chosen.length; offset += 3) {
      const batch = chosen.slice(offset, offset + 3);
      const results = await Promise.allSettled(batch.map(readPrintPhoto));
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') loaded.push(result.value);
        else problems.push(`${batch[index].name}: ${result.reason.message}`);
      });
    }
    if (!mounted.current) { loaded.forEach(photo => URL.revokeObjectURL(photo.url)); return; }
    loaded.forEach(photo => ownedUrls.current.add(photo.url));
    if (loaded.length) {
      if (!hasPhotos && !orientationChosen.current) setConfig(previous => ({ ...previous, orientation: loaded[0].width > loaded[0].height ? 'landscape' : 'portrait' }));
      setPhotos(previous => [...previous.filter(photo => !photo.isSample), ...loaded]);
      setActiveId(loaded[0].id);
      setNotice(`${loaded.length} ${loaded.length === 1 ? 'photo added' : 'photos added'}. Your originals stay in this browser.`);
    }
    setErrors(problems);
    setUploading(false);
  };

  const removePhoto = id => {
    const photo = photos.find(item => item.id === id);
    if (photo && ownedUrls.current.has(photo.url)) { URL.revokeObjectURL(photo.url); ownedUrls.current.delete(photo.url); }
    setPhotos(previous => previous.filter(item => item.id !== id));
    setNotice('Photo removed from this selection.');
  };

  const addToBag = async () => {
    if (busy) return;
    if (!hasPhotos) { goStep(0); browsePhotos(); return; }
    if (!totals) { goStep(2); setErrors([`Choose between 1 and ${MAX_PRINT_COPIES} copies per photo.`]); return; }
    setSaving(true);
    setErrors([]);
    try {
      const item = buildPrintCartItem({ photos: uploadedPhotos, config, copies, notes });
      await savePrintOriginals(uploadedPhotos);
      if (!mounted.current) return;
      if (typeof onAddToCart !== 'function') throw new Error('The shopping bag is unavailable. Please refresh the page and try again.');
      onAddToCart(item);
      setNotice(`${item.printQuantity} prints added to your bag.`);
    } catch (error) {
      if (mounted.current) setErrors([error.message]);
    } finally { if (mounted.current) setSaving(false); }
  };

  const action = () => {
    if (step === 0 && !hasPhotos) { browsePhotos(); return; }
    return step < 2 ? goStep(step + 1) : addToBag();
  };
  const actionLabel = busy ? (saving ? 'Saving your photos…' : 'Preparing photos…') : step === 0 ? (hasPhotos ? 'Choose print options' : 'Upload my photos') : step === 1 ? 'Review my prints' : hasPhotos ? 'Add prints to bag' : 'Upload photos to order';
  const mobileActionLabel = busy ? (saving ? 'Saving…' : 'Preparing…') : step === 0 ? (hasPhotos ? 'Print options' : 'Upload photos') : step === 1 ? 'Review' : hasPhotos ? 'Add to bag' : 'Upload photos';
  const orderMessage = `Hello Al-Noor! I would like photo prints.\nSize: ${size.name} (${size.dimensions})\nFinish: ${finish.name}\nOrientation: ${config.orientation}\nBorder: ${config.border === 'white' ? '5 mm white' : 'Borderless'}\nFit: ${config.fit === 'cover' ? 'Fill the paper' : 'Keep full photo'}\nColour: ${PRINT_TONES.find(tone => tone.id === config.tone).name}\nPhotos: ${uploadedPhotos.length}\nCopies each: ${copies}\n${hasPhotos && totals ? `Print subtotal: ${money(totals.total)} + delivery\n` : ''}${notes.trim() ? `Notes: ${notes.trim()}\n` : ''}Please help me confirm my selection. I can share the original photos here.`;

  const paper = (large = false) => currentPhoto ? <div className={`pp-paper pp-paper--${config.finishId} ${large ? 'pp-paper--large' : ''}`} style={{ '--paper-ratio': layout.width / layout.height, '--paper-width': config.orientation === 'landscape' ? '340px' : '245px' }}><PrintPaperPreview photo={currentPhoto} config={config} /></div> : <div className="pp-empty-preview"><ImageIcon size={34} strokeWidth={1} /><strong>Your photo goes here</strong><span>Upload a favourite to see it in print.</span><button className="pp-text-button" type="button" onClick={browsePhotos}>Choose photos <ArrowRight size={14} /></button></div>;
  const choice = (key, value, label, extra) => <button key={`${key}-${value}`} type="button" className={`pp-choice ${config[key] === value ? 'is-selected' : ''}`} aria-pressed={config[key] === value} onClick={() => changeConfig(key, value)}>{extra}{label}{config[key] === value && <Check size={12} />}</button>;

  return <div className="photo-prints-page">
    <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="pp-file-input" tabIndex={-1} aria-label="Choose photos to print" disabled={busy} onChange={event => { const files = Array.from(event.target.files || []); event.target.value = ''; uploadPhotos(files); }} />
    <div className="pp-container">
      <header className="pp-intro">
        <div><div className="pp-breadcrumb"><Link to="/">Home</Link><span>/</span><span>Photo prints</span></div><span className="pp-eyebrow">THE PHOTO PRINT STUDIO</span><h1>Photos worth <em>holding.</em></h1><p>Upload your favourites. Find your finish. Make a little room for real memories.</p></div>
        <div className="pp-intro-note"><span>Small prints. Lasting moments.</span><strong>From {money(29)}<small> / print</small></strong><div>7 sizes <span>·</span> 3 paper finishes</div></div>
      </header>

      <div className="pp-workspace">
        <aside className="pp-preview" aria-label="Your photo print preview">
          <div className="pp-preview-heading"><div><span className="pp-live-dot" />YOUR PRINT PREVIEW</div><button type="button" className="pp-icon-button" onClick={() => setPreviewOpen(true)} aria-label="Enlarge print preview" disabled={!currentPhoto}><Maximize2 size={16} /></button></div>
          <div className="pp-stage">{currentPhoto?.isSample && <span className="pp-sample-badge">SAMPLE PHOTO</span>}{paper()}<span className="pp-stage-caption">A moment, made tangible.</span></div>
          <div className="pp-preview-toolbar"><div className="pp-photo-pagination"><button className="pp-icon-button" type="button" onClick={() => changePhoto(-1)} aria-label="Previous photo" disabled={photos.length < 2}><ChevronLeft size={16} /></button><span>{currentPhoto ? `${activeIndex + 1} / ${photos.length}` : 'No photos'}</span><button className="pp-icon-button" type="button" onClick={() => changePhoto(1)} aria-label="Next photo" disabled={photos.length < 2}><ChevronRight size={16} /></button></div><span className="pp-preview-spec">{size.name}<span>·</span>{finish.name}</span><button className="pp-icon-button" type="button" onClick={rotatePhoto} aria-label="Rotate selected photo clockwise" disabled={!currentPhoto || busy}><RotateCw size={16} /></button></div>
          <div className={`pp-quality ${quality ? `pp-quality--${quality.level}` : ''}`}><Info size={14} /><span>{quality ? <>{quality.label}<small>{quality.dpi} DPI at this size</small></> : currentPhoto?.isSample ? <>A sample to help you explore<small>Upload your own photos when you’re ready.</small></> : <>Your print, previewed here<small>Choose a photo to get started.</small></>}</span></div>
          <div className="pp-preview-summary"><div><span>{hasPhotos ? 'PRINT SUBTOTAL' : 'EXAMPLE PRICE'}</span><strong>{totals ? money(totals.total) : '—'}<small>{money(size.price)} per print</small></strong></div><p>{hasPhotos && totals ? `${totals.photoCount} ${totals.photoCount === 1 ? 'photo' : 'photos'} × ${totals.copies} ${totals.copies === 1 ? 'copy' : 'copies'} = ${totals.printCount} prints` : 'Explore with a sample. Order with your own photos.'}<small>Delivery calculated at checkout.</small></p></div>
        </aside>

        <div className="pp-editor" ref={controlsRef} aria-label="Customise your photo prints">
          <nav className="pp-steps" aria-label="Print customisation steps">{steps.map((label, index) => <button key={label} type="button" className={step === index ? 'is-current' : ''} aria-current={step === index ? 'step' : undefined} aria-controls="pp-step-panel" onClick={() => goStep(index)}><span>{index < step ? <Check size={13} /> : `0${index + 1}`}</span><strong>{label}</strong></button>)}</nav>
          <div className="pp-feedback" aria-live="polite" aria-atomic="true">{notice && <p className="pp-notice"><Check size={14} />{notice}</p>}{errors.length > 0 && <div className="pp-error" role="alert"><Info size={16} /><div>{errors.map((error, index) => <p key={`${index}-${error}`}>{error}</p>)}</div><button className="pp-icon-button" type="button" onClick={() => setErrors([])} aria-label="Dismiss upload errors"><X size={14} /></button></div>}</div>
          <fieldset className="pp-panel" id="pp-step-panel" disabled={busy} aria-busy={busy}>
            <legend className="pp-sr-only">{steps[step]}</legend>
            {step === 0 && <>
              <div className="pp-panel-heading"><span className="pp-eyebrow">01 / START WITH A MEMORY</span><h2>Your favourite photos.</h2><p>Add up to {MAX_PRINT_PHOTOS} photos. You can adjust each one in the preview.</p></div>
              <div className={`pp-dropzone ${hasPhotos ? 'is-compact' : ''} ${dragging ? 'is-dragging' : ''}`} onDragEnter={event => { event.preventDefault(); dragDepth.current++; setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={event => { event.preventDefault(); dragDepth.current--; if (dragDepth.current <= 0) setDragging(false); }} onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); uploadPhotos(Array.from(event.dataTransfer.files)); }}>
                <button type="button" onClick={browsePhotos} disabled={uploading || uploadedPhotos.length >= MAX_PRINT_PHOTOS}><span className="pp-upload-icon">{uploading ? <LoaderCircle className="pp-spin" size={22} /> : <Upload size={22} strokeWidth={1.5} />}</span><strong>{uploading ? 'Preparing your photos…' : hasPhotos ? 'Add more photos' : 'Choose your photos'}</strong><span className="pp-drop-instruction">or drop them here</span><small>JPG, PNG or WebP · Up to 25 MB each</small></button>
              </div>
              {hasPhotos ? <>
                <div className="pp-gallery-label"><strong>{uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'photo selected' : 'photos selected'}</strong><span>Tap a photo to preview</span></div>
                <div className="pp-filmstrip" role="group" aria-label="Your uploaded photos">{photos.map((photo, index) => <div className={`pp-thumbnail ${currentPhoto?.id === photo.id ? 'is-selected' : ''}`} key={photo.id}><button type="button" className="pp-thumbnail-select" aria-label={`Preview photo ${index + 1}: ${photo.name}`} aria-pressed={currentPhoto?.id === photo.id} onClick={() => setActiveId(photo.id)}><img src={photo.thumbnail || photo.url} alt="" /><span>{String(index + 1).padStart(2, '0')}{currentPhoto?.id === photo.id && <Check size={11} />}</span></button><button type="button" className="pp-thumbnail-remove" onClick={() => removePhoto(photo.id)} aria-label={`Remove ${photo.name}`}><X size={12} /></button></div>)}</div>
                <div className="pp-active-file"><ImageIcon size={15} /><span><strong>{currentPhoto?.name}</strong><small>{currentPhoto?.width} × {currentPhoto?.height} pixels</small></span><button type="button" className="pp-icon-button" onClick={rotatePhoto} aria-label="Rotate selected photo"><RotateCw size={16} /></button></div>
              </> : <div className="pp-samples"><div><span>Just looking? Try a sample.</span><small>Samples are for preview only.</small></div><div className="pp-sample-options">{SAMPLE_CUSTOM_PHOTOS.slice(0, 3).map((sample, index) => <button type="button" key={sample.id} className={currentPhoto?.id === `sample-${sample.id}` ? 'is-selected' : ''} aria-label={`Preview sample ${index + 1}: ${sample.name}`} aria-pressed={currentPhoto?.id === `sample-${sample.id}`} onClick={() => { const photo = samplePhoto(sample); setPhotos([photo]); setActiveId(photo.id); }}><img src={sample.url} alt="" loading="lazy" /><span>{index === 0 ? 'A favourite view' : index === 1 ? 'Your people' : 'A special place'}{currentPhoto?.id === `sample-${sample.id}` && <Check size={11} />}</span></button>)}</div></div>}
              <div className="pp-quiet-note"><ShieldCheck size={14} /><span>Your originals stay on this device while you customise.</span></div>
            </>}

            {step === 1 && <>
              <div className="pp-panel-heading"><span className="pp-eyebrow">02 / MAKE IT YOURS</span><h2>A size. A finish. Your style.</h2><p>These options apply to every photo in this selection.</p></div>
              <div className="pp-option-heading"><h3>Print size</h3><div className="pp-format-toggle" role="group" aria-label="Print size collections"><button type="button" aria-pressed={sizeGroup === 'photo'} onClick={() => setSizeGroup('photo')}>Photo sizes</button><button type="button" aria-pressed={sizeGroup === 'wall'} onClick={() => setSizeGroup('wall')}>Wall sizes</button></div></div>
              <div className={`pp-size-grid ${sizeGroup === 'wall' ? 'pp-size-grid--wall' : ''}`} role="group" aria-label="Choose a print size">{PRINT_SIZES.filter(item => item.group === sizeGroup).map(item => <button type="button" className={`pp-size-option ${config.sizeId === item.id ? 'is-selected' : ''}`} key={item.id} aria-pressed={config.sizeId === item.id} onClick={() => changeConfig('sizeId', item.id)}><span><strong>{item.name}</strong><span>{money(item.price)}</span></span><small>{item.dimensions}</small>{config.sizeId === item.id && <Check size={12} />}</button>)}</div>
              <p className="pp-option-hint">{size.use} <span>·</span> {money(size.price)} per print</p>
              <div className="pp-option-heading"><h3>Paper finish</h3><span>Same price for every finish</span></div>
              <div className="pp-finish-grid" role="group" aria-label="Choose a paper finish">{PRINT_FINISHES.map(item => <button type="button" key={item.id} className={`pp-finish-option ${item.id === config.finishId ? 'is-selected' : ''}`} aria-pressed={item.id === config.finishId} onClick={() => changeConfig('finishId', item.id)}><span className={`pp-finish-texture pp-finish-texture--${item.texture}`} aria-hidden="true" /><strong>{item.name}</strong><small>{item.detail}</small>{item.id === config.finishId && <Check size={12} />}</button>)}</div>
              <div className="pp-two-options"><div><h3>Orientation</h3><div className="pp-choice-row" role="group" aria-label="Print orientation">{choice('orientation', 'portrait', 'Portrait', <span className="pp-orientation-icon" />)}{choice('orientation', 'landscape', 'Landscape', <span className="pp-orientation-icon is-landscape" />)}</div></div><div><h3>Paper border</h3><div className="pp-choice-row" role="group" aria-label="Paper border">{choice('border', 'borderless', 'No border')}{choice('border', 'white', '5 mm white')}</div></div></div>
              <div className="pp-option-heading"><h3>How should the photo fit?</h3></div><div className="pp-choice-row pp-fit-options" role="group" aria-label="Photo fit">{choice('fit', 'contain', <span><strong>Keep full photo</strong><small>Show everything. White space may appear.</small></span>, <ImageIcon size={17} />)}{choice('fit', 'cover', <span><strong>Fill the paper</strong><small>Crop the edges to fill your chosen size.</small></span>, <Crop size={17} />)}</div>
              <button type="button" className="pp-disclosure" aria-expanded={cropOpen} aria-controls="pp-photo-adjustments" onClick={() => setCropOpen(value => !value)}><SlidersHorizontal size={15} /><span>Adjust crop & colour</span><span>{cropOpen ? <Minus size={14} /> : <Plus size={14} />}</span></button>
              {cropOpen && <div className="pp-adjustments" id="pp-photo-adjustments"><div className="pp-adjust-photo"><span>Adjusting: <strong>{currentPhoto?.name || 'No photo selected'}</strong></span><button type="button" className="pp-text-button" onClick={() => updatePhoto({ panX: 50, panY: 50, zoom: 1, rotation: 0 })} disabled={!currentPhoto}>Reset photo</button></div>{config.fit === 'cover' && currentPhoto ? <div className="pp-crop-sliders">{[['panX', 'Horizontal position', 0, 100, 1], ['panY', 'Vertical position', 0, 100, 1], ['zoom', 'Zoom', 1, 3, .05]].map(([key, label, min, max, increment]) => <label key={key}><span>{label}<output>{key === 'zoom' ? `${(currentPhoto[key] || 1).toFixed(2)}×` : `${currentPhoto[key] ?? 50}%`}</output></span><input type="range" aria-label={label} min={min} max={max} step={increment} value={currentPhoto[key] ?? (key === 'zoom' ? 1 : 50)} onChange={event => updatePhoto({ [key]: Number(event.target.value) })} /></label>)}</div> : <p className="pp-option-hint">Choose “Fill the paper” to reposition or zoom into the selected photo.</p>}<h3>Photo colour <small>Applies to all photos</small></h3><div className="pp-choice-row" role="group" aria-label="Photo colour">{PRINT_TONES.map(item => choice('tone', item.id, item.name))}</div><button type="button" className="pp-text-button pp-preview-link" onClick={() => setPreviewOpen(true)} disabled={!currentPhoto}><Maximize2 size={13} />View this photo larger</button></div>}
            </>}

            {step === 2 && <>
              <div className="pp-panel-heading"><span className="pp-eyebrow">03 / THE LITTLE DETAILS</span><h2>Ready to make them real?</h2><p>One last look at your photos, your choices and your total.</p></div>
              {!hasPhotos && <div className="pp-sample-reminder"><Info size={17} /><div><strong>You’re exploring with a sample.</strong><p>Upload your own photos before adding prints to your bag.</p><button className="pp-text-button" type="button" onClick={() => { goStep(0); browsePhotos(); }}>Choose my photos <ArrowRight size={13} /></button></div></div>}
              <div className="pp-review-photos"><div><h3>{hasPhotos ? `${uploadedPhotos.length} ${uploadedPhotos.length === 1 ? 'photo' : 'photos'} selected` : 'Your photos'}</h3><button type="button" className="pp-text-button" onClick={() => goStep(0)}>{hasPhotos ? 'Edit photos' : 'Add photos'} <ArrowRight size={13} /></button></div>{hasPhotos && <div className="pp-review-strip">{uploadedPhotos.map((photo, index) => <button type="button" key={photo.id} aria-label={`Inspect photo ${index + 1}: ${photo.name}`} onClick={() => { setActiveId(photo.id); setPreviewOpen(true); }}><img src={photo.thumbnail} alt="" /><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>}</div>
              <dl className="pp-review-specs"><div><dt>Print size</dt><dd>{size.name}<small>{size.dimensions} · {config.orientation}</small></dd></div><div><dt>Finish & border</dt><dd>{finish.name}<small>{config.border === 'white' ? '5 mm white border' : 'No paper border'}</small></dd></div><div><dt>Photo treatment</dt><dd>{config.fit === 'cover' ? 'Fill the paper' : 'Keep full photo'}<small>{PRINT_TONES.find(tone => tone.id === config.tone).name}</small></dd></div></dl>
              <button className="pp-text-button pp-edit-options" type="button" onClick={() => goStep(1)}>Edit print options <ArrowRight size={13} /></button>
              <div className="pp-quantity"><div><h3>Copies of each photo</h3><p>The same number of copies for every photo.</p></div><div className="pp-stepper"><button type="button" aria-label="Decrease copies per photo" disabled={Number(copies) <= 1} onClick={() => setCopies(String(Math.max(1, (Number(copies) || 1) - 1)))}><Minus size={15} /></button><input type="number" inputMode="numeric" min="1" max={MAX_PRINT_COPIES} aria-label="Copies per photo" value={copies} onChange={event => { setCopies(event.target.value); setNotice(''); }} /><button type="button" aria-label="Increase copies per photo" disabled={Number(copies) >= MAX_PRINT_COPIES} onClick={() => setCopies(String(Math.min(MAX_PRINT_COPIES, (Number(copies) || 0) + 1)))}><Plus size={15} /></button></div></div>
              <div className="pp-quantity-presets" role="group" aria-label="Quick copy counts">{[1, 2, 5, 10, 25].map(count => <button type="button" key={count} aria-pressed={Number(copies) === count} onClick={() => setCopies(String(count))}>{count} {count === 1 ? 'copy' : 'copies'}</button>)}</div>
              {!totals ? <p className="pp-inline-error">Choose a whole number from 1 to {MAX_PRINT_COPIES} copies.</p> : <div className="pp-price-equation"><span>{hasPhotos ? `${totals.photoCount} ${totals.photoCount === 1 ? 'photo' : 'photos'} × ${totals.copies} ${totals.copies === 1 ? 'copy' : 'copies'} × ${money(totals.unitPrice)}` : `Example: 1 photo × ${totals.copies} ${totals.copies === 1 ? 'copy' : 'copies'} × ${money(totals.unitPrice)}`}<strong>{money(totals.total)}</strong></span><small>{totals.printCount} {totals.printCount === 1 ? 'print' : 'prints'} in total. Delivery added at checkout.</small></div>}
              {lowQualityCount > 0 && <p className="pp-low-quality"><Info size={15} /><span>{lowQualityCount} {lowQualityCount === 1 ? 'photo has' : 'photos have'} limited resolution at this size. Try a smaller print or a higher-resolution original.</span></p>}
              <button type="button" className="pp-disclosure" aria-expanded={notesOpen} aria-controls="pp-order-notes" onClick={() => setNotesOpen(value => !value)}><FileText size={15} /><span>Note for the studio{notes.trim() && <small> · Added</small>}</span>{notesOpen ? <Minus size={14} /> : <Plus size={14} />}</button>
              {notesOpen && <div className="pp-notes" id="pp-order-notes"><label htmlFor="pp-notes">Anything we should know?</label><textarea id="pp-notes" value={notes} maxLength={1000} rows={3} onChange={event => setNotes(event.target.value)} placeholder="For example: please keep the date in the corner visible." /><small>{notes.length} / 1000 characters</small></div>}
              <a className="pp-help-link" href={getWhatsAppUrl(orderMessage)} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} />Need help? Review these details with the studio <ArrowRight size={13} /></a><p className="pp-originals-note">Share the original photo files with the studio when confirming your order.</p>
            </>}
          </fieldset>
          <div className="pp-panel-footer"><button type="button" className="pp-back" onClick={() => goStep(Math.max(0, step - 1))} disabled={step === 0 || busy}><ArrowLeft size={15} />Back</button><span>Step {step + 1} of 3</span><button type="button" className="pp-primary pp-desktop-action" disabled={busy || (step === 2 && !totals)} onClick={action}>{busy ? <LoaderCircle className="pp-spin" size={16} /> : step === 2 ? <ShoppingBag size={16} /> : null}{actionLabel}<ArrowRight size={15} /></button></div>
        </div>
      </div>
      <div className="pp-bottom-note"><ImageIcon size={15} /><p>Your photos, your way.<span>Preview the crop and check each photo before ordering.</span></p><Link to="/custom-framing">Looking for a frame? <ArrowRight size={14} /></Link></div>
    </div>

    <div className="pp-mobile-bar"><button type="button" className="pp-mobile-preview" onClick={() => setPreviewOpen(true)} disabled={!currentPhoto} aria-label="Open live print preview"><Maximize2 size={16} /><span>Preview</span></button><div className="pp-mobile-total"><strong>{totals ? money(totals.total) : '—'}</strong><span>{hasPhotos && totals ? `${totals.printCount} prints` : 'Example price'}</span></div><button type="button" className="pp-primary" disabled={busy || (step === 2 && !totals)} onClick={action}>{busy ? <LoaderCircle className="pp-spin" size={15} /> : null}<span>{mobileActionLabel}</span>{!busy && <ArrowRight size={14} />}</button></div>

    <dialog ref={dialogRef} className="pp-preview-dialog" aria-label="Enlarged photo print preview" onClose={() => setPreviewOpen(false)} onClick={event => { if (event.target === event.currentTarget) setPreviewOpen(false); }}>
      <div className="pp-dialog-heading"><div><span className="pp-eyebrow">YOUR PRINT, UP CLOSE</span><h2>{size.name} <span>· {finish.name}</span></h2></div><button type="button" className="pp-icon-button" aria-label="Close print preview" onClick={() => setPreviewOpen(false)}><X size={20} /></button></div>
      <div className="pp-dialog-stage">{paper(true)}</div>
      <div className="pp-dialog-footer"><div className="pp-photo-pagination"><button type="button" className="pp-icon-button" aria-label="Previous enlarged photo" disabled={photos.length < 2} onClick={() => changePhoto(-1)}><ChevronLeft size={18} /></button><span>{currentPhoto ? `${activeIndex + 1} of ${photos.length}` : 'No photos'}</span><button type="button" className="pp-icon-button" aria-label="Next enlarged photo" disabled={photos.length < 2} onClick={() => changePhoto(1)}><ChevronRight size={18} /></button></div><p>{config.fit === 'cover' ? 'Cropped to fill' : 'Full photo'} · {config.border === 'white' ? '5 mm white border' : 'No paper border'}<span>On-screen colours and paper texture are illustrative.</span></p></div>
    </dialog>
  </div>;
}

