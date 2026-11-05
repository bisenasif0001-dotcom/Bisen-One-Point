import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, MessageCircle, ArrowRight, Crop } from 'lucide-react';
import { FRAME_SIZES, FRAME_FINISHES } from '../data/products';
import { getWhatsAppUrl } from '../data/businessConfig';
import { SpacingSection, PrimaryButton, SecondaryButton } from './ui';

export default function QuickPriceEstimator() {
  const [selectedSize, setSelectedSize] = useState(FRAME_SIZES[1]); // Default A4
  const [selectedFinish, setSelectedFinish] = useState(FRAME_FINISHES[0]); // Default Classic Black

  const estimatedPrice = Math.round(selectedSize.basePrice + selectedFinish.extraPrice);

  const handleWhatsAppQuote = () => {
    const message = `*HELLO AL-NOOR! INSTANT PRICE INQUIRY:*\n\n` +
      `📌 *Size:* ${selectedSize.name} (${selectedSize.dimensionsCm} / ${selectedSize.dimensionsInch})\n` +
      `🖼️ *Moulding Finish:* ${selectedFinish.name} (${selectedFinish.profileWidth})\n` +
      `💰 *Estimated Price:* ₹${estimatedPrice}\n\n` +
      `Please confirm dispatch timeline and photo upload details.`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <SpacingSection id="quick-estimator" background="warm" borderBottom={true}>
      <div 
        style={{
          backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(2rem, 4vw, 3rem)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2.5rem',
              alignItems: 'center'
            }} 
            className="estimator-grid"
          >
            <style>{`
              @media (min-width: 960px) {
                .estimator-grid { grid-template-columns: 1.15fr 0.85fr !important; }
              }
            `}</style>

            {/* Left Controls */}
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
                Instant Transparency
              </span>

              <h2 
                style={{ 
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)', 
                  fontWeight: 500, 
                  color: '#181817', 
                  letterSpacing: '-0.015em',
                  lineHeight: 1.15,
                  margin: '0 0 0.6rem 0'
                }}
              >
                10-Second Framing Price Calculator
              </h2>
              
              <p 
                style={{ 
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-secondary)', 
                  fontSize: '0.94rem', 
                  marginBottom: '1.75rem', 
                  lineHeight: 1.6 
                }}
              >
                Choose your desired size and moulding profile to calculate your all-inclusive framing price upfront.
              </p>

              {/* 1. Size Picker */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#181817', marginBottom: '0.5rem' }}>
                  Step 1: Choose Frame Size (A5 to A1)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {FRAME_SIZES.map((s) => {
                    const isSelected = selectedSize.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s)}
                        style={{
                          backgroundColor: isSelected ? '#181817' : '#F5F3EE',
                          color: isSelected ? '#FFFFFF' : '#181817',
                          border: isSelected ? '1px solid #181817' : '1px solid #DDD9D0',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 4px',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 600 : 500,
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '0.92rem' }}>{s.id}</div>
                        <div style={{ fontSize: '0.68rem', opacity: isSelected ? 0.85 : 0.65 }}>
                          {s.dimensionsCm.split(' ')[0]}cm
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Moulding Finish Picker */}
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#181817', marginBottom: '0.5rem' }}>
                  Step 2: Choose Frame Moulding Profile
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                  {FRAME_FINISHES.map((f) => {
                    const isSelected = selectedFinish.id === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFinish(f)}
                        style={{
                          backgroundColor: isSelected ? '#FFFFFF' : '#F5F3EE',
                          border: isSelected ? '1.5px solid #181817' : '1px solid #DDD9D0',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div 
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            backgroundColor: f.colorHex,
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
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#181817', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {f.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#706E68' }}>
                            +₹{f.extraPrice}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Summary Card */}
            <div 
              style={{
                backgroundColor: '#FAF8F5',
                padding: '2.25rem 2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #DDD9D0',
                textAlign: 'center'
              }}
            >
              <span 
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-bronze)',
                  display: 'block',
                  marginBottom: '0.4rem'
                }}
              >
                Estimated Finished Price
              </span>
              
              <div 
                style={{ 
                  fontSize: '2.8rem', 
                  fontWeight: 500, 
                  color: '#181817', 
                  margin: '0.25rem 0', 
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '-0.02em'
                }}
              >
                ₹{estimatedPrice}
              </div>

              <div style={{ fontSize: '0.92rem', color: '#181817', fontWeight: 600 }}>
                {selectedSize.name} • {selectedFinish.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#706E68', marginTop: '2px' }}>
                Dimensions: {selectedSize.dimensionsCm} ({selectedSize.dimensionsInch})
              </div>

              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: '#55534E',
                  margin: '1.25rem 0',
                  border: '1px solid #E6E2D8',
                  lineHeight: 1.5
                }}
              >
                ✓ Includes Optical Cast Acrylic, Fine Art Print & 4-Layer Packaging
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <PrimaryButton
                  to="/custom-framing"
                  state={{ frameId: selectedFinish.id }}
                  icon={Crop}
                  iconPosition="left"
                  fullWidth={true}
                  style={{ padding: '0.8rem 0.5rem', fontSize: '0.84rem' }}
                >
                  Customize Live
                </PrimaryButton>

                <SecondaryButton
                  onClick={handleWhatsAppQuote}
                  icon={MessageCircle}
                  iconPosition="left"
                  fullWidth={true}
                  style={{ padding: '0.8rem 0.5rem', fontSize: '0.84rem' }}
                >
                  WhatsApp Quote
                </SecondaryButton>
              </div>
            </div>

          </div>
        </div>
    </SpacingSection>
  );
}
