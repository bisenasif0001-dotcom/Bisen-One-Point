import React from 'react';
import { useLocation } from 'react-router-dom';
import FrameCustomizer from '../components/FrameCustomizer';

export default function CustomFramingPage({ onAddToCart, onOpenSizeGuide, frameGuidePhoto }) {
  const location = useLocation();
  return <FrameCustomizer
    key={location.key}
    onAddToCart={onAddToCart}
    onOpenSizeGuide={onOpenSizeGuide}
    preselectedFrameId={location.state?.frameId || new URLSearchParams(location.search).get('frame') || null}
    preselectedSizeId={location.state?.size || null}
    initialOrientation={location.state?.orientation || 'portrait'}
    initialPhoto={location.state?.hasGuidePhoto ? frameGuidePhoto : null}
    requestUpload={Boolean(location.state?.triggerUpload)}
  />;
}
