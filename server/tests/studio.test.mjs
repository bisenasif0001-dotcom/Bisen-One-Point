import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createHmac, randomUUID } from 'node:crypto';
import { createStudioService } from '../app.mjs';
import { gatewayPaymentState, validSignature } from '../gateway.mjs';
import { calculateCheckout, cleanItems } from '../pricing.mjs';

const contact={name:'Website QA',phone:'9000000000',email:'qa@example.test',address:'Test only — not a delivery',city:'Lucknow',state:'Uttar Pradesh',pincode:'226022',cardCvv:'never-store-this'};
const frame={id:'qa-frame',type:'custom_frame',title:'Untrusted cheap title',frameId:'regal_aurelia',size:'A5',glass:'Shatterproof Crystal Acrylic',price:1,quantity:2};
const payload={customer:contact,items:[frame],discountCode:'WELCOME10',discountPercent:99,grandTotal:1,fulfillment:'pickup',designConfirmed:true};

test('server computes prices; client totals and sensitive payment fields are ignored',()=>{
  const result=calculateCheckout(payload);assert.equal(result.subtotal,718);assert.equal(result.discountAmount,72);assert.equal(result.shippingFee,0);assert.equal(result.grandTotal,646);assert.equal(result.items[0].price,359);assert.equal(result.items[0].title,'Regal Aurelia Photo Frame');assert.ok(!JSON.stringify(result).includes('never-store-this'));
  const emptyFrame=calculateCheckout({...payload,discountCode:'',designConfirmed:false,items:[{...frame,size:'13x19',quantity:1,configuration:{includePrint:false}}]});
  assert.equal(emptyFrame.items[0].price,529);assert.equal(emptyFrame.items[0].title,'Regal Aurelia Frame (Without Print)');assert.equal(emptyFrame.artwork.required,false);
  const withPrint1622=calculateCheckout({...payload,discountCode:'',items:[{...frame,size:'16x22',quantity:1,configuration:{includePrint:true}}]});
  assert.equal(withPrint1622.items[0].price,1149);
  const asmaAndDua=calculateCheckout({...payload,discountCode:'',designConfirmed:false,items:[{id:'qa-asma-print',type:'islamic_art',productId:'asma-02-ar-raheem',size:'A4',frameId:null,quantity:1},{id:'qa-asma-framed',type:'islamic_art',productId:'asma-02-ar-raheem',size:'A4',frameId:'regal_noir',quantity:1},{id:'qa-dua-a4',type:'dua_poster',productId:'allah-will-suffice-you-in-everything',size:'A4',frameId:null,quantity:1},{id:'qa-dua-a3',type:'dua_poster',productId:'allah-will-suffice-you-in-everything',size:'A3',frameId:null,quantity:1}]});
  assert.equal(asmaAndDua.items[0].price,79);assert.equal(asmaAndDua.items[1].price,408);assert.equal(asmaAndDua.items[2].price,79);assert.equal(asmaAndDua.items[3].price,149);
  assert.throws(()=>calculateCheckout({...payload,items:[{...frame,quantity:1.5}]}));
  const unknown=calculateCheckout({...payload,discountCode:'',items:[{id:'not-in-catalogue',title:'Custom wall art',type:'unknown',quantity:1,price:1}]});assert.equal(unknown.grandTotal,null);assert.equal(unknown.pricingConfirmed,false);
  assert.equal(cleanItems([{...frame,image:'http://127.0.0.1:9999/private'}])[0].image,'');
});

test('priceOverrides apply across all catalogue builders and checkout categories',()=>{
  const overrides={
    frameSizes:{A5:400,A4:700},
    frameFinishes:{regal_aurelia:250},
    printSizes:{'4x6':35},
    cardSizes:{'5x7':250},
    galleryLayouts:{'classic-trio':2999},
    itraPrices:{'oud-royale':{'6ml':999}},
    islamicArt:{'asma-001-ya-allah':{framedPriceA4:950}},
    duaPrices:{A4:55,A3:110},
    pvcPrices:{single_card:120,design_fee:199},
  };
  const priced=calculateCheckout({
    ...payload,
    discountCode:'',
    items:[
      {...frame,quantity:2},
      {id:'qa-prints',type:'photo_prints',photoCount:2,photos:['/hero/a.jpg','/hero/b.jpg'],copiesPerPhoto:3,configuration:{sizeId:'4x6',finishId:'lustre'},quantity:1},
      {id:'qa-card',type:'birthday_card',configuration:{templateId:'minimal_editorial',sizeId:'5x7',cardCount:1},quantity:2},
      {id:'qa-gallery',type:'gallery_wall',configuration:{layoutId:'classic-trio',frameId:'regal_aurelia'},quantity:1},
      {id:'qa-itra',type:'itra',productId:'oud-royale',volume:'6ml',quantity:1},
      {id:'qa-asma',type:'islamic_art',productId:'asma-001-ya-allah',size:'A4',frameId:'regal_aurelia',quantity:1},
      {id:'qa-dua-framed',type:'dua_poster',productId:'allah-will-suffice-you-in-everything',size:'A4',frameId:'regal_aurelia',quantity:1},
      {id:'qa-dua-print',type:'dua_poster',productId:'allah-will-suffice-you-in-everything',size:'A3',frameId:null,quantity:2},
      {id:'qa-pvc',type:'pvc_card',productId:'employee-id-card',configuration:{productId:'employee-id-card',type:'employee',cardCount:1,sides:'single',orientation:'portrait',accessories:'none',design:'design'},quantity:1},
    ],
  },{priceOverrides:overrides});
  assert.equal(priced.items[0].price,730);
  assert.equal(priced.items[1].price,210);
  assert.equal(priced.items[2].price,250);
  assert.equal(priced.items[3].price,3749);
  assert.equal(priced.items[4].price,999);
  assert.equal(priced.items[5].price,1200);
  assert.equal(priced.items[6].price,55+700+250);
  assert.equal(priced.items[7].price,110);
  assert.equal(priced.items[8].price,120+199);
  assert.equal(priced.subtotal,730*2+210+250*2+3749+999+1200+(55+700+250)+110*2+(120+199));

  // Default Gallery Wall & unified frame-size propagation assertions
  const galleryDefaults=calculateCheckout({...payload,discountCode:'',items:[
    {id:'gw-1',type:'gallery_wall',configuration:{layoutId:'classic-trio',frameId:'regal_aurelia'},quantity:1},
    {id:'gw-2',type:'gallery_wall',configuration:{layoutId:'classic-trio',frameId:'regal_heritage'},quantity:1},
    {id:'gw-3',type:'gallery_wall',configuration:{layoutId:'family-wall',frameId:'regal_noir'},quantity:1},
    {id:'gw-4',type:'gallery_wall',configuration:{layoutId:'wedding-salon',frameId:'regal_aurelia'},quantity:1},
    {id:'gw-5',type:'gallery_wall',configuration:{layoutId:'memory-grid',frameId:'regal_noir'},quantity:1},
  ]});
  assert.equal(galleryDefaults.items[0].price,1737);
  assert.equal(galleryDefaults.items[1].price,2187);
  assert.equal(galleryDefaults.items[2].price,2965);
  assert.equal(galleryDefaults.items[3].price,4123);
  assert.equal(galleryDefaults.items[4].price,3861);

  const synced=calculateCheckout({...payload,discountCode:'',designConfirmed:true,items:[
    {id:'s-1',type:'gallery_wall',configuration:{layoutId:'classic-trio',frameId:'regal_aurelia'},quantity:1},
    {id:'s-2',type:'gallery_wall',configuration:{layoutId:'memory-grid',frameId:'regal_noir'},quantity:1},
    {id:'s-3',type:'dua_poster',productId:'allah-will-suffice-you-in-everything',size:'A4',frameId:'regal_aurelia',quantity:1},
    {id:'s-4',type:'islamic_art',productId:'asma-02-ar-raheem',size:'A4',frameId:'regal_aurelia',quantity:1},
  ]},{priceOverrides:{frameSizes:{A3:500,A4:380},framePrintAddons:{A3:150},duaPrices:{A4:99}}});
  assert.equal(synced.items[0].price,1950);
  assert.equal(synced.items[1].price,4320);
  assert.equal(synced.items[2].price,479);
  assert.equal(synced.items[3].price,479);

  // Default PVC card pricing & shipping assertions
  const pvcSingle=calculateCheckout({...payload,discountCode:'',fulfillment:'courier',customer:{...contact,pincode:'226022'},items:[{id:'pvc-1',type:'pvc_card',productId:'employee-id-card',configuration:{productId:'employee-id-card',type:'employee',cardCount:1,sides:'single',orientation:'portrait',accessories:'none',design:'upload'},quantity:1}]});
  assert.equal(pvcSingle.items[0].price,99);assert.equal(pvcSingle.shippingFee,59);assert.equal(pvcSingle.grandTotal,158);
  const pvcFull=calculateCheckout({...payload,discountCode:'',fulfillment:'courier',customer:{...contact,pincode:'110001'},items:[{id:'pvc-2',type:'pvc_card',productId:'employee-id-card',configuration:{productId:'employee-id-card',type:'employee',cardCount:1,sides:'double',orientation:'portrait',accessories:'both',design:'design'},quantity:1}]});
  assert.equal(pvcFull.items[0].price,328);assert.equal(pvcFull.shippingFee,69);assert.equal(pvcFull.grandTotal,397);
  const pvcBulk=calculateCheckout({...payload,discountCode:'',fulfillment:'courier',customer:{...contact,pincode:'110001'},items:[{id:'pvc-3',type:'pvc_card',productId:'employee-id-card',configuration:{productId:'employee-id-card',type:'employee',cardCount:25,sides:'single',orientation:'portrait',accessories:'none',design:'upload'},quantity:1}]});
  assert.equal(pvcBulk.items[0].price,74*25);assert.equal(pvcBulk.shippingFee,0);assert.equal(pvcBulk.grandTotal,1850);
});

test('HMAC verification and captured/test/refund states remain distinct',()=>{
  const signature=createHmac('sha256','qa-secret').update('order_qa|pay_qa').digest('hex');
  assert.equal(validSignature('order_qa|pay_qa',signature,'qa-secret'),true);assert.equal(validSignature('wrong',signature,'qa-secret'),false);assert.equal(validSignature('data','malformed','qa-secret'),false);
  assert.equal(gatewayPaymentState({amount:10000,currency:'INR',status:'authorized'},10000,'live').isPaid,false);
  assert.equal(gatewayPaymentState({amount:10000,currency:'INR',status:'captured'},10000,'test').isPaid,false);
  assert.equal(gatewayPaymentState({amount:10000,currency:'INR',status:'captured'},10000,'live').isPaid,true);
  assert.equal(gatewayPaymentState({amount:10000,currency:'INR',status:'captured',amount_refunded:10000},10000,'live').status,'refunded');
  assert.throws(()=>gatewayPaymentState({amount:1,currency:'INR',status:'captured'},10000,'live'));
});

test('orders persist, studio access is protected, updates reach another customer session, and Razorpay callbacks/webhooks are verified',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'alnoor-studio-test-'));
  let api,server,cookie='',gatewayCalls=0,orderCount=0;
  const payments=new Map();
  const fakeGateway=async(url,options)=>{
    gatewayCalls++;assert.ok(options.headers.Authorization.startsWith('Basic '));
    if(url.endsWith('/orders?count=1'))return new Response(JSON.stringify({entity:'collection',count:0,items:[]}),{status:200});
    if(url.endsWith('/orders')&&options.method==='POST'){const request=JSON.parse(options.body),id=`order_qa${++orderCount}`;return new Response(JSON.stringify({id,amount:request.amount,currency:'INR'}),{status:200});}
    const match=url.match(/\/payments\/(pay_[A-Za-z0-9]+)$/);if(match&&payments.has(match[1]))return new Response(JSON.stringify(payments.get(match[1])),{status:200});
    const list=url.match(/\/orders\/(order_[A-Za-z0-9]+)\/payments$/);if(list)return new Response(JSON.stringify({items:[...payments.values()].filter(payment=>payment.order_id===list[1])}),{status:200});
    return new Response('{}',{status:404});
  };
  try{
    api=createStudioService({directory,publicOrigin:'https://studio.example.test',production:false,fetcher:fakeGateway});
    server=createServer((req,res)=>api.handler(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${server.address().port}`;
    const request=async(path,{method='GET',body,auth=false,origin='https://studio.example.test',headers={}}={})=>{
      const response=await fetch(`${base}/api${path}`,{method,headers:{'Content-Type':'application/json','X-Studio-Request':'1',Origin:origin,...(auth?{Cookie:cookie}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});
      const json=await response.json();return {status:response.status,json,cookie:response.headers.get('set-cookie')};
    };
    assert.equal((await request('/studio/orders')).status,401);
    assert.equal((await request('/studio/session')).json.setupRequired,true);
    assert.equal((await request('/studio/setup',{method:'POST',body:{username:'qa-owner',password:'short'}})).status,400);
    const setup=await request('/studio/setup',{method:'POST',body:{username:'qa-owner',password:'Only-for-isolated-QA-123'}});assert.equal(setup.status,201);cookie=setup.cookie.split(';')[0];assert.ok(setup.cookie.includes('HttpOnly')&&setup.cookie.includes('SameSite=Strict'));
    assert.equal((await request('/studio/setup',{method:'POST',body:{username:'attacker',password:'long-enough-password'}})).status,409);
    assert.equal((await request('/studio/orders',{auth:true,origin:'https://evil.example'})).status,403);
    assert.equal((await request('/studio/settings',{auth:true,method:'PUT',body:{password:'wrong'}})).status,401);
    const key=randomUUID();const placed=await request('/orders',{method:'POST',body:payload,headers:{'Idempotency-Key':key}});assert.equal(placed.status,201);let order=placed.json.order;
    assert.match(order.reference,/^ALN-[A-F0-9]{12}$/);assert.equal(order.payment.isPaid,false);assert.ok(!JSON.stringify(order).includes('never-store-this'));
    const duplicate=await request('/orders',{method:'POST',body:payload,headers:{'Idempotency-Key':key}});assert.equal(duplicate.json.order.reference,order.reference);
    assert.equal((await request('/orders',{method:'POST',body:{...payload,grandTotal:2},headers:{'Idempotency-Key':key}})).status,409);
    assert.equal((await request('/track',{method:'POST',body:{reference:order.reference,phone:'9111111111'}})).status,404);
    const publicLookup=await request('/track',{method:'POST',body:{reference:order.reference,phone:contact.phone}});assert.equal(publicLookup.status,200);assert.equal(publicLookup.json.order.customer.phone,undefined);assert.equal(publicLookup.json.order.customer.address,undefined);assert.equal(publicLookup.json.order.privateNotes,undefined);
    const updated=await request(`/studio/orders/${order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:order.updatedAt,status:'dispatched',publicNote:'Your frames are on their way.',privateNotes:'Staff-only instructions',delivery:{courier:'Example courier',awb:'QA123',trackingUrl:'https://courier.example.test/QA123',expectedDate:'2026-12-10'},grandTotal:order.grandTotal}});assert.equal(updated.status,200);order=updated.json.order;
    assert.equal((await request(`/studio/orders/${order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:placed.json.order.updatedAt,status:'ready'}})).status,409);
    assert.equal((await request('/track',{method:'POST',body:{reference:order.reference,token:order.trackingToken}})).json.order.status,'dispatched');
    assert.equal((await request(`/studio/orders/${order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:order.updatedAt,status:'dispatched',delivery:{trackingUrl:'javascript:alert(1)'}}})).status,400);
    assert.equal((await request('/payments/order',{method:'POST',body:{reference:order.reference,token:order.trackingToken}})).status,503);
    const testConfig={mode:'test',keyId:'rzp_test_QATEST12345',keySecret:'isolated-test-secret-123',webhookSecret:'isolated-webhook-secret-123',enabled:true,password:'Only-for-isolated-QA-123'};
    const settings=await request('/studio/settings',{auth:true,method:'PUT',body:testConfig});assert.equal(settings.status,200);assert.ok(!JSON.stringify(settings.json).includes(testConfig.keySecret));
    assert.equal((await request('/public/config')).json.paymentMode,'test');
    const paymentAuth={reference:order.reference,token:order.trackingToken};
    const paymentOrder=await request('/payments/order',{method:'POST',body:paymentAuth});assert.equal(paymentOrder.status,200);assert.equal(paymentOrder.json.amount,64600);
    const repeatedPayment=await request('/payments/order',{method:'POST',body:paymentAuth});assert.equal(repeatedPayment.json.razorpayOrderId,paymentOrder.json.razorpayOrderId);assert.equal(orderCount,1);
    const gatewayOrder=paymentOrder.json.razorpayOrderId;
    const callback={...paymentAuth,razorpay_order_id:gatewayOrder,razorpay_payment_id:'pay_qa1',razorpay_signature:'a'.repeat(64)};
    payments.set('pay_qa1',{id:'pay_qa1',order_id:gatewayOrder,amount:64600,currency:'INR',status:'captured'});
    assert.equal((await request('/payments/verify',{method:'POST',body:callback})).status,400);
    callback.razorpay_signature=createHmac('sha256',testConfig.keySecret).update(`${gatewayOrder}|pay_qa1`).digest('hex');
    payments.get('pay_qa1').amount=1;
    assert.equal((await request('/payments/verify',{method:'POST',body:callback})).status,409);
    payments.get('pay_qa1').amount=64600;
    const verified=await request('/payments/verify',{method:'POST',body:callback});assert.equal(verified.status,200);assert.equal(verified.json.order.payment.status,'test_paid');assert.equal(verified.json.order.payment.isPaid,false);
    assert.equal((await request('/payments/order',{method:'POST',body:paymentAuth})).status,409);
    const event={event:'payment.captured',payload:{payment:{entity:payments.get('pay_qa1')}}},raw=JSON.stringify(event),signature=createHmac('sha256',testConfig.webhookSecret).update(raw).digest('hex');
    const webhook=async sig=>{const response=await fetch(`${base}/api/payments/webhook`,{method:'POST',headers:{'X-Razorpay-Signature':sig,'X-Razorpay-Event-Id':'qa-event-1'},body:raw});return {status:response.status,json:await response.json()};};
    assert.equal((await webhook('bad-signature')).status,400);assert.equal((await webhook(signature)).status,200);const callsBefore=gatewayCalls;assert.equal((await webhook(signature)).json.duplicate,true);assert.equal(gatewayCalls,callsBefore);
    const latest=(await request(`/studio/orders/${order.reference}`,{auth:true})).json.order;
    assert.equal((await request(`/studio/orders/${order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:latest.updatedAt,status:'dispatched',grandTotal:1}})).status,409);
    const listRes=await request('/studio/orders?q=Website%20QA',{auth:true});assert.equal(listRes.json.count,1);assert.equal(listRes.json.orders[0].pricingConfirmed,true);assert.equal(listRes.json.orders[0].deliveryMethod,'pickup');assert.equal(listRes.json.orders[0].itemCount,1);assert.ok(listRes.json.orders[0].itemSummary);assert.equal(listRes.json.summary.dispatchedCount,1);assert.equal(listRes.json.summary.fulfillmentCount,1);
    assert.equal((await request('/studio/orders?status=group:fulfillment',{auth:true})).json.count,1);
    const quote=await request('/studio/orders',{auth:true,method:'POST',body:{customer:contact,title:'School PVC card batch',quantity:100,grandTotal:'',notes:'Quote first'}});assert.equal(quote.status,201);assert.equal(quote.json.order.grandTotal,null);
    assert.equal((await request('/studio/orders?status=group:quote_pending',{auth:true})).json.count,1);
    assert.equal((await request('/studio/orders?status=group:attention',{auth:true})).json.count,1);
    const invalidPin=await request(`/studio/orders/${quote.json.order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:quote.json.order.updatedAt,status:quote.json.order.status,customer:{pincode:'123'}}});assert.equal(invalidPin.status,400);
    const patchedAddr=await request(`/studio/orders/${quote.json.order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:quote.json.order.updatedAt,status:'confirmed',delivery:{method:'courier',provider:'Porter (Lucknow)'},customer:{address:'Milan Tower Kursi Road',city:'Lucknow',state:'Uttar Pradesh',pincode:'226022'}}});assert.equal(patchedAddr.status,200);assert.equal(patchedAddr.json.order.delivery.method,'courier');assert.equal(patchedAddr.json.order.customer.address,'Milan Tower Kursi Road');
    const prodGroup=await request('/studio/orders?status=group:production',{auth:true});assert.equal(prodGroup.json.count,1);assert.equal(prodGroup.json.summary.productionCount,1);assert.equal(prodGroup.json.orders[0].reference,quote.json.order.reference);
    const overviewRes=await request('/studio/overview',{auth:true});assert.equal(overviewRes.status,200);assert.equal(overviewRes.json.orders.productionCount,1);assert.equal(overviewRes.json.payments.mode,'test');
    assert.equal((await request('/payments/order',{method:'POST',body:{reference:quote.json.order.reference,token:quote.json.order.trackingToken}})).status,409);
    const liveConfig={...testConfig,mode:'live',keyId:'rzp_live_QALIVE12345',goLiveConfirmed:true};
    assert.equal((await request('/studio/settings',{auth:true,method:'PUT',body:{...liveConfig,goLiveConfirmed:false}})).status,400);
    assert.equal((await request('/studio/settings',{auth:true,method:'PUT',body:liveConfig})).status,200);
    const agreed=await request(`/studio/orders/${quote.json.order.reference}/pricing`,{auth:true,method:'POST',body:{updatedAt:patchedAddr.json.order.updatedAt,deliveryMethod:'pickup',itemsSubtotal:500}});assert.equal(agreed.status,200);assert.equal(agreed.json.order.shippingFee,0);assert.equal(agreed.json.order.delivery.method,'pickup');
    const initialPrices=await request('/studio/prices',{auth:true});assert.equal(initialPrices.status,200);assert.ok(initialPrices.json.defaults.frameSizes.length>0);
    const savePrices=await request('/studio/prices',{auth:true,method:'PUT',body:{password:'Only-for-isolated-QA-123',overrides:{bogusKey:999,frameSizes:{A5:400,nonexistentSize:999},framePrintAddons:{A5:110,nonexistentSize:999},frameFinishes:{regal_aurelia:250},printSizes:{'4x6':35},cardSizes:{'5x7':250},galleryLayouts:{'classic-trio':2999},itraPrices:{'oud-royale':{'6ml':999}},islamicArt:{'asma-001-ya-allah':{framedPriceA4:950}},pvcPrices:{single_card:120,design_fee:199}}}});
    assert.equal(savePrices.status,200);
    assert.equal(savePrices.json.overrides.bogusKey,undefined);
    assert.equal(savePrices.json.overrides.frameSizes.nonexistentSize,undefined);
    assert.equal(savePrices.json.overrides.frameSizes.A5,400);
    assert.equal(savePrices.json.overrides.framePrintAddons.nonexistentSize,undefined);
    assert.equal(savePrices.json.overrides.framePrintAddons.A5,110);
    assert.equal(savePrices.json.overrides.frameFinishes.regal_aurelia,250);
    assert.equal(savePrices.json.overrides.printSizes['4x6'],35);
    assert.equal(savePrices.json.overrides.cardSizes['5x7'],250);
    assert.equal(savePrices.json.overrides.galleryLayouts['classic-trio'],2999);
    assert.equal(savePrices.json.overrides.itraPrices['oud-royale']['6ml'],999);
    assert.equal(savePrices.json.overrides.islamicArt['asma-001-ya-allah'].framedPriceA4,950);
    assert.equal(savePrices.json.overrides.pvcPrices.single_card,120);
    assert.equal(savePrices.json.overrides.pvcPrices.design_fee,199);
    const publicConfig=await request('/public/config');assert.equal(publicConfig.json.priceOverrides.frameSizes.A5,400);assert.equal(publicConfig.json.priceOverrides.pvcPrices.single_card,120);assert.equal(publicConfig.json.priceOverrides.bogusKey,undefined);
    const quoteAuth={reference:quote.json.order.reference,token:quote.json.order.trackingToken};
    const liveAttempt=await request('/payments/order',{method:'POST',body:quoteAuth});assert.equal(liveAttempt.status,200);
    payments.set('pay_qaLive',{id:'pay_qaLive',order_id:liveAttempt.json.razorpayOrderId,amount:50000,currency:'INR',status:'authorized'});
    const liveCallback={...quoteAuth,razorpay_order_id:liveAttempt.json.razorpayOrderId,razorpay_payment_id:'pay_qaLive',razorpay_signature:createHmac('sha256',liveConfig.keySecret).update(`${liveAttempt.json.razorpayOrderId}|pay_qaLive`).digest('hex')};
    assert.equal((await request('/payments/verify',{method:'POST',body:liveCallback})).json.order.payment.isPaid,false);
    payments.get('pay_qaLive').status='captured';
    const liveVerified=await request('/payments/verify',{method:'POST',body:liveCallback});assert.equal(liveVerified.status,200);assert.equal(liveVerified.json.order.payment.isPaid,true);
    payments.get('pay_qaLive').amount_refunded=50000;
    const refunded=await request('/payments/recheck',{method:'POST',body:quoteAuth});assert.equal(refunded.status,200);assert.equal(refunded.json.order.payment.status,'refunded');assert.equal(refunded.json.order.payment.isPaid,false);
    const enquiryKey=randomUUID(),enquiry={title:'Gym membership card',details:'Front + back; holder and lanyard. Namaste नमस्ते.',customer:contact};
    const enquired=await request('/enquiries',{method:'POST',body:enquiry,headers:{'Idempotency-Key':enquiryKey}});assert.equal(enquired.status,201);assert.equal(enquired.json.order.pricingConfirmed,false);
    assert.equal((await request('/enquiries',{method:'POST',body:enquiry,headers:{'Idempotency-Key':enquiryKey}})).json.order.reference,enquired.json.order.reference);
    await request('/studio/logout',{auth:true,method:'POST'});assert.equal((await request('/studio/orders',{auth:true})).status,401);
    await new Promise(resolve=>server.close(resolve));api.close();api=null;
    const reopened=createStudioService({directory,production:false,publicOrigin:'https://studio.example.test',fetcher:fakeGateway});assert.equal(reopened.store.get(order.reference).order.status,'dispatched');assert.equal(reopened.store.get(order.reference).order.payment.status,'test_paid');reopened.close();
  }finally{if(server?.listening)await new Promise(resolve=>server.close(resolve));api?.close();assert.ok(resolve(directory).startsWith(resolve(tmpdir())+sep+'alnoor-studio-test-'));rmSync(directory,{recursive:true,force:true});}
});

test('local dev test payment simulator works without Razorpay keys and is strictly blocked in production',async()=>{
  const devDir=mkdtempSync(join(tmpdir(),'alnoor-sandbox-dev-')),prodDir=mkdtempSync(join(tmpdir(),'alnoor-sandbox-prod-'));
  let devApi,devServer,prodApi,prodServer;
  try{
    devApi=createStudioService({directory:devDir,publicOrigin:'http://localhost:5173',production:false});
    devServer=createServer((req,res)=>devApi.handler(req,res));await new Promise(resolve=>devServer.listen(0,'127.0.0.1',resolve));
    const devBase=`http://127.0.0.1:${devServer.address().port}`;
    let devCookie='';
    const devReq=async(path,{method='GET',body,auth=false,headers={}}={})=>{
      const response=await fetch(`${devBase}/api${path}`,{method,headers:{'Content-Type':'application/json','X-Studio-Request':'1',Origin:'http://localhost:5173',...(auth?{Cookie:devCookie}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});
      return {status:response.status,json:await response.json(),cookie:response.headers.get('set-cookie')};
    };
    const setup=await devReq('/studio/setup',{method:'POST',body:{username:'sandbox-qa',password:'Sandbox-Only-QA-123'}});
    assert.equal(setup.status,201);devCookie=setup.cookie.split(';')[0];
    const saved=await devReq('/studio/settings',{auth:true,method:'PUT',body:{mode:'sandbox',enabled:true,password:'Sandbox-Only-QA-123'}});
    assert.equal(saved.status,200);assert.equal(saved.json.provider,'sandbox');assert.equal(saved.json.enabled,true);assert.equal(saved.json.sandboxAllowed,true);
    const pub=await devReq('/public/config');
    assert.equal(pub.json.onlinePayments,true);assert.equal(pub.json.paymentMode,'test');assert.equal(pub.json.paymentProvider,'sandbox');
    const created=await devReq('/orders',{method:'POST',body:payload,headers:{'Idempotency-Key':randomUUID()}});
    assert.equal(created.status,201);const order=created.json.order,authBody={reference:order.reference,token:order.trackingToken};
    const simOrder=await devReq('/payments/order',{method:'POST',body:authBody});
    assert.equal(simOrder.status,200);assert.equal(simOrder.json.provider,'sandbox');assert.match(simOrder.json.razorpayOrderId,/^order_sim_[a-f0-9]+$/);assert.equal(simOrder.json.amount,order.grandTotal*100);
    const failed=await devReq('/payments/sandbox',{method:'POST',body:{...authBody,razorpay_order_id:simOrder.json.razorpayOrderId,outcome:'failed',paymentMethod:'upi'}});
    assert.equal(failed.status,200);assert.equal(failed.json.order.payment.status,'failed');assert.equal(failed.json.order.payment.isPaid,false);
    const retryOrder=await devReq('/payments/order',{method:'POST',body:authBody});
    assert.equal(retryOrder.status,200);
    const passed=await devReq('/payments/sandbox',{method:'POST',body:{...authBody,razorpay_order_id:retryOrder.json.razorpayOrderId,outcome:'captured',paymentMethod:'upi'}});
    assert.equal(passed.status,200);assert.equal(passed.json.order.payment.status,'test_paid');assert.equal(passed.json.order.payment.isPaid,false);assert.equal(passed.json.order.payment.mode,'test');
    assert.equal((await devReq('/payments/order',{method:'POST',body:authBody})).status,409);
    assert.equal((await devReq('/payments/sandbox',{method:'POST',body:{...authBody,razorpay_order_id:retryOrder.json.razorpayOrderId,outcome:'captured'}})).status,409);
    assert.equal((await devReq('/payments/recheck',{method:'POST',body:authBody})).status,200);
    assert.equal((await devReq('/studio/settings',{auth:true,method:'PUT',body:{mode:'test',enabled:true,keyId:'',keySecret:'',password:'Sandbox-Only-QA-123'}})).status,400);

    prodApi=createStudioService({directory:prodDir,publicOrigin:'https://studio.example.test',production:true,bootstrapToken:'prod-qa-token'});
    prodServer=createServer((req,res)=>prodApi.handler(req,res));await new Promise(resolve=>prodServer.listen(0,'127.0.0.1',resolve));
    const prodBase=`http://127.0.0.1:${prodServer.address().port}`;
    let prodCookie='';
    const prodReq=async(path,{method='GET',body,auth=false}={})=>{
      const response=await fetch(`${prodBase}/api${path}`,{method,headers:{'Content-Type':'application/json','X-Studio-Request':'1',Origin:'https://studio.example.test',...(auth?{Cookie:prodCookie}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
      return {status:response.status,json:await response.json(),cookie:response.headers.get('set-cookie')};
    };
    const prodSetup=await prodReq('/studio/setup',{method:'POST',body:{username:'prod-qa',password:'Prod-Only-QA-123',setupToken:'prod-qa-token'}});
    assert.equal(prodSetup.status,201);prodCookie=prodSetup.cookie.split(';')[0];
    assert.equal((await prodReq('/studio/settings',{auth:true})).json.sandboxAllowed,false);
    assert.equal((await prodReq('/studio/settings',{auth:true,method:'PUT',body:{mode:'sandbox',enabled:true,password:'Prod-Only-QA-123'}})).status,403);
    assert.equal((await prodReq('/payments/sandbox',{method:'POST',body:{reference:'ALN-000',token:'bad'}})).status,404);
  }finally{
    if(devServer?.listening)await new Promise(resolve=>devServer.close(resolve));devApi?.close();
    if(prodServer?.listening)await new Promise(resolve=>prodServer.close(resolve));prodApi?.close();
    assert.ok(resolve(devDir).startsWith(resolve(tmpdir())+sep+'alnoor-sandbox-dev-'));rmSync(devDir,{recursive:true,force:true});
    assert.ok(resolve(prodDir).startsWith(resolve(tmpdir())+sep+'alnoor-sandbox-prod-'));rmSync(prodDir,{recursive:true,force:true});
  }
});
