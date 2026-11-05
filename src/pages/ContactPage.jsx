import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../data/businessConfig';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Custom Photo Framing (A5 to A1)',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [inquiryUrl, setInquiryUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `*INQUIRY FROM CONTACT FORM:*\n\n` +
      `👤 *Name:* ${formData.name}\n` +
      `📞 *Phone:* ${formData.phone}\n` +
      `📧 *Email:* ${formData.email}\n` +
      `📌 *Service Needed:* ${formData.service}\n` +
      `💬 *Message:* ${formData.message}`;

    const url = getWhatsAppUrl(msg);
    setInquiryUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Page Hero Header */}
      <div className="page-hero-banner">
        <div className="container-custom">
          <span 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-bronze)',
              display: 'block',
              marginBottom: '0.6rem'
            }}
          >
            Direct Studio Assistance
          </span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            marginBottom: '1rem'
          }}>
            Contact & WhatsApp Custom Framing Desk
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '740px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Have a custom frame size, corporate gifting requirement, or questions about our Islamic Art & Attar collections? Share your requirements and the studio will help you choose.
          </p>
        </div>
      </div>

      <div className="container-custom" style={{ marginTop: '3.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem'
        }} className="contact-grid">
          <style>{`
            @media (min-width: 900px) {
              .contact-grid { grid-template-columns: 1fr 1.25fr !important; }
            }
          `}</style>

          {/* Left Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                Studio Contact Desk
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>WhatsApp Direct Desk</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ask about your order, artwork or a custom quote</div>
                    <a href={getWhatsAppUrl('Hello AL-NOOR Studio! I have an inquiry.')} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-bronze)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '3px' }}>
                      Chat Now ({BUSINESS_CONFIG.contact.whatsappFormatted}) →
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Phone Support</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{BUSINESS_CONFIG.contact.hours.weekdays}</div>
                    <a href={`tel:${BUSINESS_CONFIG.contact.phone.replace(/[^+\d]/g, '')}`} style={{ display: 'inline-block', fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '2px', textDecoration: 'none' }}>{BUSINESS_CONFIG.contact.phone}</a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Inquiries</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <a href={`mailto:${BUSINESS_CONFIG.contact.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {BUSINESS_CONFIG.contact.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Workshop Location</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <a href={BUSINESS_CONFIG.location.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{BUSINESS_CONFIG.location.workshopAddress}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Packaging Guarantee Box */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                📦 Custom / Bulk Framing Orders:
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Planning to frame wedding portraits, hotel gallery walls, or architectural installations? Connect directly on WhatsApp for special bulk framing options and custom dimensions.
              </p>
            </div>
          </div>

          {/* Right Inquiry Form */}
          <div className="glass-panel" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Send a Direct Inquiry
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Fill in your details below and we will automatically open WhatsApp with your customized inquiry.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Inquiry prepared</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Review your details and press Send in WhatsApp. Your inquiry reaches the studio after you send it.
                </p>
                <a href={inquiryUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ marginTop: '1rem' }}>Open WhatsApp <MessageCircle size={18} /></a>
                <button type="button" onClick={() => setSubmitted(false)} style={{ display: 'block', margin: '1rem auto 0', padding: '0.7rem', background: 'transparent', color: 'var(--text-primary)', border: 0, textDecoration: 'underline' }}>Edit inquiry</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} htmlFor="contact-name">Your Name *</label>
                    <input
                      id="contact-name"
                      autoComplete="name"
                      maxLength={100}
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Zaid Khan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} htmlFor="contact-phone">WhatsApp Number *</label>
                    <input
                      id="contact-phone"
                      autoComplete="tel"
                      inputMode="tel"
                      pattern="(?:\+91\s*)?[6-9][0-9]{9}"
                      title="Enter a valid Indian mobile number"
                      maxLength={16}
                      name="phone"
                      type="tel"
                      required
                      placeholder="Your 10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} htmlFor="contact-service">Select Service</label>
                  <select
                      id="contact-service"
                      name="service"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  >
                    <option value="Custom Photo Framing (A5 to A1)">Custom Photo Framing (A5 to A1 Sizes)</option>
                    <option value="Islamic Art & Calligraphy (Framed/Canvas)">Islamic Art & Calligraphy Prints</option>
                    <option value="Royal Itra & Perfume Gift Sets">Royal Itra & Perfume Orders</option>
                    <option value="Bulk / Corporate Framing Requirement">Bulk / Custom Sizing Requirement</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} htmlFor="contact-message">Your Message / Requirements</label>
                  <textarea
                      id="contact-message"
                      maxLength={2000}
                      name="message"
                    rows={4}
                    placeholder="Tell us what size, frame style, or quantity you are looking for..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn-whatsapp" style={{ padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  <MessageCircle size={18} /> Continue to WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
