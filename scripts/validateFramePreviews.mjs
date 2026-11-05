import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true } });
try {
  const { default: Preview } = await server.ssrLoadModule('/src/components/FramedPosterPreview.jsx');
  const { FRAME_FINISHES, FRAME_SIZES } = await server.ssrLoadModule('/src/data/products.js');
  const { FRAME_PREVIEW_APERTURES } = await server.ssrLoadModule('/src/data/framePreviewApertures.js');
  const { DUA_POSTERS } = await server.ssrLoadModule('/src/data/duaPosters.js');
  for (const frame of FRAME_FINISHES) {
    const a = FRAME_PREVIEW_APERTURES[frame.id];
    assert.ok(a, `${frame.name}: aperture required`);
    assert.ok(a.x > 0 && a.y > 0 && a.width > 0 && a.height > 0);
    assert.ok(a.x + a.width < 1122 && a.y + a.height < 1402);
    assert.ok(existsSync(`public${frame.frontImage}`));
    for (const size of FRAME_SIZES) assert.ok(frame.availableSizes.includes(size.id));
    for (const poster of DUA_POSTERS) {
      const html = renderToStaticMarkup(React.createElement(Preview, { poster, frame }));
      assert.ok(html.includes(`href="${frame.frontImage}"`));
      assert.ok(html.includes(`href="${poster.image}"`));
      assert.ok(html.includes('preserveAspectRatio="xMidYMid meet"'), 'Artwork must never crop or stretch');
      assert.ok(html.includes('overflow="hidden"'), 'Artwork stays inside the aperture');
    }
  }
  const plain = renderToStaticMarkup(React.createElement(Preview, { poster: DUA_POSTERS[0], frame: null }));
  assert.ok(plain.includes('<img') && !plain.includes('<svg'), 'Print-only preview has no frame');
  console.log(`Passed ${FRAME_FINISHES.length * DUA_POSTERS.length} poster/frame combinations, all standard sizes and print-only rendering.`);
} finally { await server.close(); }
