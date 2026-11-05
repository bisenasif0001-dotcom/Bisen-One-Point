import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Frame, Image as ImageIcon, Sparkles, Gift } from 'lucide-react';

/**
 * AL-NOOR FINAL HOMEPAGE CTA (PROMPT 35)
 * Strict Requirements:
 * - Strong emotional closing section before footer
 * - Very clean warm ivory / soft stone background with generous vertical spacing
 * - Exact Heading: "READY TO MAKE SOMETHING PERSONAL?"
 * - Buttons:
 *   1. FRAME A PHOTO
 *   2. PRINT PHOTOS
 *   3. CREATE A CARD
 * - Small secondary link: "Explore Gifts →"
 * - Large, spacious editorial composition. No extra selling noise.
 */
export default function FinalCtaSection() {
  return (
    <section 
      style={{
        position: 'relative',
        padding: 'clamp(6rem, 10vw, 9.5rem) 0',
        backgroundColor: '#F5F3EE',
        borderTop: '1px solid var(--border-color)',
        overflow: 'hidden',
        textAlign: 'center'
      }}
      aria-label="Ready to make something personal"
    >
      {/* Subtle Warm Atmospheric Grain / Ambient Texture */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 25%, rgba(255, 255, 255, 0.75) 0%, rgba(245, 243, 238, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="container-custom" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {/* Subtle Studio Pre-title */}
          <span 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent-bronze)',
              display: 'block',
              marginBottom: '1rem'
            }}
          >
            AL-NOOR • PRINT • FRAME • GIFT
          </span>

          {/* Main Editorial Headline */}
          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 5.2vw, 4.4rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#181817',
              margin: '0 auto 1.35rem auto',
              maxWidth: '720px'
            }}
          >
            READY TO MAKE<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#33312E' }}>
              SOMETHING PERSONAL?
            </span>
          </h2>

          {/* Quiet, Thoughtful Descriptor */}
          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: '560px',
              margin: '0 auto clamp(2.5rem, 4.5vw, 3.5rem) auto',
              fontWeight: 400
            }}
          >
            Upload your favourite photographs, compose a heartfelt greeting card, or curate an heirloom fragrance memory. Handcrafted in our studio, delivered ready to cherish.
          </p>

          {/* Action Row: 3 Primary/Secondary Action Buttons */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            {/* 1. FRAME A PHOTO */}
            <Link 
              to="/custom-framing"
              className="btn-primary"
              style={{
                padding: '0.95rem 2.2rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                textDecoration: 'none'
              }}
            >
              <Frame size={16} strokeWidth={2} />
              <span>FRAME A PHOTO</span>
            </Link>

            {/* 2. PRINT PHOTOS */}
            <Link 
              to="/photo-prints"
              className="btn-secondary"
              style={{
                padding: '0.95rem 2.1rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                textDecoration: 'none'
              }}
            >
              <ImageIcon size={16} strokeWidth={2} />
              <span>PRINT PHOTOS</span>
            </Link>

            {/* 3. CREATE A CARD */}
            <Link 
              to="/create-card"
              className="btn-secondary"
              style={{
                padding: '0.95rem 2.1rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                textDecoration: 'none'
              }}
            >
              <Sparkles size={16} strokeWidth={2} />
              <span>CREATE A CARD</span>
            </Link>
          </div>

          {/* Small Secondary Link */}
          <div>
            <Link 
              to="/cards"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#181817',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 0.75rem',
                transition: 'color 0.15s ease, transform 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-bronze)';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#181817';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span>Explore Gifts</span>
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
