import { createHash, randomUUID } from 'node:crypto';
import { ApiError, cleanText } from './pricing.mjs';
import { originalReferences } from '../src/data/orderFiles.js';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function initialArtwork(order) {
  const artwork = order.artwork || { required: false, status: 'not_required', version: 0, versions: [] };
  if (artwork.version === 1 && !artwork.versions.length) artwork.versions.push({ version: 1, kind: 'builder', createdAt: new Date().toISOString(), specification: order.items.map(item => ({ title: item.title, size: item.size, quantity: item.quantity, orientation: item.orientation, frameId: item.frameId, configuration: stripPreviews(item.configuration), fit: item.fit, panX: item.panX, panY: item.panY, filter: item.filter })), originalReferences: originalReferences(order.items), previewHash: hash(order.items), proofIds: [], decisions: [{ decision: 'approved', at: artwork.approvedAt, note: 'Customer confirmed the builder previews and order details at checkout.' }] });
  return artwork;
}
function stripPreviews(value) {
  if (typeof value === 'string' && /^(data:image|blob:)/.test(value)) return '';
  if (Array.isArray(value)) return value.map(stripPreviews);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stripPreviews(item)]));
  return value;
}
export function publishProof(order, files, data) {
  if (['printing', 'ready', 'dispatched', 'delivered', 'cancelled'].includes(order.status)) throw new ApiError(409, 'Resolve the production stage before publishing a revised proof.');
  const ids = [...new Set(data.fileIds || [])];
  if (!ids.length || ids.length > 10 || ids.some(id => !files.some(file => file.id === id && file.kind === 'proof' && !file.purgedAt))) throw new ApiError(400, 'Choose the uploaded proof files for this version.');
  const artwork = initialArtwork(order), version = artwork.version + 1, at = new Date().toISOString();
  artwork.versions.push({ version, kind: 'studio', proofIds: ids, createdAt: at, note: cleanText(data.note, 2000), originalFileIds: files.filter(file => file.kind === 'original' && !file.purgedAt).map(file => file.id), decisions: [] });
  artwork.required = true; artwork.version = version; artwork.status = 'proof_ready'; artwork.approvedAt = null;
  order.artwork = artwork; order.filesReviewed = false;
  order.history.push({ title: `Artwork version ${version} ready for review`, note: artwork.versions.at(-1).note, at });
}
export function respondToProof(order, data) {
  const artwork = initialArtwork(order), current = artwork.versions.find(item => item.version === artwork.version);
  if (!current || current.kind !== 'studio' || data.version !== artwork.version || ['printing', 'ready', 'dispatched', 'delivered', 'cancelled'].includes(order.status)) throw new ApiError(409, 'This proof changed or production has started. Refresh the order and contact the studio.');
  if (!['approve', 'changes'].includes(data.decision)) throw new ApiError(400, 'Choose approval or request changes.');
  if (data.decision === 'approve' && data.confirmed !== true) throw new ApiError(400, 'Confirm that you checked this exact artwork version.');
  const note = cleanText(data.note, 2000), at = new Date().toISOString();
  if (data.decision === 'changes' && !note) throw new ApiError(400, 'Describe the changes you need.');
  artwork.status = data.decision === 'approve' ? 'approved' : 'changes_requested'; artwork.approvedAt = data.decision === 'approve' ? at : null;
  current.decisions.push({ decision: artwork.status, note, at }); order.artwork = artwork;
  order.history.push({ title: data.decision === 'approve' ? `Customer approved artwork version ${artwork.version}` : `Customer requested changes to version ${artwork.version}`, note, at });
}
export function createSupportRequest(order, data) {
  const type = cleanText(data.type, 30), note = cleanText(data.note, 3000);
  if (!['cancel', 'damaged', 'wrong_item', 'print_quality', 'refund', 'delete_files', 'other'].includes(type) || note.length < 8) throw new ApiError(400, 'Choose a request type and describe the issue.');
  order.requests ||= [];
  if (order.requests.filter(item => !['resolved', 'declined'].includes(item.status)).length >= 5) throw new ApiError(409, 'An open request is already with the studio. Add details to that conversation.');
  const at = new Date().toISOString();
  const request = { id: randomUUID(), type, note, status: 'open', createdAt: at, updatedAt: at, events: [{ status: 'open', note: 'Request received by the studio.', at }] };
  order.requests.push(request); order.history.push({ title: 'Customer support request received', note: `Request: ${type.replaceAll('_', ' ')}`, at });
  return request;
}
export function updateSupportRequest(order, data) {
  const request = order.requests?.find(item => item.id === data.id);
  if (!request) throw new ApiError(404, 'Support request not found.');
  if (!['acknowledged', 'under_review', 'approved', 'declined', 'refund_initiated', 'resolved'].includes(data.status)) throw new ApiError(400, 'Choose a valid request status.');
  const note = cleanText(data.note, 3000), at = new Date().toISOString();
  if (!note) throw new ApiError(400, 'Add a customer-visible explanation.');
  if (request.type === 'delete_files' && data.status === 'resolved' && !order.filesPurgedAt) throw new ApiError(409, 'Complete the approved file deletion before resolving this request.');
  if (data.status === 'refund_initiated' && (!request.approvedAt || !cleanText(data.refundReference, 150))) throw new ApiError(400, 'Approve the request first and enter the payment-provider refund reference.');
  if (data.status === 'approved') {
    const amount = Number(data.refundAmount || 0);
    if (!Number.isFinite(amount) || amount < 0 || amount > (order.grandTotal || 0)) throw new ApiError(400, 'Check the approved refund amount.');
    if (request.type === 'cancel' && !order.history.some(event => event.status === 'printing') && order.payment.isPaid && amount !== order.grandTotal) throw new ApiError(400, 'Before production starts, a paid cancellation requires a full refund.');
    request.refundAmount = amount; request.approvedAt = at;
    if (request.type === 'cancel') { order.status='cancelled'; order.statusLabel='Cancelled'; order.history.push({status:'cancelled',title:'Cancellation request approved',note,at}); }
  }
  if (data.status === 'refund_initiated') { request.refundReference = cleanText(data.refundReference, 150); request.refundInitiatedAt = at; }
  request.status = data.status; request.updatedAt = at; request.events.push({ status: data.status, note, at });
  order.history.push({ title: `Support request ${data.status.replaceAll('_', ' ')}`, note, at });
}
