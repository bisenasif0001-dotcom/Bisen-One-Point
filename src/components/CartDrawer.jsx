import { useBusinessRules } from './BusinessRulesProvider';
import { couponCalculation } from '../data/businessRules';
import SmartCrossSell from './SmartCrossSell';
import OrderItemPreview from './OrderItemPreview';
import React, { useState } from 'react';
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
  ShieldCheck,
  Check,
  Eye,
  Gift,
  Sparkles,
  Maximize2,
  Lock,
  Truck
} from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  discountCode,
  onApplyDiscount
}) {
  const { rules } = useBusinessRules();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [activeCustomisationItem, setActiveCustomisationItem] = useState(null);

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const coupon = couponCalculation({rules,code:discountCode,subtotal,items:cartItems.map(item=>({...item,discounted:item.type==='birthday_card'&&Number(item.configuration?.cardCount)>1}))});
  const discountAmount = coupon.error ? 0 : coupon.discountAmount;
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (!isOpen) return null;

  // Coupon handling
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    const preview=couponCalculation({rules,code,subtotal,items:cartItems.map(item=>({...item,discounted:item.type==='birthday_card'&&Number(item.configuration?.cardCount)>1}))});
    if(preview.error){setCouponError(preview.error);return;}
    onApplyDiscount(code,0);setCouponError('');

  };


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(24, 24, 23, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'cartBackdropFade 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes cartBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cartSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .cart-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .cart-scroll::-webkit-scrollbar-track {
          background: #FAF8F5;
        }
        .cart-scroll::-webkit-scrollbar-thumb {
          background: #D9D5CC;
          border-radius: 4px;
        }
        .cart-item-card {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .cart-item-card:hover {
          border-color: #D6D0C4 !important;
        }
        .cross-sell-add-btn:hover {
          background-color: #181817 !important;
          color: #FFFFFF !important;
          border-color: #181817 !important;
        }
      `}</style>

      {/* Main Drawer Shell */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100vh',
          backgroundColor: '#FAF8F5',
          borderLeft: '1px solid #E6E2D8',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'cartSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 1. Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #EDE8E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#F5F3EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9B7A50'
              }}
            >
              <ShoppingBag size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 650, color: '#181817', margin: 0, letterSpacing: '-0.01em' }}>
                Your Shopping Bag
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#706E6B' }}>
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your cart
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close cart"
            style={{
              background: '#F5F3EE',
              border: '1px solid #E6E2D8',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: '#5C5A55',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}
          >
            <X size={17} strokeWidth={2} />
          </button>
        </div>

        <div style={{padding:'0.8rem 1.5rem',borderBottom:'1px solid #e4e9da',background:'#f6f8ef',fontSize:11,lineHeight:1.8,color:'#587149'}}>Free Lucknow studio pickup. Courier and protective packaging are quoted for your address before payment. <Link to="/shipping" onClick={onClose}>Delivery details</Link></div>

        {/* 3. Main Scrollable Items Container */}
        <div
          className="cart-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* EMPTY STATE */}
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', margin: 'auto 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E6E2D8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  color: '#9B7A50'
                }}
              >
                <ShoppingBag size={28} strokeWidth={1.6} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 650, color: '#181817', marginBottom: '0.4rem' }}>
                Your bag is empty
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#706E6B', lineHeight: 1.5, maxWidth: '290px', margin: '0 auto 1.75rem auto' }}>
                Upload a photo to create a bespoke handcrafted frame, or discover our studio cards & non-alcoholic itra.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <Link
                  to="/custom-framing"
                  onClick={onClose}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.84rem',
                    justifyContent: 'center',
                    textDecoration: 'none'
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
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  Browse Frames & Prints
                </Link>
              </div>
            </div>
          ) : (
            /* CART ITEMS LIST */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {cartItems.map((item) => {
                const isCustomProduct = Boolean(
                  item.personalisation || 
                  item.finish || 
                  item.size || 
                  item.type?.includes('custom') || 
                  item.type?.includes('frame') || 
                  item.type?.includes('card')
                );

                return (
                  <div
                    key={item.id}
                    className="cart-item-card"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E6E2D8',
                      borderRadius: '10px',
                      padding: '0.95rem',
                      display: 'flex',
                      gap: '0.95rem',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                      position: 'relative'
                    }}
                  >
                    {/* Item Thumbnail Image */}
                    <div
                      style={{
                        width: '78px',
                        height: '78px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#F5F3EE',
                        border: '1px solid #E6E2D8',
                        flexShrink: 0,
                        position: 'relative'
                      }}
                    >
                      <OrderItemPreview item={item} />
                      {isCustomProduct && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(24, 24, 23, 0.75)',
                            color: '#FFFFFF',
                            fontSize: '0.55rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: '1px 0',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase'
                          }}
                        >
                          Custom
                        </div>
                      )}
                    </div>

                    {/* Item Information & Personalisation Summary */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Title & Delete Button */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 650, color: '#181817', margin: 0, lineHeight: 1.3 }}>
                            {item.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            aria-label={`Remove ${item.title}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#8A8780',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'color 0.15s ease'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#8A8780')}
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Personalisation Summary Specifications */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 0.65rem', marginTop: '0.35rem', fontSize: '0.73rem', color: '#5C5A55' }}>
                          {/* Size */}
                          {item.size && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{ color: '#8A8780' }}>Size:</span>
                              <strong>{item.size}</strong>
                              {item.dimensions && <span style={{ color: '#8A8780' }}>({item.dimensions})</span>}
                            </span>
                          )}

                          {/* Frame / Finish */}
                          {item.finish && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{ color: '#8A8780' }}>Finish:</span>
                              <strong>{item.finish}</strong>
                            </span>
                          )}

                          {item.type === 'custom_frame' && item.orientation && <span>Layout: <strong>{item.orientation}</strong> · {item.fit === 'cover' ? 'Fill opening' : 'Full photo'}</span>}
                          {item.type === 'photo_prints' && item.printQuantity && <span><strong>{item.photoCount} {item.photoCount === 1 ? 'photo' : 'photos'} × {item.copiesPerPhoto || 1} copies = {item.printQuantity} prints</strong> · {item.orientation || 'portrait'} · {item.border}</span>}
                          {item.type === 'birthday_card' && item.cardCount && <span><strong>{item.cardCount} {item.cardCount === 1 ? 'card' : 'cards'} per set</strong> · Folded card + envelope</span>}
                          {item.type === 'gallery_wall' && item.configuration?.slots && <span><strong>{item.frameCount} frames per set</strong> · {item.photoCount} photos added{item.photosPending ? ` · ${item.photosPending} to share` : ''}</span>}

                          {/* Fragrance Volume / Size for Itra */}
                          {item.volume && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{ color: '#8A8780' }}>Volume:</span>
                              <strong>{item.volume}</strong>
                              {item.alcoholFree && <span style={{ color: '#9B7A50', fontWeight: 500 }}>• Alcohol-Free</span>}
                            </span>
                          )}

                          {/* Card Recipient / Design Summary */}
                          {item.personalisation?.recipientName && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{ color: '#8A8780' }}>For:</span>
                              <strong>{item.personalisation.recipientName}</strong>
                            </span>
                          )}

                          {/* Card Format */}
                          {item.format && !item.dimensions && (
                            <span style={{ color: '#706E6B' }}>
                              {item.format}
                            </span>
                          )}
                        </div>

                        {/* "View Customisation" Modal Trigger */}
                        {isCustomProduct && (
                          <div style={{ marginTop: '0.45rem' }}>
                            <button
                              onClick={() => setActiveCustomisationItem(item)}
                              style={{
                                background: '#FAF8F5',
                                border: '1px solid #E6E2D8',
                                borderRadius: '4px',
                                padding: '0.22rem 0.55rem',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#9B7A50',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#181817';
                                e.currentTarget.style.color = '#FFFFFF';
                                e.currentTarget.style.borderColor = '#181817';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FAF8F5';
                                e.currentTarget.style.color = '#9B7A50';
                                e.currentTarget.style.borderColor = '#E6E2D8';
                              }}
                            >
                              <Eye size={12} />
                              <span>View Customisation</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '0.6rem',
                          paddingTop: '0.45rem',
                          borderTop: '1px solid #F0ECE4'
                        }}
                      >
                        {/* Quantity Stepper */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            backgroundColor: '#F5F3EE',
                            borderRadius: '6px',
                            border: '1px solid #E6E2D8',
                            padding: '2px 6px'
                          }}
                        >
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            aria-label={item.type === 'birthday_card' && item.cardCount ? 'Decrease card sets' : 'Decrease quantity'}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#181817',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Minus size={12} strokeWidth={2.2} />
                          </button>

                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#181817', minWidth: '16px', textAlign: 'center' }}>
                            {item.quantity}{(item.type === 'birthday_card' && item.cardCount) || (item.type === 'gallery_wall' && item.frameCount) ? ` ${item.quantity === 1 ? 'set' : 'sets'}` : ''}
                          </span>

                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label={item.type === 'birthday_card' && item.cardCount ? 'Increase card sets' : 'Increase quantity'}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#181817',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Plus size={12} strokeWidth={2.2} />
                          </button>
                        </div>

                        {/* Price */}
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#181817' }}>
                            ₹{item.price * item.quantity}
                          </span>
                          {item.quantity > 1 && (
                            <span style={{ fontSize: '0.68rem', color: '#8A8780', display: 'block' }}>
                              (₹{item.price} {(item.type === 'birthday_card' && item.cardCount) || (item.type === 'gallery_wall' && item.frameCount) ? 'per set' : 'each'})
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

        {/* 5. Order Summary Section (Always visible on desktop, sticky on mobile) */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #EDE8E1',
              boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
              flexShrink: 0
            }}
          >
            {/* Coupon Code Form */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#FAF8F5',
                    border: '1px solid #E6E2D8',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    color: '#181817',
                    textTransform: 'uppercase',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: '#181817',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 0.95rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.02em'
                }}
              >
                Apply
              </button>
            </form>

            {discountCode && (
              <div style={{ fontSize: '0.74rem', color: '#1E6F3E', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.75rem', backgroundColor: '#F0F7F2', padding: '0.35rem 0.65rem', borderRadius: '4px' }}>
                <Tag size={13} />
                <span>Coupon <strong>{discountCode}</strong> · up to ₹{discountAmount} off items</span>
              </div>
            )}
            {couponError && (
              <div style={{ fontSize: '0.72rem', color: '#DC2626', marginBottom: '0.5rem' }}>
                {couponError}
              </div>
            )}

            {/* Price Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5C5A55' }}>
                <span>Subtotal</span>
                <span style={{ color: '#181817', fontWeight: 600 }}>₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E6F3E' }}>
                  <span>Item discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5C5A55' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={13} color="#8A8780" />
                  Delivery
                </span>
                <span>
                  Confirmed before payment
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.08rem',
                  fontWeight: 700,
                  color: '#181817',
                  borderTop: '1px solid #EDE8E1',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                <span>Items after discount</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Dual Checkout Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              {/* WhatsApp Order */}
              <button
                onClick={() => onProceedCheckout('whatsapp')}
                style={{
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.82rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.2)'
                }}
              >
                <MessageCircle size={16} />
                <span>Confirm with studio</span>
              </button>

              {/* Online Payment (UPI / Card) */}
              <button
                onClick={() => onProceedCheckout('online')}
                style={{
                  backgroundColor: '#181817',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.82rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 2px 8px rgba(24, 24, 23, 0.2)'
                }}
              >
                <CreditCard size={16} />
                <span>Proceed to checkout</span>
              </button>
            </div>

            {/* Security Guarantee Micro-Text */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.7rem', color: '#8A8780' }}>
              <Lock size={12} />
              <span>Review your details before printing</span>
            </div>

          </div>
        )}

      </div>

      {/* 6. "VIEW CUSTOMISATION" POPUP MODAL */}
      {activeCustomisationItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            backgroundColor: 'rgba(24, 24, 23, 0.75)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setActiveCustomisationItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E6E2D8',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              maxHeight: 'calc(100dvh - 40px)',
              overflowX: 'hidden',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #EDE8E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FAF8F5'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={16} color="#9B7A50" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 650, color: '#181817', margin: 0 }}>
                  Customisation Details
                </h4>
              </div>
              <button
                onClick={() => setActiveCustomisationItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8A8780',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Image Preview */}
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#FAF8F5',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #E6E2D8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <OrderItemPreview item={activeCustomisationItem} />
              </div>

              {activeCustomisationItem.type === 'photo_prints' && activeCustomisationItem.photos?.length > 1 && <div aria-label="All photos in this print batch" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {activeCustomisationItem.photos.map((photo, index) => <figure key={photo.assetId} style={{ margin: 0, width: 110, flexShrink: 0 }}>
                  <div style={{ height: 95, padding: 5, background: '#f4f5ed', border: '1px solid #e0e5d5', borderRadius: 4 }}><OrderItemPreview item={{ ...activeCustomisationItem, photos: [photo] }} /></div>
                  <figcaption style={{ marginTop: 6, fontSize: 10, color: '#6c7e5b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{index + 1}. {photo.name}</figcaption>
                </figure>)}
              </div>}

              {/* Spec Details Table */}
              <div style={{ backgroundColor: '#FAF8F5', borderRadius: '8px', border: '1px solid #EDE8E1', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#181817', marginBottom: '0.5rem' }}>
                  {activeCustomisationItem.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#5C5A55' }}>
                  {activeCustomisationItem.size && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#8A8780' }}>Selected Size:</span>
                      <strong>{activeCustomisationItem.size} {activeCustomisationItem.dimensions && `(${activeCustomisationItem.dimensions})`}</strong>
                    </div>
                  )}

                  {activeCustomisationItem.finish && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#8A8780' }}>{activeCustomisationItem.type === 'photo_prints' ? 'Paper finish:' : 'Frame Finish:'}</span>
                      <strong>{activeCustomisationItem.finish}</strong>
                    </div>
                  )}

                  {activeCustomisationItem.volume && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#8A8780' }}>Fragrance Volume:</span>
                      <strong>{activeCustomisationItem.volume} (Pure Oil)</strong>
                    </div>
                  )}

                  {activeCustomisationItem.personalisation?.recipientName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#8A8780' }}>Recipient:</span>
                      <strong>{activeCustomisationItem.personalisation.recipientName}</strong>
                    </div>
                  )}

                  {activeCustomisationItem.personalisation?.insideMessage && (
                    <div style={{ marginTop: '4px', borderTop: '1px dashed #DDD9D0', paddingTop: '6px' }}>
                      <span style={{ color: '#8A8780', display: 'block', marginBottom: '2px' }}>Printed Inscription:</span>
                      <p style={{ margin: 0, fontStyle: 'italic', color: '#181817', backgroundColor: '#FFFFFF', padding: '6px', borderRadius: '4px', border: '1px solid #E6E2D8' }}>
                        "{activeCustomisationItem.personalisation.insideMessage}"
                      </p>
                    </div>
                  )}

                  {activeCustomisationItem.type === 'birthday_card' && activeCustomisationItem.configuration && <>
                    <div><span>Front greeting: </span><strong>{activeCustomisationItem.personalisation.frontHeadline}</strong></div>
                    <div style={{ overflowWrap: 'anywhere' }}><span>Sign-off: </span><strong>{activeCustomisationItem.personalisation.senderName}</strong></div>
                    <div><strong>{activeCustomisationItem.cardCount} cards per set × {activeCustomisationItem.quantity} set(s)</strong> · An envelope for each card</div>
                    {activeCustomisationItem.configuration.includePhoto && <p style={{ margin: '5px 0', lineHeight: 1.6 }}>Photo: {activeCustomisationItem.configuration.photo?.name}. Share the original photo with the studio when confirming your order.</p>}
                  </>}

                  {activeCustomisationItem.type === 'photo_prints' && <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Print batch:</span><strong>{activeCustomisationItem.photoCount} photos × {activeCustomisationItem.copiesPerPhoto || 1} copies = {activeCustomisationItem.printQuantity} prints</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Layout:</span><strong>{activeCustomisationItem.orientation} · {activeCustomisationItem.border}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Photo treatment:</span><strong>{activeCustomisationItem.cropMode} · {activeCustomisationItem.colorTone}</strong></div>
                    {activeCustomisationItem.specialInstructions && <div style={{ borderTop: '1px solid #e0e5d6', paddingTop: 8 }}><span>Studio note:</span><p style={{ margin: '5px 0 0', overflowWrap: 'anywhere' }}>{activeCustomisationItem.specialInstructions}</p></div>}
                  </>}
                  {activeCustomisationItem.type === 'gallery_wall' && activeCustomisationItem.configuration?.slots && <>
                    <div><strong>{activeCustomisationItem.frameCount} frames per set · {activeCustomisationItem.photoCount} photos added · {activeCustomisationItem.photosPending} to share</strong></div>
                    <div>Presentation: {activeCustomisationItem.configuration.tone === 'mono' ? 'Black & white' : 'Original colour'} · Mount as shown in the selected frame</div>
                    {activeCustomisationItem.configuration.slots.map((slot, index) => <div key={index} style={{ display: 'flex', gap: 10, padding: '7px 0', borderTop: '1px solid #E6E2D8', alignItems: 'center' }}>
                      {slot.photo && <img src={slot.photo.url} alt={`Photo for frame ${index + 1}`} style={{ height: 45, width: 40, objectFit: 'contain', background: '#fff', flexShrink: 0 }} />}
                      <span style={{ overflowWrap: 'anywhere', lineHeight: 1.7 }}><strong>Frame {index + 1} · {slot.label} · {slot.sizeId} {slot.orientation}</strong><br />{slot.photo?.name || 'Photo to be shared with the studio'} · {slot.fit === 'cover' ? 'Fill opening' : 'Full photo'} · crop {slot.panX}% / {slot.panY}%</span>
                    </div>)}
                    <p style={{ lineHeight: 1.7 }}>Share original files with the studio before printing. Hanging template included.</p>
                  </>}
                  {activeCustomisationItem.type === 'custom_frame' && <><div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E6E2D8', paddingTop: '6px', marginTop: '4px' }}>
                    <span style={{ color: '#8A8780' }}>Glazing & Protection:</span>
                    <span>2mm Cast Optical Acrylic (UV 92%)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8A8780' }}>Hanging Hardware:</span>
                    <span>Pre-installed Dual Brass D-Rings</span>
                  </div>
                  </>}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveCustomisationItem(null)}
                style={{
                  width: '100%',
                  backgroundColor: '#181817',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
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
