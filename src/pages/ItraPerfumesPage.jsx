import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Droplet,
  Eye,
  Gift,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { getWhatsAppUrl } from '../data/businessConfig';
import { ITRA_CATEGORIES, ITRA_PRODUCTS } from '../data/itraProducts';
import { usePriceOverrides } from '../components/BusinessRulesProvider';
import { getItraProductPrice } from '../utils/priceRegistry';
import './ItraPerfumesPage.css';

const formatInr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function ItraPerfumesPage({ onAddToCart }) {
  const priceOverrides = usePriceOverrides();
  const [activeCategory, setActiveCategory] = useState('All Itra');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('collection');
  const [cardSizes, setCardSizes] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalSelectedSize, setModalSelectedSize] = useState('6ml');
  const [addedToastId, setAddedToastId] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = event => {
      if (event.key === 'Escape') setSelectedProduct(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProduct]);

  const itraPrice = (product, volume) =>
    priceOverrides?.itraPrices?.[product.id]?.[volume] ??
    getItraProductPrice(product.id, volume) ??
    product.prices?.[volume] ??
    product.price;

  const getActiveCardSize = product =>
    cardSizes[product.id] || product.defaultSize || Object.keys(product.prices)[0];

  const categoryCount = cat =>
    cat === 'All Itra'
      ? ITRA_PRODUCTS.length
      : ITRA_PRODUCTS.filter(item => item.category === cat).length;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = ITRA_PRODUCTS.filter(product => {
    const matchesCategory = activeCategory === 'All Itra' || product.category === activeCategory;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    const haystack = [
      product.name,
      product.family,
      product.character,
      product.bestFor,
      product.topNotes,
      product.heartNotes,
      product.baseNotes,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const sortedProducts = sortBy === 'collection'
    ? filteredProducts
    : [...filteredProducts].sort((a, b) => {
        const priceA = itraPrice(a, a.defaultSize || Object.keys(a.prices)[0]);
        const priceB = itraPrice(b, b.defaultSize || Object.keys(b.prices)[0]);
        return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
      });

  const openProductModal = product => {
    setSelectedProduct(product);
    setModalSelectedSize(getActiveCardSize(product));
  };

  const triggerAddedFeedback = productId => {
    setAddedToastId(productId);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setAddedToastId(null), 2400);
  };

  const handleQuickAdd = product => {
    if (!onAddToCart) return;
    const targetSize = getActiveCardSize(product);
    const targetPrice = itraPrice(product, targetSize);

    onAddToCart({
      id: `itra-${product.id}-${targetSize}`,
      type: 'itra_perfume',
      productId: product.id,
      title: `${product.name} (${targetSize})`,
      subTitle: product.family,
      volume: targetSize,
      price: targetPrice,
      quantity: 1,
      image: product.image,
      alcoholFree: true,
    });

    triggerAddedFeedback(product.id);
  };

  const handleModalAdd = (isSample = false) => {
    if (!selectedProduct || !onAddToCart) return;
    const size = isSample ? '3ml' : modalSelectedSize;
    const price = isSample
      ? (itraPrice(selectedProduct, '3ml') ?? selectedProduct.samplePrice)
      : itraPrice(selectedProduct, size);

    onAddToCart({
      id: `itra-${selectedProduct.id}-${size}`,
      type: 'itra_perfume',
      productId: selectedProduct.id,
      title: `${selectedProduct.name} (${size})`,
      subTitle: selectedProduct.family,
      volume: size,
      price,
      quantity: 1,
      image: selectedProduct.image,
      alcoholFree: true,
    });

    triggerAddedFeedback(selectedProduct.id);
    setSelectedProduct(null);
  };

  return (
    <div className="itra-page">
      <div className="itra-container">
        <nav className="itra-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>The studio</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span className="itra-breadcrumb-current" aria-current="page">
            The Itra House
          </span>
        </nav>

        <header className="itra-header">
          <div className="itra-header-main">
            <span className="itra-eyebrow">
              <Droplet size={13} aria-hidden="true" />
              <span>THE ITRA HOUSE / BISEN</span>
            </span>
            <h1>
              Pure oils distilled for <em>memory.</em>
            </h1>
            <p className="itra-intro-copy">
              Traditional concentrated perfume oils distilled in Kannauj, Taif, and Assam. 100%
              uncut and free from alcohol or synthetic fillers — bottled in cut crystal with glass
              applicators.
            </p>
          </div>

          <aside className="itra-intro-note">
            <div className="itra-intro-note-head">
              <Sparkles size={17} aria-hidden="true" />
              <span>Atelier Craft &amp; Sampling</span>
            </div>
            <ul className="itra-intro-facts">
              <li>100% pure alcohol-free attar oils</li>
              <li>3ml discovery flacons &amp; velvety gift coffrets</li>
              <li>Rigid presentation box included with every order</li>
            </ul>
            <Link to="/gift-sets" className="itra-intro-link">
              <Gift size={14} aria-hidden="true" />
              <span>Explore curated gift sets</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </aside>
        </header>

        <div className="itra-controls">
          <div className="itra-filter-pills" role="group" aria-label="Filter fragrances by category">
            {ITRA_CATEGORIES.map(category => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                >
                  <span>{category}</span>
                  <span>{categoryCount(category)}</span>
                </button>
              );
            })}
          </div>

          <div className="itra-toolbar">
            <label className="itra-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                aria-label="Search fragrances, notes or occasions"
                placeholder="Search oud, rose, musk, or gifting…"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear fragrance search"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </label>

            <span className="itra-result-count" role="status">
              Showing {sortedProducts.length}{' '}
              {sortedProducts.length === 1 ? 'fragrance' : 'fragrances'}
            </span>

            <label className="itra-sort">
              <span>Sort:</span>
              <select
                aria-label="Sort fragrances"
                value={sortBy}
                onChange={event => setSortBy(event.target.value)}
              >
                <option value="collection">Collection order</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        {sortedProducts.length ? (
          <section aria-label="Itra collection">
            <div className="itra-grid">
              {sortedProducts.map(product => {
                const activeSize = getActiveCardSize(product);
                const livePrice = itraPrice(product, activeSize);
                const sizeKeys = Object.keys(product.prices);
                const isAdded = addedToastId === product.id;

                return (
                  <article className="itra-card" key={product.id}>
                    <div className="itra-card-media">
                      <Link
                        to={`/itra-perfumes/${product.id}`}
                        className="itra-card-image-link"
                        aria-label={`View ${product.name}`}
                      >
                        <img src={product.image} alt={product.name} loading="lazy" />
                      </Link>
                      <span className="itra-cat-badge">{product.category}</span>
                      <button
                        type="button"
                        className="itra-quick-pill"
                        onClick={() => openProductModal(product)}
                        aria-label={`Quick view notes for ${product.name}`}
                      >
                        <Eye size={13} aria-hidden="true" />
                        <span>Notes &amp; details</span>
                      </button>
                    </div>

                    <div className="itra-card-body">
                      <div className="itra-card-family">{product.family}</div>
                      <h3 className="itra-card-title">
                        <Link to={`/itra-perfumes/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="itra-card-character">{product.character}</p>

                      <div
                        className="itra-size-pills"
                        role="group"
                        aria-label={`Select volume for ${product.name}`}
                      >
                        {sizeKeys.map(sizeKey => (
                          <button
                            key={sizeKey}
                            type="button"
                            aria-pressed={activeSize === sizeKey}
                            onClick={() =>
                              setCardSizes(prev => ({ ...prev, [product.id]: sizeKey }))
                            }
                          >
                            {sizeKey}
                          </button>
                        ))}
                      </div>

                      <div className="itra-card-footer">
                        <div className="itra-card-price-row">
                          <span className="itra-card-vol-label">Volume: {activeSize}</span>
                          <span className="itra-card-price">{formatInr(livePrice)}</span>
                        </div>

                        <div className="itra-card-actions">
                          <button
                            type="button"
                            className={`itra-add-btn ${isAdded ? 'is-added' : ''}`}
                            onClick={() => handleQuickAdd(product)}
                          >
                            {isAdded ? (
                              <>
                                <Check size={15} aria-hidden="true" />
                                <span>Added to bag</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={15} aria-hidden="true" />
                                <span>Add to bag</span>
                              </>
                            )}
                          </button>

                          <Link
                            to={`/itra-perfumes/${product.id}`}
                            className="itra-detail-link"
                            aria-label={`Open full fragrance page for ${product.name}`}
                            title="Full fragrance page"
                          >
                            <ArrowUpRight size={16} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="itra-empty">
            <h3>No fragrances match your selection.</h3>
            <p>Try searching by note (oud, rose, musk) or clear your active filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All Itra');
              }}
            >
              Show all {ITRA_PRODUCTS.length} fragrances
            </button>
          </div>
        )}

        <aside className="itra-atelier-banner" aria-label="Custom fragrance gifting">
          <div className="itra-atelier-copy">
            <span className="itra-eyebrow">BESPOKE WEDDING &amp; FESTIVE COFFRETS</span>
            <h2>Curating favours, Nikah hampers or custom scent pairings?</h2>
            <p>
              Pair crystal itra flacons with personalised framing or brass-foiled milestone cards.
              Message our Lucknow workshop for custom gift boxing and bulk quantities.
            </p>
          </div>
          <div className="itra-atelier-actions">
            <a
              href={getWhatsAppUrl('Hello! I would like to enquire about custom itra gift hampers.')}
              target="_blank"
              rel="noopener noreferrer"
              className="itra-btn-evergreen"
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>WhatsApp Studio</span>
            </a>
            <Link to="/gift-sets" className="itra-btn-outline">
              <span>Explore Gift Sets</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>

      {selectedProduct && (
        <div
          className="itra-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="itra-modal-title"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="itra-modal" onClick={event => event.stopPropagation()}>
            <div className="itra-modal-media">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
              <span className="itra-cat-badge">{selectedProduct.category}</span>
            </div>

            <div className="itra-modal-body">
              <div className="itra-modal-top">
                <span className="itra-eyebrow">{selectedProduct.family}</span>
                <button
                  type="button"
                  className="itra-modal-close"
                  aria-label="Close fragrance details"
                  onClick={() => setSelectedProduct(null)}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <h2 id="itra-modal-title">{selectedProduct.name}</h2>

              <div className="itra-modal-facts">
                <div>
                  <strong>Character:</strong> {selectedProduct.character}
                </div>
                <div>
                  <strong>Best for:</strong> {selectedProduct.bestFor}
                </div>
              </div>

              <div className="itra-modal-pyramid">
                <div className="itra-modal-pyramid-label">Olfactory Notes</div>
                <div className="itra-modal-pyramid-list">
                  <div>
                    <strong>Top:</strong> {selectedProduct.topNotes}
                  </div>
                  <div>
                    <strong>Heart:</strong> {selectedProduct.heartNotes}
                  </div>
                  <div>
                    <strong>Base:</strong> {selectedProduct.baseNotes}
                  </div>
                </div>
              </div>

              <p className="itra-modal-apply">
                <strong>How to apply:</strong> {selectedProduct.howToApply}
              </p>

              <div>
                <div className="itra-modal-sizes-label">Choose volume</div>
                <div className="itra-modal-sizes" role="group" aria-label="Choose bottle volume">
                  {Object.keys(selectedProduct.prices).map(sizeKey => (
                    <button
                      key={sizeKey}
                      type="button"
                      aria-pressed={modalSelectedSize === sizeKey}
                      onClick={() => setModalSelectedSize(sizeKey)}
                    >
                      {sizeKey} — {formatInr(itraPrice(selectedProduct, sizeKey))}
                    </button>
                  ))}
                </div>
              </div>

              <div className="itra-modal-actions">
                <button
                  type="button"
                  className="itra-modal-primary"
                  onClick={() => handleModalAdd(false)}
                >
                  <ShoppingBag size={16} aria-hidden="true" />
                  <span>
                    ADD TO BAG — {formatInr(itraPrice(selectedProduct, modalSelectedSize))}
                  </span>
                </button>

                {selectedProduct.samplePrice && (
                  <button
                    type="button"
                    className="itra-modal-secondary"
                    onClick={() => handleModalAdd(true)}
                  >
                    <Droplet size={15} aria-hidden="true" />
                    <span>
                      ADD DISCOVERY SAMPLE (3ml —{' '}
                      {formatInr(itraPrice(selectedProduct, '3ml') ?? selectedProduct.samplePrice)}
                      )
                    </span>
                  </button>
                )}

                <Link
                  to={`/itra-perfumes/${selectedProduct.id}`}
                  className="itra-modal-link"
                  onClick={() => setSelectedProduct(null)}
                >
                  <span>View full fragrance page &amp; notes</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
