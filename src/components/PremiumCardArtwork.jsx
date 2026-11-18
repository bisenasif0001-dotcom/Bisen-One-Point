import React, { useId } from 'react';
import { CARD_DEMO_PHOTO, CARD_TEMPLATES } from '../data/birthdayCards';
import { getCardPalette } from '../data/cardDesigns';
import { getCardPhotoPlacement, wrapCardText } from '../utils/birthdayCards';

function CardCopy({ children, x = 250, y, width = 344, height = 110, size, fill, italic, spacing = 0, sans = false }) {
  if (!children) return null;
  let fontSize = size;
  let lines = wrapCardText(children, width - spacing * 8, fontSize);
  while (lines.length * fontSize * 1.12 > height && fontSize > 10) {
    fontSize -= 1;
    lines = wrapCardText(children, width - spacing * 8, fontSize);
  }
  const leading = fontSize * 1.12;
  return <text x={x} y={y - (lines.length - 1) * leading / 2} textAnchor="middle" fill={fill}
    fontFamily={sans ? 'Arial, sans-serif' : 'Georgia, serif'} fontSize={fontSize}
    fontStyle={italic ? 'italic' : undefined} letterSpacing={spacing}>
    {lines.map((line, index) => <tspan key={index} x={x} dy={index ? leading : 0}>{line || '\u00a0'}</tspan>)}
  </text>;
}

function Star({ x = 0, y = 0, size = 11 }) {
  return <path d="M0 -12Q2 -2 9 0Q2 2 0 12Q-2 2 -9 0Q-2 -2 0 -12Z" transform={`translate(${x} ${y}) scale(${size / 12})`} fill="currentColor" stroke="none" />;
}

function Rule({ y, width = 82 }) {
  return <g transform={`translate(250 ${y})`}><path d={`M${-width / 2} 0H-9M9 0H${width / 2}`} fill="none" stroke="currentColor" /><Star size={5} /></g>;
}

function Border({ inset, radius = 0 }) {
  return <rect x={inset} y={inset} width={500 - inset * 2} height={700 - inset * 2} rx={radius} fill="none" stroke="currentColor" />;
}

function Spray({ x, y, angle, scale = 1, flowering = false }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M0 0Q-16 -75 5 -169" fill="none" stroke="currentColor" strokeWidth="1.6" />
    {[24, 53, 81, 109, 135].map((position, index) => <g key={position} transform={`translate(${index > 3 ? 0 : -7} ${-position}) scale(${1 - index * .10})`}>
      <path d="M0 0Q-31 -5 -36 -34Q-12 -30 0 0M0 -5Q8 -36 35 -40Q29 -15 0 -5" fill="currentColor" opacity={index % 2 ? .34 : .56} />
      <path d="M0 0Q-20 -13 -36 -34M0 -5Q17 -25 35 -40" stroke="currentColor" fill="none" strokeWidth="1" />
    </g>)}
    {flowering && <g fill="none" stroke="currentColor"><path d="M5 -166Q-10 -176 -9 -190Q1 -193 6 -182Q8 -202 19 -195Q26 -183 9 -166Z" /><ellipse cx="9" cy="-182" rx="17" ry="9" transform="rotate(-34 9 -182)" /><circle cx="8" cy="-180" r="3" fill="currentColor" /></g>}
  </g>;
}

function DecoCorners() {
  return [[0, 0, 1, 1], [500, 0, -1, 1], [0, 700, 1, -1], [500, 700, -1, -1]].map(([x, y, sx, sy]) =>
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} fill="none" stroke="currentColor">
      <path d="M29 124V62H47V46H62V29H128M39 115V70H56V55H70V39H117M50 93V79H65V65H80V50H100" />
      <path d="M55 55L105 105" opacity=".48" /><Star x={105} y={105} size={7} />
    </g>);
}

function Constellation({ points }) {
  return points.map(([x, y, size]) => <g key={`${x}-${y}`}><Star x={x} y={y} size={size} /><circle cx={x + size * 1.7} cy={y - 6} r={size * .13 + 1} fill="currentColor" opacity=".62" /></g>);
}

const birthdaySparks = [[65, 160, 9], [131, 77, 13], [159, 142, 5], [264, 91, 18], [333, 113, 6], [414, 175, 13], [431, 94, 8], [74, 544, 8], [141, 607, 8], [338, 621, 7], [419, 556, 16]];
const babyStars = [[99, 151, 10], [148, 104, 5], [302, 88, 9], [345, 162, 13], [409, 200, 6], [67, 577, 7], [396, 559, 8]];

function CardOrnament({ id, palette, withPhoto }) {
  const { accent, soft } = palette;
  switch (id) {
    case 'elegant_gold':
      return <g color={accent}><Border inset={20} /><Border inset={27} /><DecoCorners /><Rule y={withPhoto ? 385 : 220} /><Rule y={620} />
        {!withPhoto && <g transform="translate(250 146)" fill="none" stroke="currentColor"><circle cx="-13" cy="0" r="19" /><circle cx="13" cy="0" r="19" /><circle r="40" opacity=".4" /><Star x={0} y={-53} size={8} /></g>}
      </g>;
    case 'wedding_vows':
      return <g color={accent}><Border inset={20} />
        <path d="M75 608V257C75 164 151 96 250 96S425 164 425 257V608M88 595V259C88 174 159 108 250 108S412 174 412 259V595" fill="none" stroke={accent} opacity=".66" />
        <g color={soft}><Spray x={45} y={631} angle={5} scale={1.69} flowering /><Spray x={455} y={631} angle={-5} scale={1.69} flowering /><Spray x={95} y={662} angle={52} scale={.45} /><Spray x={405} y={662} angle={-52} scale={.45} /></g>
        <Star x={250} y={62} size={12} /><Rule y={withPhoto ? 371 : 473} width={102} />
      </g>;
    case 'floral_botanical':
      return <g color={accent}><Border inset={22} radius={176} /><Border inset={37} radius={164} />
        <Spray x={96} y={37} angle={132} scale={1.18} flowering /><Spray x={412} y={666} angle={-48} scale={1.34} flowering />
        <g color={soft}><Spray x={72} y={72} angle={157} scale={.88} /><Spray x={433} y={629} angle={-18} scale={.9} /></g><Rule y={withPhoto ? 383 : 462} />
      </g>;
    case 'islamic_barakah':
      return <g color={accent}><Border inset={20} /><Border inset={27} />
        <path d="M62 628V267C62 175 119 137 250 72C381 137 438 175 438 267V628ZM74 614V267C74 185 125 149 250 86C375 149 426 185 426 267V614Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <Constellation points={[[61, 77, 7], [433, 77, 7], [57, 650, 8], [443, 650, 8]]} />
        {!withPhoto && <g transform="translate(247 179)"><path d="M19 -40C-27 -37 -44 12 -12 38C8 53 35 43 44 22C17 37 -11 20 -13 -5C-16 -21 -1 -33 19 -40Z" fill={accent} /><Star x={25} y={-3} size={17} /><Star x={46} y={-24} size={6} /></g>}
        <Rule y={withPhoto ? 378 : 465} />
      </g>;
    case 'kids_playful':
      return <g color={accent}><Border inset={23} radius={18} /><Constellation points={babyStars} />
        {!withPhoto && <g transform="translate(237 164)">
          <path d="M35 -43C4 -59 -32 -35 -32 0C-32 37 10 57 39 34C16 36 -5 18 -5 -6C-5 -24 12 -41 35 -43Z" fill={accent} opacity=".84" />
          <path d="M-67 50Q-84 30 -57 24Q-55 -1 -29 8Q-1 -2 10 22Q36 24 32 50Z" fill={palette.ink} opacity=".15" />
          <Star x={46} y={-25} size={15} /><Star x={13} y={12} size={8} />
        </g>}
        <path d="M160 644C186 601 222 590 250 590S314 601 340 644M174 649C194 615 223 604 250 604S306 615 326 649M190 653C207 626 229 616 250 616S293 626 310 653" fill="none" stroke={soft} strokeWidth="2.5" opacity={withPhoto ? .2 : .7} />
      </g>;
    case 'fun_celebration':
      return <g color={accent}><Border inset={22} /><Constellation points={birthdaySparks} />
        <path d="M30 104C120 187 39 271 70 346M470 104C380 187 461 271 430 346M107 541C153 562 169 615 245 614M393 541C347 562 331 615 255 614" fill="none" stroke={accent} strokeWidth="1.2" opacity=".55" />
        <path d="M80 209Q250 138 420 209M80 482Q250 552 420 482" fill="none" stroke={soft} opacity=".5" /><Rule y={473} width={120} />
      </g>;
    case 'milestone_ribbon':
      return <g color={accent}><Border inset={22} /><DecoCorners />
        <path d="M36 242C108 203 112 130 133 80C148 190 113 213 83 246L38 263ZM464 497C400 540 393 592 372 642C359 537 390 523 420 490L464 474Z" fill={soft} opacity=".38" />
        {!withPhoto && <g transform="translate(250 162)" fill="none" stroke={accent}><path d="M0 -51L42 0L0 51L-42 0ZM0 -38L31 0L0 38L-31 0Z" /><Star size={22} /><Star x={-63} y={0} size={8} /><Star x={63} y={0} size={8} /></g>}
        <Rule y={withPhoto ? 380 : 475} width={130} />
      </g>;
    case 'quiet_remembrance':
      return <g color={accent}><Border inset={23} /><Border inset={32} />
        {!withPhoto && <g color={soft}><Spray x={209} y={226} angle={34} scale={.78} /><Spray x={287} y={226} angle={-34} scale={.78} /></g>}
        <Rule y={withPhoto ? 380 : 472} width={76} />
        <path d="M92 621H408M102 629H398" fill="none" stroke={accent} opacity=".49" />
      </g>;
    case 'photo_fullbleed':
      return <g color={accent}><Border inset={23} /><Border inset={31} /><Rule y={638} width={120} /></g>;
    default:
      return <g color={accent}><Border inset={23} /><Border inset={32} />
        {!withPhoto && <g color={soft}><Spray x={224} y={202} angle={24} scale={.59} /><Spray x={276} y={202} angle={-24} scale={.59} /></g>}
        <Rule y={withPhoto ? 380 : 465} width={105} /><Rule y={631} width={105} />
      </g>;
  }
}

export default function PremiumCardArtwork({ config, view = 'front', photo, demo, decorative, singlePage, className, style }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const template = CARD_TEMPLATES.find(item => item.id === config.templateId) || CARD_TEMPLATES[0];
  const { id } = template;
  const palette = getCardPalette(id, config.paletteId);
  const { ink, accent, paper, depth } = palette;
  const recipient = config.recipientName?.trim() || (demo ? 'Amira' : 'Your names');
  const headline = config.headline?.trim() || template.sampleGreeting;
  const detail = config.coverDetail?.trim();
  const selectedPhoto = photo || config.photo || (demo ? CARD_DEMO_PHOTO : null);
  const showPhoto = Boolean(config.includePhoto && selectedPhoto?.width && selectedPhoto?.height && template.hasPhoto);
  const fullBleed = id === 'photo_fullbleed' && showPhoto;

  if (view === 'inside') {
    const blank = config.blankInside;
    const isAnnouncement = ['wedding', 'baby', 'memorial'].includes(config.occasionId);
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox={singlePage ? '500 0 500 700' : '0 0 1000 700'} className={className} style={style}
      role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : blank ? 'Blank inside' : `Open card. Message for ${recipient}`}>
      <rect width="1000" height="700" fill="#fffaf0" /><path d="M500 0V700" stroke="#d6cebc" />
      {!blank && <>
        <rect width="500" height="700" fill={paper} opacity=".12" />
        <g color={accent}><Border inset={27} /><Rule y={324} width={142} /><path d="M539 113H961M539 607H961" fill="none" stroke="currentColor" /></g>
        {!isAnnouncement && <CardCopy x={750} y={185} width={380} height={66} size={27} fill="#283b34" italic>{`Dear ${recipient},`}</CardCopy>}
        <CardCopy x={750} y={364} width={366} height={268} size={23} fill="#283b34">{config.message?.trim() || 'Your personal message goes here.'}</CardCopy>
        <CardCopy x={750} y={558} width={366} height={65} size={21} fill="#283b34" italic>{config.signoff?.trim() || 'Your sign-off'}</CardCopy>
      </>}
    </svg>;
  }

  const box = fullBleed ? { x: 0, y: 0, width: 500, height: 700 } : { x: 132, y: 112, width: 236, height: 229 };
  const placement = showPhoto ? getCardPhotoPlacement(box, selectedPhoto, config.photoFit, config.panX ?? 50, config.panY ?? 50) : null;
  const headingY = fullBleed ? 492 : showPhoto ? 452 : id === 'fun_celebration' ? 337 : 320;
  const nameY = fullBleed ? 572 : showPhoto ? 547 : 415;
  const detailY = fullBleed ? 612 : showPhoto ? 590 : 574;

  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" className={className} style={style}
    role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `${template.name}, ${headline}, ${recipient}`}>
    <defs>
      <radialGradient id={`${uid}-paper`} cx="49%" cy="44%" r="77%"><stop stopColor={paper} /><stop offset="100%" stopColor={depth} /></radialGradient>
      <linearGradient id={`${uid}-shade`} x2="0" y2="1"><stop offset="26%" stopColor={depth} stopOpacity="0" /><stop offset="70%" stopColor={depth} stopOpacity=".90" /><stop offset="100%" stopColor={depth} /></linearGradient>
      <pattern id={`${uid}-lines`} width="6" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(33)"><path d="M2 0V9" stroke={ink} strokeOpacity=".075" strokeWidth=".7" /></pattern>
      {showPhoto && <clipPath id={`${uid}-photo`}><rect {...box} rx={fullBleed ? 0 : 12} /></clipPath>}
    </defs>
    <rect width="500" height="700" fill={`url(#${uid}-paper)`} /><rect width="500" height="700" fill={`url(#${uid}-lines)`} />
    {!fullBleed && <CardOrnament id={id} palette={palette} withPhoto={showPhoto} />}
    {showPhoto && <g clipPath={`url(#${uid}-photo)`}><rect {...box} fill={depth} /><image href={selectedPhoto.url} {...placement} preserveAspectRatio="none" /></g>}
    {showPhoto && !fullBleed && <rect {...box} rx="12" fill="none" stroke={accent} strokeWidth="2" />}
    {fullBleed && <><rect width="500" height="700" fill={`url(#${uid}-shade)`} /><CardOrnament id={id} palette={palette} /></>}
    <CardCopy y={headingY} size={showPhoto ? 47 : 60} height={showPhoto ? 82 : 112} fill={ink} italic={['wedding_vows', 'floral_botanical'].includes(id)}>{headline}</CardCopy>
    <CardCopy y={nameY} size={26} height={48} width={350} fill={ink} italic>{recipient}</CardCopy>
    <CardCopy y={detailY} size={18} height={36} width={344} fill={ink} spacing={1} sans>{detail}</CardCopy>
  </svg>;
}
