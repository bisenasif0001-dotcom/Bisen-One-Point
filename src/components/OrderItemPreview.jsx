import React from 'react';
import { FRAME_FINISHES } from '../data/products';
import FramedPosterPreview from './FramedPosterPreview';
import PrintPaperPreview from './PrintPaperPreview';
import BirthdayCardPreview from './BirthdayCardPreview';
import PvcCardArt from './PvcCardArt';
import { GalleryWallArt } from './GalleryWallPreview';
import { PVC_PRODUCTS, getPvcProduct } from '../data/pvcCards';
import { resolveAssetUrl } from '../utils/assetUrl';

export default function OrderItemPreview({ item }) {
  if (item.type === 'pvc_card') {
    const product = getPvcProduct(item.productId || item.configuration?.productId) || PVC_PRODUCTS[0];
    const orientation = item.orientation || item.configuration?.orientation || product.orientation;
    return <div style={{ width: '100%', height: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PvcCardArt product={product} orientation={orientation} decorative /></div>;
  }
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
  const isCalligraphy = item.type === 'islamic_art' || item.type === 'dua_poster';
  const frame = (item.type === 'custom_frame' || isCalligraphy) && FRAME_FINISHES.find(f => f.id === item.frameId);
  if (item.type === 'custom_frame' && frame && item.configuration?.includePrint === false) {
    return <img src={resolveAssetUrl(frame.frontImage)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  }
  if (!frame) return <img src={resolveAssetUrl(item.image)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: isCalligraphy ? 'contain' : 'cover' }} />;
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
