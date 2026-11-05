import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false } });
try {
  const data = await server.ssrLoadModule('/src/data/pvcCards.js');
  const util = await server.ssrLoadModule('/src/utils/pvcEnquiry.js');
  const { default: Catalogue, PvcCardPage } = await server.ssrLoadModule('/src/pages/PvcCardsPage.jsx');
  const { default: Art } = await server.ssrLoadModule('/src/components/PvcCardArt.jsx');
  const { getWhatsAppUrl } = await server.ssrLoadModule('/src/data/businessConfig.js');
  const { PRINTING_SERVICES, printingServicePath } = await server.ssrLoadModule('/src/data/printingServices.js');
  const { PVC_CATEGORIES, PVC_PRODUCTS, PVC_CARD_TYPES, getPvcProduct, pvcProductPath, filterPvcProducts } = data;
  const { createPvcDraft, validatePvcDraft, pvcEnquiryRows, buildPvcMessage, validatePvcFile } = util;
  const render = path => renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(Routes, null,
    React.createElement(Route, { path: '/pvc-cards', element: React.createElement(Catalogue) }),
    React.createElement(Route, { path: '/pvc-cards/bulk', element: React.createElement(PvcCardPage, { bulk: true }) }),
    React.createElement(Route, { path: '/pvc-cards/:id', element: React.createElement(PvcCardPage) })
  )));
  assert.equal(PVC_CATEGORIES.length, 6);
  assert.equal(PVC_PRODUCTS.length, 12);
  assert.equal(PVC_CARD_TYPES.length, 32);
  assert.equal(new Set(PVC_PRODUCTS.map(item => item.id)).size, 12);
  assert.equal(new Set(PVC_CARD_TYPES.map(item => item.id)).size, 32);
  assert.equal(filterPvcProducts('all', 'school student').length, 1);
  assert.equal(filterPvcProducts('all', 'salon')[0].id, 'custom-membership-card');
  assert.equal(filterPvcProducts('events').length, 1);
  assert.equal(filterPvcProducts('id', 'gym').length, 0);
  assert.equal(filterPvcProducts('all', 'unmatched-query').length, 0);
  let combinations = 0;
  for (const product of PVC_PRODUCTS) {
    const initial = createPvcDraft(product);
    assert.equal(initial.type, product.defaultType);
    assert.deepEqual(validatePvcDraft({ ...initial, name: 'Website QA' }), {});
    const html = render(pvcProductPath(product.id));
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
    assert.ok(html.includes('Single side') && html.includes('Both sides') && html.includes('Holder + lanyard'));
    for (const orientation of ['portrait', 'landscape']) for (const side of ['front', 'back']) {
      const svg = renderToStaticMarkup(React.createElement(Art, { product, orientation, side }));
      assert.ok(!svg.includes('NaN') && svg.includes('<svg'));
      for (const asset of svg.matchAll(/href="(\/[^"]+)"/g)) assert.ok(existsSync(`public${asset[1]}`), `Existing local visual: ${asset[1]}`);
    }
    for (const quantity of [1, 5, 10, 25, 50, 100, 375, 100000]) for (const sides of ['single', 'double']) for (const design of ['upload', 'design']) for (const accessories of ['none', 'holder', 'lanyard', 'both']) {
      const draft = { ...initial, quantity: String(quantity), order: quantity === 1 ? 'single' : 'bulk', sides, design, accessories, name: 'Website QA', notes: 'Keep these exact words: नमस्ते & مرحبا.' };
      assert.deepEqual(validatePvcDraft(draft), {});
      const rows = pvcEnquiryRows(draft);
      const message = buildPvcMessage(draft);
      rows.forEach(row => assert.ok(message.includes(`${row.label}: ${row.value}`)));
      const destination = new URL(getWhatsAppUrl(message));
      assert.equal(destination.pathname, '/919643970064');
      assert.equal(destination.searchParams.get('text'), message);
      assert.ok(message.includes('नमस्ते & مرحبا.'));
      assert.ok(message.includes('not sent automatically'));
      combinations++;
    }
  }
  for (const type of PVC_CARD_TYPES) {
    const product = getPvcProduct(type.productId);
    assert.ok(product && product.category === type.category);
    const draft = createPvcDraft(product, { type: type.id });
    assert.equal(draft.type, type.id);
    const html = render(pvcProductPath(product.id, type.id));
    assert.ok(html.includes(`value="${type.id}" selected=""`), `Selected card purpose: ${type.label}`);
  }
  const draft = { ...createPvcDraft(PVC_PRODUCTS[0]), name: 'QA' };
  for (const quantity of ['', '0', '-1', '1.5', '1e3', '100001', 'Infinity', 'NaN', '9007199254740992']) assert.ok(validatePvcDraft({ ...draft, order: 'bulk', quantity }).quantity);
  assert.ok(validatePvcDraft({ ...draft, quantity: '5' }).quantity);
  for (const [key, value] of [['type','gym'], ['productId','missing'], ['orientation','diagonal'], ['sides','triple'], ['design','invented'], ['accessories','RFID'], ['name',' '], ['notes','x'.repeat(2001)]]) assert.ok(validatePvcDraft({ ...draft, [key]: value })[key]);
  const files = { front: { name: 'front नमस्ते.png' }, back: { name: 'back private.pdf' } };
  assert.ok(buildPvcMessage(draft, files).includes('front नमस्ते.png'));
  assert.ok(!buildPvcMessage(draft, files).includes('back private.pdf'));
  assert.ok(buildPvcMessage({ ...draft, sides: 'double' }, files).includes('back private.pdf'));
  assert.ok(!buildPvcMessage({ ...draft, design: 'design' }, files).includes('front नमस्ते.png'));
  for (const [name, type] of [['design.png','image/png'], ['front.jpg','image/jpeg'], ['back.PDF','application/pdf'], ['card.webp','image/webp']]) assert.equal(validatePvcFile({ name, type, size: 2000 }), '');
  for (const file of [{ name:'script.exe',type:'application/octet-stream',size:100 }, {name:'large.png',type:'image/png',size:20*1024*1024+1}, {name:'empty.png',type:'image/png',size:0}, {name:'fake.png',type:'application/javascript',size:200}]) assert.ok(validatePvcFile(file));
  assert.ok(render('/pvc-cards/bulk').includes('Choose a PVC product'));
  assert.ok(render('/pvc-cards/not-a-product').includes('This product isn’t in the collection'));
  assert.equal((render('/pvc-cards').match(/class="pvc-product pvc-tone-/g) || []).length, 12);
  for (const category of PVC_CATEGORIES.filter(item=>item.id!=='bulk')) assert.equal((render(`/pvc-cards?category=${category.id}`).match(/class="pvc-product pvc-tone-/g) || []).length,filterPvcProducts(category.id).length);
  assert.equal(printingServicePath(PRINTING_SERVICES[0]), '/pvc-cards');
  const navbar = readFileSync('src/components/Navbar.jsx','utf8').split("{ id: 'printing', label:")[1].split('\n];')[0];
  assert.ok(!navbar.includes('/printing-services') && !navbar.includes("kind: 'poster'"));
  assert.ok(!/NFC|RFID|magnetic|Aadhaar|voter|driving licence/i.test(JSON.stringify(PVC_PRODUCTS)));
  console.log(`Validated 6 PVC categories, 12 product pages, 32 purpose hand-offs and ${combinations} enquiry combinations; quantity limits, file checks, exact WhatsApp content and legacy entry links.`);
} finally { await server.close(); }
