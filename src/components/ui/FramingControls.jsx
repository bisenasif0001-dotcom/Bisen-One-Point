import React from 'react';
import { Check, Plus, Minus } from 'lucide-react';

/**
 * FrameSwatch - Tactile Wood & Metallic Moulding Selector
 */
export function FrameSwatch({
  finish,
  isSelected = false,
  onClick,
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabel = true,
  className = '',
  style = {}
}) {
  const swatchDimensions = {
    sm: { width: '28px', height: '28px' },
    md: { width: '38px', height: '38px' },
    lg: { width: '48px', height: '48px' }
  }[size] || { width: '38px', height: '38px' };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`frame-swatch ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px',
        ...style
      }}
      title={finish.name}
    >
      <div
        style={{
          ...swatchDimensions,
          borderRadius: '50%',
          backgroundColor: finish.hex || finish.previewColor || finish.colorHex || '#171717',
          backgroundImage: finish.macroImage ? `url(${finish.macroImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: isSelected ? '2px solid #171717' : '1px solid #D6D1C6',
          boxShadow: isSelected ? '0 0 0 2px #FFFFFF, 0 0 0 4px #171717' : 'var(--shadow-sm)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease'
        }}
      >
        {isSelected && (
          <Check size={size === 'sm' ? 12 : 16} color={finish.hex === '#FFFFFF' || finish.hex === '#FAF9F6' ? '#171717' : '#FFFFFF'} />
        )}
      </div>

      {showLabel && (
        <span
          style={{
            fontSize: size === 'sm' ? '0.68rem' : '0.74rem',
            fontWeight: isSelected ? 600 : 500,
            color: isSelected ? '#171717' : '#73716C',
            textAlign: 'center',
            maxWidth: '72px',
            lineHeight: 1.2
          }}
        >
          {finish.name}
        </span>
      )}
    </button>
  );
}

/**
 * SizeSelector - Architectural Dimension Grid or Pills
 */
export function SizeSelector({
  sizes = [],
  selectedSize,
  onChange,
  layout = 'grid', // 'grid' | 'pills'
  className = '',
  style = {}
}) {
  if (layout === 'pills') {
    return (
      <div className={`size-selector-pills ${className}`} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', ...style }}>
        {sizes.map((sz) => {
          const isSelected = selectedSize?.id === sz.id;
          return (
            <button
              key={sz.id}
              type="button"
              onClick={() => onChange(sz)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '2px solid #171717' : '1px solid #E6E2D8',
                backgroundColor: isSelected ? '#171717' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#171717',
                fontSize: '0.8rem',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{sz.name || sz.id}</span>
              {sz.dimensionsCm && <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>({sz.dimensionsCm})</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: 'grid'
  return (
    <div
      className={`size-selector-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '0.6rem',
        ...style
      }}
    >
      {sizes.map((sz) => {
        const isSelected = selectedSize?.id === sz.id;
        return (
          <button
            key={sz.id}
            type="button"
            onClick={() => onChange(sz)}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: isSelected ? '2px solid #171717' : '1px solid #E6E2D8',
              backgroundColor: isSelected ? '#FAF9F6' : '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'left',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
          >
            {sz.popular && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--accent-bronze)',
                  backgroundColor: 'rgba(155, 122, 80, 0.08)',
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}
              >
                Popular
              </span>
            )}

            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#171717' }}>
              {sz.name || sz.id}
            </div>

            {sz.dimensionsCm && (
              <div style={{ fontSize: '0.72rem', color: '#73716C', marginTop: '2px' }}>
                {sz.dimensionsCm}
              </div>
            )}

            {sz.price !== undefined && (
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#171717', marginTop: '6px' }}>
                ₹{sz.price.toLocaleString('en-IN')}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * PriceDisplay - Standard Studio Pricing Format
 */
export function PriceDisplay({
  price,
  originalPrice,
  discountPercent,
  currency = '₹',
  unit,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  style = {}
}) {
  const fontSizes = {
    sm: { price: '0.95rem', original: '0.75rem' },
    md: { price: '1.25rem', original: '0.85rem' },
    lg: { price: '1.75rem', original: '1rem' },
    xl: { price: '2.25rem', original: '1.15rem' }
  }[size] || { price: '1.25rem', original: '0.85rem' };

  return (
    <div
      className={`price-display ${className}`}
      style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px', ...style }}
    >
      <span style={{ fontSize: fontSizes.price, fontWeight: 700, color: '#171717', fontFamily: 'var(--font-sans)' }}>
        {currency}{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
      </span>

      {originalPrice && (
        <span style={{ fontSize: fontSizes.original, color: '#9E9B94', textDecoration: 'line-through' }}>
          {currency}{typeof originalPrice === 'number' ? originalPrice.toLocaleString('en-IN') : originalPrice}
        </span>
      )}

      {discountPercent > 0 && (
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
          Save {discountPercent}%
        </span>
      )}

      {unit && (
        <span style={{ fontSize: '0.75rem', color: '#73716C' }}>
          / {unit}
        </span>
      )}
    </div>
  );
}

/**
 * QuantitySelector - Controlled Counter with Min/Max
 */
export function QuantitySelector({
  quantity = 1,
  onChange,
  min = 1,
  max = 99,
  size = 'md', // 'sm' | 'md'
  className = '',
  style = {}
}) {
  const btnSize = size === 'sm' ? '28px' : '34px';

  return (
    <div
      className={`quantity-selector ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid #E6E2D8',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        ...style
      }}
    >
      <button
        type="button"
        disabled={quantity <= min}
        onClick={() => onChange(Math.max(min, quantity - 1))}
        style={{
          width: btnSize,
          height: btnSize,
          border: 'none',
          backgroundColor: 'transparent',
          color: quantity <= min ? '#D6D1C6' : '#171717',
          cursor: quantity <= min ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s ease'
        }}
        title="Decrease quantity"
      >
        <Minus size={size === 'sm' ? 12 : 14} />
      </button>

      <span
        style={{
          minWidth: size === 'sm' ? '28px' : '36px',
          textAlign: 'center',
          fontSize: size === 'sm' ? '0.8rem' : '0.88rem',
          fontWeight: 600,
          color: '#171717'
        }}
      >
        {quantity}
      </span>

      <button
        type="button"
        disabled={quantity >= max}
        onClick={() => onChange(Math.min(max, quantity + 1))}
        style={{
          width: btnSize,
          height: btnSize,
          border: 'none',
          backgroundColor: 'transparent',
          color: quantity >= max ? '#D6D1C6' : '#171717',
          cursor: quantity >= max ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s ease'
        }}
        title="Increase quantity"
      >
        <Plus size={size === 'sm' ? 12 : 14} />
      </button>
    </div>
  );
}
