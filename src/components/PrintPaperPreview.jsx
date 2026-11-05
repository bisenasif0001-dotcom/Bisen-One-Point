import React from 'react';
import { DEFAULT_PRINT_CONFIG, PRINT_TONES, getPrintLayout } from '../utils/photoPrints';

export default function PrintPaperPreview({ photo, config = DEFAULT_PRINT_CONFIG, className = '', style }) {
  const layout = getPrintLayout(photo, config);
  const tone = PRINT_TONES.find(item => item.id === config.tone) || PRINT_TONES[0];
  return <svg className={className} style={style} viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={`${photo?.name || 'Your photo'}, ${config.orientation} print, ${config.fit === 'cover' ? 'cropped to fill' : 'full photo'}, ${config.border === 'white' ? '5 millimetre white border' : 'borderless'}, ${tone.name}`}>
    <rect width={layout.width} height={layout.height} fill="#fff" />
    {photo?.url && <svg x={layout.opening.x} y={layout.opening.y} width={layout.opening.width} height={layout.opening.height} viewBox={`0 0 ${layout.opening.width} ${layout.opening.height}`} overflow="hidden">
      <g transform={`translate(${layout.centerX} ${layout.centerY}) rotate(${layout.rotation})`}>
        <image href={photo.url} x={-layout.imageWidth / 2} y={-layout.imageHeight / 2} width={layout.imageWidth} height={layout.imageHeight} preserveAspectRatio="none" style={tone.css !== 'none' ? { filter: tone.css } : undefined} />
      </g>
    </svg>}
    <rect x=".15" y=".15" width={layout.width - .3} height={layout.height - .3} fill="none" stroke="#3f4438" strokeOpacity=".14" strokeWidth=".3" />
  </svg>;
}
