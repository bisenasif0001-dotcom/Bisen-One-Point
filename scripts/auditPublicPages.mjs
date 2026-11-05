import { existsSync, writeFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createServer } from 'vite';
import { routeInfo, SITEMAP_PATHS } from '../src/data/siteRoutes.js';
import { FRAME_FINISHES } from '../src/data/products.js';

const mappings = {
  '/cancellation': 'PolicyPage', '/grievance': 'PolicyPage', '/privacy': 'PolicyPage', '/terms': 'PolicyPage', '/returns': 'PolicyPage', '/shipping': 'PolicyPage', '/original-files': 'PolicyPage',
  '/': 'HomePage', '/frames-catalogue': 'FrameCataloguePage', '/custom-framing': 'CustomFramingPage',
  '/photo-prints': 'PhotoPrintsPage', '/dua-posters': 'DuaPostersPage', '/pvc-cards': 'PvcCardsPage',
  '/printing-services': 'PrintingServicesPage', '/gallery-walls': 'GalleryWallBuilderPage',
  '/birthday-cards': 'BirthdayCardBuilderPage', '/cards': 'CardsInvitationsPage',
  '/islamic-art': 'IslamicArtPage', '/itra-perfumes': 'ItraPerfumesPage', '/size-guide': 'SizeGuidePage',
  '/about': 'AboutPage', '/contact': 'ContactPage', '/occasions': 'OccasionLandingPage', '/gift-sets': 'OccasionLandingPage',
};
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"');
const server = await createServer({ server: { middlewareMode: true } });
const report = { checkedAt: new Date().toISOString(), pages: [], missingAssets: [], invalidLinks: [], renderErrors: [] };
try {
  const paths = [...SITEMAP_PATHS, '/islamic-art?tab=names', ...FRAME_FINISHES.map(frame => `/product/${frame.id}`), ...['tpl-1', 'tpl-2', 'tpl-3', 'tpl-4'].map(id => `/cards/${id}`)];
  for (const path of paths) {
    const pathname = path.split('?')[0];
    let file = mappings[pathname], name = 'default', pattern = pathname, props = {};
    if (pathname === '/pvc-cards/bulk') { file = 'PvcCardsPage'; name = 'PvcCardPage'; props.bulk = true; }
    else if (pathname.startsWith('/pvc-cards/')) { file = 'PvcCardsPage'; name = 'PvcCardPage'; pattern = '/pvc-cards/:id'; }
    else if (pathname.startsWith('/dua-posters/')) { file = 'DuaPostersPage'; name = 'DuaPosterDetailPage'; pattern = '/dua-posters/:id'; }
    else if (pathname.startsWith('/itra-perfumes/')) { file = 'ItraProductDetailPage'; pattern = '/itra-perfumes/:id'; }
    else if (pathname.startsWith('/product/')) { file = 'ProductDetailPage'; pattern = '/product/:id'; }
    else if (pathname.startsWith('/cards/')) { file = 'CardProductDetailPage'; pattern = '/cards/:id'; }
    else if (pathname.startsWith('/occasions/')) { file = 'OccasionLandingPage'; pattern = '/occasions/:occasionId'; }
    try {
      const component = (await server.ssrLoadModule(`/src/pages/${file}.jsx`))[name];
      const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(Routes, null, React.createElement(Route, { path: pattern, element: React.createElement(component, props) }))));
      report.pages.push(path);
      for (const [, raw] of html.matchAll(/\bsrc="([^"]+)"/g)) {
        const source = decode(raw);
        if (source.startsWith('/') && !existsSync(`public${decodeURIComponent(source.split('?')[0])}`)) report.missingAssets.push({ page: path, source });
      }
      for (const [, raw] of html.matchAll(/\bhref="([^"]+)"/g)) {
        const link = decode(raw);
        if (link.startsWith('/') && !link.startsWith('//') && !existsSync(`public${decodeURIComponent(link.split('?')[0])}`) && !routeInfo(new URL(link, 'https://local.test').pathname).known) report.invalidLinks.push({ page: path, link });
      }
    } catch (error) { report.renderErrors.push({ page: path, error: error.message }); }
  }
  writeFileSync('output/prelaunch-review/public-pages.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ pages: report.pages.length, missingAssets: report.missingAssets, invalidLinks: report.invalidLinks, renderErrors: report.renderErrors }, null, 2));
  if (report.missingAssets.length || report.invalidLinks.length || report.renderErrors.length) process.exitCode = 1;
} finally { await server.close(); }
