import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Frame, Image } from 'lucide-react';
import './PrimaryShopActions.css';

const PRIMARY_SHOP_ACTIONS = [
  { id: 'frames', label: 'Buy Frame', to: '/frames-catalogue', icon: Frame },
  { id: 'prints', label: 'Photo Print', to: '/photo-prints', icon: Image },
];

export default function PrimaryShopActions({ variant = 'header', className = '', onNavigate }) {
  const { pathname } = useLocation();
  return <nav className={`primary-shop-actions primary-shop-actions--${variant} ${className}`} aria-label={variant === 'header' ? 'Quick shopping' : 'Start with a frame or photo print'}>
    {PRIMARY_SHOP_ACTIONS.map(action => <Link key={action.id} to={action.to} onClick={onNavigate} className={`primary-shop-link primary-shop-link--${action.id}`} aria-current={pathname === action.to ? 'page' : undefined}><action.icon size={17} strokeWidth={1.6} aria-hidden="true" /><span>{action.label}</span><ArrowUpRight className="primary-shop-arrow" size={14} aria-hidden="true" /></Link>)}
  </nav>;
}
