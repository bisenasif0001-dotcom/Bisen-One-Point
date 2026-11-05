import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { DEFAULT_PRINT_CONFIG, PRINT_SIZES, MAX_PRINT_FILE_BYTES, buildPrintCartItem, getPrintLayout, getPrintQuality, getPrintTotals, validatePrintFile } from '../src/utils/photoPrints.js';

const photo = { id: 'test-photo', name: 'My original.jpg', width: 3600, height: 2400, url: '/test.jpg', thumbnail: 'data:image/jpeg;base64,small-preview', rotation: 0, panX: 50, panY: 50, zoom: 1, isSample: false };
const tolerance = 0.000001;
let cases = 0;
for (const size of PRINT_SIZES) for (const orientation of ['portrait', 'landscape']) for (const border of ['white', 'borderless']) for (const rotation of [0, 90, 180, 270]) for (const fit of ['contain', 'cover']) for (const position of [0, 50, 100]) {
  const layout = getPrintLayout({ ...photo, rotation, panX: position, panY: position }, { ...DEFAULT_PRINT_CONFIG, sizeId: size.id, orientation, border, fit });
  assert.equal(layout.opening.x, border === 'white' ? 5 : 0, 'White border is exactly 5 mm on every size');
  assert.equal(layout.width, orientation === 'landscape' ? size.mm[1] : size.mm[0]);
  const b = layout.bounds;
  const opening = layout.opening;
  if (fit === 'cover') {
    assert.ok(b.x <= tolerance && b.y <= tolerance, 'Crop must not reveal a blank edge');
    assert.ok(b.x + b.width >= opening.width - tolerance && b.y + b.height >= opening.height - tolerance, 'Rotated image fills the full opening');
  } else {
    assert.ok(b.x >= -tolerance && b.y >= -tolerance, 'Keep full photo preserves every edge');
    assert.ok(b.x + b.width <= opening.width + tolerance && b.y + b.height <= opening.height + tolerance);
  }
  cases++;
}
const base = { ...DEFAULT_PRINT_CONFIG, orientation: 'landscape', fit: 'cover' };
const normalQuality = getPrintQuality(photo, base);
assert.ok(getPrintQuality({ ...photo, zoom: 2 }, base).dpi < normalQuality.dpi, 'Zoom correctly lowers effective print resolution');
assert.ok(getPrintQuality(photo, { ...base, sizeId: 'A3' }).dpi < normalQuality.dpi, 'Larger print sizes need more resolution');
assert.equal(getPrintQuality({ ...photo, isSample: true }, base), null, 'Samples cannot claim measured print quality');
assert.equal(getPrintQuality({ ...photo, width: 0 }, base), null);
assert.deepEqual(getPrintTotals(3, '5x7', 5), { photoCount: 3, copies: 5, printCount: 15, unitPrice: 49, total: 735 });
for (const quantity of ['', 0, -1, 1.5, 100, NaN]) assert.equal(getPrintTotals(2, '5x7', quantity), null);
assert.equal(getPrintTotals(21, '5x7', 1), null);
assert.ok(validatePrintFile({ type: 'image/heic', size: 100 }).includes('HEIC'));
assert.ok(validatePrintFile({ type: 'image/jpeg', size: 0 }).includes('empty'));
assert.ok(validatePrintFile({ type: 'image/jpeg', size: MAX_PRINT_FILE_BYTES + 1 }).includes('25 MB'));
assert.equal(validatePrintFile({ type: 'image/webp', size: 1024 }), '');
const second = { ...photo, id: 'second-photo', name: 'Another memory.png', rotation: 90, panX: 80, zoom: 1.4 };
const cart = buildPrintCartItem({ photos: [photo, second], config: base, copies: 5, notes: 'Keep the date visible.', id: 'test-batch' });
assert.equal(cart.price, 490);
assert.equal(cart.quantity, 1, 'A complete print batch is one bag item');
assert.equal(cart.printQuantity, 10);
assert.equal(cart.photos.length, 2, 'Every photo is retained, not only the inspected image');
assert.equal(cart.photos[1].assetId, second.id);
assert.equal(cart.photos[1].rotation, 90);
assert.equal(cart.photos[1].panX, 80);
assert.equal(cart.photos[1].zoom, 1.4);
assert.ok(!JSON.stringify(cart).includes('blob:'), 'Bag previews survive page reloads');
assert.equal(cart.specialInstructions, 'Keep the date visible.');
assert.throws(() => buildPrintCartItem({ photos: [{ ...photo, isSample: true }], config: base, copies: 1 }), /Upload your own/);

const server = await createServer({ server: { middlewareMode: true } });
try {
  const { default: PhotoPrintsPage } = await server.ssrLoadModule('/src/pages/PhotoPrintsPage.jsx');
  const { default: PrintPaperPreview } = await server.ssrLoadModule('/src/components/PrintPaperPreview.jsx');
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(PhotoPrintsPage, { onAddToCart: () => {} })));
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
  assert.ok(html.includes('Print customisation steps'));
  assert.ok(html.includes('Samples are for preview only.'));
  assert.ok(!html.includes('300 DPI Lab Ready'));
  assert.ok(!html.includes('Same-Day Dispatch'));
  assert.ok(html.includes('accept="image/jpeg,image/png,image/webp"'));
  assert.ok(html.includes('<dialog'));
  const preview = renderToStaticMarkup(React.createElement(PrintPaperPreview, { photo: second, config: { ...base, border: 'white' } }));
  assert.ok(preview.includes('rotate(90)'));
  assert.ok(preview.includes('5 millimetre white border'));
  console.log(`Passed: ${cases} size/orientation/border/rotation/crop cases; resolution checks; validation; batch pricing; complete, reload-safe bag metadata; sample gating; accessible page structure.`);
} finally { await server.close(); }
