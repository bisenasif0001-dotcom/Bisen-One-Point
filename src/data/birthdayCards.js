export const CARD_CATEGORIES = ['All', 'Minimal', 'Elegant', 'Floral', 'Photo Card', 'Kids', 'Islamic', 'Fun'];

export const CARD_TEMPLATES = [
  { id: 'minimal_editorial', category: 'Minimal', name: 'The Birthday Edit', description: 'Quiet type. A little warmth.', bg: '#f8f1e5', ink: '#304d3f', accent: '#b56e50', sampleGreeting: 'Happy Birthday', sampleSub: 'Here’s to all the beautiful things ahead.', hasPhoto: true },
  { id: 'elegant_gold', category: 'Elegant', name: 'Midnight Wishes', description: 'Champagne tones, beautifully understated.', bg: '#243f36', ink: '#f5e9d2', accent: '#c5a66e', sampleGreeting: 'Another Year of Grace', sampleSub: 'A new chapter. A thousand possibilities.', hasPhoto: true },
  { id: 'floral_botanical', category: 'Floral', name: 'Botanical Bloom', description: 'For someone who makes life bloom.', bg: '#f0eee3', ink: '#365342', accent: '#b87960', sampleGreeting: 'Bloom & Flourish', sampleSub: 'The world is lovelier with you in it.', hasPhoto: true },
  { id: 'photo_fullbleed', category: 'Photo Card', name: 'A Moment, Forever', description: 'Your favourite photograph takes the cover.', bg: '#2d423a', ink: '#ffffff', accent: '#edd7b6', sampleGreeting: 'Best Year Yet', sampleSub: 'More memories. More adventures. More you.', hasPhoto: true, photoFirst: true },
  { id: 'kids_playful', category: 'Kids', name: 'Little Dreamer', description: 'Big wishes for a little star.', bg: '#fff1d5', ink: '#384f64', accent: '#c16a51', sampleGreeting: 'Hip Hip Hooray!', sampleSub: 'A whole year brighter. A whole lot more magic.', hasPhoto: true },
  { id: 'islamic_barakah', category: 'Islamic', name: 'Barakah & Dua', description: 'A thoughtful wish, filled with blessings.', bg: '#ede9dc', ink: '#304d40', accent: '#9b7843', sampleGreeting: 'A Year of Barakah', sampleSub: 'May your days be filled with peace and goodness.', hasPhoto: true },
  { id: 'fun_celebration', category: 'Fun', name: 'Confetti Club', description: 'A joyful little celebration on paper.', bg: '#e8c5b5', ink: '#354f42', accent: '#a45f45', sampleGreeting: 'Cheers To You!', sampleSub: 'Make a wish. Make it a good one.', hasPhoto: false },
];

export const CARD_SIZES = [
  { id: 'A6', name: 'A6', label: 'The little note', dimensionsCm: '10.5 × 14.8 cm', width: 105, height: 148, unitPrice: 149 },
  { id: '5x7', name: '5 × 7 in', label: 'The classic keepsake', dimensionsCm: '12.7 × 17.8 cm', width: 127, height: 178, unitPrice: 199 },
  { id: 'A5', name: 'A5', label: 'Room for more love', dimensionsCm: '14.8 × 21.0 cm', width: 148, height: 210, unitPrice: 269 },
];

export const QUANTITY_DISCOUNTS = [
  { qty: 1, discountPercent: 0 }, { qty: 5, discountPercent: 15 },
  { qty: 10, discountPercent: 25 }, { qty: 25, discountPercent: 35 }, { qty: 50, discountPercent: 45 },
];

export const MESSAGE_IDEAS = [
  { label: 'Warm & simple', text: 'Wishing you a year of little joys, big dreams and all the love you give so freely. Have the most wonderful birthday.' },
  { label: 'For family', text: 'Life is warmer, brighter and so much better with you in it. Thank you for being our favourite person to celebrate. Happy birthday, with all our love.' },
  { label: 'A little dua', text: 'May Allah bless you with good health, peace of heart and abundant barakah. Wishing you a beautiful birthday and a year filled with goodness.' },
  { label: 'Little star', text: 'Keep dreaming big, laughing loud and filling the world with your magic. Sending you the biggest birthday hug, little star!' },
];

export const CARD_DEMO_PHOTO = { url: '/hero/wedding-bride.jpg', width: 434, height: 724, name: 'Studio sample portrait' };
