import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Frame, Image, Mail } from 'lucide-react';

const additions = [
  { to: '/custom-framing', title: 'Add a personal frame', detail: 'Upload your photo and choose its finish', icon: Frame },
  { to: '/photo-prints', title: 'Print a few favourite photos', detail: 'Choose photos, sizes and copies', icon: Image },
  { to: '/birthday-cards', title: 'Create a birthday card', detail: 'Make the design and message yours', icon: Mail },
];

// Personalised additions need their own complete configuration before they enter the bag.
export default function SmartCrossSell({ cartItems = [], compact = false, onNavigate }) {
  if (!cartItems.length) return null;
  return <nav aria-label="Create a personalised addition" style={{ padding: compact ? '1rem' : '1.5rem', marginTop: '1rem', border: '1px solid #e0e4d8', borderRadius: '10px', background: '#fafbf6' }}>
    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#294738' }}>A little more personal.</h3>
    <p style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#62685d' }}>Create each addition with your own photo, words and options.</p>
    <div style={{ display: 'grid', gap: '0.65rem' }}>{additions.map(({ to, title, detail, icon: Icon }) => <Link key={to} to={to} onClick={onNavigate} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.8rem', background: '#fff', border: '1px solid #e0e4d8', borderRadius: '7px', color: '#294738', textDecoration: 'none' }}><Icon size={20} style={{ flexShrink: 0 }} /><span style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: '0.85rem' }}>{title}</strong><small style={{ display: 'block', marginTop: '0.2rem', lineHeight: 1.45 }}>{detail}</small></span><ArrowUpRight size={15} style={{ flexShrink: 0 }} /></Link>)}</div>
  </nav>;
}
