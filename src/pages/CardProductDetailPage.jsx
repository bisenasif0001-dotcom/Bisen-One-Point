import React from 'react';
import { useParams } from 'react-router-dom';
import BirthdayCardBuilderPage from './BirthdayCardBuilderPage';
import NotFoundPage from './NotFoundPage';
import { STATIONERY_TEMPLATES } from '../data/cardStationery';

export default function CardProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const template = STATIONERY_TEMPLATES.find(item => item.id === id);
  return template ? <BirthdayCardBuilderPage preset={template} onAddToCart={onAddToCart} /> : <NotFoundPage />;
}
