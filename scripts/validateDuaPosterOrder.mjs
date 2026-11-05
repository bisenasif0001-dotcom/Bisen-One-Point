import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { DUA_POSTERS } from '../src/data/duaPosters.js';
import { DUA_PRINT_PRICES } from '../src/data/duaPricing.js';
import { getDuaOrderDetails, buildDuaEnquiry } from '../src/utils/duaPosterOrder.js';

const poster = DUA_POSTERS.find(item => item.id === 'ayat-al-kursi');
const base = { format: 'print', sizeId: 'A3', quantity: '2' };
for (const [sizeId, price] of Object.entries(DUA_PRINT_PRICES)) {
  for (const quantity of ['1', '2', '5', '10000']) {
    const order = getDuaOrderDetails({ ...base, sizeId, quantity });
    assert.equal(order.valid, true);
    assert.equal(order.subtotal, price * Number(quantity));
    const message = buildDuaEnquiry({ poster, order });
    assert.ok(message.includes(`Print subtotal: Rs ${order.subtotal}`));
    assert.ok(!message.includes('Frame:'), 'Print-only enquiries must not include a hidden frame');
  }
}
for (const quantity of ['', ' ', '0', '-1', '1.5', '10001', 'Infinity', 'oops']) {
  const order = getDuaOrderDetails({ ...base, quantity });
  assert.equal(order.valid, false);
  assert.equal(order.subtotal, null);
  assert.equal(buildDuaEnquiry({ poster, order }), '', 'Invalid quantities cannot create an order message');
}
for (const [customWidth, customHeight] of [['', ''], ['0', '30'], ['-10', '20'], ['Infinity', '20'], ['30', 'oops']]) {
  assert.equal(getDuaOrderDetails({ ...base, sizeId: 'Custom', customWidth, customHeight }).valid, false);
}
const custom = getDuaOrderDetails({ ...base, sizeId: 'Custom', customWidth: '12.5', customHeight: '18', customUnit: 'in' });
assert.equal(custom.valid, true);
assert.equal(custom.dimensions, '12.5 × 18 in');
assert.equal(custom.subtotal, null, 'Custom sizes require a quote');
assert.ok(buildDuaEnquiry({ poster, order: custom }).includes('Size: Custom (12.5 × 18 in)'));
assert.equal(getDuaOrderDetails({ ...base, sizeId: 'bad-size' }).valid, false);
assert.equal(getDuaOrderDetails({ ...base, format: 'bad-format' }).valid, false);
const frame = { id: 'regal_heritage', name: 'Regal Heritage', finish: 'Walnut Brown & Gold' };
const framed = getDuaOrderDetails({ ...base, format: 'framed' });
assert.equal(framed.unitPrice, null, 'A print price must never be presented as a framed price');
assert.ok(buildDuaEnquiry({ poster, order: framed, frame }).includes('Frame: Regal Heritage (regal_heritage)'));

const server = await createServer({ server: { middlewareMode: true, hmr: false } });
try {
  const { default: Customizer } = await server.ssrLoadModule('/src/components/DuaPosterCustomizer.jsx');
  const render = props => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Customizer, { poster, ...props })));
  const framedPage = render({ initialFrame: 'regal_heritage' });
  assert.equal((framedPage.match(/<h1>/g) || []).length, 1);
  assert.ok(framedPage.includes('regal-heritage/front.png'));
  assert.ok(framedPage.includes('Get quote on WhatsApp'));
  assert.ok(framedPage.includes('Poster preview view'));
  assert.ok(framedPage.includes('Price on request'));
  const printPage = render({ initialFormat: 'print' });
  assert.ok(printPage.includes('Order on WhatsApp'));
  assert.ok(printPage.includes('₹43'));
  assert.ok(!printPage.includes('dpd-frame-grid'), 'Print-only orders hide frame controls');
  assert.ok(!printPage.includes('<svg class="dua-real-frame'), 'Print-only preview is unframed');
  assert.ok(render({ initialFrame: 'invalid-frame' }).includes('regal-noir/front.png'));
  for (const design of DUA_POSTERS) {
    const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Customizer, { poster: design })));
    assert.ok(html.includes(`href="${design.image}"`), design.title);
  }
  console.log('Passed: all 5 print prices and quantities, custom dimensions, invalid-order protection, quote messages, frame/print presets and all 22 product pages.');
} finally { await server.close(); }
