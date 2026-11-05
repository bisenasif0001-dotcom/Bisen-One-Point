import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Sparkles, 
  Upload, 
  Layers, 
  ShieldCheck, 
  Mail, 
  Heart,
  Feather,
  Check
} from 'lucide-react';

export const CARD_CATEGORIES_DATA = [
  {
    id: 'birthday-cards',
    title: 'Birthday Cards',
    subtitle: 'From milestone celebrations to whimsical children’s wishes.',
    link: '/birthday-cards',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    count: '24 Designs'
  },
  {
    id: 'anniversary-cards',
    title: 'Anniversary Cards',
    subtitle: 'Romantic, timeless keepsakes celebrating years of shared devotion.',
    link: '/create-card?category=anniversary',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    count: '16 Designs'
  },
  {
    id: 'wedding-invitations',
    title: 'Wedding Invitations',
    subtitle: 'Bespoke Nikah, reception, and celebration invitation suites on textured cardstock.',
    link: '/create-card?category=wedding',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    count: '32 Suites'
  },
  {
    id: 'baby-announcements',
    title: 'Baby Announcements',
    subtitle: 'Delicate pastel typography welcoming precious new arrivals into the world.',
    link: '/create-card?category=baby',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
    count: '18 Designs'
  },
  {
    id: 'thank-you-cards',
    title: 'Thank You Cards',
    subtitle: 'Thoughtful, heartfelt gratitude stationery with matching hand-pressed envelopes.',
    link: '/create-card?category=thank-you',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    count: '14 Designs'
  },
  {
    id: 'eid-greetings',
    title: 'Eid Greetings',
    subtitle: 'Sacred calligraphy, crescent motifs and barakah-filled festive notes.',
    link: '/create-card?category=eid',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    count: '20 Designs'
  },
  {
    id: 'congratulations',
    title: 'Congratulations',
    subtitle: 'New home, graduation, career triumphs, and joyful milestone cards.',
    link: '/create-card?category=congratulations',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    count: '16 Designs'
  },
  {
    id: 'memorial-cards',
    title: 'Memorial & Condolence Cards',
    subtitle: 'Quiet, dignified remembrance and comforting words of solace.',
    link: '/create-card?category=memorial',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    count: '12 Designs'
  }
];

export const CURATED_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Minimalist Botanical',
    category: 'Birthday / Greeting',
    desc: 'Soft ivory cardstock with delicate olive sprig engraving.',
    price: '₹149',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
    link: '/cards/tpl-1'
  },
  {
    id: 'tpl-2',
    name: 'Gilded Champagne Foil',
    category: 'Wedding & Nikah',
    desc: 'Rich charcoal board with shimmering warm champagne foil lettering.',
    price: '₹199',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
    link: '/cards/tpl-2'
  },
  {
    id: 'tpl-3',
    name: 'Barakah & Dua Crescent',
    category: 'Eid & Islamic',
    desc: 'Sacred thuluth script with arabesque blind-embossed framing.',
    price: '₹149',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
    link: '/cards/tpl-3'
  },
  {
    id: 'tpl-4',
    name: 'Little Dreamer Whimsical',
    category: 'Baby / Kids Birthday',
    desc: 'Soft pastel confetti with hand-lettered celebratory headline.',
    price: '₹149',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    link: '/cards/tpl-4'
  }
];

export default function CardsInvitationsPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
      
      {/* 1. EDITORIAL HERO */}
      <section 
        style={{
          padding: 'clamp(4.5rem, 7vw, 6.5rem) 0 clamp(3rem, 5vw, 4.5rem) 0',
          backgroundColor: '#F5F3EE',
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center'
        }}
      >
        <div className="container-custom">
          <span 
            style={{ 
              fontFamily: 'var(--font-sans)',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent-bronze)',
              display: 'block',
              marginBottom: '0.75rem'
            }}
          >
            AL-NOOR Cards & Stationery House
          </span>

          <h1 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4.4vw, 3.8rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: '#181817',
              letterSpacing: '-0.015em',
              maxWidth: '820px',
              margin: '0 auto 1.25rem auto'
            }}
          >
            Personalised Cards & Invitations
          </h1>

          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-secondary)',
              fontSize: 'clamp(1rem, 1.3vw, 1.12rem)',
              maxWidth: '640px',
              margin: '0 auto 2.25rem auto',
              lineHeight: 1.6
            }}
          >
            Printed with care on heavy 350 GSM premium textured cardstock. From intimate birthday notes to grand celebration invitation suites.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link 
              to="/birthday-cards" 
              className="btn-primary"
              style={{ padding: '0.85rem 1.85rem', fontSize: '0.9rem' }}
            >
              <span>Build Birthday Card</span>
              <ArrowRight size={15} />
            </Link>

            <a 
              href="#categories-grid"
              className="btn-secondary"
              style={{ 
                padding: '0.85rem 1.75rem', 
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '4px'
              }}
            >
              <span>Browse All Occasions</span>
            </a>
          </div>

          {/* Paper & Craftsmanship Badges */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
              marginTop: '2.5rem',
              fontSize: '0.82rem',
              color: '#65635E',
              fontFamily: 'var(--font-sans)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="#9B7A50" /> 350 GSM Textured Natural Linen Board
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="#9B7A50" /> Matching Premium Envelopes Included
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#9B7A50" /> Crisp HD 6-Colour Fine-Art Print
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE 8 CATEGORIES GRID */}
      <section id="categories-grid" style={{ padding: 'clamp(4.5rem, 7vw, 6.5rem) 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-custom">
          
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto clamp(2.5rem, 4vw, 3.5rem) auto' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-bronze)', display: 'block', marginBottom: '0.5rem' }}>
              Every Life Milestone
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.1rem, 3.4vw, 2.75rem)', fontWeight: 500, color: '#181817', margin: 0 }}>
              Shop By Occasion
            </h2>
          </div>

          <div className="card-categories-grid">
            <style>{`
              .card-categories-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
              }

              @media (max-width: 1040px) {
                .card-categories-grid {
                  grid-template-columns: repeat(2, 1fr);
                  gap: 1.25rem;
                }
              }

              @media (max-width: 600px) {
                .card-categories-grid {
                  grid-template-columns: 1fr;
                  gap: 1.25rem;
                }
              }

              .card-cat-card {
                background: #FFFFFF;
                border: 1px solid #E6E2D8;
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                text-decoration: none;
                color: inherit;
                transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
              }

              .card-cat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 16px 36px -8px rgba(24, 24, 23, 0.12);
                border-color: rgba(24, 24, 23, 0.2);
              }

              .card-cat-img-box {
                width: 100%;
                aspect-ratio: 4 / 3.2;
                overflow: hidden;
                background-color: #EAE6DF;
                position: relative;
              }

              .card-cat-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
              }

              .card-cat-card:hover .card-cat-img {
                transform: scale(1.05);
              }

              .card-cat-body {
                padding: 1.35rem 1.25rem;
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                justify-content: space-between;
              }
            `}</style>

            {CARD_CATEGORIES_DATA.map((cat) => (
              <Link key={cat.id} to={cat.link} className="card-cat-card">
                <div className="card-cat-img-box">
                  <img src={cat.image} alt={cat.title} className="card-cat-img" loading="lazy" />
                  <span 
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(24, 24, 23, 0.75)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      fontSize: '0.64rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '3px'
                    }}
                  >
                    {cat.count}
                  </span>
                </div>

                <div className="card-cat-body">
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: '#181817', margin: '0 0 0.35rem 0' }}>
                      {cat.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: '#65635E', lineHeight: 1.45, margin: 0 }}>
                      {cat.subtitle}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F0EEE6' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--accent-bronze)' }}>
                      Personalise
                    </span>
                    <ArrowUpRight size={15} color="#181817" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 3. SECTION: START WITH A TEMPLATE */}
      <section style={{ padding: 'clamp(4.5rem, 7vw, 6.5rem) 0', backgroundColor: '#F8F6F0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-custom">
          
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-bronze)', display: 'block', marginBottom: '0.4rem' }}>
                Quick Inspiration
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.1rem, 3.4vw, 2.75rem)', fontWeight: 500, color: '#181817', margin: 0 }}>
                START WITH A TEMPLATE
              </h2>
            </div>

            <Link 
              to="/birthday-cards" 
              style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: '#181817', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px',
                textDecoration: 'none'
              }}
            >
              <span>Explore All Card Templates</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {CURATED_TEMPLATES.map((tpl) => (
              <div 
                key={tpl.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E6E2D8',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', backgroundColor: '#EAE6DF' }}>
                  <img src={tpl.image} alt={tpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.64rem', color: 'var(--accent-bronze)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                      {tpl.category}
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600, color: '#181817', margin: '0 0 0.35rem 0' }}>
                      {tpl.name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#65635E', lineHeight: 1.45, margin: 0 }}>
                      {tpl.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #F0EEE6' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#8A8780', display: 'block' }}>From</span>
                      <strong style={{ fontSize: '0.95rem', color: '#181817' }}>{tpl.price}</strong>
                    </div>

                    <Link 
                      to={tpl.link} 
                      className="btn-primary"
                      style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                    >
                      Use Template
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. SECTION: CREATE FROM YOUR PHOTO */}
      <section style={{ padding: 'clamp(5rem, 8vw, 7.5rem) 0' }}>
        <div className="container-custom">
          
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E6E2D8',
              borderRadius: '12px',
              padding: 'clamp(2.5rem, 5vw, 4.5rem)',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '3rem',
              alignItems: 'center',
              boxShadow: '0 12px 32px rgba(24, 24, 23, 0.05)'
            }}
            className="create-from-photo-grid"
          >
            <style>{`
              @media (min-width: 900px) {
                .create-from-photo-grid {
                  grid-template-columns: 1.1fr 0.9fr !important;
                }
              }
            `}</style>

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
                Zero Design Skills Required
              </span>

              <h2 
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
                  fontWeight: 500,
                  color: '#181817',
                  lineHeight: 1.15,
                  letterSpacing: '-0.015em',
                  marginBottom: '1rem'
                }}
              >
                CREATE FROM YOUR PHOTO
              </h2>

              <p 
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  color: '#65635E',
                  lineHeight: 1.65,
                  marginBottom: '1.75rem'
                }}
              >
                Have a favorite snapshot on your phone? Simply upload it. Our studio will place it inside an elegant border, calibrate the colours, and print your personalized front greeting and inside message.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#181817' }}>
                  <Check size={16} color="#9B7A50" />
                  <span>Works with any smartphone or camera photo</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#181817' }}>
                  <Check size={16} color="#9B7A50" />
                  <span>Real-time front & inside message preview</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#181817' }}>
                  <Check size={16} color="#9B7A50" />
                  <span>Printed on 350 GSM natural linen cardstock</span>
                </div>
              </div>

              <Link 
                to="/birthday-cards" 
                className="btn-primary"
                style={{ padding: '0.95rem 2.2rem', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Upload size={17} />
                <span>Upload Photo & Make Card</span>
              </Link>
            </div>

            {/* Right Visual Card Mockup */}
            <div 
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <div 
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  aspectRatio: '5 / 7',
                  backgroundColor: '#FAF8F5',
                  borderRadius: '6px',
                  boxShadow: '0 20px 40px -10px rgba(24, 24, 23, 0.25)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid #E6E2D8'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9B7A50', fontWeight: 700 }}>
                    A Memory Preserved
                  </span>
                </div>

                <div style={{ width: '100%', flexGrow: 1, margin: '1rem 0', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#EAE6DF' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=700&q=80" 
                    alt="Sample Family Card" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600, color: '#181817', margin: '0 0 2px 0' }}>
                    To The One Who Inspires Us
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#65635E', margin: 0 }}>
                    Happy Birthday, Dad • With all our love
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
