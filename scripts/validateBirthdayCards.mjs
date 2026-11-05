import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false } });
try {
  const { CARD_TEMPLATES, CARD_SIZES, QUANTITY_DISCOUNTS } = await server.ssrLoadModule('/src/data/birthdayCards.js');
  const { createBirthdayCardItem, validateCard, getCardPricing, birthdayOrderDetails, wrapCardText, getCardPhotoPlacement } = await server.ssrLoadModule('/src/utils/birthdayCards.js');
  const { default: Preview } = await server.ssrLoadModule('/src/components/BirthdayCardPreview.jsx');
  const { default: OrderPreview } = await server.ssrLoadModule('/src/components/OrderItemPreview.jsx');
  const config = { templateId: 'minimal_editorial', recipientName: 'Amira', headline: 'Happy Birthday', message: 'A memory worth keeping.\nA year of beautiful beginnings.', signoff: 'With love, Zaid & family', includePhoto: false, sizeId: '5x7', cardCount: 5, photoFit: 'cover', panX: 25, panY: 70 };
  const photo = { id: 'test-original', url: 'data:image/jpeg;base64,sample', width: 1600, height: 900, name: 'our-memory.jpg', isSample: false };
  assert.equal(validateCard(config), '');
  for (const field of ['recipientName','headline','message','signoff']) assert.notEqual(validateCard({ ...config, [field]: '   ' }), '');
  assert.notEqual(validateCard({ ...config, message: Array(12).fill('Line').join('\n') }), '');
  assert.notEqual(validateCard({ ...config, includePhoto: true }, { ...photo, isSample: true }), '');
  assert.equal(validateCard({ ...config, includePhoto: true }, photo), '');
  assert.throws(() => getCardPricing('bad', 5));
  assert.throws(() => getCardPricing('A6', 4));
  assert.deepEqual(getCardPricing('5x7', 5), { baseTotal: 995, savings: 149, total: 846, percent: 15 });
  let orders = 0;
  for (const size of CARD_SIZES) for (const tier of QUANTITY_DISCOUNTS) {
    const item = createBirthdayCardItem({ ...config, sizeId: size.id, cardCount: tier.qty }, null, 'test.svg', 'test-id');
    assert.equal(item.quantity, 1, 'Bag quantity must count sets, not multiply the already-priced card count');
    assert.equal(item.cardCount, tier.qty);
    assert.equal(item.price, size.unitPrice * tier.qty - Math.round(size.unitPrice * tier.qty * tier.discountPercent / 100));
    assert.equal(item.price * item.quantity, getCardPricing(size.id, tier.qty).total);
    const snapshot = JSON.parse(JSON.stringify(item));
    assert.equal(snapshot.personalisation.insideMessage, config.message);
    assert.equal(snapshot.personalisation.senderName, config.signoff);
    assert.match(birthdayOrderDetails({ ...snapshot, quantity: 2 }), new RegExp(`= ${tier.qty * 2} cards`));
    assert.ok(birthdayOrderDetails(snapshot).includes(config.message));
    orders++;
  }
  const photoItem = createBirthdayCardItem({ ...config, includePhoto: true }, photo, 'preview.svg');
  assert.equal(photoItem.configuration.photo.originalId, 'test-original');
  assert.equal(photoItem.configuration.panX, 25);
  assert.ok(!JSON.stringify(photoItem).includes('"file"'), 'Keep original files out of the bag record');
  const box = { x: 0, y: 0, width: 500, height: 700 };
  for (const pan of [0,50,100]) {
    const cover = getCardPhotoPlacement(box, photo, 'cover', pan, pan);
    assert.ok(cover.x <= 0 && cover.y <= 0 && cover.x + cover.width >= 500 && cover.y + cover.height >= 700, 'Fill must cover the photo opening');
    const contain = getCardPhotoPlacement(box, photo, 'contain', pan, pan);
    assert.ok(contain.x >= 0 && contain.y >= 0 && contain.x + contain.width <= 500 && contain.y + contain.height <= 700, 'Full-photo fit must retain the entire image');
  }
  assert.deepEqual(wrapCardText('Line one\nLine two', 500, 20), ['Line one','Line two']);
  assert.ok(wrapCardText('W'.repeat(48), 360, 52).length > 1, 'Long unbroken words must wrap');
  const designs = new Set();
  for (const template of CARD_TEMPLATES) {
    const artwork = renderToStaticMarkup(React.createElement(Preview, { config: { ...config, templateId: template.id, headline: template.sampleGreeting } }));
    assert.ok(!artwork.includes('NaN'));
    designs.add(artwork.replaceAll(template.name, '').replaceAll(template.sampleGreeting, ''));
    const inside = renderToStaticMarkup(React.createElement(Preview, { config: { ...config, templateId: template.id }, view: 'inside' }));
    assert.ok(inside.includes('A memory worth keeping.'));
    const ordered = renderToStaticMarkup(React.createElement(OrderPreview, { item: createBirthdayCardItem({ ...config, templateId: template.id }, null, 'preview.svg') }));
    assert.ok(ordered.includes('<svg') && ordered.includes('Amira'), 'The bag must display the actual personalised card');
  }
  assert.equal(designs.size, 7);
  const safe = renderToStaticMarkup(React.createElement(Preview, { config: { ...config, headline: '<script>alert(1)</script>' } }));
  assert.ok(!safe.includes('<script>'));
  console.log(`Birthday studio validated: ${orders} size/set prices; 7 designs; original-photo references; complete message snapshots; cover/contain crop; safe text.`);
} finally { await server.close(); }

