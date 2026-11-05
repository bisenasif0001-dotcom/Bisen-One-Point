import React from 'react';
import { CreditCard, Gift } from 'lucide-react';
import FramedPosterPreview from './FramedPosterPreview';
import { HOME_LANDSCAPE, HOME_PHOTO, homeDua, homeFrame } from '../data/homeStudio';
import './NavigationPreview.css';

/** Navigation visuals use the same product assets and frame geometry as the catalogue. */
export default function NavigationPreview({ kind }) {
  if (kind === 'frame') return <FramedPosterPreview poster={HOME_LANDSCAPE} frame={homeFrame('regal_aurelia')} fit="cover" />;
  if (kind === 'dua') return <FramedPosterPreview poster={homeDua('ayat-al-kursi')} frame={homeFrame('regal_noir')} />;
  if (kind === 'names') return <img className="np-calligraphy" src="/islamic-calligraphy/31-Al-Khabir.png" alt="Al-Khabir calligraphy design" loading="lazy" />;
  if (kind === 'prints') return <div className="np-photo-stack"><img src={HOME_PHOTO.image} alt="Family photo print" loading="lazy" /><img src={HOME_LANDSCAPE.image} alt="Landscape photo print" loading="lazy" /></div>;
  if (kind === 'gift-frame') return <FramedPosterPreview poster={HOME_PHOTO} frame={homeFrame('regal_heritage')} fit="cover" />;
  if (kind === 'greeting') return <div className="np-greeting" aria-hidden="true"><small>JUST FOR YOU</small><Gift size={24} strokeWidth={1.1} /><strong>make their<br /><em>day.</em></strong><span>A LITTLE MORE PERSONAL</span></div>;
  if (kind === 'pvc') return <div className="np-pvc" aria-hidden="true"><span>AL-NOOR / PRINT STUDIO</span><CreditCard size={22} strokeWidth={1.2} /><strong>Your identity.<br />Beautifully printed.</strong><i /></div>;
  return <div className="np-poster" aria-hidden="true"><span>YOUR<br />NEXT<br /><em>big idea.</em></span><small>PRINTED TO STAND OUT</small></div>;
}
