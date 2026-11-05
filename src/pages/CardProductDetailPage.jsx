import NotFoundPage from './NotFoundPage';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronDown, ChevronUp, ShoppingBag, 
  Sparkles, Edit3, Check, ArrowLeft, Eye, Mail, HelpCircle, 
  Layers, Truck, Heart 
} from 'lucide-react';
import SmartCrossSell from '../components/SmartCrossSell';
import { CARDS_PHOTOGRAPHY_SYSTEM } from '../data/photographySystem';

const CARD_DATA = {
  'tpl-1': {
    id: 'tpl-1',
    name: 'Minimalist Botanical Greeting Card',
    category: 'Birthday & Occasion',
    price: 149,
    frontImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    insideImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    description: 'Understated botanical leaf study on soft warm ivory 350 GSM cardstock. Designed for heartfelt birthdays and notes of gratitude.'
  },
  'tpl-2': {
    id: 'tpl-2',
    name: 'Gilded Champagne Foil Card',
    category: 'Wedding & Anniversary',
    price: 199,
    frontImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    insideImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    description: 'Deep charcoal textured board with warm champagne gold foil lettering. Elegant keepsake for couples and milestone anniversaries.'
  },
  'tpl-3': {
    id: 'tpl-3',
    name: 'Barakah & Dua Crescent Card',
    category: 'Eid & Islamic Greetings',
    price: 149,
    frontImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    insideImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    description: 'Sacred thuluth calligraphy script accented by arabesque geometric borders. Ideal for Eid Mubarak, Nikah, and housewarming prayers.'
  },
  'tpl-4': {
    id: 'tpl-4',
    name: 'Little Dreamer Whimsical Card',
    category: 'Baby & Kids Birthday',
    price: 149,
    frontImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    insideImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    description: 'Delicate pastel confetti and joyful hand-lettered headlines. A playful, cherished keepsake for newborns and toddler birthdays.'
  }
};

const CARD_SIZES = [
  { id: 'a6', name: 'Standard Folded A6', dimensions: '10.5 × 14.8 cm (4.1 × 5.8 in)', extraPrice: 0 },
  { id: 'a5', name: 'Classic Folded A5', dimensions: '14.8 × 21.0 cm (5.8 × 8.3 in)', extraPrice: 40 },
  { id: 'square', name: 'Square Folded 14×14', dimensions: '14.0 × 14.0 cm (5.5 × 5.5 in)', extraPrice: 20 }
];

export default function CardProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Resolve card or fallback to tpl-1
  const card = CARD_DATA[id] || {
    id: id || 'custom-card',
    name: 'Personalised Fine Art Greeting Card',
    category: 'Custom Milestone Card',
    price: 149,
    frontImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    insideImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    description: 'Heavyweight 350 GSM textured card with customized front calligraphy and your heartfelt message printed inside.'
  };

  // State
  const [selectedSize, setSelectedSize] = useState(CARD_SIZES[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeView, setActiveView] = useState('card-front'); // 6-shot standardized system
  const [isPersonalised, setIsPersonalised] = useState(false);
  const [isEditingPersonalisation, setIsEditingPersonalisation] = useState(false);

  // Personalisation Fields
  const [recipientName, setRecipientName] = useState('');
  const [frontHeadline, setFrontHeadline] = useState('');
  const [insideMessage, setInsideMessage] = useState('');
  const [senderName, setSenderName] = useState('');

  const [addedToast, setAddedToast] = useState(false);

  // Accordions state: Paper, Printing, Envelope, Delivery, FAQ
  const [expandedSections, setExpandedSections] = useState({
    paper: true,
    printing: false,
    envelope: false,
    delivery: false,
    faq: false
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const currentPrice = (card.price + selectedSize.extraPrice) * quantity;

  const handleSavePersonalisation = (e) => {
    e.preventDefault();
    if (recipientName.trim() || insideMessage.trim()) {
      setIsPersonalised(true);
      setIsEditingPersonalisation(false);
    }
  };

  const handleAddToCart = () => {
    if (!onAddToCart) return;

    onAddToCart({
      id: `${card.id}-${selectedSize.id}-${Date.now()}`,
      type: 'greeting_card',
      title: card.name,
      subTitle: isPersonalised ? `For: ${recipientName || 'Loved One'}` : 'Blank Inside (Write by Hand)',
      format: selectedSize.name,
      size: selectedSize.dimensions,
      price: card.price + selectedSize.extraPrice,
      quantity: quantity,
      image: card.frontImage,
      personalisation: isPersonalised ? {
        recipientName,
        frontHeadline,
        insideMessage,
        senderName
      } : null
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  if (!CARD_DATA[id]) return <NotFoundPage />;

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* Breadcrumb Navigation */}
      <div style={{ borderBottom: '1px solid #DDD9D0', backgroundColor: '#FFFFFF' }}>
        <div className="container-custom" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#706E68' }}>
            <Link to="/" style={{ color: '#706E68', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link to="/cards" style={{ color: '#706E68', textDecoration: 'none' }}>Cards & Stationery</Link>
            <span>/</span>
            <span style={{ color: '#181817', fontWeight: 600 }}>{card.name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom" style={{ paddingTop: 'clamp(1.5rem, 3.5vw, 2.75rem)' }}>

        {/* ======================================================== */}
        {/* DESKTOP SPLIT: LEFT LIVE PREVIEW, RIGHT PURCHASE CONTROLS */}
        {/* ======================================================== */}
        <div className="card-pdp-grid">
          <style>{`
            .card-pdp-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 2.25rem;
              margin-bottom: clamp(3rem, 6vw, 4.5rem);
            }
            @media (min-width: 992px) {
              .card-pdp-grid {
                grid-template-columns: 1.1fr 1fr;
                gap: 3.5rem;
                align-items: start;
              }
            }
          `}</style>

          {/* LEFT: Large Live Card Preview */}
          <div style={{ position: 'sticky', top: '100px' }}>
            
            {/* Live Interactive Card Stage */}
            <div 
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DDD9D0',
                boxShadow: '0 12px 32px rgba(24, 24, 23, 0.05)',
                aspectRatio: '4 / 3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5%'
              }}
            >
              {/* Realistic Tactile Folded Card Mockup */}
              <div 
                style={{
                  position: 'relative',
                  width: '74%',
                  height: '88%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '4px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.12), -4px 0 12px rgba(0,0,0,0.04)',
                  border: '1px solid #EAE6DC',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease'
                }}
              >
                {activeView === 'card-front' ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img 
                      src={card.frontImage} 
                      alt={card.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    />
                    
                    {/* Live Personalised Overlay if Entered */}
                    {isPersonalised && (recipientName || frontHeadline) && (
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: '18px',
                          left: '16px',
                          right: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.94)',
                          backdropFilter: 'blur(6px)',
                          padding: '10px 14px',
                          borderRadius: '4px',
                          border: '1px solid rgba(0,0,0,0.06)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          textAlign: 'center'
                        }}
                      >
                        {frontHeadline && (
                          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9B7A50', fontWeight: 700 }}>
                            {frontHeadline}
                          </div>
                        )}
                        {recipientName && (
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#181817', fontWeight: 600 }}>
                            {recipientName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : activeView === 'open-card' ? (
                  <div 
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#FCFBF9',
                      padding: '2rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      textAlign: 'center',
                      backgroundImage: 'radial-gradient(#DDD9D0 0.75px, transparent 0.75px)',
                      backgroundSize: '16px 16px'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#9B7A50', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Inside Inscription
                    </div>
                    {isPersonalised && insideMessage ? (
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#181817', lineHeight: 1.6, fontStyle: 'italic', maxWidth: '320px', margin: '0 auto' }}>
                        "{insideMessage}"
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.86rem', color: '#706E68', fontStyle: 'italic', maxWidth: '300px', margin: '0 auto' }}>
                        Blank inside by default for your handwritten message. Tap "Personalise This Card" to print a custom letter inside.
                      </div>
                    )}
                    {isPersonalised && senderName && (
                      <div style={{ marginTop: '1rem', fontSize: '0.82rem', fontWeight: 600, color: '#181817' }}>
                        With love, {senderName}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Other views: back, envelope, hand-scale, personalised-example */
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img 
                      src={CARDS_PHOTOGRAPHY_SYSTEM.find(c => c.id === activeView)?.image || card.frontImage} 
                      alt={CARDS_PHOTOGRAPHY_SYSTEM.find(c => c.id === activeView)?.label || 'Card View'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '14px',
                        left: '14px',
                        backgroundColor: 'rgba(24, 24, 23, 0.88)',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 600
                      }}
                    >
                      {CARDS_PHOTOGRAPHY_SYSTEM.find(c => c.id === activeView)?.label}
                    </div>
                  </div>
                )}

                {/* Tactile Fold Shadow down spine */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '6px',
                    background: 'linear-gradient(to right, rgba(0,0,0,0.14) 0%, transparent 100%)',
                    pointerEvents: 'none'
                  }} 
                />
              </div>

              {/* View Selector Overlay Badge */}
              <div 
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(24, 24, 23, 0.88)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em'
                }}
              >
                {CARDS_PHOTOGRAPHY_SYSTEM.find(c => c.id === activeView)?.label || 'Cover'}
              </div>
            </div>

            {/* 6-Angle Standardized Card Thumbnails Strip (Prompt 28) */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                marginTop: '12px'
              }}
            >
              {CARDS_PHOTOGRAPHY_SYSTEM.map((v) => {
                const isActive = activeView === v.id;
                const thumbImg = v.id === 'card-front' ? card.frontImage : v.id === 'open-card' ? card.insideImage : v.image;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveView(v.id)}
                    title={v.desc}
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
                      src={thumbImg} 
                      alt={v.label} 
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
                      {v.shortLabel}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT: Controls Above The Fold (Prompt 25 exact specs) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* 1. Design Name & Category */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span 
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--accent-bronze)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                >
                  {card.category}
                </span>

              </div>

              <h1 
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2rem, 3.2vw, 2.5rem)',
                  fontWeight: 500,
                  color: '#181817',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  margin: '0 0 0.5rem 0'
                }}
              >
                {card.name}
              </h1>

              {/* 2. Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#181817' }}>
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {quantity > 1 && (
                  <span style={{ fontSize: '0.85rem', color: '#706E68' }}>
                    (₹{card.price + selectedSize.extraPrice} each)
                  </span>
                )}
                <span style={{ fontSize: '0.74rem', color: '#706E68' }}>
                  Includes luxury envelope & taxes
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#706E68', lineHeight: 1.55, margin: 0 }}>
                {card.description}
              </p>
            </div>

            {/* 3. Card Size Selector */}
            <div>
              <div style={{ marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#181817' }}>
                  Card Size: <span style={{ fontWeight: 500, color: '#706E68' }}>{selectedSize.name}</span>
                </label>
              </div>

              <div className="card-size-selector-grid">
                <style>{`
                  .card-size-selector-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                  }
                  @media (max-width: 640px) {
                    .card-size-selector-grid {
                      grid-template-columns: 1fr !important;
                    }
                  }
                `}</style>
                {CARD_SIZES.map((sz) => {
                  const isSelected = selectedSize.id === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        border: isSelected ? '1.5px solid #181817' : '1px solid #DDD9D0',
                        backgroundColor: isSelected ? '#181817' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#181817',
                        borderRadius: '6px',
                        padding: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{sz.name.split(' ')[0]} {sz.name.split(' ')[1]}</div>
                      <div style={{ fontSize: '0.68rem', opacity: isSelected ? 0.85 : 0.65, marginTop: '2px' }}>
                        {sz.extraPrice === 0 ? 'Standard' : `+₹${sz.extraPrice}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Quantity */}
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

            {/* 5. Personalisation Status Badge & Control */}
            <div 
              style={{
                backgroundColor: isPersonalised ? '#F0F6F1' : '#FAF8F5',
                border: isPersonalised ? '1px solid #C7DEC9' : '1px solid #DDD9D0',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: isPersonalised ? '#2E6930' : '#9B7A50', marginBottom: '2px' }}>
                  Personalisation Status
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#181817' }}>
                  {isPersonalised ? 'Custom Inscription Ready ✓' : 'Blank Inside (Standard)'}
                </div>
                {isPersonalised && recipientName && (
                  <div style={{ fontSize: '0.76rem', color: '#706E68', marginTop: '2px' }}>
                    Personalised for: <strong>{recipientName}</strong>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsEditingPersonalisation(!isEditingPersonalisation)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DDD9D0',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#181817',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit3 size={13} color="#9B7A50" />
                <span>{isPersonalised ? 'Edit Details' : 'Customise'}</span>
              </button>
            </div>

            {/* Personalisation Expandable Panel */}
            {isEditingPersonalisation && (
              <form 
                onSubmit={handleSavePersonalisation}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DDD9D0',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#181817' }}>
                  Customise Cover & Message
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#706E68', marginBottom: '3px' }}>
                    Recipient's Name (Appears on Cover)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Sarah, Dearest Ammi" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid #DDD9D0',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#706E68', marginBottom: '3px' }}>
                    Inside Message
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Write your heartfelt note here. We will typeset and print it with elegant typography inside."
                    value={insideMessage}
                    onChange={(e) => setInsideMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid #DDD9D0',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#706E68', marginBottom: '3px' }}>
                    From / Sender Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Ayaan & Family" 
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid #DDD9D0',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      backgroundColor: '#181817',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Apply To Card Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonalisation(false)}
                    style={{
                      backgroundColor: '#FAF8F5',
                      color: '#706E68',
                      border: '1px solid #DDD9D0',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* CTAs (Prompt 25: Primary CTA PERSONALISE THIS CARD -> After personalisation: ADD TO CART) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!isPersonalised ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPersonalisation(true);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '0.92rem',
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
                    <Sparkles size={16} color="#D8CEBE" />
                    <span>PERSONALISE THIS CARD</span>
                  </button>

                  {/* Quick Option to buy blank directly */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.84rem',
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
                    <ShoppingBag size={14} />
                    <span>Order Blank Inside (Write by Hand) • ₹{currentPrice.toLocaleString('en-IN')}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
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
                  <span>ADD TO CART • ₹{currentPrice.toLocaleString('en-IN')}</span>
                </button>
              )}

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
                  <Check size={14} /> Card added to your shopping bag!
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* BELOW: 5 CLEAN ACCORDIONS (Paper, Printing, Envelope, Delivery, FAQ) */}
        {/* ======================================================== */}
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          
          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              fontWeight: 500,
              color: '#181817',
              marginBottom: '1.25rem',
              borderBottom: '1px solid #DDD9D0',
              paddingBottom: '0.65rem'
            }}
          >
            Craftsmanship & Materials
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {/* 1. Paper */}
            <CardAccordionItem
              title="Paper"
              isOpen={expandedSections.paper}
              onToggle={() => toggleSection('paper')}
            >
              <div style={{ fontSize: '0.85rem', color: '#706E68', lineHeight: 1.6 }}>
                <div>• <strong>Weight:</strong> Heavyweight 350 GSM textured cardstock.</div>
                <div>• <strong>Finish:</strong> Natural uncoated texture with luxurious tactile hand-feel.</div>
                <div>• <strong>Durability:</strong> Rigid presentation board formulated to resist creasing and yellowing.</div>
              </div>
            </CardAccordionItem>

            {/* 2. Printing */}
            <CardAccordionItem
              title="Printing"
              isOpen={expandedSections.printing}
              onToggle={() => toggleSection('printing')}
            >
              <div style={{ fontSize: '0.85rem', color: '#706E68', lineHeight: 1.6 }}>
                <div>• High-density photographic ink reproduction ensuring razor-sharp typography and vibrant illustrations.</div>
                <div>• Crisp interior text printing using custom serif and script fonts.</div>
                <div>• Smudge-resistant ink absorption allowing ink pen signatures without bleed.</div>
              </div>
            </CardAccordionItem>

            {/* 3. Envelope */}
            <CardAccordionItem
              title="Envelope"
              isOpen={expandedSections.envelope}
              onToggle={() => toggleSection('envelope')}
            >
              <div style={{ fontSize: '0.85rem', color: '#706E68', lineHeight: 1.6 }}>
                <div>• Paired with a complimentary 150 GSM luxury textured envelope with peel-and-seal adhesive strip.</div>
                <div>• Subtle blind-embossed studio watermark monogram on the rear flap.</div>
                <div>• Sized with perfect 3mm margin for effortless insertion and removal.</div>
              </div>
            </CardAccordionItem>

            {/* 4. Delivery */}
            <CardAccordionItem
              title="Delivery"
              isOpen={expandedSections.delivery}
              onToggle={() => toggleSection('delivery')}
            >
              <div style={{ fontSize: '0.85rem', color: '#706E68', lineHeight: 1.6 }}>
                <div>• <strong>Dispatch:</strong> Printed and dispatched within 24 to 48 hours.</div>
                <div>• <strong>Stay-Flat Protection:</strong> Shipped in rigid 'Do Not Bend' hardboard cardboard mailers.</div>
                <div>• <strong>Direct Gifting:</strong> Option to enter recipient address at checkout to deliver directly to their doorstep.</div>
              </div>
            </CardAccordionItem>

            {/* 5. FAQ */}
            <CardAccordionItem
              title="FAQ"
              isOpen={expandedSections.faq}
              onToggle={() => toggleSection('faq')}
            >
              <div style={{ fontSize: '0.85rem', color: '#706E68', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <strong style={{ color: '#181817' }}>Q: Can I keep the inside blank to write by hand?</strong>
                  <div>Yes! Simply choose "Order Blank Inside" and we ship the card blank with its envelope.</div>
                </div>
                <div>
                  <strong style={{ color: '#181817' }}>Q: What pen works best on this paper?</strong>
                  <div>Any ballpoint, gel pen, or fountain pen works cleanly without bleeding or feathering.</div>
                </div>
                <div>
                  <strong style={{ color: '#181817' }}>Q: What if I notice a typo after ordering?</strong>
                  <div>Message us on WhatsApp within 2 hours of placing your order and our team will adjust the text before print.</div>
                </div>
              </div>
            </CardAccordionItem>

          </div>

          {/* Smart Cross-Sell */}
          <div style={{ marginTop: '3.5rem', borderTop: '1px solid #DDD9D0', paddingTop: '2.5rem' }}>
            <SmartCrossSell 
              sourceContext="card" 
              onAddToCart={onAddToCart}
            />
          </div>

        </div>

      </div>

    </div>
  );
}

function CardAccordionItem({ title, isOpen, onToggle, children }) {
  return (
    <div 
      style={{
        border: '1px solid #DDD9D0',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease'
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.95rem 1.25rem',
          backgroundColor: isOpen ? '#FAF8F5' : '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 500, color: '#181817' }}>
          {title}
        </span>
        <span style={{ color: '#706E68' }}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {isOpen && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid #DDD9D0', backgroundColor: '#FFFFFF' }}>
          {children}
        </div>
      )}
    </div>
  );
}
