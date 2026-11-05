import React from 'react';

/**
 * Responsive Studio Tabs Primitive
 * Supports 'pills' (rounded buttons), 'underline' (editorial line), and 'segmented' (ios-style panel).
 */
export function Tabs({
  tabs = [], // [{ id, label, icon: Icon, badge, count }]
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline' | 'segmented'
  size = 'md', // 'sm' | 'md'
  fullWidth = false,
  className = '',
  style = {}
}) {
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        className={`tabs-segmented ${className}`}
        style={{
          display: 'grid',
          gridTemplateColumns: fullWidth ? `repeat(${tabs.length}, 1fr)` : undefined,
          gridAutoFlow: fullWidth ? undefined : 'column',
          backgroundColor: '#EDEAE3',
          padding: '3px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #E6E2D8',
          gap: '3px',
          ...style
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#171717' : '#73716C',
                fontWeight: isActive ? 600 : 500,
                fontSize: size === 'sm' ? '0.76rem' : '0.84rem',
                border: 'none',
                borderRadius: 'calc(var(--radius-lg) - 2px)',
                padding: size === 'sm' ? '0.4rem 0.75rem' : '0.55rem 1.1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{ fontSize: '0.65rem', backgroundColor: isActive ? '#171717' : '#D8D4CA', color: isActive ? '#FFFFFF' : '#171717', padding: '1px 5px', borderRadius: '4px' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div
        role="tablist"
        className={`tabs-underline ${className}`}
        style={{
          display: 'flex',
          borderBottom: '1px solid #E6E2D8',
          gap: '1.75rem',
          overflowX: 'auto',
          ...style
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? '#171717' : 'transparent'}`,
                color: isActive ? '#171717' : '#73716C',
                fontWeight: isActive ? 600 : 500,
                fontSize: size === 'sm' ? '0.82rem' : '0.9rem',
                padding: '0.75rem 0.25rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{ fontSize: '0.72rem', color: isActive ? '#171717' : '#9E9B94' }}>
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: 'pills'
  return (
    <div
      role="tablist"
      className={`tabs-pills ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        ...style
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              backgroundColor: isActive ? '#171717' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : '#171717',
              border: `1px solid ${isActive ? '#171717' : '#E6E2D8'}`,
              borderRadius: 'var(--radius-full)',
              padding: size === 'sm' ? '0.35rem 0.85rem' : '0.5rem 1.15rem',
              fontSize: size === 'sm' ? '0.76rem' : '0.82rem',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
            <span>{tab.label}</span>
            {tab.badge && (
              <span style={{ fontSize: '0.65rem', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#EDEAE3', padding: '1px 5px', borderRadius: '4px' }}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
