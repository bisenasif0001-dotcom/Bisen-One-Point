import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, X, Sparkles, ArrowRight, Check, Heart, Eye } from 'lucide-react';

export const OCCASIONS_DATA = [
  {
    id: 'birthday',
    title: 'Birthday',
    tagline: 'Laughs, milestones & another year together',
    heroImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
    curatedDescription: 'Make their day unforgettable with a bespoke custom frame, personalised photo greeting card, photo lab prints, and a signature artisanal fragrance.',
    products: [
      {
        id: 'bday-frame',
        title: 'Personalised Photo Frame',
        category: 'CUSTOM FRAMING',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        price: 599,
        badge: 'Top Gift',
        desc: 'Solid pinewood frame with acid-free matboard, preserving their favourite candid memory.',
        link: '/custom-framing?occasion=birthday',
        cta: 'Customize Frame'
      },
      {
        id: 'bday-card',
        title: 'Bespoke Birthday Card',
        category: 'CARDS & GIFTS',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        price: 149,
        badge: 'Personalised',
        desc: 'Two-sided heavy 350 GSM card with custom photos, recipient name, and your personal note.',
        link: '/birthday-cards',
        cta: 'Design Card'
      },
      {
        id: 'bday-prints',
        title: 'Studio Photo Prints',
        category: 'PHOTO LAB PRINTS',
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
        price: 149,
        badge: 'Pack of 10',
        desc: 'True 6-colour lustre photo prints capturing all the birthday laughs to tuck inside your gift box.',
        link: '/photo-prints',
        cta: 'Order Prints'
      },
      {
        id: 'bday-itra',
        title: 'Artisanal Itra Gift',
        category: 'THE ITRA HOUSE',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
        price: 699,
        badge: 'Pure Attar',
        desc: 'Royal Amber or Taif Rose 100% pure alcohol-free perfume oil in a hand-cut crystal flacon.',
        link: '/itra',
        cta: 'Explore Itra'
      }
    ]
  },
  {
    id: 'wedding',
    title: 'Wedding',
    tagline: 'Sacred vows, laughter & the beginning of always',
    heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    curatedDescription: 'Immortalise sacred vows with heirloom studio framing, a multi-piece gallery wall, luxury embossed congratulations cards, and royal bridal itra.',
    products: [
      {
        id: 'wed-frame',
        title: 'Wedding Statement Frame',
        category: 'CUSTOM FRAMING',
        image: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=600&q=80',
        price: 999,
        badge: 'Heirloom',
        desc: 'Warm Walnut or Champagne moulding with bevel-cut studio matting for ceremony portraits.',
        link: '/custom-framing?occasion=wedding',
        cta: 'Customize Frame'
      },
      {
        id: 'wed-wall',
        title: 'Gallery Wall Story Set',
        category: 'WALL ART',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        price: 2499,
        badge: '3-Piece Set',
        desc: 'Harmonious trio layout chronicling the ceremony, portraits, and candid celebrations.',
        link: '/wall-art',
        cta: 'Explore Wall Art'
      },
      {
        id: 'wed-card',
        title: 'Luxury Wedding Keepsake Card',
        category: 'CARDS & GIFTS',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
        price: 199,
        badge: 'Foil Stamped',
        desc: 'Gold foil-embossed blessing card on textured 350 GSM cardstock with bespoke wax seal.',
        link: '/cards?occasion=wedding',
        cta: 'Personalise Card'
      },
      {
        id: 'wed-itra',
        title: 'Royal Bridal Itra Coffret',
        category: 'THE ITRA HOUSE',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=600&q=80',
        price: 1499,
        badge: 'Luxury Coffret',
        desc: 'Mukhallat Royale and aged Dehn Al Oud presented in a handcrafted velvet gift box.',
        link: '/itra',
        cta: 'Explore Itra'
      }
    ]
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    tagline: 'Every shared year remembered with quiet reverence',
    heroImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    curatedDescription: 'Celebrate enduring devotion with coordinated milestone frames, commemorative cards, photo lab prints, and fragrant his-and-hers attars.',
    products: [
      {
        id: 'anni-frame',
        title: 'Couple Heritage Frame',
        category: 'CUSTOM FRAMING',
        image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=600&q=80',
        price: 799,
        badge: 'Couple Favourite',
        desc: 'Dark Walnut finish with custom-engraved brass-look anniversary date and coordinates.',
        link: '/custom-framing?occasion=anniversary',
        cta: 'Customize Frame'
      },
      {
        id: 'anni-card',
        title: 'Milestone Anniversary Card',
        category: 'CARDS & GIFTS',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
        price: 149,
        badge: 'Photo Card',
        desc: 'Feature your wedding day photo alongside today with your personal anniversary letter.',
        link: '/cards?occasion=anniversary',
        cta: 'Design Card'
      },
      {
        id: 'anni-prints',
        title: 'Gallery Duo Print Set',
        category: 'PHOTO LAB PRINTS',
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
        price: 1199,
        badge: 'Framed Duo',
        desc: 'Pair of studio framed portraits side-by-side celebrating your journey then and now.',
        link: '/prints',
        cta: 'Order Prints'
      },
      {
        id: 'anni-itra',
        title: 'Fragrance Gift Duo',
        category: 'THE ITRA HOUSE',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
        price: 999,
        badge: 'Gift Duo',
        desc: 'Harmonious pair of Kashmir White Musk and Taif Rose for unforgettable anniversary evenings.',
        link: '/itra',
        cta: 'Explore Itra'
      }
    ]
  },
  {
    id: 'new-baby',
    title: 'New Baby',
    tagline: 'Tiny hands, first milestones & boundless wonder',
    heroImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=900&q=80',
    curatedDescription: 'Celebrate new life with safety-glazed nursery frames, month-by-month milestone prints, gentle baby announcement cards, and soothing floral essences.',
    products: [
      {
        id: 'baby-frame',
        title: 'Nursery Keepsake Frame',
        category: 'CUSTOM FRAMING',
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
        price: 649,
        badge: 'Child-Safe',
        desc: 'Pure White or Natural Maple with shatter-resistant acrylic glass safe for children rooms.',
        link: '/custom-framing?occasion=baby',
        cta: 'Customize Frame'
      },
      {
        id: 'baby-prints',
        title: 'Baby Milestone Prints Pack',
        category: 'PHOTO LAB PRINTS',
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
        price: 249,
        badge: 'Set of 20',
        desc: 'Document every tiny smile and step with 20 professional lustre photo prints for the memory book.',
        link: '/photo-prints',
        cta: 'Order Prints'
      },
      {
        id: 'baby-card',
        title: 'Welcome Little One Card',
        category: 'CARDS & GIFTS',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
        price: 149,
        badge: 'Birth Stats',
        desc: 'Custom card recording baby birth date, time, weight, and a sweet welcome prayer.',
        link: '/cards?occasion=baby',
        cta: 'Personalise Card'
      },
      {
        id: 'baby-itra',
        title: 'Gentle Floral Water & Attar',
        category: 'THE ITRA HOUSE',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=600&q=80',
        price: 499,
        badge: 'Gentle Pure',
        desc: 'Soft, calming alcohol-free Jannat-ul-Firdaus essence bringing serenity to baby nurseries.',
        link: '/itra',
        cta: 'Explore Itra'
      }
    ]
  },
  {
    id: 'for-parents',
    title: 'For Parents',
    tagline: 'Honouring unconditional love, blessings & lifelong wisdom',
    heroImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80',
    curatedDescription: 'Give parents the reverence they deserve: large-format heirloom family frames, gratitude tribute cards, family tree prints, and therapeutic aged oud.',
    products: [
      {
        id: 'parents-frame',
        title: 'Generations Family Frame',
        category: 'CUSTOM FRAMING',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        price: 899,
        badge: 'Heirloom',
        desc: 'Large statement solid wood frame honoring parents with professional 6-colour photo printing.',
        link: '/custom-framing?occasion=parents',
        cta: 'Customize Frame'
      },
      {
        id: 'parents-card',
        title: 'Heartfelt Tribute Card',
        category: 'CARDS & GIFTS',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        price: 149,
        badge: 'Gratitude',
        desc: 'A meaningful thank-you note printed on premium 350 GSM cardstock with heartfelt message.',
        link: '/cards?occasion=parents',
        cta: 'Write Note'
      },
      {
        id: 'parents-wall',
        title: 'Ancestral Wall Grid',
        category: 'WALL ART',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        price: 1899,
        badge: '4 Frames',
        desc: '4-frame matched gallery wall celebrating roots, parents, and grandchildren together.',
        link: '/wall-art',
        cta: 'Explore Wall Art'
      },
      {
        id: 'parents-itra',
        title: 'Pure Dehn Al Oud / Shamama',
        category: 'THE ITRA HOUSE',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
        price: 1299,
        badge: 'Aged 12 Yrs',
        desc: 'Therapeutic Kannauj Shamama and Cambodian Oud deeply cherished by elders.',
        link: '/itra',
        cta: 'Explore Itra'
      }
    ]
  },
  {
    id: 'eid-islamic',
    title: 'Eid & Islamic Gifts',
    tagline: 'Sacred verses, barakah & radiant hospitality',
    heroImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=900&q=80',
    curatedDescription: 'Enrich festive homes with handcrafted Islamic calligraphy wall art, gold-foiled Eid Mubarak greeting cards, celebration prints, and sacred Kaaba Kiswah attar.',
    products: [
      {
        id: 'eid-art',
        title: 'Ayat Calligraphy Frame',
        category: 'WALL ART',
        image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
        price: 849,
        badge: 'Sacred Art',
        desc: 'Ayatul Kursi or 4 Quls in gold foiled typography inside a classic black shadowbox.',
        link: '/islamic-art',
        cta: 'Explore Art'
      },
      {
        id: 'eid-cards',
        title: 'Eid Mubarak Luxe Greeting Cards',
        category: 'CARDS & GIFTS',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
        price: 199,
        badge: 'Set of 5',
        desc: 'Gold embossed Islamic geometric cards with warm Dua envelopes for relatives & friends.',
        link: '/cards?occasion=eid',
        cta: 'Personalise Cards'
      },
      {
        id: 'eid-prints',
        title: 'Eid Prayer & Feast Prints',
        category: 'PHOTO LAB PRINTS',
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
        price: 199,
        badge: 'Vivid Lab',
        desc: 'Print joyful Eid family gatherings in true-to-life 6-colour photo lab brilliance.',
        link: '/photo-prints',
        cta: 'Order Prints'
      },
      {
        id: 'eid-itra',
        title: 'Makkah Kiswah & Musk Attar',
        category: 'THE ITRA HOUSE',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=600&q=80',
        price: 799,
        badge: 'Sacred Blend',
        desc: 'Sacred notes of Amber, Taif Rose, and holy Kiswah musk created for Jummah and Eid Salah.',
        link: '/itra',
        cta: 'Explore Itra'
      }
    ]
  }
];

export default function ShopByOccasion() {
  const navigate = useNavigate();
  const [selectedOccasion, setSelectedOccasion] = useState(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedOccasion(null);
    };
    if (selectedOccasion) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOccasion]);

  const handleNavigate = (path) => {
    setSelectedOccasion(null);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      id="shop-by-occasion"
      style={{
        padding: 'clamp(4.5rem, 8vw, 7.5rem) 0',
        backgroundColor: '#F5F3EE',
        borderBottom: '1px solid #DDD9D0',
        position: 'relative'
      }}
    >
      <div className="container-custom">

        {/* Section Header */}
        <div style={{ maxWidth: '680px', margin: '0 auto clamp(2.5rem, 5vw, 4rem) auto', textAlign: 'center' }}>
          <div 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.72rem', 
              letterSpacing: '0.16em', 
              textTransform: 'uppercase', 
              color: 'var(--accent-bronze)', 
              fontWeight: 700,
              marginBottom: '0.65rem'
            }}
          >
            <Sparkles size={13} />
            <span>Curated Moments & Milestones</span>
          </div>
          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem'
            }}
          >
            SHOP BY OCCASION
          </h2>
          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.95rem, 1.2vw, 1.08rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 auto'
            }}
          >
            Thoughtfully coordinated across custom frames, cards, prints, and pure itra — curated for life’s most cherished celebrations.
          </p>
        </div>

        {/* 6 Premium Image Tiles Grid (3x2 Desktop, 2x3 Tablet, Carousel/Scroll Mobile) */}
        <div className="occasion-tiles-grid">
          <style>{`
            .occasion-tiles-grid {
              display: grid;
              grid-template-columns: repeat(1, 1fr);
              gap: 1.5rem;
            }
            @media (min-width: 640px) {
              .occasion-tiles-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
              }
            }
            @media (min-width: 1024px) {
              .occasion-tiles-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 1.75rem;
              }
            }
            @media (max-width: 639px) {
              .occasion-tiles-grid {
                display: flex;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: 1.15rem;
                padding-bottom: 1.25rem;
                margin-left: -1rem;
                margin-right: -1rem;
                padding-left: 1rem;
                padding-right: 1rem;
                -webkit-overflow-scrolling: touch;
              }
              .occasion-tiles-grid::-webkit-scrollbar {
                height: 4px;
              }
              .occasion-tiles-grid::-webkit-scrollbar-thumb {
                background: #DDD9D0;
                border-radius: 4px;
              }
              .occasion-tile {
                flex: 0 0 84%;
                scroll-snap-align: start;
              }
            }
          `}</style>

          {OCCASIONS_DATA.map((occ) => (
            <div
              key={occ.id}
              className="occasion-tile"
              onClick={() => setSelectedOccasion(occ)}
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                aspectRatio: '4 / 5',
                backgroundColor: '#EDEAE4',
                boxShadow: '0 4px 18px rgba(24, 24, 23, 0.06)',
                transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease',
                border: '1px solid rgba(221, 217, 208, 0.6)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(24, 24, 23, 0.14)';
                const img = e.currentTarget.querySelector('.occ-img');
                if (img) img.style.transform = 'scale(1.06)';
                const btn = e.currentTarget.querySelector('.occ-btn');
                if (btn) {
                  btn.style.backgroundColor = '#FFFFFF';
                  btn.style.color = '#181817';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(24, 24, 23, 0.06)';
                const img = e.currentTarget.querySelector('.occ-img');
                if (img) img.style.transform = 'scale(1)';
                const btn = e.currentTarget.querySelector('.occ-btn');
                if (btn) {
                  btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  btn.style.color = '#FFFFFF';
                }
              }}
            >
              {/* Background Emotional Lifestyle Moment Image */}
              <img
                src={occ.heroImage}
                alt={occ.title}
                className="occ-img"
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              />

              {/* Editorial Gradient Vignette */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.25) 45%, rgba(18,18,17,0.88) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Category Pill Top Left */}
              <div
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  backgroundColor: 'rgba(24, 24, 23, 0.6)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                Curated Collection
              </div>

              {/* Bottom Content Area */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1.5rem 1.4rem',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.4rem, 1.8vw, 1.7rem)',
                      fontWeight: 500,
                      lineHeight: 1.15,
                      letterSpacing: '-0.01em',
                      margin: 0,
                      color: '#FFFFFF'
                    }}
                  >
                    {occ.title}
                  </h3>

                  <div 
                    className="occ-btn"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      transition: 'background-color 0.25s ease, color 0.25s ease',
                      flexShrink: 0
                    }}
                  >
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.84rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.4,
                    margin: 0
                  }}
                >
                  {occ.tagline}
                </p>

                {/* Sub-pills of What's Inside */}
                <div 
                  style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '4px 8px', 
                    marginTop: '0.4rem',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 255, 255, 0.72)',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  <span>Frames</span>
                  <span>•</span>
                  <span>Cards</span>
                  <span>•</span>
                  <span>Prints</span>
                  <span>•</span>
                  <span>Itra</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Curated Collection Modal Dialog */}
      {selectedOccasion && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedOccasion(null)}
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
              maxWidth: '940px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              border: '1px solid #DDD9D0',
              animation: 'modalSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            {/* Modal Header with Occasion Mood Banner */}
            <div 
              style={{
                position: 'relative',
                padding: 'clamp(2rem, 4vw, 2.75rem) clamp(1.5rem, 3.5vw, 2.5rem)',
                backgroundColor: '#20201E',
                color: '#FFFFFF',
                borderRadius: '12px 12px 0 0',
                overflow: 'hidden'
              }}
            >
              {/* Subtle mood background */}
              <img 
                src={selectedOccasion.heroImage} 
                alt={selectedOccasion.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.28,
                  filter: 'saturate(1.2)'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, rgba(24,24,23,0.92) 0%, rgba(24,24,23,0.8) 100%)'
                }}
              />

              {/* Close Button */}
              <button
                onClick={() => setSelectedOccasion(null)}
                aria-label="Close modal"
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  zIndex: 2
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)'}
              >
                <X size={18} />
              </button>

              <div style={{ position: 'relative', zIndex: 1, maxWidth: '620px' }}>
                <span 
                  style={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-bronze)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '0.35rem'
                  }}
                >
                  Curated Occasion Collection
                </span>
                <h3 
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2rem, 3.2vw, 2.6rem)',
                    fontWeight: 500,
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.15
                  }}
                >
                  {selectedOccasion.title}
                </h3>
                <p 
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.94rem',
                    color: 'rgba(255, 255, 255, 0.82)',
                    lineHeight: 1.5,
                    margin: 0
                  }}
                >
                  {selectedOccasion.curatedDescription}
                </p>
              </div>
            </div>

            {/* Curated Products Cross-Category Grid */}
            <div style={{ padding: 'clamp(1.5rem, 3.5vw, 2.5rem)', backgroundColor: '#FDFCFA' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #EAE6DC'
                }}
              >
                <span 
                  style={{ 
                    fontSize: '0.76rem', 
                    letterSpacing: '0.12em', 
                    textTransform: 'uppercase', 
                    fontWeight: 700,
                    color: '#706E68'
                  }}
                >
                  Harmonized 4-Pillar Gift Set
                </span>
                <span style={{ fontSize: '0.8rem', color: '#9B7A50', fontWeight: 600 }}>
                  Frames • Cards • Prints • Itra
                </span>
              </div>

              {/* 4 Cards Grid */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem'
                }}
              >
                {selectedOccasion.products.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAE6DC',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#181817';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(24, 24, 23, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#EAE6DC';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Product Image */}
                    <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: '#F5F3EE', overflow: 'hidden' }}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          fontSize: '0.62rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          backgroundColor: '#20201E',
                          color: '#FFFFFF',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h4 
                        style={{ 
                          fontFamily: 'var(--font-serif)', 
                          fontSize: '1.05rem', 
                          fontWeight: 600, 
                          color: '#181817',
                          margin: '0 0 0.35rem 0',
                          lineHeight: 1.25
                        }}
                      >
                        {item.title}
                      </h4>
                      <p 
                        style={{ 
                          fontFamily: 'var(--font-sans)', 
                          fontSize: '0.78rem', 
                          color: '#706E68', 
                          lineHeight: 1.4,
                          margin: '0 0 0.75rem 0',
                          flex: 1
                        }}
                      >
                        {item.desc}
                      </p>

                      <div 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'baseline',
                          paddingTop: '0.65rem',
                          borderTop: '1px solid #F0ECE1',
                          marginBottom: '0.75rem'
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', color: '#706E68', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Starting from
                        </span>
                        <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#181817' }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleNavigate(item.link)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.8rem',
                          backgroundColor: '#20201E',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9B7A50'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#20201E'}
                      >
                        <span>{item.cta}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Footer Actions */}
              <div 
                style={{ 
                  marginTop: '1.75rem', 
                  paddingTop: '1.25rem', 
                  borderTop: '1px solid #EAE6DC',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      backgroundColor: '#F5F3EE', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#9B7A50'
                    }}
                  >
                    <Check size={16} />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#706E68' }}>
                    Coordinated gift packaging & gift notes available on all items
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleNavigate(`/occasions/${selectedOccasion.id}`)}
                    style={{
                      padding: '0.7rem 1.4rem',
                      backgroundColor: '#181817',
                      color: '#FFFFFF',
                      border: '1px solid #181817',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#9B7A50';
                      e.currentTarget.style.borderColor = '#9B7A50';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#181817';
                      e.currentTarget.style.borderColor = '#181817';
                    }}
                  >
                    <span>View All {selectedOccasion.title} Gifts</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => handleNavigate(`/custom-framing?occasion=${selectedOccasion.id}`)}
                    style={{
                      padding: '0.7rem 1.4rem',
                      backgroundColor: 'transparent',
                      color: '#181817',
                      border: '1px solid #181817',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#181817';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#181817';
                    }}
                  >
                    <span>Build Custom Frame</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(24px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
    </section>
  );
}
