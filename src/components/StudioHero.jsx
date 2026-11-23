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
  Image,
  Layers,
  Pause,
  Play,
  Printer,
  RotateCw,
  Sparkles,
  Upload,
  ZoomIn,
} from 'lucide-react';
import FramedPosterPreview from './FramedPosterPreview';
import PrimaryShopActions from './PrimaryShopActions';
import { HOME_PHOTO, homeFrame, homeDua } from '../data/homeStudio';
import { SAMPLE_CUSTOM_PHOTOS } from '../data/products';
import { resolveAssetUrl } from '../utils/assetUrl';
import { readStudioPhoto } from '../utils/frameStudio';
import './StudioHero.css';
import './StudioHeroCarousel.css';

const STUDIO_FRAME_IDS = [
  'regal_aurelia',
  'regal_noir',
  'regal_heritage',
  'emberstone',
  'regal_windsor',
];

const CORNER_POSITIONS = {
  regal_aurelia: '78% 22%',
  regal_noir: '22% 20%',
  regal_heritage: '22% 22%',
  emberstone: '24% 24%',
  regal_windsor: '24% 24%',
};

const WALL_MOODS = [
  { id: 'plaster', label: 'Warm plaster', dot: '#ede7d9' },
  { id: 'sage', label: 'Soft sage', dot: '#d5decb' },
  { id: 'charcoal', label: 'Gallery slate', dot: '#28342e' },
];

const slides = [
  { id: 'studio', number: '01', label: 'Living studio' },
  { id: 'wedding', number: '02', label: 'Wedding salon' },
  { id: 'printing', number: '03', label: 'Print atelier' },
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

const WEDDING_FRAME_OPTIONS = [
  { id: 'regal_aurelia', mood: 'Royal Ivory & Gold' },
  { id: 'regal_windsor', mood: 'Palatial Mahogany' },
  { id: 'emberstone', mood: 'Antique Bronze' },
];

const STUDIO_FRAME_ART = {
  title: 'Sunlit architectural heritage arch fine art print',
  image: SAMPLE_CUSTOM_PHOTOS[2].url,
};

const PRINT_OBJECTS = {
  pvc: {
    id: 'pvc',
    label: 'PVC printing',
    code: '01 / PVC PRINTING',
    spec: '800-micron UV matte & metallic foil · CR80 precision cut',
    ctaLabel: 'Explore PVC cards',
    to: '/pvc-cards',
  },
  frame: {
    id: 'frame',
    label: 'Frame design',
    code: '02 / FRAME DESIGN',
    spec: 'Hand-mitred Regal Aurelia moulding · Crystal acrylic',
    ctaLabel: 'Open frame studio',
    to: '/custom-framing',
  },
  poster: {
    id: 'poster',
    label: 'Posters & prints',
    code: '03 / POSTERS & PRINTS',
    spec: '250 GSM archival fine-art stock · Deep studio pigments',
    ctaLabel: 'Order posters',
    to: '/printing-services?service=Photo%20posters',
  },
};

export default function StudioHero({ onHeroPhotoChange }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(false);
  const root = useRef(null);
  const touchStart = useRef(null);
  const running = playing && !hovered && visible && inView;

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotion = () => { if (motion.matches) setPlaying(false); };
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
    const timer = window.setTimeout(() => setActiveSlide(index => (index + 1) % slides.length), 9000);
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
      className={`studio-hero-carousel studio-hero-carousel--${slides[activeSlide].id}`}
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
              <LivePreviewSlide onInteract={pauseCarousel} onHeroPhotoChange={onHeroPhotoChange} />
            ) : index === 1 ? (
              <WeddingSlide onInteract={pauseCarousel} />
            ) : (
              <PrintingSlide onInteract={pauseCarousel} />
            )}
          </div>
        ))}
      </div>

      <div className="studio-hero-carousel__navigation">
        <div className="studio-hero-carousel__nav-inner">
          <span className="studio-hero-carousel__index" aria-hidden="true">0{activeSlide + 1}<span> / 03</span></span>
          <div className="studio-hero-carousel__selectors" role="group" aria-label="Choose a hero slide">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={activeSlide === index ? 'is-active' : ''}
                aria-label={`Show slide ${index + 1}: ${slide.label}`}
                aria-current={activeSlide === index ? 'true' : undefined}
                aria-controls={`hero-slide-${slide.id}`}
                onClick={() => showSlide(index)}
              >
                <span className="studio-hero-carousel__marker" aria-hidden="true" />
                <span className="studio-hero-carousel__selector-num">{slide.number}</span>
                <span className="studio-hero-carousel__selector-label">{slide.label}</span>
              </button>
            ))}
          </div>
          <div className="studio-hero-carousel__arrows">
            <button type="button" data-slideshow-play aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} onClick={() => setPlaying(value => !value)}>
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span className="studio-hero-carousel__divider" />
            <button type="button" aria-label="Previous slide" onClick={() => showSlide(activeSlide - 1)}><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Next slide" onClick={() => showSlide(activeSlide + 1)}><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <span className="studio-hero-carousel__sr-only" role="status" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
        Slide {activeSlide + 1} of {slides.length}: {slides[activeSlide].label}
      </span>
    </section>
  );
}

function WeddingSlide({ onInteract }) {
  const [weddingFrameId, setWeddingFrameId] = useState(WEDDING_FRAME_OPTIONS[0].id);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [pinnedIndex, setPinnedIndex] = useState(null);
  const [switching, setSwitching] = useState(false);
  const switchTimer = useRef(null);

  useEffect(() => () => clearTimeout(switchTimer.current), []);

  const frame = homeFrame(weddingFrameId);
  const selectedOption = WEDDING_FRAME_OPTIONS.find(opt => opt.id === weddingFrameId) || WEDDING_FRAME_OPTIONS[0];
  const activeFocus = pinnedIndex !== null ? pinnedIndex : focusedIndex;

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
    setPinnedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="wedding-hero">
      <div className="wedding-hero__arch" aria-hidden="true" />
      <div className="wedding-hero__spotlight" aria-hidden="true" />

      <div className="wedding-hero__intro hero-reveal-copy">
        <span className="hero-story-kicker"><Heart size={12} /> THE WEDDING COLLECTION</span>
        <h2>One beautiful day.<em> A lifetime together.</em></h2>
        <p className={activeFocus !== null ? 'is-focused-note' : ''}>
          {activeFocus !== null
            ? weddingPhotos[activeFocus].note
            : 'The two of you. The little details. A wedding story, framed forever.'}
        </p>
      </div>

      <div
        className={`wedding-hero__gallery hero-reveal-stage ${switching ? 'is-switching' : ''}`}
        role="group"
        aria-label="Five-frame Indian wedding gallery"
        data-has-focus={activeFocus !== null ? 'true' : 'false'}
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
              onMouseEnter={() => setFocusedIndex(index)}
              onFocus={() => setFocusedIndex(index)}
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
                  <span style={{ backgroundColor: optFrame.colorHex }} />
                  {selected && <Check size={10} />}
                </button>
              );
            })}
          </div>
          <span className="wedding-hero__finish-label" aria-live="polite">
            {frame.name}
            <small>{selectedOption.mood}</small>
          </span>
        </div>

        <Link to="/gallery-walls" className="studio-hero__btn-primary">
          Create our wedding wall <ArrowUpRight size={16} />
        </Link>
        <Link to="/custom-framing" state={{ frameId: frame.id, triggerUpload: true }} className="studio-hero__btn-text">
          Frame a wedding photo <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

function PrintingSlide({ onInteract }) {
  const frame = homeFrame('regal_aurelia');
  const [spotlight, setSpotlight] = useState('pvc');
  const [pvcFlipped, setPvcFlipped] = useState(false);
  const [sheen, setSheen] = useState({ x: 50, y: 50, active: false });
  const activeObj = PRINT_OBJECTS[spotlight];

  const selectObject = (key, lockCarousel = false) => {
    setSpotlight(key);
    if (lockCarousel) onInteract?.();
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
          <p>From a sharp PVC card to a beautifully framed print. Design, printing and finishing, all in one creative studio.</p>

          <div className="print-design-hero__services" role="group" aria-label="Spotlight a studio print piece">
            <button
              type="button"
              aria-pressed={spotlight === 'pvc'}
              className={spotlight === 'pvc' ? 'is-active' : ''}
              onMouseEnter={() => selectObject('pvc')}
              onClick={() => selectObject('pvc', true)}
            >
              <CreditCard size={14} />
              <span>PVC printing</span>
            </button>
            <button
              type="button"
              aria-pressed={spotlight === 'frame'}
              className={spotlight === 'frame' ? 'is-active' : ''}
              onMouseEnter={() => selectObject('frame')}
              onClick={() => selectObject('frame', true)}
            >
              <Frame size={14} />
              <span>Frame design</span>
            </button>
            <button
              type="button"
              aria-pressed={spotlight === 'poster'}
              className={spotlight === 'poster' ? 'is-active' : ''}
              onMouseEnter={() => selectObject('poster')}
              onClick={() => selectObject('poster', true)}
            >
              <Layers size={14} />
              <span>Posters & prints</span>
            </button>
          </div>

          <div className="studio-hero__actions">
            <Link to="/printing-services" className="studio-hero__btn-primary">
              Explore printing services <ArrowUpRight size={16} />
            </Link>
            <Link to="/frames-catalogue" className="studio-hero__btn-text">
              Browse frames <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="print-design-hero__visual hero-reveal-stage" role="group" aria-label="Interactive PVC card, custom poster and gallery frame desk">
          <div className="print-design-hero__stage-head">
            <span className="print-design-hero__visual-kicker">A LITTLE INK. ENDLESS POSSIBILITIES.</span>
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
              <small>250 GSM · ARCHIVAL MATTE</small>
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
                <div className="print-design-hero__pvc-face print-design-hero__pvc-face--front">
                  <span className={`print-design-hero__pvc-sheen ${sheen.active ? 'is-active' : ''}`} aria-hidden="true" />
                  <div className="print-design-hero__pvc-top">
                    <span>BISEN</span>
                    <small>MEMBERS CLUB</small>
                  </div>
                  <div className="print-design-hero__pvc-chip-row" aria-hidden="true">
                    <span className="print-design-hero__pvc-chip" />
                    <Sparkles size={24} strokeWidth={1.1} />
                  </div>
                  <strong>Something<br /><em>uniquely yours.</em></strong>
                  <div className="print-design-hero__pvc-bottom">
                    <span>UV LAMINATED</span>
                    <span>EDITION 001</span>
                  </div>
                </div>

                <div className="print-design-hero__pvc-face print-design-hero__pvc-face--back">
                  <span className="print-design-hero__pvc-magstripe" aria-hidden="true" />
                  <div className="print-design-hero__pvc-back-body">
                    <div className="print-design-hero__pvc-back-meta">
                      <span className="print-design-hero__pvc-sign" aria-hidden="true" />
                      <small>BISEN ATELIER · LUCKNOW</small>
                      <p>NFC · ID · MEMBERSHIP</p>
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
                <span>{pvcFlipped ? 'Show front' : 'Flip card'}</span>
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

function LivePreviewSlide({ onInteract, onHeroPhotoChange }) {
  const [collection, setCollection] = useState('photo');
  const [customPhoto, setCustomPhoto] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [frameId, setFrameId] = useState(STUDIO_FRAME_IDS[0]);
  const [wallMood, setWallMood] = useState('plaster');
  const [entered, setEntered] = useState(false);
  const [frameSwitch, setFrameSwitch] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const frameSwitchTimer = useRef(null);
  const fileInputRef = useRef(null);

  const frame = homeFrame(frameId);
  const dua = homeDua('ayat-al-kursi');
  const isCustom = collection === 'custom' && Boolean(customPhoto);
  const isPhotoMode = collection === 'photo';

  const activePoster = collection === 'dua'
    ? dua
    : isCustom
      ? {
          title: customPhoto.name || 'Your uploaded photo',
          image: customPhoto.url,
          width: customPhoto.width,
          height: customPhoto.height,
        }
      : HOME_PHOTO;

  const activeOrientation = collection === 'dua'
    ? 'portrait'
    : isCustom
      ? (customPhoto.width >= customPhoto.height ? 'landscape' : 'portrait')
      : 'landscape';

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

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
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
    <div className={`studio-hero ${entered ? 'is-entered' : ''}`}>
      <div className="hero-scene__layout">
        {/* Editorial copy shares the same surface as the frame preview. */}
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
            Your favourite photos and meaningful art, beautifully printed and
            framed for your space and your people.
          </p>

          <PrimaryShopActions variant="hero" className="studio-hero__actions hero-anim hero-anim--5" />

          <div className="studio-hero__reassurance hero-anim hero-anim--6">
            <span><Check size={13} /> See it in a real frame</span>
            <span><Check size={13} /> Try your own photo live</span>
            <a className="studio-hero__explore-link" href="#shop-creations">
              Explore the studio <ArrowRight size={13} />
            </a>
          </div>
        </div>

        {/* Interactive frame preview */}
        <div className="studio-hero__studio hero-reveal-stage">
          <div className="studio-hero__studio-bar">
            <div className="studio-hero__toggle" role="group" aria-label="Choose a preview collection">
              <button
                type="button"
                aria-pressed={isPhotoMode}
                className={isPhotoMode ? 'active' : ''}
                onClick={() => handleCollectionSelect('photo')}
              >
                <Image size={12} /> Photo
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

            <div className="studio-hero__wall-picker" role="group" aria-label="Choose gallery wall tone">
              <span className="studio-hero__wall-label">WALL</span>
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
                    setWallMood(mood.id);
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
            className={`studio-hero__stage studio-hero__stage--${wallMood} ${activeOrientation === 'landscape' ? 'is-photo' : 'is-dua'}`}
            onPointerMove={handleStagePointerMove}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          >
            <span className="studio-hero__sunbeam" aria-hidden="true" />

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
              />
              <span className="studio-hero__glaze-sheen" aria-hidden="true" />
            </div>

            <div className="studio-hero__loupe" title={`45° mitre corner detail — ${frame.name}`}>
              <div className="studio-hero__loupe-lens">
                <img
                  src={resolveAssetUrl(frame.cornerImage)}
                  alt=""
                  loading="lazy"
                  style={{ objectPosition: CORNER_POSITIONS[frame.id] || '24% 24%' }}
                />
              </div>
              <span className="studio-hero__loupe-tag">
                <ZoomIn size={10} /> {frame.mouldingWidth?.split(' ')[0] || '28'}mm mitre
              </span>
            </div>

            {uploadError ? (
              <span className="studio-hero__caption studio-hero__caption--error" role="alert">
                {uploadError}
              </span>
            ) : (
              <span className="studio-hero__caption">
                {isCustom
                  ? `Previewing your photo in ${frame.name}.`
                  : collection === 'dua'
                    ? 'Meaningful words. A beautiful place for them.'
                    : 'A memory, made part of your home.'}
              </span>
            )}
          </div>

          <div className="studio-hero__controls">
            <div className="studio-hero__controls-left">
              <span className="studio-hero__controls-label">TRY A FRAME FINISH</span>
              <div className="studio-hero__swatches">
                {STUDIO_FRAME_IDS.map((id) => {
                  const option = homeFrame(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-label={`Preview ${option.name}`}
                      aria-pressed={id === frameId}
                      className={`studio-hero__swatch ${id === frameId ? 'is-selected' : ''}`}
                      onClick={() => handleFrameChange(id)}
                      title={`${option.name} — ${option.finish}`}
                    >
                      <span style={{ backgroundColor: option.colorHex }} />
                      {id === frameId && <Check size={10} />}
                    </button>
                  );
                })}
                <span className="studio-hero__swatch-name" aria-live="polite">
                  {frame.name}
                  <small>{frame.finish}</small>
                </span>
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
                    ? { frameId, orientation: activeOrientation, hasGuidePhoto: true, triggerUpload: false }
                    : { frameId, triggerUpload: true }
              }
            >
              Make it yours
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
