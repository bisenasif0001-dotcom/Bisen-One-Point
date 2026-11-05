import React from 'react';
import { ArrowRight, ShoppingBag, Upload } from 'lucide-react';

/** A usable next action for every review state; no hidden checkbox dependency. */
export default function StudioOrderButton({ isSample, uploading, validQuantity, onUpload, onFixQuantity, onAddToBag }) {
  if (uploading) return <button className="fs-primary" disabled aria-describedby="fs-order-help">Preparing photo…</button>;
  if (isSample) return <button className="fs-primary" onClick={onUpload} aria-describedby="fs-order-help"><Upload size={16} />Upload photo to order</button>;
  if (!validQuantity) return <button className="fs-primary" onClick={onFixQuantity} aria-describedby="fs-order-help">Check quantity <ArrowRight size={16} /></button>;
  return <button className="fs-primary" onClick={onAddToBag}><ShoppingBag size={16} />Add to bag<ArrowRight size={16} /></button>;
}
