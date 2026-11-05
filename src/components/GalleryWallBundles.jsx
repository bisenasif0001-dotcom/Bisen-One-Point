import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Ruler, Layers, Sparkles } from 'lucide-react';

export const GALLERY_WALL_DATA = [
  {
    id: 'classic-trio',
    name: 'The Classic Trio',
    framesCount: 3,
    framesLabel: '3 Frames',
    startingPrice: 2499,
    layoutType: 'Symmetrical Triptych',
    idealSpan: '130 – 180 cm (Above Sofa / Console)',
    dimensions: '3 × A3 (29.7 × 42.0 cm)',
    description: 'A timeless, serene 3-piece layout. Perfectly proportioned to anchor living room sofas or dining credenzas without visual clutter.',
    roomImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
    arrangementMock: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'family-wall',
    name: 'The Family Wall',
    framesCount: 5,
    framesLabel: '5 Frames',
    startingPrice: 3999,
    layoutType: 'Balanced Focal Flank',
    idealSpan: '150 – 210 cm (Feature Wall)',
    dimensions: '1 × A2 Center + 4 × A4 Flanks',
    description: 'Our most loved arrangement. A prominent center portrait framed by two balanced columns to capture family milestones.',
    roomImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    arrangementMock: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'wedding-salon',
    name: 'The Wedding Salon',
    framesCount: 7,
    framesLabel: '7 Frames',
    startingPrice: 5799,
    layoutType: 'Editorial Salon Cluster',
    idealSpan: '180 – 240 cm (Bedroom / Landing)',
    dimensions: '1 × A2 + 2 × A3 + 4 × A4',
    description: 'An organic editorial gallery narrating your complete celebration—from candid vows and portraits to intimate detail shots.',
    roomImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
    arrangementMock: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'memory-grid',
    name: 'The Memory Grid',
    framesCount: 9,
    framesLabel: '9 Frames',
    startingPrice: 7499,
    layoutType: 'Geometric 3×3 Grid',
    idealSpan: '160 – 220 cm (Hallway / Dining)',
    dimensions: '9 × A4 (21.0 × 29.7 cm)',
    description: 'A striking architectural grid offering immaculate symmetry. Designed for chronologies, travel stories, and annual retrospectives.',
    roomImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
    arrangementMock: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  }
];

export default function GalleryWallBundles() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredBundles = activeFilter === 'All'
    ? GALLERY_WALL_DATA
    : GALLERY_WALL_DATA.filter(b => `${b.framesCount} Frames` === activeFilter);

  const handleBuildWall = (bundle) => {
    navigate(`/gallery-walls?layout=${bundle.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      id="gallery-walls"
      style={{
        padding: 'clamp(5rem, 8vw, 7.5rem) 0',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #DDD9D0',
        position: 'relative'
      }}
    >
      <div className="container-custom">

        {/* Section Header */}
        <div style={{ maxWidth: '680px', margin: '0 auto clamp(2.5rem, 5vw, 3.75rem) auto', textAlign: 'center' }}>
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
            Curated Multi-Frame Collections
          </span>

          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)',
              fontWeight: 500,
              color: '#181817',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem'
            }}
          >
            BUILD A GALLERY WALL
          </h2>

          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.96rem, 1.2vw, 1.08rem)',
              color: '#706E68',
              lineHeight: 1.6,
              margin: '0 auto'
            }}
          >
            Designed by interior stylists so your photos look naturally balanced together.
            Every set arrives with a life-size 1:1 paper hanging template for effortless, level installation.
          </p>
        </div>

        {/* Frame Count Selector Filter Bar (3 Frames, 5 Frames, 7 Frames, 9 Frames) */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2.75rem',
            flexWrap: 'wrap'
          }}
        >
          {['All', '3 Frames', '5 Frames', '7 Frames', '9 Frames'].map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                style={{
                  padding: '0.45rem 1.15rem',
                  borderRadius: '100px',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.04em',
                  backgroundColor: isActive ? '#181817' : '#FAF8F5',
                  color: isActive ? '#FFFFFF' : '#706E68',
                  border: isActive ? '1px solid #181817' : '1px solid #DDD9D0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#181817';
                    e.currentTarget.style.color = '#181817';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#DDD9D0';
                    e.currentTarget.style.color = '#706E68';
                  }
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 4 Premium Cards Grid */}
        <div className="gallery-bundles-grid">
          <style>{`
            .gallery-bundles-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 2rem;
            }
            @media (min-width: 640px) {
              .gallery-bundles-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 2rem;
              }
            }
            @media (min-width: 1024px) {
              .gallery-bundles-grid {
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
              }
            }
          `}</style>

          {filteredBundles.map((bundle) => (
            <div
              key={bundle.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #DDD9D0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 18px rgba(24, 24, 23, 0.04)',
                transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, border-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(24, 24, 23, 0.1)';
                e.currentTarget.style.borderColor = '#C5BFB2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(24, 24, 23, 0.04)';
                e.currentTarget.style.borderColor = '#DDD9D0';
              }}
            >
              {/* Beautiful Room Image with Real-Looking Arrangement */}
              <div 
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  backgroundColor: '#EDEAE4',
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={bundle.roomImage} 
                  alt={bundle.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />

                {/* Number of Frames Badge Top Left (Prompt 21: Show 3, 5, 7, 9 Frames) */}
                <span 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    backgroundColor: '#181817',
                    color: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '4px'
                  }}
                >
                  {bundle.framesLabel}
                </span>

                {/* Layout Type Tag Top Right */}
                <span 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    color: '#181817',
                    padding: '3px 8px',
                    borderRadius: '100px',
                    border: '1px solid rgba(0,0,0,0.08)'
                  }}
                >
                  {bundle.layoutType}
                </span>
              </div>

              {/* Card Content: Layout Name, Number of frames, Starting price (Prompt 21) */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Layout Name */}
                <h3 
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: '#181817',
                    lineHeight: 1.25,
                    margin: '0 0 0.35rem 0'
                  }}
                >
                  {bundle.name}
                </h3>

                {/* Sizes Spec Details */}
                <div style={{ fontSize: '0.78rem', color: '#706E68', marginBottom: '0.5rem' }}>
                  {bundle.dimensions}
                </div>

                <p 
                  style={{
                    fontSize: '0.8rem',
                    color: '#706E68',
                    lineHeight: 1.45,
                    margin: '0 0 1.25rem 0',
                    flex: 1
                  }}
                >
                  {bundle.description}
                </p>

                {/* Starting Price Row */}
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #F0ECE1',
                    marginBottom: '0.85rem'
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: '#706E68', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Complete Set
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#181817' }}>
                    From ₹{bundle.startingPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Primary CTA (Prompt 21 requirement: BUILD THIS WALL) */}
                <button
                  type="button"
                  onClick={() => handleBuildWall(bundle)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#181817',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9B7A50'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181817'}
                >
                  <span>BUILD THIS WALL</span>
                  <ArrowRight size={14} />
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* Hanging Guarantee & 1:1 Template Banner */}
        <div 
          style={{
            marginTop: 'clamp(2.5rem, 5vw, 3.5rem)',
            backgroundColor: '#F5F3EE',
            border: '1px solid #DDD9D0',
            borderRadius: '8px',
            padding: '1.5rem clamp(1.25rem, 3vw, 2rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #DDD9D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7A50', flexShrink: 0 }}>
              <Ruler size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#181817', marginBottom: '2px' }}>
                1:1 Life-Size Hanging Template
              </div>
              <div style={{ fontSize: '0.8rem', color: '#706E68', lineHeight: 1.45 }}>
                Tack the template paper to your wall and hammer nails through marked crosshairs. Zero crooked frames.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #DDD9D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7A50', flexShrink: 0 }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#181817', marginBottom: '2px' }}>
                Complete Mounting Hardware Kit
              </div>
              <div style={{ fontSize: '0.8rem', color: '#706E68', lineHeight: 1.45 }}>
                Arrives with pre-attached brass hangers, German wall hooks, hardened steel nails, and a mini bubble level.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #DDD9D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7A50', flexShrink: 0 }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#181817', marginBottom: '2px' }}>
                Coordinated Studio Framing
              </div>
              <div style={{ fontSize: '0.8rem', color: '#706E68', lineHeight: 1.45 }}>
                All frames in the set are crafted with matching solid wood moulding finishes and bevel-cut studio matboard.
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
