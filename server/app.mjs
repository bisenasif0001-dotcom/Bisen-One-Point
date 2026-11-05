import { createOriginalStorage } from './originalFiles.mjs';
import { createMaintenance } from './maintenance.mjs';
import { readBusinessRules, validateBusinessRules } from './businessRules.mjs';
import { initialArtwork, publishProof, respondToProof, createSupportRequest, updateSupportRequest } from './orderWorkflow.mjs';
import { originalReferences, ORDER_FILE_RULES } from '../src/data/orderFiles.js';
import { isFreeDeliveryEligible } from '../src/data/businessRules.js';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { isIP } from 'node:net';
import { resolve } from 'node:path';
import { openStore, hash } from './store.mjs';
import { ApiError, calculateCheckout, cleanText, phoneNumber, validateCustomer } from './pricing.mjs';
import { gatewayPaymentState, razorpayRequest, validSignature } from './gateway.mjs';

const scrypt=promisify(scryptCallback);
export const STAGES=[['received','Order received'],['confirmed','Order confirmed'],['design_approved','Design approved'],['printing','Printing & making'],['ready','Ready for collection / dispatch'],['dispatched','Dispatched'],['delivered','Delivered / collected']];
const same=(a,b)=>{const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y);};
const referenceOf=value=>String(value||'').trim().replace(/^#/,'').toUpperCase();
const now=()=>new Date().toISOString();
const defaultPayment=()=>({status:'unpaid',label:'Awaiting payment',method:'studio',isPaid:false});
const allowedStatus=value=>STAGES.some(([id])=>id===value)||value==='cancelled';
const loopback=address=>['::1','127.0.0.1','::ffff:127.0.0.1'].includes(address);

export function createStudioService({directory=resolve('.studio-data'),production=process.env.NODE_ENV==='production',publicOrigin=process.env.PUBLIC_ORIGIN||'http://localhost:5173',bootstrapToken=process.env.STUDIO_BOOTSTRAP_TOKEN||'',fetcher=fetch}={}){
  const store=openStore(directory),{db,encrypt,decrypt,get,save,audit,transaction}=store;
  const originals=createOriginalStorage(store,directory);
  const maintenance=createMaintenance(store,originals,directory,{backupRoot:process.env.BACKUP_DIR||undefined});
  const rules=()=>readBusinessRules(db);
  const origin=new URL(publicOrigin).origin;
  if(production&&!origin.startsWith('https://'))throw new Error('PUBLIC_ORIGIN must be the live HTTPS website address.');
  const limits=new Map(),paymentLocks=new Set();
  const currentSettings=()=>{const row=db.prepare('SELECT * FROM gateway_settings ORDER BY id DESC LIMIT 1').get();return row?{id:row.id,...decrypt(row.secret)}:{enabled:false,mode:'test'};};
  const configById=id=>{const row=db.prepare('SELECT * FROM gateway_settings WHERE id=?').get(id);if(!row)throw new ApiError(503,'The original payment settings are unavailable. Contact the studio.');return {id:row.id,...decrypt(row.secret)};};
  const gatewayAvailable=config=>Boolean(config.enabled&&config.keyId&&config.keySecret&&(config.mode!=='live'||(origin.startsWith('https://')&&config.webhookSecret&&config.goLiveConfirmed)));
  const settingsSummary=()=>{const config=currentSettings();return {configured:Boolean(config.keyId),enabled:gatewayAvailable(config),mode:config.mode,keyId:config.keyId?`${config.keyId.slice(0,9)}…${config.keyId.slice(-4)}`:'',hasSecret:Boolean(config.keySecret),hasWebhookSecret:Boolean(config.webhookSecret),publicOrigin:origin,webhookUrl:`${origin}/api/payments/webhook`,liveAllowed:origin.startsWith('https://'),goLiveConfirmed:config.goLiveConfirmed||false};};
  function rate(req,name,max,window=60000){const forwarded=req.headers['x-real-ip'];const address=production&&process.env.TRUST_PROXY==='1'&&loopback(req.socket.remoteAddress)&&typeof forwarded==='string'&&isIP(forwarded)?forwarded:req.socket.remoteAddress;const key=`${name}:${address}`;const entry=limits.get(key);if(!entry||entry.until<Date.now()){if(limits.size>20000)limits.clear();limits.set(key,{count:1,until:Date.now()+window});}else if(++entry.count>max)throw new ApiError(429,'Too many attempts. Please wait a minute and try again.');}
  function json(res,status,value,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...headers});res.end(JSON.stringify(value));}
  async function body(req,max=8_000_000){const parts=[];let length=0;for await(const part of req){length+=part.length;if(length>max)throw new ApiError(413,'This request is too large. Please reduce the preview sizes.');parts.push(part);}return Buffer.concat(parts);}
  const parse=raw=>{try{return JSON.parse(raw.toString());}catch{throw new ApiError(400,'The request could not be read. Please retry.');}};
  const admin=()=>db.prepare('SELECT * FROM admin WHERE id=1').get();
  async function passwordMatches(password,record=admin()){if(!record)return false;const result=await scrypt(String(password||''),record.salt,64);return same(result.toString('hex'),record.hash);}
  function session(req){const token=(req.headers.cookie||'').split(';').map(value=>value.trim()).find(value=>value.startsWith('studio_session='))?.slice(15);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const record=db.prepare('SELECT * FROM sessions WHERE token=? AND expires>?').get(hash(token),Date.now());return record?{token:hash(token),username:admin()?.username}:null;}
  function startSession(res){const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions(token,expires) VALUES(?,?)').run(hash(token),Date.now()+8*60*60*1000);res.setHeader('Set-Cookie',`studio_session=${token}; HttpOnly; SameSite=Strict; Path=/api/studio; Max-Age=28800${production?'; Secure':''}`);}
  const accessToken=record=>decrypt(record.row.access_secret);
  const fullOrder=record=>({...record.order,trackingToken:accessToken(record)});
  const publicOrder=record=>{const order=record.order;return {...order,customer:{name:order.customer.name.split(' ')[0]},privateNotes:undefined,items:order.items.map(item=>({...item,image:undefined,photoUrl:undefined,configuration:undefined,photos:undefined,personalisation:undefined})),trackingToken:accessToken(record),legalHold:undefined};};
  function authenticatedOrder(data){const record=get(referenceOf(data.reference));if(!record)throw new ApiError(404,'Order not found. Check both the reference and checkout mobile number.');const tokenOk=typeof data.token==='string'&&same(hash(data.token),record.row.access_hash);const phoneOk=Boolean(phoneNumber(data.phone)&&same(phoneNumber(data.phone),record.order.customer.phone));if(!tokenOk&&!phoneOk)throw new ApiError(404,'Order not found. Check both the reference and checkout mobile number.');return record;}
  function insertOrder(input,idempotency,requestHash){
    const reference=`ALN-${randomBytes(6).toString('hex').toUpperCase()}`,token=randomBytes(24).toString('hex'),date=now();
    const order={...input,reference,orderId:`#${reference}`,source:'server',placedAt:date,updatedAt:date,status:'received',statusLabel:'Order received',payment:defaultPayment(),publicNote:'',privateNotes:'',history:[{status:'received',title:'Order received',note:'Your request has reached the studio.',at:date}]};
    order.artwork=initialArtwork(order); order.retention={...rules().retention};
    db.prepare('INSERT INTO orders(reference,access_hash,access_secret,idempotency,request_hash,data,created,updated) VALUES(?,?,?,?,?,?,?,?)').run(reference,hash(token),encrypt(token),idempotency||null,requestHash,JSON.stringify(order),date,date);
    audit(reference,'Order created','customer');return fullOrder(get(reference));
  }
  async function applyPayment(attempt,payment){
    if(payment.order_id!==attempt.id)throw new ApiError(409,'The payment does not belong to this order.');
    const config=configById(attempt.settings_id),state=gatewayPaymentState(payment,attempt.amount,config.mode);
    return transaction(()=>{const record=get(attempt.reference);if(!record)throw new ApiError(404,'Order not found.');const order=record.order;
      // A late failed attempt must not overwrite an earlier verified payment.
      if(['paid','test_paid','part_refunded','refunded'].includes(order.payment.status)&&!['paid','test_paid','part_refunded','refunded'].includes(state.status))return order;
      if(order.payment.paymentId&&order.payment.paymentId!==payment.id&&['paid','test_paid','part_refunded','refunded'].includes(order.payment.status))throw new ApiError(409,'Another payment is already recorded. Contact the studio.');
      db.prepare('UPDATE attempts SET payment_id=? WHERE id=?').run(payment.id,attempt.id);
      order.payment={...state,method:'razorpay',mode:config.mode,paymentId:payment.id,razorpayOrderId:attempt.id,verifiedAt:now()};
      save(order);audit(order.reference,`Razorpay ${state.status}`,'gateway');return order;
    });
  }
  function decodeHeader(req,key){try{return decodeURIComponent(String(req.headers[key]||''));}catch{throw new ApiError(400,'This filename or file note could not be read.');}}
  function checkoutQuote(data){
    const phone=phoneNumber(data.customer?.phone),code=cleanText(data.discountCode,30).toUpperCase();
    const prior=db.prepare("SELECT count(*) AS n FROM orders WHERE json_extract(data,'$.customer.phone')=? AND json_extract(data,'$.status')!='cancelled'").get(phone).n;
    const uses=db.prepare("SELECT count(*) AS n FROM orders WHERE json_extract(data,'$.customer.phone')=? AND json_extract(data,'$.discountCode')=? AND json_extract(data,'$.status')!='cancelled'").get(phone,code).n;
    return calculateCheckout(data,{rules:rules(),hasPriorOrder:prior>0,couponUses:uses});
  }
  async function handler(req,res,next){
    const url=new URL(req.url,'http://studio.local');
    if(!url.pathname.startsWith('/api/')){if(next)return next();return json(res,404,{error:'Not found.'});}
    try{
      const path=url.pathname,method=req.method;
      if(path==='/api/payments/webhook'&&method==='POST'){
        const raw=await body(req,1_000_000),signature=req.headers['x-razorpay-signature'];
        const configs=db.prepare('SELECT * FROM gateway_settings ORDER BY id DESC LIMIT 8').all().map(row=>({id:row.id,...decrypt(row.secret)}));
        if(!configs.some(config=>config.webhookSecret&&validSignature(raw,signature,config.webhookSecret)))throw new ApiError(400,'Invalid webhook signature.');
        const digest=hash(raw.toString()),eventId=cleanText(req.headers['x-razorpay-event-id'],200)||digest;
        if(db.prepare('SELECT 1 FROM webhook_events WHERE body_hash=? OR event_id=?').get(digest,eventId))return json(res,200,{received:true,duplicate:true});
        const event=parse(raw),payment=event.payload?.payment?.entity;
        if(payment?.id&&['payment.captured','payment.failed','payment.authorized','payment.refunded','order.paid','refund.processed'].includes(event.event)){
          const attempt=db.prepare('SELECT * FROM attempts WHERE id=?').get(payment.order_id);
          if(attempt){const config=configById(attempt.settings_id);const verified=await razorpayRequest(config,`/payments/${encodeURIComponent(payment.id)}`,{fetcher});await applyPayment(attempt,verified);}
        }else if(event.event==='refund.processed'&&event.payload?.refund?.entity?.payment_id){
          const paymentId=event.payload.refund.entity.payment_id,attempt=db.prepare('SELECT * FROM attempts WHERE payment_id=?').get(paymentId);
          if(attempt){const verified=await razorpayRequest(configById(attempt.settings_id),`/payments/${encodeURIComponent(paymentId)}`,{fetcher});await applyPayment(attempt,verified);}
        }
        db.prepare('INSERT OR IGNORE INTO webhook_events(body_hash,event_id,created) VALUES(?,?,?)').run(digest,eventId,now());return json(res,200,{received:true});
      }
      if(req.headers.origin&&req.headers.origin!==origin)throw new ApiError(403,'This request must come from the studio website.');
      if(method!=='GET'&&req.headers['x-studio-request']!=='1')throw new ApiError(403,'Please reload this page and try again.');
      if(path==='/api/health'&&method==='GET'){db.prepare('SELECT 1').get();return json(res,200,{ok:true});}
      if(path==='/api/public/config'&&method==='GET'){const config=currentSettings();return json(res,200,{onlinePayments:gatewayAvailable(config),paymentMode:config.mode,stages:STAGES,businessRules:rules()});}
      if(path==='/api/studio/session'&&method==='GET')return json(res,200,{authenticated:Boolean(session(req)),setupRequired:!admin(),localSetup:!production&&loopback(req.socket.remoteAddress)&&!req.headers['x-forwarded-for']});
      if(path==='/api/studio/setup'&&method==='POST'){
        rate(req,'setup',5);if(admin())throw new ApiError(409,'Studio access has already been created.');
        const data=parse(await body(req,20000));
        if(!(!production&&loopback(req.socket.remoteAddress)&&!req.headers['x-forwarded-for'])&&!(bootstrapToken&&same(data.setupToken,bootstrapToken)))throw new ApiError(403,'Use the deployment setup code to create studio access.');
        const username=cleanText(data.username,100).toLowerCase();
        if(!/^[a-z0-9@._-]{3,100}$/.test(username)||typeof data.password!=='string'||data.password.length<12||data.password.length>200)throw new ApiError(400,'Choose a username and a password of 12–200 characters.');
        const salt=randomBytes(16).toString('hex'),passwordHash=(await scrypt(data.password,salt,64)).toString('hex');
        db.prepare('INSERT INTO admin(id,username,hash,salt) VALUES(1,?,?,?)').run(username,passwordHash,salt);startSession(res);audit(null,'Studio access created',username);return json(res,201,{authenticated:true});
      }
      if(path==='/api/studio/login'&&method==='POST'){
        rate(req,'login',5);const data=parse(await body(req,20000)),record=admin();
        if(!record||!(await passwordMatches(data.password,record))||cleanText(data.username,100).toLowerCase()!==record.username)throw new ApiError(401,'The username or password is incorrect.');
        const previous=session(req);if(previous)db.prepare('DELETE FROM sessions WHERE token=?').run(previous.token);startSession(res);return json(res,200,{authenticated:true});
      }
      if(path.startsWith('/api/studio/')){
        const user=session(req);if(!user)throw new ApiError(401,'Please sign in to the studio panel.');
        if(path==='/api/studio/logout'&&method==='POST'){db.prepare('DELETE FROM sessions WHERE token=?').run(user.token);res.setHeader('Set-Cookie',`studio_session=; HttpOnly; SameSite=Strict; Path=/api/studio; Max-Age=0${production?'; Secure':''}`);return json(res,200,{ok:true});}
        if(path==='/api/studio/settings'&&method==='GET')return json(res,200,settingsSummary());
        if(path==='/api/studio/settings'&&method==='PUT'){
          const data=parse(await body(req,20000)),previous=currentSettings();
          if(!(await passwordMatches(data.password)))throw new ApiError(401,'Enter your studio password to change payment settings.');
          const mode=data.mode==='live'?'live':'test',keyId=cleanText(data.keyId,100)||previous.keyId;
          const keySecret=cleanText(data.keySecret,256)||(keyId===previous.keyId?previous.keySecret:'');
          const webhookSecret=cleanText(data.webhookSecret,256)||previous.webhookSecret||'';
          if(!new RegExp(`^rzp_${mode}_[a-zA-Z0-9]{6,60}$`).test(keyId||'')||!keySecret||keySecret.length<10)throw new ApiError(400,'Enter matching Razorpay Key ID and Key Secret for the selected mode.');
          if(data.enabled&&mode==='live'&&(!origin.startsWith('https://')||webhookSecret.length<16||!data.goLiveConfirmed))throw new ApiError(400,'Live payments need a public HTTPS domain, a webhook secret of at least 16 characters, and the test-completion confirmation.');
          const config={mode,keyId,keySecret,webhookSecret,enabled:Boolean(data.enabled),goLiveConfirmed:Boolean(data.goLiveConfirmed)};
          if(config.enabled){const connection=await razorpayRequest(config,'/orders?count=1',{fetcher});if(!Array.isArray(connection.items))throw new ApiError(502,'Razorpay credentials could not be verified. Check the selected mode and keys.');config.credentialCheckedAt=now();}
          db.prepare('INSERT INTO gateway_settings(secret,created) VALUES(?,?)').run(encrypt(config),now());audit(null,`Razorpay ${mode} settings updated`,user.username);return json(res,200,settingsSummary());
        }
        if(path==='/api/studio/business'&&method==='GET')return json(res,200,{rules:rules()});
        if(path==='/api/studio/business'&&method==='PUT'){
          const data=parse(await body(req,100000));if(!(await passwordMatches(data.password)))throw new ApiError(401,'Enter your studio password to change business rules.');
          const value=validateBusinessRules(data.rules);db.prepare('INSERT INTO business_settings(id,value,updated) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated=excluded.updated').run(JSON.stringify(value),now());audit(null,'Business rules updated',user.username);return json(res,200,{rules:value});
        }
        if(path==='/api/studio/backups'&&method==='GET')return json(res,200,maintenance.status());
        if(path==='/api/studio/backups'&&method==='POST'){rate(req,'backup',3,3600000);const result=await maintenance.backup();return json(res,201,{backup:result,...maintenance.status()});}
        if(path==='/api/studio/backups/verify'&&method==='POST'){rate(req,'backup-check',6,3600000);const data=parse(await body(req,10000)),result=await maintenance.verify(cleanText(data.id,100));return json(res,200,{result,...maintenance.status()});}
        if(path==='/api/studio/retention/run'&&method==='POST'){const result=await maintenance.cleanup();return json(res,200,{result,...maintenance.status()});}
        const fileRoute=path.match(/^\/api\/studio\/orders\/(ALN-[A-Z0-9-]+)\/files(?:\/([a-f0-9]{32}))?$/);
        if(fileRoute){const record=get(fileRoute[1]);if(!record)throw new ApiError(404,'Order not found.');
          if(method==='GET'&&fileRoute[2]){const data=originals.download(fileRoute[1],fileRoute[2]);res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(data.file.name)}`,'Content-Length':data.bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data.bytes);return;}
          if(method==='GET')return json(res,200,{files:originals.list(fileRoute[1])});
          if(method==='POST'){rate(req,'proof-upload',60);const bytes=await body(req,ORDER_FILE_RULES.maxFileBytes);const uploaded=originals.add(fileRoute[1],bytes,{name:decodeHeader(req,'x-file-name'),label:decodeHeader(req,'x-file-label'),kind:'proof'});return json(res,201,uploaded);}
        }
        const workflowRoute=path.match(/^\/api\/studio\/orders\/(ALN-[A-Z0-9-]+)\/(pricing|artwork|support|delete-files)$/);
        if(workflowRoute&&method==='POST'){
          const data=parse(await body(req,100000)),record=get(workflowRoute[1]);if(!record)throw new ApiError(404,'Order not found.');
          if(data.updatedAt!==record.order.updatedAt)throw new ApiError(409,'This order changed. Refresh before saving.');
          const order=record.order,action=workflowRoute[2];
          if(action==='pricing'){
            if(order.payment.isPaid||db.prepare('SELECT 1 FROM attempts WHERE reference=?').get(order.reference))throw new ApiError(409,'The amount is locked because payment has started or been recorded.');
            const subtotal=order.items.every(item=>item.price!==null&&!['studio_order','enquiry','pvc_card'].includes(item.type))?order.items.reduce((sum,item)=>sum+item.price*item.quantity,0):Number(data.itemsSubtotal);
            const courierFee=order.delivery.method==='pickup'?0:Number(data.courierFee),packagingFee=order.delivery.method==='pickup'?0:Number(data.packagingFee),bulkDiscount=Number(data.bulkDiscount||0);
            if(![subtotal,courierFee,packagingFee,bulkDiscount].every(value=>Number.isFinite(value)&&value>=0&&value<=10000000)||subtotal<=0||bulkDiscount>subtotal)throw new ApiError(400,'Check the item quote, courier and packaging amounts.');
            if(bulkDiscount&&order.discountCode)throw new ApiError(400,'A coupon and quoted bulk discount cannot be combined.');
            const free=order.delivery.method!=='pickup'&&isFreeDeliveryEligible(rules(),{items:order.items,subtotal,pincode:order.customer.pincode,courierFee,packagingFee});
            order.subtotal=subtotal;order.shippingFee=free?0:courierFee+packagingFee;order.discountAmount=bulkDiscount||order.discountAmount||0;
            order.grandTotal=Math.round((subtotal-order.discountAmount+order.shippingFee)*100)/100;
            if(order.grandTotal<1||order.grandTotal>10000000)throw new ApiError(400,'Check the final amount.');
            order.pricingConfirmed=true;order.deliveryQuote={courierFee,packagingFee,freeDeliveryApplied:free,note:cleanText(data.note,1000),confirmedAt:now()};
            order.history.push({title:'Final amount and delivery quote confirmed',note:order.deliveryQuote.note,at:now()});
          }else if(action==='artwork')publishProof(order,originals.list(order.reference),data);
          else if(action==='support')updateSupportRequest(order,data);
          else if(action==='delete-files'){
            if(data.confirmReference!==order.reference||!(await passwordMatches(data.password)))throw new ApiError(400,'Confirm this order reference and your studio password to remove its working files.');
            const request=order.requests?.find(item=>item.id===data.requestId&&item.type==='delete_files'&&item.status==='approved');
            if(!request)throw new ApiError(409,'Approve the customer’s file-deletion request first.');
            await maintenance.deleteApproved(order);const updated=get(order.reference).order;const reqItem=updated.requests.find(item=>item.id===data.requestId);reqItem.status='resolved';reqItem.events.push({status:'resolved',note:'Working files removed. Existing backups expire under the backup retention policy.',at:now()});save(updated);return json(res,200,{order:fullOrder(get(order.reference))});
          }
          save(order);audit(order.reference,`Studio ${action} updated`,user.username);return json(res,200,{order:fullOrder(get(order.reference))});
        }
        if(path==='/api/studio/orders'&&method==='GET'){
          const query=cleanText(url.searchParams.get('q'),100).toLowerCase(),status=cleanText(url.searchParams.get('status'),40);
          const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));
          const where="WHERE (?='' OR lower(reference||' '||json_extract(data,'$.customer.name')||' '||json_extract(data,'$.customer.phone')) LIKE ?) AND (?='' OR json_extract(data,'$.status')=?)";
          const values=[query,`%${query}%`,status,status];
          const count=db.prepare(`SELECT count(*) AS count FROM orders ${where}`).get(...values).count;
          const orders=db.prepare(`SELECT data FROM orders ${where} ORDER BY updated DESC LIMIT 50 OFFSET ?`).all(...values,offset).map(row=>{const order=JSON.parse(row.data);return {reference:order.reference,orderId:order.orderId,customer:order.customer,status:order.status,statusLabel:order.statusLabel,grandTotal:order.grandTotal,payment:order.payment,placedAt:order.placedAt,updatedAt:order.updatedAt};});
          const counts=db.prepare("SELECT json_extract(data,'$.status') AS status,count(*) AS count FROM orders GROUP BY status").all();
          return json(res,200,{orders,count,offset,counts});
        }
        if(path==='/api/studio/orders'&&method==='POST'){
          const data=parse(await body(req,100000)),customer=validateCustomer(data.customer),quantity=Number(data.quantity);
          if(!cleanText(data.title,180)||!Number.isSafeInteger(quantity)||quantity<1||quantity>100000)throw new ApiError(400,'Add the product description and a valid quantity.');
          const total=data.grandTotal===''||data.grandTotal===undefined?null:Number(data.grandTotal);
          if(total!==null&&(!Number.isFinite(total)||total<=0||total>10_000_000))throw new ApiError(400,'Enter a valid final order amount.');
          const order=insertOrder({customer,items:[{type:'studio_order',title:cleanText(data.title,180),quantity,price:total===null?null:total/quantity,specialInstructions:cleanText(data.notes)}],subtotal:total,grandTotal:total,shippingFee:0,discountAmount:0,pricingConfirmed:total!==null,commerceVersion:2,artwork:{required:Boolean(data.requireArtwork),status:data.requireArtwork?'awaiting_proof':'not_required',version:0,versions:[]},delivery:{method:'pickup',courier:'',awb:'',trackingUrl:'',expectedDate:''}},null,'studio');audit(order.reference,'Manual order added',user.username);return json(res,201,{order});
        }
        const match=path.match(/^\/api\/studio\/orders\/(ALN-[A-Z0-9-]+)$/);
        if(match){const record=get(match[1]);if(!record)throw new ApiError(404,'Order not found.');
          if(method==='GET')return json(res,200,{order:fullOrder(record)});
          if(method==='PATCH'){
            const data=parse(await body(req,30000));
            const current=get(match[1]);
            if(!same(data.updatedAt,current.order.updatedAt))throw new ApiError(409,'This order changed in another tab. Refresh it before saving.');
            const order=current.order;if(!allowedStatus(data.status))throw new ApiError(400,'Choose a supported order status.');
            const trackingUrl=cleanText(data.delivery?.trackingUrl,1000);
            if(trackingUrl){let link;try{link=new URL(trackingUrl);}catch{throw new ApiError(400,'Enter a full HTTPS courier tracking link.');}if(link.protocol!=='https:'||link.username||link.password)throw new ApiError(400,'Use a full HTTPS courier link.');}
            const expectedDate=cleanText(data.delivery?.expectedDate,10);
            if(expectedDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(expectedDate)||Number.isNaN(Date.parse(`${expectedDate}T12:00:00Z`))||new Date(`${expectedDate}T12:00:00Z`).toISOString().slice(0,10)!==expectedDate))throw new ApiError(400,'Choose a valid expected date.');
            if(data.legalHold!==undefined)order.legalHold=Boolean(data.legalHold);
            if(data.filesReviewed!==undefined)order.filesReviewed=Boolean(data.filesReviewed);
            if(order.commerceVersion>=2&&['design_approved','printing','ready','dispatched','delivered'].includes(data.status)){
              if(order.requests?.some(request=>request.type==='cancel'&&!['resolved','declined','approved','refund_initiated'].includes(request.status)))throw new ApiError(409,'Review the pending cancellation request before production.');
              if(order.artwork?.required&&order.artwork.status!=='approved')throw new ApiError(409,'Customer artwork approval is required before production.');
              const expected=originalReferences(order.items).length,received=originals.list(order.reference).filter(file=>file.kind==='original'&&!file.purgedAt).length;
              if(expected&&(!order.filesReviewed||received<expected))throw new ApiError(409,'Receive and review the original print files before production.');
            }
            if(data.status==='delivered'&&order.status!=='delivered')order.deliveredAt=now();
            let changed=false;
            if(data.grandTotal!==undefined&&data.grandTotal!==null&&data.grandTotal!==''&&Number(data.grandTotal)!==order.grandTotal){
              if(order.commerceVersion>=2)throw new ApiError(409,'Use the item and delivery quote section to confirm this order amount.');
              if(db.prepare('SELECT 1 FROM attempts WHERE reference=?').get(order.reference)||order.payment.isPaid)throw new ApiError(409,'An online payment has already started or been recorded. The amount is locked.');
              const total=Number(data.grandTotal);if(!Number.isFinite(total)||total<1||total>10_000_000)throw new ApiError(400,'Enter a valid final amount.');
              order.grandTotal=Math.round(total*100)/100;order.pricingConfirmed=true;changed=true;
            }
            const note=cleanText(data.publicNote),title=STAGES.find(([id])=>id===data.status)?.[1]||'Order cancelled';
            if(data.status!==order.status||note!==order.publicNote||changed)order.history.push({status:data.status,title,note,at:now()});
            order.status=data.status;order.statusLabel=title;order.publicNote=note;order.privateNotes=cleanText(data.privateNotes,5000);
            order.delivery={...order.delivery,courier:cleanText(data.delivery?.courier,100),awb:cleanText(data.delivery?.awb,100),trackingUrl,expectedDate};
            if(data.recordOfflinePayment){
              if(order.payment.method==='razorpay'||db.prepare('SELECT 1 FROM attempts WHERE reference=?').get(order.reference))throw new ApiError(409,'Use Razorpay verification for this order’s online payment.');
              if(!order.grandTotal||!cleanText(data.paymentReference,200))throw new ApiError(400,'Add the final amount and an offline payment reference.');
              order.payment={method:'studio',status:'paid',label:'Paid · Recorded by the studio',isPaid:true,reference:cleanText(data.paymentReference,200),verifiedAt:now()};
            }
            save(order);audit(order.reference,'Order / delivery status updated',user.username);return json(res,200,{order:fullOrder(get(order.reference))});
          }
        }
        throw new ApiError(404,'Studio action not found.');
      }
      if(path==='/api/checkout/preview'&&method==='POST'){rate(req,'preview',30);const data=parse(await body(req));const quote=checkoutQuote(data);return json(res,200,{quote:{subtotal:quote.subtotal,discountAmount:quote.discountAmount,discountCode:quote.discountCode,shippingFee:quote.shippingFee,grandTotal:quote.grandTotal,delivery:quote.delivery}});}
      if(path==='/api/order-files/list'&&method==='POST'){
        rate(req,'file-list',120);const data=parse(await body(req,10000)),record=authenticatedOrder(data),published=new Set(record.order.artwork?.versions.flatMap(version=>version.proofIds||[])||[]);
        return json(res,200,{files:originals.list(record.order.reference).filter(file=>file.kind!=='proof'||published.has(file.id)),expectedOriginals:originalReferences(record.order.items),artwork:record.order.artwork,filesPurgedAt:record.order.filesPurgedAt});
      }
      if(path==='/api/order-files/upload'&&method==='POST'){
        rate(req,'original-upload',60);const record=authenticatedOrder({reference:req.headers['x-order-reference'],token:req.headers['x-order-token']});
        if(record.order.status==='cancelled')throw new ApiError(409,'This order is cancelled. Contact the studio before sharing more files.');
        const kind=req.headers['x-file-kind']==='evidence'?'evidence':'original',caseId=cleanText(req.headers['x-case-id'],100);
        if(kind==='evidence'&&!record.order.requests?.some(request=>request.id===caseId))throw new ApiError(400,'Save the support request before attaching evidence.');
        const bytes=await body(req,ORDER_FILE_RULES.maxFileBytes),uploaded=originals.add(record.order.reference,bytes,{name:decodeHeader(req,'x-file-name'),label:decodeHeader(req,'x-file-label'),sourceId:decodeHeader(req,'x-file-source'),kind,caseId});
        return json(res,201,uploaded);
      }
      if(path==='/api/order-files/proof'&&method==='POST'){
        const data=parse(await body(req,10000)),record=authenticatedOrder(data),published=record.order.artwork?.versions.some(version=>version.proofIds?.includes(data.id));
        if(!published)throw new ApiError(404,'Proof not found.');const file=originals.download(record.order.reference,data.id);
        res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(file.file.name)}`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(file.bytes);return;
      }
      if(path==='/api/artwork/respond'&&method==='POST'){
        rate(req,'artwork',20);const data=parse(await body(req,15000)),record=authenticatedOrder(data);respondToProof(record.order,data);save(record.order);audit(record.order.reference,'Customer artwork response','customer');return json(res,200,{order:publicOrder(get(record.order.reference))});
      }
      if(path==='/api/support'&&method==='POST'){
        rate(req,'support',10);const data=parse(await body(req,15000)),record=authenticatedOrder(data),request=createSupportRequest(record.order,data);save(record.order);audit(record.order.reference,'Support request created','customer');return json(res,201,{request,order:publicOrder(get(record.order.reference))});
      }
      if(path==='/api/orders'&&method==='POST'){
        rate(req,'orders',15);const data=parse(await body(req)),idempotency=cleanText(req.headers['idempotency-key'],100);
        if(!/^[a-zA-Z0-9-]{16,100}$/.test(idempotency))throw new ApiError(400,'Please reload checkout before saving the order.');
        const digest=hash(JSON.stringify(data)),existing=db.prepare('SELECT reference,request_hash FROM orders WHERE idempotency=?').get(idempotency);
        if(existing){if(existing.request_hash!==digest)throw new ApiError(409,'This request changed. Start a fresh checkout.');return json(res,200,{order:fullOrder(get(existing.reference))});}
        const order=transaction(()=>insertOrder(checkoutQuote(data),idempotency,digest));return json(res,201,{order});
      }
      if(path==='/api/enquiries'&&method==='POST'){
        rate(req,'enquiries',10);const data=parse(await body(req,50000)),customer=validateCustomer(data.customer);
        if(!cleanText(data.title,180)||!cleanText(data.details,6000))throw new ApiError(400,'Add the enquiry title and requirements.');
        const quantity=Number(data.quantity??1);if(!Number.isSafeInteger(quantity)||quantity<1||quantity>100000)throw new ApiError(400,'Check the enquiry quantity.');
        const key=cleanText(req.headers['idempotency-key'],100);if(!/^[a-zA-Z0-9-]{16,100}$/.test(key))throw new ApiError(400,'Reload the enquiry and try again.');
        const digest=hash(JSON.stringify(data)),previous=db.prepare('SELECT reference,request_hash FROM orders WHERE idempotency=?').get(key);
        if(previous){if(previous.request_hash!==digest)throw new ApiError(409,'Save these changed requirements as a new enquiry.');return json(res,200,{order:fullOrder(get(previous.reference))});}
        const order=insertOrder({customer,items:[{title:cleanText(data.title,180),type:data.itemType==='pvc_card'?'pvc_card':'enquiry',quantity,price:null,specialInstructions:cleanText(data.details,6000)}],subtotal:null,grandTotal:null,shippingFee:null,discountAmount:0,pricingConfirmed:false,commerceVersion:2,artwork:{required:true,status:'awaiting_proof',version:0,versions:[]},delivery:{method:'courier'}},key,digest);return json(res,201,{order});
      }
      if(path==='/api/track'&&method==='POST'){
        const data=parse(await body(req,10000));rate(req,data.token?'track-token':'track-phone',data.token?120:20);return json(res,200,{order:publicOrder(authenticatedOrder(data))});
      }
      if(path==='/api/payments/order'&&method==='POST'){
        rate(req,'payment-order',15);const data=parse(await body(req,10000)),record=authenticatedOrder(data),order=record.order,config=currentSettings();
        if(!gatewayAvailable(config))throw new ApiError(503,'Online payment is not enabled yet. Confirm payment with the studio.');
        if(order.payment.isPaid||['test_paid','refunded'].includes(order.payment.status)||order.status==='cancelled')throw new ApiError(409,'This order cannot accept another payment.');
        if(!order.pricingConfirmed||!order.grandTotal)throw new ApiError(409,'The studio must confirm the final quote before online payment.');
        if(paymentLocks.has(order.reference))throw new ApiError(409,'Payment checkout is being prepared. Please wait.');paymentLocks.add(order.reference);
        try{
          let attempt=db.prepare('SELECT * FROM attempts WHERE reference=? ORDER BY created DESC LIMIT 1').get(order.reference);
          if(attempt&&configById(attempt.settings_id).keyId!==config.keyId)throw new ApiError(409,'Payment settings changed after checkout started. Ask the studio to verify the earlier payment before trying again.');
          const amount=Math.round(order.grandTotal*100);
          if(!attempt){const gatewayOrder=await razorpayRequest(config,'/orders',{method:'POST',body:{amount,currency:'INR',receipt:order.reference,notes:{studio_reference:order.reference}},fetcher});
            if(!/^order_[a-zA-Z0-9]+$/.test(gatewayOrder.id||'')||gatewayOrder.amount!==amount||gatewayOrder.currency!=='INR')throw new ApiError(502,'The payment order could not be verified.');
            db.prepare('INSERT INTO attempts(id,reference,amount,currency,settings_id,created) VALUES(?,?,?,?,?,?)').run(gatewayOrder.id,order.reference,amount,'INR',config.id,now());attempt={id:gatewayOrder.id,amount,currency:'INR'};
          }
          const fresh=get(order.reference).order;if(fresh.payment.isPaid)throw new ApiError(409,'Payment is already recorded.');fresh.payment={...fresh.payment,method:'razorpay',status:'pending',label:config.mode==='test'?'Test checkout pending':'Awaiting online payment'};save(fresh);
          return json(res,200,{keyId:config.keyId,razorpayOrderId:attempt.id,amount:attempt.amount,currency:'INR',mode:config.mode,reference:order.reference,prefill:{name:order.customer.name,email:order.customer.email,contact:order.customer.phone}});
        }finally{paymentLocks.delete(order.reference);}
      }
      if(path==='/api/payments/verify'&&method==='POST'){
        rate(req,'verify',30);const data=parse(await body(req,20000)),record=authenticatedOrder(data),attempt=db.prepare('SELECT * FROM attempts WHERE id=? AND reference=?').get(cleanText(data.razorpay_order_id,100),record.order.reference);
        if(!attempt||!/^pay_[a-zA-Z0-9]+$/.test(data.razorpay_payment_id||''))throw new ApiError(400,'The payment reference is invalid.');
        const config=configById(attempt.settings_id);
        if(!validSignature(`${attempt.id}|${data.razorpay_payment_id}`,data.razorpay_signature,config.keySecret))throw new ApiError(400,'Payment signature verification failed. No payment has been marked successful.');
        const payment=await razorpayRequest(config,`/payments/${encodeURIComponent(data.razorpay_payment_id)}`,{fetcher});await applyPayment(attempt,payment);return json(res,200,{order:publicOrder(get(record.order.reference))});
      }
      if(path==='/api/payments/recheck'&&method==='POST'){
        rate(req,'recheck',10);const data=parse(await body(req,10000)),record=authenticatedOrder(data);
        const attempts=db.prepare('SELECT * FROM attempts WHERE reference=? ORDER BY created DESC LIMIT 10').all(record.order.reference);
        for(const attempt of attempts){const result=await razorpayRequest(configById(attempt.settings_id),`/orders/${encodeURIComponent(attempt.id)}/payments`,{fetcher});const payment=(result.items||[]).find(item=>['captured','refunded'].includes(item.status))||(result.items||[])[0];if(payment){await applyPayment(attempt,payment);if(['captured','refunded'].includes(payment.status))break;}}
        return json(res,200,{order:publicOrder(get(record.order.reference))});
      }
      throw new ApiError(404,'This action is unavailable.');
    }catch(error){if(res.headersSent){res.end();return;}json(res,error.status||500,{error:error.status?error.message:'The studio service could not complete this request. Please try again.'});}
  }
  return {handler,close:store.close,store,settingsSummary,maintenance,originals};
}
