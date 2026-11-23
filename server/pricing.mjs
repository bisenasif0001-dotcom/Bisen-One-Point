import { DEFAULT_BUSINESS_RULES, couponCalculation } from '../src/data/businessRules.js';
import { ITRA_PRODUCTS } from '../src/data/itraProducts.js';
import { FRAME_FINISHES, GLASS_OPTIONS, MAT_OPTIONS, SAMPLE_CARDS_AND_GIFTS } from '../src/data/products.js';
import { CARD_TEMPLATES } from '../src/data/birthdayCards.js';
import { PREMIUM_CARD_DESIGN } from '../src/data/cardDesigns.js';
import { stationeryCardTitle } from '../src/data/cardStationery.js';
import { getStudioPrice } from '../src/utils/frameStudio.js';
import { getPrintTotals, PRINT_FINISHES } from '../src/utils/photoPrints.js';
import { getCardPricing, validatePremiumCardOptions } from '../src/utils/birthdayCards.js';
import { getGalleryPrice } from '../src/utils/galleryWalls.js';
import { GALLERY_LAYOUTS } from '../src/data/galleryWalls.js';
import { getAsmaNameById } from '../src/data/asmaUlHusnaData.js';
import { asmaArtworkPrice } from '../src/utils/asmaArtwork.js';
import { DUA_POSTERS } from '../src/data/duaPosters.js';
import { getDuaOrderDetails } from '../src/utils/duaPosterOrder.js';
import { getPvcProduct } from '../src/data/pvcCards.js';
import { PVC_ACCESSORIES, getPvcPricing } from '../src/utils/pvcEnquiry.js';
import { calculateShipping } from '../src/utils/shippingCalculator.js';

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
export function priceItem(item, overrides = {}){
  let price=null;
  const config=item.configuration||{};
  if(item.type==='custom_frame'){
    const includePrint = config.includePrint !== false;
    const matId = MAT_OPTIONS.some(value => value.id === config.matId) ? config.matId : (MAT_OPTIONS.find(value => value.name === item.mat)?.id || 'no_mat');
    const glass = GLASS_OPTIONS.find(value => value.name === item.glass || value.id === config.glassId) || GLASS_OPTIONS[0];
    const calculated = getStudioPrice({ sizeId: item.size, frameId: item.frameId, glassId: glass.id, matId, includePrint, overrides });
    if (calculated) {
      price = calculated.unit;
    }
    const frame = FRAME_FINISHES.find(value => value.id === item.frameId);
    if (price !== null) item.title = includePrint ? `${frame?.name || 'Custom'} Photo Frame` : `${frame?.name || 'Custom'} Frame (Without Print)`;
  } else if(item.type==='photo_prints'&&PRINT_FINISHES.some(value=>value.id===config.finishId)){
    if(!Array.isArray(item.photos)||item.photos.length!==item.photoCount)throw new ApiError(400,'Please review your photo-print batch.');
    const unitPrice = overrides.printSizes?.[config.sizeId] ?? null;
    if (unitPrice !== null) {
      const count = Number(item.copiesPerPhoto);
      price = item.photos.length * count * unitPrice;
    } else {
      price=getPrintTotals(item.photos.length,config.sizeId,item.copiesPerPhoto)?.total??null;
    }
    if(price!==null)item.title=`${config.sizeId} Photo Prints (${PRINT_FINISHES.find(value=>value.id===config.finishId).name})`;
  } else if(item.type==='birthday_card'){
    const template=CARD_TEMPLATES.find(value=>value.id===config.templateId);
    if (config.designVersion === PREMIUM_CARD_DESIGN) {
      const designError = validatePremiumCardOptions(config);
      if (designError) throw new ApiError(400, designError);
    }
    try{
      if(!template)throw new Error();
      price=getCardPricing(config.sizeId,config.cardCount,overrides).total;
      item.title=stationeryCardTitle(template, config.occasionId);
      item.cardCount=config.cardCount;
    }catch{throw new ApiError(400,'Please review your card design, size and quantity.');}
  } else if(item.type==='gallery_wall'){
    if(FRAME_FINISHES.some(value=>value.id===config.frameId)){
      const calculated=getGalleryPrice(config.layoutId,config.frameId,overrides);
      price=calculated?.total??null;
      const layout=GALLERY_LAYOUTS.find(value=>value.id===config.layoutId);
      if(layout){item.title=`${layout.name} · ${layout.framesCount} frames`;item.frameCount=layout.framesCount;}
    }
  } else if(item.type==='islamic_art'){
    const asmaItem=getAsmaNameById(item.productId);
    if(asmaItem){
      const format=item.frameId?'framed':'print';
      const frame=item.frameId?FRAME_FINISHES.find(value=>value.id===item.frameId):null;
      if(!item.frameId||frame){
        price=asmaArtworkPrice(asmaItem,format,item.size,frame,overrides);
        if(price!==null)item.title=`${asmaItem.title} (${asmaItem.arabicTitle})`;
      }
    }
  } else if(item.type==='dua_poster'){
    const poster=DUA_POSTERS.find(value=>value.id===item.productId);
    if(poster){
      const frame=item.frameId?FRAME_FINISHES.find(value=>value.id===item.frameId):null;
      if(!item.frameId||frame){
        const priced=getDuaOrderDetails({format:frame?'framed':'print',sizeId:item.size,quantity:1,frameId:frame?.id},overrides);
        price=priced.valid?priced.unitPrice:null;
        if(price!==null)item.title=frame?`${poster.title} — Framed Dua Poster`:`${poster.title} — Dua Poster Print`;
      }
    }
  } else if(item.type==='pvc_card'){
    const product=getPvcProduct(config.productId||item.productId);
    const accessory=PVC_ACCESSORIES.find(value=>value.id===config.accessories);
    const validSides=['single','double'].includes(config.sides);
    const validDesign=['upload','design'].includes(config.design);
    if(product&&accessory&&validSides&&validDesign){
      const priced=getPvcPricing({quantity:config.cardCount,sides:config.sides,accessories:config.accessories,design:config.design},overrides);
      if(priced.valid){
        price=priced.total;
        item.cardCount=priced.quantity;
        item.unitPrice=priced.unitPrice;
        item.designFee=priced.designFee;
        item.discountPercent=priced.discountPercent;
        item.finish=`${config.sides==='double'?'Both sides':'Single side'} · ${accessory.label}`;
        item.title=`${product.title} (${priced.quantity} ${priced.quantity===1?'card':'cards'})`;
      }
    }
  } else {
    const gift=SAMPLE_CARDS_AND_GIFTS.find(value=>value.id===item.id);
    const perfume=ITRA_PRODUCTS.find(value=>value.id===item.productId||value.id===item.id);
    const perfumeId = item.productId || item.id;
    price = (overrides.gifts?.[item.id] !== undefined) ? overrides.gifts[item.id] :
            (overrides.itraPrices?.[perfumeId]?.[item.volume] !== undefined) ? overrides.itraPrices[perfumeId][item.volume] :
            gift?.price ?? perfume?.prices?.[item.volume] ?? null;
    if(gift)item.title=gift.name||gift.title;
    else if(perfume&&price!==null)item.title=perfume.name;
  }
  return Number.isSafeInteger(price)&&price>0?price:null;
}
export function cleanItems(items, overrides = {}){
  if(!Array.isArray(items)||!items.length||items.length>30)throw new ApiError(400,'Your bag must contain between 1 and 30 items.');
  return items.map(raw=>{
    if(!raw||typeof raw!=='object'||!Number.isSafeInteger(raw.quantity)||raw.quantity<1||raw.quantity>10000)throw new ApiError(400,'Check the quantity of each item.');
    // Preserve the builder specification, but drop executable URLs and payment/customer fields.
    const safe=JSON.parse(JSON.stringify(raw,(key,value)=>{
      if(['__proto__','constructor','prototype','cardNumber','cardCvv','cardExpiry','password','keySecret'].includes(key))return undefined;
      if(typeof value==='string'){
        if(/^(?:javascript|vbscript|data:text|blob):/i.test(value))return '';
        if(/^data:/i.test(value)&&!/^data:image\/(?:png|jpeg|webp);base64,/i.test(value))return '';
        if(['image','photoUrl','url','thumbnail'].includes(key)&&value&&!/^data:image\/(?:png|jpeg|webp);base64,/i.test(value)&&!/^(?:\/Bisen-One-Point)?\/(?!\/)(?:hero|frames|catalogue|studio-previews|islamic-calligraphy|dua-posters|custom-frames|rooms|cards)\//.test(value)&&!/^https:\/\/images\.unsplash\.com\//.test(value))return '';
        if(value.length>2_000_000)throw new ApiError(413,'The preview is too large. Please use a smaller image.');
      }
      return value;
    }));
    safe.title=cleanText(safe.title,180)||'Custom studio request';
    safe.price=priceItem(safe, overrides);
    return safe;
  });
}
export function calculateCheckout(body, { rules = DEFAULT_BUSINESS_RULES, priceOverrides = {}, hasPriorOrder = false, couponUses = 0 } = {}) {
  const pickup = body.fulfillment === 'pickup';
  if (pickup && !rules.shipping.pickupEnabled) throw new ApiError(400, 'Store pickup is currently unavailable.');
  const customer = validateCustomer(body.customer, !pickup), items = cleanItems(body.items, priceOverrides);
  const known = items.every(item => item.price !== null);
  const subtotal = known ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : null;
  const code = cleanText(body.discountCode, 30).toUpperCase();
  if (code && !known) throw new ApiError(400, 'Coupons do not apply to custom bulk quotations. Remove the coupon to request your quote.');
  const pricingItems = items.map(item => ({ ...item, discounted: (item.type === 'birthday_card' && Number(item.configuration?.cardCount) > 1) || (item.type === 'pvc_card' && Number(item.discountPercent) > 0) }));
  const coupon = couponCalculation({ rules, code, items: pricingItems, subtotal: subtotal || 0, hasPriorOrder, uses: couponUses });
  if (coupon.error) throw new ApiError(400, coupon.error);
  const shipping = known
    ? calculateShipping({ items, subtotal: subtotal || 0, discountAmount: coupon.discountAmount, fulfillment: pickup ? 'pickup' : 'courier', pincode: customer.pincode, rules })
    : { fee: pickup ? 0 : null, zone: pickup ? 'pickup' : 'quote', provider: pickup ? 'Lucknow Studio Pickup' : 'Studio Quote', label: '', freeDeliveryApplied: false, confirmed: false };
  const shippingFee = shipping.confirmed ? shipping.fee : null;
  const grandTotal = known && shipping.confirmed ? subtotal - coupon.discountAmount + shippingFee : null;
  if (grandTotal !== null && (!Number.isSafeInteger(grandTotal) || grandTotal > 10_000_000)) throw new ApiError(400, 'Please ask the studio for a quote for this batch.');
  const custom = items.some(item => (item.type === 'custom_frame' && item.configuration?.includePrint !== false) || ['photo_prints', 'birthday_card', 'gallery_wall', 'pvc_card'].includes(item.type));
  if (custom && body.designConfirmed !== true) throw new ApiError(400, 'Review and confirm your photo placement, spelling, size and design before saving.');
  const delivery = { method: pickup ? 'pickup' : 'courier', zone: shipping.zone, provider: shipping.provider, courier: shipping.provider, awb: '', trackingUrl: '', expectedDate: '' };
  const deliveryQuote = !pickup && shipping.confirmed ? { courierFee: shipping.fee, packagingFee: 0, freeDeliveryApplied: shipping.freeDeliveryApplied, note: shipping.label, confirmedAt: new Date().toISOString() } : undefined;
  return {
    customer, items, subtotal, discountAmount: coupon.discountAmount, discountCode: coupon.code, shippingFee, grandTotal,
    delivery, ...(deliveryQuote ? { deliveryQuote } : {}),
    pricingConfirmed: grandTotal !== null, commerceVersion: 2,
    artwork: { required: custom, status: custom ? 'approved' : 'not_required', version: custom ? 1 : 0, approvedAt: custom ? new Date().toISOString() : null, versions: [] },
    filesReviewed: false, policyVersion: '2026-11-21', productionWindow: { ...rules.production },
  };
}
