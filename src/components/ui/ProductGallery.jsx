import React, { useState } from 'react';
import { Maximize2, Check } from 'lucide-react';

/**
 * Standardized Product Gallery Primitive
 * Implements main studio photo view with thumbnail carousel and perspective labels.
 */
export function ProductGallery({
  views = [], // [{ id, label, shortLabel, image, desc }]
  activeViewId,
  onSelectView,
  aspectRatio = '4 / 3',
  showLabels = true,
  className = '',
  style = {}
}) {
  const [internalActiveId, setInternalActiveId] = useState(views[0]?.id || 'view-0');
  const [isZoomed, setIsZoomed] = useState(false);

  const currentId = activeViewId !== undefined ? activeViewId : internalActiveId;
  const currentView = views.find(v => v.id === currentId) || views[0];

  const handleSelect = (id) => {
    if (onSelectView) onSelectView(id);
    setInternalActiveId(id);
  };

  if (!views || views.length === 0) return null;

  return (
    <div
      className={`product-gallery ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', ...style }}
    >
      {/* Main Large View Port */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio,
          backgroundColor: '#EDEAE3',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid #E6E2D8',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <img
          src={currentView?.image}
          alt={currentView?.label || 'Product view'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: isZoomed ? 'scale(1.35)' : 'scale(1)',
            cursor: 'zoom-in'
          }}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* View Perspective Label Badge */}
        {showLabels && currentView?.label && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(23, 23, 23, 0.78)',
              color: '#F5F3EE',
              fontSize: '0.72rem',
              fontWeight: 500,
              padding: '3px 9px',
              borderRadius: 'var(--radius-xs)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none'
            }}
          >
            {currentView.label}
          </div>
        )}

        {/* Zoom Toggle Button */}
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
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
            color: '#171717',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={isZoomed ? 'Reset zoom' : 'Zoom in'}
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* Thumbnails Row */}
      {views.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {views.map((v) => {
            const isSelected = v.id === currentId;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelect(v.id)}
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid #171717' : '1px solid #E6E2D8',
                  padding: 0,
                  backgroundColor: '#EDEAE3',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  opacity: isSelected ? 1 : 0.75
                }}
                title={v.label}
              >
                <img
                  src={v.image}
                  alt={v.shortLabel || v.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {v.shortLabel && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(23, 23, 23, 0.75)',
                      color: '#FFFFFF',
                      fontSize: '0.58rem',
                      fontWeight: 600,
                      padding: '1px 2px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {v.shortLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
