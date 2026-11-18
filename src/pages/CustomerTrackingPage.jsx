import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Clock3, Copy,
  CreditCard, FolderOpen, MessageCircle, Package, RefreshCw, Search, ShieldCheck, Truck,
} from 'lucide-react';
import OrderFilesPanel from '../components/OrderFilesPanel';
import OrderSupport from '../components/OrderSupport';
import { getWhatsAppUrl } from '../data/businessConfig';
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
        return <li key={index}>
          <span className="ct-item-icon"><Package size={20} /></span>
          <div>
            <h3>{item.title}</h3>
            {options && <p>{options}</p>}
            <p>Quantity {item.quantity}</p>
            {item.specialInstructions && <details>
              <summary>Requirements</summary>
              <pre>{item.specialInstructions}</pre>
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

  return <section className="ct-card ct-payment" aria-labelledby="ct-payment-title">
    <h2 id="ct-payment-title"><CreditCard size={20} /> Payment</h2>
    <p className="ct-payment-status" data-paid={payment.isPaid}>{payment.label}</p>
    <dl className="ct-breakdown">
      {order.subtotal != null && <div><dt>Items subtotal</dt><dd>{money(order.subtotal)}</dd></div>}
      {order.discountAmount > 0 && <div><dt>Item discount {order.discountCode}</dt><dd>−{money(order.discountAmount)}</dd></div>}
      {deliveryQuote && <>
        <div><dt>Quoted courier</dt><dd>{money(deliveryQuote.courierFee)}</dd></div>
        <div><dt>Protective packaging</dt><dd>{money(deliveryQuote.packagingFee)}</dd></div>
        {deliveryQuote.freeDeliveryApplied && <div><dt>Eligible delivery offer</dt><dd>−{money(deliveryQuote.courierFee + deliveryQuote.packagingFee)}</dd></div>}
      </>}
      {order.shippingFee != null && <div><dt>{order.delivery.method === 'pickup' ? 'Studio pickup' : 'Delivery total'}</dt><dd>{money(order.shippingFee)}</dd></div>}
      <div className="ct-total"><dt>Order total</dt><dd>{money(order.grandTotal)}</dd></div>
    </dl>
    {!order.pricingConfirmed && <p className="ct-card-note">The studio will confirm your total here before payment.</p>}
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
  return <section className="ct-card ct-delivery" aria-labelledby="ct-delivery-title">
    <h2 id="ct-delivery-title"><Truck size={20} /> {pickup ? 'Studio pickup' : 'Delivery'}</h2>
    {pickup && <p>Free collection from the Lucknow studio.</p>}
    <dl className="ct-breakdown">
      <div><dt>Expected {pickup ? 'pickup' : 'delivery'}</dt><dd>{expected || 'To be confirmed'}</dd></div>
      {delivery.courier && <div><dt>Courier</dt><dd>{delivery.courier}</dd></div>}
      {delivery.awb && <div><dt>AWB / consignment</dt><dd>{delivery.awb}</dd></div>}
    </dl>
    {!pickup && productionWindow && <p className="ct-card-note">Typical dispatch in {productionWindow.dispatchMinDays}–{productionWindow.dispatchMaxDays} working days after artwork approval and file checks. Courier travel time varies.</p>}
    {delivery.trackingUrl ? <a className="ct-button ct-primary" href={delivery.trackingUrl} target="_blank" rel="noopener noreferrer">Track with courier <ArrowUpRight size={15} /></a> :
      !pickup && order.status !== 'cancelled' && <p className="ct-card-note">Courier tracking appears after the studio adds dispatch details.</p>}
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
          <h1>Track your order</h1>
          <p>Enter your order reference and checkout mobile number to see status, payment and delivery updates.</p>
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
