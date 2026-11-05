import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, ChevronDown, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../data/businessConfig';
import { FOOTER_COLUMNS } from '../data/footerNavigation';
import './Footer.css';

const FOOTER_YEAR = new Date().getFullYear();


export default function Footer() {
  const [openSections, setOpenSections] = useState({});
  const toggleSection = id => setOpenSections(current => ({ ...current, [id]: !current[id] }));
  const backToTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return <footer className="studio-footer">
    <span className="footer-watermark" aria-hidden="true">AL-NOOR</span>
    <div className="footer-container">
      <div className="footer-intro">
        <Link to="/" className="footer-brand" aria-label="Al-Noor home">AL-NOOR<span>YOUR PRINT & FRAME STUDIO</span></Link>
        <div className="footer-brand-copy"><p>Personalised photo printing, framing, cards, wall art and curated fragrance gifts by AL-NOOR.</p><div className="footer-socials">
          <a href={getWhatsAppUrl('Assalam o Alaikum! I have an inquiry regarding AL-NOOR studio orders.')} target="_blank" rel="noopener noreferrer" aria-label="Chat with Al-Noor on WhatsApp"><MessageCircle size={17} /></a>
          <a href={`mailto:${BUSINESS_CONFIG.contact.email}`} aria-label="Email Al-Noor"><Mail size={17} /></a>
          {BUSINESS_CONFIG.social.instagram && <a href={BUSINESS_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Al-Noor on Instagram"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="18" cy="6" r=".8" fill="currentColor" stroke="none" /></svg></a>}
        </div></div>
        <div className="footer-contact"><span className="footer-eyebrow">LET’S MAKE YOUR IDEA HAPPEN</span><a href={`tel:${BUSINESS_CONFIG.contact.phone.replace(/[^+\d]/g, '')}`}><Phone size={14} />{BUSINESS_CONFIG.contact.phone}</a><a href={`mailto:${BUSINESS_CONFIG.contact.email}`}><Mail size={14} />{BUSINESS_CONFIG.contact.email}</a><a className="footer-address" href={BUSINESS_CONFIG.location.googleMapsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={14} /><span>{BUSINESS_CONFIG.location.workshopAddress}</span></a><Link to="/contact">Talk to the studio <ArrowUpRight size={14} /></Link></div>
      </div>
      <nav className="footer-navigation" aria-label="Footer navigation">{FOOTER_COLUMNS.map(column => <div className="footer-column" data-open={Boolean(openSections[column.id])} key={column.id}>
        <h3>{column.title}</h3><button type="button" className="footer-accordion-toggle" aria-expanded={Boolean(openSections[column.id])} aria-controls={`footer-links-${column.id}`} onClick={() => toggleSection(column.id)}>{column.title}<ChevronDown size={15} /></button>
        <ul id={`footer-links-${column.id}`}>{column.links.map(link => <li key={link.label}><Link to={link.to}>{link.label}</Link></li>)}</ul>
      </div>)}</nav>
      <div className="footer-bottom"><span>© {FOOTER_YEAR} AL-NOOR Studio. All rights reserved.</span><span className="footer-signature">PRINT <i /> FRAME <i /> PERSONALISE</span><button type="button" onClick={backToTop}>Back to top <span><ArrowUp size={16} /></span></button></div>
    </div>
  </footer>;
}
