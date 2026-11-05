import React, { useId } from 'react';
import { CARD_DEMO_PHOTO, CARD_TEMPLATES } from '../data/birthdayCards';
import { getCardPhotoPlacement, wrapCardText } from '../utils/birthdayCards';

function CardText({ children, x = 250, y, width = 390, height = 150, size = 52, color, sans = false, spacing = 0, anchor = 'middle', italic = false }) {
  let fontSize = size;
  let lines = wrapCardText(children, width, fontSize);
  while (lines.length * fontSize * 1.23 > height && fontSize > 8) {
    fontSize -= 1;
    lines = wrapCardText(children, width, fontSize);
  }
  return <text x={x} y={y} fill={color} fontFamily={sans ? 'Arial, sans-serif' : 'Georgia, serif'} fontSize={fontSize} textAnchor={anchor} letterSpacing={spacing} fontStyle={italic ? 'italic' : undefined}>
    {lines.map((line, index) => <tspan key={index} x={x} dy={index ? fontSize * 1.23 : 0}>{line || '\u00a0'}</tspan>)}
  </text>;
}

function Star({ x, y, size = 10, color }) {
  return <path d={`M${x} ${y - size} Q${x + 2} ${y - 2} ${x + size} ${y} Q${x + 2} ${y + 2} ${x} ${y + size} Q${x - 2} ${y + 2} ${x - size} ${y} Q${x - 2} ${y - 2} ${x} ${y - size}`} fill={color} />;
}

function Branch({ x, y, rotate = 0, color }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate})`} fill={color}>
    <path d="M0 160 Q30 60 0 0" fill="none" stroke={color} strokeWidth="2" />
    {[20, 53, 86, 119].map((v, i) => <g key={v} transform={`translate(${i < 2 ? 6 : 10} ${v})`}><ellipse cx="-13" cy="-7" rx="7" ry="22" transform="rotate(-45)" /><ellipse cx="17" cy="-2" rx="7" ry="23" transform="rotate(48)" /></g>)}
  </g>;
}

function Decorations({ template }) {
  const { id, accent, ink } = template;
  if (id === 'minimal_editorial') return <><rect x="26" y="26" width="448" height="648" fill="none" stroke={accent} strokeWidth="0.8" opacity=".6" /><circle cx="250" cy="515" r="62" fill={accent} opacity=".13" /><path d="M190 550 Q250 420 310 550" fill="none" stroke={accent} strokeWidth="1.4" /><Star x={250} y={520} size={19} color={accent} /></>;
  if (id === 'elegant_gold') return <><rect x="30" y="30" width="440" height="640" rx="210" fill="none" stroke={accent} opacity=".65" /><rect x="42" y="42" width="416" height="616" rx="200" fill="none" stroke={accent} opacity=".22" />{[[250,112,15],[126,198,7],[378,198,7],[250,568,12],[145,513,5],[355,513,5]].map(([x,y,size]) => <Star key={`${x}${y}`} x={x} y={y} size={size} color={accent} />)}</>;
  if (id === 'floral_botanical') return <><ellipse cx="250" cy="345" rx="154" ry="220" fill="#fffaf0" /><Branch x={57} y={45} color={ink} rotate={-18} /><Branch x={442} y={655} color={ink} rotate={162} /><Branch x={71} y={605} color={accent} rotate={-115} /><Branch x={430} y={96} color={accent} rotate={65} /></>;
  if (id === 'islamic_barakah') return <><path d="M65 638 V230 Q65 135 250 52 Q435 135 435 230 V638 Z" fill="none" stroke={accent} strokeWidth="1.6" /><path d="M78 625 V232 Q78 145 250 68 Q422 145 422 232 V625 Z" fill="none" stroke={accent} opacity=".35" /><Star x={250} y={132} size={17} color={accent} /><Star x={250} y={590} size={11} color={accent} /></>;
  if (id === 'kids_playful') return <><g stroke={ink} strokeWidth="1" fill="none" opacity=".4"><path d="M110 145 Q140 230 110 305" /><path d="M395 126 Q370 230 400 290" /><path d="M260 105 Q240 180 268 225" /></g><ellipse cx="105" cy="105" rx="38" ry="48" fill="#d98468" /><ellipse cx="395" cy="86" rx="31" ry="41" fill="#8a9d8a" /><ellipse cx="260" cy="66" rx="30" ry="39" fill="#d6ad5b" /><path d="M110 585 A140 140 0 0 1 390 585" fill="none" stroke="#d98468" strokeWidth="28" /><path d="M140 585 A110 110 0 0 1 360 585" fill="none" stroke="#d6ad5b" strokeWidth="22" /><path d="M165 585 A85 85 0 0 1 335 585" fill="none" stroke="#8a9d8a" strokeWidth="18" /><Star x={60} y={385} color={accent} size={11} /><Star x={435} y={370} color={accent} size={12} /></>;
  if (id === 'fun_celebration') return <><circle cx="250" cy="335" r="176" fill="#f8e9d1" />{Array.from({ length: 26 }, (_, i) => { const x = 28 + (i * 83) % 447, y = i % 2 ? 52 + i * 3 : 568 + i * 3; return <rect key={i} x={x} y={y} width={i % 3 ? 7 : 13} height={i % 3 ? 18 : 7} rx="2" fill={['#b16b51','#476451','#bd9658'][i % 3]} transform={`rotate(${i * 21} ${x} ${y})`} />; })}<Star x={250} y={152} size={23} color={accent} /><Star x={250} y={527} size={17} color={accent} /></>;
  return null;
}

export default function BirthdayCardPreview({ config = {}, view = 'front', photo, demo = false, decorative = false, singlePage = false, className = '', style }) {
  const uid = useId().replace(/:/g, '');
  const template = CARD_TEMPLATES.find(item => item.id === config.templateId) || CARD_TEMPLATES[0];
  const { ink, accent, bg, id } = template;
  const recipient = config.recipientName?.trim() || (demo ? 'Amira' : 'Your favourite person');
  const headline = config.headline?.trim() || template.sampleGreeting;
  const selectedPhoto = photo || config.photo || (demo ? CARD_DEMO_PHOTO : null);
  const showPhoto = Boolean(config.includePhoto && selectedPhoto && template.hasPhoto);
  const fullBleed = id === 'photo_fullbleed';
  const box = fullBleed ? { x:0, y:0, width:500, height:700 } : id === 'minimal_editorial' ? { x:100, y:110, width:300, height:285 } : id === 'islamic_barakah' ? { x:140, y:175, width:220, height:235 } : { x:115, y:125, width:270, height:265 };
  const placement = showPhoto ? getCardPhotoPlacement(box, selectedPhoto, config.photoFit, config.panX ?? 50, config.panY ?? 50) : null;

  if (view === 'inside') return <svg xmlns="http://www.w3.org/2000/svg" viewBox={singlePage ? '500 0 500 700' : '0 0 1000 700'} className={className} style={style} role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `Open card. Message for ${recipient}`}>
    <rect width="1000" height="700" fill="#fcf8ee" /><rect width="500" height="700" fill={bg} opacity=".35" /><path d="M500 0 V700" stroke="#d6cebc" strokeWidth="1" />
    <path d="M250 337 C222 307 203 341 250 372 C297 341 278 307 250 337" fill="none" stroke={accent} strokeWidth="1.4" />
    <CardText x={750} y={147} width={370} height={65} size={28} color={ink}>{`Dear ${recipient},`}</CardText>
    <CardText x={750} y={227} width={360} height={285} size={23} color={ink}>{config.message?.trim() || 'Your words go here. A little note they’ll come back to, long after the candles are out.'}</CardText>
    <path d="M713 547 H787" stroke={accent} />
    <CardText x={750} y={593} width={360} height={65} size={22} italic color={ink}>{config.signoff?.trim() || 'With love, your name'}</CardText>
  </svg>;

  const titleY = fullBleed ? 500 : showPhoto ? 456 : id === 'minimal_editorial' ? 248 : 285;
  const titleSize = fullBleed ? 57 : showPhoto ? 43 : id === 'fun_celebration' ? 68 : 62;
  const titleHeight = showPhoto ? 109 : 170;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" className={className} style={style} role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `${template.name}. ${headline}. For ${recipient}`}>
    <defs><clipPath id={`${uid}-photo`}><rect {...box} rx={config.photoFit !== 'contain' && (id === 'floral_botanical' || id === 'islamic_barakah') ? 110 : 0} /></clipPath><linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="0" y2="1"><stop offset="20%" stopColor="#0b211b" stopOpacity="0" /><stop offset="100%" stopColor="#0b211b" stopOpacity=".92" /></linearGradient></defs>
    <rect width="500" height="700" fill={bg} /><Decorations template={template} />
    {showPhoto && <g clipPath={`url(#${uid}-photo)`}><rect {...box} fill="#fcf8ee" /><image href={selectedPhoto.url} {...placement} preserveAspectRatio="none" /></g>}
    {fullBleed && <><rect width="500" height="700" fill={`url(#${uid}-shade)`} /><Star x={250} y={105} size={15} color={accent} /></>}
    {id === 'minimal_editorial' && <CardText y={75} size={11} spacing={3} color={accent} height={20}>A DAY JUST FOR YOU</CardText>}
    {!showPhoto && !fullBleed && <CardText y={titleY - 64} size={12} spacing={2.3} color={accent} height={30}>LET’S CELEBRATE YOU</CardText>}
    <CardText y={titleY} width={fullBleed ? 410 : 360} height={titleHeight} size={titleSize} color={ink} sans={id === 'kids_playful' || id === 'fun_celebration'}>{headline}</CardText>
    <CardText y={fullBleed ? 640 : showPhoto ? 606 : 461} width={365} height={40} size={17} color={ink} italic>{`For ${recipient}`}</CardText>
    {!fullBleed && <CardText y={658} width={350} height={22} size={10} spacing={.6} color={accent}>{template.sampleSub}</CardText>}
  </svg>;
}
