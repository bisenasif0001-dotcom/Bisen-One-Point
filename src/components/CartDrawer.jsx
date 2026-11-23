import { useBusinessRules } from './BusinessRulesProvider';
import { couponCalculation } from '../data/businessRules';
import { SHIPPING_POLICY } from '../utils/shippingCalculator';
import SmartCrossSell from './SmartCrossSell';
import OrderItemPreview from './OrderItemPreview';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  CreditCard,
  ArrowRight,
  Tag,
  Check,
  Eye,
  Sparkles,
  Lock,
  Truck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import './CartDrawer.css';

const formatINR = (amount) => `₹${Math.round(Number(amount) || 0).toLocaleString('en-IN')}`;

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  discountCode,
  onApplyDiscount,
}) {
  const { rules } = useBusinessRules();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showCoupon, setShowCoupon] = useState(false);
  const [activeCustomisationItem, setActiveCustomisationItem] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (activeCustomisationItem) {
        setActiveCustomisationItem(null);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeCustomisationItem, onClose]);

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const coupon = couponCalculation({
    rules,
    code: discountCode,
    subtotal,
    items: cartItems.map((item) => ({
      ...item,
      discounted: item.type === 'birthday_card' && Number(item.configuration?.cardCount) > 1,
    })),
  });
  const discountAmount = coupon.error ? 0 : coupon.discountAmount;
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Free delivery progress calculations
  const hasA1 = cartItems.some((item) => item.size === 'A1');
  const hasFramed = cartItems.some(
    (item) => item.type === 'custom_frame' || item.type === 'gallery_wall' || Boolean(item.frameId)
  );
  const freeThreshold = hasFramed
    ? (rules?.shipping?.frameFreeThreshold ?? SHIPPING_POLICY.freeDeliveryThresholds.frames)
    : (rules?.shipping?.printFreeThreshold ?? SHIPPING_POLICY.freeDeliveryThresholds.printOnly);
  const remainingForFree = Math.max(0, freeThreshold - subtotal);
  const freeProgress = freeThreshold > 0 ? Math.min(100, Math.round((subtotal / freeThreshold) * 100)) : 100;
  const showProgressBar = cartItems.length > 0 && !hasA1;

  if (!isOpen) return null;

  // Coupon handling
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    const preview = couponCalculation({
      rules,
      code,
      subtotal,
      items: cartItems.map((item) => ({
        ...item,
        discounted: item.type === 'birthday_card' && Number(item.configuration?.cardCount) > 1,
      })),
    });
    if (preview.error) {
      setCouponError(preview.error);
      return;
    }
    onApplyDiscount(code, 0);
    setCouponError('');
    setShowCoupon(false);
  };

  const handleRemoveCoupon = () => {
    onApplyDiscount('', 0);
    setCouponInput('');
    setCouponError('');
  };

  return (
    <div className="cart-backdrop" onClick={onClose}>
      {/* Main Drawer Shell */}
      <div
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Editorial Header */}
        <div className="cart-header">
          <div className="cart-header__left">
            <div className="cart-header__icon" aria-hidden="true">
              <ShoppingBag size={17} strokeWidth={1.85} />
            </div>
            <div className="cart-header__title-row">
              <h3 className="cart-header__title">Your Shopping Bag</h3>
              <span className="cart-header__count">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={17} strokeWidth={2} />
          </button>
        </div>

        {/* 2. Free Delivery Progress & Studio Pickup Bar */}
        <div className="cart-delivery-bar">
          <div className="cart-delivery-bar__row">
            {showProgressBar ? (
              <span className={`cart-delivery-bar__msg ${remainingForFree === 0 ? 'is-unlocked' : ''}`}>
                {remainingForFree === 0 ? (
                  <>
                    <Check size={14} strokeWidth={2.4} />
                    <span>Free Delivery unlocked · Lucknow studio pickup also free</span>
                  </>
                ) : (
                  <>
                    <Truck size={14} strokeWidth={1.9} />
                    <span>
                      Add <strong>{formatINR(remainingForFree)}</strong> more for Free Delivery · Free studio pickup
                    </span>
                  </>
                )}
              </span>
            ) : (
              <span className="cart-delivery-bar__msg">
                <Truck size={14} strokeWidth={1.9} />
                <span>Free Lucknow studio pickup. Courier &amp; protective packaging quoted before payment.</span>
              </span>
            )}
            <Link to="/shipping" onClick={onClose} className="cart-delivery-bar__link">
              Delivery details
            </Link>
          </div>

          {showProgressBar && (
            <div className="cart-delivery-track" aria-hidden="true">
              <div
                className={`cart-delivery-fill ${remainingForFree === 0 ? 'is-unlocked' : ''}`}
                style={{ width: `${freeProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* 3. Main Scrollable Items Container */}
        <div className="cart-scroll">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">
                <ShoppingBag size={28} strokeWidth={1.6} />
              </div>
              <h4>Your bag is empty</h4>
              <p>
                Upload a photo to create a bespoke handcrafted frame, or discover our studio cards &amp; non-alcoholic itra.
              </p>
              <div className="cart-empty__actions">
                <Link
                  to="/custom-framing"
                  onClick={onClose}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.84rem',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  Create Custom Frame <ArrowRight size={15} />
                </Link>
                <Link
                  to="/frames-catalogue"
                  onClick={onClose}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.84rem',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    backgroundColor: '#fffefa',
                  }}
                >
                  Browse Frames &amp; Prints
                </Link>
              </div>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const isCustomProduct = Boolean(
                  item.personalisation ||
                  item.finish ||
                  item.size ||
                  item.type?.includes('custom') ||
                  item.type?.includes('frame') ||
                  item.type?.includes('card')
                );
                const isSetItem =
                  ((item.type === 'birthday_card' || item.type === 'pvc_card') && item.cardCount) ||
                  (item.type === 'gallery_wall' && item.frameCount);

                return (
                  <div key={item.id} className="cart-item-card">
                    {/* Unobstructed Item Thumbnail */}
                    <div className="cart-item-thumb">
                      <OrderItemPreview item={item} />
                    </div>

                    {/* Item Details */}
                    <div className="cart-item-body">
                      <div>
                        <div className="cart-item-head">
                          <div className="cart-item-title-wrap">
                            <h4 className="cart-item-title">{item.title}</h4>
                            {isCustomProduct && (
                              <span className="cart-bespoke-badge">Bespoke</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="cart-delete-btn"
                            onClick={() => onRemoveItem(item.id)}
                            aria-label={`Remove ${item.title}`}
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Personalisation Summary Specifications */}
                        <div className="cart-item-specs">
                          {item.size && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span className="cart-spec-muted">Size:</span>
                              <strong>{item.size}</strong>
                              {item.dimensions && <span className="cart-spec-muted">({item.dimensions})</span>}
                            </span>
                          )}

                          {item.finish && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span className="cart-spec-muted">Finish:</span>
                              <strong>{item.finish}</strong>
                            </span>
                          )}

                          {item.type === 'custom_frame' && item.orientation && (
                            <span>
                              Layout: <strong>{item.orientation}</strong> · {item.fit === 'cover' ? 'Fill opening' : 'Full photo'}
                            </span>
                          )}
                          {item.type === 'photo_prints' && item.printQuantity && (
                            <span>
                              <strong>
                                {item.photoCount} {item.photoCount === 1 ? 'photo' : 'photos'} × {item.copiesPerPhoto || 1} copies = {item.printQuantity} prints
                              </strong>{' '}
                              · {item.orientation || 'portrait'} · {item.border}
                            </span>
                          )}
                          {item.type === 'birthday_card' && item.cardCount && (
                            <span>
                              <strong>
                                {item.cardCount} {item.cardCount === 1 ? 'card' : 'cards'} per set
                              </strong>{' '}
                              · Folded card + envelope
                            </span>
                          )}
                          {item.type === 'pvc_card' && item.cardCount && (
                            <span>
                              <strong>
                                {item.cardCount} {item.cardCount === 1 ? 'card' : 'cards'} per set
                              </strong>
                              {item.unitPrice ? ` · ${formatINR(item.unitPrice)}/card` : ''}
                              {item.designFee ? ` + ${formatINR(item.designFee)} design` : ''}
                            </span>
                          )}
                          {item.type === 'gallery_wall' && item.configuration?.slots && (
                            <span>
                              <strong>{item.frameCount} frames per set</strong> · {item.photoCount} photos added
                              {item.photosPending ? ` · ${item.photosPending} to share` : ''}
                            </span>
                          )}
                          {item.type === 'dua_poster' && item.printPrice && item.framePrice && (
                            <span>
                              <span className="cart-spec-muted">Breakdown:</span>{' '}
                              <strong>
                                Poster {formatINR(item.printPrice)} + Frame {formatINR(item.framePrice)}
                              </strong>
                            </span>
                          )}

                          {item.volume && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span className="cart-spec-muted">Volume:</span>
                              <strong>{item.volume}</strong>
                              {item.alcoholFree && <span style={{ color: '#966e47', fontWeight: 500 }}>• Alcohol-Free</span>}
                            </span>
                          )}

                          {item.personalisation?.recipientName && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span className="cart-spec-muted">For:</span>
                              <strong>{item.personalisation.recipientName}</strong>
                            </span>
                          )}

                          {item.format && !item.dimensions && (
                            <span className="cart-spec-muted">{item.format}</span>
                          )}
                        </div>

                        {isCustomProduct && (
                          <div className="cart-customisation-trigger">
                            <button
                              type="button"
                              className="cart-customisation-btn"
                              onClick={() => setActiveCustomisationItem(item)}
                            >
                              <Eye size={12} />
                              <span>View Customisation</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Formatted Price */}
                      <div className="cart-item-footer">
                        <div className="cart-stepper">
                          <button
                            type="button"
                            className="cart-stepper__btn"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            aria-label={(item.type === 'birthday_card' || item.type === 'pvc_card') && item.cardCount ? 'Decrease card sets' : 'Decrease quantity'}
                          >
                            <Minus size={12} strokeWidth={2.2} />
                          </button>

                          <span className="cart-stepper__qty">
                            {item.quantity}
                            {isSetItem ? ` ${item.quantity === 1 ? 'set' : 'sets'}` : ''}
                          </span>

                          <button
                            type="button"
                            className="cart-stepper__btn"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label={(item.type === 'birthday_card' || item.type === 'pvc_card') && item.cardCount ? 'Increase card sets' : 'Increase quantity'}
                          >
                            <Plus size={12} strokeWidth={2.2} />
                          </button>
                        </div>

                        <div className="cart-item-price">
                          <span className="cart-item-price__main">
                            {formatINR(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="cart-item-price__unit">
                              ({formatINR(item.price)} {isSetItem ? 'per set' : 'each'})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <SmartCrossSell cartItems={cartItems} compact onNavigate={onClose} />
        </div>

        {/* 4. Compact Sticky Order Summary Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Collapsible Coupon Area */}
            <div className="cart-coupon-wrap">
              {discountCode ? (
                <div className="cart-coupon-applied">
                  <span className="cart-coupon-applied__left">
                    <Tag size={13} />
                    <span>
                      Coupon <strong>{discountCode}</strong> · {formatINR(discountAmount)} off
                    </span>
                  </span>
                  <button
                    type="button"
                    className="cart-coupon-remove"
                    onClick={handleRemoveCoupon}
                    aria-label="Remove coupon"
                    title="Remove coupon"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="cart-coupon-toggle"
                    aria-expanded={showCoupon}
                    onClick={() => {
                      setShowCoupon((prev) => !prev);
                      setCouponError('');
                    }}
                  >
                    <span className="cart-coupon-toggle__left">
                      <Tag size={13} />
                      <span>Have a studio coupon?</span>
                    </span>
                    {showCoupon ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showCoupon && (
                    <form onSubmit={handleApplyCoupon} className="cart-coupon-form">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="cart-coupon-input"
                        autoFocus
                      />
                      <button type="submit" className="cart-coupon-apply">
                        Apply
                      </button>
                    </form>
                  )}
                </>
              )}

              {couponError && <div className="cart-coupon-error">{couponError}</div>}
            </div>

            {/* Price Calculations Breakdown */}
            <div className="cart-summary">
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span style={{ color: '#1f392b', fontWeight: 600 }}>{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="cart-summary__row cart-summary__row--discount">
                  <span>Item discount</span>
                  <span>−{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="cart-summary__row">
                <span className="cart-summary__delivery-label">
                  <Truck size={13} color="#68786a" />
                  Delivery
                </span>
                <span className="cart-summary__delivery-val">
                  {hasA1
                    ? 'Free pickup · Porter / surface at checkout'
                    : hasFramed
                      ? remainingForFree === 0
                        ? 'Free delivery · Or studio pickup'
                        : `Free at ${formatINR(freeThreshold)}+ · Porter / Courier`
                      : remainingForFree === 0
                        ? 'Free delivery · Or studio pickup'
                        : `Free at ${formatINR(freeThreshold)}+ · From ${formatINR(rules?.shipping?.porterStarting ?? SHIPPING_POLICY.porterRates.print_only)}`}
                </span>
              </div>

              <div className="cart-summary__total">
                <span>{discountAmount > 0 ? 'Total after discount' : 'Estimated total'}</span>
                <span>{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Refined Dual Checkout Action Buttons */}
            <div className="cart-cta-grid">
              <button
                type="button"
                className="cart-btn-studio"
                onClick={() => onProceedCheckout('whatsapp')}
              >
                <MessageCircle size={16} />
                <span>Confirm with studio</span>
              </button>

              <button
                type="button"
                className="cart-btn-checkout"
                onClick={() => onProceedCheckout('online')}
              >
                <CreditCard size={16} />
                <span>Proceed to checkout</span>
              </button>
            </div>

            <div className="cart-security-note">
              <Lock size={12} />
              <span>Review your details before printing</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. "VIEW CUSTOMISATION" POPUP MODAL */}
      {activeCustomisationItem && (
        <div
          className="cart-modal-backdrop"
          onClick={() => setActiveCustomisationItem(null)}
        >
          <div
            className="cart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-modal__header">
              <div className="cart-modal__title-wrap">
                <Sparkles size={16} color="#966e47" />
                <h4 className="cart-modal__title">Customisation Details</h4>
              </div>
              <button
                type="button"
                className="cart-close-btn"
                onClick={() => setActiveCustomisationItem(null)}
                aria-label="Close customisation preview"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f7f5ec',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #d8e1d7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <OrderItemPreview item={activeCustomisationItem} />
              </div>

              {activeCustomisationItem.type === 'photo_prints' && activeCustomisationItem.photos?.length > 1 && (
                <div aria-label="All photos in this print batch" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                  {activeCustomisationItem.photos.map((photo, index) => (
                    <figure key={photo.assetId} style={{ margin: 0, width: 110, flexShrink: 0 }}>
                      <div style={{ height: 95, padding: 5, background: '#f4f5ed', border: '1px solid #e0e5d5', borderRadius: 4 }}>
                        <OrderItemPreview item={{ ...activeCustomisationItem, photos: [photo] }} />
                      </div>
                      <figcaption style={{ marginTop: 6, fontSize: 10, color: '#6c7e5b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {index + 1}. {photo.name}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}

              <div style={{ backgroundColor: '#f7f5ec', borderRadius: '8px', border: '1px solid #eceee4', padding: '0.85rem' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.02rem', fontWeight: 600, color: '#1f392b', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {activeCustomisationItem.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#44584c' }}>
                  {activeCustomisationItem.size && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5d6d5f' }}>Selected Size:</span>
                      <strong>
                        {activeCustomisationItem.size} {activeCustomisationItem.dimensions && `(${activeCustomisationItem.dimensions})`}
                      </strong>
                    </div>
                  )}

                  {activeCustomisationItem.finish && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5d6d5f' }}>
                        {activeCustomisationItem.type === 'photo_prints' ? 'Paper finish:' : 'Frame Finish:'}
                      </span>
                      <strong>{activeCustomisationItem.finish}</strong>
                    </div>
                  )}

                  {activeCustomisationItem.volume && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5d6d5f' }}>Fragrance Volume:</span>
                      <strong>{activeCustomisationItem.volume} (Pure Oil)</strong>
                    </div>
                  )}

                  {activeCustomisationItem.personalisation?.recipientName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5d6d5f' }}>Recipient:</span>
                      <strong>{activeCustomisationItem.personalisation.recipientName}</strong>
                    </div>
                  )}

                  {activeCustomisationItem.personalisation?.insideMessage && (
                    <div style={{ marginTop: '4px', borderTop: '1px dashed #d8e1d7', paddingTop: '6px' }}>
                      <span style={{ color: '#5d6d5f', display: 'block', marginBottom: '2px' }}>Printed Inscription:</span>
                      <p style={{ margin: 0, fontStyle: 'italic', color: '#1f392b', backgroundColor: '#fffefa', padding: '6px', borderRadius: '4px', border: '1px solid #d8e1d7' }}>
                        &ldquo;{activeCustomisationItem.personalisation.insideMessage}&rdquo;
                      </p>
                    </div>
                  )}

                  {activeCustomisationItem.type === 'birthday_card' && activeCustomisationItem.configuration && (
                    <>
                      <div><span>Front greeting: </span><strong>{activeCustomisationItem.personalisation.frontHeadline}</strong></div>
                      <div style={{ overflowWrap: 'anywhere' }}><span>Sign-off: </span><strong>{activeCustomisationItem.personalisation.senderName}</strong></div>
                      <div><strong>{activeCustomisationItem.cardCount} cards per set × {activeCustomisationItem.quantity} set(s)</strong> · An envelope for each card</div>
                      {activeCustomisationItem.configuration.includePhoto && (
                        <p style={{ margin: '5px 0', lineHeight: 1.6 }}>
                          Photo: {activeCustomisationItem.configuration.photo?.name}. Share the original photo with the studio when confirming your order.
                        </p>
                      )}
                    </>
                  )}

                  {activeCustomisationItem.type === 'pvc_card' && activeCustomisationItem.configuration && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span>Cards per set:</span>
                        <strong>{activeCustomisationItem.cardCount} {activeCustomisationItem.cardCount === 1 ? 'card' : 'cards'} × {activeCustomisationItem.quantity} set(s)</strong>
                      </div>
                      {activeCustomisationItem.unitPrice && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span>Rate per card:</span>
                          <strong>{formatINR(activeCustomisationItem.unitPrice)}{activeCustomisationItem.discountPercent ? ` (${activeCustomisationItem.discountPercent}% bulk off)` : ''}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span>Design option:</span>
                        <strong>{activeCustomisationItem.configuration.design === 'design' ? `Studio design (+${formatINR(activeCustomisationItem.designFee || 149)})` : 'Own design'}</strong>
                      </div>
                      {activeCustomisationItem.configuration.frontFileName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Front file:</span><strong>{activeCustomisationItem.configuration.frontFileName}</strong></div>
                      )}
                      {activeCustomisationItem.configuration.backFileName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Back file:</span><strong>{activeCustomisationItem.configuration.backFileName}</strong></div>
                      )}
                      {activeCustomisationItem.specialInstructions && (
                        <div style={{ borderTop: '1px solid #e0e5d6', paddingTop: 8 }}><span>Notes:</span><p style={{ margin: '5px 0 0', overflowWrap: 'anywhere' }}>{activeCustomisationItem.specialInstructions}</p></div>
                      )}
                    </>
                  )}

                  {activeCustomisationItem.type === 'dua_poster' && activeCustomisationItem.printPrice && activeCustomisationItem.framePrice && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ color: '#5d6d5f' }}>Poster print ({activeCustomisationItem.size}):</span>
                        <strong>{formatINR(activeCustomisationItem.printPrice)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ color: '#5d6d5f' }}>Frame ({activeCustomisationItem.size}):</span>
                        <strong>+ {formatINR(activeCustomisationItem.framePrice)}</strong>
                      </div>
                    </>
                  )}

                  {activeCustomisationItem.type === 'photo_prints' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Print batch:</span><strong>{activeCustomisationItem.photoCount} photos × {activeCustomisationItem.copiesPerPhoto || 1} copies = {activeCustomisationItem.printQuantity} prints</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Layout:</span><strong>{activeCustomisationItem.orientation} · {activeCustomisationItem.border}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Photo treatment:</span><strong>{activeCustomisationItem.cropMode} · {activeCustomisationItem.colorTone}</strong></div>
                      {activeCustomisationItem.specialInstructions && (
                        <div style={{ borderTop: '1px solid #e0e5d6', paddingTop: 8 }}><span>Studio note:</span><p style={{ margin: '5px 0 0', overflowWrap: 'anywhere' }}>{activeCustomisationItem.specialInstructions}</p></div>
                      )}
                    </>
                  )}

                  {activeCustomisationItem.type === 'gallery_wall' && activeCustomisationItem.configuration?.slots && (
                    <>
                      <div><strong>{activeCustomisationItem.frameCount} frames per set · {activeCustomisationItem.photoCount} photos added · {activeCustomisationItem.photosPending} to share</strong></div>
                      <div>Presentation: {activeCustomisationItem.configuration.tone === 'mono' ? 'Black & white' : 'Original colour'} · Mount as shown in the selected frame</div>
                      {activeCustomisationItem.configuration.slots.map((slot, index) => (
                        <div key={index} style={{ display: 'flex', gap: 10, padding: '7px 0', borderTop: '1px solid #d8e1d7', alignItems: 'center' }}>
                          {slot.photo && <img src={slot.photo.url} alt={`Photo for frame ${index + 1}`} style={{ height: 45, width: 40, objectFit: 'contain', background: '#fffefa', flexShrink: 0 }} />}
                          <span style={{ overflowWrap: 'anywhere', lineHeight: 1.7 }}>
                            <strong>Frame {index + 1} · {slot.label} · {slot.sizeId} {slot.orientation}</strong>
                            <br />
                            {slot.photo?.name || 'Photo to be shared with the studio'} · {slot.fit === 'cover' ? 'Fill opening' : 'Full photo'} · crop {slot.panX}% / {slot.panY}%
                          </span>
                        </div>
                      ))}
                      <p style={{ lineHeight: 1.7 }}>Share original files with the studio before printing. Hanging template included.</p>
                    </>
                  )}

                  {activeCustomisationItem.type === 'custom_frame' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d8e1d7', paddingTop: '6px', marginTop: '4px' }}>
                        <span style={{ color: '#5d6d5f' }}>Glazing &amp; Protection:</span>
                        <span>2mm Cast Optical Acrylic (UV 92%)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#5d6d5f' }}>Hanging Hardware:</span>
                        <span>Pre-installed Dual Brass D-Rings</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="cart-btn-checkout"
                style={{ width: '100%' }}
                onClick={() => setActiveCustomisationItem(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
