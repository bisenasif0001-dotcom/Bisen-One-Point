export const STATIONERY_OCCASIONS = [
  { id: 'birthday', name: 'Birthday Cards', label: 'Birthday', greeting: 'Happy Birthday', sampleName: 'Amira', templateId: 'fun_celebration', tone: 'peach', description: 'Birthday wishes, milestone cards and photo keepsakes.' },
  { id: 'anniversary', name: 'Anniversary Cards', label: 'Anniversary', greeting: 'Happy Anniversary', sampleName: 'Zoya & Amaan', templateId: 'elegant_gold', tone: 'sage', description: 'A personal note for another year together.' },
  { id: 'wedding', name: 'Wedding Invitations', label: 'Wedding', greeting: 'Together, Forever', sampleName: 'Sara & Rayyan', sampleDetail: '21 DECEMBER 2026', templateId: 'wedding_vows', tone: 'cream', description: 'Nikah, reception and wedding stationery.' },
  { id: 'baby', name: 'Baby Announcements', label: 'New baby', greeting: 'Hello, Little One', sampleName: 'Inaya', templateId: 'kids_playful', tone: 'rose', description: 'Share the arrival of someone new.' },
  { id: 'thank-you', name: 'Thank You Cards', label: 'Thank you', greeting: 'Thank You', sampleName: 'Noor', templateId: 'minimal_editorial', tone: 'sage', description: 'A thoughtful way to show your appreciation.' },
  { id: 'eid', name: 'Eid Greetings', label: 'Eid', greeting: 'Eid Mubarak', sampleName: 'Your family', templateId: 'islamic_barakah', tone: 'cream', description: 'Warm Eid wishes for friends and family.' },
  { id: 'congratulations', name: 'Congratulations', label: 'Congratulations', greeting: 'You Did It!', sampleName: 'Aarav', sampleDetail: 'CLASS OF 2026', templateId: 'milestone_ribbon', tone: 'peach', description: 'Graduations, new homes and big milestones.' },
  { id: 'memorial', name: 'Memorial & Condolence Cards', label: 'Remembrance', greeting: 'In Loving Memory', sampleName: 'A beloved soul', templateId: 'quiet_remembrance', tone: 'stone', description: 'Share a remembrance or send a note of sympathy.' },
];

export const STATIONERY_TEMPLATES = [
  { id: 'tpl-1', templateId: 'floral_botanical', occasionId: 'thank-you' },
  { id: 'tpl-2', templateId: 'elegant_gold', occasionId: 'wedding' },
  { id: 'tpl-3', templateId: 'islamic_barakah', occasionId: 'eid' },
  { id: 'tpl-4', templateId: 'kids_playful', occasionId: 'baby' },
];

export const getStationeryOccasion = id => STATIONERY_OCCASIONS.find(item => item.id === id);
export const stationeryOccasionPath = id => `/cards/occasion/${id}`;

export function stationeryRequestPath(mode, occasionId) {
  const path = mode === 'print' ? '/cards/print-your-design' : '/cards/custom-design';
  return occasionId ? `${path}?occasion=${encodeURIComponent(occasionId)}` : path;
}

export function stationeryEditorPath(occasionId, templateId) {
  const params = new URLSearchParams();
  if (occasionId && occasionId !== 'birthday') params.set('category', occasionId);
  if (templateId) params.set('template', templateId);
  return `${params.has('category') ? '/create-card' : '/birthday-cards'}${params.size ? `?${params}` : ''}`;
}

export function stationeryCardTitle(template, occasionId) {
  const occasion = getStationeryOccasion(occasionId);
  return `${template.name} · ${occasion && occasion.id !== 'birthday' ? `${occasion.label} card` : 'Birthday card'}`;
}
