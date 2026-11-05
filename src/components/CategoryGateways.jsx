import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryGateways() {
  const categories = [
    {
      id: 'custom-photo-frames',
      title: 'Custom Photo Frames',
      subtitle: 'Upload your photo and create a frame.',
      link: '/custom-framing',
      image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'framed-prints',
      title: 'Framed Prints',
      subtitle: 'Ready-made art and professionally framed photography.',
      link: '/frames-catalogue',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'photo-prints',
      title: 'Photo Prints',
      subtitle: 'Premium colour photo printing.',
      link: '/photo-prints',
      image: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'cards-and-invitations',
      title: 'Cards & Invitations',
      subtitle: 'Birthday, anniversary, wedding and personalised cards.',
      link: '/create-card',
      image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'wall-art',
      title: 'Wall Art',
      subtitle: 'Islamic art, family art and gallery wall collections.',
      link: '/islamic-art',
      image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'itra-fragrance',
      title: 'Itra & Fragrance',
      subtitle: 'Premium attars, perfume oils and fragrance gift sets.',
      link: '/itra-perfumes',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80'
    }
  ];

  return (
    <section 
      style={{
        padding: 'clamp(4.5rem, 8vw, 7rem) 0',
        backgroundColor: 'var(--bg-main)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="container-custom">
        
        {/* Section Heading: "What Would You Like To Create?" */}
        <div 
          style={{ 
            textAlign: 'center', 
            maxWidth: '680px', 
            margin: '0 auto clamp(2.5rem, 4.5vw, 4rem) auto' 
          }}
        >
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
            Services & Collections
          </span>
          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.1rem, 3.6vw, 3rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              letterSpacing: '-0.015em'
            }}
          >
            What Would You Like To Create?
          </h2>
        </div>

        {/* 6 Image-Led Tiles: Desktop 3x2, Tablet 2-col, Mobile 1-col */}
        <div className="gateway-tiles-grid">
          <style>{`
            .gateway-tiles-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1.75rem;
            }

            @media (max-width: 1024px) {
              .gateway-tiles-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
              }
            }

            @media (max-width: 640px) {
              .gateway-tiles-grid {
                grid-template-columns: 1fr;
                gap: 1.25rem;
              }
            }

            .gateway-tile-card {
              position: relative;
              border-radius: 6px;
              overflow: hidden;
              aspect-ratio: 4 / 4.75;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              text-decoration: none;
              background-color: #ECE8E0;
              transition: transform 0.35s ease, box-shadow 0.35s ease;
            }

            .gateway-tile-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 16px 36px -8px rgba(24, 24, 23, 0.16);
            }

            .gateway-tile-img {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .gateway-tile-card:hover .gateway-tile-img {
              transform: scale(1.05);
            }

            .gateway-tile-scrim {
              position: absolute;
              inset: 0;
              background: linear-gradient(
                to top,
                rgba(18, 18, 17, 0.88) 0%,
                rgba(18, 18, 17, 0.42) 45%,
                rgba(18, 18, 17, 0.05) 75%,
                transparent 100%
              );
              transition: opacity 0.35s ease;
              pointer-events: none;
            }

            .gateway-tile-card:hover .gateway-tile-scrim {
              opacity: 0.96;
            }

            .gateway-tile-content {
              position: relative;
              z-index: 2;
              padding: 1.75rem 1.5rem;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              gap: 1rem;
            }

            .gateway-tile-arrow {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.16);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
              flex-shrink: 0;
            }

            .gateway-tile-card:hover .gateway-tile-arrow {
              transform: translate(2px, -2px);
              background: #FFFFFF;
              color: #181817;
            }
          `}</style>

          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={cat.link}
              className="gateway-tile-card"
            >
              {/* Editorial Photography */}
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="gateway-tile-img"
                loading="lazy"
              />

              {/* Scrim Overlay for high text contrast */}
              <div className="gateway-tile-scrim" />

              {/* Minimal Text Overlay: Title + 1 Sentence + Small Arrow */}
              <div className="gateway-tile-content">
                <div>
                  <h3 
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.35rem, 1.9vw, 1.6rem)',
                      fontWeight: 600,
                      color: '#FBF9F5',
                      lineHeight: 1.2,
                      marginBottom: '0.45rem',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {cat.title}
                  </h3>
                  <p 
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.82rem',
                      color: '#D4CFC7',
                      lineHeight: 1.45,
                      fontWeight: 400,
                      margin: 0,
                      maxWidth: '92%'
                    }}
                  >
                    {cat.subtitle}
                  </p>
                </div>

                {/* Small understated arrow */}
                <div className="gateway-tile-arrow" aria-hidden="true">
                  <ArrowUpRight size={18} strokeWidth={2} />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
