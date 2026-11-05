import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Droplet, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Eye, 
  X, 
  Compass, 
  Clock, 
  ArrowRight,
  Plus,
  Heart
} from 'lucide-react';

import { ITRA_CATEGORIES, ITRA_PRODUCTS } from '../data/itraProducts';
export { ITRA_CATEGORIES, ITRA_PRODUCTS } from '../data/itraProducts';

export default function ItraPerfumesPage({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('All Itra');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalSelectedSize, setModalSelectedSize] = useState('6ml');
  const [addedToastId, setAddedToastId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtered Products
  const filteredProducts = activeCategory === 'All Itra'
    ? ITRA_PRODUCTS
    : ITRA_PRODUCTS.filter(p => p.category === activeCategory);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setModalSelectedSize(product.defaultSize || Object.keys(product.prices)[0]);
  };

  const handleQuickAdd = (product, sizeKey = null) => {
    if (!onAddToCart) return;
    const targetSize = sizeKey || product.defaultSize || Object.keys(product.prices)[0];
    const targetPrice = product.prices[targetSize] || product.price;

    const cartPayload = {
      id: `${product.id}-${targetSize}-${Date.now()}`,
      type: 'itra_perfume',
      productId: product.id,
      title: `${product.name} (${targetSize})`,
      subTitle: product.family,
      volume: targetSize,
      price: targetPrice,
      quantity: 1,
      image: product.image,
      alcoholFree: true
    };

    onAddToCart(cartPayload);
    setAddedToastId(product.id);
    setTimeout(() => setAddedToastId(null), 2500);
  };

  const handleModalAdd = (isSample = false) => {
    if (!selectedProduct || !onAddToCart) return;
    const size = isSample ? '3ml' : modalSelectedSize;
    const price = isSample ? selectedProduct.samplePrice : selectedProduct.prices[size];

    const cartPayload = {
      id: `${selectedProduct.id}-${size}-${Date.now()}`,
      type: 'itra_perfume',
      productId: selectedProduct.id,
      title: `${selectedProduct.name} (${size})`,
      subTitle: selectedProduct.family,
      volume: size,
      price: price,
      quantity: 1,
      image: selectedProduct.image,
      alcoholFree: true
    };

    onAddToCart(cartPayload);
    setAddedToastId(selectedProduct.id);
    setSelectedProduct(null);
  };

  return (
    <div style={{ backgroundColor: '#F5F3EE', minHeight: '100vh', color: '#181817' }}>

      {/* Modern Niche Fragrance Boutique Hero */}
      <section 
        style={{
          padding: 'clamp(4.5rem, 7vw, 6.5rem) 0 clamp(2.5rem, 4vw, 3.5rem) 0',
          borderBottom: '1px solid #DDD9D0',
          backgroundColor: '#20201E', // Modern dark brown/olive tone
          color: '#F5F3ED',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div className="container-custom">
          
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent-bronze)',
              fontWeight: 700,
              marginBottom: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '4px 12px',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <Droplet size={13} />
            <span>AL-NOOR • Artisanal Perfume House</span>
          </div>

          <h1 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#F5F3ED',
              margin: '0 0 1rem 0'
            }}
          >
            The Itra Collection
          </h1>

          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.96rem, 1.2vw, 1.1rem)',
              color: 'rgba(245, 243, 237, 0.82)',
              maxWidth: '620px',
              margin: '0 auto 1.75rem auto',
              lineHeight: 1.6
            }}
          >
            Traditional pure perfume oils distilled in Kannauj, Taif, and Assam. 100% concentrated, free from alcohol and synthetic fillers — crafted for skin, prayer, and enduring memory.
          </p>

          {/* Value Pills Bar */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.25rem',
              fontSize: '0.78rem',
              color: '#D8CEBE',
              letterSpacing: '0.04em'
            }}
          >
            <span>• 100% Pure Alcohol-Free Oil</span>
            <span>• Hand-Cut Crystal Applicators</span>
            <span>• 18+ Hours Skin Longevity</span>
            <span>• 3ml Discovery Samples Available</span>
          </div>

        </div>
      </section>

      {/* Category Filter Pills (Prompt 19: All Itra, Men, Women, Unisex, Discovery Sets, Gift Sets) */}
      <section 
        style={{
          position: 'sticky',
          top: '72px',
          zIndex: 40,
          backgroundColor: 'rgba(245, 243, 238, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #DDD9D0',
          padding: '0.85rem 0'
        }}
      >
        <div className="container-custom">
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '2px'
            }}
          >
            {ITRA_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.04em',
                    backgroundColor: isActive ? '#181817' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#706E68',
                    border: isActive ? '1px solid #181817' : '1px solid #DDD9D0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
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
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Grid (Prompt 19: Large bottle image, Name, Short fragrance family, Size, Price) */}
      <section style={{ padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="container-custom">

          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'baseline', 
              marginBottom: '2rem',
              borderBottom: '1px solid #EAE6DC',
              paddingBottom: '0.75rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#706E68', fontWeight: 600 }}>
                Showing {filteredProducts.length} Fragrances
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#9B7A50', fontWeight: 600 }}>
              All formulations 100% uncut & alcohol-free
            </div>
          </div>

          {/* Cards Grid (3-4 col desktop, 2-col tablet, 1-col mobile) */}
          <div className="itra-boutique-grid">
            <style>{`
              .itra-boutique-grid {
                display: grid;
                grid-template-columns: repeat(1, 1fr);
                gap: 1.75rem;
              }
              @media (min-width: 600px) {
                .itra-boutique-grid {
                  grid-template-columns: repeat(2, 1fr);
                  gap: 1.75rem;
                }
              }
              @media (min-width: 992px) {
                .itra-boutique-grid {
                  grid-template-columns: repeat(3, 1fr);
                  gap: 2rem;
                }
              }
              @media (min-width: 1200px) {
                .itra-boutique-grid {
                  grid-template-columns: repeat(4, 1fr);
                  gap: 2rem;
                }
              }
            `}</style>

            {filteredProducts.map((product) => {
              const isToast = addedToastId === product.id;

              return (
                <div
                  key={product.id}
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
                    e.currentTarget.style.boxShadow = '0 14px 32px rgba(24, 24, 23, 0.1)';
                    e.currentTarget.style.borderColor = '#C5BFB2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(24, 24, 23, 0.04)';
                    e.currentTarget.style.borderColor = '#DDD9D0';
                  }}
                >
                  {/* Large Bottle Image (~75% proportion) */}
                  <div 
                    onClick={() => openProductModal(product)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1 / 1.15',
                      backgroundColor: '#EDEAE4',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
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

                    {/* Category Tag Top Left */}
                    <span 
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        backgroundColor: '#20201E',
                        color: '#FFFFFF',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {product.category}
                    </span>

                    {/* Quick View Button on Hover */}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(4px)',
                        color: '#181817',
                        padding: '5px 10px',
                        borderRadius: '100px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #DDD9D0'
                      }}
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </div>
                  </div>

                  {/* Card Content: Name, Short fragrance family, Size, Price */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    
                    <h3 
                      onClick={() => openProductModal(product)}
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.18rem',
                        fontWeight: 500,
                        color: '#181817',
                        lineHeight: 1.25,
                        margin: '0 0 0.35rem 0',
                        cursor: 'pointer'
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* Short Fragrance Family (Prompt 19 requirement) */}
                    <div 
                      style={{
                        fontSize: '0.74rem',
                        color: '#9B7A50', // Bronze accent
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        marginBottom: '0.75rem',
                        lineHeight: 1.3
                      }}
                    >
                      {product.family}
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Size & Starting Price Row */}
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
                      <span style={{ fontSize: '0.74rem', color: '#706E68' }}>
                        Size: <strong>{product.defaultSize}</strong>
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#181817' }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Action: ADD TO BAG */}
                    <button
                      onClick={() => handleQuickAdd(product)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: isToast ? '#27AE60' : '#181817',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
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
                      onMouseEnter={(e) => {
                        if (!isToast) e.currentTarget.style.backgroundColor = '#9B7A50';
                      }}
                      onMouseLeave={(e) => {
                        if (!isToast) e.currentTarget.style.backgroundColor = '#181817';
                      }}
                    >
                      {isToast ? (
                        <>
                          <Check size={14} />
                          <span>Added To Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>ADD TO BAG</span>
                        </>
                      )}
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Product Details Modal (Prompt 19: Top Notes, Heart Notes, Base Notes, Character, Best For, Size, How To Apply, ADD TO BAG & ADD SAMPLE) */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(24, 24, 23, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '880px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              border: '1px solid #DDD9D0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
            }}
          >
            {/* Modal Left: Flacon Image */}
            <div style={{ position: 'relative', minHeight: '360px', backgroundColor: '#EDEAE4' }}>
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  backgroundColor: '#20201E',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '4px'
                }}
              >
                {selectedProduct.category}
              </div>
            </div>

            {/* Modal Right: Olfactory Breakdown */}
            <div style={{ padding: 'clamp(1.75rem, 3.5vw, 2.5rem)', display: 'flex', flexDirection: 'column' }}>
              
              {/* Close Button Top Right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9B7A50', fontWeight: 700 }}>
                  {selectedProduct.family}
                </span>

                <button
                  onClick={() => setSelectedProduct(null)}
                  aria-label="Close modal"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#F5F3EE',
                    border: '1px solid #DDD9D0',
                    color: '#181817',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <h2 
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.65rem',
                  fontWeight: 500,
                  color: '#181817',
                  margin: '0 0 0.4rem 0',
                  lineHeight: 1.2
                }}
              >
                {selectedProduct.name}
              </h2>

              {/* Character & Best For */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#181817' }}>Character: </span>
                  <span style={{ color: '#706E68' }}>{selectedProduct.character}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: '#181817' }}>Best For: </span>
                  <span style={{ color: '#706E68' }}>{selectedProduct.bestFor}</span>
                </div>
              </div>

              {/* Olfactory Pyramid (Prompt 19 requirement) */}
              <div 
                style={{
                  backgroundColor: '#F9F8F5',
                  border: '1px solid #EAE6DC',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#706E68', fontWeight: 700, marginBottom: '0.65rem' }}>
                  Olfactory Notes
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div>
                    <strong style={{ color: '#181817' }}>Top Notes: </strong>
                    <span style={{ color: '#706E68' }}>{selectedProduct.topNotes}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#181817' }}>Heart Notes: </strong>
                    <span style={{ color: '#706E68' }}>{selectedProduct.heartNotes}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#181817' }}>Base Notes: </strong>
                    <span style={{ color: '#706E68' }}>{selectedProduct.baseNotes}</span>
                  </div>
                </div>
              </div>

              {/* How To Apply (Prompt 19 requirement) */}
              <div style={{ marginBottom: '1.25rem', fontSize: '0.8rem', color: '#706E68', lineHeight: 1.45 }}>
                <strong style={{ color: '#181817' }}>How To Apply: </strong>
                {selectedProduct.howToApply}
              </div>

              {/* Size Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#706E68', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Choose Volume:
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {Object.keys(selectedProduct.prices).map((sz) => {
                    const isSelected = modalSelectedSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setModalSelectedSize(sz)}
                        style={{
                          padding: '0.5rem 0.85rem',
                          borderRadius: '4px',
                          border: isSelected ? '2px solid #181817' : '1px solid #DDD9D0',
                          backgroundColor: isSelected ? '#181817' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#181817',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {sz} — ₹{selectedProduct.prices[sz]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ flex: 1 }} />

              {/* Action Buttons: ADD TO BAG & optional ADD SAMPLE / DISCOVERY SIZE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                
                <button
                  onClick={() => handleModalAdd(false)}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    backgroundColor: '#181817',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9B7A50'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181817'}
                >
                  <ShoppingBag size={16} />
                  <span>ADD TO BAG — ₹{selectedProduct.prices[modalSelectedSize]}</span>
                </button>

                {selectedProduct.samplePrice && (
                  <button
                    onClick={() => handleModalAdd(true)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      color: '#181817',
                      border: '1px solid #181817',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F3EE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Droplet size={14} color="#9B7A50" />
                    <span>ADD SAMPLE / DISCOVERY SIZE (3ml — ₹{selectedProduct.samplePrice})</span>
                  </button>
                )}

                <Link
                  to={`/itra/${selectedProduct.id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '0.76rem',
                    color: '#706E68',
                    textDecoration: 'underline',
                    marginTop: '6px'
                  }}
                >
                  View Full Fragrance Editorial Page & Notes →
                </Link>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
