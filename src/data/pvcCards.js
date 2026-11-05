export const PVC_SPEC = { size: '86 × 54 mm', thickness: '0.76 mm', material: 'Inkjet-coated white PVC' };

export const PVC_CATEGORIES = [
  { id: 'id', label: 'ID cards', note: 'Employee, student & visitor', headline: 'A clear identity. A considered design.', description: 'Cards for your team, campus and everyone who belongs.', icon: 'id' },
  { id: 'business', label: 'Business cards', note: 'PVC visiting & QR cards', headline: 'Leave a lasting introduction.', description: 'Put your business, contact details and a printed QR code in their hands.', icon: 'business' },
  { id: 'membership', label: 'Membership cards', note: 'Gym, club & loyalty', headline: 'Make belonging feel special.', description: 'A personal touch for your members, regulars and loyal customers.', icon: 'membership' },
  { id: 'events', label: 'Event passes', note: 'VIP, conference & crew', headline: 'Made for your next gathering.', description: 'Thoughtfully printed passes for guests, volunteers and the team behind it all.', icon: 'events' },
  { id: 'personalised', label: 'Personalised cards', note: 'Photos, gifts & keepsakes', headline: 'A little memory. Always close.', description: 'Turn a favourite photograph or a personal idea into a wallet-sized keepsake.', icon: 'personalised' },
  { id: 'bulk', label: 'Bulk PVC printing', note: 'Schools, offices & businesses', headline: 'One design. Your whole community.', description: 'Plan a coordinated batch with individual names, photographs and details.', icon: 'bulk' },
];

export const PVC_PRODUCTS = [
  { id: 'custom-pvc-id-card', title: 'Custom PVC ID Card', category: 'id', art: 'id', colour: 'sage', tag: 'YOUR OWN IDENTITY', description: 'Your organisation, your layout. Start with a ready design or let us help create one.', use: 'Single & bulk', defaultType: 'company-id', orientation: 'portrait' },
  { id: 'employee-id-card', title: 'Employee ID Card', category: 'id', art: 'id', colour: 'forest', tag: 'FOR YOUR TEAM', description: 'A consistent identity for employees, staff and contractors, with individual details.', use: 'Business & bulk', defaultType: 'employee', orientation: 'portrait' },
  { id: 'school-student-id-card', title: 'School Student ID Card', category: 'id', art: 'education', colour: 'blue', tag: 'CAMPUS ESSENTIALS', description: 'Student photographs, class details and school branding, brought together clearly.', use: 'School & bulk', defaultType: 'school-student', orientation: 'portrait' },
  { id: 'college-id-card', title: 'College ID Card', category: 'id', art: 'education', colour: 'clay', tag: 'THE CAMPUS EDIT', description: 'A clean card layout for student details, course information and your institution.', use: 'Single & bulk', defaultType: 'college-student', orientation: 'portrait' },
  { id: 'pvc-business-card', title: 'PVC Business Card', category: 'business', art: 'business', colour: 'sand', tag: 'A LASTING INTRODUCTION', description: 'A wallet-sized business or visiting card with your brand and contact information.', use: 'Single & bulk', defaultType: 'visiting', orientation: 'landscape' },
  { id: 'gym-membership-card', title: 'Gym Membership Card', category: 'membership', art: 'membership', colour: 'forest', tag: 'MADE TO BELONG', description: 'Give every member a clear, branded card with their membership details.', use: 'Single & bulk', defaultType: 'gym', orientation: 'landscape' },
  { id: 'shop-loyalty-card', title: 'Shop Loyalty Card', category: 'membership', art: 'loyalty', colour: 'clay', tag: 'FOR YOUR REGULARS', description: 'Keep your shop close with a printed loyalty, discount or rewards card.', use: 'Business & bulk', defaultType: 'shop-loyalty', orientation: 'landscape' },
  { id: 'qr-code-business-card', title: 'QR Code Business Card', category: 'business', art: 'qr', colour: 'sage', tag: 'ONE SCAN. YOUR DETAILS.', description: 'Print a QR code for your website, contact page or catalogue alongside your branding.', use: 'Single & bulk', defaultType: 'qr-business', orientation: 'landscape' },
  { id: 'visitor-id-card', title: 'Visitor ID Card', category: 'id', art: 'visitor', colour: 'sand', tag: 'A WARM WELCOME', description: 'Clearly identified visitors and guests, with space for your organisation’s details.', use: 'Business & bulk', defaultType: 'visitor', orientation: 'portrait' },
  { id: 'event-entry-pass', title: 'Event Entry Pass', category: 'events', art: 'events', colour: 'clay', tag: 'LET THEM IN, IN STYLE', description: 'Coordinated printed passes for your guests, VIPs, conference attendees or crew.', use: 'Event & bulk', defaultType: 'event-entry', orientation: 'portrait' },
  { id: 'personalised-photo-pvc-card', title: 'Personalised Photo PVC Card', category: 'personalised', art: 'photo', colour: 'rose', tag: 'A MEMORY IN YOUR WALLET', description: 'A favourite photograph, a special date or a little message made into a keepsake.', use: 'Single card', defaultType: 'photo', orientation: 'landscape' },
  { id: 'custom-membership-card', title: 'Custom Membership Card', category: 'membership', art: 'membership', colour: 'blue', tag: 'YOUR PEOPLE. YOUR CLUB.', description: 'A considered membership card for a club, salon, community or customer programme.', use: 'Single & bulk', defaultType: 'club', orientation: 'landscape' },
];

// Every card type has a real product destination and a preselected purpose.
export const PVC_CARD_TYPES = [
  ['employee', 'Employee ID Card', 'id', 'employee-id-card'],
  ['staff', 'Staff ID Card', 'id', 'employee-id-card'],
  ['company-id', 'Company ID Card', 'id', 'custom-pvc-id-card'],
  ['visitor', 'Visitor ID Card', 'id', 'visitor-id-card'],
  ['contractor', 'Contractor ID Card', 'id', 'employee-id-card'],
  ['visiting', 'PVC Business / Visiting Card', 'business', 'pvc-business-card'],
  ['school-student', 'School Student ID Card', 'id', 'school-student-id-card'],
  ['college-student', 'College Student ID Card', 'id', 'college-id-card'],
  ['teacher', 'Teacher ID Card', 'id', 'custom-pvc-id-card'],
  ['coaching', 'Coaching Institute ID Card', 'id', 'custom-pvc-id-card'],
  ['library', 'Library Membership Card', 'id', 'college-id-card'],
  ['transport', 'School Transport ID Card', 'id', 'school-student-id-card'],
  ['gym', 'Gym Membership Card', 'membership', 'gym-membership-card'],
  ['salon', 'Salon & Spa Membership Card', 'membership', 'custom-membership-card'],
  ['shop-loyalty', 'Shop Loyalty Card', 'membership', 'shop-loyalty-card'],
  ['discount', 'Customer Discount Card', 'membership', 'shop-loyalty-card'],
  ['vip', 'VIP Membership Card', 'membership', 'custom-membership-card'],
  ['club', 'Club Membership Card', 'membership', 'custom-membership-card'],
  ['rewards', 'Rewards / Points Card', 'membership', 'shop-loyalty-card'],
  ['event-entry', 'Event Entry Pass', 'events', 'event-entry-pass'],
  ['conference', 'Conference ID Card', 'events', 'event-entry-pass'],
  ['exhibition', 'Exhibition Visitor Pass', 'events', 'event-entry-pass'],
  ['volunteer', 'Volunteer ID Card', 'events', 'event-entry-pass'],
  ['wedding-vip', 'Wedding VIP Pass', 'events', 'event-entry-pass'],
  ['event-crew', 'Event Crew / Organizer ID', 'events', 'event-entry-pass'],
  ['photo', 'Custom Photo PVC Card', 'personalised', 'personalised-photo-pvc-card'],
  ['couple', 'Couple Photo Card', 'personalised', 'personalised-photo-pvc-card'],
  ['anniversary', 'Anniversary Photo Card', 'personalised', 'personalised-photo-pvc-card'],
  ['birthday', 'Birthday Keepsake Card', 'personalised', 'personalised-photo-pvc-card'],
  ['qr-business', 'QR Code Business Card', 'business', 'qr-code-business-card'],
  ['emergency', 'Emergency Contact Card', 'personalised', 'personalised-photo-pvc-card'],
  ['custom-design', 'Custom Design PVC Card', 'personalised', 'personalised-photo-pvc-card'],
].map(([id, label, category, productId]) => ({ id, label, category, productId }));

export const getPvcProduct = id => PVC_PRODUCTS.find(product => product.id === id);
export const getPvcType = id => PVC_CARD_TYPES.find(type => type.id === id);
export const pvcCategoryPath = id => id === 'bulk' ? '/pvc-cards/bulk' : `/pvc-cards?category=${id}`;
export const pvcProductPath = (id, type) => `/pvc-cards/${id}${type ? `?type=${encodeURIComponent(type)}` : ''}`;
export function filterPvcProducts(category = 'all', query = '') {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return PVC_PRODUCTS.filter(product => (category === 'all' || product.category === category) && terms.every(term => `${product.title} ${product.description} ${product.use} ${PVC_CARD_TYPES.filter(type => type.productId === product.id).map(type => type.label).join(' ')}`.toLowerCase().includes(term)));
}
