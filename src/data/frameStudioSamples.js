import { SAMPLE_CUSTOM_PHOTOS } from './products';

// Keep framing demos separate from the samples used by other print products.
export const FRAME_STUDIO_SAMPLES = [
  { ...SAMPLE_CUSTOM_PHOTOS[0], name: 'Mountain valley', orientation: 'landscape', width: 900, height: 601 },
  { ...SAMPLE_CUSTOM_PHOTOS[1], name: 'Family at sunset', orientation: 'landscape', width: 900, height: 600 },
  {
    id: 'sample-bride-portrait',
    name: 'Bridal portrait',
    url: '/hero/wedding-bride.jpg',
    orientation: 'portrait',
    width: 434,
    height: 724,
  },
  {
    id: 'sample-groom-portrait',
    name: 'Groom portrait',
    url: '/hero/wedding-groom.jpg',
    orientation: 'portrait',
    width: 434,
    height: 724,
  },
];
