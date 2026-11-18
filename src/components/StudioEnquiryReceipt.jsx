import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Mail, MessageCircle, Package } from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../data/businessConfig';
import { rememberStudioOrder, studioRequest, trackingPath, trackingUrl } from '../utils/studioApi';
import './StudioEnquiryReceipt.css';

export default function StudioEnquiryReceipt({ title, details, name, quantity = 1, itemType, onSaved, onEdit, privateFiles = false }) {
  const [phone, setPhone] = useState(''), [order, setOrder] = useState(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const key = useRef(crypto.randomUUID());
  const save = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await studioRequest('/enquiries', { method: 'POST', headers: { 'Idempotency-Key': key.current }, body: { title, details, quantity, itemType, customer: { name, phone } } });
      setOrder(result.order);
      rememberStudioOrder(result.order);
      onSaved?.(result.order);
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  if (!order) return <div className="enq-receipt"><form onSubmit={save}>
    <label htmlFor="enq-tracking-phone"><span>Mobile number for order tracking</span><input id="enq-tracking-phone" disabled={busy} type="tel" inputMode="tel" autoComplete="tel" required maxLength={18} value={phone} onChange={event => { setPhone(event.target.value); key.current = crypto.randomUUID(); setError(''); }} placeholder="Your 10-digit mobile number" /><small>Save your request to get a reference and see studio updates from any device.</small></label>
    {error && <p className="enq-error" role="alert">{error}</p>}
    <button className="enq-primary" disabled={busy} type="submit">{busy ? 'Saving your enquiry…' : 'Save enquiry & get tracking link'}<ArrowRight size={16} /></button>
    {onEdit && <button className="enq-email" type="button" disabled={busy} onClick={onEdit}><ArrowLeft size={14} /> Edit specifications</button>}
  </form></div>;

  const message = privateFiles ? '' : `${details}\n\nEnquiry reference: ${order.orderId}\nMy private tracking link: ${trackingUrl(order)}\nPlease confirm the quote and original artwork before printing.`;
  return <div className="enq-receipt">
    <div className="enq-saved" role="status"><Check size={18} /><span>Enquiry saved with the studio<strong>{order.orderId}</strong><small>Pricing is pending studio review. You can track updates on the website.</small></span></div>
    <Link className="enq-track" to={trackingPath(order)}><Package size={15} /> Track this enquiry <ArrowRight size={14} /></Link>
    {!privateFiles && <><a className="enq-primary" href={getWhatsAppUrl(message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Share artwork on WhatsApp <ArrowUpRight size={14} /></a><a className="enq-email" href={`mailto:${BUSINESS_CONFIG.contact.email}?subject=${encodeURIComponent(`${title} · ${order.orderId}`)}&body=${encodeURIComponent(message)}`}><Mail size={14} /> Or email this enquiry</a></>}
  </div>;
}
