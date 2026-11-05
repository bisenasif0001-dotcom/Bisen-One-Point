import React from 'react';

const CRAFTSMANSHIP_STEPS = [
  {
    step: '01',
    title: 'Photo Check',
    desc: 'Each file is reviewed for sharpness, resolution, aspect ratio, and color balance before touching paper.',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    alt: 'Studio artisan checking photograph detail on desk'
  },
  {
    step: '02',
    title: 'Professional Print',
    desc: 'Printed on dedicated 6-colour Epson photographic systems on heavyweight 260+ GSM premium photo lustre paper.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    alt: 'Professional 6-colour photographic print production'
  },
  {
    step: '03',
    title: 'Frame Cut & Join',
    desc: 'Solid wood mouldings are precision mitre-cut at exact 45° angles and joined with concealed pneumatic V-nails.',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    alt: 'Precision wood frame moulding cutting and joint assembly'
  },
  {
    step: '04',
    title: 'Mount & Finish',
    desc: 'Fitted with acid-free preservation mounts, dust seals, and 2mm crystal-clear shatterproof cast acrylic.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    alt: 'Artisan mounting and finishing picture frame with backing'
  },
  {
    step: '05',
    title: 'Quality Check',
    desc: 'Inspected under 5000K daylight lamps for zero dust specks, razor-sharp alignment, and structural tension.',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
    alt: 'Quality inspection of framed artwork under studio daylight'
  },
  {
    step: '06',
    title: 'Protective Packaging',
    desc: 'Reinforced foam corner caps, multi-layer shockproof bubble wrap, and rigid heavy-duty exterior shipping crates.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    alt: 'Handcrafted protective packaging with corner reinforcement'
  }
];

export default function CraftsmanshipSection() {
  return (
    <section 
      id="craftsmanship"
      style={{
        padding: 'clamp(4.5rem, 8vw, 7rem) 0',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EAE6DC'
      }}
    >
      <div className="container-custom">

        {/* Section Header */}
        <div style={{ maxWidth: '680px', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <span 
            style={{ 
              fontSize: '0.74rem', 
              letterSpacing: '0.14em', 
              textTransform: 'uppercase', 
              color: 'var(--accent-bronze)', 
              fontWeight: 700,
              display: 'block',
              marginBottom: '0.5rem'
            }}
          >
            Behind The Scenes
          </span>
          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1rem'
            }}
          >
            Made By Us.<br />
            Not Dropshipped.
          </h2>
          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1rem, 1.3vw, 1.12rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              maxWidth: '560px'
            }}
          >
            Your photograph is printed, mounted, framed, inspected and packed in our own studio.
          </p>
        </div>

        {/* Documentary Process Cards Grid / Mobile Horizontal Scroll */}
        <div className="craftsmanship-grid">
          <style>{`
            .craftsmanship-grid {
              display: grid;
              grid-template-columns: repeat(1, 1fr);
              gap: 1.5rem;
            }
            @media (min-width: 640px) {
              .craftsmanship-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.75rem;
              }
            }
            @media (min-width: 1024px) {
              .craftsmanship-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 2.25rem 2rem;
              }
            }
            @media (max-width: 639px) {
              .craftsmanship-grid {
                display: flex;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: 1.15rem;
                padding-bottom: 1.25rem;
                -webkit-overflow-scrolling: touch;
                margin-left: -1rem;
                margin-right: -1rem;
                padding-left: 1rem;
                padding-right: 1rem;
              }
              .craftsmanship-grid::-webkit-scrollbar {
                height: 4px;
              }
              .craftsmanship-grid::-webkit-scrollbar-track {
                background: #F0ECE1;
                border-radius: 4px;
              }
              .craftsmanship-grid::-webkit-scrollbar-thumb {
                background: #171717;
                border-radius: 4px;
              }
              .craftsmanship-item {
                flex: 0 0 82%;
                scroll-snap-align: start;
              }
            }
          `}</style>

          {CRAFTSMANSHIP_STEPS.map((item) => (
            <article 
              key={item.step}
              className="craftsmanship-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px',
                backgroundColor: '#FAF9F6',
                border: '1px solid #ECE8DF',
                overflow: 'hidden',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
            >
              {/* Documentary Image with Aspect Ratio */}
              <div 
                style={{
                  position: 'relative',
                  aspectRatio: '16 / 11',
                  overflow: 'hidden',
                  backgroundColor: '#EAE6DC'
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.alt}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'grayscale(15%) contrast(1.02)',
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                
                {/* Step Number Badge */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(23, 23, 23, 0.88)',
                    color: '#FFFFFF',
                    backdropFilter: 'blur(4px)',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em'
                  }}
                >
                  STEP {item.step}
                </div>
              </div>

              {/* Step Info */}
              <div style={{ padding: '1.25rem 1.35rem 1.5rem 1.35rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.28rem',
                    fontWeight: 600,
                    color: '#171717',
                    marginBottom: '0.45rem',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {item.step} {item.title}
                </h3>
                <p 
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.86rem',
                    color: '#73716C',
                    lineHeight: 1.55,
                    margin: 0
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Understated Workshop Stamp */}
        <div 
          style={{
            marginTop: 'clamp(2.5rem, 5vw, 3.5rem)',
            paddingTop: '2rem',
            borderTop: '1px solid #ECE8DF',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#2D8A4E'
              }}
            />
            <span style={{ fontSize: '0.82rem', color: '#57554E', fontWeight: 500 }}>
              Studio Operations in Bareilly, Uttar Pradesh • Dispatched Worldwide
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#8C8983' }}>
            100% In-House Framing • Zero Third-Party Outsourcing
          </div>
        </div>

      </div>
    </section>
  );
}
