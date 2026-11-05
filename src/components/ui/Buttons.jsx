import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Primary Action Button - Charcoal Background + Crisp Light Text
 */
export function PrimaryButton({
  children,
  onClick,
  href,
  to,
  icon: Icon,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  type = 'button',
  className = '',
  style = {},
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '0.45rem 0.9rem', fontSize: '0.78rem', gap: '0.35rem' },
    md: { padding: '0.72rem 1.4rem', fontSize: '0.88rem', gap: '0.5rem' },
    lg: { padding: '0.95rem 2rem', fontSize: '0.96rem', gap: '0.6rem' }
  }[size] || { padding: '0.72rem 1.4rem', fontSize: '0.88rem', gap: '0.5rem' };

  const baseStyle = {
    backgroundColor: disabled ? '#8A8780' : '#171717',
    color: '#F5F3EE',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    letterSpacing: '0.015em',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    borderColor: disabled ? '#8A8780' : '#171717',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    opacity: disabled ? 0.6 : 1,
    ...sizeStyles,
    ...style
  };

  const content = (
    <>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={`btn-primary ${className}`} style={baseStyle} {...props}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={`btn-primary ${className}`} style={baseStyle} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`btn-primary ${className}`}
      style={baseStyle}
      {...props}
    >
      {content}
    </button>
  );
}

/**
 * Secondary Action Button - Transparent Background + Hairline Neutral Border
 */
export function SecondaryButton({
  children,
  onClick,
  href,
  to,
  icon: Icon,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  type = 'button',
  className = '',
  style = {},
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '0.45rem 0.9rem', fontSize: '0.78rem', gap: '0.35rem' },
    md: { padding: '0.72rem 1.4rem', fontSize: '0.88rem', gap: '0.5rem' },
    lg: { padding: '0.95rem 2rem', fontSize: '0.96rem', gap: '0.6rem' }
  }[size] || { padding: '0.72rem 1.4rem', fontSize: '0.88rem', gap: '0.5rem' };

  const baseStyle = {
    backgroundColor: 'transparent',
    color: '#171717',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    letterSpacing: '0.01em',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #E6E2D8',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    opacity: disabled ? 0.6 : 1,
    ...sizeStyles,
    ...style
  };

  const content = (
    <>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={`btn-secondary ${className}`} style={baseStyle} {...props}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={`btn-secondary ${className}`} style={baseStyle} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`btn-secondary ${className}`}
      style={baseStyle}
      {...props}
    >
      {content}
    </button>
  );
}
