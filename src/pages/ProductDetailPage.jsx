import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { FRAME_FINISHES, ISLAMIC_ART_COLLECTION } from '../data/products';
import NotFoundPage from './NotFoundPage';

// Keep older product links usable through the current builder and catalogue.
export default function ProductDetailPage() {
  const { id } = useParams();
  const frame = FRAME_FINISHES.find(item => item.id === id || item.legacyId === id);
  if (frame) return <Navigate to={`/custom-framing?frame=${frame.id}`} replace state={{ frameId: frame.id }} />;
  if (ISLAMIC_ART_COLLECTION.some(item => item.id === id)) return <Navigate to="/islamic-art?tab=verses" replace />;
  return <NotFoundPage />;
}
