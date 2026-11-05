import React from 'react';

const PRINT_FEATURES = [
  {
    title: 'Smooth Colour Gradations',
    desc: 'Light Cyan and Light Magenta ink channels eliminate visible dot grain, ensuring seamless transitions across skies and soft shadows.'
  },
  {
    title: 'Natural-Looking Skin Tones',
    desc: 'Formulated specifically for portraiture, rendering warm, true-to-life complexions without harsh color shifts or oversaturation.'
  },
  {
    title: 'Sharp Photographic Detail',
    desc: 'High-density Micro Piezo print nozzles produce ultra-fine ink droplets for crisp facial textures, fine fabrics, and sharp architectural edges.'
  },
  {
    title: 'Individually Quality Checked',
    desc: 'Every single sheet is visually inspected under calibrated 5000K daylight before proceeding to framing to guarantee zero banding or defects.'
  }
];

export default function PrintingProcessSection() {
  return (
    <section 
      id="photo-printing"
      style={{
        padding: 'clamp(4rem, 7vw, 6.5rem) 0',
        backgroundColor: '#F9F8F5',
        borderBottom: '1px solid #EAE6DC'
      }}
    >
      <div className="container-custom">

        <div className="printing-split-grid">
          <style>{`
            .printing-split-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 2.5rem;
              align-items: center;
            }
            @media (min-width: 992px) {
              .printing-split-grid {
                grid-template-columns: 1.15fr 1fr;
                gap: 4rem;
              }
            }
          `}</style>

          {/* LEFT: Single Strong Technical Workshop Photo */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#EDEAE4',
                border: '1px solid #E4DFD5',
                boxShadow: '0 16px 36px -8px rgba(23, 23, 23, 0.08)'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80" 
                alt="Epson EcoTank L18050 6-Colour Photo Printing Process"
                loading="lazy"
                style={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Technical Equipment Badge Overlay */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(23, 23, 23, 0.92)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
                    Epson EcoTank L18050
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#A8A49C', marginTop: '1px' }}>
                    A3+ 6-Colour Photo System
                  </div>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    gap: '4px',
                    alignItems: 'center' 
                  }}
                  title="Cyan, Magenta, Yellow, Black, Light Cyan, Light Magenta"
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00A3E0', display: 'inline-block' }} title="Cyan" />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#66D1FF', display: 'inline-block' }} title="Light Cyan" />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E4007F', display: 'inline-block' }} title="Magenta" />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF80B5', display: 'inline-block' }} title="Light Magenta" />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFD700', display: 'inline-block' }} title="Yellow" />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1C1C1E', display: 'inline-block', border: '1px solid rgba(255,255,255,0.4)' }} title="Black" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Clear Technical Narrative & 4 Pillars */}
          <div>
            
            {/* Subheading & Title */}
            <span 
              style={{ 
                fontSize: '0.74rem', 
                letterSpacing: '0.12em', 
                textTransform: 'uppercase', 
                color: 'var(--accent-bronze)', 
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.4rem'
              }}
            >
              Professional 6-Colour Epson Photo Printing
            </span>

            <h2 
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.1rem, 3.4vw, 2.85rem)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '1rem'
              }}
            >
              Printed For Photography
            </h2>

            <p 
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.96rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2rem'
              }}
            >
              Standard commercial 4-color office printers struggle with skin tones and gentle gradients. We produce every photo on dedicated 6-colour Epson photographic hardware to ensure true color fidelity before framing.
            </p>

            {/* 4 Concise Visual Pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem 1.25rem' }}>
              {PRINT_FEATURES.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div 
                      style={{ 
                        width: '5px', 
                        height: '5px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--accent-bronze)',
                        flexShrink: 0 
                      }} 
                    />
                    <h3 
                      style={{ 
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.05rem', 
                        fontWeight: 600, 
                        color: 'var(--text-primary)',
                        margin: 0
                      }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p 
                    style={{ 
                      fontSize: '0.84rem', 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.5,
                      margin: 0,
                      paddingLeft: '0.8rem'
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Technical Sub-spec Strip */}
            <div 
              style={{
                marginTop: '2rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #EAE6DC',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem 2rem',
                fontSize: '0.78rem',
                color: '#73716C'
              }}
            >
              <div>
                <strong style={{ color: '#171717', fontWeight: 600 }}>Ink Tech:</strong> Micro Piezo 6-Colour Dye
              </div>
              <div>
                <strong style={{ color: '#171717', fontWeight: 600 }}>Paper Stock:</strong> 260+ GSM Lustre Photo Paper
              </div>
              <div>
                <strong style={{ color: '#171717', fontWeight: 600 }}>Inspection:</strong> 100% Hand Pre-Checked
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
