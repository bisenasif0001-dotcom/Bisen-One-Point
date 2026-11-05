import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createStudioService } from '../app.mjs';
import { verifyBackup, restoreBackup } from '../maintenance.mjs';
import { DEFAULT_BUSINESS_RULES, couponCalculation } from '../../src/data/businessRules.js';
import { calculateCheckout } from '../pricing.mjs';

const customer = { name:'Workflow QA', phone:'9000000011', email:'qa@example.test', address:'Test only, do not fulfil', city:'Lucknow', state:'Uttar Pradesh', pincode:'226022' };
const frame = { id:'test-line', type:'custom_frame', frameId:'regal_aurelia', size:'A5', glass:'Shatterproof Crystal Acrylic', quantity:1, price:1, originalId:'qa-original', photoName:'photo.png', image:'data:image/png;base64,preview-only' };
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==','base64');
const payload = { customer, items:[frame], fulfillment:'pickup', designConfirmed:true, discountCode:'WELCOME10' };

test('new coupon caps, pickup, unquoted courier and explicit design confirmation are enforced', () => {
  const pickup=calculateCheckout(payload);assert.equal(pickup.subtotal,499);assert.equal(pickup.discountAmount,50);assert.equal(pickup.grandTotal,449);assert.equal(pickup.shippingFee,0);
  const courier=calculateCheckout({...payload,fulfillment:'courier'});assert.equal(courier.shippingFee,null);assert.equal(courier.grandTotal,null);assert.equal(courier.pricingConfirmed,false);
  assert.throws(()=>calculateCheckout({...payload,designConfirmed:false}),/confirm/);
  assert.throws(()=>calculateCheckout({...payload,discountCode:'BARAKAH15'}),/unavailable/);
  assert.throws(()=>calculateCheckout(payload,{hasPriorOrder:true}),/first order/);
  const large=calculateCheckout({...payload,items:[{...frame,quantity:20}]});assert.equal(large.discountAmount,100);
  const fixed=calculateCheckout({...payload,items:[{...frame,quantity:4}],discountCode:'SAVE150'});assert.equal(fixed.discountAmount,150);assert.equal(fixed.shippingFee,0);
  assert.throws(()=>calculateCheckout({...payload,discountCode:'SAVE150'}),/1499/);
  const expired=structuredClone(DEFAULT_BUSINESS_RULES);expired.coupons[0].expires='2020-01-01';assert.ok(couponCalculation({rules:expired,code:'WELCOME10',subtotal:1000,items:[{type:'custom_frame',price:1000,quantity:1}]}).error.includes('expired'));
});

test('private originals, versioned proofs, support requests, actual shipping quotes and real backup restores', async () => {
  const directory=mkdtempSync(join(tmpdir(),'alnoor-workflow-test-'));
  let api, server, cookie='';
  try {
    api=createStudioService({directory,production:false,publicOrigin:'http://127.0.0.1'});
    server=createServer((req,res)=>api.handler(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const origin=`http://127.0.0.1:${server.address().port}`;
    const request=async(path,{body,auth=false,method=body?'POST':'GET',headers={},binary=false}={})=>{
      const response=await fetch(origin+'/api'+path,{method,headers:{'X-Studio-Request':'1',...(body&&!binary?{'Content-Type':'application/json'}:{}),...(auth?{Cookie:cookie}:{}),...headers},...(body?{body:binary?body:JSON.stringify(body)}:{})});
      if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];
      if(binary&&method==='GET')return {status:response.status,bytes:Buffer.from(await response.arrayBuffer()),headers:response.headers};
      return {status:response.status,json:await response.json()};
    };
    const password='Workflow-Test-Only-42';
    assert.equal((await request('/studio/setup',{body:{username:'qa-workflow',password}})).status,201);
    assert.equal((await request('/health')).json.ok,true);
    let rules=structuredClone(DEFAULT_BUSINESS_RULES);rules.shipping.freePincodes=['226022'];rules.shipping.freeMaxCharge=200;
    assert.equal((await request('/studio/business',{method:'PUT',auth:true,body:{rules,password:'wrong'}})).status,401);
    assert.equal((await request('/studio/business',{method:'PUT',auth:true,body:{rules,password}})).status,200);
    assert.equal((await request('/public/config')).json.businessRules.grievance.name,'M. Talib Khan');
    const created=await request('/orders',{body:payload,headers:{'Idempotency-Key':randomUUID()}});assert.equal(created.status,201);let order=created.json.order;
    const auth={reference:order.reference,token:order.trackingToken};
    assert.equal((await request('/orders',{body:payload,headers:{'Idempotency-Key':randomUUID()}})).status,400,'first-order offer cannot be reserved on a second active order');
    const owner=async reference=>(await request(`/studio/orders/${reference}`,{auth:true})).json.order;
    assert.equal((await request(`/studio/orders/${order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:order.updatedAt,status:'printing',filesReviewed:true}})).status,409,'missing originals prevent production');
    const upload=async({reference=order.reference,token=order.trackingToken,name='photo.png',bytes=png,kind='original',caseId=''}={})=>request('/order-files/upload',{body:bytes,binary:true,headers:{'Content-Type':'application/octet-stream','X-Order-Reference':reference,'X-Order-Token':token,'X-File-Name':encodeURIComponent(name),'X-File-Source':'qa-original','X-File-Kind':kind,'X-Case-Id':caseId}});
    assert.equal((await upload({token:'wrong'})).status,404);
    assert.equal((await upload({name:'not-an-image.png',bytes:Buffer.from('<script>bad</script>')})).status,400);
    const uploaded=await upload();assert.equal(uploaded.status,201);assert.equal((await upload()).json.duplicate,true);
    const original=uploaded.json.file;
    assert.equal((await request(`/studio/orders/${order.reference}/files/${original.id}`,{binary:true})).status,401);
    const download=await request(`/studio/orders/${order.reference}/files/${original.id}`,{auth:true,binary:true});assert.equal(download.status,200);assert.deepEqual(download.bytes,png);assert.equal(download.headers.get('cache-control'),'no-store');
    assert.equal((await request('/order-files/proof',{body:{...auth,id:original.id}})).status,404,'customer proof route does not expose originals');
    const proofUpload=await request(`/studio/orders/${order.reference}/files`,{auth:true,body:png,binary:true,headers:{'Content-Type':'application/octet-stream','X-File-Name':'proof.png'}});assert.equal(proofUpload.status,201);
    let files=(await request('/order-files/list',{body:auth})).json.files;assert.ok(!files.some(file=>file.kind==='proof'),'unpublished drafts stay private');
    order=await owner(order.reference);
    let published=await request(`/studio/orders/${order.reference}/artwork`,{auth:true,body:{updatedAt:order.updatedAt,fileIds:[proofUpload.json.file.id],note:'Check this proof'}});assert.equal(published.status,200);order=published.json.order;assert.equal(order.artwork.version,2);
    assert.equal((await request('/artwork/respond',{body:{...auth,version:1,decision:'approve',confirmed:true}})).status,409);
    assert.equal((await request('/artwork/respond',{body:{...auth,version:2,decision:'approve',confirmed:false}})).status,400);
    assert.equal((await request('/artwork/respond',{body:{...auth,version:2,decision:'changes',note:'Please move the caption'}})).json.order.artwork.status,'changes_requested');
    order=await owner(order.reference);
    assert.equal((await request(`/studio/orders/${order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:order.updatedAt,status:'printing',filesReviewed:true}})).status,409,'unapproved revision blocks production');
    published=await request(`/studio/orders/${order.reference}/artwork`,{auth:true,body:{updatedAt:order.updatedAt,fileIds:[proofUpload.json.file.id],note:'Revised caption'}});order=published.json.order;assert.equal(order.artwork.version,3);
    const approved=await request('/artwork/respond',{body:{...auth,version:3,decision:'approve',confirmed:true}});assert.equal(approved.status,200);assert.equal(approved.json.order.artwork.status,'approved');
    order=await owner(order.reference);
    assert.equal((await request(`/studio/orders/${order.reference}`,{auth:true,method:'PATCH',body:{updatedAt:order.updatedAt,status:'printing',filesReviewed:true}})).status,200);
    // Frame orders never receive the eligible PVC/photo-print courier waiver.
    const courierPayload={...payload,customer:{...customer,phone:'9000000012'},fulfillment:'courier'};
    const courier=(await request('/orders',{body:courierPayload,headers:{'Idempotency-Key':randomUUID()}})).json.order;assert.equal(courier.grandTotal,null);
    const priced=await request(`/studio/orders/${courier.reference}/pricing`,{auth:true,body:{updatedAt:courier.updatedAt,courierFee:70,packagingFee:30}});assert.equal(priced.status,200);assert.equal(priced.json.order.shippingFee,100);assert.equal(priced.json.order.grandTotal,549);
    const printItem={id:'prints',type:'photo_prints',quantity:1,price:1,photoCount:1,photos:[{assetId:'print-original',name:'photo.png'}],copiesPerPhoto:40,configuration:{sizeId:'4x6',finishId:'lustre'}};
    const printOrder=(await request('/orders',{body:{...courierPayload,customer:{...customer,phone:'9000000013'},items:[printItem]},headers:{'Idempotency-Key':randomUUID()}})).json.order;
    const free=await request(`/studio/orders/${printOrder.reference}/pricing`,{auth:true,body:{updatedAt:printOrder.updatedAt,courierFee:79,packagingFee:20}});assert.equal(free.json.order.shippingFee,0);assert.equal(free.json.order.deliveryQuote.freeDeliveryApplied,true);assert.equal(free.json.order.discountAmount,100);
    // Cancellation is tracked, does not itself refund money, and a pre-production paid cancellation is fully refundable.
    let cancelOrder=(await request('/orders',{body:{...payload,discountCode:'',customer:{...customer,phone:'9000000014'}},headers:{'Idempotency-Key':randomUUID()}})).json.order;
    cancelOrder=(await request(`/studio/orders/${cancelOrder.reference}`,{auth:true,method:'PATCH',body:{updatedAt:cancelOrder.updatedAt,status:'confirmed',recordOfflinePayment:true,paymentReference:'QA test receipt'}})).json.order;
    const cancelAuth={reference:cancelOrder.reference,token:cancelOrder.trackingToken};
    const support=await request('/support',{body:{...cancelAuth,type:'cancel',note:'Please cancel before printing starts.'}});assert.equal(support.status,201);const requestId=support.json.request.id;cancelOrder=await owner(cancelOrder.reference);
    assert.equal((await request(`/studio/orders/${cancelOrder.reference}/support`,{auth:true,body:{updatedAt:cancelOrder.updatedAt,id:requestId,status:'approved',remedy:'refund',refundAmount:100,note:'Partial amount'}})).status,400);
    cancelOrder=(await request(`/studio/orders/${cancelOrder.reference}/support`,{auth:true,body:{updatedAt:cancelOrder.updatedAt,id:requestId,status:'approved',remedy:'refund',refundAmount:cancelOrder.grandTotal,note:'Full cancellation approved'}})).json.order;assert.equal(cancelOrder.status,'cancelled');assert.equal(cancelOrder.payment.isPaid,true,'case approval is not a gateway refund');
    assert.equal((await upload({reference:cancelOrder.reference,token:cancelOrder.trackingToken,kind:'evidence',caseId:requestId,name:'evidence.png'})).status,201);
    cancelOrder=await owner(cancelOrder.reference);
    const initiated=await request(`/studio/orders/${cancelOrder.reference}/support`,{auth:true,body:{updatedAt:cancelOrder.updatedAt,id:requestId,status:'refund_initiated',refundReference:'rfnd_QAOnly',note:'Refund initiated in provider dashboard'}});assert.equal(initiated.status,200);assert.equal(initiated.json.order.requests[0].refundReference,'rfnd_QAOnly');
    const backup=await api.maintenance.backup();assert.ok(backup.orders>=4);assert.ok(backup.files>=3);
    const snapshot=join(directory,'backups',backup.id);assert.equal(verifyBackup(snapshot).orders,backup.orders);
    const before=api.store.get(order.reference).order.updatedAt;
    const drill=await api.maintenance.verify(backup.id);assert.equal(drill.restored,true);assert.equal(api.store.get(order.reference).order.updatedAt,before);
    assert.throws(()=>restoreBackup(snapshot,directory),/never overwritten/);
    // Retention removes exact working bytes and embedded previews, while a hold prevents cleanup.
    const stored=api.store.get(order.reference).order;stored.status='delivered';stored.deliveredAt=new Date(Date.now()-31*86400000).toISOString();stored.legalHold=true;api.store.save(stored);
    await api.maintenance.cleanup();assert.equal(api.originals.list(order.reference).find(file=>file.id===original.id).purgedAt,null);
    stored.legalHold=false;api.store.save(stored);const cleanup=await api.maintenance.cleanup();assert.ok(cleanup.filesRemoved>=2);assert.ok(api.store.get(order.reference).order.filesPurgedAt);assert.equal(api.store.get(order.reference).order.items[0].image,'');assert.equal(existsSync(join(directory,'originals',original.id+'.bin')),false);
    const manifestPath=join(snapshot,'manifest.json'),manifest=JSON.parse(readFileSync(manifestPath,'utf8'));manifest.createdAt=new Date(Date.now()-31*86400000).toISOString();writeFileSync(manifestPath,JSON.stringify(manifest));assert.equal((await api.maintenance.cleanup()).backupsRemoved,1);
  } finally { if(server?.listening)await new Promise(resolve=>server.close(resolve));api?.close();assert.ok(resolve(directory).startsWith(resolve(tmpdir())+sep+'alnoor-workflow-test-'));rmSync(directory,{recursive:true,force:true}); }
});
