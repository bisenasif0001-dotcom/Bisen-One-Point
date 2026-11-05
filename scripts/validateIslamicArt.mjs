import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true, hmr: false } });
try {
  const { VERSE_ARTWORKS, filterVerseArtworks, verseDesignPath, resolveIslamicArtTab, buildQulsSetEnquiry, getVerseSelection, verseCollectionPath } = await server.ssrLoadModule('/src/data/islamicArt.js');
  const { FRAME_FINISHES, FRAME_SIZES } = await server.ssrLoadModule('/src/data/products.js');
  const { DUA_PRINT_PRICES } = await server.ssrLoadModule('/src/data/duaPricing.js');
  const { default: Page } = await server.ssrLoadModule('/src/pages/IslamicArtPage.jsx');
  const { default: Customizer } = await server.ssrLoadModule('/src/components/DuaPosterCustomizer.jsx');
  const { getWhatsAppUrl, BUSINESS_CONFIG } = await server.ssrLoadModule('/src/data/businessConfig.js');
  const render = (component, path='/islamic-art?tab=verses') => renderToStaticMarkup(React.createElement(MemoryRouter, {initialEntries:[path]}, component));
  assert.equal(VERSE_ARTWORKS.length,4);
  assert.equal(new Set(VERSE_ARTWORKS.map(item=>item.id)).size,4);
  for (const item of VERSE_ARTWORKS) {
    assert.ok(item.id && item.title && item.displayTitle);
    assert.ok(existsSync(`public${item.image}`) && existsSync(`public${item.thumbnail}`));
  }
  assert.equal(filterVerseArtworks('', 'all').length,4);
  assert.equal(filterVerseArtworks('', 'surahs').length,3);
  assert.equal(filterVerseArtworks('', 'ayat').length,1);
  for (const query of ['KURSI','  al-kursi  ','ayat al kursi']) assert.equal(filterVerseArtworks(query).length,1);
  assert.equal(filterVerseArtworks('surah').length,3);
  assert.equal(filterVerseArtworks('ikhlas','surahs')[0].displayTitle,'Surah Al-Ikhlas');
  assert.equal(filterVerseArtworks('ikhlas','ayat').length,0);
  assert.equal(filterVerseArtworks('no such design').length,0);
  for(const [query,path,tab] of [['tab=verses','/islamic-art','verses'],['category=surahs','/islamic-art','verses'],['tab=asma-ul-husna','/islamic-art','names'],['','/asma-ul-husna','names'],['','/99-names','names'],['','/islamic-art','duas'],['tab=unknown','/islamic-art','duas']]) assert.equal(resolveIslamicArtTab(new URLSearchParams(query),path),tab);
  let choices=0;
  for (const item of VERSE_ARTWORKS) for(const size of FRAME_SIZES) for(const frame of FRAME_FINISHES) for(const format of ['framed','print']) {
    const url=new URL(verseDesignPath(item,{format,frameId:frame.id,sizeId:size.id}),'http://localhost');
    assert.equal(url.pathname,`/dua-posters/${item.id}`);
    assert.equal(url.searchParams.get('size'),size.id);
    assert.equal(url.searchParams.get('format'),format);
    assert.equal(url.searchParams.get('from'),'verses');
    assert.equal(url.searchParams.get('frame'),format==='framed'?frame.id:null);
    assert.ok(DUA_PRINT_PRICES[size.id]>0);
    const selection=getVerseSelection(url.searchParams);
    assert.equal(selection.sizeId,size.id);
    assert.equal(selection.format,format);
    assert.equal(selection.frameId,format==='framed'?frame.id:'regal_noir');
    assert.deepEqual(getVerseSelection(new URL(verseCollectionPath(selection),'http://localhost').searchParams),selection);
    choices++;
  }
  const html=render(React.createElement(Page));
  assert.deepEqual(getVerseSelection(new URLSearchParams('size=bad&format=unknown&frame=missing')),{sizeId:'A4',format:'framed',frameId:'regal_noir'});
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
  assert.equal((html.match(/class="ia-design-card"/g)||[]).length,4);
  assert.ok(!html.includes('unsplash') && !html.includes('verified reviews'));
  assert.ok(html.includes('aria-current="page"'));
  for(const size of FRAME_SIZES) {
    const customizer=render(React.createElement(Customizer,{poster:VERSE_ARTWORKS[0],initialSize:size.id,initialFrame:'regal_blue',initialFormat:'print'}));
    assert.ok(customizer.includes(`${size.id} · `));
    assert.ok(customizer.includes(`₹${DUA_PRINT_PRICES[size.id]}`));
    assert.ok(customizer.includes('Print only'));
  }
  const fallback=render(React.createElement(Customizer,{poster:VERSE_ARTWORKS[0],initialSize:'bad-size'}));
  assert.ok(fallback.includes('A4 · '));
  for(const format of ['framed','print']) {
    const brief=buildQulsSetEnquiry({format,frame:FRAME_FINISHES[1],sizeId:'A3'});
    for(const item of VERSE_ARTWORKS.slice(1)) assert.ok(brief.includes(`1 × ${item.displayTitle}`));
    assert.ok(brief.includes('Total: 3 individual designs') && brief.includes('A3'));
    assert.equal(brief.includes(FRAME_FINISHES[1].name),format==='framed');
    const url=new URL(getWhatsAppUrl(brief));
    assert.equal(url.pathname,`/${BUSINESS_CONFIG.contact.whatsapp}`);
    assert.equal(url.searchParams.get('text'),brief);
  }
  console.log(`Validated 4 original assets, ${choices} design/size/frame/format links, search and filter combinations, legacy tabs, size hand-off and matching-set enquiries.`);
} finally { await server.close(); }
