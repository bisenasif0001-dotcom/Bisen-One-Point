import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, ShoppingBag, ArrowRight, ArrowUpRight, Check } from 'lucide-react';

/**
 * CategoryCard - Visual Gateway to Product Departments & Occasions
 */
export function CategoryCard({
  title,
  subtitle,
  image,
  badge,
  count,
  link,
  onClick,
  aspectRatio = '4 / 3',
  className = '',
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false);

  const cardContent = (
    <div
      className={`glass-panel glass-card-hover ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6E2D8',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        ...style
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio,
          overflow: 'hidden',
          backgroundColor: '#EDEAE3'
        }}
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.45s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />

        {badge && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#FFFFFF',
              color: '#171717',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid #E6E2D8',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {badge}
          </span>
        )}

        {count && (
          <span
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(23, 23, 23, 0.75)',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {count}
          </span>
        )}
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
            {title}
          </h3>
          <ArrowUpRight size={16} color="var(--accent-bronze)" style={{ transition: 'transform 0.2s', transform: isHovered ? 'translate(2px, -2px)' : 'none' }} />
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

/**
 * ProductCard - Standard Studio E-Commerce Display Card
 */
export function ProductCard({
  id,
  title,
  category,
  price,
  originalPrice,
  badge,
  image,
  hoverImage,
  rating = 5,
  reviewsCount,
  link,
  onQuickView,
  onAddToCart,
  specs = [],
  className = '',
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`glass-panel glass-card-hover ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6E2D8',
        position: 'relative',
        ...style
      }}
    >
      <div style={{ position: 'relative', height: '260px', backgroundColor: '#EDEAE3', overflow: 'hidden' }}>
        <img
          src={isHovered && hoverImage ? hoverImage : image}
          alt={title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.45s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)'
          }}
        />

        {badge && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#FFFFFF',
              color: '#171717',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid #E6E2D8'
            }}
          >
            {badge}
          </span>
        )}

        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView();
            }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #E6E2D8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#171717',
              transition: 'all 0.15s ease'
            }}
            title="Quick View"
          >
            <Eye size={15} />
          </button>
        )}
      </div>

      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
        {category && (
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-bronze)', fontWeight: 600 }}>
            {category}
          </span>
        )}

        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
          {link ? (
            <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>

        {specs.length > 0 && (
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {specs.map((spec, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Check size={11} color="var(--accent-bronze)" /> {spec}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #F0ECE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price}
            </span>
            {originalPrice && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                ₹{originalPrice}
              </span>
            )}
          </div>

          {onAddToCart && (
            <button
              type="button"
              onClick={onAddToCart}
              style={{
                backgroundColor: '#171717',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'background 0.15s ease'
              }}
            >
              <ShoppingBag size={13} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ServiceCard - Studio Feature / Capability Pillar
 */
export function ServiceCard({
  number,
  title,
  description,
  icon: Icon,
  link,
  actionText = 'Learn More',
  image,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6E2D8',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        height: '100%',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {Icon ? (
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#F5F3EE', border: '1px solid #E6E2D8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-bronze)' }}>
            <Icon size={20} />
          </div>
        ) : (
          <div />
        )}
        {number && (
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#B8B3A8', fontWeight: 500 }}>
            {number}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
        {description}
      </p>

      {link && (
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <Link
            to={link}
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--accent-bronze)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{actionText}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * ReviewCard - Customer Experience Story & Social Proof
 */
export function ReviewCard({
  quote,
  name,
  city,
  productDetails,
  categoryLabel,
  rating = 5,
  image,
  aspectRatio = '4 / 3',
  className = '',
  style = {}
}) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6E2D8',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style
      }}
    >
      {image && (
        <div style={{ width: '100%', aspectRatio, overflow: 'hidden', backgroundColor: '#EDEAE3' }}>
          <img src={image} alt={`${name}'s photo`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', color: '#D4AF37' }}>
            {[...Array(rating)].map((_, i) => (
              <Star key={i} size={14} fill="#D4AF37" color="#D4AF37" />
            ))}
          </div>
          {categoryLabel && (
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8A8780', fontWeight: 600 }}>
              {categoryLabel}
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.86rem', color: '#2B2927', lineHeight: 1.55, margin: 0, fontStyle: 'italic', flex: 1 }}>
          "{quote}"
        </p>

        <div style={{ paddingTop: '0.6rem', borderTop: '1px solid #F0ECE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <div>
            <strong style={{ color: '#171717', display: 'block' }}>{name}</strong>
            {city && <span style={{ color: '#8A8780' }}>{city}</span>}
          </div>
          {productDetails && (
            <span style={{ color: '#706E68', fontSize: '0.72rem', textAlign: 'right', maxWidth: '50%' }}>
              {productDetails}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
