import React, { useState } from 'react';
import { Maximize2, Sparkles, X, Check, ArrowRight, Layers } from 'lucide-react';
import { FRAME_SIZES } from '../data/products';

export default function SizeComparisonGuide({ isOpen, onClose, onSelectSizeForCustomizer }) {
  const [activeSize, setActiveSize] = useState(FRAME_SIZES[2]); // Default A3

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: '960px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          border: '1.5px solid var(--border-active)',
          background: 'var(--bg-surface)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div>
            <span 
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--accent-bronze)',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              Official Standard Proportions
            </span>
            <h3 style={{ 
              fontFamily: 'var(--font-serif)',
              fontSize: '1.65rem', 
              fontWeight: 500, 
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Frame Size Visualizer (A5 to A1 Scale Guide)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Interactive Size Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {FRAME_SIZES.map((size) => {
            const isSelected = activeSize.id === size.id;
            return (
              <button
                key={size.id}
                onClick={() => setActiveSize(size)}
                style={{
                  background: isSelected ? 'var(--text-primary)' : 'var(--bg-surface-elevated)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: '1.15rem' }}>{size.id}</div>
                <div style={{ fontSize: '0.72rem', opacity: isSelected ? 0.9 : 0.65, marginTop: '2px' }}>
                  {size.dimensionsCm}
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual Comparison Area */}
        <div style={{
          background: '#EDEAE3',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 1.5rem',
          border: '1px solid var(--border-color)',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '2rem'
        }}>
          {/* Active Frame Graphic with Real Scale */}
          <div style={{
            width: `${Math.min(220 * activeSize.scaleRatio, 360)}px`,
            aspectRatio: activeSize.aspectRatio,
            border: '10px solid #1C1C1E',
            boxShadow: '0 15px 35px rgba(0,0,0,0.18)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            marginBottom: '1.75rem',
            borderRadius: '2px'
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Size {activeSize.id}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: 600 }}>
              {activeSize.dimensionsCm}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ({activeSize.dimensionsInch})
            </div>
          </div>

          {/* Room Scale Elements (Sofa Silhouette) */}
          <div style={{
            width: '90%',
            height: '35px',
            background: '#D9D5CB',
            borderRadius: '6px 6px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#55534E',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
            border: '1px solid #CBC6B9'
          }}>
            Living Room Sofa Reference (200 cm Width)
          </div>
        </div>

        {/* Detailed Specs Table */}
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Format</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Dimensions (cm)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Dimensions (Inches)</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Recommended Best Use</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Base Price</th>
              </tr>
            </thead>
            <tbody>
              {FRAME_SIZES.map((s) => (
                <tr 
                  key={s.id} 
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: activeSize.id === s.id ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: 'var(--text-primary)',
                    fontWeight: activeSize.id === s.id ? 600 : 400
                  }}
                >
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{s.id}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{s.dimensionsCm}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{s.dimensionsInch}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{s.bestFor}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>₹{s.basePrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Action CTA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close Guide
          </button>
          <button
            onClick={() => {
              onSelectSizeForCustomizer(activeSize);
              onClose();
              const el = document.getElementById('frame-studio');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary"
          >
            Customize in {activeSize.id} Size Now <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
