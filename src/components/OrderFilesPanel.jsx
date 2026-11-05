import React, { useEffect, useRef, useState } from 'react';
import { Download, FileCheck2, FileText, RefreshCw, ShieldCheck, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studioRequest } from '../utils/studioApi';
import { readPrintOriginals } from '../utils/printPhotoStorage';
import { ORDER_FILE_RULES } from '../data/orderFiles';
import './OrderWorkflow.css';

const size = bytes => `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
async function checkedFetch(url, options) {
  const response = await fetch(url, { credentials: 'same-origin', ...options });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'The file could not be transferred. Please try again.'); }
  return response;
}
async function saveDownload(response, name) {
  const url = URL.createObjectURL(await response.blob()), link = document.createElement('a');
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export default function OrderFilesPanel({ order, studio = false, onUpdated, evidenceFor = '' }) {
  const [data, setData] = useState(null), [selected, setSelected] = useState([]), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [progress, setProgress] = useState('');
  const [kind, setKind] = useState('proof'), [proofIds, setProofIds] = useState([]), [note, setNote] = useState(''), [confirmed, setConfirmed] = useState(false);
  const controller = useRef(null), input = useRef(null);
  const credentials = { reference: order.reference, token: order.trackingToken };
  const load = async () => {
    const result = studio ? await studioRequest(`/studio/orders/${order.reference}/files`) : await studioRequest('/order-files/list', { method: 'POST', body: credentials });
    setData(result); return result;
  };
  useEffect(() => { let active = true; const request = studio ? studioRequest(`/studio/orders/${order.reference}/files`) : studioRequest('/order-files/list', { method: 'POST', body: credentials }); request.then(result => { if (active) setData(result); }).catch(cause => { if (active) setError(cause.message); }); return () => { active = false; }; }, [order.reference, order.trackingToken, order.updatedAt, studio]);
  useEffect(() => () => controller.current?.abort(), []);
  const refresh = async () => { await load(); if (studio) { const result = await studioRequest(`/studio/orders/${order.reference}`); onUpdated?.(result.order); } };
  const pick = files => {
    const refs = data?.expectedOriginals || [];
    setSelected(Array.from(files).map(file => { const match = refs.filter(ref => ref.name === file.name); return { file, sourceId: match.length === 1 ? match[0].id : refs.length === 1 ? refs[0].id : '', note: '' }; })); setError(''); setMessage('');
  };
  const upload = async entries => {
    if (busy || !entries.length) return;
    setBusy(true); setError(''); setMessage(''); controller.current = new AbortController();
    try {
      for (const [index, entry] of entries.entries()) {
        if (!entry.file.size || entry.file.size > ORDER_FILE_RULES.maxFileBytes) throw new Error(`${entry.file.name}: use a file up to 20 MB.`);
        const ref = data?.expectedOriginals?.find(item => item.id === entry.sourceId);
        setProgress(`Uploading ${index + 1} of ${entries.length}: ${entry.file.name}`);
        const headers = { 'Content-Type': 'application/octet-stream', 'X-Studio-Request': '1', 'X-File-Name': encodeURIComponent(entry.file.name), 'X-File-Label': encodeURIComponent(entry.note || ref?.label || ''), 'X-File-Source': encodeURIComponent(entry.sourceId || ''), 'X-File-Kind': studio ? kind : evidenceFor ? 'evidence' : 'original' };
        if (!studio) { headers['X-Order-Reference'] = order.reference; headers['X-Order-Token'] = order.trackingToken; if (evidenceFor) headers['X-Case-Id'] = evidenceFor; }
        await checkedFetch(studio ? `/api/studio/orders/${order.reference}/files` : '/api/order-files/upload', { method: 'POST', headers, body: entry.file, signal: controller.current.signal });
      }
      setSelected([]); if (input.current) input.current.value = ''; setMessage('Files received. The studio will check them before production.');
    } catch (cause) { if (cause.name !== 'AbortError') setError(cause.message); }
    finally { setBusy(false); setProgress(''); await refresh().catch(cause => setError(cause.message)); }
  };
  const uploadSaved = async () => {
    try { const originals = await readPrintOriginals((data?.expectedOriginals || []).map(ref => ref.id)); if (!originals.length) throw new Error('No saved originals were found on this device. Choose the original files again below.'); await upload(originals.map(item => ({ file: item.file, sourceId: item.id }))); }
    catch (cause) { setError(cause.message); }
  };
  const download = async file => { setError(''); try { const response = studio ? await checkedFetch(`/api/studio/orders/${order.reference}/files/${file.id}`) : await checkedFetch('/api/order-files/proof', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Studio-Request': '1' }, body: JSON.stringify({ ...credentials, id: file.id }) }); await saveDownload(response, file.name); } catch (cause) { setError(cause.message); } };
  const publish = async () => { setBusy(true); setError(''); try { const result = await studioRequest(`/studio/orders/${order.reference}/artwork`, { method: 'POST', body: { updatedAt: order.updatedAt, fileIds: proofIds, note } }); onUpdated?.(result.order); setProofIds([]); setNote(''); setMessage('This proof version is ready for the customer’s approval.'); await load(); } catch (cause) { setError(cause.message); } finally { setBusy(false); } };
  const respond = async decision => { setBusy(true); setError(''); try { const result = await studioRequest('/artwork/respond', { method: 'POST', body: { ...credentials, version: order.artwork.version, decision, note, confirmed } }); onUpdated?.(result.order); setNote(''); setConfirmed(false); setMessage(decision === 'approve' ? 'Your approval has been recorded for this exact version.' : 'Your changes have reached the studio.'); } catch (cause) { setError(cause.message); } finally { setBusy(false); } };
  const files = (data?.files || []).filter(file => !evidenceFor || file.caseId === evidenceFor);
  const current = order.artwork?.versions?.find(version => version.version === order.artwork.version);
  const proof = files.filter(file => current?.proofIds?.includes(file.id));
  return <section className="ow-card"><div className="ow-heading"><div><span className="ow-kicker"><ShieldCheck size={13} /> PRIVATE ORDER FILES</span><h3>{evidenceFor ? 'Photos for this support request' : 'Original files & artwork'}</h3></div><button type="button" className="ow-icon" disabled={busy} aria-label="Refresh order files" onClick={() => refresh().catch(cause => setError(cause.message))}><RefreshCw size={16} /></button></div>
    {!evidenceFor && <p>Original bytes are preserved. Uploading does not automatically crop, compress, stretch or enhance your file. <Link to="/original-files">File guide</Link></p>}
    {data?.filesPurgedAt && <p className="ow-notice">Working files were removed under the retention policy. Order and approval records remain available.</p>}
    <ul className="ow-files">{files.map(file => <li key={file.id}><FileText size={17} /><div><strong>{file.name}</strong><small>{file.label || file.kind} · {size(file.bytes)}{file.purgedAt ? ' · Working file removed' : ''}</small></div>{!file.purgedAt && (studio || file.kind === 'proof') && <button type="button" className="ow-icon" aria-label={`Download ${file.name}`} onClick={() => download(file)}><Download size={17} /></button>}{studio && file.kind === 'proof' && !file.purgedAt && <label className="ow-check"><input type="checkbox" aria-label={`Include ${file.name} in proof version`} checked={proofIds.includes(file.id)} onChange={event => setProofIds(ids => event.target.checked ? [...ids, file.id] : ids.filter(id => id !== file.id))} /><span>Proof</span></label>}</li>)}</ul>
    {(order.status !== 'cancelled' || evidenceFor) && <div className="ow-upload">
      {studio && <label className="ow-field">File purpose<select value={kind} onChange={event => setKind(event.target.value)}><option value="proof">Artwork proof for customer approval</option><option value="original">Original received from customer</option></select></label>}
      {!studio && !evidenceFor && (data?.expectedOriginals?.length > 0) && <button type="button" className="ow-secondary" disabled={busy} onClick={uploadSaved}><Upload size={15} /> Upload saved originals from this device</button>}
      <label className="ow-file-picker"><Upload size={19} /><span>Choose {studio && kind === 'proof' ? 'artwork proofs' : evidenceFor ? 'evidence photos' : 'original files'}<small>JPG, PNG, WebP or PDF · 20 MB each · 50 files / 250 MB per order</small></span><input ref={input} type="file" multiple accept={ORDER_FILE_RULES.accept} disabled={busy} onChange={event => pick(event.target.files)} /></label>
      {selected.map((entry, index) => <div className="ow-selected" key={`${entry.file.name}-${index}`}><strong>{entry.file.name}</strong>{data?.expectedOriginals?.length > 0 && !evidenceFor && <label className="ow-field">Match to<select value={entry.sourceId} onChange={event => setSelected(previous => previous.map((item, i) => i === index ? { ...item, sourceId: event.target.value } : item))}><option value="">Other file / describe below</option>{data.expectedOriginals.map(ref => <option value={ref.id} key={ref.id}>{ref.label}</option>)}</select></label>}<label className="ow-field">File note<input maxLength={240} placeholder="e.g. Item 1, front design / frame 3" value={entry.note} onChange={event => setSelected(previous => previous.map((item, i) => i === index ? { ...item, note: event.target.value } : item))} /></label></div>)}
      {selected.length > 0 && <button type="button" className="ow-primary" disabled={busy} onClick={() => upload(selected)}><Upload size={15} /> Upload {selected.length} selected {selected.length === 1 ? 'file' : 'files'}</button>}
      <p className="ow-quiet">Only share artwork you have permission to reproduce. The studio can access files for this order. <Link to="/privacy">Privacy & retention</Link></p>
    </div>}
    {studio && proofIds.length > 0 && <div className="ow-proof"><label className="ow-field">Note for this proof version<textarea rows={2} maxLength={2000} value={note} onChange={event => setNote(event.target.value)} /></label><button type="button" disabled={busy} className="ow-primary" onClick={publish}><FileCheck2 size={16} /> Publish version {(order.artwork?.version || 0) + 1} for approval</button></div>}
    {!studio && !evidenceFor && current?.kind === 'studio' && <div className="ow-proof"><h4>Artwork version {current.version}</h4><p>{current.note || 'Download and check every proof file for this version.'}</p>{proof.map(file => !file.purgedAt && <button type="button" className="ow-secondary" key={file.id} onClick={() => download(file)}><Download size={15} /> {file.name}</button>)}<p><strong>Status: {order.artwork.status.replaceAll('_', ' ')}</strong></p>{!['printing','ready','dispatched','delivered','cancelled'].includes(order.status) && <><label className="ow-check"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span>I checked this version’s photos, spelling, size, crop and layout.</span></label><label className="ow-field">Comments or changes<textarea rows={2} maxLength={2000} value={note} onChange={event => setNote(event.target.value)} /></label><div className="ow-actions"><button type="button" className="ow-primary" disabled={busy || !confirmed} onClick={() => respond('approve')}>Approve version {current.version}</button><button type="button" className="ow-secondary" disabled={busy || !note.trim()} onClick={() => respond('changes')}>Request changes</button></div></>}</div>}
    {busy && <p role="status" className="ow-notice">{progress || 'Saving your update…'}</p>}{error && <p className="ow-error" role="alert">{error}</p>}{message && <p className="ow-success" role="status">{message}</p>}
  </section>;
}
