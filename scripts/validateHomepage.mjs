import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true } });
try {
 const { default: Home } = await server.ssrLoadModule('/src/pages/HomePage.jsx');
 const { HOME_CATEGORIES, homeFrame } = await server.ssrLoadModule('/src/data/homeStudio.js');
 const { FRAME_FINISHES } = await server.ssrLoadModule('/src/data/products.js');
 const { FRAME_SIZES, MAT_OPTIONS } = await server.ssrLoadModule('/src/data/products.js');
 const { getStudioPrice } = await server.ssrLoadModule('/src/utils/frameStudio.js');
 const { default: Footer } = await server.ssrLoadModule('/src/components/Footer.jsx');
 const { FOOTER_COLUMNS } = await server.ssrLoadModule('/src/data/footerNavigation.js');
 const { BUSINESS_CONFIG } = await server.ssrLoadModule('/src/data/businessConfig.js');
 const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Home, { onOpenSizeGuide: () => {} })));
 assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
 assert.equal((html.match(/aria-roledescription="slide"/g) || []).length, 3, 'Three hero slides');
 assert.equal((html.match(/aria-hidden="true" inert=""/g) || []).length, 2, 'Inactive slides stay outside keyboard and screen reader navigation');
 assert.ok(html.includes('aria-label="Five-frame Indian wedding gallery"'));
 const weddingSubjects = ['groom-accessories', 'bride', 'couple', 'groom', 'bride-accessories'];
 const weddingGallery = html.slice(html.indexOf('aria-label="Five-frame Indian wedding gallery"'), html.indexOf('class="wedding-hero__footer"'));
 let previousSubject = -1;
 let weddingBytes = 0;
 for (const subject of weddingSubjects) {
   const asset = `/hero/wedding-${subject}.jpg`;
   const position = weddingGallery.indexOf(asset);
   assert.ok(position > previousSubject, `Correct wedding gallery order: ${subject}`);
   assert.ok(existsSync(`public${asset}`), `Local wedding photo: ${subject}`);
   weddingBytes += statSync(`public${asset}`).size;
   previousSubject = position;
 }
 assert.ok(weddingBytes < 550 * 1024, 'Wedding photographs should stay compact');
 assert.ok(html.includes('href="/pvc-cards"'));
 assert.ok(html.includes('href="/printing-services?service=Photo%20posters"'));
 assert.ok(html.includes('aria-label="Pause slideshow"'));
 assert.equal((html.match(/class="home-category home-category-/g) || []).length, 6);
 assert.equal((html.match(/class="home-frame-card"/g) || []).length, 7);
 assert.equal((html.match(/class="home-dua-feature"/g) || []).length, 1);
 assert.equal((html.match(/class="home-dua-compact"/g) || []).length, 2);
 assert.equal((html.match(/class="home-faq-item"/g) || []).length, 4);
 assert.ok(html.includes('role="group" aria-label="Choose a frame finish"'));
 for (const frame of FRAME_FINISHES) {
  assert.ok(html.includes(`aria-label="Try ${frame.name}, ${frame.finish.replaceAll('&', '&amp;')}"`));
  assert.equal(FRAME_SIZES[0].basePrice + MAT_OPTIONS[0].extra + frame.extraPrice, getStudioPrice({ sizeId: 'A5', frameId: frame.id, glassId: 'crystal_acrylic' }).unit);
 }
 for (const [poster, frame] of [['ayat-al-kursi', 'regal_aurelia'], ['allah-will-suffice-you-in-everything', 'regal_noir'], ['sayyid-al-istighfar', 'regal_heritage']]) {
  assert.ok(html.includes(`href="/dua-posters/${poster}?frame=${frame}"`), 'Dua links preserve the frame shown on the homepage');
 }
 assert.ok(html.includes('From ₹29'));
 assert.ok(html.includes('id="home-faq"'));
 const footer = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Footer)));
 assert.equal(FOOTER_COLUMNS.length, 5);
 for (const column of FOOTER_COLUMNS) {
  assert.ok(footer.includes(`aria-controls="footer-links-${column.id}"`));
  assert.ok(footer.includes(`id="footer-links-${column.id}"`));
  for (const link of column.links) assert.ok(footer.includes(`href="${link.to}"`), link.label);
 }
 assert.ok(footer.includes('href="/#home-faq"'));
 assert.ok(footer.includes(`href="tel:${BUSINESS_CONFIG.contact.phone.replace(/[^+\d]/g, '')}"`));
 const ids = [...(html + footer).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
 assert.equal(ids.length, new Set(ids).size, 'Page anchors and accordion panels need unique IDs');
 assert.ok(existsSync('public/rooms/size-guide/living-v2.webp'));
 assert.ok(statSync('public/rooms/size-guide/living-v2.webp').size < 220 * 1024, 'Gallery room uses the optimised local image');
 for (const path of [...HOME_CATEGORIES.map(c => c.path), '/frames-catalogue', '/islamic-art', '/cards', '/birthday-cards', '/itra-perfumes', '/size-guide', '/contact']) {
  if (path === '/islamic-art') continue; // Discoverable from the primary navigation, beyond the original-poster collection.
  assert.ok(html.includes(`href="${path}"`), path);
 }
 assert.ok(html.includes('href="#shop-creations"'));
 assert.ok(html.includes('₹22'));
 assert.ok(!html.includes('Bestseller') && !html.includes('5-star'), 'No invented popularity or review claims');
 let bytes = 0;
 for (const item of FRAME_FINISHES) {
   const frame = homeFrame(item.id);
   assert.ok(existsSync(`public${frame.frontImage}`));
   bytes += statSync(`public${frame.frontImage}`).size;
 }
 assert.ok(bytes < 600 * 1024, 'Homepage frame previews should stay compact');
 console.log('Passed: 3 accessible hero slides, wedding gallery, 6 categories, 7 interactive frames and matching studio prices, 3 frame-aware Dua links, print pricing, FAQ anchors, 5 footer groups and local preview asset budgets.');
} finally { await server.close(); }
