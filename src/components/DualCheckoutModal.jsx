import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CreditCard, LockKeyhole, MessageCircle, Package, ShieldCheck, Truck, X } from 'lucide-react';
import OrderItemPreview from './OrderItemPreview';
import OrderFilesPanel from './OrderFilesPanel';
import { useBusinessRules } from './BusinessRulesProvider';
import { getWhatsAppUrl } from '../data/businessConfig';
import { buildOrderConfirmationMessage } from '../utils/orderRequestMessage';
import { payStudioOrder, prepareCheckoutItems, rememberStudioOrder, studioRequest, trackingPath } from '../utils/studioApi';
import './DualCheckoutModal.css';

const money = value => value === null || value === undefined ? 'Quote pending' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const normalPhone = value => /^(?:91)?[6-9]\d{9}$/.test(value.replace(/\D/g, ''));
function ConnectedCheckout({ onClose, initialTab, cartItems, discountCode, onClearCart }) {
  const { rules } = useBusinessRules();
  const [step, setStep] = useState(1), [form, setForm] = useState({ name: '', phone: '', email: '', address: '', apartment: '', city: '', state: '', pincode: '', fulfillment: 'courier' });
  const [method, setMethod] = useState('studio'), [config, setConfig] = useState(null), [error, setError] = useState(''), [errors, setErrors] = useState({}), [busy, setBusy] = useState(false), [order, setOrder] = useState(null), [quote, setQuote] = useState(null), [designConfirmed, setDesignConfirmed] = useState(false), [removeCoupon, setRemoveCoupon] = useState(false);
  const dialog = useRef(null), firstField = useRef(null), errorBox = useRef(null), idempotency = useRef(crypto.randomUUID());
  const custom = cartItems.some(item => ['custom_frame', 'photo_prints', 'birthday_card', 'gallery_wall'].includes(item.type));
  const effectiveCode = removeCoupon ? '' : discountCode;
  const items = order?.items || cartItems;
  const subtotal = cartItems.reduce((sum,item) => sum + item.price * item.quantity, 0);
  const totals = order || quote || { subtotal, discountAmount: 0, shippingFee: form.fulfillment === 'pickup' ? 0 : null, grandTotal: null };
  const payable = Boolean(config?.onlinePayments && (order || quote)?.pricingConfirmed !== false && (order?.grandTotal || quote?.grandTotal) > 0);
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
      if (event.key === 'Tab') {
        const nodes = [...dialog.current.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(node => node.getClientRects().length);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown); return () => document.removeEventListener('keydown', keydown);
  }, [busy, onClose]);
  const update = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: undefined })); setError(''); setQuote(null); idempotency.current = crypto.randomUUID(); };
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your full name.';
    if (!normalPhone(form.phone)) next.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.fulfillment !== 'pickup') { for (const key of ['address','city','state']) if (!form[key].trim()) next[key] = 'Complete this delivery field.'; if (!/^[1-9]\d{5}$/.test(form.pincode)) next.pincode = 'Enter a six-digit PIN code.'; }
    if (custom && !designConfirmed) next.design = 'Check your preview and confirm the design details below.';
    setErrors(next);
    if (Object.keys(next).length) { setError('Please check your details.'); requestAnimationFrame(() => document.getElementById(`cc-${Object.keys(next)[0]}`)?.focus()); return false; }
    return true;
  };
  const draft = async () => ({ items: await prepareCheckoutItems(cartItems), customer: form, fulfillment: form.fulfillment, discountCode: effectiveCode, designConfirmed });
  const next = async event => {
    event.preventDefault(); if (busy || !validate()) return; setBusy(true); setError('');
    try { const result = await studioRequest('/checkout/preview', { method: 'POST', body: await draft() }); setQuote(result.quote); setMethod(config?.onlinePayments && result.quote.grandTotal > 0 && initialTab !== 'whatsapp' ? 'razorpay' : 'studio'); setStep(2); dialog.current?.scrollTo({ top: 0, behavior: 'instant' }); }
    catch (cause) { setError(cause.message); } finally { setBusy(false); }
  };
  const place = async () => {
    if (busy || (!order && !validate())) return; setBusy(true); setError('');
    try {
      let saved = order;
      if (!saved) { const result = await studioRequest('/orders', { method: 'POST', headers: { 'Idempotency-Key': idempotency.current }, body: await draft() }); saved = result.order; setOrder(saved); rememberStudioOrder(saved); onClearCart?.(); dialog.current?.scrollTo({ top: 0, behavior: 'instant' }); }
      if (method === 'razorpay' && config?.onlinePayments && saved.pricingConfirmed && saved.grandTotal > 0) { const paid = await payStudioOrder(saved); setOrder({ ...saved, ...paid, customer: saved.customer, items: saved.items }); }
    } catch (cause) { setError(cause.message); requestAnimationFrame(() => errorBox.current?.scrollIntoView({ block: 'center', behavior: 'instant' })); } finally { setBusy(false); }
  };
  const field = (key, label, options = {}) => <label className={`cc-field ${options.wide ? 'cc-wide' : ''}`} htmlFor={`cc-${key}`}><span>{label}{options.optional && <small>Optional</small>}</span><input ref={key === 'name' ? firstField : undefined} id={`cc-${key}`} type={options.type || 'text'} autoComplete={options.autoComplete} inputMode={options.inputMode} maxLength={options.maxLength || 150} value={form[key]} onChange={event => update(key, event.target.value)} required={!options.optional} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `cc-${key}-error` : undefined} />{errors[key] && <small className="cc-field-error" id={`cc-${key}-error`}>{errors[key]}</small>}</label>;
  const share = order ? getWhatsAppUrl(`${buildOrderConfirmationMessage(order)}\n\nMy private tracking link: ${window.location.origin}${trackingPath(order)}`) : '';
  return <div className="cc-overlay" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="cc-title">
    <header className="cc-header"><span className="cc-brand">AL-NOOR<small>YOUR PRINT & FRAME STUDIO</small></span><span><LockKeyhole size={14} />Your order, securely connected</span><button disabled={busy} className="cc-icon" onClick={onClose} aria-label="Close checkout"><X size={23} /></button></header>
    <div className="cc-shell"><div className="cc-heading"><span className="cc-kicker">{order ? 'YOUR REQUEST HAS REACHED THE STUDIO' : 'A FEW DETAILS. THEN IT’S YOURS.'}</span><h1 id="cc-title">{order ? 'Your order is saved.' : 'Make it yours.'}</h1><p>{order ? 'Keep your reference, send original files and follow studio updates.' : 'Review your selections and get the complete amount before payment.'}</p></div>
      {!order && <nav className="cc-steps" aria-label="Checkout steps"><span aria-current={step === 1 ? 'step' : undefined}><b>01</b>Contact & delivery</span><ArrowRight size={14} /><span aria-current={step === 2 ? 'step' : undefined}><b>02</b>Review & payment</span></nav>}
      <div className="cc-layout"><div className="cc-main">{order ? <><section className="cc-card cc-success"><span className="cc-success-icon"><Check size={26} /></span><span className="cc-kicker">ORDER REFERENCE</span><h2>{order.orderId}</h2><p>{order.pricingConfirmed ? 'Your confirmed amount is saved with the studio.' : 'The studio will confirm the complete item and courier/packaging quote here before online payment.'} Production follows the required file checks and artwork approval.</p><div className={`cc-payment-status ${order.payment.isPaid ? 'is-paid' : ''}`}><ShieldCheck size={17} /><span>{order.payment.label}</span></div><dl><div><dt>Final amount</dt><dd>{money(order.grandTotal)}</dd></div><div><dt>Studio status</dt><dd>{order.statusLabel}</dd></div></dl>{error && <div ref={errorBox} className="cc-error" role="alert">{error}</div>}<Link className="cc-primary" to={trackingPath(order)} onClick={onClose}>Track my order<ArrowRight size={16} /></Link>{!order.payment.isPaid && !['test_paid','refunded'].includes(order.payment.status) && config?.onlinePayments && order.pricingConfirmed && <button className="cc-secondary" disabled={busy} onClick={() => { setMethod('razorpay'); setBusy(true); setError(''); payStudioOrder(order).then(paid => setOrder(previous => ({ ...previous, ...paid, customer: previous.customer, items: previous.items }))).catch(cause => setError(cause.message)).finally(() => setBusy(false)); }}><CreditCard size={16} />{busy ? 'Opening payment…' : config.paymentMode === 'test' ? 'Open test checkout' : 'Pay securely with Razorpay'}</button>}<a className="cc-secondary" href={share} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />Review details with the studio<ArrowUpRight size={14} /></a>{order.payment.mode === 'test' && <small>Test mode only. No real payment has been received.</small>}</section><OrderFilesPanel order={order} onUpdated={value => setOrder(previous => ({ ...previous, ...value }))} /></> : step === 1 ? <form className="cc-card" onSubmit={next} noValidate><h2>Contact & delivery.</h2><p>Use the mobile number you’ll use to track this order.</p><div className="cc-fields">{field('name','Full name',{autoComplete:'name',wide:true})}{field('phone','Mobile number',{autoComplete:'tel',type:'tel',inputMode:'tel',maxLength:18})}{field('email','Email address',{autoComplete:'email',type:'email',optional:true})}</div>
        <fieldset className="cc-delivery"><legend>How would you like to receive it?</legend><label><input type="radio" name="cc-fulfillment" value="courier" checked={form.fulfillment === 'courier'} onChange={() => update('fulfillment','courier')} /><span><strong>Courier delivery</strong><small>Actual courier + packaging quote confirmed by the studio before payment</small></span></label>{rules.shipping.pickupEnabled && <label><input type="radio" name="cc-fulfillment" value="pickup" checked={form.fulfillment === 'pickup'} onChange={() => update('fulfillment','pickup')} /><span><strong>Lucknow studio pickup · Free</strong><small>Shop 31–32, Milan Tower, Kursi Road, Lucknow</small></span></label>}</fieldset>
        {form.fulfillment === 'courier' && <div className="cc-fields">{field('address','Street address',{autoComplete:'street-address',wide:true,maxLength:500})}{field('apartment','Apartment / landmark',{autoComplete:'address-line2',optional:true,wide:true})}{field('city','City',{autoComplete:'address-level2'})}{field('state','State',{autoComplete:'address-level1'})}{field('pincode','PIN code',{autoComplete:'postal-code',inputMode:'numeric',maxLength:6})}</div>}
        {custom && <label className="cc-design-confirm"><input id="cc-design" type="checkbox" checked={designConfirmed} onChange={event => {setDesignConfirmed(event.target.checked);idempotency.current=crypto.randomUUID();}} /><span>I checked the spelling, size, photo placement, crop and layout in my previews. I confirm these design details for this order.</span></label>}{errors.design && <small className="cc-field-error">{errors.design}</small>}
        {effectiveCode && <div className="cc-coupon-review"><span>Coupon: {effectiveCode} · eligibility checked on review</span><button type="button" className="cc-text-button" onClick={() => {setRemoveCoupon(true);idempotency.current=crypto.randomUUID();setError('');}}>Remove coupon</button></div>}{error && <div className="cc-error" role="alert">{error}</div>}<button className="cc-primary" disabled={busy} type="submit">{busy ? 'Checking amount…' : 'Review my order'}<ArrowRight size={16} /></button></form> : <section className="cc-card"><div className="cc-card-heading"><h2>One last look.</h2><button className="cc-text-button" disabled={busy} onClick={() => setStep(1)}>Edit details</button></div><div className="cc-address"><strong>{form.name}</strong><p>{form.phone}{form.email ? ` · ${form.email}` : ''}</p><p>{form.fulfillment === 'pickup' ? 'Free collection from the Lucknow studio' : [form.address,form.apartment,form.city,form.state,form.pincode].filter(Boolean).join(', ')}</p></div><h3>Payment & next steps</h3><div className="cc-methods"><label data-active={method === 'razorpay'} className={!payable ? 'is-unavailable' : ''}><input type="radio" name="cc-method" checked={method === 'razorpay'} disabled={busy || !payable} onChange={() => setMethod('razorpay')} /><CreditCard size={20} /><span><strong>Pay online with Razorpay {config?.onlinePayments && config.paymentMode === 'test' ? '· Test' : ''}</strong><small>{!config?.onlinePayments ? 'Available when the studio connects Razorpay.' : !quote?.grandTotal ? 'Available after the studio confirms your complete delivery quote.' : 'UPI, cards and supported net banking in hosted checkout.'}</small></span></label><label data-active={method === 'studio'}><input type="radio" name="cc-method" checked={method === 'studio'} disabled={busy} onChange={() => setMethod('studio')} /><MessageCircle size={20} /><span><strong>{quote?.grandTotal === null ? 'Save request & get the complete quote' : 'Confirm prepaid payment with the studio'}</strong><small>COD is not offered. Original files and any revised artwork are checked before production.</small></span></label></div><div className="cc-originals-note"><Package size={17} /><p>After saving, upload original print files privately to this order. They are preserved without automatic changes.</p></div>{error && <div ref={errorBox} className="cc-error" role="alert">{error}</div>}<button className="cc-primary" disabled={busy || !cartItems.length} onClick={place}>{busy ? 'Saving / verifying your order…' : method === 'razorpay' ? `Continue to Razorpay · ${money(quote?.grandTotal)}` : quote?.grandTotal === null ? 'Save request & get delivery quote' : 'Save order & confirm with studio'}<ArrowRight size={16} /></button><small className="cc-review-note">Your request, design confirmation and current policy version are recorded. Read <Link to="/terms" target="_blank">Terms</Link>, <Link to="/privacy" target="_blank">Privacy</Link> and <Link to="/cancellation" target="_blank">Cancellation</Link>.</small><button className="cc-text-button cc-back" disabled={busy} onClick={() => setStep(1)}><ArrowLeft size={14} />Back to contact details</button></section>}</div>
        <aside className="cc-card cc-summary"><span className="cc-kicker">YOUR PERSONALISED SELECTIONS</span><h2>Your order.</h2><div className="cc-summary-items">{items.map((item,index) => <article key={item.id || index}><div className="cc-item-preview"><OrderItemPreview item={item} /></div><div><h3>{item.title}</h3><p>{[item.size,item.finish,item.orientation].filter(Boolean).join(' · ')}</p><span>Qty {item.quantity}</span><strong>{money(item.price === null ? null : item.price * item.quantity)}</strong></div></article>)}</div><dl><div><dt>Items subtotal</dt><dd>{money(totals.subtotal)}</dd></div>{totals.discountAmount > 0 && <div><dt>Item discount {effectiveCode}</dt><dd>−{money(totals.discountAmount)}</dd></div>}<div><dt>{(order?.delivery?.method || form.fulfillment) === 'pickup' ? 'Store pickup' : 'Courier & packaging'}</dt><dd>{money(totals.shippingFee)}</dd></div><div className="cc-total"><dt>Complete order amount</dt><dd>{money(totals.grandTotal)}</dd></div></dl><p className="cc-summary-note"><Truck size={15} />{totals.grandTotal === null ? 'Save for the final quote. No online payment opens for an unconfirmed amount.' : 'Review the complete amount before payment.'}</p></aside>
      </div></div><footer className="cc-footer"><LockKeyhole size={14} />Card details are entered only in Razorpay’s hosted checkout.</footer>
  </div>;
}
export default function DualCheckoutModal({ isOpen, ...props }) { return isOpen ? createPortal(<ConnectedCheckout {...props} />, document.body) : null; }
