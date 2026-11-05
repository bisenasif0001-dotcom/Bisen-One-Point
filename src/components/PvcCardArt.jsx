import React, { useId } from 'react';

const PALETTES = {
  sage: ['#dee5d4', '#2d4a3c', '#879779'], forest: ['#29473c', '#f7f0d8', '#a7b48b'],
  blue: ['#dce6e7', '#2e4c60', '#7c9fa8'], clay: ['#b3785c', '#fff2de', '#e1b18d'],
  sand: ['#ede2c9', '#594a37', '#ac9570'], rose: ['#ecdfd7', '#735244', '#be9c89'],
};

function SampleCode({ x, y, colour, size = 58 }) {
  // An illustrative motif, deliberately not a scannable customer QR code.
  return <g transform={`translate(${x} ${y}) scale(${size / 70})`} fill={colour}>
    {[[0,0],[48,0],[0,48]].map(([a,b]) => <g key={`${a}-${b}`}><rect x={a} y={b} width="22" height="22" rx="2" fill="none" stroke={colour} strokeWidth="3" /><rect x={a+6} y={b+6} width="10" height="10" rx="1" /></g>)}
    {[[30,2],[33,10],[29,23],[43,29],[1,30],[11,36],[24,40],[33,52],[43,60],[53,31],[62,40],[60,56],[54,65],[33,65]].map(([a,b])=><rect key={`${a}-${b}`} x={a} y={b} width="5" height="5" />)}
  </g>;
}

export default function PvcCardArt({ product, orientation, side = 'front', decorative = false }) {
  const uid = useId().replace(/:/g, '');
  const portrait = (orientation || product.orientation) === 'portrait';
  const [bg, ink, accent] = PALETTES[product.colour] || PALETTES.sage;
  const w = portrait ? 260 : 414, h = portrait ? 414 : 260;
  const idCard = ['id','education','visitor','events'].includes(product.art);
  const photo = product.art === 'photo';
  return <svg className="pvc-card-art" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `${product.title}, ${portrait ? 'vertical' : 'horizontal'}, ${side} illustrative sample`}>
    <defs><clipPath id={`pvc-${uid}`}><rect width={w} height={h} rx="15" /></clipPath><linearGradient id={`pvc-light-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".18" /><stop offset=".55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".08" /></linearGradient></defs>
    <g clipPath={`url(#pvc-${uid})`}>
      <rect width={w} height={h} fill={bg} />
      {side === 'back' ? <>
        <rect x="0" y={portrait ? 38 : 30} width={w} height="35" fill={ink} opacity=".9" />
        <text x="24" y={portrait ? 109 : 99} fill={ink} fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="1.5">YOUR DETAILS, THOUGHTFULLY PRINTED.</text>
        {[0,1,2].map(n=><rect key={n} x="24" y={130+n*15} width={n===2?w*.42:w*.7} height="2" fill={ink} opacity=".3" />)}
        <SampleCode x="26" y={portrait ? 220 : 180} colour={ink} size={portrait ? 80 : 53} />
        <text x={portrait ? 24 : 100} y={portrait ? 338 : 204} fill={ink} fontFamily="Georgia,serif" fontSize={portrait ? 20 : 25}>A little more personal.</text>
        <text x="24" y={h-22} fill={ink} opacity=".7" fontFamily="Arial,sans-serif" fontSize="8" letterSpacing="1.8">AL-NOOR / SAMPLE DESIGN</text>
      </> : photo ? <>
        <image href="/hero/wedding-couple.jpg" x="0" y="0" width={w} height={h} preserveAspectRatio="xMidYMid slice" />
        <rect y={h-72} width={w} height="72" fill="#fcf7eb" />
        <text x="23" y={h-39} fontFamily="Georgia,serif" fontSize="25" fill="#4b5747">Always, together.</text>
        <text x="24" y={h-19} fontFamily="Arial,sans-serif" fontSize="8" letterSpacing="2.2" fill="#7b806d">YOUR PHOTO. YOUR LITTLE KEEPSAKE.</text>
      </> : idCard ? <>
        <path d={`M0 0h${w}v${portrait ? 92 : 57}Q${w/2} ${portrait ? 129 : 83} 0 ${portrait ? 92 : 57}Z`} fill={ink} />
        <text x={w/2} y={portrait ? 37 : 30} textAnchor="middle" fill={bg} fontFamily="Arial,sans-serif" fontSize="11" letterSpacing="2.3">{product.art==='education' ? 'THE LEARNING COLLECTIVE' : product.art==='events' ? 'THE CREATIVE GATHERING' : 'YOUR ORGANISATION'}</text>
        {portrait && <text x={w/2} y="62" textAnchor="middle" fill={bg} opacity=".7" fontFamily="Arial,sans-serif" fontSize="7" letterSpacing="2">A SHARED IDENTITY</text>}
        <g transform={`translate(${portrait ? 86 : 27} ${portrait ? 136 : 94})`}><rect width={portrait ? 88 : 83} height={portrait ? 104 : 100} rx="8" fill={accent} opacity=".38" /><circle cx="43" cy="35" r="19" fill={ink} opacity=".65" /><path d="M12 91c0-41 63-41 63 0" fill={ink} opacity=".65" /></g>
        <text x={portrait ? w/2 : 135} y={portrait ? 274 : 121} textAnchor={portrait ? 'middle' : 'start'} fill={ink} fontFamily="Georgia,serif" fontSize={portrait ? 25 : 23}>{product.art==='visitor' ? 'Welcome, guest.' : product.art==='events' ? 'You’re on the list.' : 'Aarav Sharma'}</text>
        <text x={portrait ? w/2 : 135} y={portrait ? 295 : 144} textAnchor={portrait ? 'middle' : 'start'} fill={ink} opacity=".8" fontFamily="Arial,sans-serif" fontSize="8" letterSpacing="1.4">{product.art==='education' ? 'STUDENT / CLASS OF 2026' : product.art==='visitor' ? 'VISITOR / 001' : product.art==='events' ? 'ALL ACCESS / SAMPLE PASS' : 'DESIGN TEAM / ALN-001'}</text>
        {[0,1,2].map(n=><rect key={n} x={portrait ? 63 : 135} y={(portrait ? 319 : 164)+n*11} height="2" width={n===2?81:132} fill={ink} opacity=".2" />)}
        <rect x="20" y={h-39} width={w-40} height="1" fill={ink} opacity=".2" />
        <text x={w/2} y={h-20} textAnchor="middle" fill={ink} opacity=".7" fontFamily="Arial,sans-serif" fontSize="7" letterSpacing="2">AL-NOOR / SAMPLE DESIGN</text>
      </> : <>
        <circle cx={w-27} cy={h/2} r={portrait ? 147 : 158} fill="none" stroke={accent} strokeWidth="1" opacity=".65" /><circle cx={w-27} cy={h/2} r={portrait ? 117 : 126} fill="none" stroke={accent} strokeWidth="1" opacity=".5" />
        <text x="27" y="37" fontFamily="Arial,sans-serif" fill={ink} fontSize="10" letterSpacing="2">{product.art==='business' || product.art==='qr' ? 'YOUR BRAND / CREATIVE STUDIO' : 'THE MEMBERS COLLECTIVE'}</text>
        <text x="27" y={portrait ? 163 : 115} fontFamily="Georgia,serif" fill={ink} fontSize={portrait ? 36 : 40}>{product.art==='business' || product.art==='qr' ? 'Make your' : product.art==='loyalty' ? 'A little thank you.' : 'You belong'}</text>
        <text x="27" y={portrait ? 207 : 159} fontFamily="Georgia,serif" fontStyle="italic" fill={ink} fontSize={portrait ? 39 : 43}>{product.art==='business' || product.art==='qr' ? 'introduction.' : product.art==='loyalty' ? 'For coming back.' : 'here.'}</text>
        {product.art==='qr' && <SampleCode x={w-82} y={h-83} colour={ink} size={55} />}
        <rect x="27" y={h-60} width={product.art==='qr'?w-129:w-54} height="1" fill={ink} opacity=".3" />
        <text x="27" y={h-33} fontFamily="Arial,sans-serif" fill={ink} fontSize="8" letterSpacing="1.6">{product.art==='business' || product.art==='qr' ? 'YOUR NAME · YOUR DETAILS' : 'MEMBERSHIP / 001'}</text>
        <text x="27" y={h-18} fontFamily="Arial,sans-serif" fill={ink} opacity=".6" fontSize="6" letterSpacing="1.6">AL-NOOR / SAMPLE DESIGN</text>
      </>}
      <rect width={w} height={h} fill={`url(#pvc-light-${uid})`} />
      <rect x=".6" y=".6" width={w-1.2} height={h-1.2} rx="14" fill="none" stroke={ink} strokeOpacity=".15" />
    </g>
  </svg>;
}
