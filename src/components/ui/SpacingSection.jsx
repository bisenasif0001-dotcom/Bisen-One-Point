import React from 'react';

/**
 * Editorial Spacing Section Primitive
 * Standardizes consistent vertical rhythm, container margins, and background palettes.
 */
export function SpacingSection({
  children,
  id,
  padding = 'default', // 'tight' | 'default' | 'spacious' | 'hero' | 'none'
  background = 'default', // 'default' | 'surface' | 'subtle' | 'dark'
  borderBottom = true,
  borderTop = false,
  container = true,
  className = '',
  style = {}
}) {
  const paddings = {
    tight: 'clamp(3rem, 5vw, 4.5rem) 0',
    default: 'clamp(5rem, 8vw, 7.5rem) 0',
    spacious: 'clamp(6.5rem, 10vw, 9.5rem) 0',
    hero: 'clamp(4rem, 6vw, 6rem) 0 3rem 0',
    none: '0'
  }[padding] || 'clamp(5rem, 8vw, 7.5rem) 0';

  const backgrounds = {
    default: 'var(--bg-main)', // #F5F3EE
    surface: 'var(--bg-surface)', // #FFFFFF
    subtle: 'var(--bg-surface-subtle)', // #F9F8F5
    dark: 'var(--bg-dark)' // #20201E
  }[background] || 'var(--bg-main)';

  return (
    <section
      id={id}
      className={`spacing-section ${className}`}
      style={{
        padding: paddings,
        backgroundColor: backgrounds,
        borderTop: borderTop ? '1px solid var(--border-color)' : 'none',
        borderBottom: borderBottom ? '1px solid var(--border-color)' : 'none',
        position: 'relative',
        ...style
      }}
    >
      {container ? (
        <div className="container-custom">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

export default SpacingSection;
