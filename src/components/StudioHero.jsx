import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, CreditCard, Frame, Heart, Image, Layers, Pause, Play, Printer, Sparkles } from 'lucide-react';
import FramedPosterPreview from './FramedPosterPreview';
import PrimaryShopActions from './PrimaryShopActions';
import { HOME_PHOTO, homeFrame, homeDua } from '../data/homeStudio';
import './StudioHero.css';
import './StudioHeroCarousel.css';

const frameIds = ['regal_aurelia', 'regal_noir', 'regal_heritage'];

const slides = [
  { id: 'studio', label: 'Your photo studio' },
  { id: 'wedding', label: 'The wedding story' },
  { id: 'printing', label: 'Print & design' },
];

const weddingPhotos = [
  { id: 'groom-accessories', title: 'The groom’s wedding accessories', label: 'His details', panY: 50 },
  { id: 'bride', title: 'An Indian bride in her red wedding lehenga', label: 'The bride', panY: 10 },
  { id: 'couple', title: 'An Indian bride and groom together on their wedding day', label: 'Together, always', panY: 0 },
  { id: 'groom', title: 'An Indian groom in his ivory wedding sherwani', label: 'The groom', panY: 0 },
  { id: 'bride-accessories', title: 'The bride’s wedding jewellery and accessories', label: 'Her details', panY: 50 },
].map(photo => ({ ...photo, image: `/hero/wedding-${photo.id}.jpg`, width: 434, height: 724 }));

export default function StudioHero() {
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

  const showSlide = index => {
    setPlaying(false);
    setActiveSlide((index + slides.length) % slides.length);
  };

  return (
    <section
      ref={root}
      className={`studio-hero-carousel studio-hero-carousel--${slides[activeSlide].id}`}
      aria-roledescription="carousel"
      aria-label="Discover Al-Noor print and frame studio"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={event => { if (!event.target.closest('[data-slideshow-play]')) setPlaying(false); }}
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
            {index === 0 ? <LivePreviewSlide /> : index === 1 ? <WeddingSlide /> : <PrintingSlide />}
          </div>
        ))}
      </div>
      <div className="studio-hero-carousel__navigation">
        <span className="studio-hero-carousel__index" aria-hidden="true">0{activeSlide + 1}<span> / 03</span></span>
        <div className="studio-hero-carousel__selectors" role="group" aria-label="Choose a hero slide">
          {slides.map((slide, index) => (
            <button key={slide.id} type="button" className={activeSlide === index ? 'is-active' : ''}
              aria-label={`Show slide ${index + 1}: ${slide.label}`} aria-current={activeSlide === index ? 'true' : undefined}
              aria-controls={`hero-slide-${slide.id}`} onClick={() => showSlide(index)}>
              <span className="studio-hero-carousel__marker" aria-hidden="true" />
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
      <span className="studio-hero-carousel__sr-only" role="status" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
        Slide {activeSlide + 1} of {slides.length}: {slides[activeSlide].label}
      </span>
    </section>
  );
}

function WeddingSlide() {
  const frame = homeFrame('regal_aurelia');
  return (
    <div className="wedding-hero">
      <div className="wedding-hero__intro">
        <span className="hero-story-kicker"><Heart size={12} /> THE WEDDING COLLECTION</span>
        <h2>One beautiful day.<em> A lifetime together.</em></h2>
        <p>The two of you. The little details. A wedding story, framed forever.</p>
      </div>
      <div className="wedding-hero__gallery" role="group" aria-label="Five-frame Indian wedding gallery">
        {weddingPhotos.map((photo, index) => (
          <figure key={photo.id} className={`wedding-hero__frame wedding-hero__frame--${index === 2 ? 'couple' : index === 0 || index === 4 ? 'detail' : 'portrait'}`}>
            <FramedPosterPreview poster={photo} frame={frame} fit="cover" panY={photo.panY} />
            <figcaption>{photo.label}</figcaption>
          </figure>
        ))}
      </div>
      <div className="wedding-hero__footer">
        <span className="wedding-hero__finish"><span /> {frame.name}<small>Natural wood & gold</small></span>
        <Link to="/gallery-walls" className="studio-hero__btn-primary">Create our wedding wall <ArrowUpRight size={16} /></Link>
        <Link to="/custom-framing" state={{ frameId: frame.id, triggerUpload: true }} className="studio-hero__btn-text">Frame a wedding photo <ArrowRight size={15} /></Link>
      </div>
    </div>
  );
}

function PrintingSlide() {
  const frame = homeFrame('regal_noir');
  return (
    <div className="print-design-hero">
      <div className="hero-scene__layout">
        <div className="print-design-hero__copy">
          <span className="hero-story-kicker"><Printer size={13} /> THE PRINT & DESIGN STUDIO</span>
          <h2>Your ideas.<br /><em>Made tangible.</em></h2>
          <p>From a sharp PVC card to a beautifully framed print. Design, printing and finishing, all in one creative studio.</p>
          <div className="print-design-hero__services">
            <Link to="/pvc-cards"><CreditCard size={14} /><span>PVC printing</span></Link>
            <Link to="/custom-framing"><Frame size={14} /><span>Frame design</span></Link>
            <Link to="/printing-services?service=Photo%20posters"><Layers size={14} /><span>Posters & prints</span></Link>
          </div>
          <div className="studio-hero__actions">
            <Link to="/printing-services" className="studio-hero__btn-primary">Explore printing services <ArrowUpRight size={16} /></Link>
            <Link to="/frames-catalogue" className="studio-hero__btn-text">Browse frames <ArrowRight size={15} /></Link>
          </div>
        </div>
        <div className="print-design-hero__visual" role="group" aria-label="PVC card, custom poster and original frame design previews">
          <div className="print-design-hero__products">
            <span className="print-design-hero__visual-kicker">A LITTLE INK. ENDLESS POSSIBILITIES.</span>
            <div className="print-design-hero__poster" aria-label="Custom poster design sample">
              <span>AL-NOOR / CREATIVE STUDIO</span>
              <span className="print-design-hero__poster-orbit" aria-hidden="true" />
              <strong>Make<br /><em>it yours.</em></strong>
              <small>YOUR VISION. IN PRINT.</small>
            </div>
            <div className="print-design-hero__frame-preview">
              <FramedPosterPreview poster={weddingPhotos[1]} frame={frame} fit="cover" panY={10} />
            </div>
            <div className="print-design-hero__pvc" aria-label="PVC membership card design sample">
              <span>AL-NOOR <small>MEMBERS CLUB</small></span>
              <Sparkles size={29} strokeWidth={1} />
              <strong>Something<br /><em>uniquely yours.</em></strong>
              <div><span>DESIGNED TO BELONG.</span><span>001</span></div>
            </div>
            <span className="print-design-hero__tag print-design-hero__tag--frame">01 / FRAME DESIGN</span>
            <span className="print-design-hero__tag print-design-hero__tag--pvc">02 / PVC PRINTING</span>
            <span className="print-design-hero__visual-note">Designed with care. Finished with detail.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LivePreviewSlide() {
  const [collection, setCollection] = useState('photo');
  const [frameId, setFrameId] = useState(frameIds[0]);
  const [entered, setEntered] = useState(false);
  const [frameSwitch, setFrameSwitch] = useState(false);
  const frameSwitchTimer = useRef(null);

  const frame = homeFrame(frameId);
  const dua = homeDua('ayat-al-kursi');
  const photo = collection === 'photo';

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => {
      clearTimeout(t);
      clearTimeout(frameSwitchTimer.current);
    };
  }, []);

  const handleFrameChange = (id) => {
    clearTimeout(frameSwitchTimer.current);
    setFrameSwitch(true);
    setFrameId(id);
    frameSwitchTimer.current = setTimeout(() => setFrameSwitch(false), 350);
  };

  return (
    <div className={`studio-hero ${entered ? 'is-entered' : ''}`}>
      <div className="hero-scene__layout">

        {/* Editorial copy shares the same surface as the frame preview. */}
        <div className="studio-hero__copy">

          {/* Animated kicker */}
          <span className="studio-hero__kicker hero-anim hero-anim--1">
            <span className="studio-hero__kicker-dot" />
            <span className="studio-hero__kicker-line" />
            YOUR EVERYDAY PRINT & FRAME STUDIO
          </span>

          {/* Main headline with staggered entrance */}
          <h1 className="studio-hero__headline">
            <span className="hero-anim hero-anim--2">Your moments.</span>
            <br />
            <em className="hero-anim hero-anim--3">Beautifully made.</em>
          </h1>

          {/* Subtext */}
          <p className="studio-hero__subtext hero-anim hero-anim--4">
            Your favourite photos and meaningful art, beautifully printed and
            framed for your space and your people.
          </p>

          {/* Action Row */}
          <PrimaryShopActions variant="hero" className="studio-hero__actions hero-anim hero-anim--5" />

          {/* Reassurance chips */}
          <div className="studio-hero__reassurance hero-anim hero-anim--6">
            <span><Check size={13} /> See it in a real frame</span>
            <span><Check size={13} /> Choose your size & finish</span>
            <a className="studio-hero__explore-link" href="#shop-creations">Explore the studio <ArrowRight size={13} /></a>
          </div>

        </div>

        {/* Interactive frame preview */}
        <div className="studio-hero__studio">

          {/* Top bar with collection toggle */}
          <div className="studio-hero__studio-bar">
            <span className="studio-hero__studio-label">YOUR PHOTO, YOUR FINISH</span>
            <div className="studio-hero__toggle" role="group" aria-label="Choose a preview collection">
              <button
                aria-pressed={photo}
                className={photo ? 'active' : ''}
                onClick={() => setCollection('photo')}
              >
                <Image size={12} /> Photo
              </button>
              <button
                aria-pressed={!photo}
                className={!photo ? 'active' : ''}
                onClick={() => setCollection('dua')}
              >
                <Sparkles size={12} /> Dua art
              </button>
            </div>
          </div>

          {/* Frame preview stage */}
          <div className={`studio-hero__stage ${photo ? 'is-photo' : 'is-dua'}`}>
            {/* Original catalogue frame with the selected artwork */}
            <div className={`studio-hero__frame-wrap ${frameSwitch ? 'is-switching' : ''}`} key={`${collection}-${frameId}`}>
              <FramedPosterPreview
                poster={photo ? HOME_PHOTO : dua}
                frame={frame}
                orientation={photo ? 'landscape' : 'portrait'}
                fit={photo ? 'cover' : 'contain'}
              />
            </div>
            {/* Caption */}
            <span className="studio-hero__caption">
              {photo
                ? 'A memory, made part of your home.'
                : 'Meaningful words. A beautiful place for them.'}
            </span>
          </div>

          {/* Controls bar */}
          <div className="studio-hero__controls">
            <div className="studio-hero__controls-left">
              <span className="studio-hero__controls-label">TRY A FRAME FINISH</span>
              <div className="studio-hero__swatches">
                {frameIds.map((id) => {
                  const option = homeFrame(id);
                  return (
                    <button
                      key={id}
                      aria-label={`Preview ${option.name}`}
                      aria-pressed={id === frameId}
                      className={`studio-hero__swatch ${id === frameId ? 'is-selected' : ''}`}
                      onClick={() => handleFrameChange(id)}
                      title={option.finish}
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
                photo
                  ? '/custom-framing'
                  : `/dua-posters/${dua.id}?format=framed&frame=${frameId}`
              }
              state={photo ? { frameId, triggerUpload: true } : undefined}
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
