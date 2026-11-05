import React, { useState } from 'react';
import { ShieldCheck, Truck, Box, Check, Sparkles, Layers, Mail, Droplets } from 'lucide-react';

const PACKAGING_CATEGORIES = [
  {
    id: 'frames',
    name: 'Frames & Wall Art',
    badge: '4-Layer Transit System',
    headline: 'Engineered Multi-Tier Protection for Framed Art',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
    layers: [
      {
        number: '01',
        title: 'Frame / Product',
        subtitle: 'Core Artwork & Glazing',
        description: 'Fitted with 2mm shatter-resistant optical cast acrylic instead of fragile float glass. It offers high transparency, lightweight structure, and high impact resistance during transit.',
        feature: '2mm Shatter-Resistant Cast Acrylic'
      },
      {
        number: '02',
        title: 'Corner Protection',
        subtitle: 'Reinforced Mitre Buffers',
        description: 'High-density custom corner caps fitted over all four 45° joints. Corners are the most vulnerable point of any frame; these buffers absorb direct edge drop impact.',
        feature: '4× High-Density Corner Caps'
      },
      {
        number: '03',
        title: 'Protective Wrap',
        subtitle: 'Shock & Moisture Barrier',
        description: 'Dual-layered air-cushion bubble wrapping followed by dust-sealed wrap to shield against humidity, fine courier transit dust, and surface friction.',
        feature: 'Double Shock-Absorbing Cushion'
      },
      {
        number: '04',
        title: 'Outer Carton',
        subtitle: 'Rigid Heavy-Duty Shipping Box',
        description: 'Housed in custom rigid double-wall corrugated shipping boxes engineered to withstand automated parcel sorting and inter-city transportation.',
        feature: 'Rigid Double-Wall Corrugated Board'
      }
    ]
  },
  {
    id: 'cards',
    name: 'Greeting Cards',
    badge: 'Protective Card Packaging',
    headline: 'Protective Sleeves & Rigid Keepsake Envelopes',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80',
    layers: [
      {
        number: '01',
        title: 'Greeting Card / Product',
        subtitle: '350 GSM Textured Board',
        description: 'Precision folded card printed on heavyweight 350 GSM uncoated cardstock with smudge-resistant formulation.',
        feature: 'Heavyweight Fine Art Board'
      },
      {
        number: '02',
        title: 'Translucent Vellum Sleeve',
        subtitle: 'Moisture & Surface Shield',
        description: 'Each card is sealed in a protective semi-matte translucent sleeve preventing fingerprint oils and humidity during transit.',
        feature: 'Dust & Moisture Sleeve'
      },
      {
        number: '03',
        title: 'Keepsake Envelope',
        subtitle: 'Embossed Gift Presentation',
        description: 'Paired with a premium 150 GSM self-adhesive envelope with subtle studio watermark seal.',
        feature: 'Custom Gifting Envelope'
      },
      {
        number: '04',
        title: 'Rigid Stay-Flat Mailer',
        subtitle: 'Do Not Bend Exterior',
        description: 'Dispatched inside a rigid kraft stay-flat mailer with heavy-duty backing so your card arrives perfectly crisp without bent corners.',
        feature: 'Zero-Crease Hardback Mailer'
      }
    ]
  },
  {
    id: 'itra',
    name: 'Itra & Fragrance',
    badge: 'Leak-Proof Presentation',
    headline: 'Cushioned Flacons & Embossed Gift Hard-Boxes',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    layers: [
      {
        number: '01',
        title: 'Itra Flacon / Product',
        subtitle: 'Precision Leak-Proof Seal',
        description: 'Pure concentrated attar bottled in thick-walled crystal glass flacons with tight-threaded seals to prevent aroma dissipation.',
        feature: 'Tight-Tolerance Threaded Cap'
      },
      {
        number: '02',
        title: 'Bottle Protection',
        subtitle: 'Velvet Pouch & Foam Cradle',
        description: 'The flacon rests inside a tailored plush velvet pouch or precision die-cut EVA foam cradle to cushion against vibrations.',
        feature: 'Velvet Pouch / Foam Nesting'
      },
      {
        number: '03',
        title: 'Presentation Box',
        subtitle: 'Rigid Gold-Embossed Gift Box',
        description: 'Encased in a sturdy gift box featuring tactile gold foil calligraphy, ready for gifting straight out of the delivery parcel.',
        feature: 'Rigid Presentation Hard-Box'
      },
      {
        number: '04',
        title: 'Padded Outer Box',
        subtitle: 'Tamper-Evident Delivery Box',
        description: 'Placed inside a bubble-cushioned transit carton with tamper-evident sealing tape for discrete, secure courier shipping.',
        feature: 'Shock-Absorbing Transit Carton'
      }
    ]
  }
];

export default function SafeDeliverySection() {
  const [selectedCatId, setSelectedCatId] = useState('frames');
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);

  const currentCategory = PACKAGING_CATEGORIES.find(c => c.id === selectedCatId) || PACKAGING_CATEGORIES[0];

  return (
    <section 
      id="safe-delivery"
      style={{
        padding: 'clamp(5rem, 8vw, 7.5rem) 0',
        backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #DDD9D0',
        position: 'relative'
      }}
    >
      <div className="container-custom">

        {/* Section Header (Prompt 23 exact: PACKED TO ARRIVE PERFECTLY.) */}
        <div style={{ maxWidth: '720px', margin: '0 auto clamp(2.5rem, 5vw, 3.75rem) auto', textAlign: 'center' }}>
          <span 
            style={{ 
              fontSize: '0.74rem', 
              letterSpacing: '0.16em', 
              textTransform: 'uppercase', 
              color: 'var(--accent-bronze)', 
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '0.5rem'
            }}
          >
            Transit & Packaging Architecture
          </span>

          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4.2vw, 3.6rem)',
              fontWeight: 500,
              color: '#181817',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1rem'
            }}
          >
            PACKED TO ARRIVE<br />
            PERFECTLY.
          </h2>

          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.96rem, 1.2vw, 1.08rem)',
              color: '#706E68',
              lineHeight: 1.6,
              maxWidth: '620px',
              margin: '0 auto'
            }}
          >
            Every product is shielded with custom multi-layer protective packaging engineered for nationwide courier handling. In the rare event of transit damage, we provide a replacement immediately.
          </p>
        </div>

        {/* Product Category Tab Switcher (Frames, Cards, Itra) */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}
        >
          {PACKAGING_CATEGORIES.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCatId(cat.id);
                  setActiveLayerIndex(0);
                }}
                style={{
                  padding: '0.55rem 1.35rem',
                  borderRadius: '100px',
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 600 : 500,
                  letterSpacing: '0.03em',
                  backgroundColor: isSelected ? '#181817' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#706E68',
                  border: isSelected ? '1px solid #181817' : '1px solid #DDD9D0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* 2-Column Split: Exploded Photography Left, 4 Interactive Layers Right */}
        <div className="packaging-split-grid">
          <style>{`
            .packaging-split-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 2.5rem;
              align-items: start;
              margin-bottom: 3.5rem;
            }
            @media (min-width: 992px) {
              .packaging-split-grid {
                grid-template-columns: 1fr 1.05fr;
                gap: 3.5rem;
              }
            }
          `}</style>

          {/* LEFT: Real Process & Packaging Photography + Exploded Mini Badges */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DDD9D0',
              padding: '1.5rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
            }}
          >
            {/* Real Photography */}
            <div 
              style={{
                position: 'relative',
                aspectRatio: '16 / 11',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#EDEAE4',
                border: '1px solid #DDD9D0',
                marginBottom: '1.25rem'
              }}
            >
              <img 
                src={currentCategory.image} 
                alt={`${currentCategory.name} packaging`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease'
                }}
              />

              <div 
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(24, 24, 23, 0.88)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em'
                }}
              >
                {currentCategory.badge}
              </div>
            </div>

            {/* Quick Layer Switcher Pills */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                backgroundColor: '#F5F3EE',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #DDD9D0'
              }}
            >
              {currentCategory.layers.map((layer, idx) => {
                const isActive = activeLayerIndex === idx;
                return (
                  <button
                    key={layer.number}
                    type="button"
                    onClick={() => setActiveLayerIndex(idx)}
                    style={{
                      backgroundColor: isActive ? '#181817' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#706E68',
                      border: isActive ? '1px solid #181817' : '1px solid #DDD9D0',
                      borderRadius: '6px',
                      padding: '8px 4px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', opacity: isActive ? 0.8 : 0.6, fontWeight: 700 }}>
                      LAYER {layer.number}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {layer.title.split('/')[0].trim()}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Layer Deep Dive Card */}
            <div 
              style={{
                marginTop: '1.25rem',
                backgroundColor: '#FAF8F5',
                borderRadius: '8px',
                border: '1px solid #E5E1D8',
                padding: '1.15rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-bronze)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Layer {currentCategory.layers[activeLayerIndex].number} • {currentCategory.layers[activeLayerIndex].subtitle}
                </span>
                <span style={{ fontSize: '0.68rem', backgroundColor: '#FFFFFF', border: '1px solid #DDD9D0', padding: '2px 8px', borderRadius: '4px', color: '#181817', fontWeight: 600 }}>
                  {currentCategory.layers[activeLayerIndex].feature}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600, color: '#181817', marginBottom: '0.35rem' }}>
                {currentCategory.layers[activeLayerIndex].title}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#706E68', lineHeight: 1.5, margin: 0 }}>
                {currentCategory.layers[activeLayerIndex].description}
              </p>
            </div>
          </div>

          {/* RIGHT: The 4 Step Layers Structured List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {currentCategory.layers.map((layer, idx) => {
              const isSelected = activeLayerIndex === idx;
              return (
                <div
                  key={layer.number}
                  onClick={() => setActiveLayerIndex(idx)}
                  style={{
                    backgroundColor: isSelected ? '#FFFFFF' : '#FAF8F5',
                    border: isSelected ? '1.5px solid #181817' : '1px solid #DDD9D0',
                    borderRadius: '8px',
                    padding: '1.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 6px 20px rgba(24, 24, 23, 0.05)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div 
                      style={{
                        backgroundColor: isSelected ? '#181817' : '#EDEAE4',
                        color: isSelected ? '#FFFFFF' : '#706E68',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {layer.number}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <h3 
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.12rem',
                            fontWeight: 600,
                            color: '#181817',
                            margin: 0
                          }}
                        >
                          {layer.title}
                        </h3>
                        {isSelected && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-bronze)', fontWeight: 600 }}>Active Layer</span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--accent-bronze)', fontWeight: 600, marginBottom: '0.35rem' }}>
                        {layer.subtitle}
                      </div>

                      <p 
                        style={{
                          fontSize: '0.82rem',
                          color: '#706E68',
                          lineHeight: 1.5,
                          margin: 0
                        }}
                      >
                        {layer.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Factual Trust & Guarantee Bar (Prompt 23: Factual supporting copy, replacement guarantee) */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DDD9D0',
            borderRadius: '10px',
            padding: '1.75rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#FAF8F5',
                border: '1px solid #DDD9D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-bronze)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#181817', margin: '0 0 4px 0' }}>
                Help with delivery damage
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#706E68', lineHeight: 1.45, margin: 0 }}>
                If your order arrives damaged, contact the studio with your order reference and clear photos of the item and packaging so we can help.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#FAF8F5',
                border: '1px solid #DDD9D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-bronze)',
                flexShrink: 0
              }}
            >
              <Box size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#181817', margin: '0 0 4px 0' }}>
                Accurate Optical Acrylic Glazing
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#706E68', lineHeight: 1.45, margin: 0 }}>
                We use 2mm shatter-resistant cast acrylic rather than standard picture glass. It provides crystal-clear optical clarity while preventing transit fractures.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#FAF8F5',
                border: '1px solid #DDD9D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-bronze)',
                flexShrink: 0
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#181817', margin: '0 0 4px 0' }}>
                Pan-India Tracked Express
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#706E68', lineHeight: 1.45, margin: 0 }}>
                Every consignment is shipped with reputable express courier services featuring live SMS and WhatsApp tracking to all Indian pin codes.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
