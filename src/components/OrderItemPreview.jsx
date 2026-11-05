import React from 'react';
import { FRAME_FINISHES } from '../data/products';
import FramedPosterPreview from './FramedPosterPreview';
import PrintPaperPreview from './PrintPaperPreview';
import BirthdayCardPreview from './BirthdayCardPreview';
import { GalleryWallArt } from './GalleryWallPreview';

export default function OrderItemPreview({ item }) {
  if (item.type === 'gallery_wall' && item.configuration?.slots) {
    return <GalleryWallArt config={item.configuration} samplePhotos={false} style={{ width: '100%', height: '100%', display: 'block' }} />;
  }
  if (item.type === 'birthday_card' && item.configuration) {
    return <BirthdayCardPreview config={item.configuration} style={{ display: 'block', width: '100%', height: '100%' }} />;
  }
  if (item.type === 'photo_prints' && item.configuration && item.photos?.length) {
    const photo = item.photos[0];
    return <PrintPaperPreview photo={{ ...photo, url: photo.thumbnail || item.image }} config={item.configuration} style={{ display: 'block', width: '100%', height: '100%' }} />;
  }
  const frame = item.type === 'custom_frame' && FRAME_FINISHES.find(f => f.id === item.frameId);
  if (!frame) return <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  return <FramedPosterPreview
    poster={{ image: item.photoUrl || item.image, title: item.photoName || item.title, width: item.photoWidth, height: item.photoHeight }}
    frame={frame}
    orientation={item.orientation || 'portrait'}
    fit={item.fit || 'contain'}
    panX={item.panX ?? 50}
    panY={item.panY ?? 50}
    filter={item.filterCss || 'none'}
    style={{ display: 'block', width: '100%', height: '100%' }}
  />;
}
