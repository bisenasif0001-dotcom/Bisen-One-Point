import React from 'react';
import { getGalleryLayout, GALLERY_ROOMS } from '../data/galleryWalls';
import { homeFrame } from '../data/homeStudio';
import { getGalleryPlan } from '../utils/galleryWalls';
import FramedPosterPreview from './FramedPosterPreview';

export function GalleryWallArt({ config, photos = {}, settings = {}, activeIndex = -1, onSelect, numbers = false, samplePhotos = true, className = '', style }) {
  const layout = getGalleryLayout(config.layoutId);
  const plan = getGalleryPlan(layout.id, config.frameId);
  const frame = homeFrame(config.frameId);
  const padding = 4;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`${-padding} ${-padding} ${plan.width + padding * 2} ${plan.height + padding * 2}`} className={`gw-art ${className}`} style={style} role={onSelect ? 'group' : 'img'} aria-label={`${layout.name}, ${layout.framesCount} frames in ${frame.name}`}>
    {plan.slots.map((slot, index) => {
      const saved = config.slots?.[index];
      const photo = photos[index] || saved?.photo;
      const treatment = settings[index] || saved || {};
      const showPhoto = photo || samplePhotos;
      const poster = photo ? { image: photo.url, title: photo.name, width: photo.width, height: photo.height } : { image: `/hero/wedding-${slot.sample}.jpg`, title: `Sample photo for frame ${index + 1}`, width: 434, height: 724 };
      return <g key={index} transform={`translate(${slot.x} ${slot.y})`} role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={onSelect ? `Edit frame ${index + 1}: ${slot.sizeId} ${slot.orientation}, ${slot.label}` : undefined} aria-pressed={onSelect ? activeIndex === index : undefined} onClick={onSelect ? () => onSelect(index) : undefined} onKeyDown={onSelect ? event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(index); } } : undefined} className={onSelect ? 'gw-art-frame gw-art-interactive' : 'gw-art-frame'}>
        <svg width={slot.width} height={slot.height} overflow="visible">
          <FramedPosterPreview frame={frame} poster={showPhoto ? poster : { image: null, title: `Photo to be shared for frame ${index + 1}`, width: 1, height: 1 }} fit={treatment.fit || 'cover'} panX={treatment.panX ?? 50} panY={treatment.panY ?? 20} filter={config.tone === 'mono' ? 'grayscale(1)' : 'none'} style={{ display: 'block', width: '100%', height: '100%' }} />
          {!showPhoto && <><rect x={slot.width * .25} y={slot.height * .25} width={slot.width * .5} height={slot.height * .5} fill="#f4f3e9" /><text x={slot.width / 2} y={slot.height / 2} textAnchor="middle" fill="#7d886b" fontFamily="Arial, sans-serif" fontSize="2.3">PHOTO TO SHARE</text></>}
        </svg>
        {onSelect && activeIndex === index && <rect x="-.9" y="-.9" width={slot.width + 1.8} height={slot.height + 1.8} fill="none" stroke="#607e45" strokeWidth=".65" rx=".5" />}
        {numbers && <g aria-hidden="true"><circle cx={slot.width - 3.4} cy="3.4" r="2.9" fill={activeIndex === index ? '#304b3c' : '#fffefa'} stroke="#c2cbb5" strokeWidth=".25" /><text x={slot.width - 3.4} y="4.35" textAnchor="middle" fill={activeIndex === index ? '#fff' : '#304b3c'} fontFamily="Arial, sans-serif" fontSize="2.7">{index + 1}</text></g>}
      </g>;
    })}
  </svg>;
}

export default function GalleryWallPreview({ config, mode = 'room', photos, settings, activeIndex, onSelect, numbers = true, samplePhotos = true }) {
  const room = GALLERY_ROOMS.find(item => item.id === config.roomId) || GALLERY_ROOMS[0];
  const plan = getGalleryPlan(config.layoutId, config.frameId);
  const aspect = (plan.width + 8) / (plan.height + 8);
  const width = Math.min(.74, .42 * aspect / 1.5);
  return <div className={`gw-scene gw-scene-${mode}`} style={{ '--gw-layout-ratio': aspect }}>
    {mode === 'room' && <img className="gw-room-background" src={room.image} alt={room.alt} width="1536" height="1024" />}
    <div className="gw-arrangement" style={mode === 'room' ? { left: `${room.centerX * 100}%`, top: `${room.centerY * 100}%`, width: `${width * 100}%`, aspectRatio: aspect } : undefined}>
      <GalleryWallArt config={config} photos={photos} settings={settings} activeIndex={activeIndex} onSelect={onSelect} numbers={numbers} samplePhotos={samplePhotos} />
    </div>
    {mode === 'room' && <span className="gw-room-caption">{room.name} · Arrangement inspiration</span>}
  </div>;
}
