import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Heart, 
  Gift, 
  Image as ImageIcon, 
  Mail, 
  Printer, 
  Compass, 
  ShieldCheck, 
  Truck,
  ArrowUpRight
} from 'lucide-react';
import { FRAME_FINISHES } from '../data/products';
import { getStudioPrice } from '../utils/frameStudio';
import { usePriceOverrides } from '../components/BusinessRulesProvider';
import {
  getDuaPosterPrice,
  getMinCardPrice,
  getMinItraPrice,
  getMinPrintPrice,
  getItraProductPrice,
} from '../utils/priceRegistry';

function buildOccasionsMap(overrides) {
  const defaultFrame = FRAME_FINISHES[0].id;
  const a5WithPrint = getStudioPrice({ sizeId: 'A5', frameId: defaultFrame, includePrint: true, overrides })?.unit ?? 359;
  const a4WithPrint = getStudioPrice({ sizeId: 'A4', frameId: defaultFrame, includePrint: true, overrides })?.unit ?? 429;
  const a3WithPrint = getStudioPrice({ sizeId: 'A3', frameId: defaultFrame, includePrint: true, overrides })?.unit ?? 579;
  const a5Empty = getStudioPrice({ sizeId: 'A5', frameId: defaultFrame, includePrint: false, overrides })?.unit ?? 279;
  const duaA5 = getDuaPosterPrice('A5', overrides) ?? 49;
  const duaA4 = getDuaPosterPrice('A4', overrides) ?? 79;
  const a4Empty = getStudioPrice({ sizeId: 'A4', frameId: defaultFrame, includePrint: false, overrides })?.unit ?? 329;
  const minCard = getMinCardPrice(overrides) || 149;
  const minPrint = getMinPrintPrice(overrides) || 25;
  const minItra3 = getMinItraPrice(overrides, { volume: '3ml' }) || 329;
  const minItra6 = getMinItraPrice(overrides, { volume: '6ml' }) || 599;
  const oud6 = getItraProductPrice('oud-royale', '6ml', overrides) ?? 899;
  const taif6 = getItraProductPrice('taif-rose', '6ml', overrides) ?? 799;
  const musk6 = getItraProductPrice('kasturi-black-musk', '6ml', overrides) ?? 699;
  const kiswah6 = getItraProductPrice('makkah-kiswah', '6ml', overrides) ?? 999;

  const bundlePrices = (regular) => ({
    regularPrice: regular,
    price: Math.round(regular * 0.85),
  });

  const bdayReg = a4WithPrint + minCard + minPrint * 10 + musk6;
  const weddingReg = a3WithPrint + minCard + minPrint * 20 + oud6;
  const annivReg = a3WithPrint + minCard + minPrint * 15 + taif6;
  const babyReg = a4WithPrint + minCard + minPrint * 20 + minItra6;
  const parentsReg = a3WithPrint + minCard + minPrint * 15 + oud6;
  const eidReg = (duaA4 + a4Empty) + (minCard * 5) + minPrint * 10 + kiswah6;

  return {
  birthday: {
    id: 'birthday',
    navLabel: 'Birthday',
    heroHeading: 'MAKE THEIR BIRTHDAY PERSONAL.',
    heroSubheading: 'Celebrate another year of life and joy with custom handcrafted framing, personalised greeting cards, photo prints, and artisanal fragrance.',
    heroImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=80',
    tag: 'Curated Birthday Collection',
    groups: [
      {
        id: 'frame-photo',
        num: '01',
        title: 'Frame A Favourite Photo',
        category: 'CUSTOM FRAMING',
        subtitle: 'Turn a snapshot into a timeless wall-hung memory in under 2 minutes.',
        description: 'Choose from 7 handcrafted solid wood finishes. Printed with Professional 6-Colour Epson Photo Printing on premium lustre paper.',
        price: `From ₹${a5WithPrint} (A5) · ₹${a4WithPrint} (A4)`,
        features: ['Solid pinewood moulding', 'Optional archival matboard', 'Shatter-resistant acrylic glazing', 'Ready to hang right out of the box'],
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Frame Their Photo',
        ctaLink: '/custom-framing?occasion=birthday'
      },
      {
        id: 'create-card',
        num: '02',
        title: 'Create A Birthday Card',
        category: 'CARDS & GIFTS',
        subtitle: 'Personalised greeting card with their name, your photo, and your heartfelt letter.',
        description: 'Printed on heavy 350 GSM tactile textured cardstock. Customise both the front cover and inside letter with our easy live card designer.',
        price: `From ₹${minCard}`,
        features: ['350 GSM heavyweight textured cardstock', 'Dual-sided cover & message customization', 'Premium textured envelope included', 'Bulk savings up to 45%'],
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Design Birthday Card',
        ctaLink: '/birthday-cards'
      },
      {
        id: 'print-memories',
        num: '03',
        title: 'Print Shared Memories',
        category: 'PHOTO LAB PRINTS',
        subtitle: 'Pack of true lustre or matte studio prints to slip inside the card or gift box.',
        description: 'Professional 6-Colour Epson Photo Printing from your phone photos. Crisp skin tones and vibrant colors printed on 260 GSM photo stock.',
        price: `From ₹${minPrint} / print (10 for ₹${minPrint * 10})`,
        features: ['260 GSM premium photo paper', 'Fade-resistant lab finish', 'Lustre, Gloss, or Matte finishes', 'Sizes from 4×6" to A3'],
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Print Shared Memories',
        ctaLink: '/photo-prints'
      },
      {
        id: 'fragrance-gift',
        num: '04',
        title: 'Add A Fragrance Gift',
        category: 'THE ITRA HOUSE',
        subtitle: 'Pure, concentrated alcohol-free attar presented in a hand-cut crystal bottle.',
        description: 'Distilled using centuries-old methods in Kannauj. 100% pure perfume oil that warms on skin and lasts all day.',
        price: `From ₹${minItra3} (3ml) · ₹${minItra6} (6ml)`,
        features: ['100% pure alcohol-free attar', 'Hand-cut crystal applicator flacon', 'Signature Royal Amber & Taif Rose notes', 'Velvet gift pouch included'],
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Explore Itra Gift',
        ctaLink: '/itra'
      }
    ],
    bundle: {
      id: 'bundle-birthday',
      title: 'THE BIRTHDAY MEMORY BOX',
      badge: 'All-In-One Coordinated Gift',
      tagline: 'Everything they need for an unforgettable celebration in one elegant presentation.',
      ...bundlePrices(bdayReg),
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      items: [
        'Personalised A4 Solid Wood Frame with your photo',
        'Personalised Birthday Card with custom letter & envelope',
        'Set of 10 Studio Photo Prints (4×6")',
        '6ml Kasturi Black Musk Pure Attar in crystal bottle',
        'Complimentary Luxury Gift Box with satin ribbon'
      ]
    }
  },

  wedding: {
    id: 'wedding',
    navLabel: 'Wedding',
    heroHeading: 'CELEBRATE THEIR SACRED BEGINNING.',
    heroSubheading: 'Heirloom wall framing, curated gallery walls, letterpress wedding cards, and royal bridal attars crafted for a lifetime of devotion.',
    heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    tag: 'Curated Wedding Collection',
    groups: [
      {
        id: 'frame-photo',
        num: '01',
        title: 'Frame A Favourite Photo',
        category: 'CUSTOM FRAMING',
        subtitle: 'Immortalise the ceremony vows in an elegant statement frame.',
        description: 'Deep bevel-cut matting and solid Walnut-finish or Champagne mouldings ensure wedding day portraits look regal and pristine for generations.',
        price: `From ₹${a4WithPrint} (A4) · ₹${a3WithPrint} (A3)`,
        features: ['Optional studio bevel-cut matboard', 'Walnut or Champagne moulding', 'Professional 6-Colour Epson Photo Printing', 'Shatter-resistant optical acrylic glazing'],
        image: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Frame Wedding Portrait',
        ctaLink: '/custom-framing?occasion=wedding'
      },
      {
        id: 'create-card',
        num: '02',
        title: 'Create A Wedding Card',
        category: 'CARDS & GIFTS',
        subtitle: 'Personalised keepsake card for the newly wedded couple.',
        description: 'Folded card on 350 GSM textured cardstock with custom greeting accents. Customise your blessing message and include wedding details.',
        price: `From ₹${minCard}`,
        features: ['Personalised couple cover details', 'Matching envelope included', 'Thick 350 GSM textured cardstock', 'Custom Dua or blessing inside'],
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Design Wedding Card',
        ctaLink: '/cards?occasion=wedding'
      },
      {
        id: 'print-memories',
        num: '03',
        title: 'Print Shared Memories',
        category: 'PHOTO LAB PRINTS',
        subtitle: 'Lab-grade print sets of all ceremony, reception, and family rituals.',
        description: 'True continuous-tone photographic lab printing capturing vivid sarees, sherwanis, and emotional wedding moments without pixelation.',
        price: `From ₹${minPrint} / print`,
        features: ['Professional 6-colour Epson printing', 'Vivid ceremonial colour reproduction', 'Lustre finish resists fingerprints', 'Safe keepsake storage'],
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Print Wedding Moments',
        ctaLink: '/photo-prints'
      },
      {
        id: 'fragrance-gift',
        num: '04',
        title: 'Add A Fragrance Gift',
        category: 'THE ITRA HOUSE',
        subtitle: 'Oud Royale and aged Dehn Al Oud in royal bridal presentation.',
        description: 'Exquisite bridal attars featuring aged agarwood, Kashmiri saffron, and Taif rose for prayer and special occasions.',
        price: `From ₹${minItra3} (3ml) · ₹${oud6} (6ml)`,
        features: ['Aged Cambodian Dehn Al Oud', 'Taif Rose & Saffron infusion', 'Long-lasting sacred sillage', 'Handcrafted velvet pouch'],
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Explore Bridal Itra',
        ctaLink: '/itra'
      }
    ],
    bundle: {
      id: 'bundle-wedding',
      title: 'THE GRAND WEDDING HEIRLOOM SET',
      badge: 'Luxury Bridal Set',
      tagline: 'A coordinated heirloom suite commemorating sacred vows with timeless dignity.',
      ...bundlePrices(weddingReg),
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      items: [
        'Statement Wedding Frame (A3) with Photo Print',
        'Personalised Wedding Blessing Card & Envelope',
        'Set of 20 High-Res Ceremony Photo Lab Prints',
        'Oud Royale Al-Maliki (6ml) Pure Attar',
        'Rigid Ivory Presentation Box with personalised inscription'
      ]
    }
  },

  anniversary: {
    id: 'anniversary',
    navLabel: 'Anniversary',
    heroHeading: 'HONOUR EVERY YEAR TOGETHER.',
    heroSubheading: 'Celebrate enduring love and shared milestones with custom couple frames, anniversary cards, duo prints, and pairing perfumes.',
    heroImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=80',
    tag: 'Curated Anniversary Collection',
    groups: [
      {
        id: 'frame-photo',
        num: '01',
        title: 'Frame A Favourite Photo',
        category: 'CUSTOM FRAMING',
        subtitle: 'Classic solid wood frames for milestone couple portraits.',
        description: 'Honor every year of shared devotion. Choose classic black, warm walnut, or champagne gold with optional matboard spacing.',
        price: `From ₹${a4WithPrint} (A4) · ₹${a3WithPrint} (A3)`,
        features: ['Handcrafted solid wood finish', 'Fine art portrait printing', 'Acid-free preservation acrylic', 'Pre-installed hanging hardware'],
        image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Frame Couple Photo',
        ctaLink: '/custom-framing?occasion=anniversary'
      },
      {
        id: 'create-card',
        num: '02',
        title: 'Create An Anniversary Card',
        category: 'CARDS & GIFTS',
        subtitle: 'Feature your favourite photo alongside your personal love letter.',
        description: 'Two-sided folded keepsake card. Insert your photo and write a personal letter they will keep forever.',
        price: `From ₹${minCard}`,
        features: ['Personalised cover photo layout', 'Custom milestone details', 'Textured 350 GSM cardstock', 'Included matching envelope'],
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Design Anniversary Card',
        ctaLink: '/cards?occasion=anniversary'
      },
      {
        id: 'print-memories',
        num: '03',
        title: 'Print Shared Memories',
        category: 'PHOTO LAB PRINTS',
        subtitle: 'Print annual vacations and quiet moments of joy together.',
        description: 'Set of high-contrast, fade-resistant prints made for family photo albums or framed collages.',
        price: `From ₹${minPrint} / print`,
        features: ['Premium lustre finish', 'Accurate natural skin tones', 'Professional 6-Colour Epson Photo Printing', 'Quick mobile upload flow'],
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Print Shared Memories',
        ctaLink: '/photo-prints'
      },
      {
        id: 'fragrance-gift',
        num: '04',
        title: 'Add A Fragrance Gift',
        category: 'THE ITRA HOUSE',
        subtitle: 'Ward Taifi & Pure Musk artisanal attars in crystal bottles.',
        description: 'A harmonious pairing of White Musk and Taif Rose created for unforgettable anniversary evenings.',
        price: `From ₹${minItra3} (3ml) · ₹${taif6} (6ml)`,
        features: ['Pure concentrated floral & musk attar', '100% alcohol-free oil', 'Hand-cut crystal bottles', 'Presented in velvet pouch'],
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Explore Couple Fragrance',
        ctaLink: '/itra'
      }
    ],
    bundle: {
      id: 'bundle-anniversary',
      title: 'THE ANNIVERSARY KEEPSAKE SET',
      badge: 'Couples Choice',
      tagline: 'Frame, card, prints, and fragrance celebrating your enduring partnership.',
      ...bundlePrices(annivReg),
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
      items: [
        'Personalised Couple Frame (A3) with Photo Print',
        'Personalised Milestone Anniversary Card',
        'Set of 15 Studio Photo Prints of your travels',
        'Ward Taifi Rose & Amber Pure Itra (6ml)',
        'Deluxe Rigid Presentation Gift Box'
      ]
    }
  },

  'new-baby': {
    id: 'new-baby',
    navLabel: 'New Baby',
    heroHeading: 'WELCOME THEIR LITTLE ONE WITH WONDER.',
    heroSubheading: 'Child-safe nursery frames, monthly milestone prints, keepsake birth announcement cards, and gentle botanical essences.',
    heroImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1600&q=80',
    tag: 'Curated New Baby Collection',
    groups: [
      {
        id: 'frame-photo',
        num: '01',
        title: 'Frame A Favourite Photo',
        category: 'CUSTOM FRAMING',
        subtitle: 'Natural wood & crisp contemporary frames with shatterproof acrylic.',
        description: 'Designed safely with shatterproof cast acrylic and solid pinewood moulding to cherish newborn portraits.',
        price: `From ₹${a5WithPrint} (A5) · ₹${a4WithPrint} (A4)`,
        features: ['Shatter-resistant safety acrylic', 'Solid wood sustainable moulding', 'Portrait or landscape ready', 'Captures fine baby details'],
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Frame Baby Photo',
        ctaLink: '/custom-framing?occasion=baby'
      },
      {
        id: 'create-card',
        num: '02',
        title: 'Create A Baby Card',
        category: 'CARDS & GIFTS',
        subtitle: 'Record birth stats: date, time, weight, and heartfelt welcome prayers.',
        description: 'Cherish the arrival of the newborn with a customised keepsake announcement card parents will hold onto forever.',
        price: `From ₹${minCard}`,
        features: ['Birth stats customization', 'Soft minimal designs', '350 GSM heavyweight card', 'Matching envelope included'],
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Design Baby Card',
        ctaLink: '/cards?occasion=baby'
      },
      {
        id: 'print-memories',
        num: '03',
        title: 'Print Shared Memories',
        category: 'PHOTO LAB PRINTS',
        subtitle: 'Pack of milestone prints documenting every first smile.',
        description: 'Don’t let thousands of baby phone photos stay trapped on your screen. Print high-res lustre memory cards month by month.',
        price: `From ₹${minPrint} / print (20 for ₹${minPrint * 20})`,
        features: ['High-detail 4×6" prints', 'Month-by-month keepsake format', 'Fingerprint-proof lustre paper', 'Fast mobile batch upload'],
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Order Milestone Prints',
        ctaLink: '/photo-prints'
      },
      {
        id: 'fragrance-gift',
        num: '04',
        title: 'Add A Fragrance Gift',
        category: 'THE ITRA HOUSE',
        subtitle: 'Mild, soothing alcohol-free floral essence for parents.',
        description: 'Gentle pure floral & citrus attar essence bringing serene freshness to family living spaces.',
        price: `From ₹${minItra3} (3ml) · ₹${minItra6} (6ml)`,
        features: ['Zero alcohol or harsh chemicals', 'Delicate natural floral notes', 'Calming subtle aroma', 'Crystal applicator bottle'],
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Explore Gentle Attar',
        ctaLink: '/itra'
      }
    ],
    bundle: {
      id: 'bundle-baby',
      title: 'THE NEWBORN MILESTONE HAMPER',
      badge: 'Nursery Favourite',
      tagline: 'A gentle, child-safe bundle documenting first milestones and warm welcomes.',
      ...bundlePrices(babyReg),
      image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
      items: [
        'Child-Safe Nursery Keepsake Frame (A4)',
        'Welcome Little One Birth Stats Card',
        'Pack of 20 Baby Milestone Photo Prints',
        'Gentle Floral & Vetiver Natural Attar (6ml)',
        'Soft Linen Keepsake Storage Box'
      ]
    }
  },

  parents: {
    id: 'parents',
    navLabel: 'For Parents',
    heroHeading: 'HONOUR THE ONES WHO GAVE YOU EVERYTHING.',
    heroSubheading: 'Timeless family portraits, gratitude tribute cards, ancestry wall displays, and therapeutic aged dehn al oud for parents and grandparents.',
    heroImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80',
    tag: 'Curated Tribute For Parents',
    groups: [
      {
        id: 'frame-photo',
        num: '01',
        title: 'Frame A Favourite Photo',
        category: 'CUSTOM FRAMING',
        subtitle: 'Large statement family portrait frame honoring generations of love.',
        description: 'Give them the pride of seeing their children and grandchildren framed on the living room wall with studio-grade craftsmanship.',
        price: `From ₹${a4WithPrint} (A4) · ₹${a3WithPrint} (A3)`,
        features: ['Substantial solid wood mouldings', 'Optional generous mat border', 'Rich 6-colour photo print contrast', 'Durable backing & hangers'],
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Frame Family Portrait',
        ctaLink: '/custom-framing?occasion=parents'
      },
      {
        id: 'create-card',
        num: '02',
        title: 'Create A Gratitude Card',
        category: 'CARDS & GIFTS',
        subtitle: 'A heartfelt letter of appreciation printed on luxury 350 GSM textured stock.',
        description: 'Say the words we often forget to say. Write a long, heartfelt note thanking your mother and father for their unconditional sacrifices.',
        price: `From ₹${minCard}`,
        features: ['Extra writing room for long letters', 'Durable 350 GSM textured cardstock', 'Custom family photo on cover', 'Matching textured envelope'],
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Write Gratitude Card',
        ctaLink: '/cards?occasion=parents'
      },
      {
        id: 'print-memories',
        num: '03',
        title: 'Print Shared Memories',
        category: 'PHOTO LAB PRINTS',
        subtitle: 'Restored vintage family photos and recent gathering moments.',
        description: 'Bring old black-and-white family photographs and new smartphone pictures to physical life on heavy lab paper.',
        price: `From ₹${minPrint} / print`,
        features: ['Enhanced tonal contrast', 'Fade-resistant vibrant finish', 'Multiple size combinations', 'Easy mobile batch upload'],
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Print Family Photos',
        ctaLink: '/photo-prints'
      },
      {
        id: 'fragrance-gift',
        num: '04',
        title: 'Add A Fragrance Gift',
        category: 'THE ITRA HOUSE',
        subtitle: 'Aged Cambodian Dehn Al Oud & therapeutic traditional blends.',
        description: 'Traditional earthy, warming attars revered by elders for decades. 100% pure, natural, and long-lasting.',
        price: `From ₹${minItra3} (3ml) · ₹${oud6} (6ml)`,
        features: ['Aged Agarwood Oud', 'Traditional warming scent profile', 'Therapeutic grounding blend', 'Artisanal crystal applicator'],
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Explore Pure Oud',
        ctaLink: '/itra'
      }
    ],
    bundle: {
      id: 'bundle-parents',
      title: 'THE PARENTS TRIBUTE HERITAGE SET',
      badge: 'Family Heirloom',
      tagline: 'Honor mother and father with a framed portrait, tribute letter, prints, and aged oud.',
      ...bundlePrices(parentsReg),
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      items: [
        'Generations Family Statement Frame (A3)',
        'Heartfelt Letter of Gratitude Card with personal photos',
        'Set of 15 High-Definition Family Reunion Prints',
        'Pure Aged Oud Royale Al-Maliki (6ml)',
        'Heirloom Presentation Gift Packaging'
      ]
    }
  },

  eid: {
    id: 'eid',
    navLabel: 'Eid & Islamic Gifts',
    heroHeading: 'SHARE THE BLESSINGS OF EID & SACRED ART.',
    heroSubheading: 'Sacred Quranic ayat & Dua wall frames, personalised Eid greeting cards, family prayer gathering prints, and holy Kaaba Kiswah attar.',
    heroImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1600&q=80',
    tag: 'Curated Eid & Barakah Collection',
    groups: [
      {
        id: 'frame-photo',
        num: '01',
        title: 'Sacred Dua & Verse Frames',
        category: 'CUSTOM FRAMING / SACRED ART',
        subtitle: 'Ayatul Kursi, 4 Quls, 99 Names of Allah, or Dua posters framed to order.',
        description: 'Handcrafted solid wood frames paired with 250 GSM glossy sacred calligraphy prints bringing daily barakah to living spaces.',
        price: `Print from ₹${duaA5} · Framed from ₹${duaA5 + a5Empty}`,
        features: ['250 GSM archival glossy prints', 'Handcrafted wooden catalogue frames', 'Shatter-resistant optical acrylic glazing', 'Print only or Framed options'],
        image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Explore Sacred Frames',
        ctaLink: '/islamic-art'
      },
      {
        id: 'create-card',
        num: '02',
        title: 'Create An Eid Card',
        category: 'CARDS & GIFTS',
        subtitle: 'Personalised Eid Mubarak cards with warm Duas and custom names.',
        description: 'Send sincere Eid greetings to loved ones near and far with bespoke Islamic typography and warm prayers.',
        price: `From ₹${minCard}`,
        features: ['Islamic Barakah & Dua design templates', 'Warm Dua & greeting printed inside', 'Textured 350 GSM card + envelope', 'Bulk discounts up to 45%'],
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Customise Eid Cards',
        ctaLink: '/cards?occasion=eid'
      },
      {
        id: 'print-memories',
        num: '03',
        title: 'Print Shared Memories',
        category: 'PHOTO LAB PRINTS',
        subtitle: 'True-to-life prints of Eid feasts, prayer morning, and family reunions.',
        description: 'Capture the radiant colors of festive clothes, family feasts, and warm hugs on 6-colour photo lab paper.',
        price: `From ₹${minPrint} / print`,
        features: ['True-to-life 6-colour photo lab tech', 'Vibrant festive colour rendering', 'Fingerprint-proof lustre finish', 'Ready to slip inside Eid cards'],
        image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Print Eid Photos',
        ctaLink: '/photo-prints'
      },
      {
        id: 'fragrance-gift',
        num: '04',
        title: 'Add A Fragrance Gift',
        category: 'THE ITRA HOUSE',
        subtitle: 'Holy Makkah Kiswah musk, amber, and Taif rose perfume oils.',
        description: 'Sacred, 100% non-alcoholic formulations crafted for Salah, Jummah, Eid visits, and daily sunnah.',
        price: `From ₹${minItra3} (3ml) · ₹${kiswah6} (6ml)`,
        features: ['Sacred Kiswah musk & Taif rose', '100% alcohol-free & prayer safe', 'Rich long-lasting fragrance trail', 'Presented in velvet pouch'],
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
        ctaText: 'Explore Sacred Itra',
        ctaLink: '/itra'
      }
    ],
    bundle: {
      id: 'bundle-eid',
      title: 'THE EID MUBARAK BARAKAH BOX',
      badge: 'Festive Favourite',
      tagline: 'Calligraphy wall art, luxury greeting cards, family prints, and holy Kiswah musk.',
      ...bundlePrices(eidReg),
      image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
      items: [
        'Ayat-ul-Kursi Calligraphy Frame (A4)',
        'Set of 5 Personalised Eid Mubarak Greeting Cards',
        'Set of 10 Feast & Prayer Photo Prints',
        'Makkah Kiswah Sacred Blend Pure Attar (6ml)',
        'Embossed Emerald & Gold Luxury Gift Box'
      ]
    }
  }
  };
}

export const OCCASIONS_MAP = buildOccasionsMap();

export default function OccasionLandingPage({ onAddToCart }) {
  const { occasionId } = useParams();
  const navigate = useNavigate();
  const priceOverrides = usePriceOverrides();
  const occasionsMap = useMemo(() => buildOccasionsMap(priceOverrides), [priceOverrides]);

  // Normalize occasion key
  const activeKey = (occasionId || 'birthday').toLowerCase();
  const currentOccasion = occasionsMap[activeKey] || occasionsMap.birthday;

  const [bundleAdded, setBundleAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setBundleAdded(false);
  }, [activeKey]);

  const handleOccasionTab = (key) => {
    navigate(`/occasions/${key}`);
  };

  const handleAddBundle = () => {
    if (!onAddToCart) return;
    const bundleItem = {
      id: `${currentOccasion.bundle.id}-${Date.now()}`,
      type: 'gift_bundle',
      title: currentOccasion.bundle.title,
      subTitle: currentOccasion.bundle.tagline,
      format: 'All-In-One Curated Gift Box',
      price: currentOccasion.bundle.price,
      quantity: 1,
      image: currentOccasion.bundle.image,
      bundleItems: currentOccasion.bundle.items
    };
    onAddToCart(bundleItem);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  };

  return (
    <div style={{ backgroundColor: '#F5F3EE', minHeight: '100vh', color: '#181817' }}>

      {/* Occasion Nav / Pill Switcher */}
      <div 
        style={{
          position: 'sticky',
          top: '72px',
          zIndex: 40,
          backgroundColor: 'rgba(245, 243, 238, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #DDD9D0',
          padding: '0.75rem 0'
        }}
      >
        <div className="container-custom">
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '2px'
            }}
          >
            <span 
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                fontWeight: 700,
                color: '#706E68',
                marginRight: '0.5rem',
                whiteSpace: 'nowrap'
              }}
            >
              Select Occasion:
            </span>

            {Object.keys(OCCASIONS_MAP).map((key) => {
              const occ = OCCASIONS_MAP[key];
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => handleOccasionTab(key)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '100px',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.04em',
                    backgroundColor: isActive ? '#181817' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#706E68',
                    border: isActive ? '1px solid #181817' : '1px solid #DDD9D0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#181817';
                      e.currentTarget.style.color = '#181817';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#DDD9D0';
                      e.currentTarget.style.color = '#706E68';
                    }
                  }}
                >
                  {occ.navLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section 
        style={{
          position: 'relative',
          padding: 'clamp(4.5rem, 8vw, 7.5rem) 0 clamp(3.5rem, 6vw, 5.5rem) 0',
          backgroundColor: '#20201E',
          color: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Background Emotional Lifestyle Photography */}
        <img 
          src={currentOccasion.heroImage} 
          alt={currentOccasion.navLabel}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.35,
            filter: 'saturate(1.15)'
          }}
        />

        {/* Cinematic Gradient Overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(24,24,23,0.85) 0%, rgba(24,24,23,0.7) 50%, rgba(24,24,23,0.95) 100%)'
          }}
        />

        <div className="container-custom" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.74rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--accent-bronze)',
                fontWeight: 700,
                marginBottom: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '5px 14px',
                borderRadius: '100px',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <Sparkles size={13} />
              <span>{currentOccasion.tag}</span>
            </div>

            <h1 
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                color: '#FFFFFF',
                marginBottom: '1.25rem'
              }}
            >
              {currentOccasion.heroHeading}
            </h1>

            <p 
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(1rem, 1.3vw, 1.18rem)',
                color: 'rgba(255, 255, 255, 0.86)',
                lineHeight: 1.6,
                maxWidth: '680px',
                margin: '0 auto 2.25rem auto'
              }}
            >
              {currentOccasion.heroSubheading}
            </p>

            {/* Quick jump anchor tags */}
            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
            >
              <a 
                href="#curated-groups"
                style={{
                  padding: '0.75rem 1.6rem',
                  backgroundColor: '#FFFFFF',
                  color: '#181817',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <span>Explore Curated Groups</span>
                <ArrowRight size={15} />
              </a>

              <a 
                href="#gift-bundle"
                style={{
                  padding: '0.75rem 1.6rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(6px)',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <Gift size={15} />
                <span>View Complete Gift Box</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Craft Bar */}
      <section 
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #DDD9D0',
          padding: '1.25rem 0'
        }}
      >
        <div className="container-custom">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}>
              <Compass size={18} color="#9B7A50" />
              <span style={{ fontSize: '0.8rem', color: '#181817', fontWeight: 600 }}>Artisanal Framing Studio</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}>
              <Printer size={18} color="#9B7A50" />
              <span style={{ fontSize: '0.8rem', color: '#181817', fontWeight: 600 }}>Professional 6-Colour Epson Prints</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}>
              <Mail size={18} color="#9B7A50" />
              <span style={{ fontSize: '0.8rem', color: '#181817', fontWeight: 600 }}>350 GSM Textured Greeting Cards</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}>
              <Truck size={18} color="#9B7A50" />
              <span style={{ fontSize: '0.8rem', color: '#181817', fontWeight: 600 }}>Safely Packed & Shipped Pan-India</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Curated Groups Section (Prompt 15 requirement) */}
      <section id="curated-groups" style={{ padding: 'clamp(4rem, 7vw, 6.5rem) 0' }}>
        <div className="container-custom">

          <div style={{ maxWidth: '640px', margin: '0 auto clamp(2.5rem, 5vw, 4rem) auto', textAlign: 'center' }}>
            <span 
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--accent-bronze)',
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.45rem'
              }}
            >
              Curated Gift Categories
            </span>
            <h2 
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                fontWeight: 500,
                color: '#181817',
                lineHeight: 1.18,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem'
              }}
            >
              Four Ways To Celebrate {currentOccasion.navLabel}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#706E68', lineHeight: 1.55 }}>
              Each piece is created in our Lucknow workshop with hand-assembled materials, bespoke personalization, and heirloom attention to detail.
            </p>
          </div>

          {/* 4 Alternating Curated Group Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {currentOccasion.groups.map((group, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={group.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #DDD9D0',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    boxShadow: '0 4px 20px rgba(24, 24, 23, 0.04)',
                    transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(24, 24, 23, 0.09)';
                    e.currentTarget.style.borderColor = '#C5BFB2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(24, 24, 23, 0.04)';
                    e.currentTarget.style.borderColor = '#DDD9D0';
                  }}
                >
                  {/* Visual Image Side */}
                  <div 
                    style={{
                      order: isEven ? 2 : 1,
                      position: 'relative',
                      minHeight: '340px',
                      backgroundColor: '#EDEAE4',
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src={group.image} 
                      alt={group.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.5s ease'
                      }}
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        top: '1.25rem',
                        left: '1.25rem',
                        backgroundColor: '#181817',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: '4px'
                      }}
                    >
                      {group.category}
                    </div>

                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '1.25rem',
                        right: '1.25rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(6px)',
                        color: '#181817',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: '100px',
                        border: '1px solid #DDD9D0'
                      }}
                    >
                      {group.price}
                    </div>
                  </div>

                  {/* Editorial Content Side */}
                  <div 
                    style={{
                      order: isEven ? 1 : 2,
                      padding: 'clamp(2rem, 4vw, 3rem)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#9B7A50', fontWeight: 600 }}>
                        {group.num}
                      </span>
                      <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#706E68', fontWeight: 600 }}>
                        {group.category}
                      </span>
                    </div>

                    <h3 
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)',
                        fontWeight: 500,
                        color: '#181817',
                        lineHeight: 1.2,
                        marginBottom: '0.6rem'
                      }}
                    >
                      {group.title}
                    </h3>

                    <p 
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: '#181817',
                        lineHeight: 1.45,
                        marginBottom: '0.75rem'
                      }}
                    >
                      {group.subtitle}
                    </p>

                    <p 
                      style={{
                        fontSize: '0.88rem',
                        color: '#706E68',
                        lineHeight: 1.55,
                        marginBottom: '1.5rem'
                      }}
                    >
                      {group.description}
                    </p>

                    {/* Features checklist */}
                    <div 
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.55rem',
                        marginBottom: '1.75rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #F0ECE1'
                      }}
                    >
                      {group.features.map((feat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#706E68' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#F5F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7A50', flexShrink: 0 }}>
                            <Check size={11} />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action CTA */}
                    <div>
                      <Link
                        to={group.ctaLink}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '0.75rem 1.6rem',
                          backgroundColor: '#181817',
                          color: '#FFFFFF',
                          borderRadius: '4px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9B7A50'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181817'}
                      >
                        <span>{group.ctaText}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Gift Bundle Section (Prompt 15 requirement: "Create A Gift Bundle") */}
      <section 
        id="gift-bundle" 
        style={{
          padding: 'clamp(4.5rem, 8vw, 7rem) 0',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #DDD9D0',
          borderBottom: '1px solid #DDD9D0'
        }}
      >
        <div className="container-custom">

          <div 
            style={{
              backgroundColor: '#20201E',
              color: '#FFFFFF',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              boxShadow: '0 20px 50px rgba(24, 24, 23, 0.16)'
            }}
          >
            {/* Visual Bundle Image */}
            <div style={{ position: 'relative', minHeight: '380px', backgroundColor: '#181817' }}>
              <img 
                src={currentOccasion.bundle.image} 
                alt={currentOccasion.bundle.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: 0.88
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(32,32,30,0.85) 100%)'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  left: '1.5rem',
                  backgroundColor: 'var(--accent-bronze)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  borderRadius: '4px'
                }}
              >
                {currentOccasion.bundle.badge}
              </div>
            </div>

            {/* Bundle Editorial Content & Ordering */}
            <div style={{ padding: 'clamp(2rem, 4.5vw, 3.5rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span 
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-bronze)',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  display: 'block'
                }}
              >
                All-In-One Curated Experience
              </span>

              <h3 
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  fontWeight: 500,
                  lineHeight: 1.15,
                  margin: '0 0 0.75rem 0'
                }}
              >
                {currentOccasion.bundle.title}
              </h3>

              <p 
                style={{
                  fontSize: '0.94rem',
                  color: 'rgba(255, 255, 255, 0.82)',
                  lineHeight: 1.5,
                  margin: '0 0 1.5rem 0'
                }}
              >
                {currentOccasion.bundle.tagline}
              </p>

              {/* Items in the bundle */}
              <div 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem'
                }}
              >
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  What's Included in this Coordinated Box:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {currentOccasion.bundle.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.84rem', color: '#FFFFFF' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(155, 122, 80, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7A50', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={11} />
                      </div>
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Complete Bundle Price
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                      ₹{currentOccasion.bundle.price.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.45)', textDecoration: 'line-through' }}>
                      ₹{currentOccasion.bundle.regularPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddBundle}
                  style={{
                    padding: '0.85rem 1.8rem',
                    backgroundColor: bundleAdded ? '#27AE60' : 'var(--accent-bronze)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                  }}
                >
                  {bundleAdded ? (
                    <>
                      <Check size={16} />
                      <span>Added To Cart!</span>
                    </>
                  ) : (
                    <>
                      <Gift size={16} />
                      <span>Add Complete Gift Box</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Footer Occasion Switcher Bar */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#F5F3EE', textAlign: 'center' }}>
        <div className="container-custom">
          <span style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#706E68', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Looking for a different milestone?
          </span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 500, color: '#181817', marginBottom: '1.25rem' }}>
            Explore All Occasions
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            {Object.keys(OCCASIONS_MAP).map((k) => (
              <button
                key={k}
                onClick={() => handleOccasionTab(k)}
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: '#FFFFFF',
                  color: '#181817',
                  border: '1px solid #DDD9D0',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#181817';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#181817';
                }}
              >
                {OCCASIONS_MAP[k].navLabel}
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
