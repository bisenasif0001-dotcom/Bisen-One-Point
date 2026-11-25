import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, CreditCard, LockKeyhole, MessageCircle, ShieldCheck, Truck, X } from 'lucide-react';
import OrderItemPreview from './OrderItemPreview';
import OrderFilesPanel from './OrderFilesPanel';
import { useBusinessRules } from './BusinessRulesProvider';
import { couponCalculation } from '../data/businessRules';
import { getWhatsAppUrl } from '../data/businessConfig';
import { buildOrderConfirmationMessage } from '../utils/orderRequestMessage';
import { autoSyncOrderOriginals, payStudioOrder, prepareCheckoutItems, rememberStudioOrder, studioRequest, trackingPath, trackingUrl } from '../utils/studioApi';
import { estimateShipping, isLucknowPincode } from '../utils/shippingCalculator';
import './DualCheckoutModal.css';

const PROFILE_KEY = 'alnoor_checkout_profile';
const money = value => value === null || value === undefined ? 'Quote pending' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const normalPhone = value => /^(?:91)?[6-9]\d{9}$/.test(value.replace(/\D/g, ''));

function readSavedProfile() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return null;
    return {
      name: String(raw.name || '').slice(0, 100),
      phone: String(raw.phone || '').slice(0, 18),
      email: String(raw.email || '').slice(0, 150),
      address: String(raw.address || '').slice(0, 500),
      apartment: String(raw.apartment || '').slice(0, 150),
      city: String(raw.city || '').slice(0, 100),
      state: String(raw.state || '').slice(0, 100),
      pincode: String(raw.pincode || '').slice(0, 6),
      fulfillment: raw.fulfillment === 'pickup' ? 'pickup' : 'courier',
    };
  } catch {
    return null;
  }
}

function saveProfile(form) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      apartment: form.apartment,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      fulfillment: form.fulfillment,
    }));
  } catch {
    // ignore storage errors
  }
}

function ConnectedCheckout({ onClose, initialTab, cartItems, discountCode, onClearCart }) {
  const { rules } = useBusinessRules();
  const [form, setForm] = useState(() => readSavedProfile() || {
    name: '', phone: '', email: '', address: '', apartment: '', city: '', state: '', pincode: '', fulfillment: 'courier',
  });
  const [methodChoice, setMethodChoice] = useState(null);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [busyStage, setBusyStage] = useState('');
  const [order, setOrder] = useState(null);
  const [designConfirmed, setDesignConfirmed] = useState(false);
  const [removeCoupon, setRemoveCoupon] = useState(false);
  const [fileSyncInfo, setFileSyncInfo] = useState(null);
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);

  const dialog = useRef(null), firstField = useRef(null), errorBox = useRef(null), idempotency = useRef(crypto.randomUUID());
  const custom = cartItems.some(item => (item.type === 'custom_frame' && item.configuration?.includePrint !== false) || ['photo_prints', 'birthday_card', 'gallery_wall', 'pvc_card'].includes(item.type));
  const effectiveCode = removeCoupon ? '' : discountCode;
  const items = order?.items || cartItems;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponPreview = effectiveCode
    ? couponCalculation({
        rules,
        code: effectiveCode,
        subtotal,
        items: cartItems.map(item => ({ ...item, discounted: (item.type === 'birthday_card' && Number(item.configuration?.cardCount) > 1) || (item.type === 'pvc_card' && Number(item.discountPercent) > 0) })),
      })
    : { discountAmount: 0, error: '' };
  const liveDiscount = couponPreview.error ? 0 : couponPreview.discountAmount;
  const liveShipping = estimateShipping({ items: cartItems, subtotal, discountAmount: liveDiscount, fulfillment: form.fulfillment, pincode: form.pincode, rules });
  const allItemsPriced = cartItems.length > 0 && cartItems.every(item => item.price !== null && item.price !== undefined);
  const liveGrandTotal = allItemsPriced && liveShipping.fee !== null ? Math.max(0, subtotal - liveDiscount) + liveShipping.fee : null;
  const totals = order || {
    subtotal,
    discountAmount: liveDiscount,
    shippingFee: liveShipping.fee,
    grandTotal: liveGrandTotal,
  };
  const deliveryProvider = order?.delivery?.provider || liveShipping.provider;
  const deliveryLabel = order?.deliveryQuote?.note || liveShipping.label;
  const onlineAvailable = Boolean(config?.onlinePayments && allItemsPriced && (liveGrandTotal ?? 0) > 0);
  const defaultMethod = onlineAvailable && initialTab !== 'whatsapp' ? 'razorpay' : 'studio';
  const method = methodChoice ? (methodChoice === 'razorpay' && !onlineAvailable ? 'studio' : methodChoice) : defaultMethod;

  useEffect(() => {
    const previous = document.body.style.overflow, focused = document.activeElement, root = document.getElementById('root'), wasInert = root?.hasAttribute('inert');
    root?.setAttribute('inert', ''); document.body.style.overflow = 'hidden'; firstField.current?.focus();
    const controller = new AbortController();
    studioRequest('/public/config', { signal: controller.signal }).then(setConfig).catch(() => {});
    return () => { controller.abort(); document.body.style.overflow = previous; if (!wasInert) root?.removeAttribute('inert'); focused?.focus?.(); };
  }, []);

  useEffect(() => {
    const keydown = event => {
      if (busy) return;
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'Tab' && dialog.current) {
        const nodes = [...dialog.current.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(node => node.getClientRects().length);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown); return () => document.removeEventListener('keydown', keydown);
  }, [busy, onClose]);

  const update = (key, value) => {
    setForm(previous => {
      const next = { ...previous, [key]: value };
      if (key === 'pincode' && /^[1-9]\d{5}$/.test(value) && isLucknowPincode(value)) {
        if (!next.city.trim()) next.city = 'Lucknow';
        if (!next.state.trim()) next.state = 'Uttar Pradesh';
      }
      return next;
    });
    setErrors(previous => ({ ...previous, [key]: undefined }));
    setError('');
    idempotency.current = crypto.randomUUID();
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your full name.';
    if (!normalPhone(form.phone)) next.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.fulfillment !== 'pickup') {
      for (const key of ['address', 'city', 'state']) if (!form[key].trim()) next[key] = 'Complete this delivery field.';
      if (!/^[1-9]\d{5}$/.test(form.pincode)) next.pincode = 'Enter a six-digit PIN code.';
    }
    if (custom && !designConfirmed) next.design = 'Confirm your preview & crop details above before placing the order.';
    setErrors(next);
    if (Object.keys(next).length) {
      setError('Please check the highlighted field below.');
      requestAnimationFrame(() => document.getElementById(`cc-${Object.keys(next)[0]}`)?.focus());
      return false;
    }
    return true;
  };

  const draft = async () => ({
    items: await prepareCheckoutItems(cartItems),
    customer: form,
    fulfillment: form.fulfillment,
    discountCode: effectiveCode,
    designConfirmed,
  });

  const submitExpressCheckout = async event => {
    event?.preventDefault();
    if (busy || (!order && !validate())) return;
    setBusy(true);
    setError('');
    try {
      saveProfile(form);
      let saved = order;
      let syncPromise = Promise.resolve({ uploaded: 0, expected: 0 });
      if (!saved) {
        setBusyStage('Saving your order…');
        const result = await studioRequest('/orders', {
          method: 'POST',
          headers: { 'Idempotency-Key': idempotency.current },
          body: await draft(),
        });
        saved = result.order;
        setOrder(saved);
        rememberStudioOrder(saved);
        onClearCart?.();
        dialog.current?.scrollTo({ top: 0, behavior: 'instant' });
        syncPromise = autoSyncOrderOriginals(saved);
      }

      if (method === 'razorpay' && config?.onlinePayments && saved.pricingConfirmed && saved.grandTotal > 0) {
        setBusyStage('Opening secure checkout…');
        const paid = await payStudioOrder(saved);
        saved = { ...saved, ...paid, customer: saved.customer, items: saved.items };
        setOrder(saved);
      }

      setBusyStage('Attaching full-resolution print files…');
      const syncResult = await syncPromise;
      if (syncResult.expected > 0) {
        setFileSyncInfo(syncResult);
        setFilesRefreshKey(k => k + 1);
      }
    } catch (cause) {
      if (cause?.order) {
        setOrder(previous => (previous ? { ...previous, ...cause.order, customer: previous.customer, items: previous.items } : previous));
      }
      setError(cause.message);
      requestAnimationFrame(() => errorBox.current?.scrollIntoView({ block: 'center', behavior: 'instant' }));
    } finally {
      setBusy(false);
      setBusyStage('');
    }
  };

  const field = (key, label, options = {}) => (
    <label className={`cc-field ${options.wide ? 'cc-wide' : ''}`} htmlFor={`cc-${key}`}>
      <span>{label}{options.optional && <small>Optional</small>}</span>
      <input
        ref={key === 'name' ? firstField : undefined}
        id={`cc-${key}`}
        type={options.type || 'text'}
        autoComplete={options.autoComplete}
        inputMode={options.inputMode}
        placeholder={options.placeholder}
        maxLength={options.maxLength || 150}
        value={form[key]}
        onChange={event => update(key, event.target.value)}
        required={!options.optional}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `cc-${key}-error` : undefined}
      />
      {errors[key] && <small className="cc-field-error" id={`cc-${key}-error`}>{errors[key]}</small>}
    </label>
  );

  const share = order ? getWhatsAppUrl(`${buildOrderConfirmationMessage(order)}\n\nMy private tracking link: ${trackingUrl(order)}`) : '';

  const primaryBtnLabel = busy
    ? (busyStage || 'Processing…')
    : method === 'razorpay' && onlineAvailable
      ? (config?.paymentProvider === 'sandbox'
          ? `Pay via Local Test Checkout · ${money(liveGrandTotal)}`
          : `Pay Securely with Razorpay · ${money(liveGrandTotal)}`)
      : liveGrandTotal === null
        ? 'Save Request & Get Studio Quote'
        : `Place Order · ${money(liveGrandTotal)}`;

  return (
    <div className="cc-overlay" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="cc-title">
      <header className="cc-header">
        <span className="cc-brand">BISEN<small>FRAME &amp; PHOTO PRINT STUDIO</small></span>
        <span><LockKeyhole size={14} />Express secure checkout</span>
        <button disabled={busy} className="cc-icon" onClick={onClose} aria-label="Close checkout"><X size={23} /></button>
      </header>

      <div className="cc-shell">
        <div className="cc-heading">
          <span className="cc-kicker">{order ? 'YOUR REQUEST HAS REACHED THE STUDIO' : 'ONE-SCREEN EXPRESS CHECKOUT'}</span>
          <h1 id="cc-title">{order ? 'Your order is saved.' : 'Complete your order.'}</h1>
          <p>
            {order
              ? 'Your tracking link is active below. Any uploaded print photos have been synced automatically.'
              : 'Enter delivery details and pay on one screen — your original photos attach automatically.'}
          </p>
        </div>

        <div className="cc-layout">
          <div className="cc-main">
            {order ? (
              <>
                <section className="cc-card cc-success">
                  <span className="cc-success-icon"><Check size={26} /></span>
                  <span className="cc-kicker">ORDER REFERENCE</span>
                  <h2>{order.orderId}</h2>
                  <p>
                    {order.pricingConfirmed
                      ? 'Your confirmed order amount is recorded with BISEN Studio.'
                      : 'Our Lucknow studio will confirm your complete quote here shortly.'}{' '}
                    Every print file is checked before production starts.
                  </p>
                  {fileSyncInfo && fileSyncInfo.uploaded > 0 && (
                    <div className="cc-payment-status is-paid" style={{ marginBottom: 10 }}>
                      <CheckCircle2 size={17} />
                      <span>
                        {fileSyncInfo.uploaded} original full-resolution {fileSyncInfo.uploaded === 1 ? 'photo' : 'photos'} attached automatically
                      </span>
                    </div>
                  )}
                  <div className={`cc-payment-status ${order.payment.isPaid ? 'is-paid' : ''}`}>
                    <ShieldCheck size={17} />
                    <span>{order.payment.label}</span>
                  </div>
                  <dl>
                    <div><dt>Final amount</dt><dd>{money(order.grandTotal)}</dd></div>
                    <div><dt>Studio status</dt><dd>{order.statusLabel}</dd></div>
                  </dl>
                  {error && <div ref={errorBox} className="cc-error" role="alert">{error}</div>}
                  <Link className="cc-primary" to={trackingPath(order)} onClick={onClose}>
                    Track my order<ArrowRight size={16} />
                  </Link>
                  {!order.payment.isPaid && !['test_paid', 'refunded'].includes(order.payment.status) && config?.onlinePayments && order.pricingConfirmed && (
                    <button
                      className="cc-secondary"
                      disabled={busy}
                      onClick={() => {
                        setMethodChoice('razorpay');
                        setBusy(true);
                        setError('');
                        payStudioOrder(order)
                          .then(paid => setOrder(previous => ({ ...previous, ...paid, customer: previous.customer, items: previous.items })))
                          .catch(cause => {
                            if (cause?.order) setOrder(previous => (previous ? { ...previous, ...cause.order, customer: previous.customer, items: previous.items } : previous));
                            setError(cause.message);
                          })
                          .finally(() => setBusy(false));
                      }}
                    >
                      <CreditCard size={16} />
                      {busy ? 'Opening payment…' : config.paymentMode === 'test' ? 'Open test checkout' : 'Pay securely with Razorpay'}
                    </button>
                  )}
                  <a className="cc-secondary" href={share} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={16} />Share on WhatsApp with studio<ArrowUpRight size={14} />
                  </a>
                  {order.payment.mode === 'test' && <small>Test mode only. No real payment has been received.</small>}
                </section>
                <OrderFilesPanel key={filesRefreshKey} order={order} onUpdated={value => setOrder(previous => ({ ...previous, ...value }))} />
              </>
            ) : (
              <form className="cc-card" onSubmit={submitExpressCheckout} noValidate>
                <h2>1. Contact &amp; delivery</h2>
                <p>Use your active WhatsApp / mobile number so you can track live updates.</p>

                <div className="cc-fields">
                  {field('name', 'Full name', { autoComplete: 'name', wide: true, placeholder: 'Your full name' })}
                  {field('phone', 'Mobile number', { autoComplete: 'tel', type: 'tel', inputMode: 'tel', maxLength: 18, placeholder: '10-digit mobile number' })}
                  {field('email', 'Email address', { autoComplete: 'email', type: 'email', optional: true, placeholder: 'For receipt (optional)' })}
                </div>

                <fieldset className="cc-delivery">
                  <legend>2. Delivery or studio pickup</legend>
                  <label data-active={form.fulfillment === 'courier'}>
                    <input type="radio" name="cc-fulfillment" value="courier" checked={form.fulfillment === 'courier'} onChange={() => update('fulfillment', 'courier')} />
                    <span>
                      <strong>Porter (Lucknow) / Pan-India Courier</strong>
                      <small>
                        {liveShipping.confirmed && form.fulfillment === 'courier'
                          ? `${liveShipping.provider} · ${liveShipping.fee === 0 ? 'Free' : money(liveShipping.fee)} — ${liveShipping.label}`
                          : liveShipping.estimated
                            ? `Lucknow Porter ${liveShipping.lucknowFee === 0 ? 'Free' : money(liveShipping.lucknowFee)} · Pan-India Courier ${liveShipping.panIndiaFee === 0 ? 'Free' : money(liveShipping.panIndiaFee)} (enter PIN below)`
                            : 'Lucknow local (226xxx) delivers via Porter; Pan-India via surface/air courier.'}
                      </small>
                    </span>
                  </label>
                  {rules.shipping.pickupEnabled && (
                    <label data-active={form.fulfillment === 'pickup'}>
                      <input type="radio" name="cc-fulfillment" value="pickup" checked={form.fulfillment === 'pickup'} onChange={() => update('fulfillment', 'pickup')} />
                      <span>
                        <strong>Lucknow studio pickup · Free (₹0)</strong>
                        <small>Shop 31–32, Milan Tower, Kursi Road, Alkapuri Colony, Lucknow</small>
                      </span>
                    </label>
                  )}
                </fieldset>

                {form.fulfillment === 'courier' && (
                  <div className="cc-fields" style={{ marginTop: 12 }}>
                    {field('pincode', '6-digit PIN code', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6, placeholder: 'e.g. 226022' })}
                    {field('city', 'City', { autoComplete: 'address-level2', placeholder: 'City' })}
                    {field('address', 'House / flat, street & area', { autoComplete: 'street-address', wide: true, maxLength: 500, placeholder: 'Complete delivery address' })}
                    {field('apartment', 'Landmark', { autoComplete: 'address-line2', optional: true, placeholder: 'Nearby landmark (optional)' })}
                    {field('state', 'State', { autoComplete: 'address-level1', placeholder: 'State' })}
                  </div>
                )}

                <fieldset className="cc-delivery cc-express-methods">
                  <legend>3. Payment method</legend>
                  <div className="cc-methods">
                    <label data-active={method === 'razorpay'} className={!onlineAvailable ? 'is-unavailable' : ''}>
                      <input
                        type="radio"
                        name="cc-method"
                        checked={method === 'razorpay'}
                        disabled={busy || !onlineAvailable}
                        onChange={() => setMethodChoice('razorpay')}
                      />
                      <CreditCard size={20} />
                      <span>
                        <strong>
                          Pay online with Razorpay{' '}
                          {config?.onlinePayments && config.paymentMode === 'test'
                            ? (config.paymentProvider === 'sandbox' ? '· Local Test' : '· Test')
                            : ''}
                        </strong>
                        <small>
                          {!config?.onlinePayments
                            ? 'Available when online checkout is enabled in Studio Payments.'
                            : !allItemsPriced
                              ? 'Custom quote items are confirmed by the studio before online payment.'
                              : config.paymentProvider === 'sandbox'
                                ? 'Instant UPI, Card & NetBanking test simulator (no real money charged).'
                                : 'Instant UPI, Debit/Credit Cards & NetBanking.'}
                        </small>
                      </span>
                    </label>

                    <label data-active={method === 'studio'}>
                      <input
                        type="radio"
                        name="cc-method"
                        checked={method === 'studio'}
                        disabled={busy}
                        onChange={() => setMethodChoice('studio')}
                      />
                      <MessageCircle size={20} />
                      <span>
                        <strong>{!allItemsPriced ? 'Save request & get studio quote' : 'Confirm prepaid payment with studio'}</strong>
                        <small>Save your order &amp; get a tracking link to pay via UPI / WhatsApp assistance. COD is not offered.</small>
                      </span>
                    </label>
                  </div>
                </fieldset>

                {custom && (
                  <label className="cc-design-confirm">
                    <input
                      id="cc-design"
                      type="checkbox"
                      checked={designConfirmed}
                      onChange={event => {
                        setDesignConfirmed(event.target.checked);
                        setErrors(prev => ({ ...prev, design: undefined }));
                        idempotency.current = crypto.randomUUID();
                      }}
                    />
                    <span>I checked my preview, size, crop and personalisation details, and confirm them for printing.</span>
                  </label>
                )}
                {errors.design && <small className="cc-field-error">{errors.design}</small>}

                {effectiveCode && (
                  <div className="cc-coupon-review">
                    <span>Coupon applied: <strong>{effectiveCode}</strong> (−{money(liveDiscount)})</span>
                    <button type="button" className="cc-text-button" onClick={() => { setRemoveCoupon(true); idempotency.current = crypto.randomUUID(); setError(''); }}>
                      Remove coupon
                    </button>
                  </div>
                )}

                {error && <div ref={errorBox} className="cc-error" role="alert">{error}</div>}

                <button className="cc-primary" disabled={busy || !cartItems.length} type="submit">
                  <span>{primaryBtnLabel}</span>
                  <ArrowRight size={16} />
                </button>

                <small className="cc-review-note">
                  Original uploaded photos sync automatically on order creation. Read <Link to="/terms" target="_blank">Terms</Link>, <Link to="/privacy" target="_blank">Privacy</Link> &amp; <Link to="/cancellation" target="_blank">Cancellation</Link>.
                </small>
              </form>
            )}
          </div>

          <aside className="cc-card cc-summary">
            <span className="cc-kicker">YOUR ORDER SUMMARY</span>
            <h2>{cartItems.length || items.length} {(cartItems.length || items.length) === 1 ? 'item' : 'items'}</h2>
            <div className="cc-summary-items">
              {items.map((item, index) => (
                <article key={item.id || index}>
                  <div className="cc-item-preview"><OrderItemPreview item={item} /></div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{[item.size, item.finish, item.orientation].filter(Boolean).join(' · ')}</p>
                    <span>Qty {item.quantity}</span>
                    <strong>{money(item.price === null ? null : item.price * item.quantity)}</strong>
                  </div>
                </article>
              ))}
            </div>
            <dl>
              <div><dt>Items subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
              {totals.discountAmount > 0 && <div><dt>Coupon ({effectiveCode})</dt><dd>−{money(totals.discountAmount)}</dd></div>}
              <div>
                <dt>{(order?.delivery?.method || form.fulfillment) === 'pickup' ? 'Lucknow studio pickup' : deliveryProvider || 'Delivery (Porter / Courier)'}</dt>
                <dd>{totals.shippingFee === 0 ? 'Free (₹0)' : money(totals.shippingFee)}</dd>
              </div>
              <div className="cc-total">
                <dt>Complete amount</dt>
                <dd>{money(totals.grandTotal)}</dd>
              </div>
            </dl>
            <p className="cc-summary-note">
              <Truck size={15} />
              {totals.grandTotal === null
                ? 'Custom quote confirmed by studio before payment.'
                : (deliveryLabel || 'Live delivery calculated from your PIN / pickup selection.')}
            </p>
          </aside>
        </div>
      </div>
      <footer className="cc-footer">
        <LockKeyhole size={14} />Encrypted checkout · Original print files preserved at full resolution.
      </footer>
    </div>
  );
}

export default function DualCheckoutModal({ isOpen, ...props }) {
  return isOpen ? createPortal(<ConnectedCheckout {...props} />, document.body) : null;
}
