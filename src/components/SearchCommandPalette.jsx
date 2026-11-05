import { FRAME_FINISHES } from '../data/products';
import { getStudioPrice } from '../utils/frameStudio';
import { ITRA_PRODUCTS } from '../data/itraProducts';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUA_POSTERS } from '../data/duaPosters';
import { DUA_PRINT_PRICES } from '../data/duaPricing';
import { PVC_PRODUCTS, PVC_CARD_TYPES, pvcProductPath } from '../data/pvcCards';
import { 
  Search, X, ArrowRight, CornerDownLeft, Sparkles, 
  Image as ImageIcon, Printer, Frame, Gift, Heart, 
  Compass, Eye, ChevronRight, Layers, Award, Tag, CreditCard
} from 'lucide-react';

/**
 * AL-NOOR COMPREHENSIVE SEARCH DATABASE (PROMPT 29)
 * Grouped into: PRODUCTS, SERVICES, COLLECTIONS, OCCASIONS
 */
export const SEARCH_INDEX = [
  ...PVC_PRODUCTS.map(product => ({
    id: `pvc-${product.id}`, group: 'SERVICES', title: product.title,
    subtitle: `${product.use} · Single / both sides · Design & accessories`, badge: 'PVC Card',
    link: pvcProductPath(product.id),
    keywords: ['pvc', 'plastic', 'card', product.title.toLowerCase(), ...PVC_CARD_TYPES.filter(type => type.productId === product.id).map(type => type.label.toLowerCase())]
  })),
  ...DUA_POSTERS.map(poster => ({
    id: `dua-${poster.id}`,
    group: 'PRODUCTS',
    title: poster.title,
    subtitle: `${poster.category} · 250 GSM glossy · With or without frame`,
    price: `Print from ₹${DUA_PRINT_PRICES.A5} + delivery`,
    badge: 'Dua Poster',
    thumbnail: poster.thumbnail,
    link: `/dua-posters/${poster.id}`,
    keywords: ['dua', 'poster', 'islamic', 'glossy', '250gsm', 'prayer', poster.title.toLowerCase(), poster.category.toLowerCase()]
  })),
  ...FRAME_FINISHES.map(frame => ({
    id: `frame-${frame.id}`, group: 'PRODUCTS', title: `${frame.name} Photo Frame`,
    subtitle: `${frame.finish} · Portrait or landscape · Live photo preview`,
    price: `From ₹${getStudioPrice({ sizeId: 'A5', frameId: frame.id, glassId: 'crystal_acrylic' }).unit}`,
    badge: 'Custom frame', thumbnail: frame.frontImage,
    link: `/custom-framing?frame=${frame.id}`,
    keywords: ['frame', 'photo frame', 'custom', frame.name.toLowerCase(), frame.finish.toLowerCase()]
  })),
  ...ITRA_PRODUCTS.map(product => ({
    id: `itra-${product.id}`, group: 'PRODUCTS', title: product.name,
    subtitle: product.family, badge: 'Itra', thumbnail: product.image,
    price: `₹${product.prices[product.defaultSize]} (${product.defaultSize})`,
    link: `/itra/${product.id}`,
    keywords: ['itra', 'attar', 'perfume', product.name.toLowerCase(), product.family.toLowerCase()]
  })),
  { id: 'birthday-studio', group: 'SERVICES', title: 'Personalised Birthday Cards',
    subtitle: 'Choose a design, add a photograph and write your own message',
    badge: 'Card studio', link: '/birthday-cards',
    keywords: ['card', 'birthday', 'photo card', 'greeting', 'personalised', 'botanical'] },
  { id: 'names-art', group: 'COLLECTIONS', title: 'Names of Allah Calligraphy',
    subtitle: 'Explore the available Asma-ul-Husna designs', badge: 'Calligraphy',
    thumbnail: '/islamic-calligraphy/001 Ya Allah.png', link: '/islamic-art?tab=names',
    keywords: ['allah', '99 names', 'asma', 'husna', 'names', 'arabic'] },

  // 2. SERVICES
  {
    id: 'serv-print-photos',
    group: 'SERVICES',
    title: 'Print Photos (Photo Lab)',
    subtitle: 'Professional 6-Colour Epson photo prints from 4x6" to 12x18" on 260 GSM Lustre & Matte',
    badge: 'Print Lab',
    link: '/photo-prints',
    keywords: ['print', 'print photos', 'lab', 'epson', 'lustre', 'matte', 'printing', 'digital photo', '4x6', '5x7', '8x10']
  },
  {
    id: 'serv-frame-my-photo',
    group: 'SERVICES',
    title: 'Frame My Photo (Upload & Frame)',
    subtitle: 'Upload any digital photo, pick from 7 frame finishes with instant preview',
    badge: 'Custom Studio',
    link: '/custom-framing',
    keywords: ['frame my photo', 'upload', 'custom frame', 'frame photo', 'customise', 'customizer', 'picture frame', 'hang']
  },
  {
    id: 'serv-photo-diagnostic',
    group: 'SERVICES',
    title: 'Photo Quality Diagnostic Checker',
    subtitle: 'Instant pre-flight check analyzing your image resolution, pixel dimensions & print DPI',
    badge: 'Diagnostic Tool',
    link: '/custom-framing',
    keywords: ['diagnostic', 'dpi', 'resolution', 'quality check', 'photo check', 'megapixels', 'sharpness']
  },
  {
    id: 'serv-size-guide',
    group: 'SERVICES',
    title: 'Visual Size Comparison Guide',
    subtitle: 'Interactive living room, bedroom, and desk scale visualizer across A4, A3, A2 & A1 sizes',
    badge: 'Interactive Guide',
    link: '/size-guide',
    keywords: ['size', 'size guide', 'dimensions', 'compare', 'scale', 'room view', 'a4', 'a3', 'a2', 'a1']
  },
  {
    id: 'serv-gallery-wall-builder',
    group: 'SERVICES',
    title: 'Build A Gallery Wall',
    subtitle: 'Curated 3, 5, 7, and 9 frame wall layouts with true-to-scale 1:1 paper hanging templates',
    badge: 'Wall Builder',
    link: '/gallery-walls',
    keywords: ['gallery wall', 'wall art', 'wall layout', '3 frames', '5 frames', 'templates', 'bundle']
  },

  // 3. COLLECTIONS
  {
    id: 'col-birthday-gifts',
    group: 'COLLECTIONS',
    title: 'Birthday Gifts & Keepsakes',
    subtitle: 'Bespoke photo frames, milestone typography cards, and curated gift boxes',
    badge: 'Curated Edit',
    thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80',
    link: '/occasions/birthday',
    keywords: ['birthday', 'birthday gifts', 'birthday cards', 'gifts', 'celebration', 'presents']
  },
  {
    id: 'col-islamic-wall-art',
    group: 'COLLECTIONS',
    title: 'Islamic Sacred Wall Art',
    subtitle: 'Original Dua posters, Quranic verses and Arabic calligraphy',
    badge: 'Sacred Art',
    thumbnail: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=300&q=80',
    link: '/islamic-art',
    keywords: ['islamic', 'islamic wall art', 'calligraphy', 'quranic', 'arabic art', 'ayat ul kursi', 'surah', 'allah']
  },
  {
    id: 'col-gallery-walls',
    group: 'COLLECTIONS',
    title: 'Curated Gallery Wall Bundles',
    subtitle: 'The Classic Trio, The Family Wall, and The Wedding Salon with 1:1 paper hanging guides',
    badge: 'Wall Sets',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
    link: '/gallery-walls',
    keywords: ['gallery wall', 'gallery', 'trio', 'family wall', 'wall bundles', 'salon', 'multi frame']
  },
  {
    id: 'col-greeting-cards',
    group: 'COLLECTIONS',
    title: 'Artisan Greeting Cards & Stationery',
    subtitle: 'Personalised cards for birthdays, celebrations and heartfelt notes',
    badge: 'Stationery',
    thumbnail: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=300&q=80',
    link: '/cards',
    keywords: ['cards', 'greeting cards', 'stationery', 'envelopes', 'invitations', 'letterpress']
  },
  {
    id: 'col-itra-perfumes',
    group: 'COLLECTIONS',
    title: 'Pure Artisanal Itra Perfumes',
    subtitle: 'Non-alcoholic, 100% pure concentrated oil attars hand-poured in crystal glass flacons',
    badge: 'Fragrance',
    thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80',
    link: '/itra-perfumes',
    keywords: ['itra', 'attar', 'perfumes', 'fragrance', 'non alcoholic', 'oud', 'musk', 'rose oil']
  },
  {
    id: 'col-signature-gift-sets',
    group: 'COLLECTIONS',
    title: 'Signature Gift Sets & Memory Boxes',
    subtitle: 'Coordinated memory gift sets combining custom wood frames, keepsake cards & pure itra',
    badge: 'Gift Sets',
    thumbnail: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80',
    link: '/gift-sets',
    keywords: ['gift sets', 'signature sets', 'gift boxes', 'memory box', 'complete gift', 'hampers']
  },

  // 4. OCCASIONS
  {
    id: 'occ-birthday',
    group: 'OCCASIONS',
    title: 'Birthday Celebrations',
    subtitle: 'Milestone framed memories, botanical foil cards & luxury birthday memory boxes',
    badge: 'Milestone',
    link: '/occasions/birthday',
    keywords: ['birthday', 'bday', 'birthdays', 'milestone', 'celebrate', 'age']
  },
  {
    id: 'occ-wedding',
    group: 'OCCASIONS',
    title: 'Wedding & Nikah',
    subtitle: 'Couple portrait frames, Nikah certificate framing, and couple fragrance pairings',
    badge: 'Union',
    link: '/occasions/wedding',
    keywords: ['wedding', 'nikah', 'marriage', 'couple', 'bride', 'groom', 'shaadi']
  },
  {
    id: 'occ-anniversary',
    group: 'OCCASIONS',
    title: 'Anniversary Milestones',
    subtitle: 'Silver, gold & paper anniversary framed keepsakes with letterpress messages',
    badge: 'Anniversary',
    link: '/occasions/anniversary',
    keywords: ['anniversary', 'years', 'celebration', 'paper anniversary', 'silver', 'couple']
  },
  {
    id: 'occ-new-baby',
    group: 'OCCASIONS',
    title: 'New Baby & Nursery',
    subtitle: 'Birth announcement prints, birth stat displays & gentle light oak nursery frames',
    badge: 'Newborn',
    link: '/occasions/new-baby',
    keywords: ['baby', 'new baby', 'newborn', 'nursery', 'birth', 'child', 'infant']
  },
  {
    id: 'occ-for-parents',
    group: 'OCCASIONS',
    title: 'For Parents & Elders',
    subtitle: 'Revered ancestral family portraits, heritage walnut frames & prestige oud gifts',
    badge: 'Heritage',
    link: '/occasions/parents',
    keywords: ['parents', 'mother', 'father', 'grandparents', 'elders', 'family', 'amma', 'abba']
  },
  {
    id: 'occ-eid',
    group: 'OCCASIONS',
    title: 'Eid & Islamic Celebrations',
    subtitle: 'Sacred calligraphy wall art, festive gold foil cards & royal amberwood itras',
    badge: 'Festive',
    link: '/occasions/eid',
    keywords: ['eid', 'ramadan', 'mubarak', 'islamic', 'festive', 'celebration']
  }
];

const POPULAR_SEARCH_CHIPS = [
  'Regal Noir Frame',
  'Taif Rose',
  'Print Photos',
  'Frame My Photo',
  'Birthday Gifts',
  'Islamic Wall Art',
  'Gallery Wall Trio',
  'Oud Royale'
];

export default function SearchCommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = event => {
      if (!isOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'Tab') {
        const nodes = [...(dialogRef.current?.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled)') || [])].filter(node => node.getClientRects().length);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered and grouped results
  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    
    let items = SEARCH_INDEX;
    if (activeCategoryFilter !== 'ALL') {
      items = items.filter(i => i.group === activeCategoryFilter);
    }

    if (!trimmed) {
      return items;
    }

    return items.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchSubtitle = item.subtitle.toLowerCase().includes(trimmed);
      const matchGroup = item.group.toLowerCase().includes(trimmed);
      const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(trimmed));
      return matchTitle || matchSubtitle || matchGroup || matchKeywords;
    });
  }, [query, activeCategoryFilter]);

  // Grouped by the 4 required pillars: PRODUCTS, SERVICES, COLLECTIONS, OCCASIONS
  const groupedResults = useMemo(() => {
    const groups = {
      PRODUCTS: [],
      SERVICES: [],
      COLLECTIONS: [],
      OCCASIONS: []
    };

    filteredResults.forEach(item => {
      if (groups[item.group]) {
        groups[item.group].push(item);
      }
    });

    return groups;
  }, [filteredResults]);

  // Flattened items for keyboard arrow navigation
  const flatResultItems = useMemo(() => {
    const list = [];
    if (groupedResults.PRODUCTS.length > 0) list.push(...groupedResults.PRODUCTS);
    if (groupedResults.SERVICES.length > 0) list.push(...groupedResults.SERVICES);
    if (groupedResults.COLLECTIONS.length > 0) list.push(...groupedResults.COLLECTIONS);
    if (groupedResults.OCCASIONS.length > 0) list.push(...groupedResults.OCCASIONS);
    return list;
  }, [groupedResults]);

  // Keyboard navigation up / down / enter
  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatResultItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResultItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResultItems.length > 0 && flatResultItems[selectedIndex]) {
        handleSelectItem(flatResultItems[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item) => {
    onClose();
    navigate(item.link);
  };

  const handleChipClick = (term) => {
    setQuery(term);
    if (inputRef.current) inputRef.current.focus();
  };

  if (!isOpen) return null;

  const totalResultsCount = filteredResults.length;
  const isQueryEmpty = query.trim().length === 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1.25rem 1rem',
        backgroundColor: 'rgba(24, 24, 23, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'searchFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes searchFadeIn {
          from { opacity: 0; transform: scale(0.985); }
          to { opacity: 1; transform: scale(1); }
        }
        .search-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .search-scroll::-webkit-scrollbar-track {
          background: #FAF8F5;
        }
        .search-scroll::-webkit-scrollbar-thumb {
          background: #D9D5CC;
          border-radius: 4px;
        }
        .search-item-hover:hover {
          background-color: #F5F3EE !important;
        }
        .search-chip-btn:hover {
          background-color: #181817 !important;
          color: #FFFFFF !important;
          border-color: #181817 !important;
        }
      `}</style>

      {/* Main Command Palette Modal Window */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search studio catalogue"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: 'min(86vh, 760px)',
          marginTop: 'min(4vh, 32px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E6E2D8',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #EDE8E1',
            backgroundColor: '#FAF8F5',
            position: 'relative'
          }}
        >
          <div style={{ color: '#9B7A50', display: 'flex', alignItems: 'center' }}>
            <Search size={20} strokeWidth={2} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search frames, photo prints, cards, wall art or fragrances..."
            aria-label="Search catalogue"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '1.02rem',
              fontWeight: 450,
              color: '#181817',
              fontFamily: 'var(--font-sans, inherit)'
            }}
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                if (inputRef.current) inputRef.current.focus();
              }}
              aria-label="Clear search query"
              style={{
                background: 'none',
                border: 'none',
                color: '#8A8780',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
            >
              <X size={16} />
            </button>
          )}

          {/* Desktop Esc Badge & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'none',
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#706E6B',
                backgroundColor: '#EDE8E1',
                borderRadius: '4px',
                letterSpacing: '0.04em'
              }}
              className="desktop-esc-badge"
            >
              ESC
            </span>
            <button
              onClick={onClose}
              aria-label="Close search"
              style={{
                background: 'none',
                border: 'none',
                color: '#5C5A55',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                minHeight: '40px',
                borderRadius: '8px'
              }}
            >
              <X size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Quick Filter Pill Tabs (One-Handed Mobile Friendly) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #F0ECE4',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}
        >
          {['ALL', 'PRODUCTS', 'SERVICES', 'COLLECTIONS', 'OCCASIONS'].map((cat) => {
            const isActive = activeCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategoryFilter(cat);
                  setSelectedIndex(0);
                }}
                style={{
                  background: isActive ? '#181817' : '#F5F3EE',
                  color: isActive ? '#FFFFFF' : '#5C5A55',
                  border: isActive ? '1px solid #181817' : '1px solid #E6E2D8',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Scrollable Results Area */}
        <div
          className="search-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            backgroundColor: '#FAF8F5'
          }}
        >
          {/* STATE 1: Empty Query - Show Quick Searches & Popular Shortcuts */}
          {isQueryEmpty && (
            <div>
              {/* Popular Searches */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#8A8780',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Sparkles size={12} color="#9B7A50" />
                  <span>Popular Studio Searches</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {POPULAR_SEARCH_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="search-chip-btn"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E6E2D8',
                        color: '#2B2927',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Studio Departments (4 Main Pillars) */}
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#8A8780',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem'
                  }}
                >
                  Studio Departments
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem'
                  }}
                >
                  {[
                    { label: 'Frames Catalogue', icon: Frame, desc: 'Solid wood mouldings', link: '/frames-catalogue' },
                    { label: 'Photo Prints Lab', icon: Printer, desc: 'Epson 6-colour photo lab', link: '/photo-prints' },
                    { label: 'Greeting Cards', icon: Gift, desc: '350 GSM textured boards', link: '/cards' },
                    { label: 'Artisanal Itra', icon: Sparkles, desc: '100% pure perfume oils', link: '/itra-perfumes' }
                  ].map((dept) => {
                    const IconComp = dept.icon;
                    return (
                      <div
                        key={dept.label}
                        onClick={() => {
                          onClose();
                          navigate(dept.link);
                        }}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E6E2D8',
                          borderRadius: '8px',
                          padding: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        className="search-item-hover"
                      >
                        <div style={{ color: '#9B7A50', marginBottom: '0.4rem' }}>
                          <IconComp size={18} />
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 650, color: '#181817' }}>
                          {dept.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#706E6B', marginTop: '0.15rem' }}>
                          {dept.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Query Typed & Zero Matches Found */}
          {!isQueryEmpty && totalResultsCount === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#EDE8E1',
                  color: '#8A8780',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <Search size={22} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#181817', marginBottom: '0.35rem' }}>
                No results found for "{query}"
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#706E6B', maxWidth: '360px', margin: '0 auto 1.25rem auto' }}>
                Try searching for general keywords like <strong>"Black Frame"</strong>, <strong>"Taif Rose"</strong>, <strong>"Photo Prints"</strong>, or <strong>"Birthday"</strong>.
              </p>
              <button
                onClick={() => setQuery('')}
                style={{
                  background: '#181817',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Search
              </button>
            </div>
          )}

          {/* STATE 3: Grouped Results (PRODUCTS, SERVICES, COLLECTIONS, OCCASIONS) */}
          {totalResultsCount > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* GROUP 1: PRODUCTS */}
              {groupedResults.PRODUCTS.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#8A8780',
                      textTransform: 'uppercase',
                      marginBottom: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>PRODUCTS ({groupedResults.PRODUCTS.length})</span>
                    <span style={{ fontSize: '0.68rem', color: '#9B7A50', fontWeight: 600 }}>Frames & Items</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {groupedResults.PRODUCTS.map((prod) => {
                      const isHighlighted = flatResultItems[selectedIndex]?.id === prod.id;
                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectItem(prod)}
                          className="search-item-hover"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            padding: '0.65rem 0.85rem',
                            backgroundColor: isHighlighted ? '#F5F3EE' : '#FFFFFF',
                            borderRadius: '8px',
                            border: isHighlighted ? '1px solid #9B7A50' : '1px solid #E6E2D8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Product Thumbnail */}
                          {prod.thumbnail ? (
                            <img
                              src={prod.thumbnail}
                              alt={prod.title}
                              style={{
                                width: '46px',
                                height: '46px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #E6E2D8',
                                flexShrink: 0
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '6px',
                                backgroundColor: '#EDE8E1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9B7A50',
                                flexShrink: 0
                              }}
                            >
                              <Frame size={20} />
                            </div>
                          )}

                          {/* Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 650, color: '#181817' }}>
                                {prod.title}
                              </span>
                              {prod.badge && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 600,
                                    color: '#9B7A50',
                                    backgroundColor: '#FAF5EE',
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '4px',
                                    border: '1px solid #E8DFD1'
                                  }}
                                >
                                  {prod.badge}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: '0.74rem',
                                color: '#706E6B',
                                marginTop: '0.15rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {prod.subtitle}
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 650, color: '#181817' }}>
                              {prod.price}
                            </span>
                            <ChevronRight size={16} color="#8A8780" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GROUP 2: SERVICES */}
              {groupedResults.SERVICES.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#8A8780',
                      textTransform: 'uppercase',
                      marginBottom: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>SERVICES ({groupedResults.SERVICES.length})</span>
                    <span style={{ fontSize: '0.68rem', color: '#9B7A50', fontWeight: 600 }}>Framing & Print Tools</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {groupedResults.SERVICES.map((serv) => {
                      const isHighlighted = flatResultItems[selectedIndex]?.id === serv.id;
                      return (
                        <div
                          key={serv.id}
                          onClick={() => handleSelectItem(serv)}
                          className="search-item-hover"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            padding: '0.75rem 0.85rem',
                            backgroundColor: isHighlighted ? '#F5F3EE' : '#FFFFFF',
                            borderRadius: '8px',
                            border: isHighlighted ? '1px solid #9B7A50' : '1px solid #E6E2D8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Service Icon */}
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              backgroundColor: '#F5F3EE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#9B7A50',
                              flexShrink: 0,
                              border: '1px solid #E6E2D8'
                            }}
                          >
                            {serv.id.startsWith('pvc-') ? (
                              <CreditCard size={18} />
                            ) : serv.id.includes('print') ? (
                              <Printer size={18} />
                            ) : serv.id.includes('wall') ? (
                              <Layers size={18} />
                            ) : serv.id.includes('size') ? (
                              <Compass size={18} />
                            ) : (
                              <Frame size={18} />
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 650, color: '#181817' }}>
                                {serv.title}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.62rem',
                                  fontWeight: 600,
                                  color: '#2B2927',
                                  backgroundColor: '#F0ECE4',
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '4px'
                                }}
                              >
                                {serv.badge}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: '0.74rem',
                                color: '#706E6B',
                                marginTop: '0.15rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {serv.subtitle}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9B7A50', fontSize: '0.76rem', fontWeight: 600, flexShrink: 0 }}>
                            <span>Launch</span>
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GROUP 3: COLLECTIONS */}
              {groupedResults.COLLECTIONS.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#8A8780',
                      textTransform: 'uppercase',
                      marginBottom: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>COLLECTIONS ({groupedResults.COLLECTIONS.length})</span>
                    <span style={{ fontSize: '0.68rem', color: '#9B7A50', fontWeight: 600 }}>Curated Edits</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
                    {groupedResults.COLLECTIONS.map((col) => {
                      const isHighlighted = flatResultItems[selectedIndex]?.id === col.id;
                      return (
                        <div
                          key={col.id}
                          onClick={() => handleSelectItem(col)}
                          className="search-item-hover"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.65rem 0.8rem',
                            backgroundColor: isHighlighted ? '#F5F3EE' : '#FFFFFF',
                            borderRadius: '8px',
                            border: isHighlighted ? '1px solid #9B7A50' : '1px solid #E6E2D8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {col.thumbnail && (
                            <img
                              src={col.thumbnail}
                              alt={col.title}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #E6E2D8',
                                flexShrink: 0
                              }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 650, color: '#181817', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.title}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#706E6B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {col.subtitle}
                            </div>
                          </div>
                          <ChevronRight size={15} color="#8A8780" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GROUP 4: OCCASIONS */}
              {groupedResults.OCCASIONS.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#8A8780',
                      textTransform: 'uppercase',
                      marginBottom: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>OCCASIONS ({groupedResults.OCCASIONS.length})</span>
                    <span style={{ fontSize: '0.68rem', color: '#9B7A50', fontWeight: 600 }}>Milestone Gifting</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
                    {groupedResults.OCCASIONS.map((occ) => {
                      const isHighlighted = flatResultItems[selectedIndex]?.id === occ.id;
                      return (
                        <div
                          key={occ.id}
                          onClick={() => handleSelectItem(occ)}
                          className="search-item-hover"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.65rem 0.8rem',
                            backgroundColor: isHighlighted ? '#F5F3EE' : '#FFFFFF',
                            borderRadius: '8px',
                            border: isHighlighted ? '1px solid #9B7A50' : '1px solid #E6E2D8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              backgroundColor: '#F5F3EE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#9B7A50',
                              flexShrink: 0
                            }}
                          >
                            <Gift size={17} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 650, color: '#181817' }}>
                              {occ.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#706E6B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {occ.subtitle}
                            </div>
                          </div>
                          <ChevronRight size={15} color="#8A8780" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Bottom Keyboard Navigation Helper Bar */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: '#F5F3EE',
            borderTop: '1px solid #EDE8E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#706E6B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ background: '#FFFFFF', border: '1px solid #D9D5CC', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600, fontSize: '0.65rem' }}>↑↓</span>
              Navigate
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ background: '#FFFFFF', border: '1px solid #D9D5CC', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600, fontSize: '0.65rem' }}>↵</span>
              Select
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ background: '#FFFFFF', border: '1px solid #D9D5CC', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600, fontSize: '0.65rem' }}>esc</span>
              Close
            </span>
          </div>

          <div style={{ fontWeight: 500, color: '#8A8780' }}>
            AL-NOOR Studio Catalogue
          </div>
        </div>
      </div>
    </div>
  );
}
