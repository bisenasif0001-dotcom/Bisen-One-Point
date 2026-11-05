import React from 'react';
import { getFrameGeometry, placeStudioPhoto } from '../utils/frameStudio';

/** Composite original catalogue photography with artwork. Default behaviour preserves the whole poster. */
export default function FramedPosterPreview({ poster, frame, className = '', orientation = 'portrait', fit = 'contain', filter = 'none', panX = 50, panY = 50, style }) {
  if (!frame) return <img className={`dua-unframed-art ${className}`} style={style} src={poster.image} alt={poster.title} />;
  const geometry = getFrameGeometry(frame.id, orientation);
  if (!geometry) return <img className={`dua-unframed-art ${className}`} style={style} src={poster.image} alt={poster.title} />;
  const opening = geometry.opening;
  const placement = placeStudioPhoto({ photoWidth: poster.width, photoHeight: poster.height, width: opening.width, height: opening.height, fit, panX, panY });
  return <svg className={`dua-real-frame ${className}`} viewBox={`0 0 ${geometry.width} ${geometry.height}`} role="img" style={style} aria-label={`${poster.title} in ${frame.name}, ${frame.finish}, ${orientation}`}>
    <image href={frame.frontImage} width="1122" height="1402" transform={geometry.frameTransform} />
    <svg x={opening.x} y={opening.y} width={opening.width} height={opening.height} viewBox={`0 0 ${opening.width} ${opening.height}`} overflow="hidden">
      <rect width={opening.width} height={opening.height} fill="#fff" />
      <image href={poster.image} x={placement?.x || 0} y={placement?.y || 0} width={placement?.width || opening.width} height={placement?.height || opening.height} preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'} style={filter !== 'none' ? { filter } : undefined} />
      <rect x=".5" y=".5" width={opening.width - 1} height={opening.height - 1} fill="none" stroke="#292319" strokeOpacity=".18" />
    </svg>
  </svg>;
}
