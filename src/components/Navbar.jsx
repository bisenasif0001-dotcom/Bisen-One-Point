import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, CreditCard, Frame, Gift, Menu, MessageCircle, Search, ShoppingBag, Sparkles, Truck, X } from 'lucide-react';
const SearchCommandPalette = lazy(() => import('./SearchCommandPalette'));
import NavigationPreview from './NavigationPreview';
import PvcCardArt from './PvcCardArt';
import { PVC_PRODUCTS } from '../data/pvcCards';
import PrimaryShopActions from './PrimaryShopActions';
import './Navbar.css';

const menus = [
  { id: 'frames', label: 'Frames & prints', path: '/frames-catalogue', icon: Frame, intro: 'Your favourite moments, thoughtfully printed and beautifully framed.', eyebrow: 'THE PRINT & FRAME STUDIO', groups: [
    { title: 'CREATE YOUR OWN', links: [ ['Frame my photo', '/custom-framing', 'Upload, choose a finish & preview'], ['Print my photos', '/photo-prints', 'Bring your camera roll to life'], ['Build a gallery wall', '/gallery-walls', 'A collection of your best moments'] ] },
    { title: 'EXPLORE THE STUDIO', links: [ ['Shop all frames', '/frames-catalogue', 'Discover our real frame collection'], ['Find your size', '/size-guide', 'Compare sizes before you choose'], ['Ask the studio', '/contact', 'A little help with your next creation'] ] },
  ], previews: [ { kind: 'frame', title: 'Made for your photo', note: 'Custom frames', path: '/custom-framing' }, { kind: 'prints', title: 'Hold on to the moment', note: 'Photo prints', path: '/photo-prints' } ] },
  { id: 'art', label: 'Dua & wall art', path: '/islamic-art', icon: Sparkles, intro: 'Meaningful words and original designs for the spaces that matter.', eyebrow: 'ART WITH A LITTLE MORE MEANING', groups: [
    { title: 'SHOP THE COLLECTIONS', links: [ ['Dua posters', '/dua-posters', '22 original designs · Framed or print only'], ['Names of Allah', '/islamic-art?tab=names', 'Discover Asma-ul-Husna calligraphy'], ['Verses & calligraphy', '/islamic-art?tab=verses', 'Explore our sacred-art collection'] ] },
    { title: 'MAKE IT PERSONAL', links: [ ['Dua poster printing', '/printing-services?service=Dua%20posters', 'Custom design, size and frame enquiries'], ['Frame your artwork', '/custom-framing', 'See your design in a real frame'], ['Create a gallery wall', '/gallery-walls', 'Bring meaningful pieces together'] ] },
  ], previews: [ { kind: 'dua', title: 'The Dua Collection', note: '22 designs to discover', path: '/dua-posters' }, { kind: 'names', title: 'Names of Allah', note: 'Calligraphy collection', path: '/islamic-art?tab=names' } ] },
  { id: 'gifts', label: 'Cards & gifts', path: '/cards', icon: Gift, intro: 'Little things with a personal touch, for people who mean a lot.', eyebrow: 'GIVE SOMETHING PERSONAL', groups: [
    { title: 'FOR THEIR OCCASION', links: [ ['Birthday card creator', '/birthday-cards', 'Your message, made just for them'], ['Cards & invitations', '/cards', 'Find the right words for your moment'], ['Shop by occasion', '/occasions', 'A thoughtful place to start'] ] },
    { title: 'THOUGHTFUL GIFTING', links: [ ['A photo in a frame', '/custom-framing', 'A memory they can keep close'], ['Explore Itra', '/itra-perfumes', 'Discover our fragrance collection'], ['Corporate & bulk gifts', '/contact?inquiry=bulk-gifting', 'Plan a more personal team gift'] ] },
  ], previews: [ { kind: 'greeting', title: 'Write their kind of card', note: 'Birthday card creator', path: '/birthday-cards' }, { kind: 'gift-frame', title: 'Give them a memory', note: 'Personalised frames', path: '/custom-framing' } ] },
  { id: 'printing', label: 'PVC cards', path: '/pvc-cards', icon: CreditCard, intro: 'For your team, your business or a memory worth keeping. One card or a whole community.', eyebrow: 'THE PVC CARD STUDIO', groups: [
    { title: 'WORK, BUSINESS & BELONGING', links: [ ['ID cards', '/pvc-cards?category=id', 'Employee, student, teacher & visitor'], ['Business cards', '/pvc-cards?category=business', 'PVC visiting & printed QR cards'], ['Membership cards', '/pvc-cards?category=membership', 'Gym, club, salon & loyalty'] ] },
    { title: 'PERSONAL MOMENTS & BIGGER BATCHES', links: [ ['Event passes', '/pvc-cards?category=events', 'VIP, conference, volunteer & crew'], ['Personalised cards', '/pvc-cards?category=personalised', 'Photos, gifts & little keepsakes'], ['Bulk PVC printing', '/pvc-cards/bulk', 'Schools, offices & local businesses'] ] },
  ], previews: [ { kind: 'pvc-id', title: 'A shared identity', note: 'Employee & student cards', path: '/pvc-cards?category=id' }, { kind: 'pvc-member', title: 'Made to belong', note: 'Membership & loyalty cards', path: '/pvc-cards?category=membership' } ] },
];

export default function Navbar({ cartCount = 0, onOpenCart }) {
  const [active, setActive] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const header = useRef(null);
  const triggers = useRef({});
  const mobileTrigger = useRef(null);
  const closeTimer = useRef(null);
  const hoverTimer = useRef(null);
  const openedBy = useRef(null);
  const location = useLocation();
  const menu = menus.find(item => item.id === active);
  const cancelTimers = () => { clearTimeout(closeTimer.current); clearTimeout(hoverTimer.current); };
  const close = () => { cancelTimers(); setActive(null); setMobile(false); openedBy.current = null; };
  const open = (id, method = 'pointer') => { cancelTimers(); openedBy.current = method; setActive(id); };
  const hover = id => {
    cancelTimers();
    if (!mobile && openedBy.current !== 'keyboard') hoverTimer.current = setTimeout(() => open(id, 'hover'), 100);
  };
  const leave = () => {
    clearTimeout(hoverTimer.current);
    if (mobile || openedBy.current === 'keyboard') return;
    closeTimer.current = setTimeout(() => { setActive(null); openedBy.current = null; }, 180);
  };
  useLayoutEffect(() => {
    const element = header.current;
    if (!element) return;
    const measure = () => document.documentElement.style.setProperty('--studio-header-height', `${Math.ceil(element.getBoundingClientRect().height)}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--studio-header-height'); };
  }, []);
  useEffect(() => {
    const keydown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); clearTimeout(closeTimer.current); clearTimeout(hoverTimer.current); openedBy.current = null; setSearch(value => !value); setActive(null); setMobile(false); }
      if (e.key === 'Escape') {
        clearTimeout(closeTimer.current); clearTimeout(hoverTimer.current);
        setActive(null); setMobile(false); openedBy.current = null;
        if (mobile) mobileTrigger.current?.focus();
        else if (active) triggers.current[active]?.focus();
      }
    };
    const outside = e => { if (!header.current?.contains(e.target)) { clearTimeout(closeTimer.current); clearTimeout(hoverTimer.current); setActive(null); setMobile(false); openedBy.current = null; } };
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', keydown); document.removeEventListener('pointerdown', outside); clearTimeout(closeTimer.current); clearTimeout(hoverTimer.current); };
  }, [active, mobile]);
  useEffect(() => {
    const breakpoint = window.matchMedia('(max-width: 1100px)');
    const reset = () => { clearTimeout(closeTimer.current); clearTimeout(hoverTimer.current); setActive(null); setMobile(false); openedBy.current = null; };
    breakpoint.addEventListener('change', reset);
    return () => breakpoint.removeEventListener('change', reset);
  }, []);
  useEffect(() => {
    if (location.pathname === '/pvc-cards' && location.state?.preservePvcScroll) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, location.search, location.state?.preservePvcScroll]);
  useLayoutEffect(() => {
    if (!active && !mobile) return;
    const measure = () => {
      const element = header.current;
      if (element) element.style.setProperty('--an-header-bottom', `${Math.ceil(element.getBoundingClientRect().bottom)}px`);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure); };
  }, [active, mobile]);
  const keyboard = (e, item, index) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); open(item.id, 'keyboard');
      requestAnimationFrame(() => document.getElementById(`an-panel-${item.id}`)?.querySelector('a')?.focus());
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = menus[(index + (e.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length];
      open(next.id, 'keyboard'); triggers.current[next.id]?.focus();
    }
  };
  const requestedPrintingService = new URLSearchParams(location.search).get('service');
  const isDuaPrinting = location.pathname.startsWith('/printing-services') && ['Dua posters', 'dua'].includes(requestedPrintingService);
  const currentSection = isDuaPrinting ? 'art' : (location.pathname.startsWith('/pvc-cards') || (location.pathname.startsWith('/printing-services') && ['PVC cards', 'pvc'].includes(requestedPrintingService))) ? 'printing'
    : (['/islamic-art', '/asma-ul-husna', '/99-names', '/dua-posters'].includes(location.pathname) || location.pathname.startsWith('/dua-posters/')) ? 'art'
    : ['/cards', '/birthday-cards', '/create-card', '/occasions', '/gift-sets'].some(path => location.pathname === path || location.pathname.startsWith(path + '/')) || location.pathname.startsWith('/itra') ? 'gifts'
    : ['/custom-framing', '/frames-catalogue', '/photo-prints', '/prints', '/gallery-walls', '/size-guide', '/shop'].includes(location.pathname) || location.pathname.startsWith('/product/') ? 'frames' : null;
  return <>
    <div className="an-announcement"><span>Little moments. Beautifully made.</span><Link to="/printing-services">Need bulk prints? Let's talk <ArrowUpRight size={12} /></Link></div>
    <header className="an-header" ref={header} onMouseLeave={leave} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) close(); }}>
      <div className="an-bar">
        <Link to="/" onClick={close} className="an-brand" aria-label="Al-Noor home">AL-NOOR<span>YOUR PRINT & FRAME STUDIO</span></Link>
        <nav className="an-desktop" aria-label="Main navigation">{menus.map((item, index) => <button ref={el => { triggers.current[item.id] = el; }} key={item.id} className={`an-nav-item ${active === item.id ? 'is-open' : ''} ${currentSection === item.id ? 'is-current' : ''}`} aria-expanded={active === item.id} aria-controls={`an-panel-${item.id}`} onMouseEnter={() => hover(item.id)} onClick={() => active === item.id && openedBy.current === 'click' ? close() : open(item.id, 'click')} onKeyDown={e => keyboard(e, item, index)}>{item.label}<ChevronDown size={12} /></button>)}<Link to="/about" onClick={close} onMouseEnter={() => { cancelTimers(); setActive(null); }} className="an-about">Our studio</Link></nav>
        <PrimaryShopActions className="an-shop-actions" onNavigate={close} />
        <div className="an-utilities"><button className="an-icon" aria-label="Search products" onClick={() => { close(); setSearch(true); }}><Search size={20} /></button><Link className="an-icon an-track" to="/track-order" onClick={close} aria-label="Track your order" title="Track your order"><Truck size={20} /></Link><button className="an-icon an-bag" aria-label={`Shopping bag, ${cartCount} items`} onClick={() => { close(); onOpenCart?.(); }}><ShoppingBag size={20} />{cartCount > 0 && <span>{cartCount}</span>}</button><button ref={mobileTrigger} className="an-icon an-mobile-toggle" aria-label={mobile ? 'Close navigation' : 'Open navigation'} aria-expanded={mobile} aria-controls="an-mobile-menu" onClick={() => { cancelTimers(); setMobile(!mobile); setActive(null); openedBy.current = null; }}>{mobile ? <X size={23} /> : <Menu size={23} />}</button></div>
      </div>
      {menu && !mobile && <nav className="pm-panel" id={`an-panel-${menu.id}`} onMouseEnter={cancelTimers} aria-label={`${menu.label} navigation`}>
        <div className="pm-content"><aside className="pm-intro"><span className="pm-intro-icon"><menu.icon size={23} strokeWidth={1.3} /></span><span className="pm-eyebrow">{menu.eyebrow}</span><h2>{menu.label}</h2><p>{menu.intro}</p><Link to={menu.path} onClick={close} className="pm-intro-link">Explore collection <ArrowRight size={16} /></Link></aside>
          <div className="pm-groups">{menu.groups.map(group => <div className="pm-group" key={group.title}><h3>{group.title}</h3>{group.links.map(([label, path, description]) => <Link className="pm-link" key={label} to={path} onClick={close}><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={14} /></Link>)}</div>)}</div>
          <div className="pm-discover"><span className="pm-discover-heading">A LITTLE INSPIRATION</span><div className="pm-product-grid">{menu.previews.map(product => <Link className="pm-product" key={product.kind} to={product.path} onClick={close}><div className={`pm-product-art pm-art-${product.kind}`}>{product.kind.startsWith('pvc-') ? <PvcCardArt product={PVC_PRODUCTS[product.kind === 'pvc-id' ? 1 : 5]} decorative /> : <NavigationPreview kind={product.kind} />}<span><ArrowUpRight size={13} /></span></div><strong>{product.title}</strong><small>{product.note}</small></Link>)}</div></div>
        </div><div className="pm-footer"><Link to="/contact" onClick={close}><MessageCircle size={14} /><span>Not sure where to start? <strong>Ask the studio</strong></span><ArrowRight size={13} /></Link><div><span className="pm-key-hint"><kbd>esc</kbd> to close</span><button onClick={() => { close(); triggers.current[menu.id]?.focus(); }} aria-label={`Close ${menu.label} menu`}><X size={16} /></button></div></div>
      </nav>}
      {mobile && <nav className="an-mobile" id="an-mobile-menu" aria-label="Mobile navigation"><div className="an-mobile-heading"><span className="an-kicker">EXPLORE THE STUDIO</span><Link to="/contact" onClick={close}>Need help? <MessageCircle size={14} /></Link></div>{menus.map(item => <div className="an-mobile-category" key={item.id}><button aria-expanded={active === item.id} aria-controls={`an-mobile-${item.id}`} onClick={() => setActive(active === item.id ? null : item.id)}><span className="an-mobile-category-icon"><item.icon size={20} strokeWidth={1.5} /></span>{item.label}<ChevronDown size={16} className={active === item.id ? 'an-rotate' : ''} /></button>{active === item.id && <div className="an-mobile-links" id={`an-mobile-${item.id}`}><Link className="an-mobile-explore" to={item.path} onClick={close}>Explore all {item.label.toLowerCase()} <ArrowUpRight size={14} /></Link>{item.groups.map(group => <div key={group.title}><h3>{group.title}</h3>{group.links.map(([label, path, description]) => <Link key={label} to={path} onClick={close}><span>{label}<small>{description}</small></span><ArrowUpRight size={13} /></Link>)}</div>)}</div>}</div>)}<div className="an-mobile-footer"><Link to="/about" onClick={close}>Our studio <ArrowRight size={15} /></Link><Link to="/track-order" onClick={close}>Track my order <Truck size={16} /></Link></div></nav>}
    </header>
    {(menu || mobile) && <button type="button" className={`an-backdrop ${mobile ? 'an-backdrop-mobile' : ''}`} onClick={close} aria-label="Close navigation overlay" tabIndex={-1} />}
    {search && <Suspense fallback={null}><SearchCommandPalette isOpen={search} onClose={() => setSearch(false)} /></Suspense>}
  </>;
}
