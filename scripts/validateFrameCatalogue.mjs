import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true } });
try {
  const { FRAME_FINISHES, GLASS_OPTIONS } = await server.ssrLoadModule('/src/data/products.js');
  const { CUSTOM_FRAME_SIZES, getStudioPrice } = await server.ssrLoadModule('/src/utils/frameStudio.js');
  const { CATALOGUE_FILTERS, getCataloguePrice, getCatalogueFinishes, getCatalogueDimensions } = await server.ssrLoadModule('/src/utils/frameCatalogue.js');
  const { default: Catalogue } = await server.ssrLoadModule('/src/pages/FrameCataloguePage.jsx');
  const { default: Preview } = await server.ssrLoadModule('/src/components/CatalogueFramePreview.jsx');
  const { homeFrame } = await server.ssrLoadModule('/src/data/homeStudio.js');
  const originalOrder = FRAME_FINISHES.map(frame => frame.id);
  let prices = 0;
  let previewBytes = 0;
  for (const size of CUSTOM_FRAME_SIZES) {
    assert.equal(getCatalogueFinishes({ sizeId: size.id }).length, 7, `All frames support ${size.id}`);
    for (const frame of FRAME_FINISHES) {
      assert.equal(getCataloguePrice(frame.id, size.id), getStudioPrice({ frameId: frame.id, sizeId: size.id, glassId: GLASS_OPTIONS[0].id }).unit);
      prices++;
    }
    for (const sort of ['price-asc', 'price-desc']) {
      const sorted = getCatalogueFinishes({ sizeId: size.id, sort }).map(frame => getCataloguePrice(frame.id, size.id));
      assert.deepEqual(sorted, [...sorted].sort((a, b) => sort === 'price-asc' ? a - b : b - a));
    }
  }
  assert.deepEqual(FRAME_FINISHES.map(frame => frame.id), originalOrder, 'Sorting must not change the shared frame collection');
  assert.equal(getCataloguePrice('regal_aurelia', 'A5'), 499, 'Catalogue price includes the mandatory studio mount');
  assert.equal(getCataloguePrice('bad-frame', 'A5'), null);
  assert.deepEqual(getCatalogueFinishes({ sizeId: '4x6' }), [], 'Do not advertise sizes that the frame studio cannot configure');
  assert.deepEqual(getCatalogueFinishes({ category: 'unknown' }), []);
  for (const filter of CATALOGUE_FILTERS.slice(1)) {
    const frames = getCatalogueFinishes({ category: filter.id });
    assert.ok(frames.length > 0);
    assert.ok(frames.every(frame => frame.category === filter.category));
  }
  assert.equal(getCatalogueDimensions('A4'), '21 × 29.7 cm');
  assert.equal(getCatalogueDimensions('A4', 'landscape'), '29.7 × 21 cm');
  assert.equal(getCatalogueDimensions('12x18', 'landscape'), '45.72 × 30.48 cm');
  for (const frame of FRAME_FINISHES) {
    const compactFrame = homeFrame(frame.id);
    assert.ok(existsSync(`public${compactFrame.frontImage}`));
    previewBytes += statSync(`public${compactFrame.frontImage}`).size;
    for (const angle of frame.angles) assert.ok(existsSync(`public${angle.image}`), `${frame.name}: ${angle.id}`);
    for (const orientation of ['portrait', 'landscape']) {
      const empty = renderToStaticMarkup(React.createElement(Preview, { frame: compactFrame, orientation, withPhoto: false }));
      assert.ok(empty.includes(`href="${compactFrame.frontImage}"`));
      assert.ok(!empty.includes('wedding-bride.jpg'));
      if (orientation === 'landscape') assert.ok(empty.includes('viewBox="0 0 1402 1122"'));
      const photo = renderToStaticMarkup(React.createElement(Preview, { frame: compactFrame, orientation }));
      assert.ok(photo.includes(orientation === 'portrait' ? '/hero/wedding-bride.jpg' : 'photo-1506744038136'));
    }
  }
  assert.ok(previewBytes < 600 * 1024, 'Initial frame photography stays compact');
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Catalogue)));
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.equal((html.match(/class="fcat-card"/g) || []).length, 7);
  assert.ok(html.includes('aria-label="Compare frame size"'));
  assert.ok(html.includes('aria-label="Frame orientation"'));
  assert.ok(html.includes('aria-label="Catalogue preview mode"'));
  assert.ok(html.includes('aria-controls="fcat-comparison-settings"'));
  assert.ok(html.includes('id="fcat-comparison-settings"'));
  assert.ok(html.includes('value="12x18"'));
  assert.ok(!html.includes('href="/frames/'), 'Full-resolution detail photographs load when the inspector is opened');
  assert.ok(!html.includes('South Mumbai Residence'));
  assert.ok(html.includes('href="/size-guide"') && html.includes('href="/gallery-walls"'));
  console.log(`Passed: ${prices} catalogue/studio prices, 6 supported sizes, category filters, stable price sorting, both preview orientations, 28 original detail photos, 7 lightweight frame cards and guide links.`);
} finally { await server.close(); }
