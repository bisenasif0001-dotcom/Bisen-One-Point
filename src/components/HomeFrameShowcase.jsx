import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, Layers, Ruler } from 'lucide-react';
import { FRAME_FINISHES } from '../data/products';

export default function HomeFrameShowcase() {
  const [selectedFrame, setSelectedFrame] = useState(FRAME_FINISHES[0]); // Default Regal Aurelia
  const [activeAngle, setActiveAngle] = useState('front');

  const currentAngleObj = selectedFrame.angles?.find(a => a.id === activeAngle);
  const currentImage = currentAngleObj ? currentAngleObj.image : selectedFrame.frontImage || selectedFrame.image;

  return (
    <section 
      style={{
        padding: 'clamp(4.5rem, 7vw, 6.5rem) 0',
        backgroundColor: '#F7F5F0',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="container-custom">
        
        {/* Editorial Section Header */}
        <div 
          style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginBottom: 'clamp(2rem, 4vw, 3rem)', 
            gap: '1.5rem' 
          }}
        >
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
              Real Studio Mouldings
            </span>
            <h2 
              style={{ 
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 3.4vw, 2.8rem)', 
                fontWeight: 500, 
                lineHeight: 1.15,
                color: '#181817',
                letterSpacing: '-0.015em',
                margin: 0
              }}
            >
              Touch & Inspect Real Frame Mouldings
            </h2>
            <p 
              style={{ 
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-secondary)', 
                fontSize: '0.98rem', 
                marginTop: '0.6rem',
                lineHeight: 1.6,
                maxWidth: '640px'
              }}
            >
              Crafted in solid timber and layered luxury finishes. Select any moulding below to inspect its mitre joinery, layered depth, and side profile. All frames are made-to-order across every listed size.
            </p>
          </div>

          <Link 
            to="/frames-catalogue" 
            className="btn-secondary" 
            style={{ 
              padding: '0.75rem 1.4rem', 
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <span>Browse Full Catalogue</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Live Wall Mockup & Swatches Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2.5rem',
            alignItems: 'center'
          }} 
          className="moulding-showcase-grid"
        >
          <style>{`
            @media (min-width: 960px) {
              .moulding-showcase-grid { grid-template-columns: 1fr 1.15fr !important; }
            }
          `}</style>

          {/* Left: Architectural Gallery Wall & Real Frame Showcase */}
          <div 
            style={{
              backgroundColor: '#EDEAE3',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(2rem, 4vw, 3.5rem) 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              border: '1px solid #DDD8CD',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            {/* Soft Ambient Skylight */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '70%',
                height: '140px',
                background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.7) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} 
            />

            {/* Real Frame Studio Image */}
            <div 
              style={{
                width: '100%',
                maxWidth: '310px',
                height: '350px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={currentImage}
                alt={`${selectedFrame.name} - ${activeAngle}`}
                style={{ 
                  maxHeight: '100%', 
                  maxWidth: '100%', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 16px 32px rgba(24, 24, 23, 0.16))',
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>

            {/* Interactive Angle Switcher Tabs */}
            {selectedFrame.angles && selectedFrame.angles.length > 0 && (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '1.25rem',
                  padding: '3px',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #DDD8CD',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {selectedFrame.angles.map((ang) => {
                  const isAngActive = activeAngle === ang.id;
                  return (
                    <button
                      key={ang.id}
                      type="button"
                      onClick={() => setActiveAngle(ang.id)}
                      style={{
                        border: 'none',
                        background: isAngActive ? '#181817' : 'transparent',
                        color: isAngActive ? '#FFFFFF' : '#73716C',
                        fontSize: '0.72rem',
                        fontWeight: isAngActive ? 700 : 500,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {ang.label.replace(' View', '').replace(' Joint', '')}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, color: '#181817' }}>
                {selectedFrame.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#706E68', marginTop: '2px' }}>
                {selectedFrame.profileWidth} • {selectedFrame.finish}
              </div>
            </div>
          </div>

          {/* Right: Interactive Frame Swatches Grid */}
          <div>
            <div 
              style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '0.84rem', 
                fontWeight: 600, 
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--accent-bronze)', 
                marginBottom: '1rem' 
              }}
            >
              Select Real Moulding Collection:
            </div>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.75rem'
              }}
            >
              {FRAME_FINISHES.map((f) => {
                const isSelected = selectedFrame.id === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFrame(f);
                      setActiveAngle('front');
                    }}
                    style={{
                      backgroundColor: isSelected ? '#FFFFFF' : '#F5F3EE',
                      border: isSelected ? '1.5px solid #181817' : '1px solid #DDD9D0',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {/* Real Corner Macro Thumbnail */}
                    <div 
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#EDEAE3',
                        border: '1px solid rgba(0,0,0,0.1)',
                        flexShrink: 0
                      }} 
                    >
                      <img 
                        src={f.macroImage || f.image} 
                        alt={f.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div 
                        style={{ 
                          fontSize: '0.84rem', 
                          fontWeight: 700, 
                          color: '#181817', 
                          whiteSpace: 'nowrap', 
                          textOverflow: 'ellipsis', 
                          overflow: 'hidden' 
                        }}
                      >
                        {f.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#706E68', marginTop: '1px' }}>
                        {f.finish}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Reusable Clean Action Panel */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1.35rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#181817' }}>
                  Selected: {selectedFrame.name} ({selectedFrame.finish})
                </div>
                <div style={{ fontSize: '0.76rem', color: '#706E68', marginTop: '3px' }}>
                  Available in all sizes: A5, A4, A3, A2, A1, 4×6, 5×7, 8×10 with custom mats.
                </div>
              </div>

              <Link
                to="/custom-framing"
                state={{ frameId: selectedFrame.id }}
                className="btn-primary"
                style={{ 
                  padding: '0.75rem 1.4rem', 
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Frame Your Photo</span>
                <ArrowRight size={15} />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
