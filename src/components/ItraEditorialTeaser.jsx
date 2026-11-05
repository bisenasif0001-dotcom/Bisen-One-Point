import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Droplet, Sparkles, Compass } from 'lucide-react';

export default function ItraEditorialTeaser() {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate('/itra');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      id="itra-house"
      style={{
        backgroundColor: '#21251E', // Deep olive background
        color: '#F5F3ED', // Cream text
        padding: 'clamp(5.5rem, 9vw, 8.5rem) 0',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(216, 206, 190, 0.12)'
      }}
    >
      {/* Subtle organic ambient gradient (warm sand & deep dark olive) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at 85% 50%, rgba(168, 123, 69, 0.12) 0%, rgba(33, 37, 30, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="container-custom" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Editorial Split Layout (Text on Left, Hero Imagery on Right) */}
        <div className="itra-teaser-split">
          <style>{`
            .itra-teaser-split {
              display: grid;
              grid-template-columns: 1fr;
              gap: 3rem;
              align-items: center;
            }
            @media (min-width: 992px) {
              .itra-teaser-split {
                grid-template-columns: 1.05fr 1fr;
                gap: 5rem;
              }
            }
          `}</style>

          {/* Left Column: Modern Niche Brand Editorial Story */}
          <div>
            {/* Division Eyebrow */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.72rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#D8CEBE', // Warm sand
                fontWeight: 600,
                marginBottom: '1.25rem'
              }}
            >
              <span style={{ width: '20px', height: '1px', backgroundColor: '#D8CEBE', opacity: 0.6 }} />
              <span>AL-NOOR • THE ITRA HOUSE</span>
            </div>

            {/* Heading (Exact Prompt 18 text) */}
            <h2 
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#F5F3ED', // Cream
                margin: '0 0 1.25rem 0'
              }}
            >
              A DIFFERENT KIND<br />
              OF MEMORY.
            </h2>

            {/* Subheading (Exact Prompt 18 text) */}
            <h3 
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
                fontWeight: 500,
                color: '#D8CEBE', // Warm sand
                margin: '0 0 1.15rem 0',
                letterSpacing: '-0.01em'
              }}
            >
              Discover the AL-NOOR Itra Collection.
            </h3>

            {/* Supporting Copy (Exact Prompt 18 text) */}
            <p 
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.94rem, 1.1vw, 1.04rem)',
                color: '#BDB7AA', // Soft muted sand
                lineHeight: 1.65,
                maxWidth: '520px',
                margin: '0 0 2.25rem 0'
              }}
            >
              Traditional fragrance oils selected for personal wear, gifting and everyday rituals.
              Distilled through slow artisanal copper-deg methods, capturing aged Cambodian agarwood, wild Kashmiri musk, and fresh Taif morning roses without a single drop of alcohol.
            </p>

            {/* Three Niche Luxury Pillars */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1.25rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(216, 206, 190, 0.15)',
                marginBottom: '2.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F5F3ED', marginBottom: '2px' }}>
                  100% Pure Oil
                </div>
                <div style={{ fontSize: '0.74rem', color: '#9E9789', lineHeight: 1.4 }}>
                  Uncut concentrate that warms intimately on pulse points
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F5F3ED', marginBottom: '2px' }}>
                  Zero Alcohol
                </div>
                <div style={{ fontSize: '0.74rem', color: '#9E9789', lineHeight: 1.4 }}>
                  Non-drying, prayer-safe formulation that lasts all day
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F5F3ED', marginBottom: '2px' }}>
                  Aged Botanicals
                </div>
                <div style={{ fontSize: '0.74rem', color: '#9E9789', lineHeight: 1.4 }}>
                  Curated in Kannauj, Assam, Taif and Cambodia
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleExplore}
                style={{
                  padding: '0.9rem 2.25rem',
                  backgroundColor: '#D8CEBE', // Warm sand
                  color: '#1E221B', // Dark olive
                  border: 'none',
                  borderRadius: '2px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background-color 0.25s ease, transform 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#D8CEBE';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>EXPLORE ITRA</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => {
                  navigate('/occasions/birthday');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D8CEBE',
                  fontSize: '0.82rem',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: '4px 0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: 0.85,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
              >
                <span>Gift Box Sets</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </div>

          {/* Right Column: One Exceptional Hero Bottle Imagery */}
          <div style={{ position: 'relative' }}>
            
            {/* Visual Frame Container */}
            <div 
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#181B15',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(216, 206, 190, 0.15)',
                aspectRatio: '4 / 5'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80" 
                alt="AL-NOOR Artisanal Pure Itra Flacon"
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.04) brightness(0.95)'
                }}
              />

              {/* Editorial Gradient Overlay */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(33, 37, 30, 0.2) 60%, rgba(20, 23, 18, 0.85) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Top Pill: Craftsmanship Origin */}
              <div 
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  left: '1.5rem',
                  backgroundColor: 'rgba(30, 34, 27, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#D8CEBE',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  borderRadius: '100px',
                  border: '1px solid rgba(216, 206, 190, 0.2)'
                }}
              >
                Deg-Bhapka Steam Distilled
              </div>

              {/* Bottom Editorial Caption */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  color: '#F5F3ED'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D8CEBE', opacity: 0.85, marginBottom: '2px' }}>
                    Signature Flacon
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500 }}>
                    Dehn Al Oud Royale
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A69F93' }}>
                    From
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#D8CEBE' }}>
                    ₹699
                  </div>
                </div>
              </div>

            </div>

            {/* Subtle floating tasting notes badge */}
            <div 
              style={{
                position: 'absolute',
                bottom: '-1rem',
                left: '-1rem',
                backgroundColor: '#2D3328',
                border: '1px solid rgba(216, 206, 190, 0.2)',
                borderRadius: '6px',
                padding: '0.75rem 1.25rem',
                boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                display: 'none'
              }}
              className="notes-floating-badge"
            >
              <style>{`
                @media (min-width: 640px) {
                  .notes-floating-badge {
                    display: block !important;
                  }
                }
              `}</style>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D8CEBE', fontWeight: 600, marginBottom: '2px' }}>
                Olfactory Profile
              </div>
              <div style={{ fontSize: '0.78rem', color: '#F5F3ED', fontWeight: 500 }}>
                Smoky Agarwood • Taif Rose • Ambergris
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
