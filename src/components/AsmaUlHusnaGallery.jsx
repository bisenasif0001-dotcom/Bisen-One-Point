import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { ASMA_UL_HUSNA_ITEMS, ASMA_UL_HUSNA_COUNT } from '../data/asmaUlHusnaData';
import { asmaArtworkImage, asmaArtworkPath, asmaArtworkPrice } from '../utils/asmaArtwork';
import { resolveAssetUrl } from '../utils/assetUrl';
import './AsmaUlHusnaGallery.css';

const filters = [
  { id: 'all', label: 'All designs', matches: () => true },
  { id: 'bestsellers', label: 'Bestsellers', matches: item => item.isBestseller },
  { id: 'mercy', label: 'Mercy & peace', matches: item => /rahman|raheem|salaam|lateef|wadood|ghaffar|ghafoor/i.test(item.title) },
  { id: 'power', label: 'Majesty & power', matches: item => /malik|azeez|jabbar|mutakabbir|qahhar|qawiyy|mateen/i.test(item.title) },
];

const normalize = value => value.toLowerCase().normalize('NFKD').replace(/[\p{M}'’]/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export default function AsmaUlHusnaGallery() {
  const [query, setQuery] = useState('');
  const [filterId, setFilterId] = useState('all');
  const filter = filters.find(option => option.id === filterId);
  const search = normalize(query);
  const results = ASMA_UL_HUSNA_ITEMS.filter(item => filter.matches(item) &&
    normalize([item.displayNumber, item.title, item.arabicTitle, item.meaning].join(' ')).includes(search));

  return <div className="anh-collection">
    <div className="anh-heading">
      <h2>Names of Allah</h2>
      <p>Choose a design to preview frame finishes, print sizes and pricing.</p>
    </div>
    <div className="anh-toolbar">
      <div className="anh-search">
        <Search size={18} aria-hidden="true" />
        <input type="search" aria-label="Search Names of Allah" placeholder="Search by name, meaning or number" value={query} onChange={event => setQuery(event.target.value)} />
        {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={17} /></button>}
      </div>
      <div className="anh-filters" aria-label="Filter artworks">
        {filters.map(({ id, label }) => <button type="button" key={id} aria-pressed={filterId === id} onClick={() => setFilterId(id)}>{label}</button>)}
      </div>
      <p className="anh-count" role="status">{results.length} of {ASMA_UL_HUSNA_COUNT} designs</p>
    </div>
    {results.length > 0 ? <div className="anh-grid">
      {results.map(item => <Link className="anh-card" to={asmaArtworkPath(item)} key={item.id}>
        <div className="anh-art">
          <span className="anh-number">#{item.displayNumber}</span>
          <img src={resolveAssetUrl(asmaArtworkImage(item))} alt={item.title + ' calligraphy'} loading="lazy" decoding="async" />
        </div>
        <div className="anh-copy">
          <div className="anh-title"><h3>{item.title}</h3><span lang="ar" dir="rtl">{item.arabicTitle}</span></div>
          <p>{item.meaning}</p>
          <div className="anh-action"><span>Print from ₹{asmaArtworkPrice(item, 'print', 'A5')}</span><strong>Choose options <ArrowUpRight size={15} /></strong></div>
        </div>
      </Link>)}
    </div> : <div className="anh-empty">
      <h3>No matching designs</h3>
      <button type="button" onClick={() => { setQuery(''); setFilterId('all'); }}>Show all designs</button>
    </div>}
  </div>;
}
