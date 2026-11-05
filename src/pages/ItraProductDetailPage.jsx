import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, Check, Droplets, Sparkles, Clock, 
  ShieldCheck, Heart, ArrowLeft, Gift, Compass, ChevronDown, ChevronUp 
} from 'lucide-react';
import { ITRA_PRODUCTS } from '../data/itraProducts';
import NotFoundPage from './NotFoundPage';
import { ITRA_PHOTOGRAPHY_SYSTEM } from '../data/photographySystem';
import SmartCrossSell from '../components/SmartCrossSell';

export default function ItraProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const foundProduct = ITRA_PRODUCTS.find(p => p.id === id);
  const product = foundProduct || ITRA_PRODUCTS[0];
  const sizeOptions = Object.entries(product.prices).map(([size, price]) => ({
    size, price, label: size.includes('×') ? `${size} set` : `${size} Perfume Oil`,
    desc: size.includes('×') ? 'Complete set as listed' : 'Choose your preferred bottle size'
  }));
  const [selectedSizeKey, setSelectedSizeKey] = useState(product.defaultSize);
  const selectedSize = sizeOptions.find(option => option.size === selectedSizeKey) || sizeOptions[0];
  const setSelectedSize = option => setSelectedSizeKey(option.size);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  // Standardized 6-Angle Itra Photography System (Prompt 28)
  const galleryImages = ITRA_PHOTOGRAPHY_SYSTEM.map((shot) => {
    if (shot.id === 'bottle-front') return { ...shot, url: product.image };
    return { ...shot, url: shot.image };
  });

  const currentPrice = selectedSize.price * quantity;

  const handleAddToBag = (sizeObj = selectedSize, qty = quantity) => {
    if (!onAddToCart) return;

    onAddToCart({
      id: `${product.id}-${sizeObj.size}-${Date.now()}`,
      type: 'itra_perfume',
      productId: product.id,
      title: product.name,
      subTitle: `${sizeObj.size} Pure Perfume Oil • ${product.family}`,
      volume: sizeObj.size,
      price: sizeObj.price,
      quantity: qty,
      image: product.image,
      alcoholFree: true
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  if (!foundProduct) return <NotFoundPage />;

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* Clean Minimal Breadcrumb */}
      <div style={{ borderBottom: '1px solid #DDD9D0', backgroundColor: '#FFFFFF' }}>
        <div className="container-custom" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#706E68' }}>
            <Link to="/" style={{ color: '#706E68', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link to="/itra" style={{ color: '#706E68', textDecoration: 'none' }}>Itra & Fragrance</Link>
            <span>/</span>
            <span style={{ color: '#181817', fontWeight: 600 }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom" style={{ paddingTop: 'clamp(1.5rem, 3.5vw, 2.75rem)' }}>

        {/* ======================================================== */}
        {/* DESKTOP SPLIT: LEFT EDITORIAL BOTTLE GALLERY, RIGHT INFO */}
        {/* ======================================================== */}
        <div className="itra-pdp-grid">
          <style>{`
            .itra-pdp-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 2.25rem;
              margin-bottom: clamp(3rem, 6vw, 4.5rem);
            }
            @media (min-width: 992px) {
              .itra-pdp-grid {
                grid-template-columns: 1.05fr 1fr;
                gap: 3.5rem;
                align-items: start;
              }
            }
          `}</style>

          {/* LEFT: Large Editorial Bottle Photography & Gallery */}
          <div style={{ position: 'sticky', top: '100px' }}>
            
            {/* Main Stage Image */}
            <div 
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#EDEAE4',
                border: '1px solid #DDD9D0',
                boxShadow: '0 12px 36px rgba(24, 24, 23, 0.05)',
                aspectRatio: '4 / 3'
              }}
            >
              <img 
                src={galleryImages[activeImageIndex].url} 
                alt={`${product.name} - ${galleryImages[activeImageIndex].title}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease'
                }}
              />

              {/* Minimal Niche Tag Top Left */}
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
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em'
                }}
              >
                100% Pure Attar • Alcohol Free
              </div>

              {/* Sillage Tag Bottom Left */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(6px)',
                  color: '#181817',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                <Clock size={12} color="#9B7A50" />
                <span>18+ Hours Longevity on Skin</span>
              </div>
            </div>

            {/* 6-Angle Standardized Itra Thumbnails Strip (Prompt 28) */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                marginTop: '12px'
              }}
            >
              {galleryImages.map((img, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    title={img.desc}
                    style={{
                      border: isActive ? '2px solid #181817' : '1px solid #DDD9D0',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      backgroundColor: '#FFFFFF',
                      padding: 0,
                      cursor: 'pointer',
                      aspectRatio: '1',
                      position: 'relative',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <img 
                      src={img.url} 
                      alt={img.label || img.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: isActive ? '#181817' : 'rgba(24, 24, 23, 0.75)',
                        color: '#FFFFFF',
                        fontSize: '0.55rem',
                        fontWeight: 600,
                        padding: '1px 0',
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {img.shortLabel || img.label}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT: Fragrance Controls & Information (Prompt 26 exact specs) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* 1. Fragrance Name & Olfactive Family */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span 
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--accent-bronze)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em'
                  }}
                >
                  {product.family}
                </span>
                <span style={{ color: '#DDD9D0' }}>•</span>
                <span style={{ fontSize: '0.74rem', color: '#706E68' }}>Artisanal Extraction</span>
              </div>

              <h1 
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2rem, 3.2vw, 2.6rem)',
                  fontWeight: 500,
                  color: '#181817',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  margin: '0 0 0.5rem 0'
                }}
              >
                {product.name}
              </h1>

              {/* 2. Short Personality Statement (Prompt 26 requirement) */}
              <p 
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  color: '#42403B',
                  lineHeight: 1.5,
                  margin: '0 0 0.75rem 0'
                }}
              >
                "{product.character} — crafted for those who value quiet distinction."
              </p>

              {/* 3. Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#181817' }}>
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {quantity > 1 && (
                  <span style={{ fontSize: '0.85rem', color: '#706E68' }}>
                    (₹{selectedSize.price} each)
                  </span>
                )}
                <span style={{ fontSize: '0.74rem', color: '#706E68' }}>
                  Includes gift box, velvet pouch & taxes
                </span>
              </div>
            </div>

            {/* 4. Size Selector (Prompt 26: Size selector) */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#181817', display: 'block', marginBottom: '6px' }}>
                Select Flacon Volume: <span style={{ fontWeight: 500, color: '#706E68' }}>{selectedSize.label}</span>
              </label>

              <div className="itra-volume-selector-grid">
                <style>{`
                  .itra-volume-selector-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                  }
                  @media (max-width: 640px) {
                    .itra-volume-selector-grid {
                      grid-template-columns: 1fr !important;
                    }
                  }
                `}</style>
                {sizeOptions.map((sz) => {
                  const isSelected = selectedSize.size === sz.size;
                  return (
                    <button
                      key={sz.size}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        border: isSelected ? '1.5px solid #181817' : '1px solid #DDD9D0',
                        backgroundColor: isSelected ? '#181817' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#181817',
                        borderRadius: '6px',
                        padding: '10px 8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{sz.size}</div>
                      <div style={{ fontSize: '0.74rem', opacity: isSelected ? 0.9 : 0.7, marginTop: '2px' }}>
                        ₹{sz.price.toLocaleString('en-IN')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Quantity Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#181817' }}>
                Quantity:
              </label>

              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #DDD9D0',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: '6px 12px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    color: '#181817'
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, padding: '0 8px', minWidth: '24px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: '6px 12px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    color: '#181817'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* 6. Primary Action: ADD TO BAG (Prompt 26 requirement) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleAddToBag(selectedSize, quantity)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  backgroundColor: '#181817',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}
              >
                <ShoppingBag size={17} />
                <span>ADD TO BAG • ₹{currentPrice.toLocaleString('en-IN')}</span>
              </button>

              {/* Toast Feedback */}
              {addedToast && (
                <div 
                  style={{
                    backgroundColor: '#EBF6EE',
                    color: '#246B3E',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid #D1EBD7'
                  }}
                >
                  <Check size={14} /> Added to your shopping bag!
                </div>
              )}

              {/* Quick Sample Action if viewing full size */}
              {product.prices['3ml'] && selectedSize.size !== '3ml' && (
                <button
                  type="button"
                  onClick={() => handleAddToBag(sizeOptions[0], 1)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF',
                    color: '#181817',
                    border: '1px solid #DDD9D0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Droplets size={14} color="#9B7A50" />
                  <span>Not sure? Add 3ml Discovery Sample (₹{sizeOptions[0].price})</span>
                </button>
              )}
            </div>

            {/* Micro Niche Guarantee Bar */}
            <div 
              className="itra-guarantee-bar-grid"
              style={{
                paddingTop: '12px',
                borderTop: '1px solid #DDD9D0',
                fontSize: '0.72rem',
                color: '#706E68',
                textAlign: 'center'
              }}
            >
              <style>{`
                .itra-guarantee-bar-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 8px;
                }
                @media (max-width: 540px) {
                  .itra-guarantee-bar-grid {
                    grid-template-columns: 1fr !important;
                    gap: 6px !important;
                  }
                }
              `}</style>
              <div>✨ 100% Pure Attar</div>
              <div>🚫 Zero Alcohol</div>
              <div>🎁 Presentation Box</div>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* FRAGRANCE OVERVIEW & OLFACTIVE PYRAMID (Prompt 26 exact)  */}
        {/* Character, Notes (Top, Heart, Base), When To Wear,       */}
        {/* How To Apply, Gifting                                    */}
        {/* ======================================================== */}
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #DDD9D0',
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.02)',
              marginBottom: '2rem'
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '1px solid #F0ECE1', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-bronze)', display: 'block', marginBottom: '0.25rem' }}>
                Olfactive Composition
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 500, color: '#181817', margin: 0 }}>
                FRAGRANCE OVERVIEW
              </h2>
            </div>

            {/* 1. Character (Prompt 26: Character: Warm • Woody • Intimate) */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#706E68', display: 'block', marginBottom: '0.35rem' }}>
                Character Profile
              </label>
              <div style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', color: '#181817', fontWeight: 600 }}>
                {product.family} • {product.character}
              </div>
            </div>

            {/* 2. Olfactive Notes Pyramid (Prompt 26: Notes: Top, Heart, Base) */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#706E68', display: 'block', marginBottom: '1rem' }}>
                Fragrance Notes
              </label>

              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem'
                }}
              >
                {/* Top Notes */}
                <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #E5E1D8', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-bronze)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    01 • Top Notes (First 30 Mins)
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#181817', fontWeight: 600, lineHeight: 1.4 }}>
                    {product.topNotes}
                  </div>
                </div>

                {/* Heart Notes */}
                <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #E5E1D8', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-bronze)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    02 • Heart Notes (2 to 8 Hours)
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#181817', fontWeight: 600, lineHeight: 1.4 }}>
                    {product.heartNotes}
                  </div>
                </div>

                {/* Base Notes */}
                <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #E5E1D8', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-bronze)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    03 • Base Notes (8 to 18+ Hours)
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#181817', fontWeight: 600, lineHeight: 1.4 }}>
                    {product.baseNotes}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Deep Dive Pillars: When To Wear, How To Apply, Gifting (Prompt 26 exact) */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                borderTop: '1px solid #F0ECE1',
                paddingTop: '1.75rem'
              }}
            >
              {/* When To Wear */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Compass size={15} color="#9B7A50" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#181817' }}>When To Wear</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#706E68', lineHeight: 1.55, margin: 0 }}>
                  {product.bestFor}. Its rich warmth unfolds beautifully during cooler evenings and formal gatherings.
                </p>
              </div>

              {/* How To Apply */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Droplets size={15} color="#9B7A50" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#181817' }}>How To Apply</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#706E68', lineHeight: 1.55, margin: 0 }}>
                  {product.howToApply}
                </p>
              </div>

              {/* Gifting */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Gift size={15} color="#9B7A50" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#181817' }}>Gifting</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#706E68', lineHeight: 1.55, margin: 0 }}>
                  Arrives in a rigid presentation hard-box with a soft plush velvet travel pouch. An exquisite standalone gift or paired alongside a custom frame.
                </p>
              </div>
            </div>

          </div>

          {/* Smart Cross-Sell Section (Prompt 17 contextual) */}
          <div style={{ marginTop: '3.5rem', borderTop: '1px solid #DDD9D0', paddingTop: '2.5rem' }}>
            <SmartCrossSell 
              sourceContext="itra" 
              onAddToCart={onAddToCart}
            />
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MOBILE STICKY BOTTOM PURCHASE BAR                        */}
      {/* ======================================================== */}
      <div className="mobile-sticky-purchase-bar">
        <style>{`
          .mobile-sticky-purchase-bar {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #FFFFFF;
            border-top: 1px solid #DDD9D0;
            padding: 10px 16px;
            box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
            z-index: 99;
            align-items: center;
            justify-content: space-between;
          }
          @media (max-width: 767px) {
            .mobile-sticky-purchase-bar {
              display: flex !important;
            }
          }
        `}</style>
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#181817' }}>
            ₹{currentPrice.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#706E68' }}>
            {product.name.split(' ')[0]} • {selectedSize.size}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleAddToBag(selectedSize, quantity)}
          style={{
            padding: '10px 20px',
            fontSize: '0.88rem',
            fontWeight: 600,
            backgroundColor: '#181817',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ShoppingBag size={15} />
          <span>ADD TO BAG</span>
        </button>
      </div>

    </div>
  );
}
