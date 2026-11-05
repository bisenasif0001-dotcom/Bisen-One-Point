/**
 * AL-NOOR REAL PHOTOGRAPHY SYSTEM (PROMPT 28)
 * Standardized multi-angle image shot lists across all 4 product pillars:
 * - FRAMES (7-shot studio system)
 * - PHOTO PRINTS (5-shot studio system)
 * - CARDS (6-shot studio system)
 * - ITRA (6-shot studio system)
 */

export const FRAME_PHOTOGRAPHY_SYSTEM = [
  {
    id: 'clean-front',
    label: 'Clean Front Elevation',
    shortLabel: 'Front',
    desc: 'Head-on studio shot showing precise proportional balance, mitred corners, and optical cast acrylic glazing.',
    image: '/frames/regal-aurelia/front.png'
  },
  {
    id: 'lifestyle-wall',
    label: 'Layered Gallery Depth',
    shortLabel: 'Layered',
    desc: 'Perspective angle highlighting the multi-layered bevel mat, inner fillet, and moulding depth.',
    image: '/frames/regal-windsor/layered.png'
  },
  {
    id: 'angle-45',
    label: '45-Degree Angular Shot',
    shortLabel: '45° Angle',
    desc: 'Sculpted profile angle showing tactile surface textures and reflection-free crystal acrylic.',
    image: '/frames/emberstone/layered.png'
  },
  {
    id: 'corner-macro',
    label: 'Corner Mitre Macro',
    shortLabel: 'Corner Joint',
    desc: 'High-magnification close-up of seamless 45° mitre joinery, gold inner border, and lacquer finish.',
    image: '/frames/regal-heritage/corner.png'
  },
  {
    id: 'frame-depth',
    label: 'Frame Side Elevation',
    shortLabel: 'Side Profile',
    desc: 'Side profile elevation highlighting the substantial wall depth offset and moulding thickness.',
    image: '/frames/regal-onyx/side.png'
  },
  {
    id: 'back-hardware',
    label: 'Architectural Shadowline',
    shortLabel: 'Shadowline',
    desc: 'Matte black moulding with crisp studio white mount and architectural shadowline detail.',
    image: '/frames/regal-noir/layered.png'
  },
  {
    id: 'packaging',
    label: 'Pinstripe Bevel Joint',
    shortLabel: 'Pinstripe Joint',
    desc: 'Stepped architectural moulding with Prussian blue accent border and chrome fillet.',
    image: '/frames/regal-blue/corner.png'
  }
];

export const PHOTO_PRINTS_PHOTOGRAPHY_SYSTEM = [
  {
    id: 'flat-print',
    label: 'Flat Print',
    shortLabel: 'Flat Lay',
    desc: 'Full-bleed professional lustre photographic print laid flat under 5000K daylight.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'held-in-hand',
    label: 'Print Held In Hand',
    shortLabel: 'In Hand Scale',
    desc: 'Natural hand-held photo highlighting physical proportions and paper rigidity.',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'paper-texture',
    label: 'Paper Texture Close-Up',
    shortLabel: 'Lustre Texture',
    desc: 'Macro lighting raking across 260+ GSM micro-porous lustre photographic grain.',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'print-stack',
    label: 'Print Stack',
    shortLabel: 'Print Stack',
    desc: 'A pristine curated stack of borderless prints with interleaf glassine tissue.',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'epson-process',
    label: 'Epson Printing Process',
    shortLabel: 'Epson Workshop',
    desc: 'Authentic workshop photo of 6-colour printhead depositing continuous tones.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80'
  }
];

export const CARDS_PHOTOGRAPHY_SYSTEM = [
  {
    id: 'card-front',
    label: 'Front Cover',
    shortLabel: 'Cover',
    desc: 'Direct front cover fine art typography and illustration on 350 GSM cardstock.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'open-card',
    label: 'Open Card',
    shortLabel: 'Inside Spread',
    desc: 'Half-open angled spread showing tactile crease and custom printed inscription.',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'card-back',
    label: 'Card Back',
    shortLabel: 'Back Cover',
    desc: 'Rear panel with subtle blind-embossed AL-NOOR studio seal and provenance.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'envelope',
    label: 'Matching Envelope',
    shortLabel: 'Envelope',
    desc: '150 GSM luxury peel-and-seal envelope with custom watermark flap.',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'hand-scale',
    label: 'Hand-Held Scale',
    shortLabel: 'Handheld',
    desc: 'Held in hand on coffee table demonstrating natural folded card dimension.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'personalised-example',
    label: 'Personalised Example',
    shortLabel: 'Custom Letter',
    desc: 'Real sample showcasing custom recipient name and heartfelt inside letter.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80'
  }
];

export const ITRA_PHOTOGRAPHY_SYSTEM = [
  {
    id: 'bottle-front',
    label: 'Bottle Front',
    shortLabel: 'Front Flacon',
    desc: 'Thick-walled crystal glass flacon showing pure golden oil and gold metal cap.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'bottle-angle',
    label: 'Bottle Angle',
    shortLabel: 'Angled Studio',
    desc: 'Dramatic studio lighting revealing oil viscosity and crystal faceting.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'box',
    label: 'Presentation Box',
    shortLabel: 'Hard Box',
    desc: 'Rigid textured presentation gift box with gold foil embossed lettering.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'hand-scale',
    label: 'Hand Scale',
    shortLabel: 'In Hand',
    desc: 'Held in hand displaying glass wand applicator dipping into pure attar.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'notes-lifestyle',
    label: 'Notes / Lifestyle',
    shortLabel: 'Botanical Notes',
    desc: 'Surrounded by real raw ingredients: agarwood chips, dried Taif rose, amber resin.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'gift-presentation',
    label: 'Gift Presentation',
    shortLabel: 'Gift Velvet',
    desc: 'Resting in plush black velvet travel pouch with branded presentation seal.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80'
  }
];
