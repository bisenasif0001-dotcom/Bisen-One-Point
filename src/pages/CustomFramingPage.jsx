import React from 'react';
import { useLocation } from 'react-router-dom';
import FrameCustomizer from '../components/FrameCustomizer';

export default function CustomFramingPage({ onAddToCart, onOpenSizeGuide, frameGuidePhoto }) {
  const location = useLocation();
  const editItem = location.state?.editItem || null;
  const fromCatalogue = Boolean(
    location.state?.fromCatalogue ||
    location.state?.frameId ||
    location.state?.size ||
    new URLSearchParams(location.search).get('frame'),
  );
  return <FrameCustomizer
    key={location.key}
    onAddToCart={onAddToCart}
    onOpenSizeGuide={onOpenSizeGuide}
    preselectedFrameId={editItem?.frameId || location.state?.frameId || new URLSearchParams(location.search).get('frame') || null}
    preselectedSizeId={editItem?.size || location.state?.size || null}
    initialOrientation={editItem?.orientation || location.state?.orientation || 'portrait'}
    initialPhoto={location.state?.hasGuidePhoto ? frameGuidePhoto : null}
    requestUpload={Boolean(location.state?.triggerUpload)}
    initialIncludePrint={editItem ? editItem.configuration?.includePrint !== false : location.state?.includePrint !== false}
    fromCatalogue={fromCatalogue}
    editItem={editItem}
  />;
}
