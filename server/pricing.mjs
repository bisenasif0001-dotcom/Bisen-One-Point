import { DEFAULT_BUSINESS_RULES, couponCalculation } from '../src/data/businessRules.js';
import { ITRA_PRODUCTS } from '../src/data/itraProducts.js';
import { FRAME_FINISHES, GLASS_OPTIONS, SAMPLE_CARDS_AND_GIFTS } from '../src/data/products.js';
import { CARD_TEMPLATES } from '../src/data/birthdayCards.js';
import { getStudioPrice } from '../src/utils/frameStudio.js';
import { getPrintTotals, PRINT_FINISHES } from '../src/utils/photoPrints.js';
import { getCardPricing } from '../src/utils/birthdayCards.js';
import { GALLERY_LAYOUTS } from '../src/data/galleryWalls.js';

export class ApiError extends Error { constructor(status,message){super(message);this.status=status;} }
export const cleanText=(value,max=2000)=>typeof value==='string'?value.trim().slice(0,max):'';
export function phoneNumber(value){let digits=String(value||'').replace(/\D/g,'');if(digits.length===12&&digits.startsWith('91'))digits=digits.slice(2);return /^[6-9]\d{9}$/.test(digits)?digits:'';}
export function validateCustomer(value={},delivery=false){
  const customer=Object.fromEntries(['name','phone','email','address','apartment','city','state','pincode'].map(key=>[key,cleanText(value[key],key==='address'?500:150)]));
  customer.phone=phoneNumber(customer.phone);
  if(!customer.name||!customer.phone)throw new ApiError(400,'Enter your name and a valid Indian mobile number.');
  if(customer.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))throw new ApiError(400,'Check your email address.');
  if(delivery&&(!customer.address||!customer.city||!customer.state||!/^[1-9]\d{5}$/.test(customer.pincode)))throw new ApiError(400,'Complete the delivery address and six-digit PIN code.');
  return customer;
}
// Prices are derived here from the same catalogue used by the builders. Client totals are never charged.
export function priceItem(item){
  let price=null;
  const config=item.configuration||{};
  if(item.type==='custom_frame'){
    const glass=GLASS_OPTIONS.find(value=>value.name===item.glass||value.id===config.glassId);
    price=getStudioPrice({sizeId:item.size,frameId:item.frameId,glassId:glass?.id})?.unit??null;
    const frame=FRAME_FINISHES.find(value=>value.id===item.frameId);if(price!==null)item.title=`${frame.name} Photo Frame`;
  } else if(item.type==='photo_prints'&&PRINT_FINISHES.some(value=>value.id===config.finishId)){
    if(!Array.isArray(item.photos)||item.photos.length!==item.photoCount)throw new ApiError(400,'Please review your photo-print batch.');
    price=getPrintTotals(item.photos.length,config.sizeId,item.copiesPerPhoto)?.total??null;
    if(price!==null)item.title=`${config.sizeId} Photo Prints (${PRINT_FINISHES.find(value=>value.id===config.finishId).name})`;
  } else if(item.type==='birthday_card'){
    const template=CARD_TEMPLATES.find(value=>value.id===config.templateId);
    try{if(!template)throw new Error();price=getCardPricing(config.sizeId,config.cardCount).total;item.title=`${template.name} · Birthday card`;item.cardCount=config.cardCount;}catch{throw new ApiError(400,'Please review your birthday-card design, size and quantity.');}
  } else if(item.type==='gallery_wall'){
    if(FRAME_FINISHES.some(value=>value.id===config.frameId)){const layout=GALLERY_LAYOUTS.find(value=>value.id===config.layoutId);price=layout?.startingPrice??null;if(layout){item.title=`${layout.name} · ${layout.framesCount} frames`;item.frameCount=layout.framesCount;}}
  } else {
    const gift=SAMPLE_CARDS_AND_GIFTS.find(value=>value.id===item.id);
    const perfume=ITRA_PRODUCTS.find(value=>value.id===item.productId||value.id===item.id);
    price=gift?.price??perfume?.prices?.[item.volume]??null;
    if(gift)item.title=gift.name||gift.title;
    else if(perfume&&price!==null)item.title=perfume.name;
  }
  return Number.isSafeInteger(price)&&price>0?price:null;
}
export function cleanItems(items){
  if(!Array.isArray(items)||!items.length||items.length>30)throw new ApiError(400,'Your bag must contain between 1 and 30 items.');
  return items.map(raw=>{
    if(!raw||typeof raw!=='object'||!Number.isSafeInteger(raw.quantity)||raw.quantity<1||raw.quantity>10000)throw new ApiError(400,'Check the quantity of each item.');
    // Preserve the builder specification, but drop executable URLs and payment/customer fields.
    const safe=JSON.parse(JSON.stringify(raw,(key,value)=>{
      if(['__proto__','constructor','prototype','cardNumber','cardCvv','cardExpiry','password','keySecret'].includes(key))return undefined;
      if(typeof value==='string'){
        if(/^(?:javascript|vbscript|data:text|blob):/i.test(value))return '';
        if(/^data:/i.test(value)&&!/^data:image\/(?:png|jpeg|webp);base64,/i.test(value))return '';
        if(['image','photoUrl','url','thumbnail'].includes(key)&&value&&!/^data:image\/(?:png|jpeg|webp);base64,/i.test(value)&&!/^\/(?!\/)(?:hero|frames|catalogue|studio-previews|islamic-calligraphy|dua-posters|custom-frames|rooms)\//.test(value)&&!/^https:\/\/images\.unsplash\.com\//.test(value))return '';
        if(value.length>2_000_000)throw new ApiError(413,'The preview is too large. Please use a smaller image.');
      }
      return value;
    }));
    safe.title=cleanText(safe.title,180)||'Custom studio request';
    safe.price=priceItem(safe);
    return safe;
  });
}
export function calculateCheckout(body, { rules = DEFAULT_BUSINESS_RULES, hasPriorOrder = false, couponUses = 0 } = {}) {
  const pickup = body.fulfillment === 'pickup';
  if (pickup && !rules.shipping.pickupEnabled) throw new ApiError(400, 'Store pickup is currently unavailable.');
  const customer = validateCustomer(body.customer, !pickup), items = cleanItems(body.items);
  const known = items.every(item => item.price !== null);
  const subtotal = known ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : null;
  const code = cleanText(body.discountCode, 30).toUpperCase();
  if (code && !known) throw new ApiError(400, 'Coupons do not apply to custom bulk quotations. Remove the coupon to request your quote.');
  const pricingItems = items.map(item => ({ ...item, discounted: item.type === 'birthday_card' && Number(item.configuration?.cardCount) > 1 }));
  const coupon = couponCalculation({ rules, code, items: pricingItems, subtotal: subtotal || 0, hasPriorOrder, uses: couponUses });
  if (coupon.error) throw new ApiError(400, coupon.error);
  const shippingFee = pickup ? 0 : null;
  const grandTotal = known && pickup ? subtotal - coupon.discountAmount : null;
  if (grandTotal !== null && (!Number.isSafeInteger(grandTotal) || grandTotal > 10_000_000)) throw new ApiError(400, 'Please ask the studio for a quote for this batch.');
  const custom = items.some(item => ['custom_frame', 'photo_prints', 'birthday_card', 'gallery_wall'].includes(item.type));
  if (custom && body.designConfirmed !== true) throw new ApiError(400, 'Review and confirm your photo placement, spelling, size and design before saving.');
  return { customer, items, subtotal, discountAmount: coupon.discountAmount, discountCode: coupon.code, shippingFee, grandTotal,
    delivery: { method: pickup ? 'pickup' : 'courier', courier: '', awb: '', trackingUrl: '', expectedDate: '' },
    pricingConfirmed: grandTotal !== null, commerceVersion: 2,
    artwork: { required: custom, status: custom ? 'approved' : 'not_required', version: custom ? 1 : 0, approvedAt: custom ? new Date().toISOString() : null, versions: [] },
    filesReviewed: false, policyVersion: '2026-11-05', productionWindow: { ...rules.production } };
}
