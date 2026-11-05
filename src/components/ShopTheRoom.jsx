import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Sparkles, ShoppingBag, Eye, ArrowRight, Check } from 'lucide-react';

export default function ShopTheRoom({ onAddToCart }) {
  const [activePin, setActivePin] = useState(null);

  const rooms = [
    {
      id: 'room-1',
      title: 'Majestic Living Room Centerpiece',
      location: 'South Mumbai Residence',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      artName: 'Ayat-ul-Kursi (A1 Monumental)',
      frameName: 'Antique Victorian Carved Gold',
      size: 'A1 (59.4 x 84.1 cm)',
      price: 3249,
      pinX: '52%',
      pinY: '38%'
    },
    {
      id: 'room-2',
      title: 'Spiritual Master Suite Gallery Wall',
      location: 'Banjara Hills, Hyderabad',
      image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1000&q=80',
      artName: 'The 4 Quls 3-Frame Set (A3 Size)',
      frameName: 'Royal Baroque Gold Leaf',
      size: 'A3 (29.7 x 42.0 cm)',
      price: 2179,
      pinX: '48%',
      pinY: '42%'
    }
  ];

  return (
    <section id="lookbook" style={{
      padding: '5rem 0',
      background: 'var(--bg-surface-elevated)',
      borderBottom: '1px solid var(--border-glass)'
    }}>
      <div className="container-custom">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '740px', margin: '0 auto 3rem auto' }}>
          <span 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-bronze)',
              display: 'block',
              marginBottom: '0.6rem'
            }}
          >
            Real Interior Inspiration
          </span>
          <h2 style={{ 
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 3.4vw, 2.7rem)', 
            fontWeight: 500, 
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            marginBottom: '0.85rem'
          }}>
            Shop The Living Room Lookbook
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6 }}>
            See how our handcrafted frames and sacred calligraphy elevate real homes. Click on any room below to shop the exact size & moulding setup.
          </p>
        </div>

        {/* 2 Room Lookbook Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem'
        }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                border: '1.5px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Interactive Room Photo Container with Hotspot Pin */}
              <div style={{
                position: 'relative',
                height: '320px',
                overflow: 'hidden',
                backgroundColor: '#0a0e14'
              }}>
                <img
                  src={room.image}
                  alt={room.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Ambient Dark Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(8, 11, 15, 0.85) 0%, transparent 40%)'
                }} />

                {/* Interactive Clickable Hotspot Pin */}
                <button
                  onClick={() => setActivePin(activePin === room.id ? null : room.id)}
                  style={{
                    position: 'absolute',
                    top: room.pinY,
                    left: room.pinX,
                    transform: 'translate(-50%, -50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1.5px solid #171717',
                    color: '#171717',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s'
                  }}
                  title="Click to view product details"
                >
                  +
                </button>

                {/* Hotspot Floating Tooltip Card */}
                {activePin === room.id && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#1A1A18',
                    border: '1px solid var(--border-dark)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    maxWidth: '240px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                    zIndex: 10
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-bronze)', fontWeight: 600, letterSpacing: '0.06em' }}>EXACT SETUP USED</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{room.artName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9E9B94' }}>{room.frameName}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>₹{room.price}</div>
                  </div>
                )}

                {/* Room Location Tag */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '16px'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                    {room.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#f5e5a4', marginTop: '1px' }}>
                    📍 {room.location}
                  </div>
                </div>
              </div>

              {/* Card Footer Info */}
              <div style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-surface)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Featured Frame Specification:</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {room.artName} • <span style={{ color: 'var(--text-gold)' }}>{room.size.split(' ')[0]}</span>
                  </div>
                </div>

                <Link
                  to="/islamic-art"
                  className="btn-gold"
                  style={{ padding: '0.6rem 1.15rem', fontSize: '0.82rem' }}
                >
                  Shop This Look <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
