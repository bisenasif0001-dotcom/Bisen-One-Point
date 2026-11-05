import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  ShoppingBag, 
  MessageCircle, 
  Eye, 
  Check, 
  Layers, 
  Scroll, 
  Star,
  Maximize2,
  X,
  Filter,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { ASMA_UL_HUSNA_ITEMS, ASMA_UL_HUSNA_COUNT } from '../data/asmaUlHusnaData';
import { FRAME_SIZES, FRAME_FINISHES } from '../data/products';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../data/businessConfig';

export default function AsmaUlHusnaGallery({ onAddToCart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'bestsellers' | 'mercy' | 'power'
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  // Per-card format, size, finish selections
  const [cardFormatMap, setCardFormatMap] = useState({}); // { [id]: 'framed' | 'unframed' }
  const [cardSizeMap, setCardSizeMap] = useState({});     // { [id]: 'A4' }
  const [cardFinishMap, setCardFinishMap] = useState({}); // { [id]: 'Classic Black' }
  const [addedToastId, setAddedToastId] = useState(null);

  // Format helpers
  const getFormat = (id) => cardFormatMap[id] || 'framed';
  const getSize = (id) => cardSizeMap[id] || 'A4';
  const getFinish = (id) => cardFinishMap[id] || 'Classic Black';

  // Dynamic price calculation
  const calculatePrice = (item) => {
    const format = getFormat(item.id);
    const sizeId = getSize(item.id);
    const sizeObj = FRAME_SIZES.find(s => s.id === sizeId) || FRAME_SIZES[1];
    
    if (format === 'unframed') {
      return Math.round(item.unframedPriceA4 * (sizeObj.multiplier / 1.35));
    } else {
      const finishObj = FRAME_FINISHES.find(f => f.name.includes(getFinish(item.id))) || FRAME_FINISHES[0];
      return Math.round((item.framedPriceA4 * (sizeObj.multiplier / 1.35)) + (finishObj.extraPrice * 0.5));
    }
  };

  // Filtered & Searched items
  const filteredItems = useMemo(() => {
    return ASMA_UL_HUSNA_ITEMS.filter((item) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.title.toLowerCase().includes(q);
        const matchesMeaning = item.meaning.toLowerCase().includes(q);
        const matchesNumber = String(item.number).includes(q) || item.displayNumber.includes(q);
        const matchesArabic = item.arabicTitle.includes(q);
        if (!matchesName && !matchesMeaning && !matchesNumber && !matchesArabic) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedFilter === 'bestsellers') {
        return item.isBestseller;
      }
      if (selectedFilter === 'mercy') {
        return ['rahman', 'raheem', 'salaam', 'lateef', 'wadood', 'ghaffar', 'ghafoor'].some(k => item.title.toLowerCase().includes(k));
      }
      if (selectedFilter === 'power') {
        return ['malik', 'azeez', 'jabbar', 'mutakabbir', 'qahhar', 'qawiyy', 'mateen'].some(k => item.title.toLowerCase().includes(k));
      }

      return true;
    });
  }, [searchQuery, selectedFilter]);

  // Cart Handler
  const handleAddToCart = (item) => {
    const format = getFormat(item.id);
    const sizeId = getSize(item.id);
    const sizeObj = FRAME_SIZES.find(s => s.id === sizeId) || FRAME_SIZES[1];
    const finish = getFinish(item.id);
    const price = calculatePrice(item);

    const cartItem = {
      id: `${item.id}-${format}-${sizeId}-${Date.now()}`,
      type: 'islamic_art',
      title: `${item.title} (${item.arabicTitle}) - Asma-ul-Husna Calligraphy`,
      arabicTitle: item.arabicTitle,
      format: format === 'framed' ? 'Framed (Ready to Hang)' : 'Without Frame (Rolled Fine-Art Print)',
      size: sizeObj.name,
      dimensions: sizeObj.dimensionsCm,
      finish: format === 'framed' ? finish : 'None (Rolled Print)',
      price: price,
      quantity: 1,
      image: item.imageUrl
    };

    if (onAddToCart) onAddToCart(cartItem);
    setAddedToastId(item.id);
    setTimeout(() => setAddedToastId(null), 2500);
  };

  // WhatsApp Order Handler
  const handleWhatsAppOrder = (item) => {
    const format = getFormat(item.id);
    const sizeId = getSize(item.id);
    const sizeObj = FRAME_SIZES.find(s => s.id === sizeId) || FRAME_SIZES[1];
    const finish = getFinish(item.id);
    const price = calculatePrice(item);

    const message = `*ASSALAM O ALAIKUM! INQUIRY FOR ASMA-UL-HUSNA CALLIGRAPHY:*\n\n` +
      `🕌 *Sacred Name:* #${item.displayNumber} ${item.title} (${item.arabicTitle})\n` +
      `📖 *Meaning:* ${item.meaning}\n` +
      `📦 *Format:* ${format === 'framed' ? `Framed (${finish} Moulding)` : 'Unframed (Rolled Print)'}\n` +
      `📌 *Size:* ${sizeObj.name} (${sizeObj.dimensionsCm})\n` +
      `💰 *Price:* ₹${price}\n\n` +
      `Please confirm dispatch and photo lab crafting timeline.`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', padding: '2rem 0 5rem 0' }}>
      
      {/* Search & Filter Toolbar */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E6E2D8',
          padding: '1.25rem 1.5rem',
          marginBottom: '2.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#FAF8F5', border: '1px solid #D6D0C4', borderRadius: '8px', padding: '0.6rem 1rem', flex: '1 1 320px', maxWidth: '480px' }}>
            <Search size={18} color="#9B7A50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 78 names by number (#01), English or Arabic..."
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-sans)',
                color: '#181817'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8780', padding: 0 }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: `All Names (${ASMA_UL_HUSNA_COUNT})` },
              { id: 'bestsellers', label: 'Bestsellers' },
              { id: 'mercy', label: 'Names of Mercy & Peace' },
              { id: 'power', label: 'Names of Majesty & Power' }
            ].map((tab) => {
              const active = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedFilter(tab.id)}
                  style={{
                    backgroundColor: active ? '#181817' : '#FAF8F5',
                    color: active ? '#FFFFFF' : '#5C5A55',
                    border: active ? '1px solid #181817' : '1px solid #DDD9D0',
                    borderRadius: '20px',
                    padding: '0.42rem 0.95rem',
                    fontSize: '0.78rem',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* Status Counter */}
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #EDE8E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#65635E' }}>
          <div>
            Showing <strong style={{ color: '#181817' }}>{filteredItems.length}</strong> of <strong style={{ color: '#181817' }}>{ASMA_UL_HUSNA_COUNT}</strong> Sacred Calligraphy Artworks
          </div>
          <div style={{ color: 'var(--accent-bronze)', fontWeight: 600 }}>
            ★ Available as Rolled Fine-Art Prints or Ready-to-Hang Solid Wood Frames
          </div>
        </div>
      </div>

      {/* Grid of 78 Names */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.75rem'
        }}
      >
        {filteredItems.map((item) => {
          const format = getFormat(item.id);
          const size = getSize(item.id);
          const finish = getFinish(item.id);
          const currentPrice = calculatePrice(item);
          const isToastActive = addedToastId === item.id;

          return (
            <div
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E6E2D8',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(23, 23, 23, 0.08)';
                e.currentTarget.style.borderColor = '#C4AA87';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = '#E6E2D8';
              }}
            >
              {/* Image Preview Container */}
              <div 
                style={{
                  position: 'relative',
                  backgroundColor: '#FAF8F5',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  borderBottom: '1px solid #EDE8E1'
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={`${item.title} - ${item.meaning}`}
                  loading="lazy"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.3s ease',
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.06))'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />

                {/* Number Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#181817',
                    color: '#F5F3EE',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em'
                  }}
                >
                  #{item.displayNumber}
                </div>

                {/* Quick View Button */}
                <button
                  type="button"
                  onClick={() => setSelectedItemForModal(item)}
                  aria-label={`View full details of ${item.title}`}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: '1px solid #E6E2D8',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#181817',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                  }}
                  title="Zoom calligraphy"
                >
                  <Eye size={15} />
                </button>

                {item.isBestseller && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      backgroundColor: '#FAF5EE',
                      border: '1px solid #E8DFD1',
                      color: 'var(--accent-bronze)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                  >
                    ★ Popular
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Arabic Script & Transliteration */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 650, color: '#181817', margin: 0, fontFamily: 'var(--font-serif)' }}>
                    {item.title}
                  </h3>
                  <span 
                    style={{ 
                      fontSize: '1.35rem', 
                      fontFamily: 'var(--font-arabic, serif)', 
                      color: 'var(--accent-bronze)', 
                      direction: 'rtl' 
                    }}
                  >
                    {item.arabicTitle}
                  </span>
                </div>

                {/* Meaning */}
                <p style={{ fontSize: '0.8rem', color: '#65635E', margin: '0 0 1rem 0', lineHeight: 1.45, minHeight: '36px' }}>
                  {item.meaning}
                </p>

                {/* Format Toggle: Framed vs Unframed */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', backgroundColor: '#EDEAE3', padding: '3px', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setCardFormatMap(prev => ({ ...prev, [item.id]: 'framed' }))}
                      style={{
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: format === 'framed' ? 700 : 500,
                        backgroundColor: format === 'framed' ? '#FFFFFF' : 'transparent',
                        color: format === 'framed' ? '#181817' : '#706E6B',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Layers size={12} />
                      <span>Framed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardFormatMap(prev => ({ ...prev, [item.id]: 'unframed' }))}
                      style={{
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: format === 'unframed' ? 700 : 500,
                        backgroundColor: format === 'unframed' ? '#FFFFFF' : 'transparent',
                        color: format === 'unframed' ? '#181817' : '#706E6B',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Scroll size={12} />
                      <span>Rolled Print</span>
                    </button>
                  </div>
                </div>

                {/* Size Selector Tabs (A5, A4, A3, A2) */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {['A5', 'A4', 'A3', 'A2'].map((sz) => {
                      const isSelected = size === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setCardSizeMap(prev => ({ ...prev, [item.id]: sz }))}
                          style={{
                            padding: '0.3rem',
                            fontSize: '0.72rem',
                            fontWeight: isSelected ? 700 : 500,
                            backgroundColor: isSelected ? '#181817' : '#FAF8F5',
                            color: isSelected ? '#FFFFFF' : '#5C5A55',
                            border: isSelected ? '1px solid #181817' : '1px solid #E6E2D8',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frame Moulding Selector (Only if Framed) */}
                {format === 'framed' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <select
                      value={finish}
                      onChange={(e) => setCardFinishMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.74rem',
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #D6D0C4',
                        borderRadius: '4px',
                        color: '#181817',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    >
                      <option value="Classic Black">Moulding: Classic Matte Black</option>
                      <option value="Natural Oak">Moulding: Natural Oak Wood</option>
                      <option value="Warm Walnut">Moulding: Warm Walnut Wood</option>
                      <option value="Royal Carved Gold">Moulding: Antique Victorian Gold</option>
                    </select>
                  </div>
                )}

                {/* Price & Action Buttons */}
                <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #EDE8E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#8A8780', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {format === 'framed' ? 'Ready to Hang' : 'Rolled Canvas'}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#181817' }}>
                      ₹{currentPrice}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      style={{
                        backgroundColor: isToastActive ? '#1E6F3E' : '#181817',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.55rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {isToastActive ? <Check size={14} /> : <ShoppingBag size={14} />}
                      <span>{isToastActive ? 'Added' : 'Add'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppOrder(item)}
                      aria-label="Order on WhatsApp"
                      style={{
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #D6D0C4',
                        borderRadius: '6px',
                        padding: '0.55rem 0.65rem',
                        cursor: 'pointer',
                        color: '#25D366'
                      }}
                      title="Direct WhatsApp Order"
                    >
                      <MessageCircle size={15} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Zoom Modal */}
      {selectedItemForModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(23, 23, 23, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)'
            }}
          >
            <button
              onClick={() => setSelectedItemForModal(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#FAF8F5',
                border: '1px solid #E6E2D8',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#181817'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              
              {/* Large Image View */}
              <div
                style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E6E2D8'
                }}
              >
                <img
                  src={selectedItemForModal.imageUrl}
                  alt={selectedItemForModal.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.1))'
                  }}
                />
              </div>

              {/* Info Column */}
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-bronze)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Asma-ul-Husna Calligraphy #{selectedItemForModal.displayNumber}
                </span>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.5rem 0' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 650, color: '#181817', margin: 0, fontFamily: 'var(--font-serif)' }}>
                    {selectedItemForModal.title}
                  </h2>
                  <span style={{ fontSize: '2rem', fontFamily: 'var(--font-arabic, serif)', color: 'var(--accent-bronze)', direction: 'rtl' }}>
                    {selectedItemForModal.arabicTitle}
                  </span>
                </div>

                <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#181817', marginBottom: '0.85rem' }}>
                  {selectedItemForModal.meaning}
                </div>

                <p style={{ fontSize: '0.86rem', color: '#65635E', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {selectedItemForModal.description}
                </p>

                <div style={{ backgroundColor: '#FAF8F5', padding: '1rem', borderRadius: '8px', border: '1px solid #E6E2D8', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#55534E', lineHeight: 1.5 }}>
                  ✓ Printed on calibrated Epson 6-colour photo lab with pigment-rich continuous tones.<br />
                  ✓ Choice of optical cast shatterproof acrylic glazing or rolled tube delivery.<br />
                  Delivery availability, charges and timing are confirmed by the studio.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(selectedItemForModal);
                      setSelectedItemForModal(null);
                    }}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.75rem', fontSize: '0.88rem', justifyContent: 'center' }}
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Bag (₹{calculatePrice(selectedItemForModal)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppOrder(selectedItemForModal)}
                    style={{
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #D6D0C4',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#181817',
                      fontWeight: 600,
                      fontSize: '0.86rem'
                    }}
                  >
                    <MessageCircle size={16} color="#25D366" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
