import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Clock,
  Compass,
  Droplets,
  Gift,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { ITRA_PRODUCTS } from '../data/itraProducts';
import { ITRA_PHOTOGRAPHY_SYSTEM } from '../data/photographySystem';
import NotFoundPage from './NotFoundPage';
import SmartCrossSell from '../components/SmartCrossSell';
import { usePriceOverrides } from '../components/BusinessRulesProvider';
import { getItraProductPrice } from '../utils/priceRegistry';
import './ItraPerfumesPage.css';

const formatInr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function ItraProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const priceOverrides = usePriceOverrides();

  const foundProduct = ITRA_PRODUCTS.find(item => item.id === id);
  const product = foundProduct || ITRA_PRODUCTS[0];
  const sizeOptions = Object.entries(product.prices).map(([size, defaultPrice]) => ({
    size,
    price:
      priceOverrides?.itraPrices?.[product.id]?.[size] ??
      getItraProductPrice(product.id, size) ??
      defaultPrice,
    label: size.includes('×') ? `${size} set` : `${size} Perfume Oil`,
  }));

  const [selectedSizeKey, setSelectedSizeKey] = useState(product.defaultSize);
  const selectedSize = sizeOptions.find(option => option.size === selectedSizeKey) || sizeOptions[0];
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const toastTimerRef = useRef(null);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  if (!foundProduct) return <NotFoundPage />;

  const galleryImages = ITRA_PHOTOGRAPHY_SYSTEM.map(shot =>
    shot.id === 'bottle-front' ? { ...shot, url: product.image } : { ...shot, url: shot.image },
  );

  const currentPrice = selectedSize.price * quantity;

  const handleAddToBag = (sizeObj = selectedSize, qty = quantity) => {
    if (!onAddToCart) return;

    onAddToCart({
      id: `itra-${product.id}-${sizeObj.size}`,
      type: 'itra_perfume',
      productId: product.id,
      title: `${product.name} (${sizeObj.size})`,
      subTitle: `${sizeObj.size} Pure Perfume Oil • ${product.family}`,
      volume: sizeObj.size,
      price: sizeObj.price,
      quantity: qty,
      image: product.image,
      alcoholFree: true,
    });

    setAddedToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setAddedToast(false), 2400);
  };

  return (
    <div className="itra-pdp-page">
      <div className="itra-container">
        <nav className="itra-breadcrumb" aria-label="Breadcrumb">
          <Link to="/itra-perfumes">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>The Itra Collection</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span className="itra-breadcrumb-current" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="itra-pdp-split">
          <div className="itra-pdp-gallery">
            <div className="itra-pdp-stage">
              <img
                src={galleryImages[activeImageIndex].url}
                alt={`${product.name} - ${galleryImages[activeImageIndex].label}`}
              />
              <div className="itra-pdp-badge-top">100% Pure Attar · Alcohol Free</div>
              <div className="itra-pdp-badge-bottom">
                <Clock size={13} aria-hidden="true" />
                <span>18+ Hours Longevity on Skin</span>
              </div>
            </div>

            <div className="itra-pdp-thumbs" role="group" aria-label="Product angle views">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  className="itra-pdp-thumb"
                  aria-pressed={activeImageIndex === idx}
                  title={img.desc}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img.url} alt={img.label} />
                  <span>{img.shortLabel || img.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="itra-pdp-info">
            <div>
              <div className="itra-pdp-meta-line">
                <span className="itra-eyebrow">{product.family}</span>
                <span className="itra-pdp-dot" aria-hidden="true">•</span>
                <span className="itra-pdp-meta-sub">Artisanal Extraction</span>
              </div>

              <h1>{product.name}</h1>

              <p className="itra-pdp-character">
                &ldquo;{product.character} — crafted for those who value quiet distinction.&rdquo;
              </p>

              <div className="itra-pdp-price-line">
                <span className="itra-pdp-price-main">{formatInr(currentPrice)}</span>
                {quantity > 1 && (
                  <span className="itra-pdp-price-sub">({formatInr(selectedSize.price)} each)</span>
                )}
                <span className="itra-pdp-price-sub">
                  Includes rigid presentation box, velvet pouch &amp; taxes
                </span>
              </div>
            </div>

            <div>
              <span className="itra-pdp-field-label">
                Select Flacon Volume: <span>{selectedSize.label}</span>
              </span>
              <div className="itra-pdp-volumes" role="group" aria-label="Select bottle volume">
                {sizeOptions.map(sz => (
                  <button
                    key={sz.size}
                    type="button"
                    className="itra-pdp-volume-btn"
                    aria-pressed={selectedSize.size === sz.size}
                    onClick={() => setSelectedSizeKey(sz.size)}
                  >
                    <div className="itra-pdp-volume-size">{sz.size}</div>
                    <div className="itra-pdp-volume-price">{formatInr(sz.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="itra-pdp-qty-row">
              <span className="itra-pdp-field-label">Quantity:</span>
              <div className="itra-pdp-stepper">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(current => Math.max(1, current - 1))}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(current => current + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="itra-pdp-cta-stack">
              <button
                type="button"
                className={`itra-pdp-add-btn ${addedToast ? 'is-added' : ''}`}
                onClick={() => handleAddToBag(selectedSize, quantity)}
              >
                {addedToast ? (
                  <>
                    <Check size={17} aria-hidden="true" />
                    <span>ADDED TO BAG · {formatInr(currentPrice)}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={17} aria-hidden="true" />
                    <span>ADD TO BAG · {formatInr(currentPrice)}</span>
                  </>
                )}
              </button>

              {addedToast && (
                <div className="itra-pdp-toast" role="status">
                  <Check size={15} aria-hidden="true" />
                  <span>Added to your shopping bag!</span>
                </div>
              )}

              {product.prices['3ml'] && selectedSize.size !== '3ml' && (
                <button
                  type="button"
                  className="itra-pdp-sample-btn"
                  onClick={() => handleAddToBag(sizeOptions[0], 1)}
                >
                  <Droplets size={15} aria-hidden="true" />
                  <span>Not sure? Add 3ml Discovery Sample ({formatInr(sizeOptions[0].price)})</span>
                </button>
              )}
            </div>

            <div className="itra-pdp-guarantees">
              <div>
                <Droplets size={15} aria-hidden="true" />
                <span>100% Pure Oil Attar</span>
              </div>
              <div>
                <ShieldCheck size={15} aria-hidden="true" />
                <span>Zero Alcohol · Undiluted</span>
              </div>
              <div>
                <Gift size={15} aria-hidden="true" />
                <span>Rigid Presentation Box</span>
              </div>
            </div>
          </div>
        </div>

        <div className="itra-pdp-overview-wrap">
          <div className="itra-pdp-overview">
            <div className="itra-pdp-overview-head">
              <span className="itra-eyebrow">Olfactive Composition</span>
              <h2>Fragrance Overview</h2>
            </div>

            <div className="itra-pdp-profile">
              <div className="itra-pdp-section-kicker">Character Profile</div>
              <div className="itra-pdp-profile-value">
                {product.family} · {product.character}
              </div>
            </div>

            <div>
              <div className="itra-pdp-section-kicker">Fragrance Notes</div>
              <div className="itra-pdp-notes-grid">
                <div className="itra-pdp-note-card">
                  <div className="itra-pdp-note-step">01 · Top Notes (First 30 Mins)</div>
                  <div className="itra-pdp-note-text">{product.topNotes}</div>
                </div>
                <div className="itra-pdp-note-card">
                  <div className="itra-pdp-note-step">02 · Heart Notes (2 to 8 Hours)</div>
                  <div className="itra-pdp-note-text">{product.heartNotes}</div>
                </div>
                <div className="itra-pdp-note-card">
                  <div className="itra-pdp-note-step">03 · Base Notes (8 to 18+ Hours)</div>
                  <div className="itra-pdp-note-text">{product.baseNotes}</div>
                </div>
              </div>
            </div>

            <div className="itra-pdp-pillars">
              <div>
                <div className="itra-pdp-pillar-head">
                  <Compass size={15} aria-hidden="true" />
                  <span>When To Wear</span>
                </div>
                <p>
                  {product.bestFor}. Its rich warmth unfolds beautifully during cooler evenings and
                  formal gatherings.
                </p>
              </div>

              <div>
                <div className="itra-pdp-pillar-head">
                  <Droplets size={15} aria-hidden="true" />
                  <span>How To Apply</span>
                </div>
                <p>{product.howToApply}</p>
              </div>

              <div>
                <div className="itra-pdp-pillar-head">
                  <Gift size={15} aria-hidden="true" />
                  <span>Gifting</span>
                </div>
                <p>
                  Arrives in a rigid presentation hard-box with a soft velvet travel pouch. An
                  exquisite standalone gift or paired alongside a custom frame.
                </p>
              </div>
            </div>
          </div>

          <div className="itra-pdp-cross-sell">
            <SmartCrossSell sourceContext="itra" onAddToCart={onAddToCart} />
          </div>
        </div>
      </div>

      <div className="itra-pdp-mobile-bar">
        <div>
          <div className="itra-pdp-mobile-price">{formatInr(currentPrice)}</div>
          <div className="itra-pdp-mobile-meta">
            {product.name.split(' ')[0]} · {selectedSize.size}
          </div>
        </div>

        <button
          type="button"
          className="itra-pdp-mobile-cta"
          onClick={() => handleAddToBag(selectedSize, quantity)}
        >
          <ShoppingBag size={15} aria-hidden="true" />
          <span>ADD TO BAG</span>
        </button>
      </div>
    </div>
  );
}
