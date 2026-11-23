import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../data/businessConfig';
import { FOOTER_COLUMNS } from '../data/footerNavigation';
import './Footer.css';

const FOOTER_YEAR = new Date().getFullYear();

export default function Footer() {
  const [openSections, setOpenSections] = useState({});
  const toggleSection = id => setOpenSections(current => ({ ...current, [id]: !current[id] }));
  const backToTop = () => window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });

  const phoneHref = `tel:${BUSINESS_CONFIG.contact.phone.replace(/[^+\d]/g, '')}`;
  const whatsappHref = getWhatsAppUrl('Hello! I have an inquiry regarding BISEN studio orders.');

  return (
    <footer className="studio-footer">
      <div className="footer-container">
        <div className="footer-atelier-hero">
          <div className="footer-brand-panel">
            <div className="footer-brand-top">
              <Link to="/" className="footer-brand" aria-label="BISEN Frame & Photo Print home">
                <img
                  src="/logo-light.png"
                  alt="BISEN Frame & Photo Print"
                  className="footer-brand-logo"
                  width="160"
                  height="52"
                />
              </Link>
              <span className="footer-atelier-badge">LUCKNOW PRINT &amp; FRAMING ATELIER</span>
            </div>

            <h2 className="footer-headline">
              Crafted in Lucknow, <em>framed for life.</em>
            </h2>

            <p className="footer-brand-copy">
              Personalised photo printing, handcrafted custom frames, sacred wall art, bespoke cards
              and curated itra — inspected by hand before dispatch.
            </p>

            <div className="footer-meta-row">
              <div className="footer-hours">
                <Clock size={14} aria-hidden="true" />
                <span>Mon–Sat 10 AM – 8 PM · Sun 11 AM – 6 PM IST</span>
              </div>

              <div className="footer-socials">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with BISEN on WhatsApp"
                  title="WhatsApp Studio"
                >
                  <MessageCircle size={17} />
                </a>
                <a
                  href={`mailto:${BUSINESS_CONFIG.contact.email}`}
                  aria-label="Email BISEN"
                  title="Email Studio"
                >
                  <Mail size={17} />
                </a>
                <a
                  href={BUSINESS_CONFIG.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Find BISEN Studio on Google Maps"
                  title="Workshop Directions"
                >
                  <MapPin size={17} />
                </a>
                {BUSINESS_CONFIG.social.instagram && (
                  <a
                    href={BUSINESS_CONFIG.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="BISEN on Instagram"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <rect width="20" height="20" x="2" y="2" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="18" cy="6" r=".8" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                )}
                {BUSINESS_CONFIG.social.facebook && (
                  <a
                    href={BUSINESS_CONFIG.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="BISEN on Facebook"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
                {BUSINESS_CONFIG.social.pinterest && (
                  <a
                    href={BUSINESS_CONFIG.social.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="BISEN on Pinterest"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M10 17l1.8-6.5M9.5 13.5c-.6-1.5.2-3.5 2-4 2-.5 4 .8 3.5 3-.4 1.8-2.2 2.4-3.3 1.5" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="footer-concierge-card">
            <span className="footer-eyebrow">STUDIO CONCIERGE &amp; WORKSHOP</span>
            <h3 className="footer-concierge-title">Have a custom size or bulk framing idea?</h3>

            <div className="footer-contact-list">
              <a href={phoneHref}>
                <Phone size={15} aria-hidden="true" />
                <span>{BUSINESS_CONFIG.contact.phone}</span>
              </a>
              <a href={`mailto:${BUSINESS_CONFIG.contact.email}`}>
                <Mail size={15} aria-hidden="true" />
                <span>{BUSINESS_CONFIG.contact.email}</span>
              </a>
              <a
                className="footer-address"
                href={BUSINESS_CONFIG.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={15} aria-hidden="true" />
                <span>{BUSINESS_CONFIG.location.workshopAddress}</span>
              </a>
            </div>

            <div className="footer-concierge-actions">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-cta-primary"
              >
                <MessageCircle size={15} aria-hidden="true" />
                <span>WhatsApp Studio</span>
              </a>
              <Link to="/contact" className="footer-cta-secondary">
                <span>Talk to the studio</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <nav className="footer-navigation" aria-label="Footer navigation">
          {FOOTER_COLUMNS.map(column => (
            <div className="footer-column" data-open={Boolean(openSections[column.id])} key={column.id}>
              <h3>{column.title}</h3>
              <button
                type="button"
                className="footer-accordion-toggle"
                aria-expanded={Boolean(openSections[column.id])}
                aria-controls={`footer-links-${column.id}`}
                onClick={() => toggleSection(column.id)}
              >
                <span>{column.title}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              <ul id={`footer-links-${column.id}`}>
                {column.links.map(link => (
                  <li key={`${column.id}-${link.label}`}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="footer-trust-strip">
          <div className="footer-trust-items">
            <span>
              <ShieldCheck size={15} aria-hidden="true" />
              Manual file check before print
            </span>
            <span>
              <Truck size={15} aria-hidden="true" />
              Lucknow Porter &amp; Pan-India dispatch
            </span>
            <span>
              <Lock size={15} aria-hidden="true" />
              100% prepaid encrypted checkout
            </span>
          </div>

          <div className="footer-payment-pills" aria-label="Accepted payment methods">
            <span>Razorpay</span>
            <span>UPI</span>
            <span>Cards</span>
            <span>NetBanking</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {FOOTER_YEAR} BISEN Frame &amp; Photo Print · Lucknow, India</span>
          <span className="footer-signature">
            PRINT <i aria-hidden="true" /> FRAME <i aria-hidden="true" /> PERSONALISE
          </span>
          <button type="button" className="footer-top-btn" onClick={backToTop}>
            <span>Back to top</span>
            <span>
              <ArrowUp size={15} aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>

      <div className="footer-watermark-band" aria-hidden="true">
        <span className="footer-watermark">BISEN</span>
      </div>
    </footer>
  );
}
