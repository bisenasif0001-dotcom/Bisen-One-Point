import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true, hmr: false } });
try {
  const { GALLERY_LAYOUTS, GALLERY_ROOMS, getGalleryLayout } = await server.ssrLoadModule('/src/data/galleryWalls.js');
  const { GALLERY_WALL_DATA: previousBundles } = await server.ssrLoadModule('/src/components/GalleryWallBundles.jsx');
  const { FRAME_FINISHES } = await server.ssrLoadModule('/src/data/products.js');
  const { getGalleryPlan, getGalleryPrice, galleryPrintDimensions, validateGalleryOrder, createGalleryWallItem, galleryOrderDetails, swapGalleryEntries } = await server.ssrLoadModule('/src/utils/galleryWalls.js');
  const { GalleryWallArt } = await server.ssrLoadModule('/src/components/GalleryWallPreview.jsx');
  const { default: OrderPreview } = await server.ssrLoadModule('/src/components/OrderItemPreview.jsx');
  assert.equal(getGalleryLayout('unknown').id, 'family-wall');
  assert.deepEqual(galleryPrintDimensions({ sizeId: 'A3', orientation: 'portrait' }), [29.7,42]);
  assert.deepEqual(galleryPrintDimensions({ sizeId: 'A3', orientation: 'landscape' }), [42,29.7]);
  assert.ok(Math.abs(getGalleryPlan('classic-trio').width - 140.76) < .01);
  for (const room of GALLERY_ROOMS) assert.ok(existsSync(`public${room.image}`));
  let geometryCases = 0, pairs = 0;
  for (const layout of GALLERY_LAYOUTS) {
    const old = previousBundles.find(item => item.id === layout.id);
    assert.equal(layout.startingPrice, old.startingPrice, 'Preserve advertised bundle base prices');
    assert.equal(layout.framesCount, old.framesCount);
    for (const frame of FRAME_FINISHES) {
      const plan = getGalleryPlan(layout.id, frame.id);
      assert.equal(plan.slots.length, layout.framesCount);
      assert.ok(Number.isFinite(plan.width) && Number.isFinite(plan.height));
      for (const a of plan.slots) {
        assert.ok([a.width,a.height,a.x,a.y].every(Number.isFinite));
        assert.ok(a.x >= 0 && a.y >= 0 && a.x + a.width <= plan.width + .001 && a.y + a.height <= plan.height + .001);
        assert.ok(existsSync(`public/hero/wedding-${a.sample}.jpg`));
        for (const b of plan.slots.slice(a.index + 1)) {
          assert.ok(a.x + a.width <= b.x + .001 || b.x + b.width <= a.x + .001 || a.y + a.height <= b.y + .001 || b.y + b.height <= a.y + .001, 'Frames must not overlap');
          pairs++;
        }
      }
      const config = { layoutId: layout.id, frameId: frame.id, roomId: 'living', photoMode: 'now', tone: 'mono' };
      assert.notEqual(validateGalleryOrder(config, {}), '', 'Samples cannot be ordered as customer photos');
      const deferred = createGalleryWallItem({ ...config, photoMode: 'later' }, {}, {}, 'test-gallery');
      assert.equal(deferred.price, layout.startingPrice);
      assert.equal(deferred.quantity, 1, 'One gallery set is priced once');
      assert.equal(deferred.photosPending, layout.framesCount);
      const deferredPreview = renderToStaticMarkup(React.createElement(OrderPreview, { item: deferred }));
      assert.ok(deferredPreview.includes('PHOTO TO SHARE'));
      assert.ok(!deferredPreview.includes('/hero/wedding-'), 'Pending order frames must not use sample photos');
      const photos = Object.fromEntries(layout.slots.map((slot,index) => [index, { id: `original-${index}`, url: `data:image/jpeg;base64,photo${index}`, width: 2400, height: 3200, name: `photo-${index}.jpg`, file: { privateOriginal: true } }]));
      const settings = Object.fromEntries(layout.slots.map((_,index) => [index, { fit: index % 2 ? 'contain' : 'cover', panX: 20 + index, panY: 75 }]));
      const item = JSON.parse(JSON.stringify(createGalleryWallItem(config, photos, settings, 'ready-gallery')));
      assert.equal(item.photoCount, layout.framesCount);
      assert.equal(item.photosPending, 0);
      assert.ok(!JSON.stringify(item).includes('privateOriginal'), 'Original files stay out of the bag record');
      for (const [index,slot] of item.configuration.slots.entries()) {
        assert.equal(slot.photo.originalId, `original-${index}`);
        assert.equal(slot.panX, 20 + index);
        assert.equal(slot.panY, 75);
        assert.equal(slot.fit, settings[index].fit);
        assert.ok(galleryOrderDetails(item).includes(`photo-${index}.jpg`));
      }
      assert.ok(galleryOrderDetails({ ...item, quantity: 2 }).includes(`${layout.framesCount * 2} frames total`));
      const live = renderToStaticMarkup(React.createElement(GalleryWallArt, { config, photos, settings, onSelect: () => {} }));
      assert.ok(!live.includes('NaN'));
      assert.equal((live.match(/role="button"/g) || []).length, layout.framesCount);
      assert.ok(live.includes('grayscale(1)'));
      geometryCases++;
    }
  }
  assert.equal(getGalleryPrice('bad', 'regal_noir'), null);
  assert.deepEqual(swapGalleryEntries({0: 'first', 1: 'second'}, 0, 1), {0: 'second', 1: 'first'});
  assert.deepEqual(swapGalleryEntries({0: 'first'}, 0, 2), {2: 'first'});
  console.log(`Gallery walls validated: ${geometryCases} layout/finish configurations; ${pairs} frame-pair overlap checks; preserved bundle prices; upload/deferred gates; complete photo/crop order snapshots; accessible live previews.`);
} finally { await server.close(); }
