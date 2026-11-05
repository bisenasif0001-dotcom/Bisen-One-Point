import React from 'react';

/**
 * Editorial Section Header Primitive
 * Supports eyebrow pill, serif headline with optional italicized keyword, and body text.
 */
export function SectionHeader({
  eyebrow,
  title,
  titleItalic,
  description,
  align = 'center', // 'left' | 'center' | 'right'
  action,
  className = '',
  style = {},
  maxWidth = '720px'
}) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  }[align] || 'text-center mx-auto';

  return (
    <div
      className={`section-header ${alignClass} ${className}`}
      style={{
        maxWidth: align === 'center' ? maxWidth : '100%',
        marginBottom: '2.5rem',
        textAlign: align,
        ...style
      }}
    >
      {eyebrow && (
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--accent-bronze)',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-sans)'
          }}
        >
          {eyebrow}
        </span>
      )}

      {title && (
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.85rem, 3.2vw, 2.65rem)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            letterSpacing: '-0.015em',
            lineHeight: 1.2,
            margin: '0 0 0.75rem 0'
          }}
        >
          {title}
          {titleItalic && (
            <>
              {' '}
              <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent-bronze)' }}>
                {titleItalic}
              </span>
            </>
          )}
        </h2>
      )}

      {description && (
        <p
          style={{
            fontSize: 'clamp(0.92rem, 1.2vw, 1.05rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: maxWidth,
            margin: align === 'center' ? '0 auto' : '0'
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <div style={{ marginTop: '1.25rem' }}>
          {action}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
