import { getWhatsAppUrl } from './businessConfig';

export const CUSTOM_FRAME_EXAMPLES = [
  {
    id: 'peacock-garden', title: 'A statement for your space.', label: 'LANDSCAPE WALL ART',
    description: 'Peacock garden artwork in a wide teal frame.',
    alt: 'Two peacocks among colourful flowers, presented in a wide teal and gold-tone frame',
    width: 1672, height: 941,
  },
  {
    id: 'ginkgo-teal-gold', title: 'Botanical, beautifully framed.', label: 'FLORAL ART PRINT',
    description: 'Ginkgo artwork with a teal and gold-tone frame.',
    alt: 'Colourful ginkgo leaves in a teal frame with a cream mount and gold-tone detailing',
    width: 1446, height: 1812,
  },
  {
    id: 'personal-portrait', title: 'A portrait. A personal touch.', label: 'PERSONALISED PORTRAIT',
    description: 'A portrait-style print with a silver-tone frame.',
    alt: 'Portrait of a woman in a yellow saree holding a flower basket, in a silver-tone frame',
    width: 1086, height: 1448,
  },
].map(example => ({ ...example, image: `/custom-frames/${example.id}.webp`, largeImage: `/custom-frames/${example.id}-large.webp` }));

export function getCustomFrameEnquiry(example) {
  return getWhatsAppUrl([
    'Hello AL-NOOR! I’d like a custom frame and print.',
    example ? `Design reference: ${example.description} (from your website’s custom-frame examples)` : 'Design reference: I will share my photo, artwork or an example.',
    'Required size (width × height): Please help me choose.',
    'Preferred frame colour / finish: To discuss.',
    'Quantity: To confirm.',
    'Please advise on design options, printing and a quote.',
  ].join('\n'));
}
