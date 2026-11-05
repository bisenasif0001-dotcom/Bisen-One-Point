import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { existsSync } from 'node:fs';
const server = await createServer({ server: { middlewareMode: true } });
try {
  const helpers = await server.ssrLoadModule('/src/utils/frameStudio.js');
  const { getFrameGeometry, placeStudioPhoto, getStudioPrice, getStudioQuality, validateStudioFile, STUDIO_MAX_FILE_BYTES } = helpers;
  const { FRAME_FINISHES, FRAME_SIZES } = await server.ssrLoadModule('/src/data/products.js');
  const { FRAME_STUDIO_SAMPLES } = await server.ssrLoadModule('/src/data/frameStudioSamples.js');
  assert.equal(FRAME_STUDIO_SAMPLES.length, 4);
  for (const orientation of ['portrait', 'landscape']) {
    assert.equal(FRAME_STUDIO_SAMPLES.filter(sample => sample.orientation === orientation).length, 2);
  }
  for (const sample of FRAME_STUDIO_SAMPLES) {
    assert.equal(sample.width > sample.height ? 'landscape' : 'portrait', sample.orientation);
  }
  for (const sample of FRAME_STUDIO_SAMPLES.filter(sample => sample.url.startsWith('/'))) {
    assert.ok(existsSync(`public${sample.url}`), `Missing sample: ${sample.url}`);
    assert.ok(sample.width < sample.height, 'Portrait samples must use portrait source photos');
  }
  const { default: Studio } = await server.ssrLoadModule('/src/components/FrameCustomizer.jsx');
  const { default: Preview } = await server.ssrLoadModule('/src/components/FramedPosterPreview.jsx');
  const { default: OrderPreview } = await server.ssrLoadModule('/src/components/OrderItemPreview.jsx');
  const { default: CartDrawer } = await server.ssrLoadModule('/src/components/CartDrawer.jsx');
  assert.equal(validateStudioFile({ type: 'image/jpeg', size: 5000 }), '');
  assert.ok(validateStudioFile({ type: 'image/heic', size: 1000 }).includes('Convert HEIC'));
  assert.ok(validateStudioFile({ type: 'image/png', size: STUDIO_MAX_FILE_BYTES + 1 }).includes('20 MB'));
  assert.ok(validateStudioFile({ type: 'image/png', size: 0 }).includes('empty'));
  assert.ok(validateStudioFile({ type: 'text/plain', size: 40 }));
  assert.equal(getStudioPrice({ sizeId: 'A4', frameId: 'regal_aurelia', glassId: 'crystal_acrylic' }).unit, 749);
  assert.equal(getStudioPrice({ sizeId: 'A3', frameId: 'regal_heritage', glassId: 'anti_glare_acrylic', quantity: 2 }).total, 3298);
  for (const quantity of [0, -1, 1.5, NaN, 100]) assert.equal(getStudioPrice({ sizeId: 'A4', frameId: 'regal_noir', glassId: 'crystal_acrylic', quantity }), null);
  assert.equal(getStudioPrice({ sizeId: 'invalid', frameId: 'regal_noir', glassId: 'crystal_acrylic' }), null);
  const high = getStudioQuality({ photoWidth: 4000, photoHeight: 6000, sizeId: 'A4' });
  const low = getStudioQuality({ photoWidth: 400, photoHeight: 600, sizeId: 'A1' });
  assert.equal(high.level, 'good'); assert.equal(low.level, 'low');
  const epsilon = 1e-7;
  let layouts = 0;
  for (const frame of FRAME_FINISHES) for (const orientation of ['portrait', 'landscape']) {
    const { opening, width, height } = getFrameGeometry(frame.id, orientation);
    assert.ok(opening.x > 0 && opening.y > 0 && opening.x + opening.width < width && opening.y + opening.height < height);
    for (const dimensions of [[4000, 6000], [6000, 4000], [3000, 3000], [8000, 1000]]) for (const fit of ['contain', 'cover']) for (const panX of [0, 50, 100]) for (const panY of [0, 50, 100]) {
      const p = placeStudioPhoto({ photoWidth: dimensions[0], photoHeight: dimensions[1], ...opening, fit, panX, panY });
      assert.ok(Math.abs(p.width / p.height - dimensions[0] / dimensions[1]) < epsilon, 'Photo proportions must stay unchanged');
      if (fit === 'contain') assert.ok(p.x >= -epsilon && p.y >= -epsilon && p.x + p.width <= opening.width + epsilon && p.y + p.height <= opening.height + epsilon, 'Full photo must fit inside opening');
      else assert.ok(p.x <= epsilon && p.y <= epsilon && p.x + p.width >= opening.width - epsilon && p.y + p.height >= opening.height - epsilon, 'Crop must cover opening at every pan position');
      layouts++;
    }
    const html = renderToStaticMarkup(React.createElement(Preview, { poster: { image: '/example.jpg', title: 'Test photo', width: 6000, height: 4000 }, frame, orientation, fit: 'cover', filter: 'grayscale(1)', panX: 25, panY: 75 }));
    assert.ok(html.includes(frame.frontImage)); assert.ok(html.includes('/example.jpg')); assert.ok(html.includes('grayscale(1)'));
    if (orientation === 'landscape') assert.ok(html.includes('viewBox="0 0 1402 1122"'));
    for (const size of FRAME_SIZES) assert.ok(getStudioPrice({ sizeId: size.id, frameId: frame.id, glassId: 'crystal_acrylic' }).unit > 0);
  }
  const studio = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Studio, { preselectedFrameId: 'regal_heritage' })));
  assert.equal((studio.match(/class="fs-step-number"/g) || []).length, 3);
  assert.equal((studio.match(/<h1>/g) || []).length, 1);
  assert.ok(studio.includes('regal-heritage/front.png')); assert.ok(studio.includes('SAMPLE PHOTO'));
  assert.ok(studio.includes('Keep full photo')); assert.ok(studio.includes('20 MB')); assert.ok(studio.includes('₹899'));
  assert.ok(studio.includes('aria-label="Preview frame orientation"'));
  assert.equal((studio.match(/class="fs-sample-caption"/g) || []).length, 4);
  assert.ok(studio.includes('href="/hero/wedding-bride.jpg"'), 'Portrait frame starts with a portrait sample');
  const landscapeStudio = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Studio, { initialOrientation: 'landscape' })));
  assert.ok(landscapeStudio.includes('fs-framed-art fs-orientation-landscape'));
  assert.ok(landscapeStudio.includes(`href="${FRAME_STUDIO_SAMPLES[0].url.replaceAll('&', '&amp;')}"`));
  const item = { id: 'qa-frame', type: 'custom_frame', frameId: 'regal_noir', title: 'Noir test', image: '/test.jpg', photoName: 'My image', photoWidth: 6000, photoHeight: 4000, orientation: 'landscape', fit: 'cover', panX: 10, panY: 80, filterCss: 'grayscale(1)', price: 749, quantity: 2 };
  const thumbnail = renderToStaticMarkup(React.createElement(OrderPreview, { item }));
  assert.ok(thumbnail.includes('regal-noir/front.png')); assert.ok(thumbnail.includes('1402 1122')); assert.ok(thumbnail.includes('grayscale(1)'));
  const drawer = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(CartDrawer, { isOpen: true, cartItems: [item], discountPercent: 0, discountCode: '' })));
  assert.ok(drawer.includes('regal-noir/front.png')); assert.ok(drawer.includes('landscape'));
  console.log(`Passed: ${layouts} photo-fit/pan layouts, 7 real frames in both orientations, 2 landscape + 2 portrait samples, matching initial preview, always-visible orientation control, all size prices, upload validation, quality checks, 3-step studio and cart previews.`);
} finally { await server.close(); }
