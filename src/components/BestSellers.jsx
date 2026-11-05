import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, ArrowUpRight, Check, X } from 'lucide-react';

export const BEST_SELLERS_DATA = {
  FRAMES: [
    {
      id: 'regal-aurelia',
      name: 'Regal Aurelia Frame',
      price: 'From ₹349',
      unitPrice: 349,
      desc: 'Natural organic wood with polished gold fillet',
      primaryImage: '/frames/regal-aurelia/front.png',
      hoverImage: '/frames/regal-aurelia/corner.png',
      link: '/custom-framing'
    },
    {
      id: 'regal-noir',
      name: 'Regal Noir Frame',
      price: 'From ₹349',
      unitPrice: 349,
      desc: 'Matte black hardwood with white shadowline mount',
      primaryImage: '/frames/regal-noir/front.png',
      hoverImage: '/frames/regal-noir/layered.png',
      link: '/custom-framing'
    },
    {
      id: 'regal-heritage',
      name: 'Regal Heritage Walnut',
      price: 'From ₹499',
      unitPrice: 499,
      desc: 'Reeded dark walnut with regal gold inner border',
      primaryImage: '/frames/regal-heritage/front.png',
      hoverImage: '/frames/regal-heritage/corner.png',
      link: '/custom-framing'
    },
    {
      id: 'emberstone',
      name: 'Emberstone Antique Frame',
      price: 'From ₹549',
      unitPrice: 549,
      desc: 'Antique black, bronze and gold artisanal finish',
      primaryImage: '/frames/emberstone/front.png',
      hoverImage: '/frames/emberstone/layered.png',
      link: '/custom-framing'
    }
  ],
  'PHOTO PRINTS': [
    {
      id: 'prints-lustre',
      name: 'Lustre Studio Prints',
      price: 'From ₹29',
      unitPrice: 29,
      desc: '260 GSM fingerprint-resistant pearl',
      primaryImage: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      link: '/photo-prints'
    },
    {
      id: 'prints-matte',
      name: 'Smooth Matte Fine Art',
      price: 'From ₹49',
      unitPrice: 49,
      desc: 'Zero-glare premium matte photo paper',
      primaryImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=800&q=80',
      link: '/photo-prints'
    },
    {
      id: 'prints-gloss',
      name: 'Gloss Gallery Prints',
      price: 'From ₹29',
      unitPrice: 29,
      desc: 'Vibrant saturated high-gloss finish',
      primaryImage: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      link: '/photo-prints'
    },
    {
      id: 'prints-large-a3',
      name: 'A3 Statement Lab Print',
      price: 'From ₹349',
      unitPrice: 349,
      desc: 'Large architectural wall photo print',
      primaryImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
      link: '/photo-prints'
    }
  ],
  CARDS: [
    {
      id: 'card-birthday',
      name: 'Personalised Birthday Card',
      price: 'From ₹149',
      unitPrice: 149,
      desc: '350 GSM textured board with envelope',
      primaryImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
      link: '/birthday-cards'
    },
    {
      id: 'card-foil',
      name: 'Gilded Champagne Foil Card',
      price: 'From ₹199',
      unitPrice: 199,
      desc: 'Hot-stamped metallic typography',
      primaryImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      link: '/cards'
    },
    {
      id: 'card-islamic',
      name: 'Barakah & Dua Greeting',
      price: 'From ₹149',
      unitPrice: 149,
      desc: 'Sacred Thuluth calligraphy card',
      primaryImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      link: '/cards'
    },
    {
      id: 'card-wedding',
      name: 'Wedding & Nikah Suite',
      price: 'From ₹199',
      unitPrice: 199,
      desc: 'Heavyweight 350 GSM textured card ready',
      primaryImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      link: '/cards'
    }
  ],
  'WALL ART': [
    {
      id: 'art-ayat-kursi',
      name: 'Ayat-ul-Kursi Sacred Print',
      price: 'From ₹899',
      unitPrice: 899,
      desc: 'Handcrafted framed Islamic calligraphy',
      primaryImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      link: '/islamic-art'
    },
    {
      id: 'art-surah-ikhlas',
      name: 'Surah Al-Ikhlas Gold Art',
      price: 'From ₹999',
      unitPrice: 999,
      desc: 'Professional 6-colour print in bespoke frame',
      primaryImage: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      link: '/islamic-art'
    },
    {
      id: 'art-four-quls',
      name: 'Four Quls Gallery Trio',
      price: 'From ₹1,899',
      unitPrice: 1899,
      desc: 'Set of 3 coordinated living room frames',
      primaryImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      link: '/islamic-art'
    },
    {
      id: 'art-bismillah',
      name: 'Minimal Bismillah Monogram',
      price: 'From ₹749',
      unitPrice: 749,
      desc: 'Contemporary monochrome sacred print',
      primaryImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
      link: '/islamic-art'
    }
  ],
  ITRA: [
    {
      id: 'itra-oud-royale',
      name: 'Oud Royale Al-Maliki',
      price: 'From ₹899',
      unitPrice: 899,
      desc: 'Pure aged Cambodian Dehn Al Oud (6ml)',
      primaryImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
      link: '/itra-perfumes'
    },
    {
      id: 'itra-mukhallat',
      name: 'Mukhallat Al-Sultan',
      price: 'From ₹749',
      unitPrice: 749,
      desc: 'Taif rose, ambergris & sandalwood (6ml)',
      primaryImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      link: '/itra-perfumes'
    },
    {
      id: 'itra-musk-tahara',
      name: 'White Musk Tahara',
      price: 'From ₹499',
      unitPrice: 499,
      desc: 'Silky powdery floral skin scent (12ml)',
      primaryImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      link: '/itra-perfumes'
    },
    {
      id: 'itra-discovery-box',
      name: 'Artisanal Discovery Box',
      price: 'From ₹1,299',
      unitPrice: 1299,
      desc: 'Curated 4-vial luxury gift collection',
      primaryImage: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      link: '/itra-perfumes'
    }
  ]
};

export const BEST_SELLER_FRAMES = BEST_SELLERS_DATA.FRAMES;

export default function BestSellers({ onAddToCart }) {
  const navigate = useNavigate();
  const tabs = ['FRAMES', 'PHOTO PRINTS', 'CARDS', 'WALL ART', 'ITRA'];
  const [activeTab, setActiveTab] = useState('FRAMES');
  const [hoveredId, setHoveredId] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const currentProducts = BEST_SELLERS_DATA[activeTab] || [];

  return (
    <section 
      style={{
        padding: 'clamp(4.5rem, 7vw, 6.5rem) 0',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="container-custom">
        
        {/* Section Header: "OUR MOST LOVED" */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto clamp(2rem, 4vw, 3rem) auto' }}>
          <span 
            style={{ 
              fontFamily: 'var(--font-sans)',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent-bronze)',
              display: 'block',
              marginBottom: '0.5rem'
            }}
          >
            Curated Bestsellers
          </span>
          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 3.6vw, 3rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: '#181817',
              letterSpacing: '-0.015em',
              margin: 0
            }}
          >
            OUR MOST LOVED
          </h2>
        </div>

        {/* 5 Category Discovery Tabs */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'clamp(0.4rem, 1.2vw, 0.75rem)',
            marginBottom: 'clamp(2.5rem, 4vw, 3.5rem)',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? '#181817' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#706E68',
                  border: isActive ? '1px solid #181817' : '1px solid #E6E2D8',
                  borderRadius: '999px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid: Desktop 4 Columns / Mobile Horizontal Swipe Carousel */}
        <div className="bestsellers-tabbed-grid">
          <style>{`
            .bestsellers-tabbed-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 1.75rem;
            }

            @media (max-width: 1024px) {
              .bestsellers-tabbed-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
              }
            }

            @media (max-width: 640px) {
              .bestsellers-tabbed-grid {
                display: flex !important;
                overflow-x: auto !important;
                scroll-snap-type: x mandatory;
                gap: 1.25rem !important;
                padding-bottom: 1.25rem;
                -webkit-overflow-scrolling: touch;
              }
              .tabbed-product-card {
                flex: 0 0 80% !important;
                max-width: 300px;
                scroll-snap-align: start;
              }
            }

            .tabbed-product-card {
              display: flex;
              flex-direction: column;
              text-decoration: none;
              color: inherit;
              background: #FFFFFF;
              border: 1px solid #EAE6DC;
              border-radius: 6px;
              overflow: hidden;
              transition: transform 0.25s ease, box-shadow 0.25s ease;
            }

            .tabbed-product-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 14px 30px -6px rgba(24, 24, 23, 0.08);
            }

            .product-media-container {
              width: 100%;
              aspect-ratio: 4 / 4.8;
              position: relative;
              overflow: hidden;
              background-color: #F5F3EE;
            }

            .product-primary-img,
            .product-hover-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .product-hover-img {
              position: absolute;
              inset: 0;
              opacity: 0;
            }

            .tabbed-product-card:hover .product-primary-img {
              transform: scale(1.04);
            }

            .tabbed-product-card:hover .product-hover-img {
              opacity: 1;
              transform: scale(1.04);
            }

            .quick-view-hover-btn {
              position: absolute;
              bottom: 12px;
              left: 12px;
              right: 12px;
              background: rgba(255, 255, 255, 0.92);
              backdrop-filter: blur(8px);
              color: #181817;
              border: 1px solid rgba(24, 24, 23, 0.12);
              border-radius: 4px;
              padding: 7px 0;
              font-size: 0.76rem;
              font-weight: 600;
              letter-spacing: 0.04em;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              opacity: 0;
              transform: translateY(8px);
              transition: opacity 0.25s ease, transform 0.25s ease;
              cursor: pointer;
            }

            .tabbed-product-card:hover .quick-view-hover-btn {
              opacity: 1;
              transform: translateY(0);
            }

            @media (max-width: 640px) {
              /* Prompt 36: No hover-dependent actions on mobile */
              .quick-view-hover-btn {
                opacity: 1 !important;
                transform: translateY(0) !important;
                position: absolute !important;
                bottom: 8px !important;
                left: 8px !important;
                right: 8px !important;
                min-height: 40px !important;
                background: rgba(255, 255, 255, 0.95) !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
              }
            }

            .product-info-minimal {
              padding: 1.15rem 1rem 1rem 1rem;
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              justify-content: space-between;
            }
          `}</style>

          {currentProducts.map((prod) => (
            <div 
              key={prod.id} 
              className="tabbed-product-card"
              onMouseEnter={() => setHoveredId(prod.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Media occupies 75-80% of card */}
              <div className="product-media-container">
                <img 
                  src={prod.primaryImage} 
                  alt={prod.name} 
                  className="product-primary-img"
                  loading="lazy"
                />
                <img 
                  src={prod.hoverImage} 
                  alt={prod.name} 
                  className="product-hover-img"
                  loading="lazy"
                />

                {/* Quick View Button on Desktop Hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickViewProduct(prod);
                  }}
                  className="quick-view-hover-btn"
                >
                  <Eye size={13} />
                  <span>Quick View</span>
                </button>
              </div>

              {/* Minimal Product Information: Name, Starting Price, Very Short Descriptor */}
              <div className="product-info-minimal">
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h3 
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: '#181817',
                        lineHeight: 1.25,
                        margin: 0
                      }}
                    >
                      {prod.name}
                    </h3>
                    <span 
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#181817',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {prod.price}
                    </span>
                  </div>

                  <p 
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.78rem',
                      color: '#706E68',
                      lineHeight: 1.45,
                      margin: 0
                    }}
                  >
                    {prod.desc}
                  </p>
                </div>

                <Link
                  to={prod.link}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: 'var(--accent-bronze)',
                    textDecoration: 'none',
                    marginTop: '0.75rem',
                    paddingTop: '0.65rem',
                    minHeight: '44px',
                    borderTop: '1px solid #F5F3EE'
                  }}
                >
                  <span>Explore Product</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Minimal Quick View Modal */}
      {quickViewProduct && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 23, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '520px',
              width: '100%',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 24px 48px rgba(0,0,0,0.18)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={16} />
            </button>

            <div style={{ width: '100%', height: '320px', backgroundColor: '#F5F3EE' }}>
              <img 
                src={quickViewProduct.primaryImage} 
                alt={quickViewProduct.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ padding: '1.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-bronze)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                {activeTab} Collection
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 600, color: '#181817', margin: '4px 0 0.5rem 0' }}>
                {quickViewProduct.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#65635E', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                {quickViewProduct.desc}. Handcrafted to order with meticulous studio quality and Pan-India secure delivery.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EAE6DC', paddingTop: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#8A8780', display: 'block' }}>Starting Price</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: 700, color: '#181817' }}>
                    {quickViewProduct.price}
                  </span>
                </div>

                <Link
                  to={quickViewProduct.link}
                  onClick={() => setQuickViewProduct(null)}
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.86rem' }}
                >
                  <span>Customise & Order</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
