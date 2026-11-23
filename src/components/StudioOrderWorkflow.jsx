import React, { useState } from 'react';
import { Check, FileCheck2, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { studioRequest, trackingUrl } from '../utils/studioApi';
import { isLucknowPincode } from '../utils/shippingCalculator';
import OrderFilesPanel from './OrderFilesPanel';
import './OrderWorkflow.css';

const money = value => value === null || value === undefined || value === ''
  ? '₹0'
  : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const COURIER_PRESETS = [
  ['Lucknow Print · ₹59', '59'],
  ['Pan-India Print · ₹69', '69'],
  ['Lucknow A4 Frame · ₹79', '79'],
  ['Lucknow A3/12×18 · ₹99', '99'],
  ['Pan-India A4 · ₹99', '99'],
  ['Pan-India A3/12×18 · ₹159', '159'],
  ['Pan-India 15×21+ · ₹249', '249'],
  ['Free Delivery · ₹0', '0'],
];

function customerWaUrl(phone, text) {
  const digits = String(phone || '').replace(/\D/g, '');
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(text)}` : '';
}

export function QuoteEditor({ order, onUpdated }) {
  const [form, setForm] = useState({
    deliveryMethod: order.delivery?.method === 'pickup' ? 'pickup' : 'courier',
    itemsSubtotal: order.subtotal ?? '',
    courierFee: order.deliveryQuote?.courierFee ?? '',
    packagingFee: order.deliveryQuote?.packagingFee ?? '0',
    bulkDiscount: order.discountCode ? '0' : order.discountAmount || '0',
    note: order.deliveryQuote?.note || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedOrder, setSavedOrder] = useState(null);
  const locked = order.payment.isPaid || order.payment.method === 'razorpay' || order.payment.method === 'sandbox';
  const catalogue = order.items.every(
    item => item.price !== null && !(item.type === 'studio_order' || item.type === 'enquiry' || (item.type === 'pvc_card' && !item.configuration?.productId)),
  );
  const pickup = form.deliveryMethod === 'pickup';
  const lucknow = isLucknowPincode(order.customer?.pincode);

  const subtotalNum = Math.max(0, Number(form.itemsSubtotal) || 0);
  const discountNum = order.discountCode ? Number(order.discountAmount || 0) : Math.max(0, Number(form.bulkDiscount) || 0);
  const courierNum = pickup ? 0 : Math.max(0, Number(form.courierFee) || 0);
  const packagingNum = pickup ? 0 : Math.max(0, Number(form.packagingFee) || 0);
  const estimatedPayable = Math.max(0, subtotalNum - discountNum + courierNum + packagingNum);

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSavedOrder(null);
    try {
      const result = await studioRequest(`/studio/orders/${order.reference}/pricing`, {
        method: 'POST',
        body: {
          ...form,
          courierFee: pickup ? 0 : form.courierFee,
          packagingFee: pickup ? 0 : form.packagingFee,
          updatedAt: order.updatedAt,
        },
      });
      setSavedOrder(result.order);
      onUpdated(result.order);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  const applyPreset = fee => setForm(current => ({ ...current, courierFee: fee, packagingFee: '0' }));
  const field = (key, label, disabled = false) => (
    <label className="ow-field">
      {label}
      <input
        type="number"
        required
        min={0}
        step="0.01"
        disabled={disabled || locked}
        value={form[key]}
        onChange={event => {
          setSavedOrder(null);
          setForm({ ...form, [key]: event.target.value });
        }}
      />
    </label>
  );

  const waQuoteOrder = savedOrder || (order.pricingConfirmed ? order : null);
  const waHref = waQuoteOrder && typeof window !== 'undefined'
    ? customerWaUrl(
        waQuoteOrder.customer?.phone,
        [
          `Hello ${waQuoteOrder.customer?.name || ''},`,
          `Your quote for BISEN Studio order ${waQuoteOrder.orderId} is confirmed:`,
          `• Items subtotal: ${money(waQuoteOrder.subtotal)}`,
          ...(waQuoteOrder.discountAmount > 0 ? [`• Discount: −${money(waQuoteOrder.discountAmount)}`] : []),
          `• ${waQuoteOrder.delivery?.method === 'pickup' ? 'Studio pickup' : 'Delivery'}: ${waQuoteOrder.shippingFee === 0 ? 'Free (₹0)' : money(waQuoteOrder.shippingFee)}`,
          `• Final payable amount: ${money(waQuoteOrder.grandTotal)}`,
          '',
          `Track / pay securely here: ${trackingUrl(waQuoteOrder)}`,
        ].join('\n'),
      )
    : '';

  return <section className="ow-card">
    <span className="ow-kicker"><Truck size={13} /> BEFORE CUSTOMER PAYMENT</span>
    <h3>Item &amp; delivery quote</h3>
    <p>
      {pickup
        ? 'Free pickup from BISEN Studio (Milan Tower, Kursi Road, Lucknow).'
        : order.customer?.pincode
          ? `${lucknow ? `Lucknow PIN (${order.customer.pincode}) — Porter local eligible.` : `Outstation PIN (${order.customer.pincode}) — Pan-India surface/air courier.`}`
          : 'Choose Lucknow Pickup (Free) or Courier / Porter rates below.'}
    </p>
    <form onSubmit={submit}>
      <div className="ow-method-toggle" role="group" aria-label="Fulfillment method">
        <button
          type="button"
          disabled={locked}
          aria-pressed={!pickup}
          onClick={() => { setSavedOrder(null); setForm(current => ({ ...current, deliveryMethod: 'courier' })); }}
        >
          Porter (Lucknow) / Pan-India Courier
        </button>
        <button
          type="button"
          disabled={locked}
          aria-pressed={pickup}
          onClick={() => { setSavedOrder(null); setForm(current => ({ ...current, deliveryMethod: 'pickup' })); }}
        >
          Lucknow Studio Pickup · Free
        </button>
      </div>

      {!pickup && !locked && (
        <div className="ow-presets">
          <span className="ow-presets-label">BISEN Quick Rates:</span>
          <div className="ow-preset-list">
            {COURIER_PRESETS.map(([label, amount]) => (
              <button
                key={label}
                type="button"
                className="ow-preset-btn"
                data-active={String(form.courierFee) === amount && String(form.packagingFee || '0') === '0'}
                onClick={() => applyPreset(amount)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ow-grid">
        {field('itemsSubtotal', 'Items subtotal (₹)', catalogue)}
        {!pickup && <>
          {field('courierFee', 'Courier / Porter charge (₹)')}
          {field('packagingFee', 'Extra packaging charge (₹)')}
        </>}
        {!order.discountCode && field('bulkDiscount', 'Approved bulk / studio discount (₹)')}
      </div>

      {order.discountCode && <p>Reserved coupon {order.discountCode}: ₹{order.discountAmount} off items. Delivery is excluded.</p>}

      <div className="ow-quote-preview" aria-live="polite">
        <div><span>Items subtotal</span><strong>{money(subtotalNum)}</strong></div>
        {discountNum > 0 && <div><span>Discount</span><strong>−{money(discountNum)}</strong></div>}
        <div><span>{pickup ? 'Studio pickup' : 'Delivery + packaging'}</span><strong>{pickup || courierNum + packagingNum === 0 ? 'Free (₹0)' : money(courierNum + packagingNum)}</strong></div>
        <div className="ow-quote-total"><span>Final customer payable</span><strong>{subtotalNum > 0 ? money(estimatedPayable) : 'Enter items subtotal'}</strong></div>
      </div>

      <label className="ow-field">Customer-visible quote note<textarea rows={2} maxLength={1000} value={form.note} placeholder="e.g. Packed in 5-ply box via Delhivery, or ready for pickup at Kursi Road" onChange={event => { setSavedOrder(null); setForm({ ...form, note: event.target.value }); }} /></label>
      {error && <p className="ow-error" role="alert">{error}</p>}
      <div className="ow-actions">
        <button className="ow-primary" disabled={busy || locked}>{busy ? 'Saving quote…' : 'Confirm complete amount before payment'}<Check size={15} /></button>
        {waHref && (
          <a className="ow-secondary ow-whatsapp-btn" href={waHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={15} /> Send quote on WhatsApp
          </a>
        )}
      </div>
      {savedOrder && <p className="ow-success" role="status"><Check size={15} /> Quote confirmed at {money(savedOrder.grandTotal)}. Customer can now pay online or view this exact amount on tracking.</p>}
      {locked && <p className="ow-quiet">Payment has started or been recorded, so this amount is locked.</p>}
    </form>
  </section>;
}

function RequestEditor({ order, request, onUpdated }) {
  const [form, setForm] = useState({ status: 'acknowledged', note: '', refundAmount: request.refundAmount ?? (order.payment.isPaid ? order.grandTotal : 0), refundReference: '', remedy: ['refund','cancel'].includes(request.type) ? 'refund' : request.type === 'delete_files' ? 'deletion' : 'replacement' }), [busy, setBusy] = useState(false), [error, setError] = useState(''), [password, setPassword] = useState(''), [confirmReference, setConfirmReference] = useState('');
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const submit = async event => { event.preventDefault(); setBusy(true); setError(''); try { const result = await studioRequest(`/studio/orders/${order.reference}/support`, { method: 'POST', body: { ...form, id: request.id, updatedAt: order.updatedAt } }); onUpdated(result.order); setForm(previous => ({ ...previous, note: '', refundReference: '' })); } catch (cause) { setError(cause.message); } finally { setBusy(false); } };
  const remove = async () => { setBusy(true); setError(''); try { const result = await studioRequest(`/studio/orders/${order.reference}/delete-files`, { method: 'POST', body: { updatedAt: order.updatedAt, requestId: request.id, confirmReference, password } }); setPassword(''); onUpdated(result.order); } catch (cause) { setError(cause.message); } finally { setBusy(false); } };
  return <article className="ow-request"><div className="ow-heading"><strong>{request.type.replaceAll('_',' ')} · {request.id.slice(0,8).toUpperCase()}</strong><span className="ow-badge">{request.status.replaceAll('_',' ')}</span></div><p>{request.note}</p><small>{new Date(request.createdAt).toLocaleString('en-IN')}</small><ol className="ow-events">{request.events.map((event,index) => <li key={index}><strong>{event.status.replaceAll('_',' ')}</strong><p>{event.note}</p></li>)}</ol>
    <form onSubmit={submit}><label className="ow-field">Customer-visible request status<select value={form.status} onChange={event => update('status', event.target.value)}>{[['acknowledged','Acknowledged'],['under_review','Under review'],['approved','Remedy / refund approved'],['declined','Declined with explanation'],['refund_initiated','Refund initiation reported'],['resolved','Resolved']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>{form.status === 'approved' && <><label className="ow-field">Agreed remedy<select value={form.remedy} onChange={event => update('remedy', event.target.value)}><option value="replacement">Free replacement</option><option value="reprint">Free reprint</option><option value="refund">Refund</option><option value="deletion">Remove working files</option><option value="other">Other agreed solution</option></select></label>{form.remedy === 'refund' && <label className="ow-field">Approved refund amount (₹)<input type="number" min={0} max={order.grandTotal || 0} step="0.01" value={form.refundAmount} onChange={event => update('refundAmount', event.target.value)} /></label>}</>}{form.status === 'refund_initiated' && <label className="ow-field">Actual payment-provider refund reference<input required maxLength={150} value={form.refundReference} onChange={event => update('refundReference', event.target.value)} /></label>}<label className="ow-field">Explanation / next steps<textarea required rows={3} maxLength={3000} value={form.note} onChange={event => update('note', event.target.value)} /></label><button className="ow-primary" disabled={busy}>{busy ? 'Saving…' : 'Save support update'}<Check size={15} /></button><p className="ow-quiet">Refunds are initiated in the payment provider. Recording a request status does not transfer money. A paid cancellation before production requires a full refund.</p></form>
    {request.type === 'delete_files' && request.status === 'approved' && <div className="ow-proof"><p>Remove this order’s working files and embedded image previews. Approved order/payment records stay in the database; existing backups expire under the retention policy.</p><label className="ow-field">Type {order.reference} to confirm<input value={confirmReference} onChange={event => setConfirmReference(event.target.value)} /></label><label className="ow-field">Studio password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label><button className="ow-secondary" type="button" disabled={busy || order.legalHold || confirmReference !== order.reference || !password} onClick={remove}>Delete working files for this approved request</button>{order.legalHold && <p className="ow-error">This order is on a retention hold. Review the hold first.</p>}</div>}{error && <p className="ow-error" role="alert">{error}</p>}</article>;
}

export function StudioArtwork({ order, onUpdated }) {
  return <><OrderFilesPanel studio order={order} onUpdated={onUpdated} /><section className="ow-card"><span className="ow-kicker"><FileCheck2 size={13} /> APPROVAL RECORD</span><h3>Artwork &amp; requests</h3><p>Current artwork: <strong>{order.artwork?.status?.replaceAll('_',' ') || 'Legacy order: confirm with customer'}</strong>{order.artwork?.version > 0 ? ` · Version ${order.artwork.version}` : ''}</p>{order.artwork?.versions?.length > 0 && <ul className="ow-version-list">{[...order.artwork.versions].reverse().map(version => <li key={version.version}><div><strong>Version {version.version}</strong> · <span>{version.kind === 'studio' ? 'Studio proof published' : 'Customer response'}</span>{version.proofIds?.length ? ` · ${version.proofIds.length} ${version.proofIds.length === 1 ? 'file' : 'files'}` : ''}{version.note && <p>{version.note}</p>}</div>{version.at && <time dateTime={version.at}>{new Date(version.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time>}</li>)}</ul>}{order.requests?.length ? order.requests.map(request => <RequestEditor key={request.id} order={order} request={request} onUpdated={onUpdated} />) : <p>No customer support requests yet.</p>}<p className="ow-quiet"><ShieldCheck size={12} /> Original files must match the approved artwork before production.</p></section></>;
}
