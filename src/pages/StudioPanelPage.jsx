import StudioBusinessSettings from '../components/StudioBusinessSettings';
import { QuoteEditor, StudioArtwork } from '../components/StudioOrderWorkflow';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clock3, Copy, CreditCard, ExternalLink, FolderOpen, Link2, LockKeyhole, LogOut, MapPin, Package, Plus, RefreshCw, Search, Settings2, ShieldCheck, SlidersHorizontal, Truck, UserRound, X } from 'lucide-react';
import { studioRequest, trackingUrl } from '../utils/studioApi';
import { birthdayOrderDetails } from '../utils/birthdayCards';
import { galleryOrderDetails } from '../utils/galleryWalls';
import { resolveAssetUrl } from '../utils/assetUrl';
import './StudioPanelPage.css';
import './StudioOrderEditor.css';

const STUDIO_STATUSES=[['received','Order received'],['confirmed','Order confirmed'],['design_approved','Design approved'],['printing','Printing & making'],['ready','Ready for collection / dispatch'],['dispatched','Dispatched'],['delivered','Delivered / collected'],['cancelled','Cancelled']];
const money=value=>value===null||value===undefined?'Quote pending':`₹${Number(value).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
const date=value=>new Date(value).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
function ErrorBox({error}){return error?<p className="sp-error" role="alert">{error}</p>:null;}
function Field({label,id,children,optional=false}){return <label className="sp-field" htmlFor={id}><span>{label}{optional&&<small>Optional</small>}</span>{children}</label>;}

function StudioBrand({ to }) {
  const logo = <img className="sp-brand-logo" src="/logo.png" alt="BISEN Frame & Photo Print" width={395} height={129} />;
  return to ? <Link className="sp-brand" to={to}>{logo}</Link> : <div className="sp-brand">{logo}</div>;
}

export function StudioAccess({session,onAuthenticated}){
  const [form,setForm]=useState({username:'',password:'',confirm:'',setupToken:''}),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const setup=session.setupRequired;
  const update=(key,value)=>{setForm(current=>({...current,[key]:value}));setError('');};
  const submit=async event=>{event.preventDefault();setError('');if(setup&&form.password!==form.confirm){setError('The two passwords must match.');return;}setBusy(true);try{await studioRequest(`/studio/${setup?'setup':'login'}`,{method:'POST',body:form});setForm({username:'',password:'',confirm:'',setupToken:''});onAuthenticated();}catch(cause){setError(cause.message);}finally{setBusy(false);}};
  return <div className="sp-access"><StudioBrand to="/" /><div className="sp-access-card"><span className="sp-icon-circle"><LockKeyhole size={25} strokeWidth={1.4}/></span><span className="sp-kicker">PRIVATE STUDIO ACCESS</span><h1>{setup?'Make this desk yours.':'Welcome to your studio.'}</h1><p>{setup?'Create your own login to manage orders, update customer tracking and connect Razorpay.':'Sign in to manage your orders and keep your customers up to date.'}</p><form onSubmit={submit}><Field id="sp-username" label="Studio username"><input id="sp-username" required autoComplete="username" minLength={3} maxLength={100} value={form.username} onChange={event=>update('username',event.target.value)}/></Field><Field id="sp-password" label="Password"><input id="sp-password" type="password" required minLength={setup?12:1} maxLength={200} autoComplete={setup?'new-password':'current-password'} value={form.password} onChange={event=>update('password',event.target.value)}/>{setup&&<small>Use at least 12 characters. Keep this login private.</small>}</Field>{setup&&<><Field id="sp-confirm" label="Confirm password"><input id="sp-confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={event=>update('confirm',event.target.value)}/></Field>{!session.localSetup&&<Field id="sp-setup-token" label="Deployment setup code"><input id="sp-setup-token" type="password" autoComplete="off" required value={form.setupToken} onChange={event=>update('setupToken',event.target.value)}/><small>Use the one-time setup code from your hosting environment.</small></Field>}</>}<ErrorBox error={error}/><button className="sp-primary" disabled={busy}>{busy?'Please wait…':setup?'Create studio access':'Sign in'}<ArrowRight size={16}/></button></form></div><Link className="sp-back" to="/"><ArrowLeft size={14}/> Back to the website</Link></div>;
}

export function PaymentSettings(){
  const [settings,setSettings]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saved,setSaved]=useState(false);
  const [form,setForm]=useState({mode:'test',keyId:'',keySecret:'',webhookSecret:'',enabled:false,password:'',goLiveConfirmed:false});
  useEffect(()=>{const controller=new AbortController();studioRequest('/studio/settings',{signal:controller.signal}).then(value=>{setSettings(value);setForm(current=>({...current,mode:value.mode,enabled:value.enabled,goLiveConfirmed:value.goLiveConfirmed}));}).catch(cause=>{if(cause.name!=='AbortError')setError(cause.message);});return()=>controller.abort();},[]);
  const update=(key,value)=>{setForm(current=>({...current,[key]:value}));setSaved(false);setError('');};
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{const result=await studioRequest('/studio/settings',{method:'PUT',body:form});setSettings(result);setForm(current=>({...current,keyId:'',keySecret:'',webhookSecret:'',password:''}));setSaved(true);}catch(cause){setError(cause.message);}finally{setBusy(false);}};
  return <section className="sp-settings"><div className="sp-section-heading"><div><span className="sp-kicker">PAYMENTS, CONNECTED PROPERLY</span><h2>Connect your Razorpay account.</h2><p>Customers pay in Razorpay’s secure checkout. Payment is recorded after server verification.</p></div><span className={`sp-badge ${settings?.enabled?'is-paid':''}`}>{settings?.enabled?`${settings.mode==='test'?'Test':'Live'} checkout enabled`:'Online payment off'}</span></div><div className="sp-settings-grid"><form className="sp-card" onSubmit={submit}><div className="sp-mode" role="group" aria-label="Razorpay mode">{['test','live'].map(mode=><button type="button" key={mode} aria-pressed={form.mode===mode} onClick={()=>update('mode',mode)}>{mode==='test'?'Test mode':'Live mode'}</button>)}</div><p className="sp-note">{form.mode==='test'?'Use Test Mode keys first. Verified test payments stay clearly labelled and do not count as money received.':'Use the Live Mode keys belonging to your approved Razorpay account.'}</p>{settings?.configured&&<p className="sp-saved-setting"><ShieldCheck size={15}/> Saved Key ID: {settings.keyId}. Leave secret fields blank to keep the current values.</p>}<Field id="sp-key-id" label="Razorpay Key ID"><input id="sp-key-id" autoComplete="off" placeholder={`rzp_${form.mode}_…`} value={form.keyId} onChange={event=>update('keyId',event.target.value)}/></Field><Field id="sp-key-secret" label="Razorpay Key Secret"><input id="sp-key-secret" type="password" autoComplete="new-password" value={form.keySecret} onChange={event=>update('keySecret',event.target.value)} placeholder={settings?.hasSecret?'Saved securely · Enter only to replace':''}/></Field><Field id="sp-webhook-secret" label="Webhook secret"><input id="sp-webhook-secret" type="password" autoComplete="new-password" value={form.webhookSecret} onChange={event=>update('webhookSecret',event.target.value)} placeholder={settings?.hasWebhookSecret?'Saved securely · Enter only to replace':'Choose a separate secret of at least 16 characters'}/></Field><label className="sp-check"><input type="checkbox" checked={form.enabled} onChange={event=>update('enabled',event.target.checked)}/><span>Enable online payment at checkout</span></label>{form.mode==='live'&&<><label className="sp-check"><input type="checkbox" checked={form.goLiveConfirmed} onChange={event=>update('goLiveConfirmed',event.target.checked)}/><span>I have tested checkout, signature verification and webhook updates before enabling live payments.</span></label>{settings&&!settings.liveAllowed&&<p className="sp-notice">Live payments can be enabled after the website has its public HTTPS domain. Test checkout can be connected locally now.</p>}</>}<Field id="sp-settings-password" label="Confirm studio password"><input id="sp-settings-password" required type="password" autoComplete="current-password" value={form.password} onChange={event=>update('password',event.target.value)}/></Field><ErrorBox error={error}/>{saved&&<p className="sp-success" role="status"><Check size={16}/> Payment settings saved.</p>}<button className="sp-primary" disabled={busy}>{busy?'Saving…':'Save payment settings'}<ShieldCheck size={16}/></button></form><aside className="sp-card sp-payment-guide"><CreditCard size={31} strokeWidth={1.2}/><h3>A clear payment trail.</h3><ol><li><strong>Create the order</strong><p>The server checks catalogue prices and creates the Razorpay payment order.</p></li><li><strong>Customer completes payment</strong><p>UPI, cards and other available methods appear in Razorpay checkout.</p></li><li><strong>Verify before marking paid</strong><p>The server checks the signature, order amount and captured payment status.</p></li></ol><div className="sp-webhook"><strong>Webhook URL</strong><code>{settings?.webhookUrl||'Loading…'}</code><p>In Razorpay Dashboard, add this URL with the same webhook secret. Subscribe to payment.captured, payment.failed, payment.refunded and refund.processed.</p></div><p className="sp-note">A public URL is required for webhook delivery. Website credentials and payment secrets stay on the server; customers only receive the public checkout key.</p><a className="sp-text-link" href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer">Open Razorpay Dashboard <ExternalLink size={14}/></a></aside></div></section>;
}

function NewStudioOrder({onCreated,onCancel}){
  const [form,setForm]=useState({name:'',phone:'',email:'',title:'',quantity:'1',grandTotal:'',notes:'',requireArtwork:true}),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const update=(key,value)=>setForm(current=>({...current,[key]:value}));
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{const result=await studioRequest('/studio/orders',{method:'POST',body:{...form,customer:{name:form.name,phone:form.phone,email:form.email}}});onCreated(result.order);}catch(cause){setError(cause.message);}finally{setBusy(false);}};
  return <section className="sp-card sp-new-order"><div className="sp-section-heading"><div><span className="sp-kicker">WHATSAPP, WALK-IN OR CUSTOM REQUEST</span><h2>Add an order to the desk.</h2><p>A tracking reference is created when you save. You can confirm the final quote later.</p></div><button className="sp-icon-button" aria-label="Close new order" onClick={onCancel}><X size={19}/></button></div><form onSubmit={submit}><div className="sp-form-grid"><Field id="sp-new-name" label="Customer name"><input id="sp-new-name" required maxLength={100} value={form.name} onChange={event=>update('name',event.target.value)}/></Field><Field id="sp-new-phone" label="Customer mobile"><input id="sp-new-phone" required inputMode="tel" maxLength={18} value={form.phone} onChange={event=>update('phone',event.target.value)}/></Field><Field id="sp-new-email" label="Email" optional><input id="sp-new-email" type="email" value={form.email} onChange={event=>update('email',event.target.value)}/></Field><Field id="sp-new-title" label="Product / order description"><input id="sp-new-title" required maxLength={180} placeholder="e.g. School student PVC cards, front + back" value={form.title} onChange={event=>update('title',event.target.value)}/></Field><Field id="sp-new-qty" label="Quantity"><input id="sp-new-qty" required type="number" min={1} max={100000} step={1} value={form.quantity} onChange={event=>update('quantity',event.target.value)}/></Field><Field id="sp-new-total" label="Final total including delivery (₹)" optional><input id="sp-new-total" type="number" min={1} step="0.01" value={form.grandTotal} onChange={event=>update('grandTotal',event.target.value)} placeholder="Leave blank until quoted"/></Field></div><Field id="sp-new-notes" label="Order requirements" optional><textarea id="sp-new-notes" rows={3} maxLength={2000} value={form.notes} onChange={event=>update('notes',event.target.value)}/></Field><label className="sp-check"><input type="checkbox" checked={form.requireArtwork} onChange={event=>update('requireArtwork',event.target.checked)}/><span>Require customer artwork proof approval before production</span></label><ErrorBox error={error}/><button className="sp-primary" disabled={busy}>{busy?'Saving…':'Save order & create tracking reference'}<ArrowRight size={16}/></button></form></section>;
}

const ORDER_TABS = [
  ['details', 'Order details', Package],
  ['quote', 'Quote', CreditCard],
  ['artwork', 'Artwork & files', FolderOpen],
  ['timeline', 'Timeline', Clock3],
];

function OrderDetails({ order }) {
  const { customer } = order;
  const address = [customer.address, customer.apartment, customer.city, customer.state, customer.pincode].filter(Boolean).join(', ');
  const delivery = order.delivery.method === 'pickup' ? 'Studio pickup' : address || 'Delivery details pending';

  const requirements = item => {
    if (item.type === 'birthday_card') return birthdayOrderDetails(item);
    if (item.type === 'gallery_wall') return galleryOrderDetails(item);
    return [item.specialInstructions, item.personalisation?.specifications].filter(Boolean).join('\n');
  };

  return <section className="sp-editor-card">
    <h2>Customer & order details</h2>
    <dl className="sp-customer-details">
      <div>
        <dt><UserRound size={15} /> Contact</dt>
        <dd>{customer.name}</dd>
        <dd><a href={'tel:' + customer.phone}>{customer.phone}</a></dd>
        {customer.email && <dd><a href={'mailto:' + customer.email}>{customer.email}</a></dd>}
      </div>
      <div>
        <dt><MapPin size={15} /> Delivery</dt>
        <dd>{delivery}</dd>
      </div>
    </dl>
    <h3 className="sp-items-title">Order items <span>{order.items.length}</span></h3>
    <ul className="sp-editor-items">
      {order.items.map((item, index) => {
        const specs = [item.size, item.finish, item.orientation, item.glass].filter(Boolean).join(' · ');
        const notes = requirements(item);
        return <li key={index}>
          <span className="sp-item-preview">{item.image ? <img src={resolveAssetUrl(item.image)} alt="" /> : <Package size={21} />}</span>
          <div>
            <h4>{item.title}</h4>
            {specs && <p>{specs}</p>}
            <p>Qty {item.quantity}</p>
            {notes && <details className="sp-item-requirements">
              <summary>Personalisation & requirements</summary>
              <pre>{notes}</pre>
            </details>}
          </div>
          <strong>{money(item.price === null ? null : item.price * item.quantity)}</strong>
        </li>;
      })}
    </ul>
    {order.items.some(item => item.image) && <p className="sp-editor-help">Check the original files before printing.</p>}
  </section>;
}

function TrackingCard({ order }) {
  const [feedback, setFeedback] = useState('');
  const url = trackingUrl(order);
  const linkDetails = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback('Tracking link copied.');
    } catch {
      linkDetails.current.open = true;
      setFeedback('Select the link below to copy it.');
    }
  };

  return <section className="sp-editor-card sp-tracking-card">
    <h2><Link2 size={21} /> Customer tracking</h2>
    <p>Share the private link or give the customer their order reference to use with their mobile number.</p>
    <div className="sp-editor-actions">
      <button className="sp-secondary" type="button" onClick={copy}><Copy size={15} /> Copy tracking link</button>
      <a className="sp-secondary" href={url} target="_blank" rel="noopener noreferrer">Open customer view <ExternalLink size={14} /></a>
    </div>
    {feedback && <p className="sp-editor-feedback" role="status">{feedback}</p>}
    <details ref={linkDetails}>
      <summary>Show private URL</summary>
      <code>{url}</code>
    </details>
  </section>;
}

function orderUpdateFields(order) {
  return {
    status: order.status,
    publicNote: order.publicNote || '',
    privateNotes: order.privateNotes || '',
    delivery: { courier: '', awb: '', trackingUrl: '', expectedDate: '', ...order.delivery },
    grandTotal: order.grandTotal ?? '',
    recordOfflinePayment: false,
    paymentReference: '',
    filesReviewed: Boolean(order.filesReviewed),
    legalHold: Boolean(order.legalHold),
  };
}

function OrderUpdateForm({ order, onSaved }) {
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const defaults = orderUpdateFields(order);
  const form = { ...defaults, ...draft, delivery: { ...defaults.delivery, ...draft.delivery } };

  const update = (key, value) => {
    setDraft(current => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const updateDelivery = (key, value) => {
    setDraft(current => ({ ...current, delivery: { ...current.delivery, [key]: value } }));
    setSaved(false);
  };

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await studioRequest('/studio/orders/' + order.reference, {
        method: 'PATCH',
        body: { ...form, updatedAt: order.updatedAt },
      });
      onSaved(result.order);
      setDraft({});
      setSaved(true);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  return <form
    className="sp-editor-card sp-order-update"
    aria-labelledby="sp-update-heading"
    onSubmit={submit}
    onInvalidCapture={event => {
      const group = event.target.closest('details');
      if (group) group.open = true;
    }}
  >
    <h2 id="sp-update-heading" tabIndex={-1}><SlidersHorizontal size={21} /> Update order</h2>
    <Field id="sp-status" label="Order status">
      <select id="sp-status" value={form.status} onChange={event => update('status', event.target.value)}>
        {STUDIO_STATUSES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
    </Field>
    <Field id="sp-public-note" label="Customer-visible update" optional>
      <textarea id="sp-public-note" rows={3} maxLength={2000} value={form.publicNote} placeholder="e.g. Your design is approved. Printing starts tomorrow." onChange={event => update('publicNote', event.target.value)} />
    </Field>
    <Field id="sp-expected" label="Expected pickup / delivery date" optional>
      <input id="sp-expected" type="date" value={form.delivery.expectedDate} onChange={event => updateDelivery('expectedDate', event.target.value)} />
    </Field>
    <details className="sp-update-group">
      <summary><Truck size={16} /> Courier & tracking <ChevronDown size={15} /></summary>
      <div className="sp-update-fields">
        <div className="sp-editor-fields">
          <Field id="sp-courier" label="Courier" optional><input id="sp-courier" value={form.delivery.courier} maxLength={100} onChange={event => updateDelivery('courier', event.target.value)} /></Field>
          <Field id="sp-awb" label="AWB / consignment no." optional><input id="sp-awb" value={form.delivery.awb} maxLength={100} onChange={event => updateDelivery('awb', event.target.value)} /></Field>
        </div>
        <Field id="sp-courier-link" label="Courier tracking link" optional><input id="sp-courier-link" type="url" placeholder="https://…" value={form.delivery.trackingUrl} onChange={event => updateDelivery('trackingUrl', event.target.value)} /></Field>
      </div>
    </details>
    <details className="sp-update-group">
      <summary><LockKeyhole size={16} /> Payment & studio notes <ChevronDown size={15} /></summary>
      <div className="sp-update-fields">
        <Field id="sp-final-total" label="Final amount including delivery (₹)">
          <input id="sp-final-total" type="number" min={1} step="0.01" value={form.grandTotal} disabled={order.commerceVersion >= 2 || order.payment.method === 'razorpay' || order.payment.isPaid} onChange={event => update('grandTotal', event.target.value)} />
          <small>{order.commerceVersion >= 2 ? 'Manage the final amount in the Quote tab.' : 'Razorpay uses the confirmed total and locks it once checkout starts.'}</small>
        </Field>
        {!order.payment.isPaid && order.payment.method !== 'razorpay' && <>
          <label className="sp-check">
            <input type="checkbox" checked={form.recordOfflinePayment} onChange={event => update('recordOfflinePayment', event.target.checked)} />
            <span>Record payment received outside the website</span>
          </label>
          {form.recordOfflinePayment && <Field id="sp-offline-ref" label="Receipt / UPI / cash reference"><input id="sp-offline-ref" required maxLength={200} value={form.paymentReference} onChange={event => update('paymentReference', event.target.value)} /></Field>}
        </>}
        <label className="sp-check">
          <input type="checkbox" checked={form.filesReviewed} onChange={event => update('filesReviewed', event.target.checked)} />
          <span>Original files match the approved artwork</span>
        </label>
        <label className="sp-check">
          <input type="checkbox" checked={form.legalHold} onChange={event => update('legalHold', event.target.checked)} />
          <span>Pause working-file deletion for an unresolved issue or legal retention. Record the reason below.</span>
        </label>
        <Field id="sp-private-note" label="Internal studio note" optional>
          <textarea id="sp-private-note" rows={3} maxLength={5000} value={form.privateNotes} onChange={event => update('privateNotes', event.target.value)} />
          <small>Visible only to the studio.</small>
        </Field>
      </div>
    </details>
    {form.status === 'cancelled' && <p className="sp-cancel-note">Manage any refund separately in the Razorpay Dashboard.</p>}
    {error && <ErrorBox error={error} />}
    {saved && <p className="sp-success" role="status"><Check size={15} /> Customer tracking updated.</p>}
    <button type="submit" className="sp-primary" disabled={busy}><Check size={16} /> {busy ? 'Saving update…' : 'Save customer update'}</button>
  </form>;
}

export function StudioOrderEditor({ order, onSaved, onBack }) {
  const [activeTab, setActiveTab] = useState('details');

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
    details: <><OrderDetails order={order} /><TrackingCard order={order} /></>,
    quote: <QuoteEditor key={order.reference + '-' + order.pricingConfirmed + '-' + order.grandTotal} order={order} onUpdated={onSaved} />,
    artwork: <StudioArtwork order={order} onUpdated={onSaved} />,
    timeline: <section className="sp-editor-card">
      <h2>Order timeline</h2>
      <ol className="sp-editor-history">
        {[...order.history].reverse().map((event, index) => <li key={event.at + '-' + index}>
          <strong>{event.title}</strong>
          <time dateTime={event.at}>{date(event.at)}</time>
          {event.note && <p>{event.note}</p>}
        </li>)}
      </ol>
    </section>,
  };

  return <section className="sp-order-editor" aria-labelledby="sp-order-title">
    <button type="button" className="sp-editor-back" onClick={onBack}><ArrowLeft size={16} /> Back to orders</button>
    <header className="sp-editor-hero">
      <div className="sp-editor-identity">
        <p><Package size={16} /> Order placed <time dateTime={order.placedAt}>{date(order.placedAt)}</time></p>
        <h1 id="sp-order-title">{order.orderId}</h1>
        <span>{order.customer.name}</span>
      </div>
      <dl className="sp-editor-summary">
        <div>
          <dt>Order status</dt>
          <dd><span className="sp-editor-status" data-status={order.status}>{order.statusLabel}</span></dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd><span className="sp-editor-payment" data-paid={order.payment.isPaid}>{order.payment.label}</span></dd>
        </div>
        <div>
          <dt>Order total</dt>
          <dd>{money(order.grandTotal)}</dd>
        </div>
      </dl>
    </header>
    <button type="button" className="sp-secondary sp-editor-jump" onClick={() => document.getElementById('sp-update-heading')?.focus()}>
      <SlidersHorizontal size={16} /> Update order
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
        ><Icon size={17} /> {label}</button>)}
      </div>
      <div className="sp-editor-content">
        {ORDER_TABS.map(([id]) => <div key={id} role="tabpanel" id={'sp-panel-' + id} aria-labelledby={'sp-tab-' + id} hidden={activeTab !== id} tabIndex={0}>
          {panels[id]}
        </div>)}
      </div>
      <OrderUpdateForm order={order} onSaved={onSaved} />
    </div>
  </section>;
}

function StudioDesk({onLogout}){
  const [view,setView]=useState('orders'),[query,setQuery]=useState(''),[filter,setFilter]=useState(''),[offset,setOffset]=useState(0),[list,setList]=useState(null),[order,setOrder]=useState(null),[adding,setAdding]=useState(false),[busy,setBusy]=useState(true),[error,setError]=useState(''),[version,setVersion]=useState(0);
  const detailSequence=useRef(0);
  useEffect(()=>{if(view!=='orders'||order||adding)return;const controller=new AbortController(),timer=setTimeout(()=>{setBusy(true);studioRequest(`/studio/orders?q=${encodeURIComponent(query)}&status=${filter}&offset=${offset}`,{signal:controller.signal}).then(setList).catch(cause=>{if(cause.name!=='AbortError')setError(cause.message);}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});},250);return()=>{clearTimeout(timer);controller.abort();};},[view,query,filter,offset,version,order,adding]);
  const open=async reference=>{setBusy(true);setError('');const seq=++detailSequence.current;try{const result=await studioRequest(`/studio/orders/${reference}`);if(seq===detailSequence.current)setOrder(result.order);}catch(cause){setError(cause.message);}finally{setBusy(false);}};
  const logout=async()=>{try{await studioRequest('/studio/logout',{method:'POST'});onLogout();}catch(cause){setError(cause.message);}};
  const count=id=>list?.counts?.find(item=>item.status===id)?.count||0;
  return <><header className="sp-topbar"><StudioBrand to="/studio" /><nav aria-label="Studio sections"><button aria-current={view==='orders'?'page':undefined} onClick={()=>{setView('orders');setOrder(null);setAdding(false);}}><Package size={16}/> Orders</button><button aria-current={view==='payments'?'page':undefined} onClick={()=>{setView('payments');setOrder(null);setAdding(false);}}><Settings2 size={16}/> Payments</button><button aria-current={view==='business'?'page':undefined} onClick={()=>{setView('business');setOrder(null);setAdding(false);}}><ShieldCheck size={16}/> Business & backups</button></nav><div><Link to="/" className="sp-website">View website <ExternalLink size={13}/></Link><button className="sp-secondary" onClick={logout}><LogOut size={14}/> Sign out</button></div></header><div className="sp-desk"><ErrorBox error={error}/>{view==='business'?<StudioBusinessSettings/>:view==='payments'?<PaymentSettings/>:adding?<NewStudioOrder onCancel={()=>setAdding(false)} onCreated={value=>{setAdding(false);setOrder(value);setVersion(value=>value+1);}}/>:order?<StudioOrderEditor key={order.reference} order={order} onBack={()=>{setOrder(null);setVersion(value=>value+1);}} onSaved={setOrder}/>:<><div className="sp-section-heading"><div><span className="sp-kicker">A CLEAR VIEW OF YOUR WORKSHOP</span><h1>Your orders, together.</h1><p>Website orders arrive here. Add WhatsApp and walk-in orders to give every customer a tracking reference.</p></div><button className="sp-primary" onClick={()=>setAdding(true)}><Plus size={16}/> Add an order</button></div><div className="sp-stats"><div><span>Total orders</span><strong>{list?list.counts.reduce((total,item)=>total+item.count,0):'—'}</strong><Package size={19}/></div><div><span>Being prepared</span><strong>{list?count('confirmed')+count('design_approved')+count('printing'):'—'}</strong><Settings2 size={19}/></div><div><span>Ready to go</span><strong>{count('ready')}</strong><Check size={19}/></div><div><span>Dispatched</span><strong>{count('dispatched')}</strong><Truck size={19}/></div></div><div className="sp-order-tools"><div className="sp-search"><Search size={17}/><input aria-label="Search studio orders" placeholder="Order reference, customer or mobile…" value={query} onChange={event=>{setQuery(event.target.value);setOffset(0);}}/></div><select aria-label="Filter order status" value={filter} onChange={event=>{setFilter(event.target.value);setOffset(0);}}><option value="">All statuses</option>{STUDIO_STATUSES.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select><button className="sp-secondary" aria-label="Refresh orders" onClick={()=>setVersion(value=>value+1)}><RefreshCw size={16}/></button></div><section className="sp-orders" aria-label="Studio orders" aria-busy={busy}><div className="sp-list-heading"><span>ORDER / CUSTOMER</span><span>STUDIO STATUS</span><span>PAYMENT / TOTAL</span><span/></div>{list?.orders?.length?list.orders.map(item=><button className="sp-order-row" key={item.reference} onClick={()=>open(item.reference)}><span><strong>{item.orderId}</strong><small>{item.customer.name} · {item.customer.phone}</small><small>{date(item.placedAt)}</small></span><span className="sp-row-status"><i data-status={item.status}/>{item.statusLabel}</span><span><strong>{money(item.grandTotal)}</strong><small className={item.payment.isPaid?'sp-paid-text':''}>{item.payment.label}</small></span><ArrowRight size={16}/></button>):<div className="sp-empty"><Package size={31} strokeWidth={1.2}/><h2>{busy?'Loading your orders…':query||filter?'No matching orders.':'Your order desk is ready.'}</h2><p>{query||filter?'Try another reference or status.':'New checkout requests will appear here. You can also add a WhatsApp or walk-in order.'}</p></div>}</section>{list&&list.count>50&&<div className="sp-pagination"><button className="sp-secondary" disabled={offset===0} onClick={()=>setOffset(value=>Math.max(0,value-50))}><ArrowLeft size={14}/> Previous</button><span>{offset+1}–{Math.min(offset+50,list.count)} of {list.count}</span><button className="sp-secondary" disabled={offset+50>=list.count} onClick={()=>setOffset(value=>value+50)}>Next <ArrowRight size={14}/></button></div>}</>}</div></>;
}

export default function StudioPanelPage(){
  const [session,setSession]=useState(null),[error,setError]=useState('');
  const load=()=>{setError('');studioRequest('/studio/session').then(setSession).catch(cause=>setError(cause.message));};
  useEffect(()=>{const controller=new AbortController();studioRequest('/studio/session',{signal:controller.signal}).then(setSession).catch(cause=>{if(cause.name!=='AbortError')setError(cause.message);});return()=>controller.abort();},[]);
  return <div className="sp-page">{error?<div className="sp-access sp-unavailable"><h1>Let’s reconnect your studio.</h1><ErrorBox error={error}/><button className="sp-primary" onClick={load}><RefreshCw size={16}/> Try again</button></div>:!session?<div className="sp-access"><StudioBrand /><p>Opening your studio desk…</p></div>:session.authenticated?<StudioDesk onLogout={()=>setSession({...session,authenticated:false,setupRequired:false})}/>:<StudioAccess session={session} onAuthenticated={load}/>}</div>;
}
