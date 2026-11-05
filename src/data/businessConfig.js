/**
 * AL-NOOR STUDIO - Central Business Configuration
 * Single Source of Truth for contact details, operational hours, workshop address, and social links.
 * 
 * NOTE FOR PRODUCTION DEPLOYMENT:
 * Unresolved/configurable merchant values are clearly flagged with [CONFIGURABLE_PENDING_MERCHANT_INPUT]
 * and fall back to standardized studio defaults.
 */

const STUDIO_ADDRESS = 'Shop No. 31-32, Milan Tower, Kursi Road, Near 4 No Chauraha, Alkapuri Colony, Lucknow - 226022';

export const BUSINESS_CONFIG = {
  brand: {
    name: 'AL-NOOR STUDIO',
    legalName: 'AL-NOOR Print & Frame Studio',
    tagline: 'Preserving Sacred Memories & Artisanal Fragrances',
    slogan: 'PRINT • FRAME • GIFT',
    description: 'Personalised photo printing, handcrafted custom framing, bespoke milestone cards, sacred calligraphy wall art, and curated artisanal fragrance gifts.'
  },

  contact: {
    // Primary WhatsApp contact (Used for direct orders, custom quotes & live concierge)
    whatsapp: '919643970064',
    whatsappFormatted: '+91 96439 70064',
    
    // Primary Voice Support
    phone: '+91 96439 70064',
    
    // Official Email Inquiries
    email: 'avarto@outlook.com',
    inquiriesEmail: 'avarto@outlook.com',
    
    // Operating Hours
    hours: {
      weekdays: 'Monday – Saturday: 10:00 AM – 8:00 PM IST',
      sunday: 'Sunday: 11:00 AM – 6:00 PM IST',
      onlineStudio: 'Online Orders & Custom Studio: Open 24/7'
    }
  },

  location: {
    workshopAddress: STUDIO_ADDRESS,
    pincode: '226022',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STUDIO_ADDRESS)}`
  },

  social: {
    instagram: '', // [CONFIGURABLE_PENDING_MERCHANT_INPUT: Add verified Instagram handle]
    instagramHandle: '',
    facebook: '', // [CONFIGURABLE_PENDING_MERCHANT_INPUT: Add Facebook page URL]
    pinterest: '' // [CONFIGURABLE_PENDING_MERCHANT_INPUT: Add Pinterest board URL]
  },

  supportPolicies: {
    transitGuarantee: 'Contact the studio with your order reference and photographs for help with transit damage.',
    dispatchTime: 'Dispatch timing is confirmed by the studio.',
    deliveryTime: 'Delivery availability and timing are confirmed for your address.',
    freeShippingThreshold: 999 // Free shipping on orders over ₹999
  }
};

/**
 * Helper to generate WhatsApp click-to-chat URL with pre-filled message
 * @param {string} message - Text message to prefill in chat
 * @returns {string} WhatsApp direct URL
 */
export const getWhatsAppUrl = (message = '') => {
  const base = `https://wa.me/${BUSINESS_CONFIG.contact.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
};

export default BUSINESS_CONFIG;
