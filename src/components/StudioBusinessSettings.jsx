import React, { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Check, ChevronDown, Clock3, Database, LockKeyhole, Plus,
  RefreshCw, ShieldCheck, Tag, Truck, UsersRound,
} from 'lucide-react';
import { studioRequest } from '../utils/studioApi';
import { useBusinessRules } from './BusinessRulesProvider';
import { COMMERCE_TYPES } from '../data/businessRules';
import './StudioBusinessSettings.css';

const PANELS = [
  ['delivery', 'Delivery & pickup', Truck],
  ['policies', 'Production & refunds', Clock3],
  ['coupons', 'Coupons', Tag],
  ['grievance', 'Grievance desk', UsersRound],
  ['backups', 'Backups & retention', Database],
];

const PRODUCT_LABELS = {
  custom_frame: 'Custom frames',
  photo_prints: 'Photo prints',
  birthday_card: 'Birthday cards',
  itra_perfume: 'Itra perfumes',
  gallery_wall: 'Gallery walls',
  pvc_card: 'PVC cards',
  islamic_art: 'Islamic art',
};

const date = value => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const editRules = rules => ({ ...rules, shipping: { ...rules.shipping, freePincodes: rules.shipping.freePincodes.join(', ') } });

function SettingsCard({ title, children }) {
  return <section className="sb-card">
    <h2>{title}</h2>
    {children}
  </section>;
}

function NumberField({ label, value, onChange, min = 0, max = 100000 }) {
  return <label className="sb-field">
    <span>{label}</span>
    <input type="number" required min={min} max={max} step={1} value={value}
      onChange={event => onChange(event.target.value === '' ? '' : event.target.valueAsNumber)} />
  </label>;
}

function Toggle({ label, checked, onChange }) {
  return <label className="sb-toggle">
    <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
    <span>{label}</span>
  </label>;
}

function CouponRule({ coupon, change, remove }) {
  const discount = coupon.kind === 'percent' ? coupon.value + '%' : '₹' + coupon.value;

  return <details className="sb-coupon">
    <summary>
      <Tag size={16} />
      <strong>{coupon.code || 'New coupon'}</strong>
      <span className="sb-pill" data-enabled={coupon.enabled}>{coupon.enabled ? 'Enabled' : 'Disabled'}</span>
      {coupon.value !== '' && <span className="sb-coupon-value">{discount} off</span>}
      <ChevronDown className="sb-chevron" size={16} />
    </summary>
    <div className="sb-coupon-body">
      <div className="sb-grid">
        <label className="sb-field"><span>Code</span><input required pattern="[A-Z0-9]{3,24}" title="Use 3 to 24 letters or numbers" value={coupon.code} maxLength={24} onChange={event => change('code', event.target.value.toUpperCase())} /></label>
        <label className="sb-field"><span>Discount type</span><select value={coupon.kind} onChange={event => change('kind', event.target.value)}><option value="percent">Percentage</option><option value="fixed">Fixed rupees</option></select></label>
        {[
          ['value', 'Discount value', 1, coupon.kind === 'percent' ? 100 : 100000],
          ['maxDiscount', 'Maximum discount (₹)', 1, 100000],
          ['minSubtotal', 'Minimum item subtotal (₹)', 0, 1000000],
          ['perMobileLimit', 'Uses per mobile', 1, 100],
        ].map(([key, label, min, max]) => <NumberField key={key} label={label} min={min} max={max} value={coupon[key]} onChange={value => change(key, value)} />)}
        <label className="sb-field"><span>Expiry <small>Optional</small></span><input type="date" value={coupon.expires} onChange={event => change('expires', event.target.value)} /></label>
      </div>
      <div className="sb-toggles">
        {[['enabled', 'Enabled'], ['firstOrderOnly', 'First order only'], ['excludeDiscounted', 'Exclude discounted sets']].map(([key, label]) =>
          <Toggle key={key} label={label} checked={coupon[key]} onChange={value => change(key, value)} />)}
      </div>
      <fieldset className="sb-products">
        <legend>Eligible products</legend>
        <div className="sb-toggles">
          {COMMERCE_TYPES.map(type => <Toggle key={type} label={PRODUCT_LABELS[type]} checked={coupon.eligibleTypes.includes(type)}
            onChange={checked => change('eligibleTypes', checked ? [...coupon.eligibleTypes, type] : coupon.eligibleTypes.filter(item => item !== type))} />)}
        </div>
      </fieldset>
      <button type="button" className="sb-remove" onClick={remove}>Remove coupon rule</button>
    </div>
  </details>;
}

function BackupPanel({ maintenance, snapshot, operation }) {
  const busy = Boolean(operation) || snapshot?.busy;
  const latest = snapshot?.backups[0];
  const verification = snapshot?.lastRestoreCheck;

  return <SettingsCard title="Private backups">
    <p>Each snapshot includes the order database, its matching key and the original files it references. Keep a protected copy on another disk or off-site.</p>
    <div className="sb-actions">
      <button type="button" className="sp-primary" disabled={busy} onClick={() => maintenance('/studio/backups')}>
        <Database size={16} /> {operation === '/studio/backups' ? 'Creating backup…' : 'Create verified backup'}
      </button>
      <button type="button" className="sp-secondary" disabled={busy || !latest} onClick={() => maintenance('/studio/backups/verify', { id: latest.id })}>
        <ShieldCheck size={16} /> {operation === '/studio/backups/verify' ? 'Testing restore…' : 'Test latest backup restore'}
      </button>
    </div>
    {verification && <p className="sb-verification"><Check size={16} /><span>Restore verified {date(verification.verifiedAt)} · {verification.orders} order records · {verification.files} files</span></p>}
    <h3>Recent snapshots</h3>
    {latest ? <ul className="sb-snapshots">
      {snapshot.backups.map(backup => <li key={backup.id}>
        <Database size={17} />
        <div><strong><time dateTime={backup.createdAt}>{date(backup.createdAt)}</time></strong><small>{backup.fileCount} original, proof or evidence files · {backup.retentionDays}-day policy</small></div>
        <span>{(backup.bytes / 1024 / 1024).toFixed(2)} MB</span>
      </li>)}
    </ul> : <p className="sb-empty">No backup snapshots yet. Create one to enable a restore check.</p>}
    <div className="sb-cleanup">
      <h3>Retention cleanup</h3>
      <p>Cleanup permanently removes expired working files and backup snapshots using the saved retention rules.</p>
      <button type="button" className="sp-secondary" disabled={busy} onClick={() => maintenance('/studio/retention/run')}>
        {operation === '/studio/retention/run' ? 'Running cleanup…' : 'Run configured retention cleanup'}
      </button>
    </div>
  </SettingsCard>;
}

export default function StudioBusinessSettings() {
  const [rules, setRules] = useState(null);
  const [savedRules, setSavedRules] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('delivery');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { refresh } = useBusinessRules();

  const reload = useCallback(signal => Promise.all([
    studioRequest('/studio/business', { signal }),
    studioRequest('/studio/backups', { signal }),
  ]).then(([business, backups]) => {
    if (signal?.aborted) return;
    const editable = editRules(business.rules);
    setRules(editable);
    setSavedRules(editable);
    setSnapshot(backups);
    setPassword('');
  }).catch(cause => {
    if (!signal?.aborted) setError(cause.message);
  }).finally(() => {
    if (!signal?.aborted) setLoading(false);
  }), []);

  const refreshSettings = () => {
    setLoading(true);
    setError('');
    setMessage('');
    reload();
  };

  useEffect(() => {
    const controller = new AbortController();
    reload(controller.signal);
    return () => controller.abort();
  }, [reload]);

  const busy = loading || submitting || Boolean(operation);
  const dirty = rules && JSON.stringify(rules) !== JSON.stringify(savedRules);
  const update = (group, key, value) => {
    setRules(previous => ({ ...previous, [group]: { ...previous[group], [key]: value } }));
    setMessage('');
  };
  const editCoupons = change => {
    setRules(previous => ({ ...previous, coupons: change(previous.coupons) }));
    setMessage('');
  };

  const save = async event => {
    event.preventDefault();
    if (busy) return;
    const invalid = event.currentTarget.querySelector('input:invalid, textarea:invalid, select:invalid');
    if (invalid) {
      const panelId = invalid.closest('[data-sb-panel]')?.dataset.sbPanel;
      if (panelId && panelId !== activeTab) flushSync(() => setActiveTab(panelId));
      const disclosure = invalid.closest('details');
      if (disclosure) disclosure.open = true;
      invalid.reportValidity();
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const shipping = { ...rules.shipping, freePincodes: rules.shipping.freePincodes.split(/[\s,]+/).filter(Boolean) };
      const result = await studioRequest('/studio/business', { method: 'PUT', body: { rules: { ...rules, shipping }, password } });
      const editable = editRules(result.rules);
      setRules(editable);
      setSavedRules(editable);
      setPassword('');
      await refresh();
      setMessage('Business rules saved. New checkout requests use these settings. Existing quotes retain their recorded amounts.');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSubmitting(false);
    }
  };

  const maintenance = async (path, body = {}) => {
    if (busy || snapshot?.busy) return;
    setOperation(path);
    setError('');
    setMessage('');
    try {
      const result = await studioRequest(path, { method: 'POST', body });
      setSnapshot(result);
      setMessage(result.result?.restored ? 'Restore check passed on a separate temporary copy.' :
        result.backup ? 'Private backup created and checksum-verified.' : 'Retention check completed.');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setOperation('');
    }
  };

  const number = (group, key, label, min, max) => <NumberField label={label} value={rules[group][key]} min={min} max={max} onChange={value => update(group, key, value)} />;
  const handleTabKey = (event, index) => {
    const displacements = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1, Home: -index, End: PANELS.length - 1 - index };
    const step = displacements[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = (index + step + PANELS.length) % PANELS.length;
    setActiveTab(PANELS[next][0]);
    event.currentTarget.parentElement.children[next].focus();
  };

  const addCoupon = () => {
    editCoupons(coupons => {
      let code = 'NEWCODE';
      for (let suffix = 2; coupons.some(coupon => coupon.code === code); suffix++) code = 'NEWCODE' + suffix;
      return [...coupons, { code, enabled: false, kind: 'fixed', value: 50, maxDiscount: 50, minSubtotal: 499, firstOrderOnly: false, perMobileLimit: 1, expires: '', eligibleTypes: ['photo_prints'], excludeDiscounted: true }];
    });
  };

  const panels = rules && {
    delivery: <>
      <SettingsCard title="Delivery & studio pickup">
        <Toggle label="Allow free pickup from the Lucknow studio" checked={rules.shipping.pickupEnabled} onChange={value => update('shipping', 'pickupEnabled', value)} />
        <div className="sb-grid">
          {number('shipping', 'pvcStarting', 'PVC card starting delivery estimate (₹)')}
          {number('shipping', 'printsStarting', 'Photo print starting delivery estimate (₹)')}
        </div>
        <p className="sb-note">Starting rates are estimates. Quote the actual courier and packaging charges per order.</p>
      </SettingsCard>
      <SettingsCard title="Free delivery offer">
        <div className="sb-grid">
          {number('shipping', 'freeThreshold', 'Minimum item subtotal (₹)')}
          {number('shipping', 'freeMaxCharge', 'Maximum courier + packaging cost (₹)')}
        </div>
        <p className="sb-note">Set the maximum cost to 0 to disable the offer.</p>
        <label className="sb-field"><span>Eligible PIN codes</span><textarea rows={2} placeholder="e.g. 226001, 226021" value={rules.shipping.freePincodes} onChange={event => update('shipping', 'freePincodes', event.target.value)} /><small>Separate six-digit PIN codes with commas or line breaks.</small></label>
        <fieldset className="sb-products"><legend>Eligible products</legend><div className="sb-toggles">
          {['pvc_card', 'photo_prints'].map(type => <Toggle key={type} label={PRODUCT_LABELS[type]} checked={rules.shipping.freeTypes.includes(type)}
            onChange={checked => update('shipping', 'freeTypes', checked ? [...rules.shipping.freeTypes, type] : rules.shipping.freeTypes.filter(item => item !== type))} />)}
        </div></fieldset>
        <p className="sb-note">Every order item must be eligible. Frames and bulky sets are excluded. COD is unavailable.</p>
      </SettingsCard>
    </>,
    policies: <>
      <SettingsCard title="Production timeline">
        <p>Set the usual dispatch window after approval.</p>
        <div className="sb-grid">
          {number('production', 'dispatchMinDays', 'Minimum working days', 1, 90)}
          {number('production', 'dispatchMaxDays', 'Maximum working days', rules.production.dispatchMinDays || 1, 180)}
        </div>
      </SettingsCard>
      <SettingsCard title="Refunds & cancellations">
        <div className="sb-grid">
          {number('refunds', 'initiateBusinessDays', 'Business days to initiate an approved refund', 1, 30)}
          {number('refunds', 'damagePreferredHours', 'Preferred damage-reporting window (hours)', 1, 168)}
        </div>
        <label className="sb-field"><span>Cancellation guidance after production starts</span><textarea rows={4} required minLength={20} maxLength={1000} value={rules.refunds.postProductionNote} onChange={event => update('refunds', 'postProductionNote', event.target.value)} /></label>
        <p className="sb-note">The reporting window is a preference. Mandatory consumer rights still apply.</p>
      </SettingsCard>
    </>,
    coupons: <SettingsCard title="Coupon rules">
      <p>One coupon per order applies to eligible items. Active orders reserve first-order and per-mobile offers until cancelled. Custom bulk quotations are excluded.</p>
      {rules.coupons.map((coupon, index) => <CouponRule key={index} coupon={coupon}
        change={(key, value) => editCoupons(coupons => coupons.map((item, position) => position === index ? { ...item, [key]: value } : item))}
        remove={() => editCoupons(coupons => coupons.filter((_, position) => position !== index))}
      />)}
      {!rules.coupons.length && <p className="sb-empty">No coupon rules yet.</p>}
      <button type="button" className="sp-secondary sb-add-coupon" disabled={rules.coupons.length >= 20} onClick={addCoupon}><Plus size={16} /> Add coupon rule</button>
    </SettingsCard>,
    grievance: <SettingsCard title="Grievance desk">
      <p>These details appear on the public grievance page.</p>
      <div className="sb-grid">
        {[['name', 'Officer name'], ['designation', 'Designation']].map(([key, label]) => <label key={key} className="sb-field">
          <span>{label}</span><input required maxLength={120} value={rules.grievance[key]} onChange={event => update('grievance', key, event.target.value)} />
        </label>)}
      </div>
      <Link className="sp-secondary" to="/grievance" target="_blank" rel="noopener noreferrer">Open public grievance page <ArrowUpRight size={15} /></Link>
    </SettingsCard>,
    backups: <>
      <SettingsCard title="File & backup retention">
        <div className="sb-grid">
          {number('retention', 'workingDaysAfterDelivery', 'Remove working files after delivery (calendar days)', 1, 365)}
          {number('retention', 'backupDays', 'Expire backup snapshots after (calendar days)', 1, 90)}
        </div>
        <p className="sb-note">Open support requests and retention holds pause working-file cleanup. Previous retention commitments stay with the order.</p>
      </SettingsCard>
      <BackupPanel maintenance={maintenance} snapshot={snapshot} operation={operation} />
    </>,
  };

  return <div className="sb-page">
    <header className="sb-hero">
      <div>
        <h1>Business & backups</h1>
        <p>Manage checkout rules and private recovery copies.</p>
      </div>
      <button type="button" className="sb-reload" aria-label="Reload business settings" disabled={busy} onClick={refreshSettings}>
        <RefreshCw size={16} /> {loading ? 'Loading…' : 'Reload'}
      </button>
      {savedRules && <dl className="sb-summary">
        <div><dt>Free studio pickup</dt><dd>{savedRules.shipping.pickupEnabled ? 'Available' : 'Disabled'}</dd></div>
        <div><dt>Enabled coupons</dt><dd>{savedRules.coupons.filter(coupon => coupon.enabled).length}</dd></div>
        <div><dt>Latest backup</dt><dd>{snapshot?.backups[0] ? date(snapshot.backups[0].createdAt) : 'No snapshot yet'}</dd></div>
      </dl>}
    </header>
    {rules ? <form className="sb-layout" onSubmit={save} noValidate aria-busy={busy}>
      <div className="sb-tabs" role="tablist" aria-label="Business settings categories">
        {PANELS.map(([id, label, Icon], index) => <button type="button" role="tab" key={id} id={'sb-tab-' + id}
          aria-selected={activeTab === id} aria-controls={'sb-panel-' + id} tabIndex={activeTab === id ? 0 : -1}
          onClick={() => setActiveTab(id)} onKeyDown={event => handleTabKey(event, index)}>
          <Icon size={18} /> {label}
        </button>)}
      </div>
      <div className="sb-content">
        {error && <p className="sp-error" role="alert">{error}</p>}
        {message && <p className="sp-success" role="status"><Check size={16} /> {message}</p>}
        <fieldset className="sb-form-body" disabled={busy}>
          {PANELS.map(([id]) => <div key={id} role="tabpanel" id={'sb-panel-' + id} data-sb-panel={id}
            aria-labelledby={'sb-tab-' + id} hidden={activeTab !== id}>
            {panels[id]}
          </div>)}
          <div className="sb-card sb-save">
            <div>
              <h2><LockKeyhole size={18} /> Save settings</h2>
              <p aria-live="polite">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</p>
            </div>
            <label className="sb-field"><span>Studio password</span><input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
            <button type="submit" className="sp-primary">{submitting ? 'Saving…' : 'Save business rules'} <Check size={16} /></button>
          </div>
        </fieldset>
      </div>
    </form> : <div className="sb-card sb-initial" role={error ? 'alert' : 'status'}>{error || 'Opening business settings…'}</div>}
  </div>;
}
