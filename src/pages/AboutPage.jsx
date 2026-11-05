import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Frame, Gift, Sparkles, Award, ArrowRight, Droplet } from 'lucide-react';
import SafeDeliverySection from '../components/SafeDeliverySection';

export default function AboutPage() {
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
            The House of AL-NOOR
          </span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Thoughtfully Printed. Beautifully Framed. <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent-bronze)' }}>Personally Gifted.</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '740px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Founded as a unified creative house, AL-NOOR brings bespoke photo printing, handcrafted solid wood framing, custom greeting cards, and artisanal fragrances into one seamless studio.
          </p>
        </div>
      </div>

      <div className="container-custom" style={{ marginTop: '3.5rem' }}>
        
        {/* Story Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3rem',
          alignItems: 'center',
          marginBottom: '4.5rem'
        }} className="about-grid">
          <style>{`
            @media (min-width: 900px) {
              .about-grid { grid-template-columns: 1fr 1fr !important; }
            }
          `}</style>

          <div>
            <span 
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.74rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--accent-bronze)',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              Our Studio Philosophy
            </span>
            <h2 style={{ 
              fontFamily: 'var(--font-serif)',
              fontSize: '2.1rem', 
              fontWeight: 500, 
              color: 'var(--text-primary)', 
              marginBottom: '1.25rem', 
              lineHeight: 1.25 
            }}>
              Handcrafted with Devotion, <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent-bronze)' }}>Precision & Integrity</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.95rem' }}>
              At AL-NOOR, we believe that life's most precious memories, sacred verses, and heartfelt celebrations deserve tangible form. Whether turning a smartphone capture into a studio gallery-framed print, penning a personalized greeting card for a loved one, or sharing an artisanal non-alcoholic attar, every creation reflects our uncompromising commitment to craftsmanship.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              We manage our printing and framing in-house using seasoned solid hardwoods, acid-free mounts, shatter-resistant optical cast acrylic, and genuine 6-colour Epson MicroPiezo photographic systems.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/custom-framing" className="btn-primary">
                Create a Custom Frame <ArrowRight size={16} />
              </Link>
              <Link to="/itra-perfumes" className="btn-secondary">
                Explore Itra House
              </Link>
            </div>
          </div>

          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80"
              alt="AL-NOOR Studio Craftsmanship"
              style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        {/* 3 Unified Divisions of AL-NOOR */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-bronze)', display: 'block', marginBottom: '0.4rem' }}>
              One Parent Studio. Three Creative Expressions.
            </span>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              The House of AL-NOOR Architecture
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {/* Division 1: Print & Frame */}
            <div className="glass-panel" style={{ padding: '2.25rem 2rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                <Frame size={22} />
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-bronze)', marginBottom: '0.35rem' }}>
                Division 01
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                AL-NOOR Print & Frame Studio
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Custom photo framing across standard A5 to A1 dimensions, 6-colour photographic printing, curated gallery walls, and sacred Islamic art prints.
              </p>
              <Link to="/custom-framing" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Open Frame Customizer →
              </Link>
            </div>

            {/* Division 2: Cards & Gifts */}
            <div className="glass-panel" style={{ padding: '2.25rem 2rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                <Gift size={22} />
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-bronze)', marginBottom: '0.35rem' }}>
                Division 02
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                AL-NOOR Cards & Gifts
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Personalised birthday cards, bespoke wedding invitations, heartfelt anniversary stationery, and custom-engraved keepsake gifts for loved ones.
              </p>
              <Link to="/contact" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Order Custom Cards & Gifts →
              </Link>
            </div>

            {/* Division 3: Itra House */}
            <div className="glass-panel" style={{ padding: '2.25rem 2rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                <Droplet size={22} />
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-bronze)', marginBottom: '0.35rem' }}>
                Division 03
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                AL-NOOR Itra House
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Artisanal 100% alcohol-free concentrated perfume oils, authentic Dehn Al Oud, Kashmir Black Musk, and curated 4-Attar Royal Discovery Boxes.
              </p>
              <Link to="/itra-perfumes" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Discover Royal Fragrances →
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Relocated Detailed Transit & Safe Delivery Protection */}
      <SafeDeliverySection />
    </div>
  );
}
