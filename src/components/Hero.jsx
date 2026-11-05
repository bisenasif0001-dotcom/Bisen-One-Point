import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section 
      style={{
        position: 'relative',
        minHeight: 'clamp(620px, 86vh, 880px)',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        backgroundColor: '#EDE9E1',
        borderBottom: '1px solid #E2DDD3'
      }}
      className="cinematic-hero-section"
    >
      {/* 1. Exceptional Lifestyle Background Photograph */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=2400&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }}
        className="hero-bg-photo"
      />

      {/* 2. Pure Natural Scrim for High-Contrast Text Legibility (No loud gradients or glassmorphism) */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none'
        }}
        className="hero-natural-scrim"
      >
        <style>{`
          .hero-natural-scrim {
            background: linear-gradient(
              100deg, 
              rgba(245, 243, 238, 0.97) 0%, 
              rgba(245, 243, 238, 0.93) 36%, 
              rgba(245, 243, 238, 0.5) 62%, 
              rgba(245, 243, 238, 0.05) 100%
            ),
            linear-gradient(
              to top,
              rgba(245, 243, 238, 0.85) 0%,
              transparent 38%
            );
          }

          @media (max-width: 900px) {
            .hero-bg-photo {
              background-position: center 25% !important;
            }
            .hero-natural-scrim {
              background: linear-gradient(
                to top, 
                rgba(245, 243, 238, 0.98) 0%, 
                rgba(245, 243, 238, 0.94) 55%, 
                rgba(245, 243, 238, 0.6) 80%, 
                rgba(245, 243, 238, 0.2) 100%
              ) !important;
            }
          }

          @media (max-width: 640px) {
            .hero-actions-container {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 0.75rem !important;
            }
            .hero-actions-container a.btn-primary,
            .hero-actions-container a.btn-secondary {
              width: 100% !important;
              min-height: 48px !important;
              justify-content: center !important;
            }
            .hero-actions-container .hero-tertiary-link {
              justify-content: center !important;
              padding: 0.6rem 0 !important;
            }
          }
        `}</style>
      </div>

      {/* 3. Hero Content Sitting Toward Lower-Left (Spacious Editorial Whitespace) */}
      <div 
        className="container-custom" 
        style={{ 
          position: 'relative', 
          zIndex: 3, 
          width: '100%',
          paddingTop: '4.5rem',
          paddingBottom: 'clamp(2.75rem, 5.5vw, 5rem)'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          
          {/* Main Editorial Headline */}
          <h1 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 5vw, 4.4rem)',
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#171717',
              marginBottom: '1.25rem'
            }}
          >
            Photos Belong On Walls.
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#33312E' }}>
              Not Just On Phones.
            </span>
          </h1>

          {/* Supporting Text */}
          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1.05rem, 1.35vw, 1.2rem)',
              color: '#52504B',
              lineHeight: 1.6,
              maxWidth: '520px',
              marginBottom: '2.25rem',
              fontWeight: 400
            }}
          >
            Upload your favourite photograph. We print, frame and deliver it ready to hang.
          </p>

          {/* Action Row: Primary CTA + Secondary CTA + Subtle Tertiary Link */}
          <div 
            className="hero-actions-container"
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              gap: '1rem',
              marginBottom: '2.5rem' 
            }}
          >
            {/* Primary CTA */}
            <Link 
              to="/custom-framing" 
              className="btn-primary"
              style={{ 
                padding: '0.85rem 1.85rem', 
                fontSize: '0.88rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>FRAME MY PHOTO</span>
              <ArrowRight size={15} strokeWidth={2} />
            </Link>

            {/* Secondary CTA */}
            <Link 
              to="/photo-prints" 
              className="btn-secondary"
              style={{ 
                padding: '0.85rem 1.75rem', 
                fontSize: '0.88rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span>PRINT PHOTOS</span>
            </Link>

            {/* Subtle Tertiary Text Link */}
            <Link 
              to="/create-card" 
              className="hero-tertiary-link"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#171717',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.5rem 0.25rem',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-bronze)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#171717')}
            >
              <span>Create A Card</span>
              <span>→</span>
            </Link>
          </div>

          {/* Quiet Trust Line */}
          <div 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              color: '#73716C',
              letterSpacing: '0.02em',
              lineHeight: 1.5,
              fontWeight: 500,
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(23, 23, 23, 0.08)'
            }}
          >
            6-Colour Photo Printing • Handmade Frames • Secure Packaging • Pan-India Delivery
          </div>

        </div>
      </div>

    </section>
  );
}
