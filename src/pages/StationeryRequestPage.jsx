import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileUp, LockKeyhole, PenLine } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import OrderFilesPanel from '../components/OrderFilesPanel';
import StudioEnquiryReceipt from '../components/StudioEnquiryReceipt';
import { getStationeryOccasion, stationeryRequestPath, STATIONERY_OCCASIONS } from '../data/cardStationery';
import { ORDER_FILE_RULES } from '../data/orderFiles';
import './CardsStationery.css';

const formats = ['Flat card', 'Folded card', 'Invitation with inserts'];
const sizes = ['A6 (10.5 × 14.8 cm)', '5 × 7 in', 'A5 (14.8 × 21 cm)', 'Square (14 × 14 cm)', 'Custom size'];
const papers = ['Studio recommendation', 'Smooth cardstock', 'Textured cardstock', 'Matte cardstock'];
const languages = ['English', 'Hindi', 'Urdu', 'Arabic', 'Multiple languages / other'];

function RequestSelect({ label, value, onChange, options }) {
  return <label>{label}<select value={value} onChange={event => onChange(event.target.value)}>{options.map(value => <option key={value}>{value}</option>)}</select></label>;
}

export default function StationeryRequestPage({ mode }) {
  const [params] = useSearchParams();
  const initialOccasion = getStationeryOccasion(params.get('occasion'));
  return <StationeryRequest key={`${mode}-${initialOccasion?.id || ''}`} mode={mode} initialOccasion={initialOccasion} />;
}

function StationeryRequest({ mode, initialOccasion }) {
  const design = mode === 'design';
  const [draft, setDraft] = useState(() => ({ occasion: initialOccasion?.name || 'Other', name: '', format: initialOccasion?.id === 'wedding' ? 'Flat card' : 'Folded card', size: sizes[1], dimensions: '', quantity: '25', sides: 'Double-sided', paper: papers[0], envelopes: 'Please quote envelopes', language: 'English', date: '', notes: '' }));
  const [files, setFiles] = useState([]), [fileError, setFileError] = useState('');
  const [review, setReview] = useState(false), [order, setOrder] = useState(null);
  const heading = useRef(null), notesInput = useRef(null);
  const title = design ? 'Get a custom design' : 'Print your own design';
  const Icon = design ? PenLine : FileUp;
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const changeStage = next => {
    setReview(next);
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start' }); });
  };
  const reviewRequest = event => {
    event.preventDefault();
    if (design && !draft.notes.trim()) {
      notesInput.current.setCustomValidity('Describe the design you need.');
      notesInput.current.reportValidity();
      return;
    }
    changeStage(true);
  };
  const pickFiles = event => {
    const next = [...event.target.files];
    const invalid = next.find(file => !/\.(pdf|jpe?g|png|webp)$/i.test(file.name) || !file.size || file.size > ORDER_FILE_RULES.maxFileBytes);
    const message = invalid ? `Choose a PDF, JPG, PNG or WebP up to 20 MB for ${invalid.name}.` : next.length > 6 ? 'Choose up to six files here. You can add more on the tracking page.' : '';
    setFileError(message);
    setFiles(message ? [] : next);
    event.target.value = '';
  };
  const rows = [
    ['Request', title], ['Occasion', draft.occasion], ['Format', draft.format], ['Size', draft.size === 'Custom size' ? draft.dimensions.trim() : draft.size],
    ['Print sides', draft.sides], ['Quantity', `${draft.quantity} cards`], ['Paper', draft.paper], ['Envelopes', draft.envelopes],
    ...(design ? [['Language', draft.language]] : []),
    ...(draft.date ? [['Need by', draft.date]] : []),
    ...(draft.notes.trim() ? [[design ? 'Design brief' : 'Printing notes', draft.notes.trim()]] : []),
  ];
  const details = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

  return <div className="cs-page"><div className="cs-shell">
    <nav className="cs-breadcrumb" aria-label="Breadcrumb"><Link to="/cards"><ArrowLeft size={15} /> Cards & invitations</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
    <header className="cs-request-title"><span className="cs-kicker">BISEN STATIONERY</span><h1>{title}</h1><p>{design ? 'Tell us what you need. The studio will quote the design and printing, then share a proof for your approval.' : 'Send your finished artwork and tell us how you want it printed. We’ll check the file and confirm the quote with you.'}</p></header>
    <div className="cs-request-layout">
      <aside className="cs-request-aside"><Icon size={30} strokeWidth={1.4} /><h2>From your brief to print</h2><ol><li>Choose your print specifications.</li><li>Save the request for a tracking reference.</li><li>{design ? 'Share references and review the studio’s proof.' : 'Upload your original artwork privately.'}</li></ol><p>The studio confirms paper, pricing and timing before production.</p><Link to={stationeryRequestPath(design ? 'print' : 'design', initialOccasion?.id)}>{design ? 'Already have a finished design?' : 'Need help creating the artwork?'} <ArrowRight size={15} /></Link></aside>
      <div className="cs-request-main">
        <section className="cs-request-panel">
          <h2 ref={heading} tabIndex={-1}>{order ? 'Your request is saved' : review ? 'Review your request' : 'Your card specifications'}</h2>
          {review ? <>
            {!order && <><dl className="cs-request-summary">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}<div><dt>Files</dt><dd>{files.length ? files.map(file => file.name).join(', ') : 'Choose files after saving'}</dd></div></dl><p className="cs-private-note"><LockKeyhole size={16} /> Save the request, then upload files privately using the panel below.</p></>}
            <StudioEnquiryReceipt title={`${title} · ${draft.occasion}`} details={details} name={draft.name.trim()} quantity={Number(draft.quantity)} onSaved={setOrder} onEdit={() => changeStage(false)} privateFiles />
          </> : <form onSubmit={reviewRequest}>
            <div className="cs-fields">
              <RequestSelect label="Occasion" value={draft.occasion} onChange={value => update('occasion', value)} options={['Other', ...STATIONERY_OCCASIONS.map(item => item.name)]} />
              <RequestSelect label="Card format" value={draft.format} onChange={value => update('format', value)} options={formats} />
              <RequestSelect label="Finished size" value={draft.size} onChange={value => update('size', value)} options={sizes} />
              {draft.size === 'Custom size' && <label>Custom dimensions<input value={draft.dimensions} onChange={event => update('dimensions', event.target.value)} required pattern=".*\S.*" maxLength={75} placeholder="e.g. 12 × 18 cm" /></label>}
              <label>Quantity<input type="number" min={1} max={100000} required value={draft.quantity} onChange={event => update('quantity', event.target.value)} /></label>
              <RequestSelect label="Print sides" value={draft.sides} onChange={value => update('sides', value)} options={['Single-sided', 'Double-sided']} />
              <RequestSelect label="Paper preference" value={draft.paper} onChange={value => update('paper', value)} options={papers} />
              <RequestSelect label="Envelopes" value={draft.envelopes} onChange={value => update('envelopes', value)} options={['Please quote envelopes', 'No envelopes']} />
              {design && <RequestSelect label="Design language" value={draft.language} onChange={value => update('language', value)} options={languages} />}
              <label>Need by (optional)<input type="date" value={draft.date} onChange={event => update('date', event.target.value)} /></label>
              <label className="cs-wide">{design ? 'Design brief' : 'Printing notes (optional)'}<textarea ref={notesInput} rows={4} required={design} maxLength={2000} value={draft.notes} onChange={event => { update('notes', event.target.value); event.target.setCustomValidity(''); }} placeholder={design ? 'Include the wording or event details, colours, style and any changes you want.' : 'Tell us about front/back files, folds, margins or other print requirements.'} /></label>
              <label className="cs-wide">Your name<input autoComplete="name" required pattern=".*\S.*" maxLength={100} value={draft.name} onChange={event => update('name', event.target.value)} /></label>
            </div>
            <div className="cs-file-picker">
              <label><FileUp size={19} /><span><strong>{design ? 'Choose reference files' : 'Choose original artwork'}</strong><small>PDF, JPG, PNG or WebP · Up to 20 MB each</small></span><input type="file" multiple accept={ORDER_FILE_RULES.accept} onChange={pickFiles} /></label>
              {files.length > 0 && <div className="cs-file-list"><ul>{files.map((file, index) => <li key={`${file.name}-${index}`}><Check size={14} /> {file.name}</li>)}</ul><button type="button" onClick={() => setFiles([])}>Remove selected files</button></div>}
              {fileError && <p className="cs-error" role="alert">{fileError}</p>}
              <p>Choose files now, or add them after saving. Your files upload only when you confirm.</p>
            </div>
            <button className="cs-button" type="submit">Review request <ArrowRight size={17} /></button>
          </form>}
        </section>
        {order && <OrderFilesPanel order={order} initialFiles={files} onUpdated={value => setOrder(previous => ({ ...previous, ...value }))} />}
      </div>
    </div>
  </div></div>;
}
