import React from 'react';
import FramedPosterPreview from './FramedPosterPreview';
import { FRAME_STUDIO_SAMPLES } from '../data/frameStudioSamples';
import { getFrameGeometry } from '../utils/frameStudio';

export default function CatalogueFramePreview({ frame, orientation = 'portrait', withPhoto = true }) {
  if (withPhoto) {
    const sample = FRAME_STUDIO_SAMPLES.find(item => item.orientation === orientation);
    return <FramedPosterPreview poster={{ image: sample.url, title: sample.name, width: sample.width, height: sample.height }} frame={frame} orientation={orientation} fit="cover" panY={orientation === 'portrait' ? 10 : 50} />;
  }
  const geometry = getFrameGeometry(frame.id, orientation);
  return <svg className="fcat-frame-only" viewBox={`0 0 ${geometry.width} ${geometry.height}`} role="img" aria-label={`${frame.name}, ${frame.finish}, ${orientation}, frame only`}>
    <image href={frame.frontImage} width="1122" height="1402" transform={geometry.frameTransform} />
  </svg>;
}
