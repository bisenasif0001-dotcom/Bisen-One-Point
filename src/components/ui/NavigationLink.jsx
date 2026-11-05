import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Editorial Navigation Link Primitive
 * Supports internal react-router routes, hash anchors, external links, active underlines, and badges.
 */
export function NavigationLink({
  to,
  href,
  label,
  children,
  badge,
  icon: Icon,
  onClick,
  exact = false,
  className = '',
  style = {}
}) {
  const location = useLocation();
  const target = to || href || '#';
  const isActive = to ? (exact ? location.pathname === to : location.pathname.startsWith(to)) : false;

  const content = (
    <>
      {Icon && <Icon size={15} />}
      <span>{children || label}</span>
      {badge && (
        <span
          style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '1px 5px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: isActive ? '#171717' : 'rgba(155, 122, 80, 0.12)',
            color: isActive ? '#FFFFFF' : 'var(--accent-bronze)',
            marginLeft: '4px'
          }}
        >
          {badge}
        </span>
      )}
    </>
  );

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.86rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#171717' : '#5C5A55',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
    padding: '0.4rem 0',
    position: 'relative',
    ...style
  };

  if (to && !to.startsWith('http')) {
    return (
      <Link to={to} onClick={onClick} className={`nav-link ${isActive ? 'active' : ''} ${className}`} style={baseStyle}>
        {content}
      </Link>
    );
  }

  return (
    <a href={target} onClick={onClick} className={`nav-link ${className}`} style={baseStyle}>
      {content}
    </a>
  );
}

export default NavigationLink;
