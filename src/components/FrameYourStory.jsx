import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const STORY_OCCASIONS = [
  {
    id: 'wedding-day',
    title: 'Wedding Day',
    tagline: 'Vows, laughter, and the beginning of always',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    link: '/custom-framing?occasion=wedding'
  },
  {
    id: 'family-portraits',
    title: 'Family Portraits',
    tagline: 'Generations together in warm daylight',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    link: '/custom-framing?occasion=family'
  },
  {
    id: 'baby-memories',
    title: 'Baby Memories',
    tagline: 'Tiny hands and fleeting first milestones',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
    link: '/custom-framing?occasion=baby'
  },
  {
    id: 'parents',
    title: 'Parents',
    tagline: 'The unconditional love that shaped your life',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    link: '/custom-framing?occasion=parents'
  },
  {
    id: 'graduation',
    title: 'Graduation',
    tagline: 'Hard-earned triumphs and new horizons',
    image: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=800&q=80',
    link: '/custom-framing?occasion=graduation'
  },
  {
    id: 'travel-memories',
    title: 'Travel Memories',
    tagline: 'Horizons and adventures you never want to forget',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    link: '/custom-framing?occasion=travel'
  },
  {
    id: 'islamic-art',
    title: 'Islamic Art',
    tagline: 'Sacred verses bringing barakah to living spaces',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    link: '/islamic-art'
  },
  {
    id: 'memorial-frames',
    title: 'Memorial Frames',
    tagline: 'Cherished souls remembered with dignity and quiet grace',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    link: '/custom-framing?occasion=memorial'
  }
];

export default function FrameYourStory() {
  const navigate = useNavigate();

  const handleCardClick = (link) => {
    navigate(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      id="frame-your-story"
      style={{
        padding: 'clamp(4.5rem, 8vw, 7rem) 0',
        backgroundColor: '#F5F3EE',
        borderBottom: '1px solid #EAE6DC'
      }}
    >
      <div className="container-custom">

        {/* Section Header */}
        <div style={{ maxWidth: '640px', margin: '0 auto clamp(2.5rem, 5vw, 3.75rem) auto', textAlign: 'center' }}>
          <span 
            style={{ 
              fontSize: '0.74rem', 
              letterSpacing: '0.14em', 
              textTransform: 'uppercase', 
              color: 'var(--accent-bronze)', 
              fontWeight: 700,
              display: 'block',
              marginBottom: '0.5rem'
            }}
          >
            Explore By Occasion
          </span>
          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem'
            }}
          >
            Frame Your Story
          </h2>
          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.96rem, 1.2vw, 1.08rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.55
            }}
          >
            Every home wall tells a chapter. Discover handcrafted frames curated by the memories and milestones that matter most.
          </p>
        </div>

        {/* 8 Image-Led Cards Grid */}
        <div className="story-grid">
          <style>{`
            .story-grid {
              display: grid;
              grid-template-columns: repeat(1, 1fr);
              gap: 1.25rem;
            }
            @media (min-width: 600px) {
              .story-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
              }
            }
            @media (min-width: 1024px) {
              .story-grid {
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
              }
            }
            @media (max-width: 599px) {
              .story-grid {
                display: flex;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: 1rem;
                padding-bottom: 1rem;
                margin-left: -1rem;
                margin-right: -1rem;
                padding-left: 1rem;
                padding-right: 1rem;
                -webkit-overflow-scrolling: touch;
              }
              .story-grid::-webkit-scrollbar {
                height: 4px;
              }
              .story-grid::-webkit-scrollbar-thumb {
                background: #171717;
                border-radius: 4px;
              }
              .story-card {
                flex: 0 0 78%;
                scroll-snap-align: start;
              }
            }
          `}</style>

          {STORY_OCCASIONS.map((item) => (
            <div
              key={item.id}
              className="story-card"
              onClick={() => handleCardClick(item.link)}
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                aspectRatio: '3 / 4',
                backgroundColor: '#EDEAE4',
                boxShadow: '0 4px 16px rgba(23, 23, 23, 0.05)',
                transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(23, 23, 23, 0.12)';
                const img = e.currentTarget.querySelector('.story-img');
                if (img) img.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(23, 23, 23, 0.05)';
                const img = e.currentTarget.querySelector('.story-img');
                if (img) img.style.transform = 'scale(1)';
              }}
            >
              {/* Background Emotional Lifestyle Image */}
              <img
                src={item.image}
                alt={item.title}
                className="story-img"
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              />

              {/* Cinematic Vignette Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.82) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Minimal Text Content (Bottom Aligned) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1.25rem 1.15rem',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                      margin: 0,
                      color: '#FFFFFF'
                    }}
                  >
                    {item.title}
                  </h3>
                  <div 
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}
                  >
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.82)',
                    lineHeight: 1.4,
                    margin: 0
                  }}
                >
                  {item.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
