import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Package, 
  Heart, 
  X, 
  ShieldCheck, 
  Truck,
  Eye
} from 'lucide-react';

export const GIFT_BUNDLES_DATA = [
  {
    id: 'bundle-birthday-memory-box',
    name: 'THE BIRTHDAY MEMORY BOX',
    badge: 'Birthday Keepsake',
    tagline: 'The ultimate thoughtful birthday gesture in one elegant unboxing experience.',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    description: 'A handcrafted wooden frame preserving their favourite memory, a bespoke letterpress greeting card with your words, and a concentrated 3ml pure amber itra flacon.',
    items: [
      { name: 'Personalised Photo Frame', spec: '8×10" Solid Wood Moulding with Bevel-Cut Matboard' },
      { name: 'Personalised Birthday Card', spec: '350 GSM Textured Card with your personal message' },
      { name: 'Itra Mini Flacon', spec: '3ml Royal Amber 100% Pure Non-Alcoholic Perfume Oil' },
      { name: 'Luxury Gift Packaging', spec: 'Rigid Presentation Box with hand-tied satin ribbon' }
    ],
    defaultFinish: 'Natural Wood'
  },
  {
    id: 'bundle-anniversary-set',
    name: 'THE ANNIVERSARY SET',
    badge: 'Anniversary Milestone',
    tagline: 'Commemorate lasting devotion with heirloom framing and pairing fragrances.',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    description: 'Celebrate another year together with a warm walnut finish couple frame, a custom milestone anniversary letter, and an artisanal duo of his-and-hers attars.',
    items: [
      { name: 'Couple Frame', spec: '10×12" Warm Walnut with Studio Photo Lab Print' },
      { name: 'Personalised Message Card', spec: 'Dual-photo Then & Now layout on textured card' },
      { name: 'Itra Pair (His & Hers)', spec: '3ml Kashmir White Musk + 3ml Pure Taif Rose' },
      { name: 'Signature Hard-Box', spec: 'Charcoal rigid gift box with wax-sealed envelope' }
    ],
    defaultFinish: 'Warm Walnut'
  },
  {
    id: 'bundle-eid-gift-set',
    name: 'EID GIFT SET',
    badge: 'Sacred Celebration',
    tagline: 'Curated to bring barakah, sacred beauty, and blessed fragrance to the home.',
    price: 2199,
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    description: 'A handcrafted metallic gold-foiled Ayatul Kursi shadowbox frame, accompanied by an embossed geometric Eid greeting card and sacred Kaaba Kiswah pure perfume oil.',
    items: [
      { name: 'Islamic Wall Art Frame', spec: 'Ayat-ul-Kursi Gold Foiled Shadowbox (A4 size)' },
      { name: 'Greeting Card & Envelope', spec: 'Gold-embossed Eid Mubarak card with warm Dua' },
      { name: 'Holy Makkah Kiswah Attar', spec: '6ml Pure Amber & Taif Rose non-alcoholic blend' },
      { name: 'Signature Barakah Box', spec: 'Rigid gift box with gold foil Islamic geometric seal' }
    ],
    defaultFinish: 'Classic Black'
  },
  {
    id: 'bundle-family-memory-set',
    name: 'FAMILY MEMORY SET',
    badge: 'Generations Heritage',
    tagline: 'Preserve the legacy and laughter of generations in one coordinated archive.',
    price: 2899,
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    description: 'Honor family roots with a coordinated 3-piece gallery frame set, 15 professional 6-colour photo prints of cherished reunions, and a personal gratitude tribute card.',
    items: [
      { name: 'Gallery Frame Set', spec: '3 Matching Solid Pinewood Frames with studio matboard' },
      { name: '15 Printed Photos', spec: 'Lab-grade 260 GSM lustre photo prints for the memory album' },
      { name: 'Personalised Message Card', spec: 'Generations tribute letter card with custom photo' },
      { name: 'Heirloom Keepsake Box', spec: 'Deep storage hard-box with protective wrap' }
    ],
    defaultFinish: 'Warm Walnut'
  }
];

export default function GiftBundlesSection({ onAddToCart }) {
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [selectedFinish, setSelectedFinish] = useState('Natural Wood');
  const [recipientName, setRecipientName] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [addedId, setAddedId] = useState(null);

  const openCustomizer = (bundle) => {
    setSelectedBundle(bundle);
    setSelectedFinish(bundle.defaultFinish || 'Natural Wood');
    setRecipientName('');
    setCardMessage('');
  };

  const handleAddBundleToCart = (bundle) => {
    if (!onAddToCart) return;

    const cartItem = {
      id: `${bundle.id}-${Date.now()}`,
      type: 'gift_bundle',
      title: bundle.name,
      subTitle: bundle.tagline,
      format: 'Curated Gift Set (Rigid Box)',
      finish: selectedFinish,
      recipientName: recipientName.trim() || 'Valued Recipient',
      cardMessage: cardMessage.trim() || 'With warmest regards and best wishes.',
      price: bundle.price,
      quantity: 1,
      image: bundle.image,
      itemsSummary: bundle.items.map(i => `${i.name} (${i.spec})`).join(' • ')
    };

    onAddToCart(cartItem);
    setAddedId(bundle.id);
    setSelectedBundle(null);
    setTimeout(() => setAddedId(null), 3500);
  };

  return (
    <section 
      id="gift-bundles" 
      style={{
        padding: 'clamp(5rem, 8vw, 8rem) 0',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #DDD9D0',
        position: 'relative'
      }}
    >
      <div className="container-custom">

        {/* Section Header */}
        <div style={{ maxWidth: '680px', margin: '0 auto clamp(2.5rem, 5vw, 4.25rem) auto', textAlign: 'center' }}>
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
            <Gift size={14} />
            <span>Curated Presentations • Ready to Gift</span>
          </div>

          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)',
              fontWeight: 500,
              color: '#181817',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem'
            }}
          >
            SIGNATURE GIFT SETS
          </h2>

          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.95rem, 1.2vw, 1.08rem)',
              color: '#706E68',
              lineHeight: 1.6,
              margin: '0 auto'
            }}
          >
            Coordinated across handcrafted framing, personalised letterpress cards, photo lab prints, and pure itra — presented in our hand-tied rigid gift box.
          </p>
        </div>

        {/* 4 Premium Gift Bundles Grid (2x2 on desktop, 1-col on mobile) */}
        <div className="gift-bundles-grid">
          <style>{`
            .gift-bundles-grid {
              display: grid;
              grid-template-columns: repeat(1, 1fr);
              gap: 2rem;
            }
            @media (min-width: 840px) {
              .gift-bundles-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 2.25rem;
              }
            }
          `}</style>

          {GIFT_BUNDLES_DATA.map((bundle) => (
            <div
              key={bundle.id}
              style={{
                backgroundColor: '#FDFCFA',
                border: '1px solid #DDD9D0',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(24, 24, 23, 0.04)',
                transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, border-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(24, 24, 23, 0.1)';
                e.currentTarget.style.borderColor = '#C5BFB2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(24, 24, 23, 0.04)';
                e.currentTarget.style.borderColor = '#DDD9D0';
              }}
            >
              {/* Product Imagery */}
              <div 
                style={{ 
                  position: 'relative', 
                  aspectRatio: '16 / 10', 
                  backgroundColor: '#EDEAE4', 
                  overflow: 'hidden' 
                }}
              >
                <img 
                  src={bundle.image} 
                  alt={bundle.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

                {/* Subtle vignette overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.35) 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Occasion / Milestone Badge */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    backgroundColor: 'rgba(24, 24, 23, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: '4px'
                  }}
                >
                  {bundle.badge}
                </div>

                {/* Clear Single Total Price Tag */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    backgroundColor: '#FFFFFF',
                    color: '#181817',
                    padding: '5px 14px',
                    borderRadius: '100px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: '#706E68', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Complete Set
                  </span>
                  <span>₹{bundle.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Bundle Content */}
              <div style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                <h3 
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.45rem',
                    fontWeight: 500,
                    color: '#181817',
                    lineHeight: 1.2,
                    margin: '0 0 0.4rem 0'
                  }}
                >
                  {bundle.name}
                </h3>

                <p 
                  style={{
                    fontSize: '0.86rem',
                    color: '#706E68',
                    lineHeight: 1.5,
                    margin: '0 0 1.25rem 0'
                  }}
                >
                  {bundle.description}
                </p>

                {/* 4 Items Spec Checklist */}
                <div 
                  style={{
                    backgroundColor: '#F5F3EE',
                    borderRadius: '6px',
                    padding: '1rem 1.15rem',
                    marginBottom: '1.5rem',
                    flex: 1
                  }}
                >
                  <div 
                    style={{
                      fontSize: '0.68rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#706E68',
                      fontWeight: 700,
                      marginBottom: '0.65rem'
                    }}
                  >
                    Included In This Presentation:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {bundle.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.82rem' }}>
                        <div 
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9B7A50',
                            flexShrink: 0,
                            marginTop: '2px',
                            border: '1px solid #DDD9D0'
                          }}
                        >
                          <Check size={10} />
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: '#181817' }}>{item.name}: </span>
                          <span style={{ color: '#706E68' }}>{item.spec}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => openCustomizer(bundle)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1.25rem',
                      backgroundColor: '#181817',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
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
                    <span>Customise & Gift Box</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => handleAddBundleToCart(bundle)}
                    aria-label={`Quick add ${bundle.name} to cart`}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: addedId === bundle.id ? '#27AE60' : 'transparent',
                      color: addedId === bundle.id ? '#FFFFFF' : '#181817',
                      border: addedId === bundle.id ? '1px solid #27AE60' : '1px solid #DDD9D0',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    title="Quick Add with standard options"
                  >
                    {addedId === bundle.id ? (
                      <>
                        <Check size={14} />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Package size={14} />
                        <span>Quick Add</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Signature Presentation & Packaging Experience Bar */}
        <div 
          style={{
            marginTop: 'clamp(3rem, 6vw, 4.5rem)',
            backgroundColor: '#F5F3EE',
            border: '1px solid #DDD9D0',
            borderRadius: '8px',
            padding: 'clamp(2rem, 4vw, 3rem)'
          }}
        >
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
              alignItems: 'flex-start'
            }}
          >
            <div>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9B7A50', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                The Unboxing Experience
              </span>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 500, color: '#181817', margin: 0, lineHeight: 1.25 }}>
                Thoughtfulness in Every Detail
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#706E68', marginTop: '0.5rem', lineHeight: 1.5 }}>
                No invoices or prices are ever included in recipient packages.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7A50', flexShrink: 0, border: '1px solid #DDD9D0' }}>
                <Package size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#181817', margin: '0 0 0.2rem 0' }}>Rigid Keepsake Box</h5>
                <p style={{ fontSize: '0.8rem', color: '#706E68', margin: 0, lineHeight: 1.45 }}>Heavyweight hard-box protects the frame in transit and serves as a keepsake chest.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7A50', flexShrink: 0, border: '1px solid #DDD9D0' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#181817', margin: '0 0 0.2rem 0' }}>Hand-Tied Ribbon</h5>
                <p style={{ fontSize: '0.8rem', color: '#706E68', margin: 0, lineHeight: 1.45 }}>Tactile grosgrain satin ribbon finished with a personalized wax seal emblem.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7A50', flexShrink: 0, border: '1px solid #DDD9D0' }}>
                <Truck size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#181817', margin: '0 0 0.2rem 0' }}>Direct Delivery</h5>
                <p style={{ fontSize: '0.8rem', color: '#706E68', margin: 0, lineHeight: 1.45 }}>Ships safely anywhere in India with door-to-door tracking and fragile insurance.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal / Drawer for Customizing Gift Bundle */}
      {selectedBundle && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedBundle(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(24, 24, 23, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              border: '1px solid #DDD9D0',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div 
              style={{
                padding: '1.5rem 1.75rem',
                borderBottom: '1px solid #DDD9D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FDFCFA'
              }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9B7A50', fontWeight: 700 }}>
                  Customise Gift Presentation
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 500, margin: '0.2rem 0 0 0', color: '#181817' }}>
                  {selectedBundle.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedBundle(null)}
                aria-label="Close modal"
                style={{
                  width: '36px',
                  height: '36px',
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
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

              {/* Items Breakdown list */}
              <div>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#706E68', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Package Contents:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {selectedBundle.items.map((it, i) => (
                    <div key={i} style={{ padding: '0.75rem', backgroundColor: '#F5F3EE', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, color: '#181817' }}>{it.name}</div>
                      <div style={{ color: '#706E68', fontSize: '0.75rem' }}>{it.spec}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frame Finish Choice */}
              <div>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#706E68', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Select Frame Moulding Finish:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['Classic Black', 'Pure White', 'Natural Wood', 'Warm Walnut', 'Champagne'].map((finish) => {
                    const isSelected = selectedFinish === finish;
                    return (
                      <button
                        key={finish}
                        onClick={() => setSelectedFinish(finish)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          border: isSelected ? '2px solid #181817' : '1px solid #DDD9D0',
                          backgroundColor: isSelected ? '#181817' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#181817',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {finish}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Personalization fields */}
              <div>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#706E68', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Personalise Greeting Card & Packaging:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#181817', marginBottom: '0.35rem' }}>
                      Recipient's Name (printed on card cover & ribbon tag):
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Ammi, Rahul, Sarah..."
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        border: '1px solid #DDD9D0',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        backgroundColor: '#FFFFFF',
                        color: '#181817',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#181817', marginBottom: '0.35rem' }}>
                      Your Personal Letter / Message (printed inside the card):
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="Write your personal heartfelt message here. We will print it onto the 350 GSM textured greeting card inside..."
                      value={cardMessage}
                      onChange={(e) => setCardMessage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        border: '1px solid #DDD9D0',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        backgroundColor: '#FFFFFF',
                        color: '#181817',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer with Clear Total Price & Add to Cart */}
            <div 
              style={{
                padding: '1.25rem 1.75rem',
                borderTop: '1px solid #DDD9D0',
                backgroundColor: '#FDFCFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#706E68', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total All-Inclusive Price
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#181817' }}>
                  ₹{selectedBundle.price.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setSelectedBundle(null)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #DDD9D0',
                    color: '#706E68',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleAddBundleToCart(selectedBundle)}
                  style={{
                    padding: '0.75rem 1.6rem',
                    backgroundColor: '#181817',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9B7A50'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181817'}
                >
                  <Gift size={16} />
                  <span>Add Gift Box To Cart</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
