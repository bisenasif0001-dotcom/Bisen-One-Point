import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
const server = await createServer({ server: { middlewareMode: true } });
try {
  const { default: OrderButton } = await server.ssrLoadModule('/src/components/StudioOrderButton.jsx');
  const { getStudioPrice } = await server.ssrLoadModule('/src/utils/frameStudio.js');
  const events = [];
  const defaults = {
    isSample: false, uploading: false,
    validQuantity: Boolean(getStudioPrice({ sizeId: 'A2', frameId: 'regal_heritage', glassId: 'crystal_acrylic', quantity: 1 })),
    onAddToBag: () => events.push('added'),
    onUpload: () => events.push('upload'),
    onFixQuantity: () => events.push('quantity'),
  };
  // Regression: a valid uploaded photo can be ordered without a confirmation checkbox.
  const ready = OrderButton({ ...defaults, confirmed: false });
  assert.notEqual(ready.props.disabled, true);
  assert.ok(renderToStaticMarkup(ready).includes('Add to bag'));
  ready.props.onClick();
  assert.deepEqual(events, ['added']);
  const sample = OrderButton({ ...defaults, isSample: true });
  assert.notEqual(sample.props.disabled, true);
  assert.ok(renderToStaticMarkup(sample).includes('Upload photo to order'));
  sample.props.onClick();
  assert.deepEqual(events, ['added', 'upload']);
  const invalid = OrderButton({ ...defaults, validQuantity: false });
  assert.notEqual(invalid.props.disabled, true);
  assert.ok(renderToStaticMarkup(invalid).includes('Check quantity'));
  invalid.props.onClick();
  assert.deepEqual(events, ['added', 'upload', 'quantity']);
  const loading = OrderButton({ ...defaults, uploading: true });
  assert.equal(loading.props.disabled, true);
  assert.ok(renderToStaticMarkup(loading).includes('Preparing photo'));
  assert.equal(loading.props.onClick, undefined);
  console.log('Passed: valid photo adds without a checkbox; samples open upload; invalid quantities prompt correction; uploading prevents premature orders.');
} finally { await server.close(); }
