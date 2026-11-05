import { CARD_SIZES, CARD_TEMPLATES, QUANTITY_DISCOUNTS } from '../data/birthdayCards.js';

export function getCardPricing(sizeId, cardCount) {
  const size = CARD_SIZES.find(item => item.id === sizeId);
  const tier = QUANTITY_DISCOUNTS.find(item => item.qty === cardCount);
  if (!size || !tier) throw new Error('Choose a card size and quantity from the available options.');
  const baseTotal = size.unitPrice * cardCount;
  const savings = Math.round(baseTotal * tier.discountPercent / 100);
  return { baseTotal, savings, total: baseTotal - savings, percent: tier.discountPercent };
}

export function validateCard(config, photo) {
  if (!CARD_TEMPLATES.some(item => item.id === config.templateId)) return 'Choose a card design.';
  if (!config.recipientName.trim()) return 'Add the name of the person you’re celebrating.';
  if (!config.headline.trim()) return 'Add a greeting for the front of your card.';
  if (!config.message.trim()) return 'Write a message for the inside of your card.';
  if (!config.signoff.trim()) return 'Add your name or sign-off so they know who it’s from.';
  if (config.recipientName.length > 30 || config.headline.length > 48 || config.message.length > 400 || config.signoff.length > 64) return 'Please keep your text within the character limits.';
  if (config.message.split('\n').length > 10) return 'Use up to 10 lines for your inside message.';
  if (config.includePhoto && (!photo || photo.isSample)) return 'Upload your own photo, or choose “Without photo”, before adding your card to the bag.';
  return '';
}

/** A bag quantity counts identical sets. The selected card count is priced once per set. */
export function createBirthdayCardItem(config, photo, image, id = `birthday-card-${Date.now()}`) {
  const error = validateCard(config, photo);
  if (error) throw new Error(error);
  const template = CARD_TEMPLATES.find(item => item.id === config.templateId);
  const size = CARD_SIZES.find(item => item.id === config.sizeId);
  const pricing = getCardPricing(config.sizeId, config.cardCount);
  return {
    id, type: 'birthday_card', title: `${template.name} · Birthday card`, template: template.name,
    size: size.name, dimensions: size.dimensionsCm, cardCount: config.cardCount,
    quantity: 1, price: pricing.total, pricing, format: 'Folded card + envelope',
    paperStock: '350 GSM textured board', envelopeIncluded: true, image,
    configuration: { ...config, photo: config.includePhoto ? { url: photo.url, width: photo.width, height: photo.height, name: photo.name, originalId: photo.id } : null },
    personalisation: { recipientName: config.recipientName.trim(), frontHeadline: config.headline.trim(), insideMessage: config.message.trim(), senderName: config.signoff.trim() },
  };
}

export function birthdayOrderDetails(item) {
  const p = item.personalisation || {};
  const c = item.configuration || {};
  return [
    `Cards: ${item.cardCount} per set × ${item.quantity} set(s) = ${item.cardCount * item.quantity} cards`,
    `Design: ${item.template}`, `Front: ${p.frontHeadline || ''}`,
    `For: ${p.recipientName || ''}`, `Inside message: ${p.insideMessage || ''}`, `Sign-off: ${p.senderName || ''}`,
    ...(c.includePhoto ? [`Photo: ${c.photo?.name || 'Customer photo'}; ${c.photoFit}; crop ${c.panX}% / ${c.panY}%`, 'Original photo to be shared with the studio.'] : ['No photo']),
    `${item.paperStock}; an envelope for each card.`,
  ].join('\n');
}

export function getCardPhotoPlacement(box, photo, fit = 'cover', panX = 50, panY = 50) {
  const scale = (fit === 'contain' ? Math.min : Math.max)(box.width / photo.width, box.height / photo.height);
  const width = photo.width * scale, height = photo.height * scale;
  return { x: box.x + (box.width - width) * panX / 100, y: box.y + (box.height - height) * panY / 100, width, height };
}

/** Estimate glyph widths so long names, unbroken words and deliberate line breaks fit the artwork. */
export function wrapCardText(text, width, fontSize) {
  const measure = value => Array.from(value).reduce((n, char) => n + (/\s/.test(char) ? 0.27 : /[ilI.,'!:;]/.test(char) ? 0.3 : /[MW@\u0900-\u097f]/.test(char) ? 0.85 : char.charCodeAt(0) > 255 ? 1 : 0.57), 0) * fontSize;
  const lines = [];
  for (const paragraph of String(text).split('\n')) {
    if (!paragraph.trim()) { lines.push(''); continue; }
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      if (line && measure(`${line} ${word}`) > width) { lines.push(line); line = ''; }
      if (measure(word) > width) {
        for (const letter of Array.from(word)) {
          if (measure(line + letter) > width && line) { lines.push(line); line = ''; }
          line += letter;
        }
      } else line += `${line ? ' ' : ''}${word}`;
    }
    if (line) lines.push(line);
  }
  return lines;
}
