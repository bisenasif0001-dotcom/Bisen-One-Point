import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, CreditCard, Frame, Image, MessageCircle, Minus, Plus, Ruler, Sparkles, Upload } from 'lucide-react';
import StudioHero from '../components/StudioHero';
import CustomFrameShowcase from '../components/CustomFrameShowcase';
import { HomeServicesSection, HomeFramesSection, HomeDuaSection, HomeGalleryScene } from '../components/HomeCollections';
import { HOME_LANDSCAPE, HOME_PHOTO } from '../data/homeStudio';
import { PRINT_SIZES, PRINT_FINISHES } from '../utils/photoPrints';
import './StudioHome.css';

const questions = [
  ['Can I use a photo from my phone?', 'Yes. Upload the original photo from your device in our frame studio or photo-printing page. The frame studio checks image resolution and lets you review how your photo fits before ordering.'],
  ['Can I buy a dua poster without a frame?', 'Yes. Every design in our Dua Collection is available with a frame or as a 250 GSM glossy poster. Choose A5, A4, A3, A2 or A1; ask the studio for a custom-size quote. Delivery charges are extra.'],
  ['Can you make a frame to my own size or design?', 'Yes. Share your photo or artwork, a design reference, the width and height you need, and your preferred frame colour or finish. The studio helps with printing and framing, then confirms the options and quote before making your order. You can also try our catalogue frames in the live frame studio.'],
  ['How do I order PVC cards, posters or bulk prints?', 'Open PVC & Printing, choose your service, quantity and dimensions, then prepare your enquiry. The studio confirms artwork requirements, pricing and turnaround before your custom order.'],
];

export default function HomePage({ onOpenSizeGuide }) {
  const [openFaq, setOpenFaq] = useState(0);
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    const targetId = location.hash.slice(1);
    const frame = requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.key]);

  return <div className="studio-home home-shell">
    <div className="home-hero-container"><StudioHero /></div>
    <div className="home-content">
      <div className="home-assurances"><div className="home-container">
        <div><Frame size={21} strokeWidth={1.3} /><span><strong>Real frames. Real previews.</strong><small>Choose a finish with confidence</small></span></div>
        <div><Image size={21} strokeWidth={1.3} /><span><strong>Made for your memories.</strong><small>From one print to a whole wall</small></span></div>
        <div><CreditCard size={21} strokeWidth={1.3} /><span><strong>Personal to professional.</strong><small>PVC cards, posters & custom prints</small></span></div>
        <Link to="/contact"><MessageCircle size={21} strokeWidth={1.3} /><span><strong>A little help from the studio.</strong><small>Let’s make your idea happen <ArrowUpRight size={12} /></small></span></Link>
      </div></div>
      <HomeServicesSection />
      <HomeFramesSection />
      <CustomFrameShowcase />
      <HomeDuaSection />

      <section className="home-section home-printing-section" aria-labelledby="home-print-heading"><div className="home-container">
        <div className="home-section-heading"><div><span className="home-kicker"><span>04</span> PAPER, WITH POSSIBILITIES</span><h2 id="home-print-heading">Big ideas.<br /><em>Beautiful little details.</em></h2></div><p>For the moments you want to keep.<br /> And the ideas you want to put out into the world.</p></div>
        <div className="home-printing-grid">
          <Link className="home-print-story" to="/photo-prints"><div className="home-print-story-copy"><span className="home-story-label">THE PHOTO LAB</span><h3>Out of your phone.<br /><em>Into your hands.</em></h3><p>Holiday sunsets, family days and all the little things in between. Give your favourites a life on paper.</p><span className="home-inline-action">Print my photos <ArrowUpRight size={17} /></span><span className="home-print-price">From ₹{PRINT_SIZES[0].price} / {PRINT_SIZES[0].name} print <small>+ delivery</small></span></div><div className="home-print-story-art"><div><img src={HOME_PHOTO.image} alt="A family moment printed with a white border" loading="lazy" /></div><div><img src={HOME_LANDSCAPE.image} alt="A landscape memory as a photo print" loading="lazy" /><span>the little things.</span></div></div><div className="home-print-specs"><span>{PRINT_SIZES.length} sizes</span><span>{PRINT_FINISHES.length} paper finishes</span><span>Live photo preview</span></div></Link>
          <Link className="home-business-story" to="/printing-services"><div className="home-business-copy"><span className="home-story-label">THE PRINT & DESIGN DESK</span><h3>Your next<br /><em>big thing.</em></h3><p>From a smart PVC card to a standout poster. Thoughtful design and printing for whatever comes next.</p><span className="home-inline-action">Explore printing services <ArrowUpRight size={17} /></span></div><div className="home-business-art" aria-hidden="true"><div className="home-business-sheet"><small>AL-NOOR / CREATIVE STUDIO</small><span>Make<br />your<br /><em>mark.</em></span><small>A LITTLE INK. ENDLESS POSSIBILITIES.</small></div><div className="home-business-card"><span>AL-NOOR / PRINT STUDIO</span><CreditCard size={25} strokeWidth={1.1} /><strong>Something<br />uniquely yours.</strong><small>001</small></div></div><div className="home-business-specs"><span>PVC cards</span><span>Posters</span><span>Custom & bulk prints</span></div></Link>
        </div>
      </div></section>

      <section className="home-section home-gift-section" aria-labelledby="home-gift-heading"><div className="home-container">
        <div className="home-section-heading"><div><span className="home-kicker"><span>05</span> A LITTLE MORE THOUGHT</span><h2 id="home-gift-heading">Good gifts<br /><em>feel personal.</em></h2></div><Link className="home-text-link" to="/cards">Explore cards & gifts <ArrowUpRight size={17} /></Link></div>
        <div className="home-gift-grid">
          <Link className="home-gift-card" to="/birthday-cards"><div className="home-greeting-art" aria-hidden="true"><span className="home-envelope" /><div><small>A LITTLE SOMETHING</small><Sparkles size={29} strokeWidth={1} /><strong>Just<br /><em>for you.</em></strong><span>with a whole lot of love.</span></div></div><div className="home-gift-copy"><span className="home-story-label">CARDS & INVITATIONS</span><h3>The words are yours.<br /><em>Make the card yours, too.</em></h3><p>Something they’ll open, smile at and keep. Create a birthday card with a little more you in it.</p><span className="home-inline-action">Create a birthday card <ArrowUpRight size={16} /></span></div></Link>
          <Link className="home-gift-card home-fragrance-card" to="/itra-perfumes"><div className="home-fragrance-art" role="img" aria-label="Illustration of an amber fragrance bottle for the Itra House"><span className="home-fragrance-art-label" aria-hidden="true">A LITTLE SOMETHING EXTRA</span><div className="home-itra-bottle" aria-hidden="true"><span className="home-itra-cap" /><span className="home-itra-neck" /><div><span>AL-NOOR</span><i /><strong>The<br /><em>Itra House.</em></strong><small>A PERSONAL FINISHING TOUCH</small></div></div><span className="home-fragrance-art-note" aria-hidden="true">a scent to remember.</span></div><div className="home-gift-copy"><span className="home-story-label">THE ITRA HOUSE</span><h3>A different kind<br /><em>of keepsake.</em></h3><p>Discover a fragrance that feels like them. Another thoughtful way to celebrate someone special.</p><span className="home-inline-action">Explore Itra <ArrowUpRight size={16} /></span></div></Link>
        </div>
      </div></section>

      <section className="home-section home-how-section" aria-labelledby="home-how-heading"><div className="home-container home-how-layout">
        <div className="home-room-story"><HomeGalleryScene /><div><span><strong>Make room for your story.</strong><small>A little gallery-wall inspiration.</small></span><Link to="/gallery-walls" aria-label="Build a gallery wall"><ArrowUpRight size={21} /></Link></div></div>
        <div className="home-how-copy"><span className="home-kicker"><span>06</span> FROM CAMERA ROLL TO YOUR WALL</span><h2 id="home-how-heading">Personal doesn’t have<br /><em>to be complicated.</em></h2><p>A few easy choices. A finishing touch that feels entirely yours.</p>
          <ol className="home-how-steps"><li><span>01</span><div><h3>Start with a favourite.</h3><p>Upload an original photo from your phone or computer.</p></div><Upload size={20} strokeWidth={1.3} /></li><li><span>02</span><div><h3>Find its perfect frame.</h3><p>Choose your size and finish. See your photo in the real frame.</p><button type="button" className="home-how-size" onClick={onOpenSizeGuide}>Need a size guide? <Ruler size={13} /></button></div><Frame size={20} strokeWidth={1.3} /></li><li><span>03</span><div><h3>Make it yours.</h3><p>Review your preview, check the details and add it to your bag.</p></div><Check size={20} strokeWidth={1.3} /></li></ol>
          <Link className="home-button" to="/custom-framing">Open the frame studio <ArrowUpRight size={17} /></Link>
        </div>
      </div></section>

      <section className="home-section home-faq-section" id="home-faq" aria-labelledby="home-faq-heading"><div className="home-container home-faq-layout">
        <div><span className="home-kicker"><span>07</span> GOOD QUESTIONS. THOUGHTFUL ANSWERS.</span><h2 id="home-faq-heading">A little clarity,<br /><em>before you create.</em></h2><p>Not quite sure where to start?<br />We’re here to help with the little details.</p><Link className="home-text-link" to="/contact">Talk to the studio <ArrowUpRight size={17} /></Link></div>
        <div className="home-faq-list">{questions.map(([question, answer], index) => <div className="home-faq-item" key={question}><h3><button type="button" aria-expanded={openFaq === index} aria-controls={`home-faq-${index}`} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span className="home-faq-number">0{index + 1}</span><span>{question}</span>{openFaq === index ? <Minus size={17} /> : <Plus size={17} />}</button></h3><div id={`home-faq-${index}`} hidden={openFaq !== index}><p>{answer}</p></div></div>)}</div>
      </div></section>

      <section className="home-closing" aria-labelledby="home-closing-heading"><div className="home-container"><div className="home-closing-mark" aria-hidden="true"><Sparkles size={38} strokeWidth={.8} /></div><span className="home-kicker">PRINT. FRAME. PERSONALISE.</span><h2 id="home-closing-heading">Let’s make something<br /><em>worth keeping.</em></h2><p>Your memories. Your people. Your own little piece of beautiful.</p><div><Link className="home-button home-button-light" to="/custom-framing">Frame my photo <ArrowUpRight size={17} /></Link><Link className="home-closing-contact" to="/contact">Have an idea? Talk to us <ArrowRight size={16} /></Link></div></div></section>
    </div>
  </div>;
}
