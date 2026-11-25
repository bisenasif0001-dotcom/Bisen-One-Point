import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Frame,
  Heart,
  Home,
  Image,
  Layers,
  Moon,
  Pause,
  Play,
  Printer,
  RotateCw,
  Sparkles,
  Sun,
  Upload,
  ZoomIn,
} from 'lucide-react';
import FramedPosterPreview from './FramedPosterPreview';
import PrimaryShopActions from './PrimaryShopActions';
import { usePriceOverrides } from './BusinessRulesProvider';
import { HOME_PHOTO, homeFrame, homeDua } from '../data/homeStudio';
import { FRAME_FINISHES, SAMPLE_CUSTOM_PHOTOS } from '../data/products';
import { resolveAssetUrl } from '../utils/assetUrl';
import { getStudioPrice, readStudioPhoto } from '../utils/frameStudio';
import { getGalleryPrice } from '../utils/galleryWalls';
import {
  getDuaPosterPrice,
  getMinFramePrice,
  getMinPrintPrice,
  getPvcPrice,
} from '../utils/priceRegistry';
import './StudioHero.css';
import './StudioHeroCarousel.css';

const STUDIO_FRAME_IDS = FRAME_FINISHES.map(frame => frame.id);

const HERO_QUICK_SIZES = [
  { id: 'A5', label: 'A5', dims: '14.8 × 21 cm' },
  { id: 'A4', label: 'A4', dims: '21 × 29.7 cm' },
  { id: 'A3', label: 'A3', dims: '29.7 × 42 cm' },
  { id: 'A2', label: 'A2', dims: '42 × 59.4 cm' },
];

const CORNER_POSITIONS = {
  regal_aurelia: '78% 22%',
  regal_noir: '22% 20%',
  regal_heritage: '22% 22%',
  emberstone: '24% 24%',
  regal_onyx: '22% 22%',
  regal_windsor: '24% 24%',
  regal_blue: '22% 22%',
};

const WALL_MOODS = [
  { id: 'plaster', label: 'Warm plaster', dot: '#ede7d9' },
  { id: 'sage', label: 'Soft sage', dot: '#cfd9c2' },
  { id: 'charcoal', label: 'Midnight gallery', dot: '#202d27' },
];

const HERO_PORTRAIT_PHOTO = {
  title: 'A portrait worth framing forever',
  image: '/hero/wedding-couple.jpg',
  width: 434,
  height: 724,
};

const slides = [
  { id: 'studio', number: '01', label: 'Living studio', title: 'Custom Frame Studio', icon: Frame },
  { id: 'wedding', number: '02', label: 'Wedding salon', title: 'Royal Wedding Salon', icon: Heart },
  { id: 'printing', number: '03', label: 'Print atelier', title: '3D Print & PVC Atelier', icon: CreditCard },
];

const weddingPhotos = [
  {
    id: 'groom-accessories',
    title: 'The groom’s wedding accessories',
    label: 'His details',
    spec: 'A4 · Detail Study',
    note: 'Gilded heirlooms and the quiet moments before the baraat.',
    panY: 50,
  },
  {
    id: 'bride',
    title: 'An Indian bride in her red wedding lehenga',
    label: 'The bride',
    spec: 'A3 · Portrait',
    note: 'Deep crimson silk and antique gold, preserved in natural wood.',
    panY: 10,
  },
  {
    id: 'couple',
    title: 'An Indian bride and groom together on their wedding day',
    label: 'Together, always',
    spec: 'A2 · Centerpiece',
    note: 'The centrepiece portrait—framed to anchor your living room.',
    panY: 0,
  },
  {
    id: 'groom',
    title: 'An Indian groom in his ivory wedding sherwani',
    label: 'The groom',
    spec: 'A3 · Portrait',
    note: 'Ivory embroidery and quiet anticipation, crystal-clear in acrylic.',
    panY: 0,
  },
  {
    id: 'bride-accessories',
    title: 'The bride’s wedding jewellery and accessories',
    label: 'Her details',
    spec: 'A4 · Detail Study',
    note: 'Kundan, bangles and heirloom details kept close to the heart.',
    panY: 50,
  },
].map(photo => ({
  ...photo,
  image: `/hero/wedding-${photo.id}.jpg`,
  width: 434,
  height: 724,
}));

const WEDDING_TOUR_ORDER = [2, 1, 3];

const WEDDING_FRAME_OPTIONS = [
  { id: 'regal_aurelia', mood: 'Royal Ivory & Gold' },
  { id: 'regal_windsor', mood: 'Palatial Mahogany' },
  { id: 'emberstone', mood: 'Antique Bronze' },
  { id: 'regal_heritage', mood: 'Fluted Walnut & Gold' },
];

const STUDIO_FRAME_ART = {
  title: 'Sunlit architectural heritage arch fine art print',
  image: SAMPLE_CUSTOM_PHOTOS[2].url,
};

const PVC_CARD_PRESETS = [
  {
    id: 'vip',
    pill: 'VIP Club',
    theme: 'emerald',
    brand: 'BISEN ATELIER',
    badge: 'GOLD FOIL CLUB',
    headlineTop: 'Something',
    headlineEm: 'uniquely yours.',
    footLeft: '800μ UV MATTE',
    footRight: 'EDITION 001',
    backSub: 'VIP LOUNGE · MEMBERSHIP',
  },
  {
    id: 'corp',
    pill: 'Corporate ID',
    theme: 'slate',
    brand: 'AARAV MEHTA',
    badge: 'LEAD ARCHITECT',
    headlineTop: 'Identity,',
    headlineEm: 'crafted sharp.',
    footLeft: 'CR80 PRECISION',
    footRight: 'STAFF · 204',
    backSub: 'VERIFIED ACCESS · QR ID',
  },
  {
    id: 'nfc',
    pill: 'Business Card',
    theme: 'ivory',
    brand: 'STUDIO NOOR',
    badge: 'FOUNDER’S EDITION',
    headlineTop: 'One tap.',
    headlineEm: 'Lasting impression.',
    footLeft: 'QR + CONTACT',
    footRight: 'LUCKNOW',
    backSub: 'SCAN TO SAVE CONTACT',
  },
];

const SPOTLIGHT_ORDER = ['pvc', 'frame', 'poster'];

export default function StudioHero({ onHeroPhotoChange }) {
  const priceOverrides = usePriceOverrides();
  const [activeSlide, setActiveSlide] = useState(0);
  const [studioWallMood, setStudioWallMood] = useState('plaster');
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const root = useRef(null);
  const touchStart = useRef(null);
  const running = playing && !hovered && visible && inView && !reducedMotion;

  const minEmptyFramePrice = getMinFramePrice('A5', { includePrint: false, overrides: priceOverrides });
  const minWeddingWall = getGalleryPrice('family-wall', 'regal_aurelia', priceOverrides);
  const minWeddingWallPrice = (minWeddingWall?.base || 0) + (minWeddingWall?.finishUpgrade || 0);
  const minPrintPrice = getMinPrintPrice(priceOverrides);
  const pvcSinglePrice = getPvcPrice('single_card', priceOverrides);
  const pvcBulkPrice = Math.max(1, Math.round(pvcSinglePrice * 0.55));

  const slideHooks = {
    studio: `Live room & photo studio · From ₹${minEmptyFramePrice}`,
    wedding: `5-frame heirloom wall · ₹${minWeddingWallPrice.toLocaleString('en-IN')}`,
    printing: `Prints ₹${minPrintPrice} · Bulk PVC ₹${pvcBulkPrice}`,
  };

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotion = () => {
      setReducedMotion(motion.matches);
      if (motion.matches) setPlaying(false);
    };
    const handleVisibility = () => setVisible(!document.hidden);
    handleMotion();
    handleVisibility();
    motion.addEventListener('change', handleMotion);
    document.addEventListener('visibilitychange', handleVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(root.current);
    return () => {
      motion.removeEventListener('change', handleMotion);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setActiveSlide(index => (index + 1) % slides.length), 6800);
    return () => window.clearTimeout(timer);
  }, [activeSlide, running]);

  const pauseCarousel = () => setPlaying(false);

  const showSlide = index => {
    setPlaying(false);
    setActiveSlide((index + slides.length) % slides.length);
  };

  return (
    <section
      ref={root}
      className={`studio-hero-carousel studio-hero-carousel--${slides[activeSlide].id} ${activeSlide === 0 && studioWallMood === 'charcoal' ? 'studio-hero-carousel--dark-wall' : ''}`}
      data-running={running ? 'true' : 'false'}
      aria-roledescription="carousel"
      aria-label="Discover BISEN print and frame studio"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={event => { if (!event.target.closest('[data-slideshow-play]')) setPlaying(false); }}
      onKeyDown={event => {
        if (event.target.closest('input, textarea, select')) return;
        if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(activeSlide - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(activeSlide + 1); }
      }}
    >
      <div
        className="studio-hero-carousel__viewport"
        onPointerDown={event => {
          if (event.pointerType !== 'touch' || event.target.closest('a, button')) return;
          touchStart.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={event => {
          if (!touchStart.current) return;
          const dx = event.clientX - touchStart.current.x;
          const dy = event.clientY - touchStart.current.y;
          touchStart.current = null;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) showSlide(activeSlide + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => { touchStart.current = null; }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            id={`hero-slide-${slide.id}`}
            className={`studio-hero-carousel__slide ${activeSlide === index ? 'is-active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${slide.label}`}
            aria-hidden={activeSlide !== index}
            inert={activeSlide !== index}
          >
            {index === 0 ? (
              <LivePreviewSlide
                onInteract={pauseCarousel}
                onHeroPhotoChange={onHeroPhotoChange}
                priceOverrides={priceOverrides}
                wallMood={studioWallMood}
                onWallMoodChange={setStudioWallMood}
              />
            ) : index === 1 ? (
              <WeddingSlide
                isActive={activeSlide === 1}
                reducedMotion={reducedMotion}
                onInteract={pauseCarousel}
                priceOverrides={priceOverrides}
              />
            ) : (
              <PrintingSlide
                isActive={activeSlide === 2}
                reducedMotion={reducedMotion}
                onInteract={pauseCarousel}
                priceOverrides={priceOverrides}
              />
            )}
          </div>
        ))}

        <button
          type="button"
          className="studio-hero-carousel__edge-btn studio-hero-carousel__edge-btn--prev"
          aria-label="Previous hero story"
          onClick={() => showSlide(activeSlide - 1)}
        >
          <ChevronLeft size={19} />
        </button>
        <button
          type="button"
          className="studio-hero-carousel__edge-btn studio-hero-carousel__edge-btn--next"
          aria-label="Next hero story"
          onClick={() => showSlide(activeSlide + 1)}
        >
          <ChevronRight size={19} />
        </button>
      </div>

      <div className="studio-hero-carousel__navigation">
        <div className="studio-hero-carousel__nav-inner">
          <span className="studio-hero-carousel__index" aria-hidden="true">
            0{activeSlide + 1}<span> / 03</span>
          </span>

          <div className="studio-hero-carousel__selectors" role="group" aria-label="Choose a hero slide">
            {slides.map((slide, index) => {
              const SlideIcon = slide.icon;
              const selected = activeSlide === index;
              return (
                <button
                  key={slide.id}
                  type="button"
                  className={`studio-hero-carousel__story-card ${selected ? 'is-active' : ''}`}
                  aria-label={`Show slide ${index + 1}: ${slide.label}`}
                  aria-current={selected ? 'true' : undefined}
                  aria-controls={`hero-slide-${slide.id}`}
                  onClick={() => showSlide(index)}
                >
                  <span className="studio-hero-carousel__story-icon" aria-hidden="true">
                    <SlideIcon size={14} />
                  </span>
                  <span className="studio-hero-carousel__story-body">
                    <span className="studio-hero-carousel__story-top">
                      <span className="studio-hero-carousel__selector-num">{slide.number}</span>
                      <span className="studio-hero-carousel__selector-label">{slide.title}</span>
                    </span>
                    <span className="studio-hero-carousel__story-hook">{slideHooks[slide.id]}</span>
                  </span>
                  <span className="studio-hero-carousel__marker" aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <div className="studio-hero-carousel__arrows">
            <button
              type="button"
              data-slideshow-play
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              onClick={() => setPlaying(value => !value)}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span className="studio-hero-carousel__divider" />
            <button type="button" aria-label="Previous slide" onClick={() => showSlide(activeSlide - 1)}>
              <ChevronLeft size={18} />
            </button>
            <button type="button" aria-label="Next slide" onClick={() => showSlide(activeSlide + 1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <span className="studio-hero-carousel__sr-only" role="status" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
        Slide {activeSlide + 1} of {slides.length}: {slides[activeSlide].label}
      </span>
    </section>
  );
}

function WeddingSlide({ isActive, reducedMotion, onInteract, priceOverrides }) {
  const [weddingFrameId, setWeddingFrameId] = useState(WEDDING_FRAME_OPTIONS[0].id);
  const [salonMood, setSalonMood] = useState('royal');
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [pinnedIndex, setPinnedIndex] = useState(null);
  const [autoTourStep, setAutoTourStep] = useState(0);
  const [userTouchedGallery, setUserTouchedGallery] = useState(false);
  const [switching, setSwitching] = useState(false);
  const switchTimer = useRef(null);

  useEffect(() => () => clearTimeout(switchTimer.current), []);

  useEffect(() => {
    if (!isActive || reducedMotion || userTouchedGallery || focusedIndex !== null || pinnedIndex !== null) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setAutoTourStep(step => (step + 1) % WEDDING_TOUR_ORDER.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isActive, reducedMotion, userTouchedGallery, focusedIndex, pinnedIndex]);

  const frame = homeFrame(weddingFrameId);
  const selectedOption = WEDDING_FRAME_OPTIONS.find(opt => opt.id === weddingFrameId) || WEDDING_FRAME_OPTIONS[0];
  const wallPricing = getGalleryPrice('family-wall', weddingFrameId, priceOverrides);
  const wallTotal = (wallPricing?.base || 0) + (wallPricing?.finishUpgrade || 0);

  const autoFocusIndex = !reducedMotion && isActive && !userTouchedGallery
    ? WEDDING_TOUR_ORDER[autoTourStep]
    : null;
  const activeFocus = pinnedIndex !== null
    ? pinnedIndex
    : focusedIndex !== null
      ? focusedIndex
      : autoFocusIndex;

  const handleFinishChange = (id) => {
    if (id === weddingFrameId) return;
    onInteract?.();
    clearTimeout(switchTimer.current);
    setSwitching(true);
    setWeddingFrameId(id);
    switchTimer.current = setTimeout(() => setSwitching(false), 360);
  };

  const togglePin = (index) => {
    onInteract?.();
    setUserTouchedGallery(true);
    setPinnedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className={`wedding-hero wedding-hero--${salonMood}`}>
      <div className="wedding-hero__arch" aria-hidden="true" />
      <div className="wedding-hero__spotlight" aria-hidden="true" />

      <div className="wedding-hero__intro hero-reveal-copy">
        <div className="wedding-hero__top-bar">
          <span className="hero-story-kicker"><Heart size={12} /> THE WEDDING COLLECTION</span>
          <div className="wedding-hero__mood-toggle" role="group" aria-label="Choose salon backdrop mood">
            <button
              type="button"
              aria-pressed={salonMood === 'palace'}
              className={salonMood === 'palace' ? 'is-active' : ''}
              onClick={() => {
                onInteract?.();
                setSalonMood('palace');
              }}
            >
              <Sun size={11} /> Palace Ivory
            </button>
            <button
              type="button"
              aria-pressed={salonMood === 'royal'}
              className={salonMood === 'royal' ? 'is-active' : ''}
              onClick={() => {
                onInteract?.();
                setSalonMood('royal');
              }}
            >
              <Moon size={11} /> Royal Emerald
            </button>
          </div>
        </div>

        <h2>One beautiful day.<em> A lifetime together.</em></h2>
        <p className={activeFocus !== null ? 'is-focused-note' : ''}>
          {activeFocus !== null
            ? `${weddingPhotos[activeFocus].spec} — ${weddingPhotos[activeFocus].note}`
            : 'The two of you. The little details. A wedding story, framed forever.'}
        </p>
      </div>

      <div
        className={`wedding-hero__gallery hero-reveal-stage ${switching ? 'is-switching' : ''}`}
        role="group"
        aria-label="Five-frame Indian wedding gallery"
        data-has-focus={activeFocus !== null ? 'true' : 'false'}
        onMouseEnter={() => setUserTouchedGallery(true)}
        onMouseLeave={() => setFocusedIndex(null)}
      >
        {weddingPhotos.map((photo, index) => {
          const roleClass = index === 2 ? 'couple' : index === 0 || index === 4 ? 'detail' : 'portrait';
          const isFocused = activeFocus === index;
          return (
            <figure
              key={photo.id}
              className={`wedding-hero__frame wedding-hero__frame--${roleClass} ${isFocused ? 'is-focused' : ''}`}
              tabIndex={0}
              role="button"
              aria-pressed={pinnedIndex === index}
              aria-label={`${photo.label} — ${photo.spec}. Click to spotlight.`}
              onMouseEnter={() => {
                setUserTouchedGallery(true);
                setFocusedIndex(index);
              }}
              onFocus={() => {
                setUserTouchedGallery(true);
                setFocusedIndex(index);
              }}
              onBlur={() => setFocusedIndex(null)}
              onClick={() => togglePin(index)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  togglePin(index);
                }
              }}
            >
              <span className="wedding-hero__wire" aria-hidden="true" />
              <FramedPosterPreview poster={photo} frame={frame} fit="cover" panY={photo.panY} />
              <figcaption>
                <span>{photo.label}</span>
                <small>{photo.spec}</small>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div className="wedding-hero__footer">
        <div className="wedding-hero__finish-switcher" role="group" aria-label="Switch wedding gallery frame finish">
          <div className="wedding-hero__finish-swatches">
            {WEDDING_FRAME_OPTIONS.map(option => {
              const optFrame = homeFrame(option.id);
              const selected = option.id === weddingFrameId;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-label={`Re-frame wedding gallery in ${optFrame.name}`}
                  aria-pressed={selected}
                  className={`wedding-hero__finish-btn ${selected ? 'is-selected' : ''}`}
                  onClick={() => handleFinishChange(option.id)}
                  title={`${optFrame.name} — ${option.mood}`}
                >
                  <span
                    className="hero-moulding-swatch"
                    style={{
                      backgroundColor: optFrame.colorHex,
                      backgroundImage: `url(${resolveAssetUrl(optFrame.frontImage)})`,
                    }}
                  />
                  {selected && <Check size={10} />}
                </button>
              );
            })}
          </div>
          <span className="wedding-hero__finish-label" aria-live="polite">
            {frame.name} · <strong>₹{wallTotal.toLocaleString('en-IN')}</strong>
            <small>5-frame set · {selectedOption.mood}</small>
          </span>
        </div>

        <Link to={`/gallery-walls?layout=family-wall&frame=${weddingFrameId}`} className="studio-hero__btn-primary">
          Build 5-frame wall · ₹{wallTotal.toLocaleString('en-IN')} <ArrowUpRight size={16} />
        </Link>
        <Link
          to="/custom-framing"
          state={{ frameId: frame.id, size: 'A3', fromCatalogue: true, triggerUpload: true }}
          className="studio-hero__btn-text"
        >
          Frame 1 wedding photo <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

function PrintingSlide({ isActive, reducedMotion, onInteract, priceOverrides }) {
  const frame = homeFrame('regal_aurelia');
  const [spotlight, setSpotlight] = useState('pvc');
  const [lockedByUser, setLockedByUser] = useState(false);
  const [pvcPresetId, setPvcPresetId] = useState(PVC_CARD_PRESETS[0].id);
  const [pvcFlipped, setPvcFlipped] = useState(false);
  const [sheen, setSheen] = useState({ x: 50, y: 50, active: false });

  const pvcSinglePrice = getPvcPrice('single_card', priceOverrides);
  const pvcBulkPrice = Math.max(1, Math.round(pvcSinglePrice * 0.55));
  const minFrameOnlyPrice = getMinFramePrice('A5', { includePrint: false, overrides: priceOverrides });
  const minPrintPrice = getMinPrintPrice(priceOverrides);
  const minDuaPosterPrice = getDuaPosterPrice('A5', priceOverrides) ?? 49;

  const printObjects = {
    pvc: {
      id: 'pvc',
      label: 'PVC printing',
      priceBadge: `₹${pvcBulkPrice}+ bulk`,
      code: '01 / PVC CARD ATELIER',
      spec: `CR80 precision PVC · ₹${pvcSinglePrice} single · ₹${pvcBulkPrice}/card at 100+`,
      ctaLabel: 'Design PVC cards',
      to: '/pvc-cards',
    },
    frame: {
      id: 'frame',
      label: 'Frame design',
      priceBadge: `From ₹${minFrameOnlyPrice}`,
      code: '02 / BESPOKE FRAMING',
      spec: `Hand-mitred solid wood & gold fillets · Empty frames from ₹${minFrameOnlyPrice}`,
      ctaLabel: 'Open frame studio',
      to: '/custom-framing',
    },
    poster: {
      id: 'poster',
      label: 'Posters & prints',
      priceBadge: `From ₹${minPrintPrice}`,
      code: '03 / PHOTO & POSTER LAB',
      spec: `Photo prints from ₹${minPrintPrice} · 250 GSM Dua & wall posters from ₹${minDuaPosterPrice}`,
      ctaLabel: 'Order prints & posters',
      to: '/printing-services?service=Photo%20posters',
    },
  };

  useEffect(() => {
    if (!isActive || reducedMotion || lockedByUser || pvcFlipped) return undefined;
    const timer = window.setInterval(() => {
      setSpotlight(current => {
        const idx = SPOTLIGHT_ORDER.indexOf(current);
        return SPOTLIGHT_ORDER[(idx + 1) % SPOTLIGHT_ORDER.length];
      });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [isActive, reducedMotion, lockedByUser, pvcFlipped]);

  const activeObj = printObjects[spotlight];
  const pvcPreset = PVC_CARD_PRESETS.find(item => item.id === pvcPresetId) || PVC_CARD_PRESETS[0];

  const selectObject = (key, lockCarousel = false) => {
    setSpotlight(key);
    if (lockCarousel) {
      setLockedByUser(true);
      onInteract?.();
    }
  };

  const handlePvcPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    setSheen({ x, y, active: true });
  };

  return (
    <div className="print-design-hero">
      <span className="print-design-hero__crop print-design-hero__crop--tl" aria-hidden="true" />
      <span className="print-design-hero__crop print-design-hero__crop--tr" aria-hidden="true" />
      <span className="print-design-hero__crop print-design-hero__crop--bl" aria-hidden="true" />
      <span className="print-design-hero__crop print-design-hero__crop--br" aria-hidden="true" />

      <div className="hero-scene__layout">
        <div className="print-design-hero__copy hero-reveal-copy">
          <span className="hero-story-kicker"><Printer size={13} /> THE PRINT & DESIGN ATELIER</span>
          <h2>Your ideas.<br /><em>Made tangible.</em></h2>
          <p>
            Crisp UV-laminated PVC cards, archival posters, studio photo prints and handcrafted frames — designed and finished under one roof.
          </p>

          <div className="print-design-hero__services" role="group" aria-label="Spotlight a studio print piece">
            <button
              type="button"
              aria-pressed={spotlight === 'pvc'}
              className={spotlight === 'pvc' ? 'is-active' : ''}
              onMouseEnter={() => { setLockedByUser(true); selectObject('pvc'); }}
              onClick={() => selectObject('pvc', true)}
            >
              <CreditCard size={14} />
              <span>PVC cards</span>
              <em>{printObjects.pvc.priceBadge}</em>
            </button>
            <button
              type="button"
              aria-pressed={spotlight === 'frame'}
              className={spotlight === 'frame' ? 'is-active' : ''}
              onMouseEnter={() => { setLockedByUser(true); selectObject('frame'); }}
              onClick={() => selectObject('frame', true)}
            >
              <Frame size={14} />
              <span>Frames</span>
              <em>{printObjects.frame.priceBadge}</em>
            </button>
            <button
              type="button"
              aria-pressed={spotlight === 'poster'}
              className={spotlight === 'poster' ? 'is-active' : ''}
              onMouseEnter={() => { setLockedByUser(true); selectObject('poster'); }}
              onClick={() => selectObject('poster', true)}
            >
              <Layers size={14} />
              <span>Prints & posters</span>
              <em>{printObjects.poster.priceBadge}</em>
            </button>
          </div>

          <div className="studio-hero__actions">
            <Link to="/printing-services" className="studio-hero__btn-primary">
              Explore printing services <ArrowUpRight size={16} />
            </Link>
            <Link to="/pvc-cards" className="studio-hero__btn-text">
              Custom PVC cards <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="print-design-hero__visual hero-reveal-stage" role="group" aria-label="Interactive PVC card, custom poster and gallery frame desk">
          <div className="print-design-hero__stage-head">
            <div className="print-design-hero__presets" role="group" aria-label="Switch live PVC card style">
              <span className="print-design-hero__visual-kicker">CARD EDITION:</span>
              {PVC_CARD_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={pvcPresetId === preset.id}
                  className={`print-design-hero__preset-pill ${pvcPresetId === preset.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setPvcPresetId(preset.id);
                    setPvcFlipped(false);
                    selectObject('pvc', true);
                  }}
                >
                  {preset.pill}
                </button>
              ))}
            </div>
            <span className="print-design-hero__calibration" aria-hidden="true">
              <i /><i /><i /><i />
            </span>
          </div>

          <div className="print-design-hero__products" data-spotlight={spotlight}>
            <div
              role="button"
              tabIndex={0}
              className={`print-design-hero__poster ${spotlight === 'poster' ? 'is-spotlight' : ''}`}
              aria-label="Spotlight 250 GSM archival matte poster sample"
              aria-pressed={spotlight === 'poster'}
              onClick={() => selectObject('poster', true)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectObject('poster', true);
                }
              }}
            >
              <span>BISEN / PRINT ATELIER</span>
              <span className="print-design-hero__poster-orbit" aria-hidden="true" />
              <strong>Make<br /><em>it yours.</em></strong>
              <small>250 GSM · ARCHIVAL MATTE · ₹{minDuaPosterPrice}+</small>
            </div>

            <div
              role="button"
              tabIndex={0}
              className={`print-design-hero__frame-preview ${spotlight === 'frame' ? 'is-spotlight' : ''}`}
              aria-label="Spotlight Regal Aurelia framed architectural print"
              aria-pressed={spotlight === 'frame'}
              onClick={() => selectObject('frame', true)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectObject('frame', true);
                }
              }}
            >
              <FramedPosterPreview poster={STUDIO_FRAME_ART} frame={frame} fit="cover" panY={35} />
            </div>

            <div
              role="button"
              tabIndex={0}
              className={`print-design-hero__pvc-scene ${spotlight === 'pvc' ? 'is-spotlight' : ''}`}
              aria-label="Spotlight metallic foil PVC card sample"
              aria-pressed={spotlight === 'pvc'}
              style={{ '--mx': `${sheen.x}%`, '--my': `${sheen.y}%` }}
              onPointerMove={handlePvcPointerMove}
              onPointerLeave={() => setSheen(prev => ({ ...prev, active: false }))}
              onClick={() => selectObject('pvc', true)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectObject('pvc', true);
                }
              }}
            >
              <div className={`print-design-hero__pvc-inner ${pvcFlipped ? 'is-flipped' : ''}`}>
                <div className={`print-design-hero__pvc-face print-design-hero__pvc-face--front print-design-hero__pvc-face--${pvcPreset.theme}`}>
                  <span className="print-design-hero__pvc-holo" aria-hidden="true" />
                  <span className={`print-design-hero__pvc-sheen ${sheen.active ? 'is-active' : ''}`} aria-hidden="true" />
                  <div className="print-design-hero__pvc-top">
                    <span>{pvcPreset.brand}</span>
                    <small>{pvcPreset.badge}</small>
                  </div>
                  <div className="print-design-hero__pvc-chip-row" aria-hidden="true">
                    <span className="print-design-hero__pvc-chip" />
                    <Sparkles size={22} strokeWidth={1.15} />
                  </div>
                  <strong>{pvcPreset.headlineTop}<br /><em>{pvcPreset.headlineEm}</em></strong>
                  <div className="print-design-hero__pvc-bottom">
                    <span>{pvcPreset.footLeft}</span>
                    <span>{pvcPreset.footRight}</span>
                  </div>
                </div>

                <div className="print-design-hero__pvc-face print-design-hero__pvc-face--back">
                  <span className="print-design-hero__pvc-magstripe" aria-hidden="true" />
                  <div className="print-design-hero__pvc-back-body">
                    <div className="print-design-hero__pvc-back-meta">
                      <span className="print-design-hero__pvc-sign" aria-hidden="true" />
                      <small>{pvcPreset.brand} · LUCKNOW</small>
                      <p>{pvcPreset.backSub}</p>
                    </div>
                    <svg className="print-design-hero__pvc-qr" viewBox="0 0 44 44" aria-hidden="true">
                      <rect x="2" y="2" width="13" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
                      <rect x="6" y="6" width="5" height="5" fill="currentColor" />
                      <rect x="29" y="2" width="13" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
                      <rect x="33" y="6" width="5" height="5" fill="currentColor" />
                      <rect x="2" y="29" width="13" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
                      <rect x="6" y="33" width="5" height="5" fill="currentColor" />
                      <rect x="20" y="6" width="4" height="4" fill="currentColor" />
                      <rect x="20" y="15" width="4" height="4" fill="currentColor" />
                      <rect x="6" y="20" width="5" height="4" fill="currentColor" />
                      <rect x="16" y="22" width="6" height="6" fill="currentColor" />
                      <rect x="28" y="20" width="4" height="5" fill="currentColor" />
                      <rect x="37" y="20" width="5" height="4" fill="currentColor" />
                      <rect x="20" y="32" width="6" height="4" fill="currentColor" />
                      <rect x="30" y="29" width="5" height="5" fill="currentColor" />
                      <rect x="37" y="36" width="5" height="6" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="print-design-hero__desk-footer">
            <div className="print-design-hero__desk-info" aria-live="polite">
              <span className="print-design-hero__desk-code">{activeObj.code}</span>
              <span className="print-design-hero__desk-spec">{activeObj.spec}</span>
            </div>
            <div className="print-design-hero__desk-actions">
              <button
                type="button"
                className="print-design-hero__flip-btn"
                aria-pressed={pvcFlipped}
                onClick={() => {
                  selectObject('pvc', true);
                  setPvcFlipped(prev => !prev);
                }}
              >
                <RotateCw size={13} />
                <span>{pvcFlipped ? 'Show front' : 'Flip 3D card'}</span>
              </button>
              <Link to={activeObj.to} className="print-design-hero__desk-link">
                <span>{activeObj.ctaLabel}</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LivePreviewSlide({ onInteract, onHeroPhotoChange, priceOverrides, wallMood = 'plaster', onWallMoodChange }) {
  const [collection, setCollection] = useState('photo');
  const [customPhoto, setCustomPhoto] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [frameId, setFrameId] = useState(STUDIO_FRAME_IDS[0]);
  const [selectedSizeId, setSelectedSizeId] = useState('A3');
  const [showSofa, setShowSofa] = useState(true);
  const [draggingOver, setDraggingOver] = useState(false);
  const [entered, setEntered] = useState(false);
  const [frameSwitch, setFrameSwitch] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const frameSwitchTimer = useRef(null);
  const fileInputRef = useRef(null);

  const frame = homeFrame(frameId);
  const dua = homeDua('ayat-al-kursi');
  const isCustom = collection === 'custom' && Boolean(customPhoto);
  const isPhotoMode = collection === 'photo';
  const isPortraitMode = collection === 'portrait';

  const activePoster = collection === 'dua'
    ? dua
    : isPortraitMode
      ? HERO_PORTRAIT_PHOTO
      : isCustom
        ? {
            title: customPhoto.name || 'Your uploaded photo',
            image: customPhoto.url,
            width: customPhoto.width,
            height: customPhoto.height,
          }
        : HOME_PHOTO;

  const activeOrientation = collection === 'dua' || isPortraitMode
    ? 'portrait'
    : isCustom
      ? (customPhoto.width >= customPhoto.height ? 'landscape' : 'portrait')
      : 'landscape';

  const getQuickSizePrice = (sizeId) => {
    const priced = getStudioPrice({
      sizeId,
      frameId,
      glassId: 'crystal_acrylic',
      includePrint: true,
      overrides: priceOverrides,
    });
    return priced?.unit || 0;
  };

  const activeFramedPrice = getQuickSizePrice(selectedSizeId);
  const selectedSizeMeta = HERO_QUICK_SIZES.find(s => s.id === selectedSizeId) || HERO_QUICK_SIZES[1];
  const minEmptyFramePrice = getMinFramePrice('A5', { includePrint: false, overrides: priceOverrides });

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => {
      clearTimeout(t);
      clearTimeout(frameSwitchTimer.current);
    };
  }, []);

  const triggerSwitch = () => {
    clearTimeout(frameSwitchTimer.current);
    setFrameSwitch(true);
    frameSwitchTimer.current = setTimeout(() => setFrameSwitch(false), 380);
  };

  const handleFrameChange = (id) => {
    onInteract?.();
    setFrameId(id);
    triggerSwitch();
  };

  const handleCollectionSelect = (nextCollection) => {
    onInteract?.();
    setUploadError('');
    setCollection(nextCollection);
    triggerSwitch();
  };

  const handleYourPhotoClick = () => {
    onInteract?.();
    if (!customPhoto || collection === 'custom') {
      fileInputRef.current?.click();
      return;
    }
    setUploadError('');
    setCollection('custom');
    triggerSwitch();
  };

  const loadSelectedFile = async (file) => {
    if (!file) return;
    try {
      const loaded = await readStudioPhoto(file);
      setCustomPhoto(loaded);
      setCollection('custom');
      setUploadError('');
      onHeroPhotoChange?.(loaded);
      onInteract?.();
      triggerSwitch();
    } catch (error) {
      setUploadError(error.message || 'Please choose a JPG, PNG or WebP image.');
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    await loadSelectedFile(file);
  };

  const handleStageDrop = async (event) => {
    event.preventDefault();
    setDraggingOver(false);
    const file = event.dataTransfer?.files?.[0];
    await loadSelectedFile(file);
  };

  const handleStagePointerMove = (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const rx = (event.clientX - rect.left) / rect.width - 0.5;
    const ry = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Number((rx * 6.4).toFixed(2)),
      y: Number((-ry * 6.4).toFixed(2)),
    });
  };

  return (
    <div className={`studio-hero studio-hero--${wallMood} ${showSofa ? 'has-living-scene' : ''} ${entered ? 'is-entered' : ''}`}>
      <span className="studio-hero__wall-sunlight" aria-hidden="true" />

      <div className="hero-scene__layout">
        <div className="studio-hero__copy hero-reveal-copy">
          <span className="studio-hero__kicker hero-anim hero-anim--1">
            <span className="studio-hero__kicker-dot" />
            <span className="studio-hero__kicker-line" />
            YOUR EVERYDAY PRINT & FRAME STUDIO
          </span>

          <h1 className="studio-hero__headline">
            <span className="hero-anim hero-anim--2">Your moments.</span>
            <br />
            <em className="hero-anim hero-anim--3">Beautifully made.</em>
          </h1>

          <p className="studio-hero__subtext hero-anim hero-anim--4">
            Preview your favourite photo on a sunlit gallery wall, switch solid-wood &amp; gold mouldings live, and order ready to hang.
          </p>

          <div className="studio-hero__price-strip hero-anim hero-anim--4">
            <span><strong>Frames</strong> from ₹{minEmptyFramePrice}</span>
            <i aria-hidden="true" />
            <span><strong>Framed + Print</strong> from ₹{getQuickSizePrice('A5')}</span>
            <i aria-hidden="true" />
            <span><strong>Free Pickup</strong> in Lucknow</span>
          </div>

          <PrimaryShopActions variant="hero" className="studio-hero__actions hero-anim hero-anim--5" />

          <div className="studio-hero__reassurance hero-anim hero-anim--6">
            <span><Check size={13} /> 7 real wood &amp; gold finishes</span>
            <span><Check size={13} /> Drop your photo on the wall</span>
            <a className="studio-hero__explore-link" href="#shop-creations">
              Explore the studio <ArrowRight size={13} />
            </a>
          </div>
        </div>

        <div className="studio-hero__studio hero-reveal-stage">
          <div className="studio-hero__studio-bar">
            <div className="studio-hero__toggle" role="group" aria-label="Choose a preview collection">
              <button
                type="button"
                aria-pressed={isPhotoMode}
                className={isPhotoMode ? 'active' : ''}
                onClick={() => handleCollectionSelect('photo')}
              >
                <Image size={12} /> Sunset
              </button>
              <button
                type="button"
                aria-pressed={isPortraitMode}
                className={isPortraitMode ? 'active' : ''}
                onClick={() => handleCollectionSelect('portrait')}
              >
                <Heart size={12} /> Portrait
              </button>
              <button
                type="button"
                aria-pressed={collection === 'dua'}
                className={collection === 'dua' ? 'active' : ''}
                onClick={() => handleCollectionSelect('dua')}
              >
                <Sparkles size={12} /> Dua art
              </button>
              <button
                type="button"
                aria-pressed={isCustom}
                className={`studio-hero__upload-toggle ${isCustom ? 'active' : ''}`}
                onClick={handleYourPhotoClick}
              >
                <Upload size={12} /> {isCustom ? 'Change photo' : 'Your photo'}
              </button>
            </div>

            <div className="studio-hero__wall-picker" role="group" aria-label="Choose living room wall tone">
              <button
                type="button"
                aria-pressed={showSofa}
                className={`studio-hero__room-pill ${showSofa ? 'is-selected' : ''}`}
                onClick={() => {
                  onInteract?.();
                  setShowSofa(prev => !prev);
                }}
                title="Toggle architectural room elevation"
              >
                <Home size={11} /> Room
              </button>
              {WALL_MOODS.map(mood => (
                <button
                  key={mood.id}
                  type="button"
                  aria-label={`Wall tone: ${mood.label}`}
                  aria-pressed={wallMood === mood.id}
                  className={`studio-hero__wall-dot ${wallMood === mood.id ? 'is-selected' : ''}`}
                  title={mood.label}
                  onClick={() => {
                    onInteract?.();
                    onWallMoodChange?.(mood.id);
                  }}
                >
                  <span style={{ backgroundColor: mood.dot }} />
                </button>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="studio-hero-carousel__sr-only"
              aria-label="Upload your own photo for live frame preview"
              onChange={handleFileChange}
            />
          </div>

          <div
            className={`studio-hero__stage studio-hero__stage--${wallMood} ${showSofa ? 'studio-hero__stage--room' : 'studio-hero__stage--closeup'} studio-hero__stage--size-${selectedSizeId.toLowerCase()} ${activeOrientation === 'landscape' ? 'is-photo' : 'is-dua'} ${draggingOver ? 'is-dragging' : ''}`}
            onPointerMove={handleStagePointerMove}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
            onDragOver={event => {
              event.preventDefault();
              if (!draggingOver) setDraggingOver(true);
            }}
            onDragLeave={() => setDraggingOver(false)}
            onDrop={handleStageDrop}
          >
            <span className="studio-hero__art-spotlight" aria-hidden="true" />

            <div className="studio-hero__wall-anchor">
              <div
                className={`studio-hero__frame-wrap ${frameSwitch ? 'is-switching' : ''}`}
                key={`${collection}-${frameId}-${customPhoto?.id || 'default'}`}
                style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` }}
              >
                <FramedPosterPreview
                  poster={activePoster}
                  frame={frame}
                  orientation={activeOrientation}
                  fit={collection === 'dua' ? 'contain' : 'cover'}
                  panY={isPortraitMode ? 5 : 50}
                />
                <span className="studio-hero__glaze-sheen" aria-hidden="true" />
              </div>
            </div>

            {showSofa && (
              <div className="studio-hero__sofa-scene" aria-hidden="true">
                <span className="studio-hero__lamp-glow" />
                <svg
                  className="studio-hero__arch-svg"
                  viewBox="0 0 640 156"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Minimal Architectural Floor Plinth Line + Subtle End Ticks */}
                  <line x1="18" y1="144" x2="622" y2="144" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" />
                  <line x1="18" y1="141" x2="18" y2="147" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.45" />
                  <line x1="622" y1="141" x2="622" y2="147" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.45" />
                  <text
                    x="320"
                    y="154"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity="0.42"
                    fontSize="7.2"
                    fontWeight="600"
                    letterSpacing="2.2"
                  >
                    200 CM STUDIO ELEVATION
                  </text>

                  {/* Left Minimal Side Plinth + Ceramic Vessel + Delicate Olive Stems */}
                  <rect x="48" y="98" width="64" height="46" rx="2" fill="currentColor" fillOpacity="0.045" stroke="currentColor" strokeWidth="1.05" strokeOpacity="0.72" />
                  <line x1="48" y1="111" x2="112" y2="111" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.32" />
                  <path d="M68 98 L70 76 C70 73 90 73 90 76 L92 98 Z" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1.05" strokeOpacity="0.78" />
                  <path d="M80 74 C80 54 75 40 69 24 M78 58 C68 50 58 46 50 43 M79 48 C90 40 99 35 106 28 M75 40 C66 33 61 28 57 22 M80 62 C91 56 97 53 104 49" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" strokeOpacity="0.68" />
                  <ellipse cx="69" cy="21" rx="3.2" ry="1.8" transform="rotate(-35 69 21)" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.65" />
                  <ellipse cx="50" cy="42" rx="3.5" ry="1.8" transform="rotate(-12 50 42)" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.65" />
                  <ellipse cx="107" cy="27" rx="3.5" ry="1.8" transform="rotate(-24 107 27)" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.65" />
                  <ellipse cx="104" cy="49" rx="3.2" ry="1.7" transform="rotate(-15 104 49)" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.65" />

                  {/* Center Minimalist Low-Profile 3-Seater Sofa Silhouette (200 cm scale) */}
                  <rect x="164" y="75" width="312" height="40" rx="5" fill="currentColor" fillOpacity="0.045" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.8" />
                  <line x1="268" y1="76" x2="268" y2="112" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.34" />
                  <line x1="372" y1="76" x2="372" y2="112" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.34" />
                  {/* Subtle Angled Corner Throw Cushions */}
                  <rect x="171" y="81" width="34" height="29" rx="4" transform="rotate(-7 188 95)" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.58" />
                  <rect x="435" y="81" width="34" height="29" rx="4" transform="rotate(7 452 95)" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.58" />
                  {/* Left & Right Sofa Armrests + Seat Cushions + Rail + Tapered Legs */}
                  <rect x="146" y="88" width="18" height="44" rx="4" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1.15" strokeOpacity="0.88" />
                  <rect x="476" y="88" width="18" height="44" rx="4" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1.15" strokeOpacity="0.88" />
                  <rect x="164" y="109" width="104" height="17" rx="3" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1.05" strokeOpacity="0.8" />
                  <rect x="268" y="109" width="104" height="17" rx="3" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1.05" strokeOpacity="0.8" />
                  <rect x="372" y="109" width="104" height="17" rx="3" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1.05" strokeOpacity="0.8" />
                  <rect x="164" y="126" width="312" height="6" rx="1" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" strokeOpacity="0.72" />
                  <line x1="156" y1="132" x2="153" y2="144" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeOpacity="0.85" />
                  <line x1="484" y1="132" x2="487" y2="144" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeOpacity="0.85" />

                  {/* Right Architectural Slim Gallery Floor Lamp pointing toward Frame */}
                  <ellipse cx="566" cy="143" rx="18" ry="2.2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" strokeOpacity="0.72" />
                  <path d="M566 143 L566 36 C566 30 562 28 556 28 L544 28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.84" />
                  <rect x="530" y="22" width="15" height="9" rx="2" transform="rotate(-24 538 26)" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.15" strokeOpacity="0.88" />
                </svg>
              </div>
            )}

            {draggingOver && (
              <div className="studio-hero__drop-banner" aria-live="polite">
                <Upload size={16} /> Drop your photo to frame it live
              </div>
            )}
          </div>

          <div className="studio-hero__controls">
            <div className="studio-hero__dock-top">
              <div className="studio-hero__size-pills" role="group" aria-label="Preview frame size and live price">
                {HERO_QUICK_SIZES.map(size => {
                  const active = selectedSizeId === size.id;
                  const price = getQuickSizePrice(size.id);
                  return (
                    <button
                      key={size.id}
                      type="button"
                      aria-pressed={active}
                      className={`studio-hero__size-pill ${active ? 'is-active' : ''}`}
                      onClick={() => {
                        onInteract?.();
                        setSelectedSizeId(size.id);
                      }}
                    >
                      <strong>{size.label}</strong>
                      <span>₹{price}</span>
                    </button>
                  );
                })}
              </div>

              {uploadError ? (
                <span className="studio-hero__dock-status studio-hero__dock-status--error" role="alert">
                  {uploadError}
                </span>
              ) : (
                <span className="studio-hero__dock-status">
                  {isCustom
                    ? `Your photo · ${selectedSizeId} (${selectedSizeMeta.dims})`
                    : collection === 'dua'
                      ? `Dua Art · ${selectedSizeId} (${selectedSizeMeta.dims})`
                      : `${selectedSizeMeta.dims} · ${frame.mouldingWidth?.split(' ')[0] || '28'}mm mitre`}
                </span>
              )}
            </div>

            <div className="studio-hero__dock-bottom">
              <div className="studio-hero__controls-left">
                <div className="studio-hero__swatches">
                  {STUDIO_FRAME_IDS.map((id) => {
                    const option = homeFrame(id);
                    const selected = id === frameId;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-label={`Preview ${option.name}`}
                        aria-pressed={selected}
                        className={`studio-hero__swatch ${selected ? 'is-selected' : ''}`}
                        onClick={() => handleFrameChange(id)}
                        title={`${option.name} — ${option.finish}`}
                      >
                        <span
                          className="hero-moulding-swatch"
                          style={{
                            backgroundColor: option.colorHex,
                            backgroundImage: `url(${resolveAssetUrl(option.frontImage)})`,
                          }}
                        />
                        {selected && <Check size={10} />}
                      </button>
                    );
                  })}

                  <div className="studio-hero__craft-chip" title={`45° mitre corner detail — ${frame.name}`}>
                    <span className="studio-hero__craft-lens">
                      <img
                        src={resolveAssetUrl(frame.cornerImage)}
                        alt=""
                        loading="lazy"
                        style={{ objectPosition: CORNER_POSITIONS[frame.id] || '24% 24%' }}
                      />
                    </span>
                    <span className="studio-hero__swatch-name" aria-live="polite">
                      {frame.name}
                      <small><ZoomIn size={9} /> {frame.finish}</small>
                    </span>
                  </div>
                </div>
              </div>

              <Link
                className="studio-hero__make-btn"
                to={
                  collection === 'dua'
                    ? `/dua-posters/${dua.id}?format=framed&frame=${frameId}`
                    : '/custom-framing'
                }
                state={
                  collection === 'dua'
                    ? undefined
                    : isCustom
                      ? { frameId, size: selectedSizeId, orientation: activeOrientation, hasGuidePhoto: true, triggerUpload: false, fromCatalogue: true }
                      : { frameId, size: selectedSizeId, orientation: activeOrientation, triggerUpload: true, fromCatalogue: true }
                }
              >
                <span>
                  {collection === 'dua'
                    ? `Frame Dua · ₹${activeFramedPrice}`
                    : `Frame ${selectedSizeId} · ₹${activeFramedPrice}`}
                </span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
