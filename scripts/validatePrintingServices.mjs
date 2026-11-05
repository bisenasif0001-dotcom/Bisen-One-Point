import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
const server=await createServer({server:{middlewareMode:true,hmr:false}});
try {
  const {PRINTING_SERVICES,createPrintingDraft,getPrintingService,printingServicePath}=await server.ssrLoadModule('/src/data/printingServices.js');
  const {validatePrintingEnquiry,printingQuantity,printingSizeLabel,printingEnquiryRows,buildPrintingMessage,isPrintCount}=await server.ssrLoadModule('/src/utils/printingEnquiry.js');
  const {BUSINESS_CONFIG,getWhatsAppUrl}=await server.ssrLoadModule('/src/data/businessConfig.js');
  const {default:Page}=await server.ssrLoadModule('/src/pages/PrintingServicesPage.jsx');
  const {default:Art}=await server.ssrLoadModule('/src/components/PrintingServiceArt.jsx');
  const today='2026-11-03';
  const draftFor=id=>({...createPrintingDraft(getPrintingService(id)),name:'Studio Test'});
  const renderPage=path=>renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[path]},React.createElement(Page)));
  let cases=0;
  for(const service of PRINTING_SERVICES) {
    const draft=draftFor(service.id);
    assert.deepEqual(validatePrintingEnquiry(service,draft,today),{});
    const href=printingServicePath(service);
    if(service.id==='pvc') assert.equal(href,'/pvc-cards');
    else assert.equal(new URL(href,'http://localhost').searchParams.get('service'),service.name);
    assert.equal(getPrintingService(service.name).id,service.id,'Preserve existing deep links');
    if(service.id!=='pvc') {
      const html=renderPage(href);
      assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
      assert.ok(html.includes(`prs-example-${service.id}`));
    }
    const rows=printingEnquiryRows(service,draft);
    const message=buildPrintingMessage(service,{...draft,details:'A personal brief.\nKeep my exact words: مرحبا & नमस्ते.'});
    for(const row of rows) assert.ok(message.includes(`${row.label}: ${row.value}`));
    assert.ok(message.includes('مرحبا & नमस्ते.'));
    assert.equal(rows.some(row=>row.label==='Printed sides'),service.id==='pvc');
    assert.equal(rows.some(row=>row.label==='Photographs & copies'),service.id==='bulk');
    const url=new URL(getWhatsAppUrl(message));
    assert.equal(url.pathname,`/${BUSINESS_CONFIG.contact.whatsapp}`);
    assert.equal(url.searchParams.get('text'),message);
    assert.ok(validatePrintingEnquiry(service,{...draft,name:'   '},today).name);
    assert.ok(validatePrintingEnquiry(service,{...draft,sizeId:'invented'},today).sizeId);
    for(const value of ['', '0', '-1', '1.5', '1e3', '100001', 'NaN']) {
      const errors=validatePrintingEnquiry(service,{...draft,[service.id==='bulk'?'photoCount':'quantity']:value},today);
      assert.ok(errors[service.id==='bulk'?'photoCount':'quantity'],`Reject invalid quantity ${value}`);
      cases++;
    }
    for(const unit of ['mm','cm','in']) {
      const custom={...draft,sizeId:'custom',width:'.5',height:'2.00',unit};
      assert.deepEqual(validatePrintingEnquiry(service,custom,today),{});
      assert.equal(printingSizeLabel(service,custom),`0.5 × 2 ${unit} (custom request)`);
      assert.ok(printingEnquiryRows(service,custom).some(row=>row.label==='Orientation' && row.value.startsWith('Portrait')));
      assert.ok(validatePrintingEnquiry(service,{...custom,width:'0'},today).width);
      assert.ok(validatePrintingEnquiry(service,{...custom,height:'-2'},today).height);
      cases++;
    }
    assert.ok(validatePrintingEnquiry(service,{...draft,deadline:'2026-11-02'},today).deadline);
    assert.ok(validatePrintingEnquiry(service,{...draft,deadline:'2026-02-30'},today).deadline);
    assert.deepEqual(validatePrintingEnquiry(service,{...draft,deadline:'2026-11-03'},today),{});
    assert.deepEqual(validatePrintingEnquiry(service,{...draft,deadline:'2026-12-20'},today),{});
    const art=renderToStaticMarkup(React.createElement(Art,{kind:service.id}));
    assert.ok(!art.includes('NaN') && art.includes('<svg'));
    for(const asset of [...art.matchAll(/href="(\/[^"]+)"/g)]) assert.ok(existsSync(`public${asset[1]}`));
  }
  const bulk=getPrintingService('bulk');
  assert.equal(printingQuantity(bulk,{...draftFor('bulk'),photoCount:'24',copies:'3'}),72);
  assert.ok(validatePrintingEnquiry(bulk,{...draftFor('bulk'),photoCount:'500',copies:'500'},today).copies);
  const pvc=getPrintingService('pvc');
  const pvcRows=printingEnquiryRows(pvc,{...draftFor('pvc'),sides:'double',quantity:'100',finish:'matte'});
  assert.equal(pvcRows.find(row=>row.label==='Printed sides').value,'Front & back');
  assert.ok(pvcRows.find(row=>row.label==='Finish preference').value.includes('Matte'));
  assert.equal(printingEnquiryRows(pvc,draftFor('pvc')).find(row=>row.label==='Quantity').value,'1 card');
  const dua=getPrintingService('dua');
  const duaDraft={...draftFor('dua'),duaSource:'collection',designId:'ayat-al-kursi',sizeId:'A3',orientation:'landscape',presentation:'framed',frameId:'regal_noir'};
  assert.deepEqual(validatePrintingEnquiry(dua,duaDraft,today),{});
  assert.equal(printingSizeLabel(dua,duaDraft),'A3 · 29.7 × 42 cm','Original collection design remains portrait');
  assert.ok(buildPrintingMessage(dua,duaDraft).includes('Regal Noir · Matte Black & White'));
  assert.equal(printingEnquiryRows(dua,duaDraft).find(row=>row.label==='Quantity').value,'1 piece');
  assert.ok(validatePrintingEnquiry(dua,{...duaDraft,designId:'missing'},today).designId);
  const design=getPrintingService('design');
  assert.ok(validatePrintingEnquiry(design,{...draftFor('design'),project:'other',details:''},today).details);
  assert.ok(isPrintCount(' 100000 ') && !isPrintCount('1e3'));
  const hub=renderPage('/printing-services');
  assert.equal((hub.match(/class="prs-service-card prs-service-card-/g)||[]).length,5);
  assert.ok(hub.includes('href="#printing-services"'));
  assert.ok(renderPage('/printing-services?service=unknown').includes('Choose one of these services'));
  console.log(`Validated all 5 service pages and legacy links; ${cases} quantity/custom-size cases; bulk totals; date checks; faithful review/message content; local artwork; correct WhatsApp destination.`);
} finally {await server.close();}
