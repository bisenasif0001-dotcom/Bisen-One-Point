import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Expand, Frame, Image as ImageIcon, MessageCircle, Ruler, X } from 'lucide-react';
import { CUSTOM_FRAME_EXAMPLES, getCustomFrameEnquiry } from '../data/customFrameExamples';
import './CustomFrameShowcase.css';

function CustomFrameInspector({ initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef(null);
  const example = CUSTOM_FRAME_EXAMPLES[index];
  const move = delta => setIndex(current => (current + delta + CUSTOM_FRAME_EXAMPLES.length) % CUSTOM_FRAME_EXAMPLES.length);
  useEffect(() => {
    const dialog = dialogRef.current, previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={dialogRef} className="custom-work-dialog" aria-label="Custom frame inspiration" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } }}>
    <header><span className="custom-work-kicker">THE CUSTOM FRAME & PRINT STUDIO</span><button type="button" className="custom-work-icon" autoFocus onClick={onClose} aria-label="Close custom frame preview"><X size={21} /></button></header>
    <div className="custom-work-dialog-layout"><div className="custom-work-dialog-gallery"><div className={`custom-work-dialog-art custom-work-art-${example.id}`}><img key={example.id} src={example.largeImage} alt={example.alt} width={example.width} height={example.height} /></div><div className="custom-work-gallery-navigation"><button type="button" className="custom-work-icon" aria-label="Previous custom frame example" onClick={() => move(-1)}><ArrowLeft size={18} /></button><span role="status">0{index + 1} / 0{CUSTOM_FRAME_EXAMPLES.length}<small>{example.label}</small></span><button type="button" className="custom-work-icon" aria-label="Next custom frame example" onClick={() => move(1)}><ArrowRight size={18} /></button></div></div>
      <div className="custom-work-dialog-copy"><span className="custom-work-kicker">AN IDEA TO MAKE YOUR OWN</span><h2>{example.title}</h2><p>{example.description}</p><p>Your photo or artwork, your preferred size and a frame finish that suits your space. Share what you have in mind and we’ll help you work through the details.</p><dl><div><dt>Personalise</dt><dd>Photo, artwork & layout</dd></div><div><dt>Choose</dt><dd>Size, colour & frame finish</dd></div><div><dt>Create</dt><dd>Printing + framing together</dd></div></dl><a className="custom-work-primary" href={getCustomFrameEnquiry(example)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Discuss a frame like this <ArrowUpRight size={16} /></a><p className="custom-work-help">An example to guide your request. The studio confirms the available finish, dimensions, print options and price before making your order.</p></div>
    </div>
  </dialog>;
}

export default function CustomFrameShowcase({ placement = 'home', id = 'custom-frames' }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const triggerRef = useRef(null);
  const open = (index, event) => { triggerRef.current = event.currentTarget; setActiveIndex(index); };
  const close = () => { setActiveIndex(null); requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true })); };
  return <section className={`custom-work custom-work--${placement}`} id={id} aria-labelledby={`${id}-heading`}>
    <div className="custom-work-inner"><div className="custom-work-heading"><div><span className="custom-work-kicker"><Frame size={14} /> CUSTOM FRAMES & PRINTS</span><h2 id={`${id}-heading`}>More than a frame.<br /><em>Something made for you.</em></h2></div><div><p>Have a particular design, size or colour in mind? We make custom frames and print your photographs and artwork to suit your request.</p><a className="custom-work-text-link" href={getCustomFrameEnquiry()} target="_blank" rel="noopener noreferrer">Tell us what you’re imagining <ArrowUpRight size={16} /></a></div></div>
      <div className="custom-work-options" aria-label="Custom framing possibilities"><span><Ruler size={15} /> Your size</span><span><Frame size={15} /> Your frame finish</span><span><ImageIcon size={15} /> Your photo or artwork</span><span><Check size={15} /> Print + frame together</span></div>
      <div className="custom-work-gallery">{CUSTOM_FRAME_EXAMPLES.map((example, index) => <article className={`custom-work-card custom-work-card-${example.id}`} key={example.id}><button type="button" className="custom-work-art" aria-label={`View custom frame example: ${example.description}`} onClick={event => open(index, event)}><span className="custom-work-image-number">0{index + 1} / DESIGN INSPIRATION</span><img src={example.image} alt={example.alt} width={example.width} height={example.height} loading="lazy" decoding="async" /><span className="custom-work-enlarge"><Expand size={13} /> View example</span></button><div className="custom-work-card-copy"><span className="custom-work-kicker">{example.label}</span><h3>{example.title}</h3><p>{example.description}</p><button type="button" className="custom-work-text-link" onClick={event => open(index, event)}>Explore this idea <ArrowUpRight size={14} /></button></div></article>)}</div>
      <div className="custom-work-request"><div><span className="custom-work-request-mark" aria-hidden="true"><MessageCircle size={23} strokeWidth={1.3} /></span><span><strong>Seen something you’d love to make?</strong><small>Share a reference, the size you need and your preferred finish. We’ll help with the print, frame and quote.</small></span></div><a className="custom-work-primary" href={getCustomFrameEnquiry()} target="_blank" rel="noopener noreferrer">Request a custom frame <ArrowUpRight size={16} /></a></div>
      <p className="custom-work-footnote">Custom designs are quoted for your requirements. <Link to="/custom-framing">Prefer a live preview? Try our frame studio <ArrowUpRight size={12} /></Link></p>
    </div>
    {activeIndex !== null && <CustomFrameInspector initialIndex={activeIndex} onClose={close} />}
  </section>;
}

