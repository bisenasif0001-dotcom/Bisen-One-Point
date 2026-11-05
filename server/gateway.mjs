import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from './pricing.mjs';

export function validSignature(data,signature,secret){
  if(typeof signature!=='string'||!/^[a-f0-9]{64}$/i.test(signature))return false;
  const expected=createHmac('sha256',secret).update(data).digest();
  return timingSafeEqual(expected,Buffer.from(signature,'hex'));
}
export async function razorpayRequest(config,path,{method='GET',body,fetcher=fetch}={}){
  let response;
  try{response=await fetcher(`https://api.razorpay.com/v1${path}`,{method,headers:{Authorization:`Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});}catch{throw new ApiError(503,'Razorpay could not be reached. Your saved order is safe; please retry shortly.');}
  const value=await response.json().catch(()=>({}));
  if(!response.ok)throw new ApiError(502,'Razorpay could not complete this request. Please check the payment settings or try again.');
  return value;
}
export function gatewayPaymentState(payment,amount,mode){
  if(payment.amount!==amount||payment.currency!=='INR')throw new ApiError(409,'The payment amount does not match the saved order.');
  const refunded=Number(payment.amount_refunded)||0;
  if(refunded>=amount||payment.status==='refunded')return {status:'refunded',label:'Refunded',isPaid:false,refundedAmount:refunded/100};
  if(payment.status==='captured')return {status:mode==='test'?'test_paid':refunded?'part_refunded':'paid',label:mode==='test'?'Test payment verified · No real money received':refunded?'Paid · Partially refunded':'Paid · Verified by Razorpay',isPaid:mode==='live',refundedAmount:refunded/100};
  return {status:payment.status==='failed'?'failed':'pending',label:payment.status==='failed'?'Payment failed · You can retry':'Awaiting Razorpay capture / verification',isPaid:false,refundedAmount:0};
}
