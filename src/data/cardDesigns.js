export const PREMIUM_CARD_DESIGN = 2;

const palettes = {
  ivory: { name: 'Ivory & olive', paper: '#f6eedb', depth: '#e4d5b9', ink: '#283f31', accent: '#926e38', soft: '#759077' },
  forest: { name: 'Forest & champagne', paper: '#254437', depth: '#10291f', ink: '#fff0d5', accent: '#e1bc79', soft: '#90a791' },
  rose: { name: 'Dusty rose', paper: '#f3dbd4', depth: '#dbada6', ink: '#572d39', accent: '#9a5c53', soft: '#887653' },
  midnight: { name: 'Midnight & gold', paper: '#253953', depth: '#111b2d', ink: '#f9ebce', accent: '#e4bd79', soft: '#839db4' },
  lilac: { name: 'Lilac & honey', paper: '#f0e7f1', depth: '#cfc5e4', ink: '#443554', accent: '#8a5c45', soft: '#8b728f' },
  plum: { name: 'Mulberry & gold', paper: '#533146', depth: '#371b30', ink: '#fff0d9', accent: '#efc28d', soft: '#db9298' },
  stone: { name: 'Warm stone', paper: '#f0ece1', depth: '#d8d1c1', ink: '#373e38', accent: '#6f6c58', soft: '#859081' },
};

const combinations = {
  minimal_editorial: ['ivory', 'stone', 'forest'],
  elegant_gold: ['forest', 'plum', 'midnight'],
  floral_botanical: ['rose', 'ivory', 'plum'],
  photo_fullbleed: ['midnight', 'forest', 'plum'],
  kids_playful: ['lilac', 'rose', 'ivory'],
  islamic_barakah: ['midnight', 'forest', 'ivory'],
  fun_celebration: ['plum', 'rose', 'midnight'],
  wedding_vows: ['ivory', 'rose', 'forest'],
  milestone_ribbon: ['midnight', 'forest', 'ivory'],
  quiet_remembrance: ['stone', 'ivory', 'forest'],
};

export function getCardPalettes(templateId) {
  const ids = Object.hasOwn(combinations, templateId) ? combinations[templateId] : combinations.minimal_editorial;
  return ids.map(id => ({ id, ...palettes[id] }));
}

export function getCardPalette(templateId, paletteId) {
  const options = getCardPalettes(templateId);
  return options.find(option => option.id === paletteId) || options[0];
}
