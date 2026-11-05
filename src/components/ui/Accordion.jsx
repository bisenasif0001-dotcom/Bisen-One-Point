import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Single Accordion Item Primitive
 */
export function AccordionItem({
  title,
  isOpen,
  onToggle,
  children,
  icon: Icon,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`accordion-item ${className}`}
      style={{
        borderBottom: '1px solid #E6E2D8',
        overflow: 'hidden',
        ...style
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.15rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: '#171717',
          transition: 'color 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {Icon && <Icon size={18} color="var(--accent-bronze)" />}
          <span style={{ fontSize: '0.96rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
            {title}
          </span>
        </div>

        <div
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            color: '#73716C'
          }}
        >
          <ChevronDown size={18} />
        </div>
      </button>

      {isOpen && (
        <div
          style={{
            paddingBottom: '1.25rem',
            fontSize: '0.86rem',
            color: '#5C5A55',
            lineHeight: 1.6
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Multi-Item Accordion Group
 */
export function Accordion({
  items = [], // [{ id, title, content, icon, defaultOpen }]
  allowMultiple = false,
  className = '',
  style = {}
}) {
  const [openIds, setOpenIds] = useState(() => {
    return items.filter(it => it.defaultOpen).map(it => it.id);
  });

  const toggleItem = (id) => {
    if (allowMultiple) {
      setOpenIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else {
      setOpenIds(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`accordion-group ${className}`} style={{ width: '100%', ...style }}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          title={item.title}
          icon={item.icon}
          isOpen={openIds.includes(item.id)}
          onToggle={() => toggleItem(item.id)}
        >
          {typeof item.content === 'function' ? item.content() : item.content}
        </AccordionItem>
      ))}
    </div>
  );
}

export default Accordion;
