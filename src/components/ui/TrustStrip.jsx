import React from 'react';
import { ShieldCheck, Printer, Box, Truck } from 'lucide-react';

const DEFAULT_TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Zero Transit Breakage',
    desc: '2mm shatter-resistant optical acrylic & 4-tier crating. 100% free transit replacement.'
  },
  {
    icon: Printer,
    title: 'Epson 6-Colour Lab',
    desc: 'Light Cyan & Light Magenta micro-droplets eliminate visible grain for natural skin tones.'
  },
  {
    icon: Box,
    title: 'Solid Hardwood Mouldings',
    desc: 'Seasoned natural timber frames joined with reinforced 45° corner joints.'
  },
  {
    icon: Truck,
    title: 'Pan-India Express',
    desc: 'Dispatched in 2–3 business days with live SMS and WhatsApp tracking.'
  }
];

/**
 * Reusable Trust Strip Primitive
 * Supports 'bar' (horizontal ribbon) and 'grid' (multi-column) layouts.
 */
export function TrustStrip({
  items = DEFAULT_TRUST_ITEMS,
  variant = 'bar', // 'bar' | 'grid'
  className = '',
  style = {}
}) {
  if (variant === 'grid') {
    return (
      <div
        className={`trust-strip-grid ${className}`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          ...style
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FAF9F6',
                  border: '1px solid #E6E2D8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-bronze)',
                  flexShrink: 0
                }}
              >
                <Icon size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#171717', margin: '0 0 2px 0' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#73716C', lineHeight: 1.45, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default: 'bar' (Clean horizontal studio bar)
  return (
    <div
      className={`trust-strip-bar ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E6E2D8',
        borderBottom: '1px solid #E6E2D8',
        padding: '1.5rem 0',
        ...style
      }}
    >
      <div className="container-custom">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#FAF9F6',
                    border: '1px solid #E6E2D8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-bronze)',
                    flexShrink: 0
                  }}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#171717' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#73716C', lineHeight: 1.35 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TrustStrip;
