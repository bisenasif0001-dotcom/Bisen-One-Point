import StudioBusinessSettings from '../components/StudioBusinessSettings';
import StudioPriceManager from '../components/StudioPriceManager';
import { QuoteEditor, StudioArtwork } from '../components/StudioOrderWorkflow';
import OrderItemPreview from '../components/OrderItemPreview';
import { useBusinessRules } from '../components/BusinessRulesProvider';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, Clock3, Copy,
  CreditCard, ExternalLink, FolderOpen, Link2, LockKeyhole, LogOut, MapPin, MessageCircle,
  Package, Phone, Plus, Printer, RefreshCw, Search, Settings2, ShieldCheck, SlidersHorizontal, Tag, Truck, UserRound, X,
} from 'lucide-react';
import { studioRequest, trackingPath, trackingUrl } from '../utils/studioApi';
import { birthdayOrderDetails } from '../utils/birthdayCards';
import { galleryOrderDetails } from '../utils/galleryWalls';
import { originalReferences } from '../data/orderFiles';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import { isLucknowPincode } from '../utils/shippingCalculator';
import './StudioPanelPage.css';
import './StudioOrderEditor.css';

const STUDIO_STATUSES = [
  ['received', 'Order received'],
  ['confirmed', 'Order confirmed'],
  ['design_approved', 'Design approved'],
  ['printing', 'Printing & making'],
  ['ready', 'Ready for collection / dispatch'],
  ['dispatched', 'Dispatched'],
  ['delivered', 'Delivered / collected'],
  ['cancelled', 'Cancelled'],
];

const STATUS_NOTE_PRESETS = [
  ['Quote confirmed', 'We have confirmed the final quote and delivery details. You can complete payment on your tracking link to begin production.'],
  ['Proof uploaded', 'Your design proof has been uploaded under Artwork & files. Please review and approve it so we can start printing.'],
  ['Printing started', 'Your artwork is approved and printing & finishing has started at BISEN Studio.'],
  ['Ready for pickup', 'Your order is ready for collection at BISEN Studio, Milan Tower, Kursi Road, Lucknow.'],
  ['Dispatched', 'Your order has been packed safely and handed over for delivery.'],
];

const COURIER_CHIPS = ['Porter (Lucknow)', 'Delhivery', 'DTDC', 'Blue Dart', 'India Post'];

const money = value => (value === null || value === undefined ? 'Quote pending' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
const date = value => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const safeTrackingUrl = order => (typeof window === 'undefined' ? trackingPath(order) : trackingUrl(order));

const hasItemPreview = item => Boolean(
  item.image ||
  item.photoUrl ||
  item.type === 'pvc_card' ||
  (item.type === 'gallery_wall' && item.configuration?.slots) ||
  (item.type === 'birthday_card' && item.configuration) ||
  (item.type === 'photo_prints' && item.configuration && item.photos?.length),
);

function buildCustomerWhatsAppUrl(order) {
  const digits = String(order.customer?.phone || '').replace(/\D/g, '');
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  if (!normalized) return '';
  const url = safeTrackingUrl(order);
  const parts = [`Hello ${order.customer?.name || ''}, update from BISEN Studio for order ${order.orderId} (${order.statusLabel}):`];
  if (!order.pricingConfirmed) {
    parts.push('Your request is with our studio. We will share your confirmed quote shortly.');
  } else {
    parts.push(`Order amount: ${money(order.grandTotal)} (${order.payment?.isPaid ? 'Paid' : 'Awaiting payment'}).`);
  }
  if (order.artwork?.required && order.artwork?.status === 'awaiting_approval') {
    parts.push('Your design proof is uploaded — please open the link below to review & approve.');
  }
  if (order.status === 'dispatched' && (order.delivery?.courier || order.delivery?.awb)) {
    parts.push(`Courier: ${[order.delivery.courier, order.delivery.awb && `AWB ${order.delivery.awb}`].filter(Boolean).join(' · ')}.`);
  }
  parts.push('', `Track & manage your order: ${url}`);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(parts.join('\n'))}`;
}

function pvcOrderDetails(item) {
  const cfg = item.configuration || {};
  return [
    `Cards: ${item.cardCount || cfg.cardCount || item.quantity} per set × ${item.quantity} set(s)${item.unitPrice ? ` · ₹${item.unitPrice}/card` : ''}${item.discountPercent ? ` (${item.discountPercent}% bulk off)` : ''}`,
    cfg.sides && `Printing: ${cfg.sides === 'double' ? 'Both sides' : 'Single side'} · ${cfg.orientation === 'portrait' ? 'Vertical (54 × 86 mm)' : 'Horizontal (86 × 54 mm)'}`,
    cfg.design && `Design: ${cfg.design === 'design' ? `Studio design (+₹${item.designFee || 149})` : 'Customer upload'}${cfg.frontFileName ? ` · Front: ${cfg.frontFileName}` : ''}${cfg.backFileName ? ` · Back: ${cfg.backFileName}` : ''}`,
    cfg.organisation && `Organisation: ${cfg.organisation}`,
    item.specialInstructions,
  ].filter(Boolean).join('\n');
}

function ErrorBox({ error }) { return error ? <p className="sp-error" role="alert">{error}</p> : null; }
function Field({ label, id, children, optional = false }) {
  return <label className="sp-field" htmlFor={id}><span>{label}{optional && <small>Optional</small>}</span>{children}</label>;
}

function StudioBrand({ to }) {
  const logo = <img className="sp-brand-logo" src="/logo.png" alt="BISEN Frame & Photo Print" width={395} height={129} />;
  return to ? <Link className="sp-brand" to={to}>{logo}</Link> : <div className="sp-brand">{logo}</div>;
}

export function StudioAccess({ session, onAuthenticated }) {
  const [form, setForm] = useState({ username: '', password: '', confirm: '', setupToken: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const setup = session.setupRequired;
  const update = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError(''); };
  const submit = async event => {
    event.preventDefault();
    setError('');
    if (setup && form.password !== form.confirm) { setError('The two passwords must match.'); return; }
    setBusy(true);
    try {
      await studioRequest(`/studio/${setup ? 'setup' : 'login'}`, { method: 'POST', body: form });
      setForm({ username: '', password: '', confirm: '', setupToken: '' });
      onAuthenticated();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };
  return <div className="sp-access"><StudioBrand to="/" /><div className="sp-access-card"><span className="sp-icon-circle"><LockKeyhole size={25} strokeWidth={1.4} /></span><span className="sp-kicker">PRIVATE STUDIO ACCESS</span><h1>{setup ? 'Make this desk yours.' : 'Welcome to your studio.'}</h1><p>{setup ? 'Create your own login to manage orders, update customer tracking and connect Razorpay.' : 'Sign in to manage your orders and keep your customers up to date.'}</p><form onSubmit={submit}><Field id="sp-username" label="Studio username"><input id="sp-username" required autoComplete="username" minLength={3} maxLength={100} value={form.username} onChange={event => update('username', event.target.value)} /></Field><Field id="sp-password" label="Password"><input id="sp-password" type="password" required minLength={setup ? 12 : 1} maxLength={200} autoComplete={setup ? 'new-password' : 'current-password'} value={form.password} onChange={event => update('password', event.target.value)} />{setup && <small>Use at least 12 characters. Keep this login private.</small>}</Field>{setup && <><Field id="sp-confirm" label="Confirm password"><input id="sp-confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={event => update('confirm', event.target.value)} /></Field>{!session.localSetup && <Field id="sp-setup-token" label="Deployment setup code"><input id="sp-setup-token" type="password" autoComplete="off" required value={form.setupToken} onChange={event => update('setupToken', event.target.value)} /><small>Use the one-time setup code from your hosting environment.</small></Field>}</>}<ErrorBox error={error} /><button className="sp-primary" disabled={busy}>{busy ? 'Please wait…' : setup ? 'Create studio access' : 'Sign in'}<ArrowRight size={16} /></button></form></div><Link className="sp-back" to="/"><ArrowLeft size={14} /> Back to the website</Link></div>;
}

export function PaymentSettings({ onSaved }) {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ mode: 'test', keyId: '', keySecret: '', webhookSecret: '', enabled: false, password: '', goLiveConfirmed: false });
  useEffect(() => {
    const controller = new AbortController();
    studioRequest('/studio/settings', { signal: controller.signal })
      .then(value => { setSettings(value); setForm(current => ({ ...current, mode: value.mode, enabled: value.enabled, goLiveConfirmed: value.goLiveConfirmed })); })
      .catch(cause => { if (cause.name !== 'AbortError') setError(cause.message); });
    return () => controller.abort();
  }, []);
  const update = (key, value) => { setForm(current => ({ ...current, [key]: value })); setSaved(false); setError(''); };
  const selectMode = mode => {
    setForm(current => ({
      ...current,
      mode,
      enabled: mode === 'sandbox' && !settings?.enabled ? true : current.enabled,
    }));
    setSaved(false);
    setError('');
  };
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await studioRequest('/studio/settings', { method: 'PUT', body: form });
      setSettings(result);
      setForm(current => ({ ...current, keyId: '', keySecret: '', webhookSecret: '', password: '' }));
      setSaved(true);
      onSaved?.(result);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };
  const modeOptions = settings?.sandboxAllowed
    ? [['sandbox', 'Local test (no keys)'], ['test', 'Razorpay Test'], ['live', 'Razorpay Live']]
    : [['test', 'Test mode'], ['live', 'Live mode']];
  const badgeText = settings?.enabled
    ? (settings.mode === 'sandbox' ? 'Local test checkout enabled' : `${settings.mode === 'test' ? 'Test' : 'Live'} checkout enabled`)
    : 'Online payment off';
  const modeNote = form.mode === 'sandbox'
    ? 'Simulate UPI, Card & Netbanking payments locally without Razorpay API keys. Always marks orders as test payment verified — blocked automatically in production.'
    : form.mode === 'test'
      ? 'Use Test Mode keys first. Verified test payments stay clearly labelled and do not count as money received.'
      : 'Use the Live Mode keys belonging to your approved Razorpay account.';
  return <section className="sp-settings"><div className="sp-section-heading"><div><span className="sp-kicker">PAYMENTS, CONNECTED PROPERLY</span><h2>Connect your Razorpay account.</h2><p>Customers pay in Razorpay’s secure checkout. Payment is recorded after server verification.</p></div><span className={`sp-badge ${settings?.enabled ? 'is-paid' : ''}`}>{badgeText}</span></div><div className="sp-settings-grid"><form className="sp-card" onSubmit={submit}><div className="sp-mode" role="group" aria-label="Payment gateway mode">{modeOptions.map(([mode, label]) => <button type="button" key={mode} aria-pressed={form.mode === mode} onClick={() => selectMode(mode)}>{label}</button>)}</div><p className="sp-note">{modeNote}</p>{form.mode === 'sandbox' ? (settings?.mode === 'sandbox' && settings?.enabled && <p className="sp-saved-setting"><ShieldCheck size={15} /> Local test payment simulator is active on localhost. Switch to Razorpay Test or Live whenever you have API keys.</p>) : <>{settings?.configured && settings?.mode !== 'sandbox' && <p className="sp-saved-setting"><ShieldCheck size={15} /> Saved Key ID: {settings.keyId}. Leave secret fields blank to keep the current values.</p>}<Field id="sp-key-id" label="Razorpay Key ID"><input id="sp-key-id" autoComplete="off" placeholder={`rzp_${form.mode}_…`} value={form.keyId} onChange={event => update('keyId', event.target.value)} /></Field><Field id="sp-key-secret" label="Razorpay Key Secret"><input id="sp-key-secret" type="password" autoComplete="new-password" value={form.keySecret} onChange={event => update('keySecret', event.target.value)} placeholder={settings?.hasSecret ? 'Saved securely · Enter only to replace' : ''} /></Field><Field id="sp-webhook-secret" label="Webhook secret"><input id="sp-webhook-secret" type="password" autoComplete="new-password" value={form.webhookSecret} onChange={event => update('webhookSecret', event.target.value)} placeholder={settings?.hasWebhookSecret ? 'Saved securely · Enter only to replace' : 'Choose a separate secret of at least 16 characters'} /></Field></>}<label className="sp-check"><input type="checkbox" checked={form.enabled} onChange={event => update('enabled', event.target.checked)} /><span>Enable online payment at checkout</span></label>{form.mode === 'live' && <><label className="sp-check"><input type="checkbox" checked={form.goLiveConfirmed} onChange={event => update('goLiveConfirmed', event.target.checked)} /><span>I have tested checkout, signature verification and webhook updates before enabling live payments.</span></label>{settings && !settings.liveAllowed && <p className="sp-notice">Live payments can be enabled after the website has its public HTTPS domain. Test checkout can be connected locally now.</p>}</>}<Field id="sp-settings-password" label="Confirm studio password"><input id="sp-settings-password" required type="password" autoComplete="current-password" value={form.password} onChange={event => update('password', event.target.value)} /></Field><ErrorBox error={error} />{saved && <p className="sp-success" role="status"><Check size={16} /> Payment settings saved.</p>}<button className="sp-primary" disabled={busy}>{busy ? 'Saving…' : 'Save payment settings'}<ShieldCheck size={16} /></button></form><aside className="sp-card sp-payment-guide"><CreditCard size={31} strokeWidth={1.2} /><h3>A clear payment trail.</h3><ol><li><strong>Create the order</strong><p>The server checks catalogue prices and creates the Razorpay payment order.</p></li><li><strong>Customer completes payment</strong><p>UPI, cards and other available methods appear in Razorpay checkout.</p></li><li><strong>Verify before marking paid</strong><p>The server checks the signature, order amount and captured payment status.</p></li></ol><div className="sp-webhook"><strong>Webhook URL</strong><code>{settings?.webhookUrl || 'Loading…'}</code><p>In Razorpay Dashboard, add this URL with the same webhook secret. Subscribe to payment.captured, payment.failed, payment.refunded and refund.processed.</p></div><p className="sp-note">A public URL is required for webhook delivery. Website credentials and payment secrets stay on the server; customers only receive the public checkout key.</p><a className="sp-text-link" href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer">Open Razorpay Dashboard <ExternalLink size={14} /></a></aside></div></section>;
}

function NewStudioOrder({ onCreated, onCancel }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', title: '', quantity: '1', grandTotal: '', notes: '', requireArtwork: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await studioRequest('/studio/orders', { method: 'POST', body: { ...form, customer: { name: form.name, phone: form.phone, email: form.email } } });
      onCreated(result.order);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };
  return <section className="sp-card sp-new-order"><div className="sp-section-heading"><div><span className="sp-kicker">WHATSAPP, WALK-IN OR CUSTOM REQUEST</span><h2>Add an order to the desk.</h2><p>A tracking reference is created when you save. You can confirm the final quote later.</p></div><button className="sp-icon-button" aria-label="Close new order" onClick={onCancel}><X size={19} /></button></div><form onSubmit={submit}><div className="sp-form-grid"><Field id="sp-new-name" label="Customer name"><input id="sp-new-name" required maxLength={100} value={form.name} onChange={event => update('name', event.target.value)} /></Field><Field id="sp-new-phone" label="Customer mobile"><input id="sp-new-phone" required inputMode="tel" maxLength={18} value={form.phone} onChange={event => update('phone', event.target.value)} /></Field><Field id="sp-new-email" label="Email" optional><input id="sp-new-email" type="email" value={form.email} onChange={event => update('email', event.target.value)} /></Field><Field id="sp-new-title" label="Product / order description"><input id="sp-new-title" required maxLength={180} placeholder="e.g. School student PVC cards, front + back" value={form.title} onChange={event => update('title', event.target.value)} /></Field><Field id="sp-new-qty" label="Quantity"><input id="sp-new-qty" required type="number" min={1} max={100000} step={1} value={form.quantity} onChange={event => update('quantity', event.target.value)} /></Field><Field id="sp-new-total" label="Final total including delivery (₹)" optional><input id="sp-new-total" type="number" min={1} step="0.01" value={form.grandTotal} onChange={event => update('grandTotal', event.target.value)} placeholder="Leave blank until quoted" /></Field></div><Field id="sp-new-notes" label="Order requirements" optional><textarea id="sp-new-notes" rows={3} maxLength={2000} value={form.notes} onChange={event => update('notes', event.target.value)} /></Field><label className="sp-check"><input type="checkbox" checked={form.requireArtwork} onChange={event => update('requireArtwork', event.target.checked)} /><span>Require customer artwork proof approval before production</span></label><ErrorBox error={error} /><button className="sp-primary" disabled={busy}>{busy ? 'Saving…' : 'Save order & create tracking reference'}<ArrowRight size={16} /></button></form></section>;
}

const ORDER_TABS = [
  ['details', 'Overview', Package],
  ['quote', 'Quote & payment', CreditCard],
  ['artwork', 'Artwork & files', FolderOpen],
  ['dispatch', 'Dispatch & timeline', Truck],
];

const STAGE_STEPS = STUDIO_STATUSES.filter(([id]) => id !== 'cancelled');
const STAGE_SHORT_LABELS = {
  received: 'Received',
  confirmed: 'Confirmed',
  design_approved: 'Design OK',
  printing: 'Printing',
  ready: 'Ready',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
};
const OFFLINE_PREFIXES = ['UPI · ', 'Cash at Studio · ', 'Bank Transfer · '];

function OrderDetails({ order, onOpenQuote, onOpenDispatch }) {
  const { customer } = order;
  const address = [customer.address, customer.apartment, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ');
  const pickup = order.delivery?.method === 'pickup';

  const requirements = item => {
    if (item.type === 'birthday_card') return birthdayOrderDetails(item);
    if (item.type === 'gallery_wall') return galleryOrderDetails(item);
    if (item.type === 'pvc_card' && item.configuration) return pvcOrderDetails(item);
    return [item.specialInstructions, item.personalisation?.specifications].filter(Boolean).join('\n');
  };

  return <section className="sp-editor-card">
    <h2>Customer &amp; order details</h2>
    <dl className="sp-customer-details">
      <div>
        <dt><UserRound size={15} /> Contact</dt>
        <dd>{customer.name}</dd>
        <dd><a href={'tel:' + customer.phone}>{customer.phone}</a></dd>
        {customer.email && <dd><a href={'mailto:' + customer.email}>{customer.email}</a></dd>}
      </div>
      <div>
        <dt><MapPin size={15} /> {pickup ? 'Lucknow studio pickup' : 'Delivery'}</dt>
        {pickup ? <>
          <dd>Lucknow Studio Pickup · Free</dd>
          <dd>{BUSINESS_CONFIG.location.workshopAddress}</dd>
        </> : address ? <>
          <dd>{address}</dd>
          {customer.pincode && (
            <span className="sp-delivery-zone">
              {isLucknowPincode(customer.pincode) ? 'Lucknow Porter (226xxx)' : 'Pan-India Courier'}
            </span>
          )}
        </> : (
          <dd>Delivery address pending — set delivery or pickup.</dd>
        )}
        {onOpenDispatch && (
          <button type="button" className="sp-inline-edit-btn" onClick={onOpenDispatch}>
            Edit delivery <ArrowRight size={12} />
          </button>
        )}
      </div>
    </dl>
    <h3 className="sp-items-title">Order items <span>{order.items.length}</span></h3>
    <ul className="sp-editor-items">
      {order.items.map((item, index) => {
        const specs = [item.size, item.finish, item.orientation, item.glass].filter(Boolean).join(' · ');
        const notes = requirements(item);
        return <li key={index}>
          <span className="sp-item-preview">{hasItemPreview(item) ? <OrderItemPreview item={item} /> : <Package size={21} />}</span>
          <div>
            <h4>{item.title}</h4>
            {specs && <p>{specs}</p>}
            <p>Qty {item.quantity}</p>
            {notes && <details className="sp-item-requirements" open={order.items.length <= 3}>
              <summary>Personalisation &amp; requirements</summary>
              <pre>{notes}</pre>
            </details>}
          </div>
          <strong>{money(item.price === null ? null : item.price * item.quantity)}</strong>
        </li>;
      })}
    </ul>

    <div className="sp-order-totals">
      <div><span>Items subtotal</span><strong>{money(order.subtotal)}</strong></div>
      {order.discountAmount > 0 && <div><span>Discount {order.discountCode || ''}</span><strong>−{money(order.discountAmount)}</strong></div>}
      <div>
        <span>{pickup ? 'Studio pickup' : order.delivery?.courier || order.delivery?.provider || 'Delivery'}</span>
        <strong>{order.shippingFee === 0 ? 'Free (₹0)' : money(order.shippingFee)}</strong>
      </div>
      <div className="sp-totals-final"><span>Order total</span><strong>{money(order.grandTotal)}</strong></div>
      {!order.pricingConfirmed && onOpenQuote && (
        <button type="button" className="sp-text-link" onClick={onOpenQuote}>
          Confirm quote &amp; delivery <ArrowRight size={14} />
        </button>
      )}
    </div>

    {order.items.some(item => item.image) && <p className="sp-editor-help">Check the original files before printing.</p>}
  </section>;
}

function orderUpdateFields(order) {
  return {
    status: order.status,
    publicNote: order.publicNote || '',
    privateNotes: order.privateNotes || '',
    delivery: {
      method: order.delivery?.method === 'pickup' ? 'pickup' : 'courier',
      provider: order.delivery?.provider || '',
      courier: '',
      awb: '',
      trackingUrl: '',
      expectedDate: '',
      ...order.delivery,
    },
    customer: {
      address: order.customer?.address || '',
      apartment: order.customer?.apartment || '',
      city: order.customer?.city || '',
      state: order.customer?.state || '',
      pincode: order.customer?.pincode || '',
    },
    grandTotal: order.grandTotal ?? '',
    recordOfflinePayment: false,
    paymentReference: '',
    filesReviewed: Boolean(order.filesReviewed),
    legalHold: Boolean(order.legalHold),
  };
}

function StageStepper({ status }) {
  if (status === 'cancelled') {
    return <div className="sp-stage-cancelled" role="status">Order cancelled</div>;
  }
  const currentIdx = STAGE_STEPS.findIndex(([id]) => id === status);
  return <ol className="sp-stage-bar" aria-label="Order stage progress">
    {STAGE_STEPS.map(([id, label], index) => {
      const state = index < currentIdx ? 'done' : index === currentIdx ? 'current' : 'upcoming';
      return <li key={id} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
        <span className="sp-stage-dot" aria-hidden="true">{state === 'done' ? <Check size={12} /> : index + 1}</span>
        <span>{STAGE_SHORT_LABELS[id] || label}</span>
      </li>;
    })}
  </ol>;
}

function NextStepBanner({ order, waHref, paymentOk, deliveryOk, artworkOk, filesOk, hasOpenRequest, onSwitchTab, onQuickAdvance }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (order.status === 'cancelled') return null;

  const runAdvance = async (nextStatus, note) => {
    setBusy(true);
    setError('');
    try {
      await onQuickAdvance(nextStatus, note);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  let tone = 'warn';
  let title = '';
  let body = '';
  let primaryAction = null;
  let secondaryWa = '';

  const gatewayLocked = order.payment?.method === 'razorpay' || order.payment?.method === 'sandbox';

  if (order.status === 'delivered') {
    tone = 'done';
    title = 'Order delivered / collected';
    body = 'All production and delivery steps are complete. Timeline and records remain archived here.';
  } else if (hasOpenRequest) {
    title = 'Customer support / cancellation request needs review';
    body = 'Open Artwork & files to review and respond before production.';
    primaryAction = <button type="button" className="sp-next-btn-primary" onClick={() => onSwitchTab('artwork')}>Review request <ArrowRight size={14} /></button>;
  } else if (!order.pricingConfirmed) {
    title = 'Step 1 · Set item & delivery quote';
    body = 'Confirm items subtotal and Lucknow Pickup / Porter / Courier rate before collecting payment.';
    primaryAction = <button type="button" className="sp-next-btn-primary" onClick={() => onSwitchTab('quote')}>Set quote now <ArrowRight size={14} /></button>;
  } else if (!deliveryOk) {
    title = 'Step 1 · Add delivery address & PIN (or choose Pickup)';
    body = 'Customer address or 6-digit PIN is missing for courier / Porter dispatch.';
    primaryAction = <button type="button" className="sp-next-btn-primary" onClick={() => onSwitchTab('dispatch')}>Set delivery details <ArrowRight size={14} /></button>;
  } else if (!paymentOk) {
    title = `Step 2 · Collect prepaid payment (${money(order.grandTotal)})`;
    body = gatewayLocked
      ? 'Customer checkout payment is pending. Share the tracking link on WhatsApp so they can finish paying.'
      : 'Share the tracking link on WhatsApp for online payment, or record an offline UPI / cash receipt.';
    primaryAction = <button type="button" className="sp-next-btn-primary" onClick={() => onSwitchTab('quote')}>{gatewayLocked ? 'View payment details' : 'Record UPI / cash'} <ArrowRight size={14} /></button>;
    secondaryWa = waHref;
  } else if (!artworkOk) {
    const waiting = order.artwork?.status === 'awaiting_approval';
    title = waiting ? 'Step 3 · Waiting for customer proof approval' : 'Step 3 · Upload & publish artwork proof';
    body = waiting
      ? 'Proof is live on the customer link. Send a quick WhatsApp reminder if needed.'
      : 'Upload the studio proof so the customer can approve before printing.';
    primaryAction = <button type="button" className="sp-next-btn-primary" onClick={() => onSwitchTab('artwork')}>Open artwork &amp; files <ArrowRight size={14} /></button>;
    if (waiting) secondaryWa = waHref;
  } else if (!filesOk) {
    title = 'Step 3 · Review original print files';
    body = 'Check received original files and mark them reviewed before starting production.';
    primaryAction = <button type="button" className="sp-next-btn-primary" onClick={() => onSwitchTab('artwork')}>Review files <ArrowRight size={14} /></button>;
  } else if (['received', 'confirmed', 'design_approved'].includes(order.status)) {
    tone = 'ready';
    title = 'Step 4 · Ready for production';
    body = 'Quote, payment, delivery and artwork checks are complete.';
    primaryAction = <button type="button" className="sp-next-btn-primary" disabled={busy} onClick={() => runAdvance('printing', 'Your artwork is approved and printing & finishing has started at BISEN Studio.')}>{busy ? 'Updating…' : 'Start printing'} <ArrowRight size={14} /></button>;
  } else if (order.status === 'printing') {
    tone = 'ready';
    title = 'Step 5 · In production';
    body = 'Mark ready once printing, framing and quality checks are finished.';
    const readyNote = order.delivery?.method === 'pickup'
      ? 'Your order is ready for collection at BISEN Studio, Milan Tower, Kursi Road, Lucknow.'
      : 'Your order is packed and ready for dispatch.';
    primaryAction = <button type="button" className="sp-next-btn-primary" disabled={busy} onClick={() => runAdvance('ready', readyNote)}>{busy ? 'Updating…' : 'Mark ready'} <ArrowRight size={14} /></button>;
  } else if (order.status === 'ready') {
    tone = 'ready';
    if (order.delivery?.method === 'pickup') {
      title = 'Step 6 · Ready for Lucknow studio pickup';
      body = 'Hand over to the customer at the desk and mark collected.';
      primaryAction = <button type="button" className="sp-next-btn-primary" disabled={busy} onClick={() => runAdvance('delivered', 'Order collected from BISEN Studio. Thank you!')}>{busy ? 'Updating…' : 'Mark collected / delivered'} <Check size={14} /></button>;
    } else if (order.delivery?.courier || order.delivery?.awb) {
      title = 'Step 6 · Ready to dispatch';
      body = `Courier details set (${[order.delivery.courier, order.delivery.awb].filter(Boolean).join(' · ')}).`;
      primaryAction = <button type="button" className="sp-next-btn-primary" disabled={busy} onClick={() => runAdvance('dispatched', 'Your order has been packed safely and handed over for delivery.')}>{busy ? 'Updating…' : 'Mark dispatched'} <ArrowRight size={14} /></button>;
    } else {
      title = 'Step 6 · Add Porter / Courier details & dispatch';
      body = 'Enter the delivery partner or AWB number before marking dispatched.';
      primaryAction = <button type="button" className="sp-next-btn-primary" onClick={() => onSwitchTab('dispatch')}>Open dispatch details <ArrowRight size={14} /></button>;
    }
  } else if (order.status === 'dispatched') {
    tone = 'ready';
    title = 'Step 7 · Out for delivery';
    body = `Dispatched via ${order.delivery?.courier || order.delivery?.provider || 'delivery partner'}. Mark delivered once received.`;
    primaryAction = <button type="button" className="sp-next-btn-primary" disabled={busy} onClick={() => runAdvance('delivered', 'Your order has been delivered. Thank you for ordering with BISEN Studio!')}>{busy ? 'Updating…' : 'Mark delivered'} <Check size={14} /></button>;
  }

  return <section className="sp-next-banner" data-tone={tone} role="status" aria-live="polite">
    <div className="sp-next-banner-copy">
      {tone === 'warn' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
    {(primaryAction || secondaryWa) && (
      <div className="sp-next-banner-actions">
        {secondaryWa && (
          <a className="sp-next-btn-wa" href={secondaryWa} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={14} /> {order.artwork?.status === 'awaiting_approval' && paymentOk ? 'WhatsApp reminder' : 'Send payment link'}
          </a>
        )}
        {primaryAction}
      </div>
    )}
    {error && (
      <p className="sp-next-banner-error" role="alert">
        <span>{error}</span>
        <button type="button" onClick={() => onSwitchTab('artwork')}>Open artwork &amp; files</button>
      </p>
    )}
  </section>;
}

function OfflinePaymentCard({ order, onPatch }) {
  const [paymentReference, setPaymentReference] = useState('');
  const [legacyTotal, setLegacyTotal] = useState(order.grandTotal ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const paid = Boolean(order.payment?.isPaid);
  const gatewayLocked = order.payment?.method === 'razorpay' || order.payment?.method === 'sandbox';
  const legacyEditable = !(order.commerceVersion >= 2) && !paid && !gatewayLocked;

  const applyPrefix = prefix => {
    setSaved(false);
    setError('');
    setPaymentReference(current => {
      const stripped = current.replace(/^(?:UPI · |Cash at Studio · |Bank Transfer · )/, '');
      return prefix + stripped;
    });
  };

  const submitOffline = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await onPatch({
        recordOfflinePayment: true,
        paymentReference: paymentReference.trim(),
        ...(legacyEditable && legacyTotal !== '' ? { grandTotal: legacyTotal } : {}),
      });
      setPaymentReference('');
      setSaved(true);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  const saveLegacyTotal = async () => {
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await onPatch({ grandTotal: legacyTotal });
      setSaved(true);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  return <section className="sp-editor-card sp-offline-card">
    <div className="sp-offline-head">
      <h2><CreditCard size={19} /> Payment &amp; offline receipt</h2>
      <span className="sp-editor-payment" data-paid={paid} data-test={order.payment?.status === 'test_paid'}>{order.payment?.label}</span>
    </div>
    {(order.payment?.paymentId || order.payment?.reference) && (
      <p className="sp-offline-meta">
        Reference: <strong>{order.payment.paymentId || order.payment.reference}</strong>
        {order.payment?.mode === 'test' && ' · Test payment only (no real money received)'}
      </p>
    )}
    {paid ? (
      <p className="sp-offline-meta">Payment has been verified and recorded for this order.</p>
    ) : gatewayLocked ? (
      <p className="sp-offline-meta">
        Online checkout ({order.payment.method === 'sandbox' ? 'Local Test Simulator' : 'Razorpay'}) has started for this order, so payment verification is handled through the gateway.
      </p>
    ) : !order.pricingConfirmed && !legacyEditable ? (
      <p className="sp-offline-meta">Confirm the quote above first to unlock offline UPI / cash recording.</p>
    ) : (
      <form onSubmit={submitOffline}>
        {legacyEditable && (
          <div className="sp-editor-fields">
            <Field id="sp-legacy-total" label="Legacy order final total (₹)">
              <input id="sp-legacy-total" type="number" min={1} step="0.01" value={legacyTotal} onChange={event => { setLegacyTotal(event.target.value); setSaved(false); }} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 12 }}>
              <button type="button" className="sp-secondary" disabled={busy || !legacyTotal} onClick={saveLegacyTotal}>Update total</button>
            </div>
          </div>
        )}
        <div className="sp-quick-chips" style={{ marginTop: 4 }} aria-label="Payment method prefixes">
          {OFFLINE_PREFIXES.map(prefix => (
            <button key={prefix} type="button" className="sp-chip-btn" onClick={() => applyPrefix(prefix)}>
              {prefix.replace(' · ', '')}
            </button>
          ))}
        </div>
        <Field id="sp-offline-ref" label="Receipt / UPI UTR / Cash reference">
          <input
            id="sp-offline-ref"
            required
            maxLength={200}
            placeholder="e.g. UPI · UTR 412398765432 or Cash receipt #12"
            value={paymentReference}
            onChange={event => { setPaymentReference(event.target.value); setSaved(false); setError(''); }}
          />
        </Field>
        <ErrorBox error={error} />
        {saved && <p className="sp-success" role="status"><Check size={15} /> Payment recorded.</p>}
        <button type="submit" className="sp-primary" disabled={busy || !paymentReference.trim()}>
          <Check size={15} /> {busy ? 'Recording…' : 'Mark paid (offline)'}
        </button>
      </form>
    )}
  </section>;
}

function FilesReviewedBar({ order, expectedCount, onPatch }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!expectedCount && !order.artwork?.required && !order.filesReviewed) return null;

  const reviewed = Boolean(order.filesReviewed);
  const toggle = async () => {
    setBusy(true);
    setError('');
    try {
      await onPatch({ filesReviewed: !reviewed });
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  return <section className="sp-files-bar" data-ok={reviewed}>
    <div className="sp-files-bar-copy">
      <ShieldCheck size={18} />
      <div>
        <strong>{reviewed ? 'Original files reviewed & ready for print' : 'Original print files check pending'}</strong>
        <small>
          {expectedCount > 0
            ? `${expectedCount} original file(s) expected for this order.`
            : 'Confirm customer files match print dimensions and resolution before starting printing.'}
        </small>
      </div>
    </div>
    <button type="button" className={reviewed ? 'sp-secondary' : 'sp-primary'} disabled={busy} onClick={toggle}>
      {busy ? 'Saving…' : reviewed ? 'Reviewed ✓ (Undo)' : 'Mark originals reviewed'}
    </button>
    {error && <p className="sp-error" style={{ flexBasis: '100%', margin: 0 }} role="alert">{error}</p>}
  </section>;
}

function DispatchDeliveryEditor({ order, onPatch }) {
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const defaults = orderUpdateFields(order);
  const form = {
    delivery: { ...defaults.delivery, ...draft.delivery },
    customer: { ...defaults.customer, ...draft.customer },
  };
  const pickup = form.delivery.method === 'pickup';
  const validPin = /^[1-9]\d{5}$/.test(form.customer.pincode || '');

  const setMethod = method => {
    setSaved('');
    setError('');
    setDraft(current => ({
      ...current,
      delivery: {
        ...current.delivery,
        method,
        provider: method === 'pickup'
          ? 'Lucknow Studio Pickup'
          : (current.delivery?.provider && current.delivery.provider !== 'Lucknow Studio Pickup'
              ? current.delivery.provider
              : 'Porter / Courier'),
      },
    }));
  };

  const updateDelivery = (key, value) => {
    setSaved('');
    setError('');
    setDraft(current => ({ ...current, delivery: { ...current.delivery, [key]: value } }));
  };

  const updateCustomer = (key, value) => {
    setSaved('');
    setError('');
    setDraft(current => ({ ...current, customer: { ...current.customer, [key]: value } }));
  };

  const saveDispatch = async ({ markDispatched = false } = {}) => {
    setBusy(true);
    setError('');
    setSaved('');
    try {
      await onPatch({
        delivery: form.delivery,
        customer: form.customer,
        ...(markDispatched ? {
          status: 'dispatched',
          publicNote: order.publicNote || 'Your order has been packed safely and handed over for delivery.',
        } : {}),
      });
      setDraft({});
      setSaved(markDispatched ? 'Delivery details saved and order marked dispatched.' : 'Delivery & address details saved.');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  return <section className="sp-editor-card">
    <h2><Truck size={19} /> Delivery, address &amp; courier tracking</h2>
    <div className="ow-method-toggle" role="group" aria-label="Delivery method">
      <button type="button" aria-pressed={!pickup} onClick={() => setMethod('courier')}>
        Porter (Lucknow) / Pan-India Courier
      </button>
      <button type="button" aria-pressed={pickup} onClick={() => setMethod('pickup')}>
        Lucknow Studio Pickup (Free)
      </button>
    </div>

    <form onSubmit={event => { event.preventDefault(); saveDispatch({ markDispatched: false }); }}>
      <Field id="sp-dispatch-expected" label="Expected pickup / delivery date" optional>
        <input id="sp-dispatch-expected" type="date" value={form.delivery.expectedDate} onChange={event => updateDelivery('expectedDate', event.target.value)} />
      </Field>

      {!pickup && <>
        <div className="sp-quick-chips" style={{ marginTop: 2 }} aria-label="Courier presets">
          {COURIER_CHIPS.map(name => (
            <button key={name} type="button" className="sp-chip-btn" onClick={() => updateDelivery('courier', name)}>
              {name}
            </button>
          ))}
        </div>
        <div className="sp-editor-fields">
          <Field id="sp-courier" label="Courier / Partner" optional><input id="sp-courier" value={form.delivery.courier} maxLength={100} onChange={event => updateDelivery('courier', event.target.value)} /></Field>
          <Field id="sp-awb" label="AWB / consignment no." optional><input id="sp-awb" value={form.delivery.awb} maxLength={100} onChange={event => updateDelivery('awb', event.target.value)} /></Field>
        </div>
        <Field id="sp-courier-link" label="Courier tracking link" optional><input id="sp-courier-link" type="url" placeholder="https://…" value={form.delivery.trackingUrl} onChange={event => updateDelivery('trackingUrl', event.target.value)} /></Field>

        <h3 className="sp-dispatch-sub">Customer delivery address &amp; PIN</h3>
        <Field id="sp-cust-address" label="Delivery address" optional><input id="sp-cust-address" maxLength={500} placeholder="House / shop / street" value={form.customer.address} onChange={event => updateCustomer('address', event.target.value)} /></Field>
        <div className="sp-editor-fields">
          <Field id="sp-cust-city" label="City" optional><input id="sp-cust-city" maxLength={150} value={form.customer.city} onChange={event => updateCustomer('city', event.target.value)} /></Field>
          <Field id="sp-cust-state" label="State" optional><input id="sp-cust-state" maxLength={150} value={form.customer.state} onChange={event => updateCustomer('state', event.target.value)} /></Field>
        </div>
        <Field id="sp-cust-pincode" label="6-digit PIN code" optional>
          <input id="sp-cust-pincode" inputMode="numeric" maxLength={6} placeholder="e.g. 226022" value={form.customer.pincode} onChange={event => updateCustomer('pincode', event.target.value)} />
          {validPin && <span className="sp-pin-badge">{isLucknowPincode(form.customer.pincode) ? '✓ Lucknow PIN (226xxx) — Porter eligible' : 'Pan-India outstation PIN — Courier'}</span>}
        </Field>
      </>}

      <ErrorBox error={error} />
      {saved && <p className="sp-success" role="status"><Check size={15} /> {saved}</p>}
      <div className="sp-dispatch-actions">
        <button type="submit" className="sp-primary" disabled={busy}><Check size={15} /> {busy ? 'Saving…' : 'Save delivery & address'}</button>
        {order.status === 'ready' && !pickup && (
          <button type="button" className="sp-secondary" disabled={busy} onClick={() => saveDispatch({ markDispatched: true })}>
            <Truck size={15} /> Save &amp; mark dispatched
          </button>
        )}
      </div>
    </form>
  </section>;
}

function QuickUpdatePanel({ order, checklist, onJumpTab, onPatch }) {
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const defaults = orderUpdateFields(order);
  const form = { ...defaults, ...draft };
  const url = safeTrackingUrl(order);

  const update = (key, value) => {
    setDraft(current => ({ ...current, [key]: value }));
    setSaved(false);
    setError('');
  };

  const showQuoteHint = !order.pricingConfirmed && (
    form.status === 'confirmed' || /confirm.*quote|final quote/i.test(form.publicNote || '')
  );

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await onPatch({
        status: form.status,
        publicNote: form.publicNote,
        privateNotes: form.privateNotes,
        legalHold: form.legalHold,
      });
      setDraft({});
      setSaved(true);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  return <aside className="sp-editor-card sp-order-update" aria-labelledby="sp-update-heading">
    <h2 id="sp-update-heading" tabIndex={-1}><SlidersHorizontal size={19} /> Quick stage &amp; update</h2>
    <div className="sp-mini-checklist" aria-label="Order readiness checklist">
      {checklist.map(item => (
        <button key={item.tab + item.label} type="button" className="sp-mini-check-row" data-ok={item.ok} onClick={() => onJumpTab(item.tab)}>
          {item.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <strong>{item.label}</strong>
          <span>{item.detail}</span>
          <ArrowRight size={13} />
        </button>
      ))}
    </div>

    <form onSubmit={submit}>
      <Field id="sp-status" label="Order status">
        <select id="sp-status" value={form.status} onChange={event => update('status', event.target.value)}>
          {STUDIO_STATUSES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </Field>
      {showQuoteHint && (
        <p className="sp-inline-hint">
          Quote is still pending — <button type="button" onClick={() => onJumpTab('quote')}>set the final amount in Quote &amp; payment</button>.
        </p>
      )}
      <Field id="sp-public-note" label="Customer-visible update" optional>
        <textarea id="sp-public-note" rows={3} maxLength={2000} value={form.publicNote} placeholder="e.g. Your design is approved. Printing starts tomorrow." onChange={event => update('publicNote', event.target.value)} />
      </Field>
      <div className="sp-quick-chips" aria-label="Quick status notes">
        {STATUS_NOTE_PRESETS.map(([label, note]) => (
          <button key={label} type="button" className="sp-chip-btn" onClick={() => update('publicNote', note)}>
            + {label}
          </button>
        ))}
      </div>
      <details className="sp-update-group">
        <summary><Link2 size={15} /> Internal studio notes &amp; tracking link <ChevronDown size={15} /></summary>
        <div className="sp-update-fields">
          <Field id="sp-private-note" label="Private studio notes" optional>
            <textarea id="sp-private-note" rows={2} maxLength={5000} value={form.privateNotes} placeholder="Internal team notes only…" onChange={event => update('privateNotes', event.target.value)} />
          </Field>
          <label className="sp-check">
            <input type="checkbox" checked={form.legalHold} onChange={event => update('legalHold', event.target.checked)} />
            <span>Retention hold (require studio note; skip auto-cleanup)</span>
          </label>
          <div className="sp-track-code-box">
            <span>Customer private tracking URL</span>
            <code>{url}</code>
          </div>
        </div>
      </details>
      {form.status === 'cancelled' && <p className="sp-cancel-note">Manage any refund separately in the Razorpay Dashboard.</p>}
      <ErrorBox error={error} />
      {saved && <p className="sp-success" role="status"><Check size={15} /> Customer tracking updated.</p>}
      <button type="submit" className="sp-primary" disabled={busy}>
        <Check size={16} /> {busy ? 'Saving update…' : 'Save customer update'}
      </button>
    </form>
  </aside>;
}

export function StudioOrderEditor({ order, onSaved, onBack }) {
  const [activeTab, setActiveTab] = useState('details');
  const [copiedHero, setCopiedHero] = useState(false);

  const url = safeTrackingUrl(order);
  const waHref = buildCustomerWhatsAppUrl(order);
  const pickup = order.delivery?.method === 'pickup';
  const hasAddress = Boolean(order.customer?.address && /^[1-9]\d{5}$/.test(order.customer?.pincode || ''));
  const deliveryOk = pickup || hasAddress;
  const paymentOk = Boolean(order.payment?.isPaid || order.payment?.status === 'test_paid');
  const artworkOk = !order.artwork?.required || order.artwork?.status === 'approved';
  const expectedOriginalsCount = originalReferences(order.items).length;
  const filesOk = expectedOriginalsCount === 0 || Boolean(order.filesReviewed);
  const hasOpenRequest = Boolean(order.requests?.some(r => !['resolved', 'declined'].includes(r.status)));

  const deliveryText = pickup
    ? 'Lucknow Pickup (Free)'
    : hasAddress
      ? (isLucknowPincode(order.customer.pincode) ? `Lucknow Porter (${order.customer.pincode})` : `Pan-India Courier (${order.customer.pincode})`)
      : 'Address / PIN pending';

  const checklist = [
    { tab: 'quote', label: 'Quote', ok: Boolean(order.pricingConfirmed), detail: order.pricingConfirmed ? `Confirmed · ${money(order.grandTotal)}` : 'Pending' },
    { tab: 'quote', label: 'Payment', ok: paymentOk, detail: order.payment?.isPaid ? 'Paid' : order.payment?.status === 'test_paid' ? 'Test verified' : 'Awaiting' },
    { tab: 'artwork', label: 'Artwork', ok: artworkOk && filesOk && !hasOpenRequest, detail: hasOpenRequest ? 'Support request' : !artworkOk ? 'Needs proof / approval' : !filesOk ? 'Check originals' : order.artwork?.required ? 'Approved' : 'Not required' },
    { tab: 'dispatch', label: 'Delivery', ok: deliveryOk, detail: deliveryText },
  ];

  const tabPending = {
    details: false,
    quote: !order.pricingConfirmed || !paymentOk,
    artwork: !artworkOk || !filesOk || hasOpenRequest,
    dispatch: !deliveryOk || (order.status === 'ready' && !pickup && !order.delivery?.courier && !order.delivery?.awb),
  };

  const patchOrder = async (overrides = {}) => {
    const defaults = orderUpdateFields(order);
    const body = {
      ...defaults,
      ...overrides,
      delivery: { ...defaults.delivery, ...(overrides.delivery || {}) },
      customer: { ...defaults.customer, ...(overrides.customer || {}) },
      updatedAt: order.updatedAt,
    };
    const result = await studioRequest('/studio/orders/' + order.reference, {
      method: 'PATCH',
      body,
    });
    onSaved(result.order);
    return result.order;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedHero(true);
      setTimeout(() => setCopiedHero(false), 1800);
    } catch {
      setActiveTab('details');
    }
  };

  const handleTabKey = (event, index) => {
    const lastIndex = ORDER_TABS.length - 1;
    const nextIndex = {
      ArrowRight: (index + 1) % ORDER_TABS.length,
      ArrowLeft: (index + lastIndex) % ORDER_TABS.length,
      Home: 0,
      End: lastIndex,
    }[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    const [next] = ORDER_TABS[nextIndex];
    setActiveTab(next);
    event.currentTarget.parentElement.children[nextIndex].focus();
  };

  const panels = {
    details: <OrderDetails order={order} onOpenQuote={() => setActiveTab('quote')} onOpenDispatch={() => setActiveTab('dispatch')} />,
    quote: <>
      <QuoteEditor key={order.reference + '-' + order.pricingConfirmed + '-' + order.grandTotal + '-' + order.delivery?.method} order={order} onUpdated={onSaved} />
      <OfflinePaymentCard order={order} onPatch={patchOrder} />
    </>,
    artwork: <>
      <FilesReviewedBar order={order} expectedCount={expectedOriginalsCount} onPatch={patchOrder} />
      <StudioArtwork order={order} onUpdated={onSaved} />
    </>,
    dispatch: <>
      <DispatchDeliveryEditor order={order} onPatch={patchOrder} />
      <section className="sp-editor-card">
        <h2><Clock3 size={19} /> Order timeline</h2>
        <ol className="sp-editor-history">
          {[...order.history].reverse().map((event, index) => <li key={event.at + '-' + index}>
            <strong>{event.title}</strong>
            <time dateTime={event.at}>{date(event.at)}</time>
            {event.note && <p>{event.note}</p>}
          </li>)}
        </ol>
      </section>
    </>,
  };

  return <section className="sp-order-editor" aria-labelledby="sp-order-title">
    <div className="sp-editor-toprow">
      <button type="button" className="sp-editor-back" onClick={onBack}><ArrowLeft size={16} /> Back to orders</button>
      <span className="sp-editor-placed"><Package size={14} /> Placed <time dateTime={order.placedAt}>{date(order.placedAt)}</time></span>
    </div>

    <header className="sp-editor-hero">
      <div className="sp-editor-identity">
        <div className="sp-hero-title-row">
          <h1 id="sp-order-title">{order.orderId}</h1>
          <span className="sp-editor-status" data-status={order.status}>{order.statusLabel}</span>
          <span className="sp-editor-payment" data-paid={Boolean(order.payment.isPaid)} data-test={order.payment?.status === 'test_paid'}>{order.payment.label}</span>
        </div>
        <div className="sp-hero-sub">
          <span>{order.customer.name} · {order.customer.phone}</span>
          <span>·</span>
          <strong>{money(order.grandTotal)}</strong>
        </div>
      </div>
      <div className="sp-hero-actions">
        {waHref && (
          <a className="sp-hero-btn sp-hero-btn--wa" href={waHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={14} /> WhatsApp
          </a>
        )}
        <a className="sp-hero-btn" href={'tel:' + order.customer.phone}>
          <Phone size={14} /> Call
        </a>
        <button type="button" className="sp-hero-btn" onClick={copyLink}>
          {copiedHero ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
        </button>
        <a className="sp-hero-btn" href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={14} /> Customer view
        </a>
        <button type="button" className="sp-hero-btn" onClick={() => typeof window !== 'undefined' && window.print()}>
          <Printer size={14} /> Print
        </button>
      </div>
    </header>

    <StageStepper status={order.status} />

    <NextStepBanner
      order={order}
      waHref={waHref}
      paymentOk={paymentOk}
      deliveryOk={deliveryOk}
      artworkOk={artworkOk}
      filesOk={filesOk}
      hasOpenRequest={hasOpenRequest}
      onSwitchTab={setActiveTab}
      onQuickAdvance={(nextStatus, note) => patchOrder({ status: nextStatus, publicNote: note })}
    />

    <button type="button" className="sp-secondary sp-editor-jump" onClick={() => document.getElementById('sp-update-heading')?.focus()}>
      <SlidersHorizontal size={16} /> Quick stage &amp; update
    </button>

    <div className="sp-editor-layout">
      <div role="tablist" aria-label="Order workspace" className="sp-editor-tabs">
        {ORDER_TABS.map(([id, label, Icon], index) => <button
          key={id}
          type="button"
          role="tab"
          id={'sp-tab-' + id}
          aria-controls={'sp-panel-' + id}
          aria-selected={activeTab === id}
          tabIndex={activeTab === id ? 0 : -1}
          onClick={() => setActiveTab(id)}
          onKeyDown={event => handleTabKey(event, index)}
        >
          <Icon size={16} />
          <span>{label}</span>
          {id !== 'details' && <i className="sp-tab-dot" data-pending={Boolean(tabPending[id])} aria-hidden="true" />}
        </button>)}
      </div>
      <div className="sp-editor-content">
        {ORDER_TABS.map(([id]) => <div key={id} role="tabpanel" id={'sp-panel-' + id} aria-labelledby={'sp-tab-' + id} hidden={activeTab !== id} tabIndex={0}>
          {panels[id]}
        </div>)}
      </div>
      <QuickUpdatePanel order={order} checklist={checklist} onJumpTab={setActiveTab} onPatch={patchOrder} />
    </div>
  </section>;
}

const PIPELINE_GROUPS = [
  ['group:attention', 'Needs action (New / Quote / Unpaid / Proof)'],
  ['group:quote_pending', 'Quote pending'],
  ['group:unpaid', 'Awaiting payment (quoted)'],
  ['group:production', 'In production (Confirmed → Printing)'],
  ['group:fulfillment', 'Ready & Dispatched'],
];

const FILTER_LABELS = Object.fromEntries([...PIPELINE_GROUPS, ...STUDIO_STATUSES]);

function countOverrideItems(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  let total = 0;
  for (const val of Object.values(obj)) {
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      total += countOverrideItems(val);
    } else if (val !== '' && val !== undefined && val !== null && Number.isFinite(Number(val))) {
      total += 1;
    }
  }
  return total;
}

function StudioDesk({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { priceOverrides } = useBusinessRules();

  const subPath = location.pathname.replace(/^\/studio\/?/, '').replace(/\/+$/, '');
  const view = subPath === 'prices'
    ? 'prices'
    : subPath === 'payments'
      ? 'payments'
      : subPath === 'business'
        ? 'business'
        : 'orders';
  const adding = subPath === 'new';
  const orderMatch = subPath.match(/^orders\/(ALN-[A-Z0-9-]+)$/i);
  const routeOrderRef = orderMatch ? orderMatch[1].toUpperCase() : '';

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [list, setList] = useState(null);
  const [overview, setOverview] = useState(null);
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const detailSequence = useRef(0);

  const loadOverview = useCallback(signal => {
    studioRequest('/studio/overview', signal ? { signal } : {})
      .then(setOverview)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadOverview(controller.signal);
    return () => controller.abort();
  }, [loadOverview, version, location.pathname]);

  useEffect(() => {
    const onKeyDown = event => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const routes = { '1': '/studio', '2': '/studio/prices', '3': '/studio/payments', '4': '/studio/business' };
      const target = routes[event.key];
      if (target) {
        event.preventDefault();
        setError('');
        navigate(target);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  useEffect(() => {
    if (!routeOrderRef || order?.reference === routeOrderRef) return undefined;
    const seq = ++detailSequence.current;
    const controller = new AbortController();
    studioRequest(`/studio/orders/${routeOrderRef}`, { signal: controller.signal })
      .then(result => {
        if (seq === detailSequence.current) setOrder(result.order);
      })
      .catch(cause => {
        if (cause.name !== 'AbortError') setError(cause.message);
      });
    return () => controller.abort();
  }, [routeOrderRef, order?.reference]);

  useEffect(() => {
    if (view !== 'orders' || routeOrderRef || adding) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setBusy(true);
      studioRequest(`/studio/orders?q=${encodeURIComponent(query)}&status=${encodeURIComponent(filter)}&offset=${offset}`, { signal: controller.signal })
        .then(setList)
        .catch(cause => { if (cause.name !== 'AbortError') setError(cause.message); })
        .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [view, query, filter, offset, version, routeOrderRef, adding]);

  const goSection = path => {
    setError('');
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const toggleFilter = target => {
    setFilter(current => (current === target ? '' : target));
    setOffset(0);
  };

  const resetFilters = () => {
    setQuery('');
    setFilter('');
    setOffset(0);
  };

  const logout = async () => {
    try {
      await studioRequest('/studio/logout', { method: 'POST' });
      onLogout();
    } catch (cause) {
      setError(cause.message);
    }
  };

  const activeOrder = routeOrderRef && order?.reference === routeOrderRef ? order : null;
  const s = list?.summary || overview?.orders || null;
  const pct = n => (s && s.totalOrders > 0 ? Math.min(100, Math.round((n / s.totalOrders) * 100)) : 0);

  const liveOverridesCount = countOverrideItems(priceOverrides) || overview?.prices?.customCount || 0;
  const payMeta = overview?.payments;
  const backupMeta = overview?.backups;

  const isAllCardActive = filter === '' || filter === 'delivered';
  const isAttentionCardActive = ['group:attention', 'received', 'group:quote_pending', 'group:unpaid'].includes(filter);
  const isProductionCardActive = ['group:production', 'confirmed', 'design_approved', 'printing'].includes(filter);
  const isFulfillmentCardActive = ['group:fulfillment', 'ready', 'dispatched'].includes(filter);

  return <>
    <header className="sp-topbar">
      <StudioBrand to="/studio" />
      <nav className="sp-nav-dock" aria-label="Studio sections">
        <button
          type="button"
          title="Orders desk (Alt+1)"
          aria-current={view === 'orders' ? 'page' : undefined}
          onClick={() => goSection('/studio')}
        >
          <Package size={15} />
          <span>Orders</span>
          {s && (
            s.attentionCount > 0 ? (
              <em className="sp-nav-badge" data-tone="amber" title={`${s.attentionCount} order(s) need attention`}>
                {s.attentionCount}
              </em>
            ) : (
              <em className="sp-nav-badge" data-tone="muted">{s.totalOrders}</em>
            )
          )}
        </button>

        <button
          type="button"
          title="Catalogue prices (Alt+2)"
          aria-current={view === 'prices' ? 'page' : undefined}
          onClick={() => goSection('/studio/prices')}
        >
          <Tag size={15} />
          <span>Prices</span>
          {liveOverridesCount > 0 && (
            <em className="sp-nav-badge" data-tone="gold" title={`${liveOverridesCount} custom price overrides active`}>
              {liveOverridesCount} custom
            </em>
          )}
        </button>

        <button
          type="button"
          title="Payment gateway (Alt+3)"
          aria-current={view === 'payments' ? 'page' : undefined}
          onClick={() => goSection('/studio/payments')}
        >
          <CreditCard size={15} />
          <span>Payments</span>
          {payMeta && (
            payMeta.enabled ? (
              <em
                className="sp-nav-badge"
                data-tone={payMeta.mode === 'live' ? 'green' : payMeta.mode === 'sandbox' ? 'teal' : 'amber'}
              >
                <i aria-hidden="true" />
                {payMeta.mode === 'live' ? 'Live' : payMeta.mode === 'sandbox' ? 'Sim' : 'Test'}
              </em>
            ) : (
              <em className="sp-nav-badge" data-tone="muted">
                <i aria-hidden="true" />
                Off
              </em>
            )
          )}
        </button>

        <button
          type="button"
          title="Business rules & backups (Alt+4)"
          aria-current={view === 'business' ? 'page' : undefined}
          onClick={() => goSection('/studio/business')}
        >
          <ShieldCheck size={15} />
          <span>Business &amp; backups</span>
          {backupMeta && (
            backupMeta.count > 0 ? (
              <em className="sp-nav-badge" data-tone="green" title={`${backupMeta.count} private backup snapshot(s)`}>
                <i aria-hidden="true" />
                {backupMeta.count} bkp
              </em>
            ) : (
              <em className="sp-nav-badge" data-tone="amber" title="No backup snapshot created yet">
                <i aria-hidden="true" />
                Backup
              </em>
            )
          )}
        </button>
      </nav>
      <div>
        <Link to="/" className="sp-website">View website <ExternalLink size={13} /></Link>
        <button className="sp-secondary" onClick={logout}><LogOut size={14} /> Sign out</button>
      </div>
    </header>
    <div className="sp-desk">
      <ErrorBox error={error} />
      {view === 'prices' ? (
        <StudioPriceManager />
      ) : view === 'business' ? (
        <StudioBusinessSettings onChanged={() => loadOverview()} />
      ) : view === 'payments' ? (
        <PaymentSettings onSaved={() => loadOverview()} />
      ) : adding ? (
        <NewStudioOrder
          onCancel={() => navigate('/studio')}
          onCreated={value => {
            setOrder(value);
            setVersion(v => v + 1);
            navigate(`/studio/orders/${value.reference}`, { replace: true });
          }}
        />
      ) : routeOrderRef ? (
        activeOrder ? (
          <StudioOrderEditor
            key={activeOrder.reference}
            order={activeOrder}
            onBack={() => {
              setVersion(v => v + 1);
              navigate('/studio');
            }}
            onSaved={updated => {
              setOrder(updated);
              loadOverview();
            }}
          />
        ) : (
          <div className="sp-card" role="status">Opening order #{routeOrderRef}…</div>
        )
      ) : <>
        <div className="sp-section-heading">
          <div><span className="sp-kicker">A CLEAR VIEW OF YOUR WORKSHOP</span><h1>Your orders, together.</h1><p>Website orders arrive here. Add WhatsApp and walk-in orders to give every customer a tracking reference.</p></div>
          <button className="sp-primary" onClick={() => navigate('/studio/new')}><Plus size={16} /> Add an order</button>
        </div>

        <div className="sp-kpi-grid" role="region" aria-label="Workshop pipeline overview">
          <div className="sp-kpi-card" data-tone="evergreen" data-active={isAllCardActive}>
            <button
              type="button"
              className="sp-kpi-main"
              aria-pressed={filter === ''}
              onClick={() => { setFilter(''); setOffset(0); }}
            >
              <div className="sp-kpi-head">
                <span className="sp-kpi-label">All studio orders</span>
                <span className="sp-kpi-icon" aria-hidden="true"><Package size={18} /></span>
              </div>
              <div className="sp-kpi-metric">
                <strong>{s ? s.totalOrders : '—'}</strong>
                <span className="sp-kpi-sub">{s ? `${s.activeOrders} active in desk` : 'Loading…'}</span>
              </div>
            </button>
            <div className="sp-kpi-chips">
              <span className="sp-kpi-meta-pill" title="Verified paid revenue across orders">
                {s
                  ? s.paidRevenue > 0
                    ? `Paid ${money(s.paidRevenue)}`
                    : s.testPaidTotal > 0
                      ? `Test ${money(s.testPaidTotal)}`
                      : '₹0 paid'
                  : '…'}
              </span>
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'delivered'}
                onClick={() => toggleFilter('delivered')}
              >
                Delivered · {s ? s.deliveredCount : 0}
              </button>
            </div>
            <div className="sp-kpi-meter" aria-hidden="true">
              <span style={{ width: s && s.totalOrders > 0 ? '100%' : '0%' }} />
            </div>
          </div>

          <div
            className="sp-kpi-card"
            data-tone={s?.attentionCount > 0 ? 'amber' : 'neutral'}
            data-active={isAttentionCardActive}
          >
            <button
              type="button"
              className="sp-kpi-main"
              aria-pressed={filter === 'group:attention'}
              onClick={() => toggleFilter('group:attention')}
            >
              <div className="sp-kpi-head">
                <span className="sp-kpi-label">Needs action / New</span>
                <span className="sp-kpi-icon" aria-hidden="true"><Clock3 size={18} /></span>
              </div>
              <div className="sp-kpi-metric">
                <strong>{s ? s.attentionCount : '—'}</strong>
                <span className="sp-kpi-sub">
                  {s ? (s.attentionCount > 0 ? 'Quote, payment or proof' : 'All caught up') : 'Loading…'}
                </span>
              </div>
            </button>
            <div className="sp-kpi-chips">
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'received'}
                onClick={() => toggleFilter('received')}
              >
                New · {s ? s.receivedCount : 0}
              </button>
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'group:quote_pending'}
                onClick={() => toggleFilter('group:quote_pending')}
              >
                Quote · {s ? s.quotePendingCount : 0}
              </button>
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'group:unpaid'}
                onClick={() => toggleFilter('group:unpaid')}
              >
                Unpaid · {s ? s.unpaidCount : 0}
              </button>
            </div>
            <div className="sp-kpi-meter" aria-hidden="true">
              <span style={{ width: `${pct(s?.attentionCount || 0)}%` }} />
            </div>
          </div>

          <div className="sp-kpi-card" data-tone="teal" data-active={isProductionCardActive}>
            <button
              type="button"
              className="sp-kpi-main"
              aria-pressed={filter === 'group:production'}
              onClick={() => toggleFilter('group:production')}
            >
              <div className="sp-kpi-head">
                <span className="sp-kpi-label">In production</span>
                <span className="sp-kpi-icon" aria-hidden="true"><Settings2 size={18} /></span>
              </div>
              <div className="sp-kpi-metric">
                <strong>{s ? s.productionCount : '—'}</strong>
                <span className="sp-kpi-sub">Confirmed → Making</span>
              </div>
            </button>
            <div className="sp-kpi-chips">
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'confirmed'}
                onClick={() => toggleFilter('confirmed')}
              >
                Confirmed · {s ? s.confirmedCount : 0}
              </button>
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'design_approved'}
                onClick={() => toggleFilter('design_approved')}
              >
                Design OK · {s ? s.designApprovedCount : 0}
              </button>
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'printing'}
                onClick={() => toggleFilter('printing')}
              >
                Printing · {s ? s.printingCount : 0}
              </button>
            </div>
            <div className="sp-kpi-meter" aria-hidden="true">
              <span style={{ width: `${pct(s?.productionCount || 0)}%` }} />
            </div>
          </div>

          <div className="sp-kpi-card" data-tone="emerald" data-active={isFulfillmentCardActive}>
            <button
              type="button"
              className="sp-kpi-main"
              aria-pressed={filter === 'group:fulfillment'}
              onClick={() => toggleFilter('group:fulfillment')}
            >
              <div className="sp-kpi-head">
                <span className="sp-kpi-label">Ready &amp; Dispatched</span>
                <span className="sp-kpi-icon" aria-hidden="true"><Truck size={18} /></span>
              </div>
              <div className="sp-kpi-metric">
                <strong>{s ? s.fulfillmentCount : '—'}</strong>
                <span className="sp-kpi-sub">Pickup or in transit</span>
              </div>
            </button>
            <div className="sp-kpi-chips">
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'ready'}
                onClick={() => toggleFilter('ready')}
              >
                Ready · {s ? s.readyCount : 0}
              </button>
              <button
                type="button"
                className="sp-kpi-chip"
                aria-pressed={filter === 'dispatched'}
                onClick={() => toggleFilter('dispatched')}
              >
                Dispatched · {s ? s.dispatchedCount : 0}
              </button>
            </div>
            <div className="sp-kpi-meter" aria-hidden="true">
              <span style={{ width: `${pct(s?.fulfillmentCount || 0)}%` }} />
            </div>
          </div>
        </div>

        <div className="sp-order-tools">
          <div className="sp-search">
            <Search size={17} />
            <input
              aria-label="Search studio orders"
              placeholder="Order reference, customer, mobile or product…"
              value={query}
              onChange={event => { setQuery(event.target.value); setOffset(0); }}
            />
            {query && (
              <button type="button" className="sp-icon-button" style={{ width: 26, minHeight: 26, border: 0 }} aria-label="Clear search" onClick={() => { setQuery(''); setOffset(0); }}>
                <X size={14} />
              </button>
            )}
          </div>
          <select aria-label="Filter order status" value={filter} onChange={event => { setFilter(event.target.value); setOffset(0); }}>
            <option value="">All statuses</option>
            <optgroup label="Pipeline Views">
              {PIPELINE_GROUPS.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
            </optgroup>
            <optgroup label="Individual Statuses">
              {STUDIO_STATUSES.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
            </optgroup>
          </select>
          <button className="sp-secondary" aria-label="Refresh orders" title="Refresh orders" onClick={() => setVersion(v => v + 1)}><RefreshCw size={16} /></button>
        </div>

        {(filter || query) && (
          <div className="sp-active-filter-bar" role="status">
            <div className="sp-active-filter-tags">
              <strong>{busy ? 'Filtering…' : `Showing ${list?.count ?? 0} matching ${list?.count === 1 ? 'order' : 'orders'}`}</strong>
              {filter && (
                <button type="button" className="sp-filter-tag" onClick={() => { setFilter(''); setOffset(0); }}>
                  <span>{FILTER_LABELS[filter] || filter}</span>
                  <X size={12} />
                </button>
              )}
              {query && (
                <button type="button" className="sp-filter-tag" onClick={() => { setQuery(''); setOffset(0); }}>
                  <span>“{query}”</span>
                  <X size={12} />
                </button>
              )}
            </div>
            <button type="button" className="sp-filter-reset" onClick={resetFilters}>Show all orders</button>
          </div>
        )}

        <section className="sp-orders" aria-label="Studio orders" aria-busy={busy}>
          <div className="sp-list-heading"><span>ORDER / CUSTOMER</span><span>STUDIO STATUS</span><span>PAYMENT / TOTAL</span><span /></div>
          {list?.orders?.length ? list.orders.map(item => (
            <button type="button" className="sp-order-row" key={item.reference} onClick={() => navigate(`/studio/orders/${item.reference}`)}>
              <span>
                <strong>{item.orderId}</strong>
                <small>{item.customer.name} · {item.customer.phone}{item.itemSummary ? ` · ${item.itemSummary}${item.itemCount > 1 ? ` +${item.itemCount - 1} more` : ''}` : ''}</small>
                <div className="sp-row-pills">
                  <span className="sp-row-pill">{date(item.placedAt)}</span>
                  <span className="sp-row-pill">{item.deliveryMethod === 'pickup' ? 'Pickup' : 'Porter / Courier'}</span>
                  {!item.pricingConfirmed && <span className="sp-row-pill sp-row-pill--pending">Quote pending</span>}
                  {item.artworkRequired && item.artworkStatus !== 'approved' && (
                    <span className="sp-row-pill sp-row-pill--pending">
                      {item.artworkStatus === 'awaiting_approval' ? 'Awaiting proof OK' : 'Proof needed'}
                    </span>
                  )}
                  {item.hasOpenRequest && <span className="sp-row-pill sp-row-pill--alert">Support request</span>}
                </div>
              </span>
              <span className="sp-row-status"><i data-status={item.status} />{item.statusLabel}</span>
              <span><strong>{money(item.grandTotal)}</strong><small className={item.payment.isPaid ? 'sp-paid-text' : ''}>{item.payment.label}</small></span>
              <ArrowRight size={16} />
            </button>
          )) : (
            <div className="sp-empty">
              <Package size={31} strokeWidth={1.2} />
              <h2>{busy ? 'Loading your orders…' : query || filter ? 'No matching orders.' : 'Your order desk is ready.'}</h2>
              <p>{query || filter ? 'No orders match the current filter or search.' : 'New checkout requests will appear here. You can also add a WhatsApp or walk-in order.'}</p>
              {!busy && (query || filter) && (
                <button type="button" className="sp-secondary sp-empty-reset" onClick={resetFilters}>
                  Show all orders
                </button>
              )}
            </div>
          )}
        </section>
        {list && list.count > 50 && (
          <div className="sp-pagination">
            <button className="sp-secondary" disabled={offset === 0} onClick={() => setOffset(v => Math.max(0, v - 50))}><ArrowLeft size={14} /> Previous</button>
            <span>{offset + 1}–{Math.min(offset + 50, list.count)} of {list.count}</span>
            <button className="sp-secondary" disabled={offset + 50 >= list.count} onClick={() => setOffset(v => v + 50)}>Next <ArrowRight size={14} /></button>
          </div>
        )}
      </>}
    </div>
  </>;
}

export default function StudioPanelPage() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const load = () => { setError(''); studioRequest('/studio/session').then(setSession).catch(cause => setError(cause.message)); };
  useEffect(() => {
    const controller = new AbortController();
    studioRequest('/studio/session', { signal: controller.signal }).then(setSession).catch(cause => { if (cause.name !== 'AbortError') setError(cause.message); });
    return () => controller.abort();
  }, []);
  return <div className="sp-page">{error ? <div className="sp-access sp-unavailable"><h1>Let’s reconnect your studio.</h1><ErrorBox error={error} /><button className="sp-primary" onClick={load}><RefreshCw size={16} /> Try again</button></div> : !session ? <div className="sp-access"><StudioBrand /><p>Opening your studio desk…</p></div> : session.authenticated ? <StudioDesk onLogout={() => setSession({ ...session, authenticated: false, setupRequired: false })} /> : <StudioAccess session={session} onAuthenticated={load} />}</div>;
}
