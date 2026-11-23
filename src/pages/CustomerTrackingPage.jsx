import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Copy,
  CreditCard, FolderOpen, MapPin, MessageCircle, Package, Phone, RefreshCw, Search, ShieldCheck, Truck,
} from 'lucide-react';
import OrderFilesPanel from '../components/OrderFilesPanel';
import OrderItemPreview from '../components/OrderItemPreview';
import OrderSupport from '../components/OrderSupport';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../data/businessConfig';
import { birthdayOrderDetails } from '../utils/birthdayCards';
import { galleryOrderDetails } from '../utils/galleryWalls';
import { readOrderStore, buildOrderStatusMessage } from '../utils/orderStorage';
import { payStudioOrder, rememberStudioOrder, rememberedStudioOrders, studioRequest, trackingUrl } from '../utils/studioApi';
import './CustomerTrackingPage.css';

const STAGES = [
  ['received', 'Order received'],
  ['confirmed', 'Order confirmed'],
  ['design_approved', 'Design approved'],
  ['printing', 'Printing & making'],
  ['ready', 'Ready for collection / dispatch'],
  ['dispatched', 'Dispatched'],
  ['delivered', 'Delivered / collected'],
];
const money = value => value == null ? 'Quote pending' : '₹' + Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const date = value => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const studioHelpUrl = reference => getWhatsAppUrl(buildOrderStatusMessage(reference));
const hasItemPreview = item => Boolean(
  item.image ||
  item.photoUrl ||
  item.type === 'pvc_card' ||
  (item.type === 'gallery_wall' && item.configuration?.slots) ||
  (item.type === 'birthday_card' && item.configuration) ||
  (item.type === 'photo_prints' && item.configuration && item.photos?.length),
);

function itemRequirements(item) {
  if (item.type === 'birthday_card') return birthdayOrderDetails(item);
  if (item.type === 'gallery_wall') return galleryOrderDetails(item);
  if (item.type === 'pvc_card' && item.configuration) {
    const cfg = item.configuration;
    return [
      `Cards: ${item.cardCount || cfg.cardCount} per set × ${item.quantity} set(s)${item.unitPrice ? ` · ₹${item.unitPrice}/card` : ''}`,
      cfg.sides && `Printing: ${cfg.sides === 'double' ? 'Both sides' : 'Single side'} · ${cfg.orientation === 'portrait' ? 'Vertical' : 'Horizontal'}`,
      item.specialInstructions,
    ].filter(Boolean).join('\n');
  }
  return item.specialInstructions || '';
}

function getInitialToken(reference) {
  if (typeof window === 'undefined') return '';
  const { search, hash } = window.location;
  const linkId = new URLSearchParams(search).get('id')?.replace(/^#/, '').toUpperCase();
  const token = linkId === reference && new URLSearchParams(hash.slice(1)).get('key');
  return token || rememberedStudioOrders().find(item => item.reference === reference)?.trackingToken || '';
}

function OrderOverview({ order, refreshing, onRefresh }) {
  const [copyResult, setCopyResult] = useState('');
  const [shareLink, setShareLink] = useState('');

  const copy = async () => {
    const url = trackingUrl(order);
    try {
      await navigator.clipboard.writeText(url);
      setShareLink('');
      setCopyResult('Tracking link copied.');
    } catch {
      setShareLink(url);
      setCopyResult('Select the tracking link below to copy it.');
    }
  };

  return <header className="ct-overview">
    <div className="ct-overview-content">
      <div>
        <div className="ct-order-reference"><Package size={17} /> {order.orderId}</div>
        <h1>{order.statusLabel}</h1>
        <p>Placed <time dateTime={order.placedAt}>{date(order.placedAt)}</time></p>
      </div>
      <div className="ct-overview-meta">
        <p><Clock3 size={15} /> Last studio update <time dateTime={order.updatedAt}>{date(order.updatedAt)}</time></p>
        <div className="ct-actions">
          <button type="button" className="ct-button ct-on-dark" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw size={15} /> {refreshing ? 'Refreshing…' : 'Refresh status'}
          </button>
          <button type="button" className="ct-button ct-on-dark" onClick={copy}><Copy size={15} /> Copy tracking link</button>
        </div>
        {copyResult && <p className="ct-copy-result" role="status">{copyResult}</p>}
        {shareLink && <input className="ct-copy-field" aria-label="Private tracking link" value={shareLink} readOnly onFocus={event => event.target.select()} />}
      </div>
    </div>
    {order.publicNote && <div className="ct-studio-note">
      <MessageCircle size={18} />
      <div><strong>Update from the studio</strong><p>{order.publicNote}</p></div>
    </div>}
  </header>;
}

function OrderProgress({ order }) {
  const current = STAGES.findIndex(([id]) => id === order.status);
  return <section className="ct-card ct-progress" aria-labelledby="ct-progress-title">
    <h2 id="ct-progress-title"><Truck size={21} /> Order progress</h2>
    {order.status === 'cancelled' ? <p className="ct-notice">This order has been cancelled. Use <strong>Changes, returns & help</strong> below for payment or refund questions.</p> :
      <ol className="ct-steps">
        {STAGES.map(([id, label], index) => {
          const event = order.history.findLast(entry => entry.status === id);
          const active = index === current;
          return <li key={id} data-state={active ? 'current' : index < current ? 'past' : 'upcoming'} aria-current={active ? 'step' : undefined}>
            <span className="ct-step-icon" aria-hidden="true">{active ? <Package size={15} /> : index < current ? <Check size={15} /> : <span />}</span>
            <span className="ct-step-name">{label} {active && <small>Current</small>}</span>
            {event && <time dateTime={event.at}>{date(event.at)}</time>}
          </li>;
        })}
      </ol>}
    <p className="ct-auto-refresh"><RefreshCw size={13} /> Checks for updates every 15 seconds while this page is open.</p>
  </section>;
}

function OrderItems({ order }) {
  return <section className="ct-card ct-items" id="ct-items" tabIndex={-1} aria-labelledby="ct-items-title">
    <h2 id="ct-items-title"><Package size={21} /> Order items</h2>
    <ul>
      {order.items.map((item, index) => {
        const options = [item.size, item.finish, item.orientation].filter(Boolean).join(' · ');
        const notes = itemRequirements(item);
        return <li key={index}>
          <span className="ct-item-icon">{hasItemPreview(item) ? <OrderItemPreview item={item} /> : <Package size={20} />}</span>
          <div>
            <h3>{item.title}</h3>
            {options && <p>{options}</p>}
            <p>Quantity {item.quantity}</p>
            {notes && <details open={order.items.length <= 2}>
              <summary>Requirements &amp; details</summary>
              <pre>{notes}</pre>
            </details>}
          </div>
          <strong>{item.price === null && order.pricingConfirmed ? 'Included in final quote' : money(item.price === null ? null : item.price * item.quantity)}</strong>
        </li>;
      })}
    </ul>
  </section>;
}

function OrderPayment({ order, paymentConfig, onRefresh, onOrderChange }) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const { payment, deliveryQuote } = order;
  const canPay = order.status !== 'cancelled' && order.pricingConfirmed && order.grandTotal > 0 && !payment.isPaid &&
    !['test_paid', 'refunded'].includes(payment.status) && paymentConfig?.onlinePayments;

  const pay = async () => {
    setPaying(true);
    setError('');
    try {
      onOrderChange(await payStudioOrder(order));
    } catch (cause) {
      if (cause?.order) onOrderChange(cause.order);
      setError(cause.message);
      onRefresh();
    } finally {
      setPaying(false);
    }
  };

  const recheck = async () => {
    setPaying(true);
    setError('');
    try {
      const result = await studioRequest('/payments/recheck', { method: 'POST', body: { reference: order.reference, token: order.trackingToken } });
      onOrderChange(result.order);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setPaying(false);
    }
  };

  return <section className="ct-card ct-payment" id="ct-payment" tabIndex={-1} aria-labelledby="ct-payment-title">
    <h2 id="ct-payment-title"><CreditCard size={20} /> Payment</h2>
    <p className="ct-payment-status" data-paid={payment.isPaid}>{payment.label}</p>
    <dl className="ct-breakdown">
      {order.subtotal != null && <div><dt>Items subtotal</dt><dd>{money(order.subtotal)}</dd></div>}
      {order.discountAmount > 0 && <div><dt>Item discount {order.discountCode}</dt><dd>−{money(order.discountAmount)}</dd></div>}
      {deliveryQuote && <>
        <div><dt>Courier / Porter fee</dt><dd>{deliveryQuote.courierFee === 0 ? 'Free (₹0)' : money(deliveryQuote.courierFee)}</dd></div>
        {Number(deliveryQuote.packagingFee) > 0 && <div><dt>Protective packaging</dt><dd>{money(deliveryQuote.packagingFee)}</dd></div>}
        {deliveryQuote.freeDeliveryApplied && <div><dt>Eligible delivery offer</dt><dd>−{money(deliveryQuote.courierFee + deliveryQuote.packagingFee)}</dd></div>}
      </>}
      {order.shippingFee != null && <div><dt>{order.delivery.method === 'pickup' ? 'Studio pickup' : 'Delivery total'}</dt><dd>{order.shippingFee === 0 ? 'Free (₹0)' : money(order.shippingFee)}</dd></div>}
      <div className="ct-total"><dt>Order total</dt><dd>{money(order.grandTotal)}</dd></div>
    </dl>
    {!order.pricingConfirmed && <p className="ct-card-note">BISEN Studio is reviewing your specifications and will confirm the final total here before payment.</p>}
    {payment.paymentId && <p className="ct-card-note">Payment reference: {payment.paymentId}</p>}
    {payment.reference && <p className="ct-card-note">Receipt: {payment.reference}</p>}
    {payment.mode === 'test' && <p className="ct-card-note">Test payment only. No real money has been received.</p>}
    {error && <p className="ct-notice" role="alert">{error}</p>}
    {canPay && <button className="ct-button ct-primary" type="button" disabled={paying} onClick={pay}>
      {paying ? 'Opening payment…' : paymentConfig.paymentMode === 'test' ? 'Open test checkout' : 'Pay securely · ' + money(order.grandTotal)}<ArrowUpRight size={15} />
    </button>}
    {payment.method === 'razorpay' && payment.status === 'pending' && <button className="ct-button" type="button" disabled={paying} onClick={recheck}>
      <RefreshCw size={15} /> Recheck payment
    </button>}
  </section>;
}

function OrderDelivery({ order }) {
  const { delivery, productionWindow } = order;
  const pickup = delivery.method === 'pickup';
  const expected = delivery.expectedDate && new Date(delivery.expectedDate + 'T12:00:00').toLocaleDateString('en-IN', { dateStyle: 'long' });
  const courierName = delivery.courier || delivery.provider || '';
  return <section className="ct-card ct-delivery" aria-labelledby="ct-delivery-title">
    <h2 id="ct-delivery-title"><Truck size={20} /> {pickup ? 'Lucknow studio pickup' : 'Delivery'}</h2>
    {pickup && <>
      <p><strong>Free collection from BISEN Studio</strong></p>
      <p className="ct-card-note">{BUSINESS_CONFIG.location.workshopAddress}<br />{BUSINESS_CONFIG.contact.hours.weekdays}</p>
    </>}
    <dl className="ct-breakdown">
      <div><dt>Expected {pickup ? 'pickup' : 'delivery'}</dt><dd>{expected || 'To be confirmed'}</dd></div>
      {!pickup && courierName && <div><dt>Delivery partner</dt><dd>{courierName}</dd></div>}
      {delivery.awb && <div><dt>AWB / consignment</dt><dd>{delivery.awb}</dd></div>}
    </dl>
    {pickup && (
      <div className="ct-delivery-actions">
        <a className="ct-button" href={BUSINESS_CONFIG.location.googleMapsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={14} /> Maps</a>
        <a className="ct-button" href={`tel:${BUSINESS_CONFIG.contact.phone.replace(/\s+/g, '')}`}><Phone size={14} /> Call studio</a>
      </div>
    )}
    {!pickup && productionWindow && <p className="ct-card-note">Typical dispatch in {productionWindow.dispatchMinDays}–{productionWindow.dispatchMaxDays} working days after artwork approval and file checks. Lucknow local orders ship via Porter; outside Lucknow via surface/air courier.</p>}
    {delivery.trackingUrl ? <a className="ct-button ct-primary" href={delivery.trackingUrl} target="_blank" rel="noopener noreferrer">Track with courier <ArrowUpRight size={15} /></a> :
      !pickup && order.status !== 'cancelled' && <p className="ct-card-note">Courier tracking link appears once dispatched.</p>}
  </section>;
}

function CustomerNextStep({ order, paymentConfig }) {
  if (order.status === 'cancelled') return null;
  let tone = 'info';
  let title = '';
  let body = '';
  let action = null;

  if (order.artwork?.required && order.artwork?.status === 'awaiting_approval') {
    tone = 'attention';
    title = 'Your artwork proof is ready for approval';
    body = 'Open Files & artwork below to download your studio proof and approve it so we can start printing.';
    action = <button type="button" className="ct-button ct-primary" onClick={() => document.getElementById('ct-files')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Review &amp; approve proof <ArrowRight size={15} /></button>;
  } else if (!order.pricingConfirmed) {
    title = 'Quote in progress with BISEN Studio';
    body = 'We are checking your requirements and delivery details. Your confirmed price and payment option will appear right here shortly.';
  } else if (order.status === 'ready' && order.delivery?.method === 'pickup') {
    tone = 'attention';
    title = 'Your order is ready for studio pickup!';
    body = `${BUSINESS_CONFIG.location.workshopAddress} (${BUSINESS_CONFIG.contact.hours.weekdays})`;
    action = <a className="ct-button ct-primary" href={BUSINESS_CONFIG.location.googleMapsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={15} /> Get directions</a>;
  } else if (order.status === 'dispatched') {
    title = 'Your order has been dispatched';
    body = [order.delivery?.courier || order.delivery?.provider || 'On the way', order.delivery?.awb && `AWB: ${order.delivery.awb}`].filter(Boolean).join(' · ');
    if (order.delivery?.trackingUrl) {
      action = <a className="ct-button ct-primary" href={order.delivery.trackingUrl} target="_blank" rel="noopener noreferrer">Track shipment <ArrowUpRight size={15} /></a>;
    }
  } else if (!order.payment?.isPaid && !['test_paid', 'refunded'].includes(order.payment?.status) && order.grandTotal > 0 && paymentConfig?.onlinePayments) {
    tone = 'attention';
    title = `Quote confirmed: ${money(order.grandTotal)}`;
    body = 'Complete your prepaid payment below or confirm with the studio on WhatsApp to begin production.';
    action = <button type="button" className="ct-button ct-primary" onClick={() => document.getElementById('ct-payment')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>View payment options <ArrowRight size={15} /></button>;
  } else if (order.payment?.isPaid && ['confirmed', 'design_approved', 'printing'].includes(order.status)) {
    title = 'Everything looks good';
    body = 'Your order is queued with our workshop team. Updates appear automatically here.';
  } else {
    return null;
  }

  return <section className="ct-next-step" data-tone={tone} role="status" aria-live="polite">
    <div>
      {tone === 'attention' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
      <div><strong>{title}</strong><p>{body}</p></div>
    </div>
    {action && <div className="ct-next-actions">{action}</div>}
  </section>;
}

function UpdateHistory({ history }) {
  return <details className="ct-card ct-history">
    <summary><Clock3 size={20} /> Studio update history <ChevronDown size={16} /></summary>
    <ol>
      {[...history].reverse().map((event, index) => <li key={event.at + '-' + index}>
        <strong>{event.title}</strong>
        <time dateTime={event.at}>{date(event.at)}</time>
        {event.note && <p>{event.note}</p>}
      </li>)}
    </ol>
  </details>;
}

const ORDER_SHORTCUTS = [
  ['ct-items', 'Order items', Package],
  ['ct-files', 'Files & artwork', FolderOpen],
  ['ct-support', 'Get help', MessageCircle],
];

export function CustomerOrderStatus({ order, paymentConfig, refreshing, onRefresh, onOrderChange }) {
  return <>
    <OrderOverview order={order} refreshing={refreshing} onRefresh={onRefresh} />
    <CustomerNextStep order={order} paymentConfig={paymentConfig} />
    <nav className="ct-shortcuts" aria-label="Order shortcuts">
      {ORDER_SHORTCUTS.map(([id, label, Icon]) => <button className="ct-button" key={id} type="button" onClick={() => document.getElementById(id)?.focus()}>
        <Icon size={16} /> {label} <ChevronRight size={15} />
      </button>)}
    </nav>
    <div className="ct-layout">
      <OrderProgress order={order} />
      <aside className="ct-secondary-column" aria-label="Payment, delivery and updates">
        <OrderPayment order={order} paymentConfig={paymentConfig} onRefresh={onRefresh} onOrderChange={onOrderChange} />
        <OrderDelivery order={order} />
        <UpdateHistory history={order.history} />
        <a className="ct-button ct-whatsapp" href={studioHelpUrl(order.reference)} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={16} /> Chat with the studio <ArrowUpRight size={15} />
        </a>
      </aside>
      <div className="ct-primary-column">
        <OrderItems order={order} />
        <div id="ct-files" aria-label="Original files and artwork" tabIndex={-1}>
          <OrderFilesPanel order={order} onUpdated={onOrderChange} />
        </div>
        <div id="ct-support" aria-label="Changes, returns and help" tabIndex={-1}>
          <OrderSupport order={order} onUpdated={onOrderChange} />
        </div>
      </div>
    </div>
  </>;
}

function TrackingSearch({ reference, phone, setReference, setPhone, onSubmit, busy }) {
  return <form className="ct-card ct-search" onSubmit={onSubmit} noValidate>
    <label htmlFor="ct-reference">Order reference</label>
    <div className="ct-input"><Package size={17} />
      <input id="ct-reference" value={reference} maxLength={40} onChange={event => setReference(event.target.value)} placeholder="e.g. ALN-123456" autoCapitalize="characters" autoComplete="off" spellCheck={false} />
    </div>
    <label htmlFor="ct-phone">Checkout mobile number</label>
    <div className="ct-input"><ShieldCheck size={17} />
      <input id="ct-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={18} value={phone} onChange={event => setPhone(event.target.value)} placeholder="10-digit mobile number" />
    </div>
    <button className="ct-button ct-primary" type="submit" disabled={busy}>
      {busy ? 'Finding your order…' : 'Track my order'} <ArrowRight size={17} />
    </button>
  </form>;
}

function CustomerTrackingView({ initialReference, initialLookup }) {
  const [, setParams] = useSearchParams();
  const [reference, setReference] = useState(initialReference);
  const [phone, setPhone] = useState(initialLookup?.phone || '');
  const [credentials, setCredentials] = useState(() => {
    if (initialLookup?.reference === initialReference) return initialLookup;
    const token = getInitialToken(initialReference);
    return initialReference && token ? { reference: initialReference, token } : null;
  });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(Boolean(credentials));
  const [refresh, setRefresh] = useState(0);
  const [config, setConfig] = useState(null);
  const [recent, setRecent] = useState(() => typeof window === 'undefined' ? [] : rememberedStudioOrders());
  const [showLookup, setShowLookup] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    studioRequest('/public/config', { signal: controller.signal }).then(setConfig).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!credentials) return;
    const controller = new AbortController();
    let first = true;
    let inProgress = false;
    let currentCredentials = credentials;

    const load = async () => {
      if (inProgress || (document.hidden && !first)) return;
      inProgress = true;
      if (first) setBusy(true);
      try {
        const result = await studioRequest('/track', { method: 'POST', body: currentCredentials, signal: controller.signal });
        if (controller.signal.aborted) return;
        setOrder(result.order);
        setError('');
        currentCredentials = { reference: result.order.reference, token: result.order.trackingToken };
        rememberStudioOrder(result.order);
        setRecent(rememberedStudioOrders());
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause.message);
      } finally {
        if (!controller.signal.aborted) setBusy(false);
        first = false;
        inProgress = false;
      }
    };

    load();
    const interval = setInterval(load, 15000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [credentials, refresh]);

  const lookup = value => {
    setError('');
    setBusy(true);
    setOrder(null);
    setShowLookup(false);
    setParams({ id: value.reference }, { state: { trackingLookup: value } });
    setCredentials(value);
  };

  const submit = event => {
    event.preventDefault();
    const id = reference.trim().replace(/^#/, '').toUpperCase();
    if (!/^ALN-(?:WA-)?[A-Z0-9]{6,16}$/.test(id)) {
      setError('Enter the full ALN order reference from checkout or the studio.');
      return;
    }
    const token = getInitialToken(id);
    if (!token && !/^(?:\+?91[\s-]?)?[6-9][\d\s-]{9,14}$/.test(phone.trim())) {
      setError('Enter the mobile number used for this order.');
      return;
    }
    lookup(token ? { reference: id, token } : { reference: id, phone });
  };

  const oldOrders = !order && readOrderStore().orders;
  const searchForm = <TrackingSearch {...{ reference, phone, setReference, setPhone, busy }} onSubmit={submit} />;
  const toggleLookup = () => {
    if (!showLookup) {
      setReference('');
      setPhone('');
    }
    setShowLookup(!showLookup);
  };

  return <div className="ct-page">
    <div className="ct-shell">
      <div className="ct-toolbar">
        <nav aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">Track your order</span>
        </nav>
        {order && <button type="button" className="ct-button" aria-expanded={showLookup} aria-controls="ct-other-order" onClick={toggleLookup}>
          <Search size={15} /> Find another order
        </button>}
      </div>
      {!order && !(busy && credentials) && <div className="ct-lookup">
        <header className="ct-lookup-intro">
          <span className="ct-lookup-icon"><Package size={28} /></span>
          <h1>Track your BISEN Studio order</h1>
          <p>Enter your order reference and mobile number to see live workshop status, approve artwork proofs, pay online, or track Porter / courier delivery.</p>
          <p>Find your ALN reference in your order confirmation or ask the studio for your private tracking link.</p>
        </header>
        {searchForm}
      </div>}
      {order && <div id="ct-other-order" className="ct-other-order" hidden={!showLookup}>{searchForm}</div>}
      {error && <div className="ct-notice ct-lookup-error" role="alert">
        <strong>{order && !showLookup ? 'Showing your last saved update' : 'Please check your order details'}</strong>
        <p>{error}</p>
        <a href={studioHelpUrl(reference || order?.reference)} target="_blank" rel="noopener noreferrer">Ask the studio for help <ArrowUpRight size={14} /></a>
      </div>}
      {!order && busy && <p className="ct-card ct-loading" role="status"><RefreshCw size={17} /> Finding your order…</p>}
      {order && <CustomerOrderStatus key={order.reference} order={order} paymentConfig={config} refreshing={busy}
        onRefresh={() => { setBusy(true); setRefresh(value => value + 1); }}
        onOrderChange={value => {
          setOrder(value);
          setCredentials({ reference: value.reference, token: value.trackingToken });
        }}
      />}
      {!order && !busy && recent.length > 0 && <section className="ct-card ct-recent">
        <h2>Recently opened on this device</h2>
        <div className="ct-actions">
          {recent.slice(0, 6).map(item => <button className="ct-button" key={item.reference} type="button"
            onClick={() => { setReference(item.reference); lookup({ reference: item.reference, token: item.trackingToken }); }}>
            <Package size={15} /> {item.reference} <ArrowRight size={15} />
          </button>)}
        </div>
      </section>}
      {oldOrders?.length > 0 && !busy && <details className="ct-card ct-older">
        <summary>Older requests saved in this browser <ChevronDown size={15} /></summary>
        <p>These requests were saved before connected tracking was added.</p>
        {oldOrders.map(item => <a key={item.orderId} href={studioHelpUrl(item.orderId)} target="_blank" rel="noopener noreferrer">
          {item.orderId} · Ask the studio <ArrowUpRight size={14} />
        </a>)}
      </details>}
    </div>
  </div>;
}

export default function CustomerTrackingPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const reference = (params.get('id') || '').replace(/^#/, '').toUpperCase();
  return <CustomerTrackingView key={reference + '|' + location.hash} initialReference={reference} initialLookup={location.state?.trackingLookup} />;
}
