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
const payload={customer:contact,items:[frame],discountCode:'WELCOME10',discountPercent:99,grandTotal:1};

test('server computes prices; client totals and sensitive payment fields are ignored',()=>{
  const result=calculateCheckout(payload);assert.equal(result.subtotal,998);assert.equal(result.discountAmount,100);assert.equal(result.shippingFee,99);assert.equal(result.grandTotal,997);assert.equal(result.items[0].price,499);assert.equal(result.items[0].title,'Regal Aurelia Photo Frame');assert.ok(!JSON.stringify(result).includes('never-store-this'));
  assert.throws(()=>calculateCheckout({...payload,items:[{...frame,quantity:1.5}]}));
  const unknown=calculateCheckout({...payload,items:[{id:'not-in-catalogue',title:'Custom wall art',type:'unknown',quantity:1,price:1}]});assert.equal(unknown.grandTotal,null);assert.equal(unknown.pricingConfirmed,false);
  assert.equal(cleanItems([{...frame,image:'http://127.0.0.1:9999/private'}])[0].image,'');
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
    const paymentOrder=await request('/payments/order',{method:'POST',body:paymentAuth});assert.equal(paymentOrder.status,200);assert.equal(paymentOrder.json.amount,99700);
    const repeatedPayment=await request('/payments/order',{method:'POST',body:paymentAuth});assert.equal(repeatedPayment.json.razorpayOrderId,paymentOrder.json.razorpayOrderId);assert.equal(orderCount,1);
    const gatewayOrder=paymentOrder.json.razorpayOrderId;
    const callback={...paymentAuth,razorpay_order_id:gatewayOrder,razorpay_payment_id:'pay_qa1',razorpay_signature:'a'.repeat(64)};
    payments.set('pay_qa1',{id:'pay_qa1',order_id:gatewayOrder,amount:99700,currency:'INR',status:'captured'});
    assert.equal((await request('/payments/verify',{method:'POST',body:callback})).status,400);
    callback.razorpay_signature=createHmac('sha256',testConfig.keySecret).update(`${gatewayOrder}|pay_qa1`).digest('hex');
    payments.get('pay_qa1').amount=1;
    assert.equal((await request('/payments/verify',{method:'POST',body:callback})).status,409);
    payments.get('pay_qa1').amount=99700;
    const verified=await request('/payments/verify',{method:'POST',body:callback});assert.equal(verified.status,200);assert.equal(verified.json.order.payment.status,'test_paid');assert.equal(verified.json.order.payment.isPaid,false);
    assert.equal((await request('/payments/order',{method:'POST',body:paymentAuth})).status,409);
    const event={event:'payment.captured',payload:{payment:{entity:payments.get('pay_qa1')}}},raw=JSON.stringify(event),signature=createHmac('sha256',testConfig.webhookSecret).update(raw).digest('hex');
    const webhook=async sig=>{const response=await fetch(`${base}/api/payments/webhook`,{method:'POST',headers:{'X-Razorpay-Signature':sig,'X-Razorpay-Event-Id':'qa-event-1'},body:raw});return {status:response.status,json:await response.json()};};
    assert.equal((await webhook('bad-signature')).status,400);assert.equal((await webhook(signature)).status,200);const callsBefore=gatewayCalls;assert.equal((await webhook(signature)).json.duplicate,true);assert.equal(gatewayCalls,callsBefore);
    const latest=(await request(`/studio/orders/${order.reference}`,{auth:true})).json.order;
    assert.equal((await request(`/studio/orders/${order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:latest.updatedAt,status:'dispatched',grandTotal:1}})).status,409);
    assert.equal((await request('/studio/orders?q=Website%20QA',{auth:true})).json.count,1);
    const quote=await request('/studio/orders',{auth:true,method:'POST',body:{customer:contact,title:'School PVC card batch',quantity:100,grandTotal:'',notes:'Quote first'}});assert.equal(quote.status,201);assert.equal(quote.json.order.grandTotal,null);
    assert.equal((await request('/payments/order',{method:'POST',body:{reference:quote.json.order.reference,token:quote.json.order.trackingToken}})).status,409);
    const liveConfig={...testConfig,mode:'live',keyId:'rzp_live_QALIVE12345',goLiveConfirmed:true};
    assert.equal((await request('/studio/settings',{auth:true,method:'PUT',body:{...liveConfig,goLiveConfirmed:false}})).status,400);
    assert.equal((await request('/studio/settings',{auth:true,method:'PUT',body:liveConfig})).status,200);
    const agreed=await request(`/studio/orders/${quote.json.order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:quote.json.order.updatedAt,status:'confirmed',grandTotal:500}});assert.equal(agreed.status,200);
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
