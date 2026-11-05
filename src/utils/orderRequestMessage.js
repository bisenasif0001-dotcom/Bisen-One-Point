import { birthdayOrderDetails } from './birthdayCards';
import { galleryOrderDetails } from './galleryWalls';

const amount = value => value === null || value === undefined ? 'To be confirmed' : `₹${Number(value).toLocaleString('en-IN',{maximumFractionDigits:2})}`;

/** A customer-reviewed hand-off to the studio, with the complete saved request. */
export function buildOrderConfirmationMessage(order) {
  const lines = ['Hello AL-NOOR! Please review and confirm my saved order request.', `Order reference: ${order.orderId}`, '', `Name: ${order.customer.name || 'To be confirmed'}`];
  if (order.customer.phone) lines.push(`Checkout mobile: ${order.customer.phone}`);
  if (order.customer.email) lines.push(`Email: ${order.customer.email}`);
  const address=['address','apartment','city','state','pincode'].map(key=>order.customer[key]).filter(Boolean).join(', ');
  if(address) lines.push(`Delivery address: ${address}`);
  lines.push('', 'MY SELECTIONS');
  for(const [index,item] of order.items.entries()) {
    lines.push(`${index+1}. ${item.title}`,`Quantity: ${item.quantity ?? 'To be confirmed'}`);
    if(item.size) lines.push(`Size: ${item.size}${item.dimensions ? ` (${item.dimensions})` : ''}`);
    if(item.finish) lines.push(`Finish: ${item.finish}`);
    if(item.volume) lines.push(`Volume: ${item.volume}`);
    if(item.type==='birthday_card' && item.configuration) lines.push(birthdayOrderDetails(item));
    if(item.type==='gallery_wall' && item.configuration?.slots) lines.push(galleryOrderDetails(item));
    if(item.type==='photo_prints') {
      const layout=[item.orientation,item.cropMode,item.border,item.colorTone].filter(Boolean).join('; ');
      lines.push(`Batch: ${item.photoCount ?? 'To confirm'} photographs × ${item.copiesPerPhoto || 1} copies = ${item.printQuantity ?? 'To confirm'} prints`,`Layout: ${layout || 'Confirm with the studio'}`);
      for(const photo of item.photos || []) lines.push(`${photo.name}: rotation ${photo.rotation || 0}°; crop ${photo.panX ?? 50}% / ${photo.panY ?? 50}%; zoom ${photo.zoom || 1}×`);
      lines.push('Original photo files will be shared in this conversation.');
    }
    if(item.type==='custom_frame') {
      lines.push(`Photo: ${item.photoName || 'Original photo to be shared'}`,`Layout: ${item.orientation || 'Portrait'}; fit: ${item.fit==='cover'?'Fill opening':'Keep full photo'}`);
      if(item.fit==='cover') lines.push(`Crop: ${item.panX ?? 50}% / ${item.panY ?? 50}%`);
      if(item.mat) lines.push(`Mount: ${item.mat}`);
      if(item.glass) lines.push(`Glazing: ${item.glass}`);
      if(item.personalisation?.filter) lines.push(`Photo effect: ${item.personalisation.filter}`);
      lines.push('Original photo file will be shared in this conversation.');
    }
    if(item.type!=='birthday_card' && item.personalisation?.recipientName) lines.push(`Recipient: ${item.personalisation.recipientName}`);
    if(item.type!=='birthday_card' && item.personalisation?.message) lines.push(`Personal message: ${item.personalisation.message}`);
    if(item.specialInstructions) lines.push(`Notes: ${item.specialInstructions}`);
    lines.push(`Item amount: ${amount(item.price !== null && item.quantity !== null ? item.price*item.quantity : null)}`,'');
  }
  if(!order.items.length) lines.push('Please help me confirm the item details.','');
  lines.push(`Items subtotal: ${amount(order.subtotal)}`);
  if(order.discountAmount>0) lines.push(`Discount${order.discountCode?` (${order.discountCode})`:''}: ${amount(order.discountAmount)}`);
  lines.push(`Delivery quoted at checkout: ${amount(order.shippingFee)}`,`Checkout total: ${amount(order.grandTotal)}`, '', 'Please confirm artwork, the final amount, payment verification, and the expected collection or dispatch date before production.');
  return lines.join('\n');
}
