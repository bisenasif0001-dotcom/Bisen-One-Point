export async function studioRequest(path,{method='GET',body,headers={},signal}={}){
  let response;
  try{response=await fetch(`/api${path}`,{method,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Studio-Request':'1',...headers},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal});}
  catch(error){if(error.name==='AbortError')throw error;throw new Error('The studio server is unavailable. Your bag is safe; please try again.');}
  const result=await response.json().catch(()=>({error:'The studio service is unavailable. Please reload the page.'}));
  if(!response.ok){const error=new Error(result.error||'Please try again.');error.status=response.status;throw error;}
  return result;
}
export const trackingPath=order=>`/track-order?id=${encodeURIComponent(order.reference||String(order.orderId).replace(/^#/,''))}#key=${encodeURIComponent(order.trackingToken||'')}`;
export function rememberStudioOrder(order){
  try{const previous=JSON.parse(localStorage.getItem('alnoor_server_orders')||'[]');localStorage.setItem('alnoor_server_orders',JSON.stringify([{reference:order.reference,trackingToken:order.trackingToken,placedAt:order.placedAt},...(Array.isArray(previous)?previous.filter(item=>item.reference!==order.reference):[])].slice(0,30)));}catch{/* Server order remains accessible by reference + mobile. */}
}
export function rememberedStudioOrders(){try{const items=JSON.parse(localStorage.getItem('alnoor_server_orders')||'[]');return Array.isArray(items)?items.filter(item=>/^ALN-[A-Z0-9-]+$/.test(item.reference)&&typeof item.trackingToken==='string'):[];}catch{return [];}}

let checkoutScript;
function loadRazorpay(){
  if(window.Razorpay)return Promise.resolve();
  if(!checkoutScript)checkoutScript=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.async=true;const timer=setTimeout(()=>{script.remove();checkoutScript=null;reject(new Error('Payment checkout did not load. Disable any blocking extension and try again.'));},15000);script.onload=()=>{clearTimeout(timer);if(window.Razorpay)resolve();else{checkoutScript=null;reject(new Error('Razorpay checkout is unavailable. Please retry.'));}};script.onerror=()=>{clearTimeout(timer);script.remove();checkoutScript=null;reject(new Error('Razorpay could not load. Your saved order is safe.'));};document.head.appendChild(script);});
  return checkoutScript;
}
export async function payStudioOrder(order){
  const credentials={reference:order.reference,token:order.trackingToken};
  const data=await studioRequest('/payments/order',{method:'POST',body:credentials});
  await loadRazorpay();
  return new Promise((resolve,reject)=>{
    let settled=false;
    const checkout=new window.Razorpay({key:data.keyId,order_id:data.razorpayOrderId,amount:data.amount,currency:data.currency,name:'AL-NOOR Studio',description:`Order ${data.reference}`,prefill:data.prefill,theme:{color:'#2e4b3d'},modal:{ondismiss:()=>{if(!settled){settled=true;reject(new Error('Payment checkout was closed. Your order is saved; you can pay again from its tracking page.'));}}},handler:async response=>{
      settled=true;
      try{const result=await studioRequest('/payments/verify',{method:'POST',body:{...credentials,...response}});rememberStudioOrder(result.order);resolve(result.order);}catch(error){reject(error);}
    }});
    checkout.open();
  });
}

async function smallPreview(value){
  if(typeof value!=='string'||!value.startsWith('data:image/')||value.length<60000)return value;
  return new Promise(resolve=>{const img=new Image();img.onload=()=>{const ratio=Math.min(1,480/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));const ctx=canvas.getContext('2d');if(!ctx){resolve('');return;}ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.75));};img.onerror=()=>resolve('');img.src=value;});
}
export async function prepareCheckoutItems(items){
  const cache=new Map();
  async function visit(value){if(typeof value==='string'&&value.startsWith('data:image/')){if(!cache.has(value))cache.set(value,smallPreview(value));return cache.get(value);}if(Array.isArray(value))return Promise.all(value.map(visit));if(value&&typeof value==='object'){const entries=await Promise.all(Object.entries(value).filter(([key])=>key!=='file').map(async([key,item])=>[key,await visit(item)]));return Object.fromEntries(entries);}return value;}
  return visit(items);
}
