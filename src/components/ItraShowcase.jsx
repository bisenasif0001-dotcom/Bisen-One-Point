import React, { useState } from 'react';
import { 
  Sparkles, 
  Droplet, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Clock, 
  ShieldCheck, 
  Star, 
  Gift,
  Plus
} from 'lucide-react';
import { ITRA_PERFUME_COLLECTION } from '../data/products';
import { getWhatsAppUrl } from '../data/businessConfig';

export default function ItraShowcase({ onAddToCart }) {
  const [selectedVolumeMap, setSelectedVolumeMap] = useState({});
  const [toastId, setToastId] = useState(null);

  // Discovery Box State
  const [selectedDiscoveryItems, setSelectedDiscoveryItems] = useState([
    ITRA_PERFUME_COLLECTION[0].name,
    ITRA_PERFUME_COLLECTION[1].name
  ]);
  const [discoveryToast, setDiscoveryToast] = useState(false);

  const getVolume = (id) => selectedVolumeMap[id] || '6ml';

  const handleAddToCart = (item) => {
    const vol = getVolume(item.id);
    const price = item.prices[vol];

    const cartItem = {
      id: `${item.id}-${vol}-${Date.now()}`,
      type: 'itra_perfume',
      title: item.name,
      subTitle: item.subTitle,
      volume: vol,
      price: price,
      quantity: 1,
      image: item.image,
      alcoholFree: item.alcoholFree
    };

    onAddToCart(cartItem);
    setToastId(item.id);
    setTimeout(() => setToastId(null), 2500);
  };

  const handleWhatsAppOrder = (item) => {
    const vol = getVolume(item.id);
    const price = item.prices[vol];

    const message = `*ASSALAM O ALAIKUM! I WANT TO ORDER ROYAL ITRA / PERFUME:*\n\n` +
      `🌸 *Fragrance:* ${item.name} (${item.subTitle})\n` +
      `🧪 *Size/Volume:* ${vol}\n` +
      `💰 *Price:* ₹${price}\n` +
      `✨ *Notes:* ${item.notes.top} | ${item.notes.heart} | ${item.notes.base}\n\n` +
      `Please provide delivery timeline & payment link.`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  // Toggle Discovery Item
  const toggleDiscoveryItem = (itemName) => {
    if (selectedDiscoveryItems.includes(itemName)) {
      if (selectedDiscoveryItems.length > 1) {
        setSelectedDiscoveryItems(selectedDiscoveryItems.filter(i => i !== itemName));
      }
    } else {
      if (selectedDiscoveryItems.length < 4) {
        setSelectedDiscoveryItems([...selectedDiscoveryItems, itemName]);
      }
    }
  };

  // Add Discovery Box to Cart
  const handleAddDiscoveryBox = () => {
    const boxItem = {
      id: `discovery-box-${Date.now()}`,
      type: 'itra_box',
      title: 'Royal Itra Discovery Sample Box (4 x 3ml Pocket Flacons)',
      subTitle: selectedDiscoveryItems.join(', '),
      volume: '4 x 3ml (12ml Total)',
      price: 999,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      alcoholFree: true
    };

    onAddToCart(boxItem);
    setDiscoveryToast(true);
    setTimeout(() => setDiscoveryToast(false), 3000);
  };

  return (
    <section id="itra-collection" style={{
      padding: '5.5rem 0',
      background: 'var(--bg-surface)',
      position: 'relative',
      borderBottom: '1px solid var(--border-glass)'
    }}>
      <div className="container-custom">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem auto' }}>
          <div className="badge-gold" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={13} /> 100% Pure Alcohol-Free Artisanal Attars
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            The Royal <span className="gold-gradient-text">Itra & Fragrance House</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Distilled from the rarest agarwood (Dehn Al Oud), mystical Kashmir musk, and fresh Taif roses. Long-lasting, non-alcoholic formulations crafted for prayer, occasions, and daily royalty.
          </p>
        </div>

        {/* Perfume Cards Grid */}
        <div className="grid-responsive-cards" style={{ marginBottom: '4rem' }}>
          {ITRA_PERFUME_COLLECTION.map((item) => {
            const currentVol = getVolume(item.id);
            const currentPrice = item.prices[currentVol];
            const isToast = toastId === item.id;

            return (
              <div
                key={item.id}
                className="glass-panel glass-card-hover"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {/* Image Container */}
                <div style={{
                  position: 'relative',
                  height: '260px',
                  backgroundColor: '#0a0d12',
                  overflow: 'hidden'
                }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />

                  {/* Top Badge */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <span className="badge-gold" style={{ fontSize: '0.7rem' }}>
                      {item.tag}
                    </span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(6, 35, 28, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    color: '#34d399',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <ShieldCheck size={13} /> 100% Non-Alcoholic
                  </div>

                  {/* Longevity Bar */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(10,13,18,0.95), transparent)',
                    padding: '1rem 1rem 0.5rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: '#f3e29f'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> Longevity: {item.longevity}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>Roll-on & Spray</span>
                  </div>
                </div>

                {/* Body Content */}
                <div style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  gap: '0.85rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', color: '#eab308' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill="#eab308" />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({item.reviewsCount})</span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                      {item.subTitle}
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.description}
                  </p>

                  {/* Fragrance Notes Box */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    fontSize: '0.72rem',
                    lineHeight: 1.5
                  }}>
                    <div><strong style={{ color: 'var(--gold-light)' }}>Top:</strong> {item.notes.top}</div>
                    <div><strong style={{ color: 'var(--gold-light)' }}>Heart:</strong> {item.notes.heart}</div>
                    <div><strong style={{ color: 'var(--gold-light)' }}>Base:</strong> {item.notes.base}</div>
                  </div>

                  {/* Volume Selector Buttons */}
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                      Select Flacon Size:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                      {Object.keys(item.prices).map((vol) => {
                        const isSelected = currentVol === vol;
                        return (
                          <button
                            key={vol}
                            onClick={() => setSelectedVolumeMap({ ...selectedVolumeMap, [item.id]: vol })}
                            style={{
                              background: isSelected ? 'var(--text-primary)' : 'var(--bg-surface)',
                              color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                              border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                              borderRadius: '4px',
                              padding: '5px 2px',
                              fontSize: '0.72rem',
                              fontWeight: isSelected ? 600 : 500,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div>{vol}</div>
                            <div style={{ fontSize: '0.68rem', opacity: isSelected ? 0.9 : 0.7 }}>
                              ₹{item.prices[vol]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div style={{
                    marginTop: 'auto',
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: '0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                          ₹{currentPrice}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          ({currentVol} Pure Flacon)
                        </span>
                      </div>

                      {isToast && (
                        <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Check size={13} /> Added!
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="btn-gold"
                        style={{ padding: '0.6rem 0.75rem', fontSize: '0.82rem' }}
                      >
                        <ShoppingBag size={15} /> Add to Cart
                      </button>

                      <button
                        onClick={() => handleWhatsAppOrder(item)}
                        className="btn-whatsapp"
                        style={{ padding: '0.6rem 0.75rem', fontSize: '0.82rem' }}
                      >
                        <MessageCircle size={15} /> WhatsApp
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Custom Discovery Box Builder */}
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1.5px solid var(--border-active)',
          background: 'linear-gradient(135deg, rgba(6, 35, 28, 0.6) 0%, rgba(18, 23, 32, 0.9) 100%)',
          boxShadow: 'var(--shadow-luxe)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            alignItems: 'center'
          }} className="discovery-grid">
            <style>{`
              @media (min-width: 900px) {
                .discovery-grid { grid-template-columns: 1.2fr 1fr !important; }
              }
            `}</style>

            <div>
              <div className="badge-gold" style={{ marginBottom: '0.6rem' }}>
                <Gift size={13} /> Personalized Fragrance Gift Set
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Build Your Own <span className="gold-gradient-text">Royal 4-Attar Discovery Box</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Pick any 4 artisan attars (3ml pocket flacons each) packed inside a handcrafted velvet gift box with a personalized golden name tag. Perfect for personal sampling or gifting.
              </p>

              {/* Selection Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {ITRA_PERFUME_COLLECTION.map((itra) => {
                  const isChecked = selectedDiscoveryItems.includes(itra.name);
                  return (
                    <button
                      key={itra.id}
                      onClick={() => toggleDiscoveryItem(itra.name)}
                      style={{
                        background: isChecked ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                        border: isChecked ? '1px solid var(--gold-primary)' : '1px solid var(--border-glass)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: isChecked ? 'var(--gold-light)' : 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: isChecked ? 700 : 500,
                        textAlign: 'left'
                      }}
                    >
                      <span>{itra.name.split(' ')[0]} {itra.name.split(' ')[1]}</span>
                      {isChecked ? <Check size={15} color="#d4af37" /> : <Plus size={15} color="#94a3b8" />}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#f3e29f' }}>
                Selected: {selectedDiscoveryItems.length} of 4 Flacons
              </div>
            </div>

            {/* Box Price & Action Card */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-glass)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Special Discovery Set Price</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--gold-light)', margin: '0.25rem 0' }}>
                ₹999 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹1,800</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '1.25rem' }}>
                Includes Luxury Velvet Box & Free Express Shipping
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={handleAddDiscoveryBox}
                  className="btn-gold"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  <Gift size={18} /> Add Discovery Box to Cart
                </button>

                {discoveryToast && (
                  <div style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>
                    ✓ Discovery Box added to Cart!
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
