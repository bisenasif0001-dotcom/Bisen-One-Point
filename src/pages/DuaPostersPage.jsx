import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Frame, Image, Search, X } from 'lucide-react';
import { DUA_POSTERS, DUA_CATEGORIES } from '../data/duaPosters';
import { DUA_PRINT_PRICES } from '../data/duaPricing';
import { getVerseSelection, verseCollectionPath } from '../data/islamicArt';
import DuaPosterCustomizer from '../components/DuaPosterCustomizer';
import './DuaPosters.css';

export function DuaPosterCollection() {
  const [category, setCategory] = useState('All posters');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('collection');
  const filtered = DUA_POSTERS.filter(p => (category === 'All posters' || p.category === category) && `${p.title} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const products = sort === 'az' ? [...filtered].sort((a, b) => a.title.localeCompare(b.title)) : filtered;
  return <div className="dua-collection">
    <div className="dua-intro"><div><span className="dua-eyebrow">THE DUA POSTER COLLECTION</span><h2>Words of faith. Beautifully displayed.</h2><p>Explore {DUA_POSTERS.length} original designs with Arabic text, transliteration and English translation. Choose a framed poster or a print without frame, in the size that suits your space. Print-only: 250 GSM glossy, A3 ₹85 + delivery.</p></div><div className="dua-options-note"><span><Frame size={17} /> With frame / Without frame</span><span><Image size={17} /> A5 · A4 · A3 · A2 · A1 · Custom</span></div></div>
    <div className="dua-category-filters" aria-label="Poster categories">{DUA_CATEGORIES.map(c => <button key={c} aria-pressed={category === c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}<span>{c === 'All posters' ? DUA_POSTERS.length : DUA_POSTERS.filter(p => p.category === c).length}</span></button>)}</div>
    <div className="dua-toolbar"><label className="dua-search"><Search size={17} /><input aria-label="Search dua posters" placeholder="Search a dua or topic…" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}</label><span role="status">{products.length} {products.length === 1 ? 'design' : 'designs'}</span><label>Sort: <select value={sort} onChange={e => setSort(e.target.value)}><option value="collection">Collection order</option><option value="az">Name: A–Z</option></select></label></div>
    {products.length ? <div className="dua-grid">{products.map(p => <Link className="dua-card" to={`/dua-posters/${p.id}`} key={p.id}><div className="dua-card-art"><img src={p.thumbnail} alt={p.title + ' dua poster design'} loading="lazy" width="420" height="594" /><span>VIEW DESIGN <ArrowUpRight size={13} /></span></div><span className="dua-card-category">{p.category}</span><h3>{p.title}</h3><p>With or without frame · All sizes</p><span className="dua-card-price">Print only from ₹{DUA_PRINT_PRICES.A5} <small>+ delivery</small></span><div className="dua-card-cta">Choose size & finish <ArrowUpRight size={16} /></div></Link>)}</div> : <div className="dua-empty"><h3>No posters match your search.</h3><button onClick={() => { setQuery(''); setCategory('All posters'); }}>Show all posters</button></div>}
    <aside className="dua-bulk"><div><h3>Building a prayer corner or ordering a set?</h3><p>Mix your favourite designs, choose matching frames and ask us for a custom quote.</p></div><Link to="/printing-services?service=Dua%20posters">Ask about a custom order <ArrowUpRight size={17} /></Link></aside>
  </div>;
}

export default function DuaPostersPage() {
  return <div className="dua-page"><div className="dua-page-heading"><Link to="/islamic-art">Dua & wall art <ArrowUpRight size={14} /></Link><h1>The Dua Collection</h1><p>Meaningful designs for your home, prayer space or a thoughtful gift.</p></div><DuaPosterCollection /></div>;
}

export function DuaPosterDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const requestedFrame = params.get('frame');
  const requestedFormat = params.get('format');
  const requestedSize = params.get('size');
  const poster = DUA_POSTERS.find(p => p.id === id);
  if (!poster) return <div className="dua-page-heading"><h1>Poster not found</h1><Link to="/dua-posters">Explore all dua posters</Link></div>;
  const returnToVerses = params.get('from') === 'verses';
  return <DuaPosterCustomizer key={`${id}-${requestedFrame}-${requestedFormat}-${requestedSize}-${returnToVerses}`} poster={poster} initialFrame={requestedFrame} initialFormat={requestedFormat} initialSize={requestedSize} collectionPath={returnToVerses ? verseCollectionPath(getVerseSelection(params)) : '/dua-posters'} collectionLabel={returnToVerses ? 'Verse collection' : 'All dua posters'} />;
}
