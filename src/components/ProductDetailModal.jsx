import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, ShoppingBag, MessageCircle, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { FRAME_SIZES, FRAME_FINISHES } from '../data/products';
import { getWhatsAppUrl } from '../data/businessConfig';

export default function ProductDetailModal({ item, isOpen, onClose, onAddToCart }) {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState('framed');
  const [selectedSize, setSelectedSize] = useState('A4');
  const [selectedFinish, setSelectedFinish] = useState(FRAME_FINISHES[0]);
  const [addedToast, setAddedToast] = useState(false);

  if (!isOpen || !item) return null;

  const sizeObj = FRAME_SIZES.find(s => s.id === selectedSize) || FRAME_SIZES[1];

  const calculatePrice = () => {
    const base = item.framedPriceA4 || item.basePrice || 599;
    const multiplier = sizeObj.multiplier || 1.35;
    const finishDiff = selectedFinish.extraPrice || 0;
    if (selectedFormat === 'unframed') {
      return Math.round((item.unframedPriceA4 || base * 0.7) * (multiplier / 1.35));
    }
    return Math.round((base * (multiplier / 1.35)) + (finishDiff * 0.5));
  };

  const price = calculatePrice();

  const handleAdd = () => {
    const cartItem = {
      id: `${item.id}-${selectedFormat}-${selectedSize}-${Date.now()}`,
      type: item.category || 'art_frame',
      title: item.title,
      format: selectedFormat === 'framed' ? 'Framed (Ready to Hang)' : 'Without Frame (Rolled)',
      size: selectedSize,
      dimensions: sizeObj.dimensionsCm,
      finish: selectedFormat === 'framed' ? selectedFinish.name : 'None',
      price: price,
      quantity: 1,
      image: item.image
    };

    onAddToCart(cartItem);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  const handleWhatsApp = () => {
    const message = `Order Inquiry for ${item.title} (${selectedSize}, ${selectedFinish.name}, ₹${price}). Please share delivery schedule.`;
    window.open(getWhatsAppUrl(message), '_blank');
  };

  const handleGoToFullPage = () => {
    onClose();
    navigate(`/product/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 23, 23, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          padding: 'clamp(1.5rem, 3vw, 2.25rem)',
          border: '1px solid #EAE6DC',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#FAF9F6',
            border: '1px solid #ECE7DE',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#171717'
          }}
        >
          <X size={17} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="modal-split">
          <style>{`
            @media (min-width: 768px) {
              .modal-split {
                grid-template-columns: 1fr 1.15fr !important;
              }
            }
          `}</style>

          {/* Left: Frame Presentation */}
          <div 
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#FAF9F6',
              border: '1px solid #ECE7DE',
              aspectRatio: '4 / 3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8%'
            }}
          >
            <div 
              style={{
                width: '84%',
                height: '88%',
                border: `12px solid ${selectedFinish.colorHex || '#1C1C1E'}`,
                backgroundColor: '#FFFFFF',
                padding: '8px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                position: 'relative'
              }}
            >
              <img 
                src={item.image} 
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>

          {/* Right: Controls & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-bronze)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                {item.category || 'Atelier Frame'}
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 600, color: '#171717', margin: '4px 0 6px 0' }}>
                {item.title}
              </h2>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#171717' }}>
                ₹{price.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#171717', display: 'block', marginBottom: '4px' }}>
                Size: {sizeObj.name}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {['A5', 'A4', 'A3', 'A2', 'A1'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      padding: '6px 2px',
                      border: selectedSize === sz ? '1.5px solid #171717' : '1px solid #ECE7DE',
                      backgroundColor: selectedSize === sz ? '#171717' : '#FAF9F6',
                      color: selectedSize === sz ? '#FFFFFF' : '#171717',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Finish Selector */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#171717', display: 'block', marginBottom: '4px' }}>
                Finish: {selectedFinish.name}
              </label>
              <div className="modal-finish-selector-grid">
                <style>{`
                  .modal-finish-selector-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                  }
                  @media (max-width: 540px) {
                    .modal-finish-selector-grid {
                      grid-template-columns: repeat(2, 1fr) !important;
                    }
                  }
                `}</style>
                {FRAME_FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFinish(f)}
                    style={{
                      padding: '6px 6px',
                      border: selectedFinish.id === f.id ? '1.5px solid #171717' : '1px solid #ECE7DE',
                      backgroundColor: selectedFinish.id === f.id ? '#FAF8F5' : '#FFFFFF',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      overflow: 'hidden'
                    }}
                  >
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: f.colorHex || '#1C1C1E', flexShrink: 0 }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart & WhatsApp */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid #ECE7DE' }}>
              <button
                type="button"
                onClick={handleAdd}
                className="btn-primary"
                style={{ padding: '0.75rem', fontSize: '0.88rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
              >
                <ShoppingBag size={15} />
                <span>Add To Cart • ₹{price.toLocaleString('en-IN')}</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleGoToFullPage}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-bronze)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <span>View Full Details Page</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#57554E',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#171717'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#57554E'}
                >
                  <MessageCircle size={14} color="#25D366" />
                  <span>Need Help? WhatsApp Us</span>
                </button>
              </div>

              {addedToast && (
                <div style={{ fontSize: '0.76rem', color: '#2D8A4E', fontWeight: 600, textAlign: 'center' }}>
                  ✓ Added to cart!
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
